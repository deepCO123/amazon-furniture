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
              🛋️ خصم ترحيبي 10% بانتظارك على طلبك القادم بكود: <code>AMZ50</code>
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

module.exports = {
  sendWelcomeEmail,
};
