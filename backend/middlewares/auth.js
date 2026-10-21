/**
 * middlewares/auth.js
 * التحقق من جلسة المستخدم وفحص أدواره (RBAC):
 * - verifyToken: يقرأ التوكن من الـ Cookies الآمنة
 * - checkRole: يسمح فقط للأدوار المصرح لها بدخول الـ Endpoint
 */

const jwt = require('jsonwebtoken');

// التحقق من صحة التوكن الموجود في الـ Cookie
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'وصول غير مصرح به. يرجى تسجيل الدخول أولاً.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_min_32_characters_random_string_2026!';
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // يحتوي على { id, email, role }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً.',
      });
    }
    return res.status(403).json({
      success: false,
      message: 'جلسة غير صالحة أو تم التلاعب بها.',
    });
  }
};

// التحقق من صلاحية الدور (Role-Based Access Control)
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'عذراً، ليس لديك الصلاحيات الكافية للوصول لهذا المورد الإداري.',
      });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  checkRole,
};
