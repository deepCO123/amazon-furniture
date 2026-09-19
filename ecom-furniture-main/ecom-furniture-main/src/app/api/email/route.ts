import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import type { EmailLog } from "@/types";

const EMAILS_FILE = path.join(process.cwd(), "src", "data", "emails.json");

async function getStoredEmails(): Promise<EmailLog[]> {
  try {
    const content = await readFile(EMAILS_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function saveStoredEmails(emails: EmailLog[]): Promise<void> {
  await writeFile(EMAILS_FILE, JSON.stringify(emails, null, 2), "utf-8");
}

function generateWelcomeEmailHtml(name: string): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>مرحباً بك في Amazon Furniture</title>
</head>
<body style="margin:0;padding:0;background-color:#F8F9FA;font-family:'Cairo',Tahoma,Arial,sans-serif;color:#1E293B;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F8F9FA;padding:30px 15px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.06);border:1px solid #E2E8F0;">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="background:linear-gradient(135deg, #1C1917 0%, #292524 100%);padding:35px 20px;border-bottom:3px solid #C5A880;">
              <h1 style="color:#ffffff;font-size:26px;margin:0 0 6px 0;font-weight:800;letter-spacing:1px;">Amazon Furniture</h1>
              <p style="color:#C5A880;font-size:12px;margin:0;letter-spacing:2px;text-transform:uppercase;">تأسس عام 1994 • فخامة تليق بمنزلك</p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:40px 35px;text-align:right;">
              <div style="display:inline-block;background-color:#FEF3C7;color:#92400E;font-size:12px;font-weight:bold;padding:4px 12px;border-radius:20px;margin-bottom:15px;">
                ⭐ عميل مميز ومرحب به دائماً
              </div>
              
              <h2 style="color:#0F172A;font-size:22px;margin:0 0 15px 0;font-weight:bold;">
                أهلاً بك يا أستاذ ${name} في عائلة Amazon Furniture!
              </h2>

              <p style="color:#475569;font-size:15px;line-height:1.8;margin:0 0 20px 0;">
                يسعدنا ويشرفنا انضمامك إلينا. في <strong>Amazon Furniture</strong>، نحرص منذ أكثر من 30 عاماً على تصميم وتنفيذ أرقى قطع الأثاث الكلاسيكي والمودرن بأجود أنواع الأخشاب الطبيعية (الزان الروماني والأرو الطبيعي) والتشطيبات الفندقية الفاخرة.
              </p>

              <!-- VIP Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F8FAFC;border-radius:14px;border:1px solid #E2E8F0;margin:25px 0;padding:20px;">
                <tr>
                  <td>
                    <h3 style="color:#0F172A;font-size:15px;margin:0 0 12px 0;font-weight:bold;">مزاياك الخاصة كعميل مميز لدينا:</h3>
                    <ul style="color:#334155;font-size:13px;line-height:2;margin:0;padding-right:20px;">
                      <li>🔧 <strong>خدمة التركيب والمعاينة مجانية بالكامل 100%</strong> داخل منزلك بواسطة فنيينا المحترفين.</li>
                      <li>🛋️ <strong>إمكانية تفصيل وتعديل أي موديل</strong> بالمقاسات والألوان ونوع الأقمشة التي تناسب بيتك.</li>
                      <li>🛡️ <strong>ضمان شامل وموثق</strong> على جودة الأخشاب والتحمل والمتانة.</li>
                      <li>💬 <strong>استشارة مباشرة وسريعة</strong> مع فريق المعرض وإدارة المبيعات على مدار اليوم.</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 25px 0;">
                يسعدنا تصفحك لأحدث تشكيلاتنا، وفي حال كان لديك أي استفسار أو رغبة في تفصيل خاص، فريقنا في خدمتك دائماً.
              </p>

              <!-- Direct WhatsApp Button -->
              <table border="0" cellspacing="0" cellpadding="0" style="margin:25px auto;">
                <tr>
                  <td align="center" style="border-radius:12px;background-color:#25D366;">
                    <a href="https://wa.me/201091084863" target="_blank" style="font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;padding:14px 28px;display:inline-block;border-radius:12px;">
                      تواصل مباشرة مع المعرض عبر واتساب 💬
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Signature -->
              <div style="border-top:1px solid #E2E8F0;padding-top:20px;margin-top:30px;">
                <p style="color:#64748B;font-size:12px;margin:0 0 4px 0;">مع أطيب تحياتنا وتقديرنا،</p>
                <p style="color:#0F172A;font-size:15px;font-weight:bold;margin:0 0 2px 0;">أ. محمد إسماعيل</p>
                <p style="color:#C5A880;font-size:12px;font-weight:bold;margin:0;">المدير العام • Amazon Furniture (+20 109 1084863)</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color:#0F172A;padding:20px;color:#94A3B8;font-size:11px;">
              <p style="margin:0 0 5px 0;">Amazon Furniture — تأسس عام 1994 • دمياط والقاهرة، مصر</p>
              <p style="margin:0;">هذا الإيميل تم إرساله تلقائياً لتأكيد تسجيل حسابك في المتجر الرسمي.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function generateOrderReceiptEmailHtml(data: {
  name: string;
  orderId: string;
  items: Array<{ name: string; quantity: number; price: number; color?: string }>;
  total: number;
  phone: string;
  address: string;
  city: string;
  notes?: string;
}): string {
  const itemsRows = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding:12px 10px;border-bottom:1px solid #E2E8F0;text-align:right;font-size:14px;color:#0F172A;font-weight:bold;">
        ${item.name} ${item.color ? `<span style="color:#64748B;font-size:11px;font-weight:normal;">(${item.color})</span>` : ""}
      </td>
      <td style="padding:12px 10px;border-bottom:1px solid #E2E8F0;text-align:center;font-size:14px;color:#475569;">
        ${item.quantity}
      </td>
      <td style="padding:12px 10px;border-bottom:1px solid #E2E8F0;text-align:left;font-size:14px;color:#0F172A;font-weight:bold;">
        ${item.price.toLocaleString("ar-EG")} ج.م
      </td>
    </tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>تأكيد طلبك رقم #${data.orderId}</title>
</head>
<body style="margin:0;padding:0;background-color:#F8F9FA;font-family:'Cairo',Tahoma,Arial,sans-serif;color:#1E293B;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F8F9FA;padding:30px 15px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.06);border:1px solid #E2E8F0;">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="background:linear-gradient(135deg, #1C1917 0%, #292524 100%);padding:35px 20px;border-bottom:3px solid #C5A880;">
              <h1 style="color:#ffffff;font-size:26px;margin:0 0 6px 0;font-weight:800;">Amazon Furniture</h1>
              <p style="color:#C5A880;font-size:12px;margin:0;letter-spacing:1.5px;">تأكيد استلام الطلب والفاتورة</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px 35px;text-align:right;">
              <div style="background-color:#ECFDF5;border:1px solid #A7F3D0;border-radius:12px;padding:16px 20px;margin-bottom:25px;">
                <p style="color:#065F46;font-size:15px;font-weight:bold;margin:0 0 4px 0;">
                  ✓ تم تسجيل طلبك بنجاح برقم: #${data.orderId}
                </p>
                <p style="color:#047857;font-size:13px;margin:0;">
                  شكراً لثقتك في Amazon Furniture. طلبك قيد المتابعة والتجهيز وسنتواصل معك قريباً.
                </p>
              </div>

              <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 20px 0;">
                عزيزنا العميل <strong>${data.name}</strong>،<br>
                تم إرسال تفاصيل طلبك إلى إدارة المعرض، وسيقوم <strong>الأستاذ محمد إسماعيل (+20 109 1084863)</strong> بالتواصل مع حضرتك هاتفياً وعبر الواتساب للاتفاق على موعد الشحن والتوصيل وطريقة الدفع المناسبة.
              </p>

              <!-- Items Table -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:20px 0;border-collapse:collapse;">
                <thead>
                  <tr style="background-color:#F1F5F9;">
                    <th style="padding:10px;text-align:right;font-size:12px;color:#475569;border-bottom:2px solid #CBD5E1;">القطعة المطلوبة</th>
                    <th style="padding:10px;text-align:center;font-size:12px;color:#475569;border-bottom:2px solid #CBD5E1;">الكمية</th>
                    <th style="padding:10px;text-align:left;font-size:12px;color:#475569;border-bottom:2px solid #CBD5E1;">السعر</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>

              <!-- Pricing summary -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F8FAFC;border-radius:12px;padding:15px 20px;margin:20px 0;border:1px solid #E2E8F0;">
                <tr>
                  <td style="padding:5px 0;color:#64748B;font-size:13px;">خدمة التركيب والمعاينة:</td>
                  <td align="left" style="padding:5px 0;color:#059669;font-weight:bold;font-size:13px;">مجاناً بالكامل 100% ✓</td>
                </tr>
                <tr>
                  <td style="padding:5px 0;color:#64748B;font-size:13px;">مصاريف الشحن والتوصيل:</td>
                  <td align="left" style="padding:5px 0;color:#B45309;font-weight:bold;font-size:13px;">يُحدد حسب العنوان والمحافظة</td>
                </tr>
                <tr style="border-top:1px solid #E2E8F0;">
                  <td style="padding:12px 0 5px 0;color:#0F172A;font-weight:bold;font-size:16px;">إجمالي المنتجات:</td>
                  <td align="left" style="padding:12px 0 5px 0;color:#0F172A;font-weight:800;font-size:18px;">
                    ${data.total.toLocaleString("ar-EG")} ج.م
                  </td>
                </tr>
              </table>

              <!-- Delivery details -->
              <div style="background-color:#FFFFFF;border:1px dashed #CBD5E1;border-radius:12px;padding:16px;margin:20px 0;font-size:13px;color:#334155;line-height:1.8;">
                <strong>📍 عنوان وبيانات التوصيل:</strong><br>
                • الهاتف / واتساب: ${data.phone}<br>
                • المدينة / المحافظة: ${data.city}<br>
                • العنوان التفصيلي: ${data.address}<br>
                ${data.notes ? `• ملاحظات إضافية: ${data.notes}<br>` : ""}
              </div>

              <!-- Button to chat -->
              <table border="0" cellspacing="0" cellpadding="0" style="margin:25px auto;">
                <tr>
                  <td align="center" style="border-radius:12px;background-color:#25D366;">
                    <a href="https://wa.me/201091084863" target="_blank" style="font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;padding:12px 24px;display:inline-block;border-radius:12px;">
                      تأكيد الطلب السريع مع أ. محمد إسماعيل 💬
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Signature -->
              <div style="border-top:1px solid #E2E8F0;padding-top:20px;margin-top:25px;">
                <p style="color:#0F172A;font-size:14px;font-weight:bold;margin:0 0 2px 0;">Amazon Furniture</p>
                <p style="color:#64748B;font-size:12px;margin:0;">خدمة العملاء والمبيعات: +20 109 1084863</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color:#0F172A;padding:20px;color:#94A3B8;font-size:11px;">
              <p style="margin:0 0 4px 0;">Amazon Furniture • خبرة وجودة منذ 1994</p>
              <p style="margin:0;">شكراً لاختيارك الأفضل لمنزلك.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function generateAdminNewUserNotificationHtml(data: {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  provider?: string;
  date?: string;
}): string {
  const formattedDate = data.date || new Date().toLocaleString("ar-EG", { timeZone: "Africa/Cairo" });
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>إشعار بتسجيل عميل جديد</title>
</head>
<body style="margin:0;padding:0;background-color:#0F172A;font-family:'Cairo',Tahoma,Arial,sans-serif;color:#E2E8F0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0F172A;padding:30px 15px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color:#1E293B;border-radius:18px;overflow:hidden;box-shadow:0 15px 35px rgba(0,0,0,0.4);border:1px solid #334155;">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="background:linear-gradient(135deg, #1C1917 0%, #292524 100%);padding:30px 20px;border-bottom:3px solid #C5A880;">
              <h1 style="color:#ffffff;font-size:24px;margin:0 0 4px 0;font-weight:800;">Amazon Furniture</h1>
              <p style="color:#C5A880;font-size:12px;margin:0;letter-spacing:2px;font-weight:bold;">🔔 إشعار إداري فوري — عميل جديد انضم للمتجر</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:35px 30px;text-align:right;">
              <div style="background-color:#064E3B;border:1px solid #059669;border-radius:12px;padding:14px 18px;margin-bottom:20px;">
                <p style="color:#A7F3D0;font-size:14px;font-weight:bold;margin:0;">
                  🎉 مرحباً أ. خالد، تم تسجيل حساب عميل جديد بنجاح في متجرك الإلكتروني!
                </p>
              </div>

              <h2 style="color:#FFFFFF;font-size:18px;margin:0 0 15px 0;font-weight:bold;">
                📋 تفاصيل بيانات العميل الجديد:
              </h2>

              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0F172A;border-radius:12px;padding:16px 20px;border:1px solid #334155;margin-bottom:20px;">
                <tr>
                  <td style="padding:10px 0;color:#94A3B8;font-size:13px;width:140px;border-bottom:1px solid #1E293B;">👤 اسم العميل:</td>
                  <td style="padding:10px 0;color:#FFFFFF;font-size:15px;font-weight:bold;border-bottom:1px solid #1E293B;">${data.name}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;color:#94A3B8;font-size:13px;border-bottom:1px solid #1E293B;">📧 البريد الإلكتروني:</td>
                  <td style="padding:10px 0;color:#38BDF8;font-size:14px;font-weight:bold;border-bottom:1px solid #1E293B;">
                    <a href="mailto:${data.email}" style="color:#38BDF8;text-decoration:none;">${data.email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;color:#94A3B8;font-size:13px;border-bottom:1px solid #1E293B;">📱 رقم الهاتف / واتساب:</td>
                  <td style="padding:10px 0;color:#4ADE80;font-size:14px;font-weight:bold;border-bottom:1px solid #1E293B;">${data.phone || "غير مسجل حالياً"}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;color:#94A3B8;font-size:13px;border-bottom:1px solid #1E293B;">📍 المدينة / المحافظة:</td>
                  <td style="padding:10px 0;color:#FFFFFF;font-size:14px;border-bottom:1px solid #1E293B;">${data.city || "المنصورة"}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;color:#94A3B8;font-size:13px;border-bottom:1px solid #1E293B;">⏰ وقت وتاريخ التسجيل:</td>
                  <td style="padding:10px 0;color:#FCD34D;font-size:13px;border-bottom:1px solid #1E293B;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;color:#94A3B8;font-size:13px;">🌐 وسيلة التسجيل:</td>
                  <td style="padding:10px 0;color:#CBD5E1;font-size:13px;">${data.provider === "google" ? "حساب Google السريع" : "البريد الإلكتروني الشخصي"}</td>
                </tr>
              </table>

              <!-- Quick Action Buttons -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:20px 0;">
                <tr>
                  <td align="center" style="padding:5px;">
                    ${
                      data.phone
                        ? `<a href="https://wa.me/${data.phone.replace(/[^0-9]/g, "")}" target="_blank" style="display:inline-block;background-color:#25D366;color:#ffffff;font-size:13px;font-weight:bold;text-decoration:none;padding:12px 22px;border-radius:10px;margin-bottom:8px;margin-left:8px;">
                            مراسلة العميل على واتساب 💬
                          </a>`
                        : ""
                    }
                    <a href="http://localhost:3000/admin" target="_blank" style="display:inline-block;background-color:#C5A880;color:#0F172A;font-size:13px;font-weight:bold;text-decoration:none;padding:12px 22px;border-radius:10px;">
                      فتح لوحة إدارة العملاء (CRM) ⚙️
                    </a>
                  </td>
                </tr>
              </table>

              <div style="border-top:1px solid #334155;padding-top:16px;margin-top:20px;">
                <p style="color:#64748B;font-size:11px;margin:0;">
                  هذا الإشعار مرسل إلى بريد مالك المتجر: <strong>khaledeldeep900@gmail.com</strong> تلقائياً لتنبيهك فور قيام أي عميل جديد بالتسجيل في الموقع.
                </p>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function GET() {
  try {
    const emails = await getStoredEmails();
    return NextResponse.json(emails);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to read emails" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, to, recipientName, customerData } = body;

    if (!to || !recipientName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let subject = "";
    let htmlContent = "";

    if (type === "WELCOME") {
      subject = `مرحباً بك في Amazon Furniture — أنت الآن عميلنا المميز! ⭐`;
      htmlContent = generateWelcomeEmailHtml(recipientName);
    } else if (type === "ORDER_CONFIRMATION") {
      subject = `تأكيد استلام طلبك رقم #${body.orderId || "ORD"} — متجر Amazon Furniture 🛋️`;
      htmlContent = generateOrderReceiptEmailHtml({
        name: recipientName,
        orderId: body.orderId || "ORD",
        items: body.items || [],
        total: body.total || 0,
        phone: body.phone || "",
        address: body.address || "",
        city: body.city || "",
        notes: body.notes || "",
      });
    } else if (type === "NEW_USER_ADMIN_ALERT") {
      const clientName = customerData?.name || recipientName;
      subject = `🔔 عميل جديد سجل في متجر Amazon Furniture: ${clientName} (${customerData?.email || ""})`;
      htmlContent = generateAdminNewUserNotificationHtml({
        name: clientName,
        email: customerData?.email || to,
        phone: customerData?.phone,
        city: customerData?.city,
        provider: customerData?.provider,
        date: customerData?.date,
      });
    } else {
      return NextResponse.json({ error: "Invalid email type" }, { status: 400 });
    }

    const emails = await getStoredEmails();
    const newEmail: EmailLog = {
      id: `email_${Date.now()}`,
      to,
      recipientName,
      subject,
      type,
      orderId: body.orderId,
      date: new Date().toISOString(),
      htmlContent,
    };

    emails.unshift(newEmail);
    await saveStoredEmails(emails);

    // If Nodemailer credentials are configured, dispatch real email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const nodemailerModule = await import("nodemailer");
        const transporter = nodemailerModule.default.createTransport({
          service: process.env.EMAIL_SERVICE || "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.EMAIL_FROM || `"Amazon Furniture" <${process.env.EMAIL_USER}>`,
          to,
          subject,
          html: htmlContent,
        });
      } catch (err: unknown) {
        console.warn("Nodemailer delivery notice (email saved to CRM logs):", (err as Error).message);
      }
    }

    return NextResponse.json({
      success: true,
      emailId: newEmail.id,
      subject,
      date: newEmail.date,
    });
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json({ error: "Failed to process email" }, { status: 500 });
  }
}
