/**
 * backend/routes/authRoutes.js
 * مسارات المصادقة: تسجيل دخول العملاء، الأدمن، Google OAuth، تسجيل الخروج
 */

const express = require('express');
const passport = require('passport');
const router = express.Router();

const { verifyToken } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/security');
const authController = require('../controllers/authController');

// تسجيل دخول العملاء (Email + Password) مع Rate Limiting صارم
router.post('/customer-login', authLimiter, authController.customerLogin);

// تسجيل دخول الأدمن مع Rate Limiting صارم
router.post('/admin-login', authLimiter, authController.adminLogin);

// تسجيل الخروج (مسح الـ Cookie)
router.post('/logout', authController.logout);

// فحص الجلسة الحالية
router.get('/me', verifyToken, authController.getMe);

// ─── Google OAuth 2.0 ─────────────────────────────────────
const isGoogleConfigured = () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

// بدء عملية تسجيل الدخول عبر Google
router.get('/google', (req, res, next) => {
  if (!isGoogleConfigured()) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/login?error=google_not_configured`);
  }
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })(req, res, next);
});

// استقبال الرد من Google بعد موافقة المستخدم
router.get(
  '/google/callback',
  (req, res, next) => {
    if (!isGoogleConfigured()) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/login?error=google_not_configured`);
    }
    passport.authenticate('google', {
      session: false,
      failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/login?error=google_failed`,
    })(req, res, next);
  },
  authController.googleCallback
);

module.exports = router;
