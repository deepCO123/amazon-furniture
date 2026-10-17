# دليل الإعداد للإنتاج الفعلي (Production Deployment Guide)
## متجر Amazon Furniture الفاخر 🛋️

تم تجهيز وبرمجة المنصة بكافة بوابات الدفع، تتبع الطلبات، فواتير الـ PDF، الضمان، وكوبونات الخصم. هذا الدليل يوضح كيفية ربط الخدمات السحابية الحقيقية بضغطة زر.

---

### 1. تفعيل إرسال فواتير الـ PDF وعقد الضمان عبر الإيميل (Gmail SMTP) 📧
يحتوي النظام على مولد فواتير رسمية (`invoiceService.js`) يُنشئ ملف PDF مرفقاً به تفاصيل الطلب وخاتم الضمان لمدة 10 سنوات.
لتفعيل وصول الإيميل لصندوق وارد العميل (Inbox) مباشرة:

1. افتح حساب Google الخاص بالمعرض.
2. ادخل على **الأمان (Security)** ثم فعّل **التحقق بخطوتين (2-Step Verification)**.
3. انتقل إلى الرابط المباشر لكلمات مرور التطبيقات: [Google App Passwords](https://myaccount.google.com/apppasswords).
4. اكتب اسماً للتطبيق (مثلاً: `Amazon Furniture Store`) واضغط **إنشاء (Generate)**.
5. ستظهر لك كلمة مرور مكونة من 16 حرفاً (مثال: `abcd efgh ijkl mnop`).
6. افتح ملف `backend/.env` واستبدل القيم التالية:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASS=abcdefghijklmnop
EMAIL_FROM="Amazon Furniture <your-actual-email@gmail.com>"
```
7. أعد تشغيل الخادم، وسيتم إرسال الفاتورة الرسمية لأي عميل فور تسجيل طلبه!

---

### 2. الاتصال بقاعدة بيانات MongoDB Atlas 🍃
النظام مزود بنظام حماية **Hybrid Disaster Recovery**:
- إذا كانت قاعدة بيانات MongoDB متصلة، يُسجل بها مع معاملات ذرية (Transactions) لمنع البيع الزائد.
- إذا كان هناك انقطاع في الإنترنت أو لم يتم إضافة الـ IP في الـ Whitelist، يعمل النظام تلقائياً وبدون أي توقف عبر الذاكرة السريعة وملفات `src/data/*.json`.

لربط Atlas مباشرة:
1. ادخل على [MongoDB Atlas](https://cloud.mongodb.com).
2. من القائمة الجانبية: **Network Access** -> اضغط **Add IP Address**.
3. اختر **Allow Access from Anywhere (`0.0.0.0/0`)** أو أضف الـ IP الحالي لجهازك.

---

### 3. إطلاق النطاق الرسمي (Custom Domain) عبر Cloudflare 🌐
لتشغيل الدومين الرسمي الخاص بك (مثلاً `www.amazonfurniture.eg`):
1. قم بتشغيل نفق Cloudflare المخصص باسم النطاق:
```bash
cloudflared tunnel route dns <TUNNEL_ID_OR_NAME> www.amazonfurniture.eg
```
2. أو تشغيل النفق السريع المستقر عبر HTTP/2:
```bash
cloudflared tunnel --protocol http2 --url http://localhost:3000
```

---

### 4. بوابات الدفع الإلكتروني المعتمدة (Payment Gateways) 💳
- **إنستاباي (InstaPay):** التحويلات اللحظية تستقبل على العنوان اللحظي الرسمي `amazonfurniture@instapay` ورقم هاتف المعرض `01091084863`.
- **فودافون كاش ومحافظ المحمول:** تستقبل على الرقم المعتمد `01091084863`.
- **فوري باي (Fawry Pay):** أكواد الدفع تصدر تلقائياً بصلاحية 48 ساعة للسداد برقم الخدمة `788`.
- **الدفع عند الاستلام (COD):** متاح لجميع المحافظات مع المعاينة قبل الاستلام.
- **كوبونات الخصم النشطة:** `WELCOME10` (خصم 10%)، `VIP2026` (خصم 15% فوق 25 ألف)، `AMAZON500` (خصم 500 ج مباشر).
