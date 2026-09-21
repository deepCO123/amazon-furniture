/**
 * controllers/otpController.js
 * خدمة إنشاء وإرسال والتحقق من رموز الـ OTP للطلبات عالية القيمة وحجوزات المعاينة
 */

// مخزن مؤقت في الذاكرة لرموز التحقق (مع إدارة الصلاحية التلقائية)
const otpStore = new Map();

// تنظيف دوري للرموز المنتهية كل 5 دقائق لمنع استهلاك الذاكرة
setInterval(() => {
  const now = Date.now();
  for (const [phone, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(phone);
    }
  }
}, 5 * 60 * 1000);

/**
 * تنظيف وتوحيد صيغة رقم الهاتف (Egyptian & International formatting)
 */
const normalizePhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/[\s\-\(\)]/g, '').trim();
};

/**
 * @route   POST /api/otp/send
 * @desc    توليد وإرسال رمز تحقق مؤقت (OTP) مدته 5 دقائق
 * @access  Public
 */
const generateAndSendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    const normalizedPhone = normalizePhone(phone);

    if (!normalizedPhone || normalizedPhone.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'يرجى تزويد رقم هاتف صحيح لإرسال رمز التحقق.',
      });
    }

    // توليد رمز مكون من 6 أرقام عشوائية
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresInMinutes = 5;
    const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;

    // حفظ الرمز في الذاكرة
    otpStore.set(normalizedPhone, {
      otp,
      expiresAt,
      attempts: 0,
      createdAt: Date.now(),
    });

    // محاكاة إرسال الرسالة عبر بوابة SMS / WhatsApp Gateway
    console.log(`=======================================================`);
    console.log(`📱 [SMS/WhatsApp Gateway] إرسال رمز تحقق جديد`);
    console.log(`📞 الهاتف المستلم: ${normalizedPhone}`);
    console.log(`🔑 رمز التحقق (OTP): ${otp}`);
    console.log(`⏰ الصلاحية: ${expiresInMinutes} دقائق (تنتهي في ${new Date(expiresAt).toLocaleTimeString('ar-EG')})`);
    console.log(`=======================================================`);

    return res.status(200).json({
      success: true,
      message: 'تم إرسال رمز التحقق بنجاح إلى هاتفك المحمول.',
      phone: normalizedPhone,
      expiresInSeconds: expiresInMinutes * 60,
      // في بيئة التطوير يُرسل الرمز للتسهيل على المطورين
      ...(process.env.NODE_ENV !== 'production' && { debugOtp: otp }),
    });
  } catch (error) {
    console.error('Error generating OTP:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء توليد رمز التحقق، يرجى المحاولة لاحقاً.',
    });
  }
};

/**
 * @route   POST /api/otp/verify
 * @desc    التحقق من صحة الرمز المدخل من العميل
 * @access  Public
 */
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const normalizedPhone = normalizePhone(phone);

    if (!normalizedPhone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'رقم الهاتف ورمز التحقق كلاهما مطلوب.',
      });
    }

    const record = otpStore.get(normalizedPhone);

    // التحقق من وجود الرمز
    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم العثور على رمز تحقق نشط لهذا الرقم، يرجى طلب رمز جديد.',
      });
    }

    // التحقق من انتهاء الصلاحية
    if (Date.now() > record.expiresAt) {
      otpStore.delete(normalizedPhone);
      return res.status(400).json({
        success: false,
        message: 'انتهت صلاحية رمز التحقق (أكثر من 5 دقائق)، يرجى طلب رمز جديد.',
      });
    }

    // حماية ضد التخمين والهجمات (أقصى حد 3 محاولات خاطئة)
    if (record.otp !== otp.toString().trim()) {
      record.attempts += 1;
      if (record.attempts >= 3) {
        otpStore.delete(normalizedPhone);
        return res.status(429).json({
          success: false,
          message: 'تم تجاوز الحد الأقصى للمحاولات الخاطئة (3 محاولات). يرجى طلب رمز جديد.',
        });
      }

      return res.status(400).json({
        success: false,
        message: `رمز التحقق غير صحيح. المتبقي لك ${3 - record.attempts} محاولة.`,
      });
    }

    // التحقق نجح — يتم حذف الرمز فوراً لمنع إعادة استخدامه (Replay Attack Prevention)
    otpStore.delete(normalizedPhone);

    return res.status(200).json({
      success: true,
      verified: true,
      message: 'تم التحقق من ملكية رقم الهاتف بنجاح.',
      phone: normalizedPhone,
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء فحص رمز التحقق.',
    });
  }
};

module.exports = {
  generateAndSendOTP,
  verifyOTP,
};
