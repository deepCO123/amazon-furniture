require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']); } catch (e) {}

const { Coupon } = require('../models');

const couponsToSeed = [
  {
    id: 'cp_welcome10',
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderTotal: 3000,
    maxDiscount: 2500,
    isActive: true,
    descriptionAr: 'خصم 10% ترحيبي للعملاء الجدد (بحد أقصى 2,500 ج)',
    descriptionEn: '10% Welcome discount (up to 2,500 EGP)',
    usageLimit: 500,
    perCustomerLimit: 1
  },
  {
    id: 'cp_vip2026',
    code: 'VIP2026',
    discountType: 'percentage',
    discountValue: 15,
    minOrderTotal: 25000,
    maxDiscount: 6000,
    isActive: true,
    descriptionAr: 'خصم 15% VIP للطلبات الكبرى فوق 25,000 ج',
    descriptionEn: '15% VIP discount on orders above 25,000 EGP',
    usageLimit: 200,
    perCustomerLimit: 2
  },
  {
    id: 'cp_amazon500',
    code: 'AMAZON500',
    discountType: 'fixed',
    discountValue: 500,
    minOrderTotal: 3500,
    isActive: true,
    descriptionAr: 'قسيمة خصم فوري بقيمة 500 جنيه',
    descriptionEn: '500 EGP instant store voucher',
    usageLimit: 300,
    perCustomerLimit: 1
  }
];

async function seedCoupons() {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  for (const cp of couponsToSeed) {
    await Coupon.updateOne({ code: cp.code }, { $set: cp }, { upsert: true });
    console.log('Seeded coupon:', cp.code);
  }
  const count = await Coupon.countDocuments();
  console.log('Total Coupons in Atlas now:', count);
  await mongoose.disconnect();
}

seedCoupons().then(() => console.log('Done')).catch(console.error);
