/**
 * server.js
 * تجميع كافة عناصر الأمان، والمصادقة، والتوجيهات في تطبيق Express متكامل
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cookieParser = require('cookie-parser');

// استدعاء طبقات الأمان والميدلوير
const {
  helmetConfig,
  corsConfig,
  apiLimiter,
  authLimiter,
  sanitizeData,
} = require('./middlewares/security');

// استدعاء المصادقة والصلاحيات
const { verifyToken, checkRole } = require('./middlewares/auth');
const authController = require('./controllers/authController');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. تفعيل طبقات الحماية وتأمين الـ HTTP Headers
app.use(helmetConfig);
app.use(corsConfig);

// 2. تحليل الـ Body مع حد أقصى (10kb) لمنع DoS
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 3. تحليل الكوكيز لتتمكن الميدلوير من قراءة HttpOnly Cookies
app.use(cookieParser());

// 4. تطهير المدخلات ضد XSS & NoSQL Injection
app.use(sanitizeData);

// 5. تطبيق الـ Rate Limiting العام على كل مسارات الـ API
app.use('/api', apiLimiter);

// -------------------------------------------------------------
// المسارات العامة والمصادقة (Auth Routes)
// -------------------------------------------------------------
// تطبيق الـ Rate Limiter الصارم (5 محاولات لكل 15 دقيقة) لمنع التخمين
app.post('/api/auth/customer-login', authLimiter, authController.customerLogin);
app.post('/api/auth/admin-login', authLimiter, authController.adminLogin);
app.post('/api/auth/logout', authController.logout);

// مسار فحص الجلسة الحالية
app.get('/api/auth/me', verifyToken, authController.getMe);

// -------------------------------------------------------------
// مسارات محمية للعملاء فقط (Customer Protected Routes)
// -------------------------------------------------------------
app.get('/api/customer/my-orders', verifyToken, checkRole('customer'), (req, res) => {
  res.json({
    success: true,
    message: `مرحباً بك يا ${req.user.email}، هذه قائمة طلبات الأثاث الخاصة بك.`,
    orders: [],
  });
});

// -------------------------------------------------------------
// مسارات محمية للأدمن فقط (Admin Protected Routes)
// -------------------------------------------------------------
app.get('/api/admin/dashboard', verifyToken, checkRole('admin'), (req, res) => {
  res.json({
    success: true,
    message: 'بيانات لوحة التحكم الحصرية للأدمن فقط.',
    stats: {
      totalRevenueEGP: 972000,
      activeOrders: 14,
      outletRestockCount: 3,
    },
  });
});

// فحص سلامة السيرفر (Health Check)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// -------------------------------------------------------------
// معالج الأخطاء المركزي (Centralized Error Handler)
// -------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err.stack);
  res.status(500).json({
    success: false,
    message: 'حدث خطأ غير متوقع في الخادم، تم تسجيل الحادثة لدواعي الأمان.',
  });
});

// تشغيل الخادم
app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`🚀 Amazon Furniture Backend API running on port: ${PORT}`);
  console.log(`🔒 Security Hardening & Rate Limiting: ACTIVE`);
  console.log(`🌐 Allowed CORS Origin: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  console.log(`=============================================`);
});

module.exports = app;
