/**
 * middlewares/security.js
 * طبقة الأمان الأساسية لحماية السيرفر من هجمات:
 * - XSS (Cross-Site Scripting)
 * - Brute Force (التخمين العشوائي)
 * - SQL / NoSQL Injection
 * - Clickjacking & Header Spoofing
 */

const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// 1. إعدادات Helmet لتأمين الـ HTTP Headers
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.CLIENT_URL || "http://localhost:3000"],
    },
  },
  crossOriginEmbedderPolicy: false,
  xssFilter: true,
  noSniff: true,
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
});

// 2. إعدادات CORS الصارمة لدومين الفرونت إند المعتمد فقط
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:3000";
const corsConfig = cors({
  origin: (origin, callback) => {
    // السماح بالطلبات الداخلية بدون Origin (مثل Server-to-Server أو أدوات الاختبار)
    if (!origin) return callback(null, true);
    if (origin === allowedOrigin || origin === 'http://localhost:3000' || origin === 'http://127.0.0.1:3000') {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy violation: origin ${origin} is strictly not allowed.`));
  },
  credentials: true, // ضروري جداً لتبادل الـ HttpOnly Cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400, // 24 hours preflight cache
});

// 3. محدد معدل الطلبات العام للـ API (General Rate Limiter)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 150, // أقصى حد 150 طلب لكل IP خلال المدة
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    success: false,
    message: 'تم تجاوز الحد الأقصى للطلبات. يرجى المحاولة بعد 15 دقيقة.',
  },
});

// 4. محدد صارم جداً لمسارات تسجيل الدخول لمنع Brute Force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: process.env.NODE_ENV === 'production' ? 5 : 100, // 5 محاولات فقط لكل IP في الإنتاج، 100 في التطوير
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    success: false,
    message: 'محاولات دخول متكررة غير صحيحة. تم حظر الطلب مؤقتاً لمدة 15 دقيقة لدواعي الأمان.',
  },
});

// 5. ميدلوير تطهير المدخلات لمنع الـ NoSQL/SQL Injection والـ XSS
const sanitizeData = (req, res, next) => {
  const cleanInput = (data) => {
    if (!data || typeof data !== 'object') {
      if (typeof data === 'string') {
        return data
          .replace(/[<>]/g, '') // منع XSS الأساسي
          .trim();
      }
      return data;
    }

    for (const key of Object.keys(data)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete data[key];
      } else {
        data[key] = cleanInput(data[key]);
      }
    }
    return data;
  };

  if (req.body) req.body = cleanInput(req.body);
  if (req.query) req.query = cleanInput(req.query);
  if (req.params) req.params = cleanInput(req.params);

  next();
};

module.exports = {
  helmetConfig,
  corsConfig,
  apiLimiter,
  authLimiter,
  sanitizeData,
};
