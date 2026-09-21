/**
 * routes/otpRoutes.js
 * مسارات واجهة برمجة التطبيقات لخدمة التحقق من الهاتف بالـ OTP
 */

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { generateAndSendOTP, verifyOTP } = require('../controllers/otpController');

// حماية مسار الإرسال من الإغراق (حد أقصى 5 طلبات لكل رقم خلال 15 دقيقة)
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'تم تجاوز الحد المسموح لطلب رموز التحقق، يرجى المحاولة بعد قليل.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route   POST /api/otp/send
 * @desc    توليد وإرسال رمز OTP لرقم الهاتف
 * @access  Public
 */
router.post('/send', otpLimiter, generateAndSendOTP);

/**
 * @route   POST /api/otp/verify
 * @desc    التحقق من كود الـ OTP المدخل
 * @access  Public
 */
router.post('/verify', verifyOTP);

module.exports = router;
