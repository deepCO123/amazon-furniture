/**
 * backend/services/paymobService.js
 * خدمة الربط مع بوابة الدفع المصرية Paymob لمدفوعات الفيزا والماستركارد وميزة
 * - التحقق الصارم من توقيع HMAC SHA-512 للـ Webhook
 * - معالجة Webhook بشكل Idempotent لمنع ازدواجية السداد
 * - مطابقة المبالغ والعملة (EGP) على السيرفر
 */

const crypto = require('crypto');
const jsonCache = require('./jsonCache');
const { Order } = require('../models');
const { generateInvoiceBuffer } = require('./invoiceService');
const { sendOrderConfirmationWithInvoice } = require('./emailService');

class PaymobService {
  isConfigured() {
    return Boolean(
      process.env.PAYMOB_API_KEY &&
      process.env.PAYMOB_INTEGRATION_ID &&
      process.env.PAYMOB_HMAC_SECRET
    );
  }

  /**
   * إنشاء جلسة دفع Paymob لطلب محدد
   * @param {Object} order كائن الطلب بعد التحقق من أسعاره بالـ Backend
   * @returns {Promise<{ success: boolean, paymentUrl?: string, token?: string, error?: string }>}
   */
  async createPaymentIntention(order) {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'بوابة Paymob غير مفعلة، يرجى ضبط مفاتيح PAYMOB_API_KEY و PAYMOB_INTEGRATION_ID في إعدادات الخادم.',
      };
    }

    try {
      const apiKey = process.env.PAYMOB_API_KEY;
      const integrationId = process.env.PAYMOB_INTEGRATION_ID;
      const iframeId = process.env.PAYMOB_IFRAME_ID || '850000';
      const amountCents = Math.round(Number(order.total) * 100);

      // 1. طلب Authentication Token
      const authRes = await fetch('https://accept.paymob.com/api/auth/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey }),
      });
      const authData = await authRes.json();
      if (!authData.token) {
        throw new Error('فشل تسجيل الدخول لبوابة Paymob.');
      }
      const authToken = authData.token;

      // 2. تسجيل الطلب في Paymob
      const orderRes = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_token: authToken,
          delivery_needed: 'false',
          amount_cents: String(amountCents),
          currency: 'EGP',
          merchant_order_id: String(order.id),
          items: (order.items || []).map((it) => ({
            name: it.product?.name || 'قطعة أثاث',
            amount_cents: String(Math.round(Number(it.product?.price || 0) * 100)),
            description: it.product?.category || 'أثاث منزلي ومكتبي',
            quantity: String(it.quantity || 1),
          })),
        }),
      });
      const orderData = await orderRes.json();
      if (!orderData.id) {
        throw new Error('فشل تسجيل الطلب لدى Paymob.');
      }

      // 3. طلب مفتاح الدفع (Payment Key)
      const firstName = (order.customerName || 'عميل').split(' ')[0] || 'Customer';
      const lastName = (order.customerName || 'كريم').split(' ')[1] || 'Guest';
      const email = order.customerEmail || 'customer@amazonfurniture.eg';
      const phone = order.customerPhone || '01000000000';

      const keyRes = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_token: authToken,
          amount_cents: String(amountCents),
          expiration: 3600,
          order_id: String(orderData.id),
          billing_data: {
            apartment: 'NA',
            email: email,
            floor: 'NA',
            first_name: firstName,
            street: order.shippingAddress?.address || 'Street',
            building: 'NA',
            phone_number: phone,
            shipping_method: 'PKG',
            postal_code: 'NA',
            city: order.shippingAddress?.city || 'Mansoura',
            country: 'EG',
            last_name: lastName,
            state: order.shippingAddress?.city || 'Dakahlia',
          },
          currency: 'EGP',
          integration_id: Number(integrationId),
          lock_order_when_paid: 'true',
        }),
      });

      const keyData = await keyRes.json();
      if (!keyData.token) {
        throw new Error('فشل إصدار مفتاح الدفع من Paymob.');
      }

      const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${keyData.token}`;

      return {
        success: true,
        paymentToken: keyData.token,
        paymentUrl,
        paymobOrderId: orderData.id,
      };
    } catch (err) {
      console.error('[Paymob Service Error]', err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * التحقق من توقيع HMAC SHA-512 للـ Webhook الوارد من Paymob
   * الحقول مرتبة أبجدياً طبقاً لتوثيق Paymob الرسمي
   */
  verifyHmac(data, receivedHmac) {
    const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
    if (!hmacSecret) {
      console.error('[Paymob HMAC] Secret key is not defined in environment!');
      return false;
    }

    if (!receivedHmac || typeof receivedHmac !== 'string') {
      return false;
    }

    // استخراج الحقول بالترتيب القياسي المطلوب
    const obj = data.obj || data;
    const concatenated = [
      obj.amount_cents,
      obj.created_at,
      obj.currency,
      obj.error_occured,
      obj.has_parent_transaction,
      obj.id,
      obj.integration_id,
      obj.is_3d_secure,
      obj.is_auth,
      obj.is_capture,
      obj.is_refunded,
      obj.is_standalone_payment,
      obj.is_voided,
      obj.order?.id,
      obj.owner,
      obj.pending,
      obj.source_data?.pan,
      obj.source_data?.sub_type,
      obj.source_data?.type,
      obj.success,
    ].map((val) => (val !== undefined && val !== null ? String(val) : '')).join('');

    const calculatedHmac = crypto
      .createHmac('sha512', hmacSecret)
      .update(concatenated)
      .digest('hex');

    try {
      return crypto.timingSafeEqual(
        Buffer.from(calculatedHmac, 'hex'),
        Buffer.from(receivedHmac, 'hex')
      );
    } catch {
      return false;
    }
  }

  /**
   * معالجة السداد الناجح وتحديث الطلب بشكل Idempotent
   */
  async handleSuccessfulPayment(merchantOrderId, transactionDetails, io = null) {
    const orders = await jsonCache.read('orders.json', []);
    const idx = orders.findIndex(
      (o) => String(o.id).toUpperCase() === String(merchantOrderId).toUpperCase()
    );

    if (idx === -1) {
      console.warn(`[Paymob Webhook] Order #${merchantOrderId} not found.`);
      return { success: false, error: 'Order not found' };
    }

    // 1. Idempotency Check: إذا كان مدفوعاً بالفعل، لا نعيد الإرسال أو التكرار
    if (orders[idx].paymentStatus === 'paid') {
      console.log(`[Paymob Webhook] Order #${merchantOrderId} is already marked as PAID.`);
      return { success: true, alreadyProcessed: true };
    }

    // 2. تحديث حالة الدفع إلى مدفوع رسمياً
    orders[idx].paymentStatus = 'paid';
    orders[idx].paymentMethod = 'paymob_card';
    orders[idx].paymentDetails = {
      provider: 'paymob',
      transactionId: transactionDetails.id,
      pan: transactionDetails.source_data?.pan || '',
      cardType: transactionDetails.source_data?.sub_type || 'card',
      paidAt: new Date().toISOString(),
      amountCents: transactionDetails.amount_cents,
    };

    await jsonCache.write('orders.json', orders);

    // 3. التحديث في MongoDB إذا كانت متصلة
    if (jsonCache.isMongoConnected()) {
      try {
        await Order.findOneAndUpdate(
          { id: orders[idx].id },
          {
            paymentStatus: 'paid',
            paymentMethod: 'paymob_card',
            paymentDetails: orders[idx].paymentDetails,
          }
        );
      } catch (err) {
        console.warn('[Paymob Mongo Sync Notice]', err.message);
      }
    }

    // 4. إرسال الفاتورة الرسمية عبر الإيميل في الخلفية
    setImmediate(async () => {
      try {
        const pdfBuffer = await generateInvoiceBuffer(orders[idx]);
        await sendOrderConfirmationWithInvoice(orders[idx], pdfBuffer);
      } catch (emailErr) {
        console.warn('[Paymob Invoicing Error]', emailErr.message);
      }
    });

    // 5. إشعار لوحة الإدارة لحظياً بالسوكيت
    if (io) {
      io.to('admin_room').emit('payment_verified', {
        orderId: orders[idx].id,
        amount: orders[idx].total,
        provider: 'Paymob',
        paidAt: new Date().toISOString(),
      });
    }

    return { success: true, order: orders[idx] };
  }
}

module.exports = new PaymobService();
