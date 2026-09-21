/**
 * middlewares/upload.js
 * خدمة رفع وسائط وصور المنتجات والمرتجعات مع التحويل التلقائي لصيغة WebP عبر Cloudinary & Multer
 */

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// 1. تهيئة إعدادات Cloudinary عبر متغيرات البيئة
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'amazon-furniture',
  api_key: process.env.CLOUDINARY_API_KEY || 'mock_api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mock_api_secret',
  secure: true,
});

// 2. إعداد محرك التخزين السحابي CloudinaryStorage مع التحويل التلقائي إلى WebP
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // تحديد المجلد الفرعي بناءً على مسار الرفع (منتجات أو مرتجعات أو عام)
    let folderName = 'amazon-furniture/general';
    if (req.originalUrl?.includes('products')) {
      folderName = 'amazon-furniture/products';
    } else if (req.originalUrl?.includes('returns')) {
      folderName = 'amazon-furniture/returns';
    }

    const cleanName = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
    const publicId = `${Date.now()}-${cleanName}`;

    return {
      folder: folderName,
      public_id: publicId,
      format: 'webp', // التحويل الإجباري السريع لصيغة WebP
      transformation: [
        { width: 1920, crop: 'limit' }, // ضبط العرض الأقصى للصور الكبيرة مع الحفاظ على الأبعاد
        { quality: 'auto:good' },       // ضغط حجم الملف مع الاحتفاظ بجودة عالية
        { fetch_format: 'webp' },
      ],
    };
  },
});

// 3. فلترة صيغ الملفات للسماح بالصور فقط
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/jpg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('نوع الملف غير مدعوم. يرجى رفع صورة بصيغة (JPEG, PNG, WebP, AVIF) فقط.'),
      false
    );
  }
};

// 4. إنشاء مثيل Multer الرئيسي
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // الحد الأقصى 10 ميجابايت لكل صورة
  },
  fileFilter: fileFilter,
});

// 5. دوال مساعدة جاهزة للاستخدام في الراوترات
module.exports = {
  cloudinary,
  upload,
  uploadSingle: (fieldName = 'image') => upload.single(fieldName),
  uploadArray: (fieldName = 'images', maxCount = 5) => upload.array(fieldName, maxCount),
  uploadFields: (fields) => upload.fields(fields),
};
