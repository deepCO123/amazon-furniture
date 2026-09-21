/**
 * backend/routes/consultationRoutes.js
 * مسارات حجز الاستشارات والمعاينات — مُرحّلة من Next.js
 */

const express = require('express');
const router = express.Router();

const { verifyToken, checkRole } = require('../middlewares/auth');
const jsonCache = require('../services/jsonCache');

// 1. جلب كافة المعاينات (للأدمن فقط)
router.get('/', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const consultations = await jsonCache.read('consultations.json', []);
    res.json(consultations);
  } catch (err) {
    console.error('GET /api/consultations error:', err.message);
    res.status(500).json({ error: 'Failed to load consultations' });
  }
});

// 2. إنشاء حجز معاينة جديد (عام)
router.post('/', async (req, res) => {
  try {
    const body = req.body;
    const consultations = await jsonCache.read('consultations.json', []);

    const newBooking = {
      id: `CNS-${Date.now().toString().slice(-6)}`,
      fullName: body.fullName || 'عميل كريم',
      phone: body.phone || '',
      consultType: body.consultType || 'mansoura',
      address: body.address || '',
      googleMapsUrl: body.googleMapsUrl || '',
      spaceType: body.spaceType || 'شركة ومكاتب إدارية',
      preferredTime: body.preferredTime || 'في أقرب وقت',
      notes: body.notes || '',
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    consultations.unshift(newBooking);
    await jsonCache.write('consultations.json', consultations);

    res.status(201).json({ success: true, booking: newBooking });
  } catch (err) {
    console.error('POST /api/consultations error:', err);
    res.status(500).json({ error: 'Failed to create consultation booking' });
  }
});

// 3. تحديث حالة المعاينة (للأدمن فقط)
router.patch('/', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id || !status) return res.status(400).json({ error: 'Missing fields' });

    const items = await jsonCache.read('consultations.json', []);
    const idx = items.findIndex((c) => c.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });

    items[idx].status = status;
    await jsonCache.write('consultations.json', items);

    res.json({ success: true, booking: items[idx] });
  } catch (err) {
    console.error('PATCH /api/consultations error:', err);
    res.status(500).json({ error: 'Failed to update consultation' });
  }
});

module.exports = router;
