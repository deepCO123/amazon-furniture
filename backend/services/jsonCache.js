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
  CustomOrder,
  Coupon,
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
  'coupons.json': Coupon,
  'coupons': Coupon,
  'custom_orders.json': CustomOrder,
  'custom_orders': CustomOrder,
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

  isTestMode() {
    return process.env.NODE_ENV === 'test' || Boolean(process.env.JEST_WORKER_ID);
  }

  getProductionGuardError(operation, filename) {
    return new Error(
      `MongoDB is required in production for ${operation} on ${filename}. Local JSON fallback is disabled to prevent stale data from becoming the system of record.`
    );
  }

  /**
   * تحديد فلتر المعرف الثابت والآمن وفقاً للمخطط لكل نموذج
   */
  getDocFilter(key, doc) {
    if (!doc) return null;
    const normalizedKey = key.toLowerCase();

    // الكوبونات معرّفة بشكل أساسي وفريد برمز الكود (code)
    if (normalizedKey.includes('coupon')) {
      const code = doc.code ? String(doc.code).trim().toUpperCase() : null;
      if (code) return { code };
      if (doc.id) return { $or: [{ id: doc.id }, { code: String(doc.id).trim().toUpperCase() }] };
    }

    const docId = doc.id || (doc._id ? doc._id.toString() : null);
    if (docId) {
      return { id: docId };
    }
    if (doc._id) {
      return { _id: doc._id };
    }
    return null;
  }

  cleanDocument(doc) {
    if (!doc) return doc;
    const clean = { ...doc };
    if (!clean.id && clean._id) {
      clean.id = clean._id.toString();
    }
    delete clean._id;
    delete clean.__v;
    // ملاحظة أمنية: لا يتم حذف passwordHash هنا لتمكين التوثيق الداخلي
    // تنظيف البيانات الحساسة يتم فقط في طبقة الاستجابة للعميل في الراوترات
    return clean;
  }

  cleanDocuments(docs) {
    if (!Array.isArray(docs)) return docs;
    return docs.map((d) => this.cleanDocument(d));
  }

  /**
   * قراءة البيانات:
   * 1. من الـ RAM Cache مباشرة إن وجدت (0ms).
   * 2. من MongoDB عبر Mongoose كمصدر رسمي وموثوق (Authoritative Source of Truth).
   *    - المصفوفة الفارغة [] تعتبر حالة صحيحة ومؤكدة من قاعدة البيانات.
   *    - في بيئة الإنتاج: أي خطأ في الاتصال أو الاستعلام يتم رميه مباشرة دون الارتداد للـ JSON.
   * 3. من ملف الـ JSON المحلي كخيار احتياطي للتطوير المحلي فقط عند عدم الاتصال بقاعدة البيانات.
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

    // 2. محاولة القراءة من MongoDB (المصدر المعتمد)
    if (this.isMongoConnected() && Model) {
      try {
        const mongoDocs = await Model.find({}).lean();
        // نجاح الاستعلام: حتى لو كانت المجموعة فارغة []، هذه حالة رسمية وصحيحة
        const cleaned = this.cleanDocuments(mongoDocs || []);
        this.cache.set(key, cleaned);
        this.stats.dbReads++;
        return cleaned;
      } catch (err) {
        console.error(`[MongoCache Error] MongoDB query failed for ${key}:`, err.message);
        if (this.isProductionMode()) {
          throw new Error(
            `[Database Read Failure] Failed to read ${filename} from MongoDB in production: ${err.message}`
          );
        }
      }
    }

    // 3. في بيئة الإنتاج: منع تام للارتداد الصامت لملفات الـ JSON عند انقطاع الاتصال أو فشل الاستعلام
    if (this.isProductionMode()) {
      const err = this.getProductionGuardError('read', filename);
      console.error(`[MongoCache Security] ${err.message}`);
      throw err;
    }

    // 4. القراءة من ملف الـ JSON المحلي فقط في بيئات التطوير
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
   * 1. الحفظ في MongoDB أولاً والتأكد من نجاحه.
   *    - عدم الحذف التلقائي العشوائي للمستندات الأخرى غير المرفقة في المصفوفة (حماية كاملة من فقد البيانات).
   * 2. تحديث الكاش في الذاكرة RAM فقط بعد نجاح العملية في MongoDB.
   * 3. في بيئة الإنتاج: عدم الكتابة على القرص المحلي لمنع الكتابة في ملفات السورس.
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

    // 1. حفظ في MongoDB أولاً إن كان متصلاً بنظام bulkWrite التراكمي الآمن
    if (this.isMongoConnected() && Model && Array.isArray(data)) {
      if (data.length > 0) {
        const ops = [];
        for (const doc of data) {
          const filter = this.getDocFilter(key, doc);
          if (filter) {
            ops.push({
              updateOne: {
                filter,
                update: { $set: doc },
                upsert: true,
              },
            });
          }
        }

        if (ops.length > 0) {
          try {
            await Model.bulkWrite(ops, { ordered: false });
          } catch (dbErr) {
            console.error(`[MongoCache Error] MongoDB bulkWrite failed for ${key}:`, dbErr.message);
            // لا نبتلع الخطأ أبداً! نرميه للميدلوير ليتم التعامل معه وعدم إيهام العميل بنجاح وهمي
            throw new Error(`[Database Write Failure] MongoDB write failed for ${filename}: ${dbErr.message}`);
          }
        }
      }
      // حماية صارمة من الحذف التلقائي:
      // لن يتم استدعاء Model.deleteMany() هنا إطلاقاً لمنع محو السجلات السابقة عند إرسال مصفوفة جزئية.
    }

    // 2. تحديث الكاش في الذاكرة فقط بعد نجاح الحفظ الفعلي في قاعدة البيانات
    this.cache.set(key, data);
    this.stats.writes++;

    // 3. حفظ نسخة احتياطية على القرص (Write-Through) فقط في بيئات التطوير غير الاختبارية
    if (!this.isProductionMode() && !this.isTestMode()) {
      try {
        const jsonString = JSON.stringify(data, null, 2);
        await fs.writeFile(filePath, jsonString, 'utf-8');
      } catch (error) {
        console.warn(`[MongoCache Dev Notice] Failed to write local backup ${filename}:`, error.message);
      }
    }

    return true;
  }

  /**
   * حذف مستند محدد وموجه بدقة دون التأثير على بقية المستندات
   * @param {string} filename اسم الملف أو النموذج
   * @param {string|object} identifier المعرف (id أو code أو كائن فلتر)
   */
  async deleteItem(filename, identifier) {
    const key = filename.toLowerCase();
    const Model = modelMap[key];

    if (this.isProductionMode() && !this.isMongoConnected()) {
      const err = this.getProductionGuardError('delete', filename);
      console.error(`[MongoCache Security] ${err.message}`);
      throw err;
    }

    let filter = null;
    if (typeof identifier === 'object' && identifier !== null) {
      filter = identifier;
    } else if (key.includes('coupon')) {
      const normCode = String(identifier).trim().toUpperCase();
      filter = { $or: [{ code: normCode }, { id: identifier }] };
    } else {
      filter = { id: String(identifier) };
    }

    // 1. الحذف من MongoDB أولاً
    if (this.isMongoConnected() && Model) {
      try {
        await Model.deleteOne(filter);
      } catch (dbErr) {
        console.error(`[MongoCache Error] Failed to delete document in ${key}:`, dbErr.message);
        throw new Error(`[Database Delete Failure] Failed to delete in ${filename}: ${dbErr.message}`);
      }
    }

    // 2. التحديث في كاش الرامات
    if (this.cache.has(key)) {
      const current = this.cache.get(key);
      if (Array.isArray(current)) {
        let updated;
        if (key.includes('coupon')) {
          const norm = String(identifier).trim().toUpperCase();
          updated = current.filter((c) => c.code !== norm && c.id !== identifier);
        } else {
          const idStr = String(identifier);
          updated = current.filter((d) => String(d.id) !== idStr);
        }
        this.cache.set(key, updated);
      }
    }

    // 3. تحديث ملف التطوير المحلي إن وُجد (تخطي في بيئات الاختبار)
    if (!this.isProductionMode() && !this.isTestMode() && this.cache.has(key)) {
      try {
        const filePath = this.getFilePath(filename);
        await fs.writeFile(filePath, JSON.stringify(this.cache.get(key), null, 2), 'utf-8');
      } catch (fileErr) {
        // تجاهل أخطاء ملف التطوير المحلي
      }
    }

    return true;
  }

  /**
   * إبطال الكاش لملف معين لإعادة التحميل عند الحاجة
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
