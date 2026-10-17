/**
 * routes/otpRoutes.js
 * مسارات واجهة برمجة التطبيقات لخدمة التحقق من الهاتف بالـ OTP
 */

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { generateAndSendOTP, verifyOTP } = require('../controllers/otpController');

// حماية مسار الإرسال من الإغراق (حد أقصى 5 طلبات في الإنتاج / 20 في التطوير)
const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 20,
  message: {
    success: false,
    message: 'تم تجاوز الحد المسموح لطلب رموز التحقق، يرجى المحاولة بعد 15 دقيقة.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// حماية مسار التحقق من هجمات التخمين (Brute-Force)
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 50,
  message: {
    success: false,
    message: 'تم تجاوز حد محاولات التحقق، يرجى المحاولة لاحقاً.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route   POST /api/otp/send
 * @desc    توليد وإرسال رمز OTP لرقم الهاتف
 * @access  Public
 */
router.post('/send', otpSendLimiter, generateAndSendOTP);

/**
 * @route   POST /api/otp/verify
 * @desc    التحقق من كود الـ OTP المدخل
 * @access  Public
 */
router.post('/verify', otpVerifyLimiter, verifyOTP);

module.exports = router;
