/**
 * backend/scripts/seed_analytics_sample.js
 * تزويد المتجر ببيانات تجريبية واقعية للطلبات والمرتجعات
 * لاختبار محرك ذكاء المرتجعات (Returns Intelligence)
 */

const path = require('path');
const fs = require('fs/promises');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const jsonCache = require('../services/jsonCache');

const DATA_DIR = path.resolve(
  __dirname,
  '..',
  '..',
  'ecom-furniture-main',
  'ecom-furniture-main',
  'src',
  'data'
);

async function seedAnalyticsData() {
  console.log('🔄 إعداد بيانات الطلبات والمرتجعات لاختبار Returns Intelligence...');

  const products = await jsonCache.read('products.json', []);
  if (products.length === 0) {
    console.error('No products found');
    return;
  }

  // 1. توليد طلبات واقعية
  const sampleOrders = [
    {
      id: 'ORD-2026-101',
      customerName: 'محمود السيد عبد الله',
      customerEmail: 'mahmoud.sayed@gmail.com',
      customerPhone: '01011223344',
      status: 'delivered',
      total: 30000,
      date: '2026-09-01T10:00:00.000Z',
      items: [
        { product: { id: '1', name: products.find(p => p.id === '1')?.name || 'كرسي مكتب شبك طبي', price: 3850 }, quantity: 10 },
        { product: { id: 'AF-2', name: products.find(p => p.id === 'AF-2')?.name || 'كرسي جيمينج احترافي برو', price: 5400 }, quantity: 5 }
      ]
    },
    {
      id: 'ORD-2026-102',
      customerName: 'نادية إبراهيم حسن',
      customerEmail: 'nadia.ibrahim@yahoo.com',
      customerPhone: '01122334455',
      status: 'delivered',
      total: 58500,
      date: '2026-09-05T12:30:00.000Z',
      items: [
        { product: { id: 'AF-3', name: products.find(p => p.id === 'AF-3')?.name || 'مكتب مديرين خشب ميلامين', price: 8900 }, quantity: 4 },
        { product: { id: '1', name: products.find(p => p.id === '1')?.name || 'كرسي مكتب شبك طبي', price: 3850 }, quantity: 6 }
      ]
    },
    {
      id: 'ORD-2026-103',
      customerName: 'طارق عبد العزيز',
      customerEmail: 'tarek.aziz@hotmail.com',
      customerPhone: '01233445566',
      status: 'delivered',
      total: 42000,
      date: '2026-09-08T14:15:00.000Z',
      items: [
        { product: { id: 'AF-prod_1789845837392', name: products.find(p => p.id === 'AF-prod_1789845837392')?.name || 'ترابيزة قهوة ومكتبة عصرية', price: 2500 }, quantity: 12 },
        { product: { id: 'prod_1790013537451', name: 'كرسي مكتب طبي شبك مريح', price: 7500 }, quantity: 8 }
      ]
    },
    {
      id: 'ORD-2026-104',
      customerName: 'سارة مصطفى كمال',
      customerEmail: 'sara.kamal@gmail.com',
      customerPhone: '01544556677',
      status: 'delivered',
      total: 96000,
      date: '2026-09-10T16:45:00.000Z',
      items: [
        { product: { id: 'prod_kitchen_island_01', name: 'مطبخ أكريليك مودرن مع جزيرة وسطية', price: 78000 }, quantity: 2 },
        { product: { id: 'prod_garden_swing_02', name: 'أرجوحة حديقة خارجية', price: 16000 }, quantity: 4 }
      ]
    },
    {
      id: 'ORD-2026-105',
      customerName: 'عمر خالد الشريف',
      customerEmail: 'omar.sharif@outlook.com',
      customerPhone: '01066778899',
      status: 'delivered',
      total: 45000,
      date: '2026-09-12T11:20:00.000Z',
      items: [
        { product: { id: 'AF-1', name: 'كرسي مكتب شبك طبي هيدروليك إرجونوميك', price: 3850 }, quantity: 15 },
        { product: { id: 'AF-prod_1789668044779', name: 'كرسي المدير', price: 4500 }, quantity: 5 }
      ]
    }
  ];

  // 2. توليد مرتجعات بأسباب واقعية تشمل منتجات عالية الخطورة
  const sampleReturns = [
    // كرسي 1: تم بيع 31 قطعة، تم إرجاع 6 قطع -> معدل إرجاع 19.35% (High Risk)
    {
      id: 'RET-001',
      orderId: 'ORD-2026-101',
      customerName: 'محمود السيد عبد الله',
      productId: '1',
      productName: 'كرسي مكتب شبك طبي هيدروليك إرجونوميك',
      price: 3850,
      refundAmount: 3850,
      reason: 'defect',
      reasonDetails: 'عطل في بستم الهيدروليك بعد يومين من الاستخدام.',
      status: 'refunded',
      createdAt: '2026-09-03T11:00:00.000Z'
    },
    {
      id: 'RET-002',
      orderId: 'ORD-2026-101',
      customerName: 'محمود السيد عبد الله',
      productId: '1',
      productName: 'كرسي مكتب شبك طبي هيدروليك إرجونوميك',
      price: 3850,
      refundAmount: 3850,
      reason: 'defect',
      reasonDetails: 'كسر في عجلات القاعدة الخماسية أثناء الحركة.',
      status: 'refunded',
      createdAt: '2026-09-04T12:00:00.000Z'
    },
    {
      id: 'RET-003',
      orderId: 'ORD-2026-102',
      customerName: 'نادية إبراهيم حسن',
      productId: '1',
      productName: 'كرسي مكتب شبك طبي هيدروليك إرجونوميك',
      price: 3850,
      refundAmount: 3850,
      reason: 'size_mismatch',
      reasonDetails: 'عرض المقعد ضيق وغير مريح لطول القامة.',
      status: 'approved',
      createdAt: '2026-09-07T14:30:00.000Z'
    },
    {
      id: 'RET-004',
      orderId: 'ORD-2026-105',
      customerName: 'عمر خالد الشريف',
      productId: '1',
      productName: 'كرسي مكتب شبك طبي هيدروليك إرجونوميك',
      price: 3850,
      refundAmount: 3850,
      reason: 'shipping_damage',
      reasonDetails: 'تمزق في شبك الظهر أثناء تنزيل الشحنة.',
      status: 'outlet_restocked',
      createdAt: '2026-09-14T10:15:00.000Z'
    },
    {
      id: 'RET-005',
      orderId: 'ORD-2026-105',
      customerName: 'عمر خالد الشريف',
      productId: '1',
      productName: 'كرسي مكتب شبك طبي هيدروليك إرجونوميك',
      price: 3850,
      refundAmount: 3850,
      reason: 'defect',
      reasonDetails: 'مسند الرأس غير ثابت ويفلت عند الإمالة.',
      status: 'refunded',
      createdAt: '2026-09-15T16:00:00.000Z'
    },
    {
      id: 'RET-006',
      orderId: 'ORD-2026-105',
      customerName: 'عمر خالد الشريف',
      productId: '1',
      productName: 'كرسي مكتب شبك طبي هيدروليك إرجونوميك',
      price: 3850,
      refundAmount: 3850,
      reason: 'quality_issue',
      reasonDetails: 'خامة الشبك تسبب تعرقاً وغير مطابقة للمواصفات.',
      status: 'completed',
      createdAt: '2026-09-16T11:45:00.000Z'
    },

    // ترابيزة قهوة ومكتبة عصرية AF-prod_1789845837392: بيع 12، إرجاع 3 -> 25% (Critical Risk)
    {
      id: 'RET-007',
      orderId: 'ORD-2026-103',
      customerName: 'طارق عبد العزيز',
      productId: 'AF-prod_1789845837392',
      productName: 'ترابيزة قهوة ومكتبة عصرية متعددة الاستخدامات خشب زان',
      price: 2500,
      refundAmount: 2500,
      reason: 'shipping_damage',
      reasonDetails: 'كسر في أحد أركان القرصة الخشبية.',
      status: 'refunded',
      createdAt: '2026-09-10T15:20:00.000Z'
    },
    {
      id: 'RET-008',
      orderId: 'ORD-2026-103',
      customerName: 'طارق عبد العزيز',
      productId: 'AF-prod_1789845837392',
      productName: 'ترابيزة قهوة ومكتبة عصرية متعددة الاستخدامات خشب زان',
      price: 2500,
      refundAmount: 2500,
      reason: 'defect',
      reasonDetails: 'ثقوب المسامير غير متطابقة أثناء التجميع المنزلي.',
      status: 'refunded',
      createdAt: '2026-09-11T13:10:00.000Z'
    },
    {
      id: 'RET-009',
      orderId: 'ORD-2026-103',
      customerName: 'طارق عبد العزيز',
      productId: 'AF-prod_1789845837392',
      productName: 'ترابيزة قهوة ومكتبة عصرية متعددة الاستخدامات خشب زان',
      price: 2500,
      refundAmount: 2500,
      reason: 'not_as_described',
      reasonDetails: 'درجة لون الخشب أغمق بكثير من المعروضة في المتجر.',
      status: 'approved',
      createdAt: '2026-09-12T17:00:00.000Z'
    },

    // كرسي جيمينج AF-2: بيع 5، إرجاع 1 -> 20% (High Risk)
    {
      id: 'RET-010',
      orderId: 'ORD-2026-101',
      customerName: 'محمود السيد عبد الله',
      productId: 'AF-2',
      productName: 'كرسي جيمينج احترافي برو شاسيه حديد مع وسائد',
      price: 5400,
      refundAmount: 5400,
      reason: 'defect',
      reasonDetails: 'صوت صرير حاد في الميكانيزم عند التأرجح.',
      status: 'refunded',
      createdAt: '2026-09-06T18:00:00.000Z'
    },

    // أرجوحة حديقة prod_garden_swing_02: بيع 4، إرجاع 1 -> 25% (Critical Risk)
    {
      id: 'RET-011',
      orderId: 'ORD-2026-104',
      customerName: 'سارة مصطفى كمال',
      productId: 'prod_garden_swing_02',
      productName: 'أرجوحة حديقة خارجية خشب زان أحمر',
      price: 16000,
      refundAmount: 16000,
      reason: 'size_mismatch',
      reasonDetails: 'حجم الأرجوحة كبير جداً ولم تتسع في شرفة الحديقة.',
      status: 'approved',
      createdAt: '2026-09-13T12:00:00.000Z'
    }
  ];

  await jsonCache.write('orders.json', sampleOrders);
  await jsonCache.write('returns.json', sampleReturns);

  console.log(`✅ تم إدخال ${sampleOrders.length} طلبات تجريبية و ${sampleReturns.length} طلبات إرجاع بنجاح.`);
}

seedAnalyticsData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
