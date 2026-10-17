/**
 * middlewares/upload.js
 * خدمة رفع وسائط وصور المنتجات والمرتجعات مع التحويل التلقائي لصيغة WebP عبر Cloudinary & Multer
 */

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const cloudinaryEnabled = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}


const path = require('path');
const fs = require('fs');

// مسار التخزين المحلي في مجلد public/uploads الخاص بالواجهة
const UPLOADS_DIR = path.resolve(
  __dirname,
  '..',
  '..',
  'ecom-furniture-main',
  'ecom-furniture-main',
  'public',
  'uploads'
);

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const isCloudinaryConfigured = cloudinaryEnabled;

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${Date.now()}-${cleanName}${ext}`);
  },
});

// 2. إعداد محرك التخزين السحابي CloudinaryStorage مع التحويل التلقائي إلى WebP
let storage = localStorage;

if (isCloudinaryConfigured) {
  try {
    storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: async (req, file) => {
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
          format: 'webp',
          transformation: [
            { width: 1920, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'webp' },
          ],
        };
      },
    });
  } catch (err) {
    console.warn('[Upload Storage] Cloudinary initialization failed, falling back to local disk storage:', err.message);
    storage = localStorage;
  }
}

// 3. فلترة صيغ الملفات للسماح بالصور فقط
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/jpg', 'image/gif'];
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
    fileSize: 20 * 1024 * 1024, // الحد الأقصى 20 ميجابايت لكل صورة
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
