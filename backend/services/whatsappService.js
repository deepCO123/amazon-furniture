/**
 * backend/services/whatsappService.js
 * خدمة إرسال إشعارات الواتساب الرسمية عبر Meta WhatsApp Cloud API
 * مع حماية من الفشل (Fault-Tolerant Outbox) ومنع تسريب أرقام الهواتف في الـ Logs
 */

class WhatsAppService {
  isConfigured() {
    return Boolean(
      process.env.WHATSAPP_TOKEN &&
      process.env.WHATSAPP_PHONE_ID
    );
  }

  /**
   * تشفير/حجب رقم الهاتف في الـ Logs لحماية الخصوصية
   */
  maskPhone(phone) {
    if (!phone || typeof phone !== 'string') return '***';
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length < 6) return '***';
    return clean.slice(0, 3) + '****' + clean.slice(-3);
  }

  /**
   * إرسال رسالة تأكيد الطلب للعميل
   * @param {Object} order كائن الطلب
   */
  async sendOrderConfirmation(order) {
    const rawPhone = order.customerPhone || order.shippingAddress?.phone;
    if (!rawPhone) {
      return { success: false, error: 'No phone number provided' };
    }

    // تنظيف رقم الهاتف (كود مصر الافتراضي +20)
    let cleanPhone = String(rawPhone).replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '20' + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith('20') && cleanPhone.length === 10) {
      cleanPhone = '20' + cleanPhone;
    }

    const orderId = order.id;
    const total = Number(order.total || 0).toLocaleString();
    const customerName = order.customerName || 'عميلنا العزيز';
    const siteUrl = process.env.CLIENT_URL || 'https://amazonfurniture.eg';
    const trackingUrl = `${siteUrl}/track?orderId=${encodeURIComponent(orderId)}`;

    // 1. إذا كانت Meta Cloud API مهيأة
    if (this.isConfigured()) {
      try {
        const phoneId = process.env.WHATSAPP_PHONE_ID;
        const token = process.env.WHATSAPP_TOKEN;
        const templateName = process.env.WHATSAPP_ORDER_TEMPLATE || 'order_confirmation_v1';

        const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: cleanPhone,
            type: 'template',
            template: {
              name: templateName,
              language: { code: 'ar' },
              components: [
                {
                  type: 'body',
                  parameters: [
                    { type: 'text', text: customerName },
                    { type: 'text', text: String(orderId) },
                    { type: 'text', text: `${total} ج.م` },
                    { type: 'text', text: trackingUrl },
                  ],
                },
              ],
            },
          }),
        });

        const data = await res.json();
        if (data.error) {
          console.warn(`[WhatsApp API Notice] Failed to deliver to ${this.maskPhone(cleanPhone)}:`, data.error.message);
          return { success: false, error: data.error.message };
        }

        console.log(`[WhatsApp Service] Message successfully dispatched for order #${orderId} to ${this.maskPhone(cleanPhone)}`);
        return { success: true, messageId: data.messages?.[0]?.id };
      } catch (err) {
        console.warn(`[WhatsApp Service Network Notice] ${err.message}`);
        return { success: false, error: err.message };
      }
    }

    // 2. Fallback: تسجيل الرسالة بصيغة جاهزة للواتساب
    return {
      success: true,
      provider: 'manual_fallback',
      deepLink: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `مرحباً ${customerName}، تم تأكيد طلبك #${orderId} من Amazon Furniture بإجمالي ${total} ج.م.\nرابط التتبع والضمان: ${trackingUrl}`
      )}`,
    };
  }
}

module.exports = new WhatsAppService();
