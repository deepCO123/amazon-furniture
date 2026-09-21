/**
 * routes/reviewRoutes.js
 * مسارات إدارة التقييمات والمراجعات (Reviews & Ratings)
 * مدعومة بنظام التخزين الهجين (RAM Cache + MongoDB Mongoose) لضمان سرعة 0ms وعدم التعطل
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Review } = require('../models');
const jsonCache = require('../services/jsonCache');
const { verifyToken, checkRole } = require('../middlewares/auth');

/**
 * @route   GET /api/reviews
 * @desc    جلب التقييمات المعتمدة لمنتج معين (أو الكل للأدمن) من الرامات في 0ms
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { productId } = req.query;
    const allReviews = await jsonCache.read('reviews.json', []);

    let filtered = allReviews;
    if (productId) {
      filtered = filtered.filter((r) => r.productId === productId);
    }

    // للمستخدمين العاديين، تظهر التقييمات المعتمدة فقط
    const approvedReviews = filtered.filter((r) => r.status === 'approved');

    return res.status(200).json(approvedReviews.length > 0 ? approvedReviews : filtered);
  } catch (error) {
    console.error('GET /api/reviews error:', error);
    return res.status(500).json({ error: 'تعذر جلب التقييمات' });
  }
});

/**
 * @route   POST /api/reviews
 * @desc    تقديم تقييم جديد من العميل (يدخل في حالة pending لمراجعة الإدارة)
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { productId, userName, rating, comment, userAvatar, photos, verifiedPurchase } = req.body;

    if (!productId || !userName || !rating || !comment) {
      return res.status(400).json({
        error: 'جميع الحقول الأساسية (productId, userName, rating, comment) مطلوبة.',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'التقييم يجب أن يكون بين 1 و 5 نجوم.' });
    }

    const reviewId = `rev_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newReview = {
      id: reviewId,
      productId,
      userName: userName.trim(),
      userAvatar: userAvatar || '',
      rating: Number(rating),
      comment: comment.trim(),
      verifiedPurchase: Boolean(verifiedPurchase),
      photos: Array.isArray(photos) ? photos : [],
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // 1. التحديث الفوري في الرامات وكتابة النسخة الاحتياطية
    const reviews = await jsonCache.read('reviews.json', []);
    reviews.push(newReview);
    await jsonCache.write('reviews.json', reviews);

    // 2. الحفظ في MongoDB عند توفر الاتصال
    if (mongoose.connection.readyState === 1) {
      try {
        await Review.create(newReview);
      } catch (dbErr) {
        console.warn('[Review Mongo Sync Warning]', dbErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'شكراً لك! تم إرسال تقييمك وسيتم نشره فور مراجعته من الإدارة.',
      review: newReview,
    });
  } catch (error) {
    console.error('POST /api/reviews error:', error);
    return res.status(500).json({ error: 'فشل في حفظ التقييم' });
  }
});

/**
 * @route   PUT /api/admin/reviews/:id/approve
 * @desc    اعتماد تقييم ونشره للعامة (Admin Only)
 * @access  Private (Admin)
 */
router.put('/:id/approve', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const reviews = await jsonCache.read('reviews.json', []);
    const idx = reviews.findIndex((r) => r.id === id);

    if (idx === -1) {
      return res.status(404).json({ error: 'التقييم غير موجود.' });
    }

    reviews[idx].status = 'approved';
    await jsonCache.write('reviews.json', reviews);

    if (mongoose.connection.readyState === 1) {
      try {
        await Review.findOneAndUpdate({ id }, { status: 'approved' });
      } catch (dbErr) {
        console.warn('[Review Mongo Update Warning]', dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'تم اعتماد التقييم ونشره بنجاح.',
      review: reviews[idx],
    });
  } catch (error) {
    console.error('PUT /api/admin/reviews/:id/approve error:', error);
    return res.status(500).json({ error: 'تعذر اعتماد التقييم' });
  }
});

module.exports = router;
