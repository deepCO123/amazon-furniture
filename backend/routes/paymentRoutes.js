/**
 * backend/routes/paymentRoutes.js
 * مسارات معالجة المدفوعات الإلكترونية عبر Paymob (فيزا، ماستركارد، وميزة)
 */

const express = require('express');
const router = express.Router();
const paymobService = require('../services/paymobService');
const jsonCache = require('../services/jsonCache');

/**
 * @route   POST /api/payments/paymob/initiate
 * @desc    بدء جلسة دفع Paymob لطلب محدد
 */
router.post('/paymob/initiate', async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, error: 'رقم الطلب مطلوب لإتمام الدفع' });
    }

    const orders = await jsonCache.read('orders.json', []);
    const order = orders.find(
      (o) => String(o.id).toUpperCase() === String(orderId).toUpperCase()
    );

    if (!order) {
      return res.status(404).json({ success: false, error: 'الطلب غير موجود في النظام' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, error: 'هذا الطلب تم سداده مسبقاً' });
    }

    const result = await paymobService.createPaymentIntention(order);
    if (!result.success) {
      return res.status(502).json({ success: false, error: result.error });
    }

    res.json(result);
  } catch (err) {
    console.error('POST /api/payments/paymob/initiate error:', err);
    res.status(500).json({ success: false, error: 'حدث خطأ داخلي أثناء تهيئة بوابة الدفع' });
  }
});

/**
 * @route   POST /api/payments/paymob/webhook
 * @desc    استقبال إشعار Paymob Webhook وتأكيد الدفع المشفر بـ HMAC
 */
router.post('/paymob/webhook', async (req, res) => {
  try {
    const receivedHmac = req.query.hmac || req.headers['x-paymob-hmac'];
    const payload = req.body;

    // 1. التحقق من توقيع HMAC
    const isValid = paymobService.verifyHmac(payload, receivedHmac);
    if (!isValid) {
      console.warn('[Paymob Webhook] Unauthorized request with invalid HMAC signature.');
      return res.status(401).json({ error: 'Invalid HMAC signature' });
    }

    const obj = payload.obj || payload;
    const isSuccess = (obj.success === true || obj.success === 'true') &&
                      !(obj.pending === true || obj.pending === 'true') &&
                      !(obj.is_voided === true || obj.is_voided === 'true') &&
                      !(obj.is_refunded === true || obj.is_refunded === 'true');
    const merchantOrderId = obj.order?.merchant_order_id;

    if (!merchantOrderId) {
      return res.status(400).json({ error: 'Merchant order id missing in payload' });
    }

    // 2. إذا كانت المعاملة ناجحة، نحدّث حالة الطلب بأسلوب Idempotent
    if (isSuccess) {
      const io = req.app.get('io');
      const processResult = await paymobService.handleSuccessfulPayment(
        merchantOrderId,
        obj,
        io
      );

      return res.status(200).json({ success: true, processed: processResult });
    } else {
      console.log(`[Paymob Webhook] Transaction failed for order #${merchantOrderId}`);
      return res.status(200).json({ success: false, message: 'Transaction was not successful' });
    }
  } catch (err) {
    console.error('POST /api/payments/paymob/webhook error:', err);
    res.status(500).json({ error: 'Internal webhook error' });
  }
});

/**
 * @route   GET /api/payments/paymob/callback
 * @desc    إعادة توجيه العميل بعد انتهاء نافذة 3D Secure
 */
router.get('/paymob/callback', async (req, res) => {
  const isSuccess = req.query.success === 'true';
  const orderId = req.query.merchant_order_id;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

  if (isSuccess && orderId) {
    return res.redirect(`${clientUrl}/orders?payment=success&orderId=${encodeURIComponent(orderId)}`);
  } else {
    return res.redirect(`${clientUrl}/checkout?payment=failed&orderId=${encodeURIComponent(orderId || '')}`);
  }
});

module.exports = router;
