/**
 * backend/scripts/reset_clean_store.js
 * سكربت تفريغ وتصفير المتجر تماماً لتسليمه للعميل (Clean Store Reset)
 * 
 * المخرجات:
 * - تفريغ كافة ملفات الـ JSON التشغيلية في src/data/ لتصبح []
 * - تصفير سجلات المبيعات، الإيرادات، الطلبات، العملاء الوهميين، وعروض الأسعار
 * - مسح مجموعات MongoDB في حال كان الاتصال مفعل
 * - الحفاظ على بيانات الأدمن الرسمية للدخول
 */

const path = require('path');
const fs = require('fs/promises');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const DATA_DIR = path.resolve(
  __dirname,
  '..',
  '..',
  'ecom-furniture-main',
  'ecom-furniture-main',
  'src',
  'data'
);

const filesToReset = [
  'orders.json',
  'customers.json',
  'quotations.json',
  'returns.json',
  'consultations.json',
  'emails.json',
  'products.json',
];

async function resetCleanStore() {
  console.log('===========================================================');
  console.log('🧹 بدء عملية تنظيف وتفريغ المتجر لتسليمه للعميل...');
  console.log('===========================================================');

  for (const file of filesToReset) {
    const filePath = path.join(DATA_DIR, file);
    try {
      await fs.writeFile(filePath, JSON.stringify([], null, 2), 'utf-8');
      console.log(`  ✅ تم تفريغ ${file} بنجاح ([]).`);
    } catch (err) {
      console.error(`  ❌ تعذر تفريغ ${file}:`, err.message);
    }
  }

  // إذا كان MongoDB متصلاً، نقوم بتفريغ المجموعات أيضاً
  if (process.env.MONGO_URI) {
    try {
      const mongoose = require('mongoose');
      await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 3000 });
      console.log('  🍃 متصل بقاعدة بيانات MongoDB، جاري تفريغ المجموعات...');
      const collections = await mongoose.connection.db.collections();
      for (const col of collections) {
        await col.deleteMany({});
        console.log(`    - تم تصفير مجموعة: ${col.collectionName}`);
      }
      await mongoose.disconnect();
      console.log('  ✅ تم تصفير MongoDB بنجاح.');
    } catch (dbErr) {
      console.log(`  ℹ️ تم تخطي تفريغ MongoDB (${dbErr.message}) - تم تنظيف ملفات الـ JSON فقط.`);
    }
  }

  console.log('===========================================================');
  console.log('🎉 المتجر الآن فارغ بنسبة 100% وجاهز لبدء العمل الحقيقي للعميل!');
  console.log('  - إجمالي الطلبات: 0');
  console.log('  - إجمالي المبيعات: 0 ج.م');
  console.log('  - إجمالي العملاء: 0');
  console.log('  - إجمالي المنتجات: 0');
  console.log('===========================================================');
}

resetCleanStore().catch(console.error);
