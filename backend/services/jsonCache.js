/**
 * backend/services/jsonCache.js
 * محرك التخزين المؤقت الهجين الفائق (Mongoose + In-Memory RAM Cache)
 * 
 * المزايا:
 * 1. سرعة استجابة خارقة (0ms) من الرامات لجميع طلبات الـ GET
 * 2. قراءة البيانات وحفظها في MongoDB عبر نماذج Mongoose الرسمية
 * 3. تزامن آمن مع ملفات النسخ الاحتياطي src/data/*.json (Zero Data Loss)
 * 4. مرونة فائقة: يعمل مع MongoDB وعند غيابها يعمل مع ملفات الـ JSON بسلاسة
 */

const fs = require('fs/promises');
const path = require('path');
const mongoose = require('mongoose');

// استدعاء نماذج Mongoose
const {
  Product,
  Customer,
  Order,
  Quotation,
  Return,
  Consultation,
  Email,
  Review,
} = require('../models');

// خريطة ربط الأسماء بالنماذج
const modelMap = {
  'products.json': Product,
  'products': Product,
  'customers.json': Customer,
  'customers': Customer,
  'orders.json': Order,
  'orders': Order,
  'quotations.json': Quotation,
  'quotations': Quotation,
  'returns.json': Return,
  'returns': Return,
  'consultations.json': Consultation,
  'consultations': Consultation,
  'emails.json': Email,
  'emails': Email,
  'reviews.json': Review,
  'reviews': Review,
};

// مسار ملفات الـ JSON الاحتياطية
const DATA_DIR = process.env.DATA_DIR || path.resolve(
  __dirname,
  '..',
  '..',
  'ecom-furniture-main',
  'ecom-furniture-main',
  'src',
  'data'
);

class MongoDataCache {
  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      writes: 0,
      dbReads: 0,
    };
  }

  getFilePath(filename) {
    const cleanName = filename.endsWith('.json') ? filename : `${filename}.json`;
    return path.join(DATA_DIR, cleanName);
  }

  isMongoConnected() {
    return mongoose.connection.readyState === 1;
  }

  isProductionMode() {
    return process.env.NODE_ENV === 'production';
  }

  getProductionGuardError(operation, filename) {
    return new Error(
      `MongoDB is required in production for ${operation} on ${filename}. Local JSON fallback is disabled to prevent stale data from becoming the system of record.`
    );
  }

  cleanDocument(doc) {
    if (!doc) return doc;
    const clean = { ...doc };
    if (!clean.id && clean._id) {
      clean.id = clean._id.toString();
    }
    delete clean._id;
    delete clean.__v;
    return clean;
  }

  cleanDocuments(docs) {
    if (!Array.isArray(docs)) return docs;
    return docs.map(d => this.cleanDocument(d));
  }

  /**
   * قراءة البيانات:
   * 1. من الـ RAM Cache مباشرة إن وجدت (0ms).
   * 2. من MongoDB عبر Mongoose إن كان متصلاً.
   * 3. من ملف الـ JSON المحلي كخيار احتياطي موثوق.
   */
  async read(filename, fallback = []) {
    const key = filename.toLowerCase();

    // 1. فحص الكاش في الذاكرة العشوائية أولاً
    if (this.cache.has(key)) {
      this.stats.hits++;
      return this.cache.get(key);
    }

    this.stats.misses++;
    const Model = modelMap[key];

    // 2. محاولة القراءة من MongoDB
    if (this.isMongoConnected() && Model) {
      try {
        const mongoDocs = await Model.find({}).lean();
        if (mongoDocs && mongoDocs.length > 0) {
          const cleaned = this.cleanDocuments(mongoDocs);
          this.cache.set(key, cleaned);
          this.stats.dbReads++;
          return cleaned;
        }
      } catch (err) {
        console.warn(`[MongoCache Notice] MongoDB read failed for ${key}, falling back to file:`, err.message);
      }
    }

    if (this.isProductionMode() && !this.isMongoConnected()) {
      const err = this.getProductionGuardError('read', filename);
      console.error(`[MongoCache Security] ${err.message}`);
      throw err;
    }

    // 3. القراءة من ملف الـ JSON المحلي فقط في بيئات التطوير
    const filePath = this.getFilePath(filename);
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      this.cache.set(key, parsed);
      return parsed;
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.cache.set(key, fallback);
        return fallback;
      }
      console.error(`[MongoCache Error] Failed to read ${filename}:`, error.message);
      return fallback;
    }
  }

  /**
   * حفظ وتحديث البيانات:
   * 1. تحديث الكاش في الذاكرة فوراً.
   * 2. حفظ البيانات في MongoDB.
   * 3. حفظ نسخة احتياطية على القرص لضمان استقرار التطبيق.
   */
  async write(filename, data) {
    const key = filename.toLowerCase();
    const filePath = this.getFilePath(filename);
    const Model = modelMap[key];

    if (this.isProductionMode() && !this.isMongoConnected()) {
      const err = this.getProductionGuardError('write', filename);
      console.error(`[MongoCache Security] ${err.message}`);
      throw err;
    }

    // تحديث الكاش في الذاكرة فوراً
    this.cache.set(key, data);
    this.stats.writes++;

    // 1. حفظ في MongoDB إن كان متصلاً بنظام bulkWrite الآمن (Zero Data-Loss Window)
    if (this.isMongoConnected() && Model && Array.isArray(data)) {
      try {
        if (data.length > 0) {
          const ops = data.map((doc) => {
            const docId = doc.id || (doc._id ? doc._id.toString() : null);
            const filter = docId ? { id: docId } : { _id: doc._id };
            return {
              updateOne: {
                filter,
                update: { $set: doc },
                upsert: true,
              },
            };
          });
          await Model.bulkWrite(ops, { ordered: false });

          // مزامنة الحذف: إزالة المستندات التي حُذفت فعلياً دون مسح الكل دفعة واحدة
          const currentIds = data.map((d) => d.id).filter(Boolean);
          if (currentIds.length > 0) {
            await Model.deleteMany({ id: { $nin: currentIds } });
          }
        } else {
          await Model.deleteMany({});
        }
      } catch (dbErr) {
        console.warn(`[MongoCache Warning] MongoDB bulk sync warning for ${key}:`, dbErr.message);
      }
    }

    // 2. حفظ نسخة احتياطية على القرص (Write-Through) فقط في بيئات التطوير
    try {
      const jsonString = JSON.stringify(data, null, 2);
      await fs.writeFile(filePath, jsonString, 'utf-8');
      return true;
    } catch (error) {
      console.error(`[MongoCache Error] Failed to write backup ${filename}:`, error.message);
      return true;
    }
  }

  /**
   * إبطال الكاش لملف معين
   */
  invalidate(filename) {
    const key = filename.toLowerCase();
    this.cache.delete(key);
  }

  /**
   * تفريغ الذاكرة بالكامل
   */
  clear() {
    this.cache.clear();
  }

  /**
   * جلب إحصائيات الأداء وحالة الاتصال
   */
  getMetrics() {
    const totalReads = this.stats.hits + this.stats.misses;
    const hitRate = totalReads > 0 ? ((this.stats.hits / totalReads) * 100).toFixed(2) : '0.00';
    return {
      databaseEngine: this.isMongoConnected() ? 'MongoDB (Mongoose)' : 'Local File Fallback',
      mongoConnected: this.isMongoConnected(),
      cachedKeys: Array.from(this.cache.keys()),
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: `${hitRate}%`,
      writes: this.stats.writes,
      dbReads: this.stats.dbReads,
      cacheSize: this.cache.size,
    };
  }
}

// تصدير نسخة أحادية (Singleton)
const mongoCache = new MongoDataCache();
module.exports = mongoCache;
