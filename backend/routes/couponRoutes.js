/**
 * backend/routes/couponRoutes.js
 * مسارات إدارة كوبونات الخصم الديناميكية (Dynamic Coupons)
 * - التحقق الصارم من الخصم والتواريخ وحدود الاستخدام على السيرفر
 * - لوحة تحكم إدارية لإنشاء وتعديل وتعطيل الكوبونات
 */

const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middlewares/auth');
const { Coupon } = require('../models');
const jsonCache = require('../services/jsonCache');

const INITIAL_COUPONS = [
  {
    id: 'cp_welcome10',
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderTotal: 3000,
    maxDiscount: 2500,
    usageLimit: null,
    usedCount: 0,
    perCustomerLimit: 1,
    usedBy: [],
    isActive: true,
    descriptionAr: 'خصم 10% ترحيبي للعملاء الجدد (بحد أقصى 2,500 ج)',
    descriptionEn: '10% Welcome discount (up to 2,500 EGP)',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cp_vip2026',
    code: 'VIP2026',
    discountType: 'percentage',
    discountValue: 15,
    minOrderTotal: 25000,
    maxDiscount: 6000,
    usageLimit: null,
    usedCount: 0,
    perCustomerLimit: 1,
    usedBy: [],
    isActive: true,
    descriptionAr: 'خصم 15% VIP للطلبات الكبرى فوق 25,000 ج',
    descriptionEn: '15% VIP discount on orders above 25,000 EGP',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cp_amazon500',
    code: 'AMAZON500',
    discountType: 'fixed',
    discountValue: 500,
    minOrderTotal: 3500,
    maxDiscount: null,
    usageLimit: 200,
    usedCount: 0,
    perCustomerLimit: 2,
    usedBy: [],
    isActive: true,
    descriptionAr: 'قسيمة خصم فوري بقيمة 500 جنيه',
    descriptionEn: '500 EGP instant store voucher',
    createdAt: new Date().toISOString(),
  },
];

async function ensureCouponsInitialized() {
  // في بيئة الإنتاج، نمنع تماماً الحقن التلقائي للكوبونات التوضيحية عند خلو قاعدة البيانات
  if (jsonCache.isProductionMode()) {
    return;
  }

  if (jsonCache.isMongoConnected()) {
    try {
      const count = await Coupon.countDocuments({});
      if (count > 0) return;
      // إذا كانت قاعدة البيانات فارغة تماماً، نقوم بتهيئة الكوبونات الترحيبية الأساسية
      for (const cp of INITIAL_COUPONS) {
        await Coupon.create(cp);
      }
      jsonCache.invalidate('coupons.json');
      return;
    } catch (err) {
      console.warn('[Coupons Mongo Init Warning]', err.message);
    }
  }
  const coupons = await jsonCache.read('coupons.json', []);
  if (!coupons || coupons.length === 0) {
    await jsonCache.write('coupons.json', INITIAL_COUPONS);
  }
}

/**
 * دالة مساعدة مركزية للتحقق من الكوبون وحساب قيمة الخصم
 */
async function validateCouponLogic(code, subtotal, customerEmail = '') {
  await ensureCouponsInitialized();
  const norm = String(code || '').trim().toUpperCase();
  if (!norm) return { valid: false, discount: 0, message: 'يرجى إدخال كود الخصم.' };

  const coupons = await jsonCache.read('coupons.json', []);
  const coupon = coupons.find((c) => c.code === norm);

  if (!coupon) {
    return { valid: false, discount: 0, message: 'كود الخصم غير موجود أو غير صالح.' };
  }

  if (!coupon.isActive) {
    return { valid: false, discount: 0, message: 'عذراً، هذا الكوبون معطل حالياً.' };
  }

  // التحقق من تاريخ البداية والنهاية
  const now = new Date();
  if (coupon.startDate && new Date(coupon.startDate) > now) {
    return { valid: false, discount: 0, message: 'عذراً، لم تبدأ صلاحية هذا الكوبون بعد.' };
  }
  if (coupon.endDate && new Date(coupon.endDate) < now) {
    return { valid: false, discount: 0, message: 'عذراً، انتهت صلاحية هذا الكوبون.' };
  }

  // التحقق من حد الاستخدام العام
  if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
    return { valid: false, discount: 0, message: 'عذراً، نفدت قسائم هذا الكود بالكامل.' };
  }

  // التحقق من الحد الأدنى لقيمة الطلب
  if (subtotal < (coupon.minOrderTotal || 0)) {
    return {
      valid: false,
      discount: 0,
      message: `الحد الأدنى للطلب لتفعيل هذا الكوبون هو ${coupon.minOrderTotal} ج.م.`,
    };
  }

  // التحقق من حد الاستخدام لكل عميل
  if (customerEmail && coupon.perCustomerLimit && Array.isArray(coupon.usedBy)) {
    const userUses = coupon.usedBy.filter(
      (u) => String(u.email || '').toLowerCase() === String(customerEmail).toLowerCase()
    ).length;
    if (userUses >= coupon.perCustomerLimit) {
      return {
        valid: false,
        discount: 0,
        message: 'لقد استنفدت الحد الأقصى لاستخدام هذا الكود لحسابك.',
      };
    }
  }

  // حساب قيمة الخصم
  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.discountValue;
  }

  discount = Math.min(subtotal, Math.round(discount));

  return {
    valid: true,
    discount,
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      descriptionAr: coupon.descriptionAr,
      descriptionEn: coupon.descriptionEn,
    },
    message: `تم تفعيل كود الخصم بنجاح! وفرت ${discount} ج.م.`,
  };
}

// ─── 1. التحقق من الكوبون (Public Endpoint للعميل عند الدفع) ──
router.post('/validate', async (req, res) => {
  try {
    const { code, subtotal, email } = req.body;
    const numSubtotal = Math.max(0, Number(subtotal) || 0);

    const result = await validateCouponLogic(code, numSubtotal, email);
    res.json(result);
  } catch (err) {
    console.error('POST /api/coupons/validate error:', err);
    res.status(500).json({ valid: false, discount: 0, message: 'حدث خطأ أثناء فحص الكوبون' });
  }
});

// ─── 2. جلب كافة الكوبونات (للأدمن فقط) ───────────────────────
router.get('/', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    await ensureCouponsInitialized();
    const coupons = await jsonCache.read('coupons.json', []);
    res.json({ success: true, coupons });
  } catch (err) {
    console.error('GET /api/coupons error:', err);
    res.status(500).json({ error: 'فشل في قراءة الكوبونات' });
  }
});

// ─── 3. إنشاء كوبون جديد (للأدمن فقط) ─────────────────────────
router.post('/', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const body = req.body;
    const {
      code,
      discountType,
      discountValue,
      minOrderTotal,
      maxDiscount,
      usageLimit,
      perCustomerLimit,
      startDate,
      endDate,
      descriptionAr,
      descriptionEn,
    } = body;

    if (!code || !discountValue) {
      return res.status(400).json({ error: 'كود الخصم وقيمة الخصم مطلوبان.' });
    }

    const normCode = String(code).trim().toUpperCase();
    const coupons = await jsonCache.read('coupons.json', []);

    if (coupons.some((c) => c.code === normCode)) {
      return res.status(400).json({ error: `كود الخصم "${normCode}" موجود بالفعل.` });
    }

    const newCoupon = {
      id: `cp_${Date.now()}`,
      code: normCode,
      discountType: discountType === 'fixed' ? 'fixed' : 'percentage',
      discountValue: Math.max(1, Number(discountValue)),
      minOrderTotal: Math.max(0, Number(minOrderTotal) || 0),
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      usedCount: 0,
      perCustomerLimit: Math.max(1, Number(perCustomerLimit) || 1),
      usedBy: [],
      startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : null,
      isActive: true,
      descriptionAr: descriptionAr || `خصم ${discountValue}${discountType === 'fixed' ? ' ج.م' : '%'}`,
      descriptionEn: descriptionEn || `Discount ${discountValue}${discountType === 'fixed' ? ' EGP' : '%'}`,
      createdAt: new Date().toISOString(),
    };

    coupons.unshift(newCoupon);
    await jsonCache.write('coupons.json', coupons);

    if (jsonCache.isMongoConnected()) {
      try {
        await Coupon.create(newCoupon);
      } catch (dbErr) {
        console.warn('Coupon Mongo create notice:', dbErr.message);
      }
    }

    res.status(201).json({ success: true, coupon: newCoupon });
  } catch (err) {
    console.error('POST /api/coupons error:', err);
    res.status(500).json({ error: 'فشل في إنشاء الكوبون' });
  }
});

// ─── 4. تحديث أو تعطيل كوبون (للأدمن فقط) ──────────────────────
router.patch('/:id', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const coupons = await jsonCache.read('coupons.json', []);
    const idx = coupons.findIndex((c) => c.id === id || c.code === id);

    if (idx === -1) {
      return res.status(404).json({ error: 'الكوبون غير موجود' });
    }

    if (updates.isActive !== undefined) coupons[idx].isActive = Boolean(updates.isActive);
    if (updates.discountValue !== undefined) coupons[idx].discountValue = Number(updates.discountValue);
    if (updates.minOrderTotal !== undefined) coupons[idx].minOrderTotal = Number(updates.minOrderTotal);
    if (updates.maxDiscount !== undefined) coupons[idx].maxDiscount = updates.maxDiscount ? Number(updates.maxDiscount) : null;
    if (updates.usageLimit !== undefined) coupons[idx].usageLimit = updates.usageLimit ? Number(updates.usageLimit) : null;
    if (updates.descriptionAr !== undefined) coupons[idx].descriptionAr = updates.descriptionAr;

    await jsonCache.write('coupons.json', coupons);

    if (jsonCache.isMongoConnected()) {
      try {
        await Coupon.findOneAndUpdate({ $or: [{ id }, { code: id }] }, updates);
      } catch (dbErr) {
        console.warn('Coupon Mongo update notice:', dbErr.message);
      }
    }

    res.json({ success: true, coupon: coupons[idx] });
  } catch (err) {
    console.error('PATCH /api/coupons/:id error:', err);
    res.status(500).json({ error: 'فشل في تعديل الكوبون' });
  }
});

// ─── 5. حذف كوبون (للأدمن فقط) ───────────────────────────────
router.delete('/:id', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const coupons = await jsonCache.read('coupons.json', []);
    const target = coupons.find((c) => c.id === id || c.code === id);

    if (!target) {
      return res.status(404).json({ error: 'الكوبون غير موجود' });
    }

    await jsonCache.deleteItem('coupons.json', target.code || id);

    res.json({ success: true, deletedId: id });
  } catch (err) {
    console.error('DELETE /api/coupons/:id error:', err);
    res.status(500).json({ error: 'فشل في حذف الكوبون' });
  }
});

module.exports = {
  router,
  validateCouponLogic,
  ensureCouponsInitialized,
};
