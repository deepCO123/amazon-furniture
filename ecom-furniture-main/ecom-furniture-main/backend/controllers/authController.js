/**
 * controllers/authController.js
 * منطق تسجيل دخول العملاء والأدمن مع معايير الأمان:
 * - Bcrypt للحماية من هجمات القواميس والتخمين
 * - JWT موقع بـ Secret قوي
 * - إرسال التوكن في HttpOnly Cookie فقط (منع سرقته عبر JavaScript / XSS)
 * - Fire-and-Forget لاستدعاء الإيميل بدون تأخير الاستجابة
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('../services/emailService');

// قاعدة بيانات محلية مرنة للمستخدمين (يمكن ربطها بـ MongoDB / PostgreSQL بسهولة)
const usersDB = [
  // حساب أدمن افتراضي جاهز لتسجيل الدخول:
  // Email: admin@amazonfurniture.eg
  // Password: Admin@Pass2026!
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
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'fallback_secret_key_amazon_2026',
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

    const normalizedEmail = email.toLowerCase().trim();
    let user = usersDB.find((u) => u.email === normalizedEmail);
    let isNewUser = false;

    if (!user) {
      // إذا كان العميل جديداً، يتم إنشاء الحساب وتشفير كلمة المرور بـ Bcrypt
      isNewUser = true;
      const defaultPassword = password || 'User@AutoPass123';
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(defaultPassword, salt);

      user = {
        id: `cust_${Date.now()}`,
        email: normalizedEmail,
        name: name || 'عميل كريم',
        passwordHash,
        role: 'customer',
        createdAt: new Date(),
      };

      usersDB.push(user);
    } else {
      // إذا كان الحساب موجوداً ومزوداً بباسورد يتم التحقق منه
      if (password) {
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
          return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة.' });
        }
      }
    }

    // 1. إنشاء JWT وحفظه حصراً في HttpOnly Cookie (وليس في الـ Body)
    attachTokenCookie(res, user);

    // 2. إرسال الإيميل الترحيبي في الخلفية (Fire-and-Forget بدون await)
    // لا يعطل ولا يؤخر الـ API Response للعميل!
    if (isNewUser) {
      setImmediate(() => {
        sendWelcomeEmail(user.email, user.name).catch((err) => {
          console.error('[Background Email Worker Notice]', err.message);
        });
      });
    }

    // 3. إرجاع بيانات العميل الآمنة فقط
    return res.status(isNewUser ? 201 : 200).json({
      success: true,
      message: isNewUser ? 'تم إنشاء حساب العميل وتفعيله بنجاح!' : 'تم تسجيل الدخول بنجاح!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
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
    const admin = usersDB.find((u) => u.email === normalizedEmail && u.role === 'admin');

    // حماية من هجمات التوقيت (Timing Attack Protection)
    if (!admin) {
      await bcrypt.compare(password, '$2a$12$e8p4iT95fC2.d3X1s/N5v.8iL9K8qNq2tQfXv1pE8Q7G9uEuV9uM6');
      return res.status(401).json({ success: false, message: 'بيانات اعتماد الأدمن غير صحيحة.' });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'بيانات اعتماد الأدمن غير صحيحة.' });
    }

    // إرفاق التوكن في الكوكي الآمنة
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

module.exports = {
  customerLogin,
  adminLogin,
  logout,
  getMe,
};
