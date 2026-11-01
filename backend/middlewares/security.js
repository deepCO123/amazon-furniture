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
const getConnectSrc = () => {
  const sources = [
    "'self'",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
    "http://127.0.0.1:5173",
    "ws://localhost:*",
    "ws://127.0.0.1:*",
    "https://*.trycloudflare.com",
    "wss://*.trycloudflare.com",
    "https://*.vercel.app",
    "wss://*.vercel.app",
  ];

  if (process.env.CLIENT_URL) {
    process.env.CLIENT_URL.split(',').forEach((url) => {
      const trimmed = url.trim();
      if (trimmed && !sources.includes(trimmed)) {
        sources.push(trimmed);
      }
    });
  }

  return sources;
};

const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: getConnectSrc(),
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

// دالة التحقق من النطاقات المسموح بها لـ CORS
const isOriginAllowed = (origin) => {
  // السماح بالطلبات الداخلية بدون Origin (مثل Server-to-Server أو أداة cURL)
  if (!origin) return true;

  const rawClientUrls = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : [];
  const configuredOrigins = rawClientUrls
    .map((url) => url.trim().replace(/\/$/, ''))
    .filter(Boolean);

  if (process.env.CLIENT_URL) {
    configuredOrigins.push(process.env.CLIENT_URL.trim());
  }

  const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://127.0.0.1:5173',
  ];

  const allowedOriginsSet = new Set([...configuredOrigins, ...defaultOrigins]);

  if (allowedOriginsSet.has(origin)) {
    return true;
  }

  // السماح بنطاقات Cloudflare Tunnel و Vercel Deployments
  if (origin.endsWith('.trycloudflare.com') || origin.endsWith('.vercel.app')) {
    return true;
  }

  // في بيئة التطوير، السماح بأي بورت محلي على localhost أو 127.0.0.1
  if (process.env.NODE_ENV !== 'production') {
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    if (isLocalhost) {
      return true;
    }
  }

  return false;
};

// 2. إعدادات CORS لدومين الفرونت إند والتطوير المحلي
const corsConfig = cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
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
  isOriginAllowed,
};
