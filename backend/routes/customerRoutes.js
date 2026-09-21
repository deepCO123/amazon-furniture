/**
 * backend/routes/customerRoutes.js
 * مسارات إدارة العملاء (CRM) — مُرحّلة من Next.js src/app/api/customers/route.ts
 */

const express = require('express');
const router = express.Router();

const { verifyToken, checkRole } = require('../middlewares/auth');
const { Customer } = require('../models');
const jsonCache = require('../services/jsonCache');
const { sendWelcomeEmail } = require('../services/emailService');

// 1. جلب كافة العملاء مع إحصائياتهم (للأدمن فقط)
router.get('/', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const customers = await jsonCache.read('customers.json', []);
    const orders = await jsonCache.read('orders.json', []);

    // إثراء بيانات كل عميل بطلباته الفعلية
    const enriched = customers.map((c) => {
      const userOrders = orders.filter(
        (o) =>
          (o.userId && o.userId === c.id) ||
          (o.customerEmail && o.customerEmail.toLowerCase() === c.email.toLowerCase()) ||
          (o.shippingAddress?.email &&
            o.shippingAddress.email.toLowerCase() === c.email.toLowerCase())
      );

      const totalSpent = userOrders.reduce((sum, ord) => sum + (ord.total || 0), 0);

      return {
        ...c,
        ordersCount: userOrders.length,
        totalSpent: totalSpent > 0 ? totalSpent : (c.totalSpent || 0),
        orders: userOrders,
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error('GET /api/customers error:', err.message);
    res.status(500).json({ error: 'Failed to read customers' });
  }
});

// 2. إنشاء أو مزامنة عميل (يُستخدم من Google Auth و Registration)
router.post('/', async (req, res) => {
  try {
    const { name, email, avatar, phone, city, provider } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const customers = await jsonCache.read('customers.json', []);
    const existingIndex = customers.findIndex(
      (c) => c.email.toLowerCase() === normalizedEmail
    );

    let customer;
    let isNew = false;

    if (existingIndex !== -1) {
      // تحديث عميل موجود
      customer = {
        ...customers[existingIndex],
        name: name || customers[existingIndex].name,
        avatar: avatar || customers[existingIndex].avatar,
        phone: phone || customers[existingIndex].phone,
        city: city || customers[existingIndex].city,
      };
      customers[existingIndex] = customer;
    } else {
      // إنشاء عميل جديد
      isNew = true;
      customer = {
        id: `cust_${Date.now()}`,
        name: name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}&backgroundColor=c5a880`,
        phone: phone || '',
        city: city || 'القاهرة',
        createdAt: new Date().toISOString(),
        provider: provider || 'google',
        ordersCount: 0,
        totalSpent: 0,
      };
      customers.unshift(customer);

      // إرسال إيميل ترحيبي للعميل الجديد (Fire-and-Forget)
      setImmediate(() => {
        sendWelcomeEmail(customer.email, customer.name).catch((err) => {
          console.warn('[Customer Welcome Email Notice]', err.message);
        });
      });
    }

    await jsonCache.write('customers.json', customers);

    // مزامنة مع MongoDB إن كان متصلاً
    if (jsonCache.isMongoConnected()) {
      try {
        const existing = await Customer.findOne({ email: normalizedEmail });
        if (!existing) {
          await Customer.create({
            id: customer.id,
            name: customer.name,
            email: normalizedEmail,
            avatar: customer.avatar,
            phone: customer.phone,
            city: customer.city,
            provider: customer.provider || 'email',
            ordersCount: 0,
            totalSpent: 0,
          });
        } else {
          await Customer.findOneAndUpdate(
            { email: normalizedEmail },
            { name: customer.name, avatar: customer.avatar, phone: customer.phone, city: customer.city }
          );
        }
      } catch (mongoErr) {
        console.warn('[Customer MongoDB Sync Notice]', mongoErr.message);
      }
    }

    res.json({ success: true, customer, isNew });
  } catch (err) {
    console.error('POST /api/customers error:', err);
    res.status(500).json({ error: 'Failed to register customer' });
  }
});

module.exports = router;
