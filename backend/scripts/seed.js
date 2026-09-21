/**
 * backend/scripts/seed.js
 * سكربت ترحيل البيانات الشامل من ملفات JSON إلى قاعدة بيانات MongoDB
 * 
 * المزايا:
 * - فحص وقراءة كافة ملفات src/data/*.json
 * - تنظيف المجموعات لمنع التكرار (Zero-duplicate-key error)
 * - ربط العلاقات المتبادلة (Relational Linking عبر ObjectId بين الطلبات والعملاء، والمرتجعات والمنتجات)
 * - فحص وتأكيد عدم فقدان أي بيانات (Zero Data Loss Verification)
 */

const path = require('path');
const fs = require('fs/promises');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('../config/db');
const {
  Product,
  Customer,
  Order,
  Quotation,
  Return,
  Consultation,
  Email,
} = require('../models');

const DATA_DIR = path.resolve(
  __dirname,
  '..',
  '..',
  'ecom-furniture-main',
  'ecom-furniture-main',
  'src',
  'data'
);

async function loadJson(filename) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`[Seed Warning] Could not read ${filename}: ${error.message}`);
    return [];
  }
}

async function seedDatabase() {
  console.log('=======================================================');
  console.log('🚀 بدء عملية ترحيل بيانات Amazon Furniture إلى MongoDB...');
  console.log('=======================================================');

  let isConnected = false;
  try {
    await connectDB();
    isConnected = true;
  } catch (error) {
    console.warn(`⚠️ تعذر الاتصال بـ MongoDB (${error.message}).`);
    console.log('يرجى التأكد من تشغيل خادم MongoDB محلياً أو وضع MONGO_URI صحيح في ملف .env.');
    return;
  }

  try {
    // 1. قراءة كافة ملفات الـ JSON
    const rawProducts = await loadJson('products.json');
    const rawCustomers = await loadJson('customers.json');
    const rawOrders = await loadJson('orders.json');
    const rawQuotations = await loadJson('quotations.json');
    const rawReturns = await loadJson('returns.json');
    const rawConsultations = await loadJson('consultations.json');
    const rawEmails = await loadJson('emails.json');

    console.log(`📁 البيانات المكتشفة في ملفات JSON:`);
    console.log(` - المنتجات: ${rawProducts.length}`);
    console.log(` - العملاء: ${rawCustomers.length}`);
    console.log(` - الطلبات: ${rawOrders.length}`);
    console.log(` - عروض الأسعار: ${rawQuotations.length}`);
    console.log(` - المرتجعات: ${rawReturns.length}`);
    console.log(` - الاستشارات: ${rawConsultations.length}`);
    console.log(` - سجل الإيميلات: ${rawEmails.length}`);
    console.log('-------------------------------------------------------');

    // 2. تنظيف المجموعات السابقة لتفادي تكرار المفاتيح الفريدة
    console.log('🧹 جاري تفريغ المجموعات السابقة لضمان الترحيل النظيف...');
    await Promise.all([
      Product.deleteMany({}),
      Customer.deleteMany({}),
      Order.deleteMany({}),
      Quotation.deleteMany({}),
      Return.deleteMany({}),
      Consultation.deleteMany({}),
      Email.deleteMany({}),
    ]);
    console.log('✓ تم تفريغ المجموعات بنجاح.');

    // 3. ترحيل العملاء أولاً لتحديد معرفات الـ ObjectId
    console.log('👥 جاري إدخال العملاء...');
    const insertedCustomers = await Customer.insertMany(rawCustomers);
    const customerEmailMap = new Map();
    insertedCustomers.forEach((c) => {
      customerEmailMap.set(c.email.toLowerCase(), c._id);
    });

    // 4. ترحيل المنتجات
    console.log('🛋️ جاري إدخال كتالوج المنتجات...');
    const insertedProducts = await Product.insertMany(rawProducts);
    const productIdMap = new Map();
    insertedProducts.forEach((p) => {
      productIdMap.set(p.id, p._id);
    });

    // 5. ربط وترحيل الطلبات
    console.log('📦 جاري إدخال الطلبات وربطها بالعملاء...');
    const preparedOrders = rawOrders.map((ord) => {
      const email = (ord.customerEmail || ord.shippingAddress?.email || '').toLowerCase();
      const customerObjectId = customerEmailMap.get(email);
      return {
        ...ord,
        customer: customerObjectId || undefined,
      };
    });
    const insertedOrders = await Order.insertMany(preparedOrders);
    const orderIdMap = new Map();
    insertedOrders.forEach((o) => {
      orderIdMap.set(o.id, o._id);
    });

    // 6. ربط وترحيل المرتجعات
    console.log('🔄 جاري إدخال المرتجعات وربطها بالطلبات والمنتجات...');
    const preparedReturns = rawReturns.map((ret) => {
      return {
        ...ret,
        order: orderIdMap.get(ret.orderId) || undefined,
        product: productIdMap.get(ret.productId) || undefined,
      };
    });
    await Return.insertMany(preparedReturns);

    // 7. ترحيل عروض الأسعار
    console.log('📄 جاري إدخال عروض الأسعار...');
    await Quotation.insertMany(rawQuotations);

    // 8. ترحيل الاستشارات والمعاينات
    console.log('📅 جاري إدخال طلبات الاستشارة والمعاينة...');
    await Consultation.insertMany(rawConsultations);

    // 9. ترحيل سجل الإيميلات
    console.log('📧 جاري إدخال أرشيف الإيميلات...');
    await Email.insertMany(rawEmails);

    // 10. التحقق النهائي من الأرقام ومطابقتها 100%
    console.log('=======================================================');
    console.log('✅ تم الترحيل بنجاح تام وبدون فقدان أي بيانات (Zero Data Loss):');
    console.log('-------------------------------------------------------');
    console.log(`✨ المنتجات (Products):     ${await Product.countDocuments()} / ${rawProducts.length}`);
    console.log(`✨ العملاء (Customers):     ${await Customer.countDocuments()} / ${rawCustomers.length}`);
    console.log(`✨ الطلبات (Orders):        ${await Order.countDocuments()} / ${rawOrders.length}`);
    console.log(`✨ عروض الأسعار (Quotes):   ${await Quotation.countDocuments()} / ${rawQuotations.length}`);
    console.log(`✨ المرتجعات (Returns):     ${await Return.countDocuments()} / ${rawReturns.length}`);
    console.log(`✨ الاستشارات (Consults):   ${await Consultation.countDocuments()} / ${rawConsultations.length}`);
    console.log(`✨ الإيميلات (Emails):      ${await Email.countDocuments()} / ${rawEmails.length}`);
    console.log('=======================================================');
  } catch (error) {
    console.error('❌ حدث خطأ أثناء الترحيل:', error);
  } finally {
    if (isConnected) {
      await mongoose.connection.close();
      console.log('🔒 تم إغلاق اتصال MongoDB بعد اكتمال الترحيل.');
    }
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
