/**
 * routes/uploadRoutes.js
 * مسار رفع الصور والوسائط (محلياً أو عبر Cloudinary) مع معالجة حقول file و image
 * ⚠️  جميع مسارات الرفع محمية بـ RBAC Admin فقط
 */

const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/upload');
const { verifyToken, checkRole } = require('../middlewares/auth');

// حماية جميع مسارات الرفع للأدمن فقط
router.use(verifyToken, checkRole('admin'));

// معالج مرن يتقبل حقل 'file' أو 'image'
const singleUploadMiddleware = (req, res, next) => {
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      console.error('[Upload Error]', err.message);
      return res.status(400).json({ success: false, error: err.message });
    }
    // وضع الملف الملتقط في req.file لتسهيل المعالجة
    req.file = req.files?.file?.[0] || req.files?.image?.[0] || null;
    next();
  });
};

const handleSingleUploadResponse = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'لم يتم إرسال أي ملف صورة.' });
  }

  // إذا تم الرفع إلى Cloudinary يحتوي path على رابط https
  // إذا تم الرفع محلياً نستخدم المسار العام /uploads/<filename>
  const fileUrl = (req.file.path && req.file.path.startsWith('http'))
    ? req.file.path
    : `/uploads/${req.file.filename}`;

  return res.status(200).json({
    success: true,
    url: fileUrl,
    format: req.file.mimetype || 'image/webp',
    filename: req.file.filename,
  });
};

/**
 * @route   POST /api/upload
 * @desc    رفع صورة واحدة (المسار المستخدم في ProductModal)
 */
router.post('/', singleUploadMiddleware, handleSingleUploadResponse);

/**
 * @route   POST /api/upload/single
 * @desc    رفع صورة واحدة (اسم المسار البديل)
 */
router.post('/single', singleUploadMiddleware, handleSingleUploadResponse);

/**
 * @route   POST /api/upload/multiple
 * @desc    رفع عدة صور دفعة واحدة (حد أقصى 5)
 */
router.post('/multiple', (req, res) => {
  upload.fields([
    { name: 'files', maxCount: 10 },
    { name: 'images', maxCount: 10 },
  ])(req, res, (err) => {
    if (err) {
      console.error('[Upload Multiple Error]', err.message);
      return res.status(400).json({ success: false, error: err.message });
    }

    const uploadedFiles = [...(req.files?.files || []), ...(req.files?.images || [])];

    if (!uploadedFiles.length) {
      return res.status(400).json({ success: false, error: 'لم يتم إرسال أي ملفات صور.' });
    }

    const urls = uploadedFiles.map((f) =>
      f.path && f.path.startsWith('http') ? f.path : `/uploads/${f.filename}`
    );

    return res.status(200).json({
      success: true,
      urls,
      count: urls.length,
    });
  });
});

module.exports = router;
