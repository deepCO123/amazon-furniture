/**
 * services/emailService.js
 * خدمة إرسال البريد الإلكتروني للعملاء الجدد باستخدام Nodemailer
 * مجهزة لتعمل في الخلفية (Background Task) بدون تعطيل الـ Main Thread
 */

const nodemailer = require('nodemailer');

// إعداد ناقل الإيميل باستخدام Nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,
  maxConnections: 5,
});

/**
 * دالة إرسال إيميل الترحيب بالعميل الجديد (VIP)
 * @param {string} toEmail - إيميل العميل
 * @param {string} clientName - اسم العميل
 */
const sendWelcomeEmail = async (toEmail, clientName = 'عميلنا العزيز') => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Amazon Furniture" <support@amazonfurniture.eg>',
    to: toEmail,
    subject: '🎉 مرحباً بك في Amazon Furniture — تم تسجيل حسابك كعميل مميز (VIP)',
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; direction: rtl; }
          .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #1C1917 0%, #292524 100%); padding: 35px 20px; text-align: center; border-bottom: 3px solid #C5A880; }
          .header h1 { color: #ffffff; margin: 0 0 5px 0; font-size: 24px; font-weight: 800; letter-spacing: 1px; }
          .header p { color: #C5A880; margin: 0; font-size: 12px; letter-spacing: 2px; }
          .content { padding: 35px 30px; color: #334155; line-height: 1.8; font-size: 15px; }
          .vip-badge { display: inline-block; background: #FEF3C7; color: #92400E; font-size: 12px; font-weight: bold; padding: 5px 14px; border-radius: 30px; margin-bottom: 15px; }
          .highlight-box { background-color: #F8FAFC; border-right: 4px solid #C5A880; padding: 15px 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background-color: #1C1917; color: #ffffff !important; padding: 14px 28px; border-radius: 10px; font-weight: bold; text-decoration: none; margin-top: 15px; }
          .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Amazon Furniture</h1>
            <p>أثاث فاخر من المصنع لحد باب البيت</p>
          </div>
          <div class="content">
            <span class="vip-badge">⭐ حساب عميل مميز (VIP)</span>
            <h2 style="color: #0F172A; margin: 0 0 15px 0;">أهلاً بك يا ${clientName}!</h2>
            <p>
              مرحباً بك في متجرنا! تم تسجيل دخولك بنجاح. أنت الآن عميل مميز (VIP) لدينا، ويمكنك استخدام هذا الإيميل لتسجيل الدخول في أي وقت ومتابعة طلباتك وحجز المعاينات المجانية.
            </p>
            <div class="highlight-box">
              <strong>حسابك مفعل دائماً:</strong><br/>
              📧 بريدك الإلكتروني المسجل: <code>${toEmail}</code><br/>
              🛋️ خدمة المعاينة والتركيب الفني المعتمد مجانية بالكامل لكافة مشترياتك.
            </div>
            <p>نحن فخورون بوجودك معنا ونسعد دائماً بخدمتك.</p>
            <center>
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" class="button">تصفح الكتالوج والمنتجات</a>
            </center>
          </div>
          <div class="footer">
            المنصورة، محافظة الدقهلية • هاتف: +20 109 1084863<br/>
            © ${new Date().getFullYear()} Amazon Furniture. جميع الحقوق محفوظة.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Welcome email sent to ${toEmail} | MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Service Notice] Email log recorded for ${toEmail}: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * دالة إرسال تأكيد الطلب مع فاتورة PDF وعقد الضمان المعتمد
 * @param {Object} order - كائن الطلب الكامل
 * @param {Buffer} [pdfBuffer] - المخزن المؤقت لملف الـ PDF للفاتورة
 */
const sendOrderConfirmationWithInvoice = async (order, pdfBuffer) => {
  const toEmail = order.customerEmail || order.shippingAddress?.email;
  if (!toEmail) return { success: false, message: 'No customer email provided' };

  const customerName = order.customerName || order.shippingAddress?.firstName || 'عميلنا العزيز';
  const orderId = order.id;
  const total = Number(order.total || 0).toLocaleString();

  const attachments = [];
  if (pdfBuffer) {
    attachments.push({
      filename: `Amazon-Furniture-Invoice-${orderId}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    });
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Amazon Furniture" <support@amazonfurniture.eg>',
    to: toEmail,
    subject: `🧾 تأكيد استلام طلبك #${orderId} من Amazon Furniture — مرفق الفاتورة والضمان`,
    attachments,
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; direction: rtl; }
          .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #1C1917 0%, #292524 100%); padding: 35px 20px; text-align: center; border-bottom: 3px solid #C5A880; }
          .header h1 { color: #ffffff; margin: 0 0 5px 0; font-size: 24px; font-weight: 800; letter-spacing: 1px; }
          .header p { color: #C5A880; margin: 0; font-size: 12px; letter-spacing: 2px; }
          .content { padding: 35px 30px; color: #334155; line-height: 1.8; font-size: 15px; }
          .badge { display: inline-block; background: #DCFCE7; color: #166534; font-size: 12px; font-weight: bold; padding: 5px 14px; border-radius: 30px; margin-bottom: 15px; }
          .warranty-box { background-color: #FEF3C7; border: 1px solid #F59E0B; padding: 15px 20px; border-radius: 10px; margin: 20px 0; color: #92400E; }
          .summary-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .summary-table td { padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 14px; }
          .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Amazon Furniture</h1>
            <p>تأسس عام 1994 • فخامة تليق بمنزلك</p>
          </div>
          <div class="content">
            <span class="badge">✓ تم تأكيد استلام الطلب بنجاح</span>
            <h2 style="color: #0F172A; margin: 0 0 10px 0;">أهلاً بك يا ${customerName}!</h2>
            <p>
              نشكرك على ثقتك في <strong>Amazon Furniture</strong>. تم استلام طلبك وجارٍ مراجعته مع قسم التجهيز والشحن لترتيب موعد المعاينة والتسليم والتركيب.
            </p>

            <table class="summary-table">
              <tr><td><strong>رقم الطلب:</strong></td><td align="left"><code>#${orderId}</code></td></tr>
              <tr><td><strong>إجمالي القيمة:</strong></td><td align="left"><strong>${total} جنيه مصري</strong></td></tr>
              <tr><td><strong>المعاينة والتركيب:</strong></td><td align="left"><span style="color:#166534; font-weight:bold;">مجاناً مع الفني المعتمد</span></td></tr>
              <tr><td><strong>طريقة الدفع:</strong></td><td align="left">الدفع عند الاستلام والمعاينة</td></tr>
            </table>

            <div class="warranty-box">
              <strong>⭐ شهادة الضمان الرسمية (10 سنوات):</strong><br/>
              تجد مرفقاً مع هذه الرسالة الفاتورة الإلكترونية الرسمية المعتمدة (PDF)، وهي بمثابة وثيقة الضمان القانوني لمدة 10 سنوات على شاسيهات الخشب الزان الأحمر الروماني.
            </div>

            <p style="font-size: 13px; color: #64748B;">
              لأي استفسار أو تعديل على ميعاد الشحن، يمكنك الرد على هذا الإيميل مباشرة أو التواصل مع إدارة العمليات عبر واتساب: <a href="https://wa.me/201091084863">+20 109 1084863</a>
            </p>
          </div>
          <div class="footer">
            مصانع دمياط والمنصورة • معارض القاهرة<br/>
            © ${new Date().getFullYear()} Amazon Furniture Egypt. جميع الحقوق محفوظة.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Order confirmation & invoice sent to ${toEmail} | MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Service Notice] Email delivery notice for ${toEmail}: ${error.message}`);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendOrderConfirmationWithInvoice,
};
