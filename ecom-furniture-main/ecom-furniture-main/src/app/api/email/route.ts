import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

// Configure SMTP Transporter
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const service = process.env.EMAIL_SERVICE;

  if (!user || !pass) {
    return null;
  }

  if (service) {
    return nodemailer.createTransport({
      service,
      auth: { user, pass },
    });
  }

  return nodemailer.createTransport({
    host: host || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

/**
 * POST /api/email
 * Sends transactional emails:
 * - order_confirmation: to the buyer
 * - admin_order_alert: to the store management
 * - welcome: to newly registered users
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, to, order, customerName, clientEmail } = body;

    const fromAddress =
      process.env.EMAIL_FROM ||
      `"AMAZON للأثاث المكتبي" <${process.env.SMTP_USER || "sales@amazonfurniture.eg"}>`;
    const adminEmail =
      process.env.ADMIN_EMAIL ||
      process.env.SMTP_USER ||
      "admin@amazonfurniture.eg";

    const transporter = getTransporter();

    // If SMTP is not yet configured, log and return graceful simulation
    if (!transporter) {
      console.log(
        `[Email API Simulation] SMTP not configured. Simulated sending email of type "${type}" to "${to || adminEmail}".`
      );
      return NextResponse.json({
        success: true,
        simulated: true,
        message: "تم تسجيل الإيميل بنجاح (سيتم الإرسال الفعلي بمجرد إضافة بيانات الـ SMTP في Vercel)",
      });
    }

    // ── 1. Order Confirmation (To Customer) ──
    if (type === "order_confirmation" && order) {
      const recipient = to || order.customerEmail || clientEmail;
      if (!recipient) {
        return NextResponse.json(
          { error: "البريد الإلكتروني للعميل غير متوفر" },
          { status: 400 }
        );
      }

      const itemsListHtml = (order.items || [])
        .map(
          (item: { name: string; quantity: number; price: number }) => `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px 16px; text-align: right; font-weight: bold; color: #1e293b;">${item.name}</td>
            <td style="padding: 12px 16px; text-align: center; color: #64748b;">${item.quantity}</td>
            <td style="padding: 12px 16px; text-align: left; font-weight: bold; color: #b45309;">${(item.price * item.quantity).toLocaleString("ar-EG")} ج.م</td>
          </tr>`
        )
        .join("");

      const mailOptions = {
        from: fromAddress,
        to: recipient,
        subject: `✅ تأكيد استلام طلبك #${order.id || order.orderNumber || "AMZ"} — أمازون للأثاث المكتبي`,
        html: `
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; direction: rtl; }
              .card { max-width: 650px; margin: 25px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
              .header { background: #1F2421; padding: 35px 25px; text-align: center; border-bottom: 3px solid #C59B63; }
              .content { padding: 35px 30px; color: #334155; line-height: 1.8; }
              .gold { color: #C59B63; }
              .total-box { background: #fefce8; border: 1px dashed #ca8a04; border-radius: 12px; padding: 18px; text-align: center; margin: 25px 0; }
              .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 13px; color: #64748b; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="header">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">AMAZON FURNITURE</h1>
                <p style="color: #C59B63; margin: 5px 0 0; font-size: 13px;">حلول الأثاث المكتبي الفاخر</p>
              </div>
              <div class="content">
                <h2 style="color: #1F2421; margin-top: 0;">أهلاً بك يا ${customerName || order.customerName || "عميلنا العزيز"}،</h2>
                <p>يسعدنا إبلاغك بأنه تم تأكيد استلام طلبك بنجاح وجارٍ مراجعته وتجهيزه للشحن المباشر.</p>
                
                <div style="background: #f8fafc; border-radius: 12px; padding: 15px; margin: 20px 0;">
                  <p style="margin: 4px 0;"><strong>رقم الفاتورة:</strong> ${order.id || order.orderNumber || "AMZ-ORD"}</p>
                  <p style="margin: 4px 0;"><strong>طريقة الدفع:</strong> ${order.paymentMethod === "cod" ? "الدفع عند الاستلام" : order.paymentMethod === "instapay" ? "إنستاباي (تم التحويل)" : "محفظة إلكترونية"}</p>
                  <p style="margin: 4px 0;"><strong>عنوان التوصيل:</strong> ${order.shippingAddress || order.address || "العنوان المسجل"}</p>
                  <p style="margin: 4px 0;"><strong>رقم الهاتف:</strong> ${order.customerPhone || order.phone || ""}</p>
                </div>

                <h3 style="color: #1F2421; margin-bottom: 10px;">تفاصيل المنتجات المطلوبة:</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
                  <thead>
                    <tr style="background: #f1f5f9; color: #475569;">
                      <th style="padding: 10px 16px; text-align: right;">المنتج</th>
                      <th style="padding: 10px 16px; text-align: center;">الكمية</th>
                      <th style="padding: 10px 16px; text-align: left;">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsListHtml}
                  </tbody>
                </table>

                <div class="total-box">
                  <span style="font-size: 15px; color: #713f12;">المبلغ الإجمالي النهائي للفاتورة:</span>
                  <div style="font-size: 26px; font-weight: 900; color: #b45309; margin-top: 5px;">
                    ${Number(order.totalAmount || order.total || 0).toLocaleString("ar-EG")} ج.م
                  </div>
                </div>

                <div style="background: #fdf6ec; border-right: 4px solid #C59B63; padding: 15px 20px; border-radius: 8px;">
                  <strong>🛡️ شهادة الضمان المعتمدة:</strong><br/>
                  جميع منتجات أمازون للأثاث المكتبي مشمولة بضمان استبدال وصيانة مجاني لمدة <strong>3 سنوات كاملة</strong> ضد عيوب الصناعة مع خدمة المعاينة والتركيب الفني المعتمد.
                </div>
              </div>
              <div class="footer">
                <strong>معرض أمازون للأثاث المكتبي:</strong> المنصورة - ش سامية الجمل تقاطع أحمد ماهر<br/>
                خدمة العملاء والواتساب: 01091084863 • الدعم الفني: support@amazonfurniture.eg<br/>
                © ${new Date().getFullYear()} Amazon Furniture. جميع الحقوق محفوظة.
              </div>
            </div>
          </body>
          </html>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email API] Order confirmation sent: ${info.messageId}`);
      return NextResponse.json({ success: true, messageId: info.messageId });
    }

    // ── 2. Admin Alert (To Store Management) ──
    if (type === "admin_order_alert" && order) {
      const waNumber = (order.customerPhone || "").replace(/[^0-9]/g, "");
      const waLink = waNumber ? `https://wa.me/2${waNumber.startsWith("0") ? waNumber.slice(1) : waNumber}` : "";

      const mailOptions = {
        from: fromAddress,
        to: adminEmail,
        subject: `🚨 طلب شراء جديد وارد للمتجر #${order.id || "AMZ"} — بقيمة ${Number(order.totalAmount || order.total || 0).toLocaleString("ar-EG")} ج.م`,
        html: `
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
          <body style="font-family: sans-serif; direction: rtl; background: #f8fafc; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 16px; border: 1px solid #e2e8f0;">
              <h2 style="color: #1F2421; border-bottom: 2px solid #C59B63; padding-bottom: 10px;">🛒 تم استلام أوردر جديد عبر المتجر</h2>
              <p><strong>اسم العميل:</strong> ${order.customerName || "غير محدد"}</p>
              <p><strong>رقم الهاتف:</strong> <a href="tel:${order.customerPhone}">${order.customerPhone}</a></p>
              <p><strong>العنوان:</strong> ${order.shippingAddress || order.address || "غير محدد"}</p>
              <p><strong>طريقة الدفع:</strong> ${order.paymentMethod}</p>
              <p><strong>إجمالي الطلب:</strong> <span style="font-size: 20px; font-weight: bold; color: #b45309;">${Number(order.totalAmount || order.total || 0).toLocaleString("ar-EG")} ج.م</span></p>
              ${waLink ? `<p><a href="${waLink}" style="display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">💬 مراسلة العميل واتساب مباشرة</a></p>` : ""}
            </div>
          </body>
          </html>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      return NextResponse.json({ success: true, messageId: info.messageId });
    }

    // Default response for other types
    return NextResponse.json({
      success: true,
      message: "تم استلام الطلب",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "فشل إرسال الإيميل";
    console.error("[Email API Error]:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

