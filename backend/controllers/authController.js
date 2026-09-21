/**
 * controllers/authController.js
 * منطق تسجيل دخول العملاء والأدمن مع معايير الأمان:
 * - Bcrypt للحماية من هجمات القواميس والتخمين
 * - JWT موقع بـ Secret قوي
 * - إرسال التوكن في HttpOnly Cookie فقط (منع سرقته عبر JavaScript / XSS)
 * - Fire-and-Forget لاستدعاء الإيميل بدون تأخير الاستجابة
 * - دعم Google OAuth 2.0 Callback
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('../services/emailService');
const { Customer } = require('../models');
const jsonCache = require('../services/jsonCache');

// قاعدة بيانات محلية مرنة للأدمن (يمكن نقلها لـ MongoDB عبر seed.js)
const adminsDB = [
  {
    id: 'admin_01',
    email: 'admin@amazonfurniture.eg',
    passwordHash: '$2a$10$ffXck6x.FV/wNXMF/bS74OlZic1JK1GC7q4QdFb9TErZGzPf9Ty.W', // Admin@Pass2026!
    name: 'محمد إسماعيل (المدير العام)',
    role: 'admin',
    createdAt: new Date(),
  },
];

// دالة مساعدة لتوليد الـ Cookie الآمنة
const attachTokenCookie = (res, user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET environment variable is not set. Server cannot issue tokens.');
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || 'customer',
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const isProduction = process.env.NODE_ENV === 'production';

  // إعداد الكوكي الصارم: لا يمكن قراءته بواسطة document.cookie أبداً
  res.cookie('token', token, {
    httpOnly: true, // حماية كاملة من XSS
    secure: isProduction, // HTTPS في بيئة الإنتاج
    sameSite: isProduction ? 'strict' : 'lax', // حماية من CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // أسبوع كامل
    path: '/',
  });

  return token;
};

// -------------------------------------------------------------
// 1. تسجيل دخول / إنشاء حساب العميل (Customer Login & Auto Register)
// -------------------------------------------------------------
const customerLogin = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'يرجى كتابة البريد الإلكتروني.' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'البريد الإلكتروني غير صالح.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // البحث في الكاش أولاً ثم MongoDB
    const customers = await jsonCache.read('customers.json', []);
    let cachedUser = customers.find((c) => c.email.toLowerCase() === normalizedEmail);
    let isNewUser = false;

    // البحث في MongoDB إذا لم يوجد في الكاش
    let mongoUser = null;
    if (jsonCache.isMongoConnected()) {
      mongoUser = await Customer.findOne({ email: normalizedEmail });
    }

    if (!cachedUser && !mongoUser) {
      // إنشاء حساب عميل جديد
      isNewUser = true;
      if (!password || password.length < 6) {
        return res.status(400).json({ success: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.' });
      }
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      const newCustomer = {
        id: `cust_${Date.now()}`,
        email: normalizedEmail,
        name: name || 'عميل كريم',
        role: 'customer',
        provider: 'email',
        ordersCount: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
      };

      // حفظ في الكاش
      customers.unshift({ ...newCustomer, passwordHash });
      await jsonCache.write('customers.json', customers);

      // حفظ في MongoDB
      if (jsonCache.isMongoConnected()) {
        try {
          await Customer.create({ ...newCustomer, passwordHash });
        } catch (mongoErr) {
          console.warn('[Customer Mongo Create Notice]', mongoErr.message);
        }
      }

      cachedUser = { ...newCustomer, passwordHash };
    } else {
      // التحقق من كلمة المرور
      if (!password) {
        return res.status(400).json({ success: false, message: 'يرجى إدخال كلمة المرور.' });
      }

      const storedHash = cachedUser?.passwordHash || mongoUser?.passwordHash;

      // إذا كان حساب Google بدون كلمة مرور
      if (!storedHash) {
        return res.status(400).json({
          success: false,
          message: 'هذا الحساب مسجل عبر Google. يرجى تسجيل الدخول باستخدام زر Google.',
        });
      }

      const isMatch = await bcrypt.compare(password, storedHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة.' });
      }

      if (!cachedUser) cachedUser = mongoUser;
    }

    // إنشاء JWT وحفظه في HttpOnly Cookie
    attachTokenCookie(res, cachedUser);

    // إرسال الإيميل الترحيبي في الخلفية
    if (isNewUser) {
      setImmediate(() => {
        sendWelcomeEmail(cachedUser.email, cachedUser.name).catch((err) => {
          console.error('[Background Email Worker Notice]', err.message);
        });
      });
    }

    return res.status(isNewUser ? 201 : 200).json({
      success: true,
      message: isNewUser ? 'تم إنشاء حساب العميل وتفعيله بنجاح!' : 'تم تسجيل الدخول بنجاح!',
      user: {
        id: cachedUser.id,
        name: cachedUser.name,
        email: cachedUser.email,
        role: cachedUser.role || 'customer',
        isNew: isNewUser,
      },
    });
  } catch (error) {
    console.error('Customer Login Error:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم أثناء تسجيل الدخول.' });
  }
};

// -------------------------------------------------------------
// 2. تسجيل دخول الأدمن المنفصل (Admin Login)
// -------------------------------------------------------------
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور للأدمن.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const admin = adminsDB.find((u) => u.email === normalizedEmail && u.role === 'admin');

    // حماية من هجمات التوقيت (Timing Attack Protection)
    if (!admin) {
      await bcrypt.compare(password, '$2a$12$e8p4iT95fC2.d3X1s/N5v.8iL9K8qNq2tQfXv1pE8Q7G9uEuV9uM6');
      return res.status(401).json({ success: false, message: 'بيانات اعتماد الأدمن غير صحيحة.' });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'بيانات اعتماد الأدمن غير صحيحة.' });
    }

    attachTokenCookie(res, admin);

    return res.status(200).json({
      success: true,
      message: 'مرحباً بعودتك للوحة التحكم الإدارية.',
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin Login Error:', error);
    return res.status(500).json({ success: false, message: 'خطأ داخلي أثناء تسجيل دخول الإدارة.' });
  }
};

// -------------------------------------------------------------
// 3. تسجيل الخروج ومسح الـ Cookie
// -------------------------------------------------------------
const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/',
  });

  return res.status(200).json({ success: true, message: 'تم تسجيل الخروج بنجاح.' });
};

// -------------------------------------------------------------
// 4. استرجاع بيانات المستخدم الحالي الموثق (Me)
// -------------------------------------------------------------
const getMe = (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

// -------------------------------------------------------------
// 5. Google OAuth 2.0 Callback Handler
// يُستدعى بعد نجاح المصادقة عبر Passport Google Strategy
// -------------------------------------------------------------
const googleCallback = (req, res) => {
  try {
    const customer = req.user;

    if (!customer) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/login?error=google_no_user`);
    }

    // إنشاء JWT وإرفاقه في HttpOnly Cookie
    attachTokenCookie(res, {
      id: customer.id,
      email: customer.email,
      role: customer.role || 'customer',
    });

    // مزامنة العميل مع الكاش المحلي (Fire-and-Forget)
    setImmediate(async () => {
      try {
        const customers = await jsonCache.read('customers.json', []);
        const exists = customers.some((c) => c.email.toLowerCase() === customer.email.toLowerCase());
        if (!exists) {
          customers.unshift({
            id: customer.id,
            name: customer.name,
            email: customer.email,
            avatar: customer.avatar || '',
            phone: customer.phone || '',
            city: customer.city || 'القاهرة',
            provider: 'google',
            ordersCount: 0,
            totalSpent: 0,
            createdAt: new Date().toISOString(),
          });
          await jsonCache.write('customers.json', customers);
        }
      } catch (err) {
        console.warn('[Google Callback Cache Sync]', err.message);
      }
    });

    // إعادة التوجيه للصفحة الرئيسية مع إشارة نجاح
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}?auth=google_success`);
  } catch (error) {
    console.error('Google Callback Error:', error);
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/login?error=google_server`);
  }
};

module.exports = {
  customerLogin,
  adminLogin,
  logout,
  getMe,
  googleCallback,
};
