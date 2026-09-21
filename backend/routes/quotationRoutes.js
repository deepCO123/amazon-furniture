/**
 * backend/routes/quotationRoutes.js
 * مسارات إدارة عروض الأسعار — مُرحّلة من Next.js
 */

const express = require('express');
const router = express.Router();

const { verifyToken, checkRole } = require('../middlewares/auth');
const jsonCache = require('../services/jsonCache');

// 1. جلب كافة عروض الأسعار (للأدمن فقط)
router.get('/', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const quotations = await jsonCache.read('quotations.json', []);
    res.json(quotations);
  } catch (err) {
    console.error('GET /api/quotations error:', err.message);
    res.status(500).json({ error: 'Failed to read quotations' });
  }
});

// 2. إنشاء عرض سعر جديد (عام)
router.post('/', async (req, res) => {
  try {
    const body = req.body;
    const { customerName, customerPhone, customerEmail, companyName, city, items, subtotal, discount, tax, total, validUntil, notes } = body;

    if (!customerName || !items || !items.length) {
      return res.status(400).json({ error: 'Customer name and items are required' });
    }

    const quotations = await jsonCache.read('quotations.json', []);
    const newQuotation = {
      id: `QOT-${new Date().getFullYear()}-${String(quotations.length + 1).padStart(3, '0')}`,
      customerName,
      customerPhone: customerPhone || '',
      customerEmail: customerEmail || '',
      companyName: companyName || '',
      city: city || '',
      items,
      subtotal: Number(subtotal) || 0,
      discount: Number(discount) || 0,
      tax: Number(tax) || 0,
      total: Number(total) || 0,
      validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: notes || '',
      status: 'draft',
      createdAt: new Date().toISOString(),
    };

    quotations.unshift(newQuotation);
    await jsonCache.write('quotations.json', quotations);

    res.status(201).json({ success: true, quotation: newQuotation });
  } catch (err) {
    console.error('POST /api/quotations error:', err);
    res.status(500).json({ error: 'Failed to create quotation' });
  }
});

// 3. حذف عرض سعر (للأدمن فقط)
router.delete('/', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: 'ID is required' });

    const items = await jsonCache.read('quotations.json', []);
    const filtered = items.filter((q) => q.id !== id);
    await jsonCache.write('quotations.json', filtered);

    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/quotations error:', err);
    res.status(500).json({ error: 'Failed to delete quotation' });
  }
});

module.exports = router;
