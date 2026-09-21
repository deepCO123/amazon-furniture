/**
 * backend/routes/emailRoutes.js
 * مسارات إدارة البريد الإلكتروني وسجلات الإيميلات — مُرحّلة من Next.js
 */

const express = require('express');
const router = express.Router();

const { verifyToken, checkRole } = require('../middlewares/auth');
const jsonCache = require('../services/jsonCache');
const nodemailer = require('nodemailer');

// إعداد ناقل الإيميل
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    pool: true,
    maxConnections: 5,
  });
}

// ─── قوالب HTML ─────────────────────────────────────

function generateWelcomeEmailHtml(name) {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="utf-8"><title>مرحباً بك في Amazon Furniture</title></head>
<body style="margin:0;padding:0;background-color:#F8F9FA;font-family:'Cairo',Tahoma,Arial,sans-serif;color:#1E293B;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F8F9FA;padding:30px 15px;">
    <tr><td align="center">
      <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.06);border:1px solid #E2E8F0;">
        <tr><td align="center" style="background:linear-gradient(135deg, #1C1917 0%, #292524 100%);padding:35px 20px;border-bottom:3px solid #C5A880;">
          <h1 style="color:#ffffff;font-size:26px;margin:0 0 6px 0;font-weight:800;letter-spacing:1px;">Amazon Furniture</h1>
          <p style="color:#C5A880;font-size:12px;margin:0;letter-spacing:2px;text-transform:uppercase;">تأسس عام 1994 • فخامة تليق بمنزلك</p>
        </td></tr>
        <tr><td style="padding:40px 35px;text-align:right;">
          <div style="display:inline-block;background-color:#FEF3C7;color:#92400E;font-size:12px;font-weight:bold;padding:4px 12px;border-radius:20px;margin-bottom:15px;">⭐ عميل مميز ومرحب به دائماً</div>
          <h2 style="color:#0F172A;font-size:22px;margin:0 0 15px 0;font-weight:bold;">أهلاً بك يا أستاذ ${name} في عائلة Amazon Furniture!</h2>
          <p style="color:#475569;font-size:15px;line-height:1.8;margin:0 0 20px 0;">يسعدنا ويشرفنا انضمامك إلينا. في <strong>Amazon Furniture</strong>، نحرص منذ أكثر من 30 عاماً على تصميم وتنفيذ أرقى قطع الأثاث الكلاسيكي والمودرن بأجود أنواع الأخشاب الطبيعية.</p>
          <table border="0" cellspacing="0" cellpadding="0" style="margin:25px auto;">
            <tr><td align="center" style="border-radius:12px;background-color:#25D366;">
              <a href="https://wa.me/201091084863" target="_blank" style="font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;padding:14px 28px;display:inline-block;border-radius:12px;">تواصل مباشرة مع المعرض عبر واتساب 💬</a>
            </td></tr>
          </table>
          <div style="border-top:1px solid #E2E8F0;padding-top:20px;margin-top:30px;">
            <p style="color:#64748B;font-size:12px;margin:0 0 4px 0;">مع أطيب تحياتنا وتقديرنا،</p>
            <p style="color:#0F172A;font-size:15px;font-weight:bold;margin:0 0 2px 0;">أ. محمد إسماعيل</p>
            <p style="color:#C5A880;font-size:12px;font-weight:bold;margin:0;">المدير العام • Amazon Furniture (+20 109 1084863)</p>
          </div>
        </td></tr>
        <tr><td align="center" style="background-color:#0F172A;padding:20px;color:#94A3B8;font-size:11px;">
          <p style="margin:0 0 5px 0;">Amazon Furniture — تأسس عام 1994 • دمياط والقاهرة، مصر</p>
          <p style="margin:0;">هذا الإيميل تم إرساله تلقائياً لتأكيد تسجيل حسابك في المتجر الرسمي.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function generateAdminNewUserNotificationHtml(data) {
  const formattedDate = data.date || new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' });
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="utf-8"><title>إشعار بتسجيل عميل جديد</title></head>
<body style="margin:0;padding:0;background-color:#0F172A;font-family:'Cairo',Tahoma,Arial,sans-serif;color:#E2E8F0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0F172A;padding:30px 15px;">
    <tr><td align="center">
      <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color:#1E293B;border-radius:18px;overflow:hidden;box-shadow:0 15px 35px rgba(0,0,0,0.4);border:1px solid #334155;">
        <tr><td align="center" style="background:linear-gradient(135deg, #1C1917 0%, #292524 100%);padding:30px 20px;border-bottom:3px solid #C5A880;">
          <h1 style="color:#ffffff;font-size:24px;margin:0 0 4px 0;font-weight:800;">Amazon Furniture</h1>
          <p style="color:#C5A880;font-size:12px;margin:0;letter-spacing:2px;font-weight:bold;">🔔 إشعار إداري فوري — عميل جديد انضم للمتجر</p>
        </td></tr>
        <tr><td style="padding:35px 30px;text-align:right;">
          <div style="background-color:#064E3B;border:1px solid #059669;border-radius:12px;padding:14px 18px;margin-bottom:20px;">
            <p style="color:#A7F3D0;font-size:14px;font-weight:bold;margin:0;">🎉 تم تسجيل حساب عميل جديد بنجاح في متجرك الإلكتروني!</p>
          </div>
          <h2 style="color:#FFFFFF;font-size:18px;margin:0 0 15px 0;font-weight:bold;">📋 تفاصيل بيانات العميل الجديد:</h2>
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0F172A;border-radius:12px;padding:16px 20px;border:1px solid #334155;margin-bottom:20px;">
            <tr><td style="padding:10px 0;color:#94A3B8;font-size:13px;width:140px;border-bottom:1px solid #1E293B;">👤 اسم العميل:</td><td style="padding:10px 0;color:#FFFFFF;font-size:15px;font-weight:bold;border-bottom:1px solid #1E293B;">${data.name}</td></tr>
            <tr><td style="padding:10px 0;color:#94A3B8;font-size:13px;border-bottom:1px solid #1E293B;">📧 البريد الإلكتروني:</td><td style="padding:10px 0;color:#38BDF8;font-size:14px;font-weight:bold;border-bottom:1px solid #1E293B;">${data.email}</td></tr>
            <tr><td style="padding:10px 0;color:#94A3B8;font-size:13px;border-bottom:1px solid #1E293B;">📱 رقم الهاتف:</td><td style="padding:10px 0;color:#4ADE80;font-size:14px;font-weight:bold;border-bottom:1px solid #1E293B;">${data.phone || 'غير مسجل حالياً'}</td></tr>
            <tr><td style="padding:10px 0;color:#94A3B8;font-size:13px;border-bottom:1px solid #1E293B;">📍 المدينة:</td><td style="padding:10px 0;color:#FFFFFF;font-size:14px;border-bottom:1px solid #1E293B;">${data.city || 'المنصورة'}</td></tr>
            <tr><td style="padding:10px 0;color:#94A3B8;font-size:13px;border-bottom:1px solid #1E293B;">⏰ وقت التسجيل:</td><td style="padding:10px 0;color:#FCD34D;font-size:13px;border-bottom:1px solid #1E293B;">${formattedDate}</td></tr>
            <tr><td style="padding:10px 0;color:#94A3B8;font-size:13px;">🌐 وسيلة التسجيل:</td><td style="padding:10px 0;color:#CBD5E1;font-size:13px;">${data.provider === 'google' ? 'حساب Google السريع' : 'البريد الإلكتروني الشخصي'}</td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// ─── المسارات ─────────────────────────────────────

// 1. جلب سجلات الإيميلات (للأدمن فقط)
router.get('/', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const emails = await jsonCache.read('emails.json', []);
    res.json(emails);
  } catch (err) {
    console.error('GET /api/emails error:', err.message);
    res.status(500).json({ error: 'Failed to read emails' });
  }
});

// 2. إرسال إيميل (ترحيبي / تأكيد طلب / إشعار إداري)
router.post('/', async (req, res) => {
  try {
    const { type, to, recipientName, customerData, orderId, items, total, phone, address, city, notes } = req.body;

    if (!to || !recipientName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let subject = '';
    let htmlContent = '';

    if (type === 'WELCOME') {
      subject = `مرحباً بك في Amazon Furniture — أنت الآن عميلنا المميز! ⭐`;
      htmlContent = generateWelcomeEmailHtml(recipientName);
    } else if (type === 'NEW_USER_ADMIN_ALERT') {
      const clientName = customerData?.name || recipientName;
      subject = `🔔 عميل جديد سجل في متجر Amazon Furniture: ${clientName} (${customerData?.email || ''})`;
      htmlContent = generateAdminNewUserNotificationHtml({
        name: clientName,
        email: customerData?.email || to,
        phone: customerData?.phone,
        city: customerData?.city,
        provider: customerData?.provider,
        date: customerData?.date,
      });
    } else {
      return res.status(400).json({ error: 'Invalid email type' });
    }

    // حفظ في سجل الإيميلات
    const emails = await jsonCache.read('emails.json', []);
    const newEmail = {
      id: `email_${Date.now()}`,
      to,
      recipientName,
      subject,
      type,
      orderId: orderId || null,
      date: new Date().toISOString(),
      htmlContent,
    };

    emails.unshift(newEmail);
    await jsonCache.write('emails.json', emails);

    // إرسال الإيميل الفعلي عبر Nodemailer
    if (transporter) {
      setImmediate(async () => {
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_FROM || `"Amazon Furniture" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: htmlContent,
          });
        } catch (err) {
          console.warn('[Email Delivery Notice]', err.message);
        }
      });
    }

    res.json({ success: true, emailId: newEmail.id, subject, date: newEmail.date });
  } catch (err) {
    console.error('POST /api/email error:', err);
    res.status(500).json({ error: 'Failed to process email' });
  }
});

module.exports = router;
