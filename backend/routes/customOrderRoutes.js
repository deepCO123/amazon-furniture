/**
 * backend/routes/customOrderRoutes.js
 * مسارات إدارة طلبات تفصيل وتصنيع الأثاث بمقاسات ومواصفات خاصة
 */

const express = require('express');
const router = express.Router();

const { verifyToken, checkRole } = require('../middlewares/auth');
const { CustomOrder } = require('../models');
const jsonCache = require('../services/jsonCache');

// ─── 1. جلب كافة طلبات التفصيل (للأدمن فقط) ─────────────────────
router.get('/', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const list = await jsonCache.read('custom_orders.json', []);
    res.json(list);
  } catch (err) {
    console.error('GET /api/custom-orders error:', err.message);
    res.status(500).json({ error: 'Failed to read custom orders' });
  }
});

// ─── 2. إنشاء طلب تفصيل جديد (عام متاح لجميع العملاء) ───────────
router.post('/', async (req, res) => {
  try {
    const body = req.body;
    const {
      customerName,
      customerPhone,
      customerEmail,
      city,
      address,
      furnitureType,
      dimensions,
      preferredMaterial,
      preferredColor,
      notes,
      referenceImage,
    } = body;

    if (!customerName || !customerPhone || !furnitureType) {
      return res.status(400).json({
        error: 'يرجى إدخال اسم العميل ورقم الهاتف ونوع القطعة المطلوب تفصيلها.',
      });
    }

    const orderId = `CST-${Math.floor(100000 + Math.random() * 900000)}`;

    const newCustomOrder = {
      id: orderId,
      customerName: String(customerName).trim(),
      customerPhone: String(customerPhone).trim(),
      customerEmail: String(customerEmail || '').trim().toLowerCase(),
      city: String(city || '').trim(),
      address: String(address || '').trim(),
      furnitureType: String(furnitureType).trim(),
      dimensions: {
        length: dimensions?.length || '',
        width: dimensions?.width || '',
        height: dimensions?.height || '',
        shape: dimensions?.shape || '',
      },
      preferredMaterial: preferredMaterial || '',
      preferredColor: preferredColor || '',
      notes: notes || '',
      referenceImage: referenceImage || '',
      status: 'new',
      quotePrice: 0,
      adminNotes: '',
      createdAt: new Date().toISOString(),
    };

    // 1. الحفظ في MongoDB إذا كانت متصلة
    if (jsonCache.isMongoConnected()) {
      try {
        await CustomOrder.create(newCustomOrder);
      } catch (dbErr) {
        console.warn('[CustomOrder Mongo Notice]', dbErr.message);
      }
    }

    // 2. الحفظ في الكاش السريع JSON
    const list = await jsonCache.read('custom_orders.json', []);
    list.unshift(newCustomOrder);
    await jsonCache.write('custom_orders.json', list);

    // 3. إشعار لوحة الإدارة لحظياً عبر Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('new_custom_order', {
        id: orderId,
        customerName: newCustomOrder.customerName,
        customerPhone: newCustomOrder.customerPhone,
        furnitureType: newCustomOrder.furnitureType,
        referenceImage: newCustomOrder.referenceImage,
        createdAt: newCustomOrder.createdAt,
      });
    }

    res.status(201).json({
      success: true,
      customOrder: newCustomOrder,
      message: 'تم استلام طلب التفصيل بنجاح، سيقوم فريق المهندسين بالتواصل معك خلال ساعات.',
    });
  } catch (err) {
    console.error('POST /api/custom-orders error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء إرسال طلب التفصيل' });
  }
});

// ─── 3. تحديث حالة وسعر عرض السعر لطلب التفصيل (للأدمن فقط) ─────
router.patch('/:id', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, quotePrice, adminNotes } = req.body;

    const list = await jsonCache.read('custom_orders.json', []);
    const idx = list.findIndex((o) => o.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Custom order not found' });
    }

    if (status !== undefined) list[idx].status = status;
    if (quotePrice !== undefined) list[idx].quotePrice = Number(quotePrice) || 0;
    if (adminNotes !== undefined) list[idx].adminNotes = adminNotes;

    await jsonCache.write('custom_orders.json', list);

    if (jsonCache.isMongoConnected()) {
      try {
        await CustomOrder.findOneAndUpdate(
          { id },
          {
            ...(status !== undefined && { status }),
            ...(quotePrice !== undefined && { quotePrice: Number(quotePrice) || 0 }),
            ...(adminNotes !== undefined && { adminNotes }),
          }
        );
      } catch (dbErr) {
        console.warn('CustomOrder Mongo update notice:', dbErr.message);
      }
    }

    res.json({ success: true, customOrder: list[idx] });
  } catch (err) {
    console.error('PATCH /api/custom-orders/:id error:', err);
    res.status(500).json({ error: 'Failed to update custom order' });
  }
});

// ─── 4. حذف طلب تفصيل (للأدمن فقط) ──────────────────────────────
router.delete('/:id', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const list = await jsonCache.read('custom_orders.json', []);
    const filtered = list.filter((o) => o.id !== id);
    if (filtered.length === list.length) {
      return res.status(404).json({ error: 'Custom order not found' });
    }

    await jsonCache.write('custom_orders.json', filtered);

    if (jsonCache.isMongoConnected()) {
      try {
        await CustomOrder.findOneAndDelete({ id });
      } catch (dbErr) {
        console.warn('CustomOrder Mongo delete notice:', dbErr.message);
      }
    }

    res.json({ success: true, deletedId: id });
  } catch (err) {
    console.error('DELETE /api/custom-orders/:id error:', err);
    res.status(500).json({ error: 'Failed to delete custom order' });
  }
});

module.exports = router;
