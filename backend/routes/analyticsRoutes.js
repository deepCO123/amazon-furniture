/**
 * backend/routes/analyticsRoutes.js
 * مسارات تحليلات الإدارة المتقدمة وذكاء المرتجعات (RBAC: Admin Only)
 */

const express = require('express');
const router = express.Router();

const { verifyToken, checkRole } = require('../middlewares/auth');
const { getReturnsIntelligence } = require('../controllers/analyticsController');

// حماية المسارات بصلاحيات الأدمن فقط
router.use(verifyToken, checkRole('admin'));

/**
 * @route   GET /api/admin/analytics/returns-intelligence
 * @desc    جلب تحليلات المرتجعات المتقدمة، تصنيف المخاطر، وتوزيع الأسباب
 * @access  Private (Admin Only)
 */
router.get('/returns-intelligence', getReturnsIntelligence);

module.exports = router;
