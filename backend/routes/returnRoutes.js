/**
 * backend/routes/returnRoutes.js
 * مسارات إدارة طلبات الاستبدال والاسترجاع — مُرحّلة من Next.js
 */

const express = require('express');
const router = express.Router();

const { verifyToken, checkRole } = require('../middlewares/auth');
const jsonCache = require('../services/jsonCache');

// 1. جلب كافة طلبات الاسترجاع (للأدمن فقط)
router.get('/', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const returns = await jsonCache.read('returns.json', []);
    res.json(returns);
  } catch (err) {
    console.error('GET /api/returns error:', err.message);
    res.status(500).json({ error: 'Failed to read returns' });
  }
});

// 2. إنشاء طلب استرجاع جديد (عام)
router.post('/', async (req, res) => {
  try {
    const body = req.body;
    const { orderId, customerName, customerPhone, productName, productId, price, reason, reasonDetails, images } = body;

    if (!orderId || !customerName || !productName) {
      return res.status(400).json({ error: 'Missing required return fields' });
    }

    const returns = await jsonCache.read('returns.json', []);
    const newReturn = {
      id: `RET-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId,
      customerName,
      customerPhone: customerPhone || '',
      productName,
      productId,
      price: Number(price) || 0,
      reason: reason || 'other',
      reasonDetails: reasonDetails || '',
      images: images || [],
      status: 'pending_review',
      createdAt: new Date().toISOString(),
    };

    returns.unshift(newReturn);
    await jsonCache.write('returns.json', returns);

    res.status(201).json({ success: true, returnRequest: newReturn });
  } catch (err) {
    console.error('POST /api/returns error:', err);
    res.status(500).json({ error: 'Failed to create return' });
  }
});

// 3. تحديث حالة طلب الاسترجاع (للأدمن فقط)
router.patch('/', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const { returnId, status, conditionAssessment, refundAmount } = req.body;
    if (!returnId || !status) return res.status(400).json({ error: 'Missing required fields' });

    const items = await jsonCache.read('returns.json', []);
    const idx = items.findIndex((r) => r.id === returnId);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });

    items[idx].status = status;
    if (conditionAssessment) items[idx].conditionAssessment = conditionAssessment;
    if (refundAmount !== undefined) items[idx].refundAmount = Number(refundAmount);

    await jsonCache.write('returns.json', items);
    res.json({ success: true, returnRequest: items[idx] });
  } catch (err) {
    console.error('PATCH /api/returns error:', err);
    res.status(500).json({ error: 'Failed to update return' });
  }
});

module.exports = router;
