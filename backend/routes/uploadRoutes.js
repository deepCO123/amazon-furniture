/**
 * routes/uploadRoutes.js
 * مسار رفع الصور والوسائط إلى Cloudinary مع التحويل التلقائي لصيغة WebP
 */

const express = require('express');
const router = express.Router();
const { uploadSingle, uploadArray } = require('../middlewares/upload');

/**
 * @route   POST /api/upload/single
 * @desc    رفع صورة واحدة وإرجاع الرابط السحابي WebP
 * @access  Public
 */
router.post('/single', (req, res) => {
  uploadSingle('image')(req, res, (err) => {
    if (err) {
      console.error('[Upload Error]', err.message);
      return res.status(400).json({ success: false, error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'لم يتم إرسال أي ملف صورة.' });
    }

    // req.file.path يحتوي على الرابط الآمن من Cloudinary
    return res.status(200).json({
      success: true,
      url: req.file.path,
      format: req.file.format || 'webp',
      filename: req.file.filename,
    });
  });
});

/**
 * @route   POST /api/upload/multiple
 * @desc    رفع عدة صور دفعة واحدة (حد أقصى 5)
 * @access  Public
 */
router.post('/multiple', (req, res) => {
  uploadArray('images', 5)(req, res, (err) => {
    if (err) {
      console.error('[Upload Multiple Error]', err.message);
      return res.status(400).json({ success: false, error: err.message });
    }

    if (!req.files || !req.files.length) {
      return res.status(400).json({ success: false, error: 'لم يتم إرسال أي ملفات صور.' });
    }

    const urls = req.files.map((f) => f.path);

    return res.status(200).json({
      success: true,
      urls,
      count: urls.length,
    });
  });
});

module.exports = router;
