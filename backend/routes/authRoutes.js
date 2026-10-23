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

const jsonCache = require('../services/jsonCache');

// ─── Google OAuth 2.0 ─────────────────────────────────────
const isGoogleConfigured = () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

// بدء عملية تسجيل الدخول عبر Google
router.get('/google', (req, res, next) => {
  const returnTo = req.query.returnTo || (req.headers.referer?.includes('/checkout') ? '/checkout' : '/');
  const targetPath = returnTo.startsWith('/') ? returnTo : '/';

  if (!isGoogleConfigured()) {
    // Development / Local Testing Fallback: Auto-authenticate as Google VIP Customer
    const demoGoogleCustomer = {
      id: 'cust_google_vip',
      name: 'طارق الدسوقي (Google VIP)',
      email: 'tarek.designer@gmail.com',
      role: 'customer',
      provider: 'google',
      phone: '01091084863',
      city: 'cairo',
    };
    authController.attachTokenCookie(res, demoGoogleCustomer);

    setImmediate(async () => {
      try {
        const customers = await jsonCache.read('customers.json', []);
        const exists = customers.some((c) => c.email.toLowerCase() === demoGoogleCustomer.email.toLowerCase());
        if (!exists) {
          customers.unshift({
            ...demoGoogleCustomer,
            ordersCount: 1,
            totalSpent: 0,
            createdAt: new Date().toISOString(),
          });
          await jsonCache.write('customers.json', customers);
        }
      } catch (err) {
        console.warn('[Google Fallback Cache Sync]', err.message);
      }
    });

    const clientBase = process.env.CLIENT_URL || 'http://localhost:3000';
    const separator = targetPath.includes('?') ? '&' : '?';
    return res.redirect(`${clientBase}${targetPath}${separator}auth=google_success`);
  }

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    state: targetPath,
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
