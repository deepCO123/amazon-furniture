/**
 * routes/adminRoutes.js
 * مسارات لوحة الإدارة المحمية وإحصائيات الداشبورد (RBAC: Admin Only)
 */

const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middlewares/auth');

const jsonCache = require('../services/jsonCache');

// حماية كافة مسارات الأدمن عبر الـ Middleware
router.use(verifyToken, checkRole('admin'));

/**
 * @route   GET /api/admin/dashboard
 * @desc    جلب إحصائيات لوحة التحكم والنشاط الفعلي للأدمن محسوبة ديناميكياً من الصفر
 * @access  Private (Admin Only)
 */
router.get('/dashboard', async (req, res) => {
  try {
    const orders = await jsonCache.read('orders.json', []);
    const customers = await jsonCache.read('customers.json', []);
    const products = await jsonCache.read('products.json', []);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(
      (o) => o.status === 'pending' || o.status === 'processing'
    ).length;
    const totalRevenue = orders.reduce(
      (sum, o) => sum + (Number(o.total) || 0),
      0
    );
    const newUsers = customers.length;
    const totalProducts = products.length;

    // سجل الأنشطة الأخيرة مستخرج من الطلبات الفعلية
    const recentActivity = orders.slice(0, 10).map((o) => ({
      id: `act_${o.id}`,
      action: `طلب جديد #${o.id}`,
      customer: o.customerName || 'عميل المتجر',
      amount: o.total || 0,
      timestamp: o.createdAt || o.date || new Date().toISOString(),
    }));

    return res.status(200).json({
      success: true,
      totalOrders,
      pendingOrders,
      totalRevenue,
      newUsers,
      totalProducts,
      recentActivity,
    });
  } catch (error) {
    console.error('Error computing admin dashboard stats:', error);
    return res.status(500).json({ error: 'Failed to compute dashboard stats' });
  }
});

module.exports = router;
