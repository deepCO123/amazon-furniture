/**
 * routes/adminRoutes.js
 * مسارات لوحة الإدارة المحمية وإحصائيات الداشبورد (RBAC: Admin Only)
 */

const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middlewares/auth');

// حماية كافة مسارات الأدمن عبر الـ Middleware
router.use(verifyToken, checkRole('admin'));

/**
 * @route   GET /api/admin/dashboard
 * @desc    جلب إحصائيات لوحة التحكم والنشاط الأخير للأدمن
 * @access  Private (Admin Only)
 */
router.get('/dashboard', (req, res) => {
  const stats = {
    success: true,
    totalOrders: 142,
    pendingOrders: 18,
    totalRevenue: 3450000,
    newUsers: 85,
    recentActivity: [
      {
        id: 'act_1',
        action: 'طلب جديد #AF-1049',
        customer: 'أحمد محمود',
        amount: 45000,
        timestamp: new Date().toISOString(),
      },
      {
        id: 'act_2',
        action: 'حجز معاينة هندسية #CON-202',
        customer: 'سارة إبراهيم',
        city: 'المنصورة',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'act_3',
        action: 'طلب عرض أسعار شركات #QUO-88',
        company: 'مجموعة النيل للاستثمار',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
    ],
  };

  return res.status(200).json(stats);
});

module.exports = router;
