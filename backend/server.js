/**
 * server.js
 * نقطة الدخول الرئيسية لخادم Express — مُنظم كمُنسق رشيق (Slim Orchestrator)
 * يُفوّض المنطق للراوترات المتخصصة في مجلد routes/
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const express = require('express');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const passport = require('passport');

// الاتصال بقاعدة بيانات MongoDB عبر Mongoose
const connectDB = require('./config/db');
const configurePassport = require('./config/passport');

// محرك التخزين المؤقت في الذاكرة
const jsonCache = require('./services/jsonCache');

// استدعاء طبقات الأمان والميدلوير
const {
  helmetConfig,
  corsConfig,
  apiLimiter,
  sanitizeData,
} = require('./middlewares/security');

// استدعاء الراوترات المتخصصة
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const customerRoutes = require('./routes/customerRoutes');
const consultationRoutes = require('./routes/consultationRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const returnRoutes = require('./routes/returnRoutes');
const emailRoutes = require('./routes/emailRoutes');
const adminRoutes = require('./routes/adminRoutes');
const otpRoutes = require('./routes/otpRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const { verifyToken, checkRole } = require('./middlewares/auth');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// ─── إعداد Socket.io مع ضبط CORS والتأمين ─────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ميدلوير التوثيق لـ Socket.io لحماية غرفة الإدارة (admin_room)
io.use((socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers?.cookie || '';
    const cookieToken = cookieHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('token='))
      ?.split('=')[1];

    const token = socket.handshake.auth?.token || cookieToken;

    if (!token || !process.env.JWT_SECRET) {
      socket.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    socket.user = null;
    next();
  }
});

io.on('connection', (socket) => {
  if (socket.user && socket.user.role === 'admin') {
    socket.join('admin_room');
    console.log(`🔌 [Socket.io] Admin joined 'admin_room': ${socket.id} (${socket.user.email})`);
  } else {
    console.log(`🔌 [Socket.io] User connected: ${socket.id}`);
  }
});

// إتاحة io عبر تطبيق Express
app.set('io', io);

// ─── 0. ضغط الاستجابات (Gzip Compression) ─────────────────
app.use(compression({
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));

// ─── 1. طبقات الحماية وتأمين الـ HTTP Headers ──────────────
app.use(helmetConfig);
app.use(corsConfig);

// ─── 2. تحليل الـ Body مع حد أقصى (10kb) ───────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── 3. تحليل الكوكيز ──────────────────────────────────────
app.use(cookieParser());

// ─── 4. تطهير المدخلات ضد XSS & NoSQL Injection ────────────
app.use(sanitizeData);

// ─── 5. تهيئة Passport (Google OAuth) ───────────────────────
app.use(passport.initialize());
configurePassport();

// ─── 6. Rate Limiting العام ─────────────────────────────────
app.use('/api', apiLimiter);

// ─── 7. تركيب الراوترات المتخصصة ────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/email', emailRoutes); // Alias for backward compatibility
app.use('/api/admin', adminRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);

// استدعاء خدمة النسخ الاحتياطي التلقائي
const { scheduleBackups, performBackup } = require('./scripts/backup');

// ─── 8. مسار إحصائيات التخزين المؤقت (Admin Only) ───────────
app.get('/api/cache-stats', verifyToken, checkRole('admin'), (req, res) => {
  res.json({
    success: true,
    metrics: jsonCache.getMetrics(),
  });
});

// ─── 8.1. مسار أخذ نسخة احتياطية فورية (Admin Only) ─────────
app.post('/api/backup', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const backupResult = await performBackup();
    res.json({ success: true, backup: backupResult });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 9. فحص سلامة السيرفر (Health Check) ────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 10. معالج الأخطاء المركزي ──────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err.stack);
  res.status(500).json({
    success: false,
    message: 'حدث خطأ غير متوقع في الخادم، تم تسجيل الحادثة لدواعي الأمان.',
  });
});

// ─── 11. تشغيل الخادم ───────────────────────────────────────
if (require.main === module) {
  const startServer = async () => {
    try {
      await connectDB();
    } catch (err) {
      console.warn(`⚠️ MongoDB connection warning: ${err.message}. Server running with RAM fallback.`);
    }

    // تشغيل جدولة النسخ الاحتياطي اليومي الساعة 3:00 ص
    scheduleBackups();

    server.listen(PORT, () => {
      console.log(`=============================================`);
      console.log(`🚀 Amazon Furniture Backend API running on port: ${PORT}`);
      console.log(`🔒 Security Hardening & Rate Limiting: ACTIVE`);
      console.log(`🌐 Allowed CORS Origin: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
      console.log(`🍃 Database Architecture: Mongoose (MongoDB) + In-Memory RAM Cache`);
      console.log(`🔑 Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
      console.log(`💾 Automated Disaster Recovery: ACTIVE (Daily @ 3:00 AM)`);
      console.log(`⚡ Real-Time Socket.io: ACTIVE`);
      console.log(`=============================================`);
    });
  };

  startServer();
}

module.exports = app;
module.exports.app = app;
module.exports.server = server;
module.exports.io = io;
