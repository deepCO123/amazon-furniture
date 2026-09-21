# 📋 الدليل الشامل لتدقيق وخارطة طريق مشروع متجر Amazon Furniture
> **ملف موجه لأي نموذج ذكاء اصطناعي (AI Prompt & System Architecture Dossier)**  
> **الهدف:** تزويد الـ AI بكافة تفاصيل المشروع التقنية، المعمارية، ونواقص النظام ليقوم ببناء **خطة عمل تنفيذية مفصلة (Actionable Roadmap)** لما ينقص المشروع لنقله إلى مستوى الإنتاج التجاري الكامل (Production Ready).

---

## 🤖 موجه الأمر للذكاء الاصطناعي المستلم (AI System Prompt)

> **انسخ هذا النص للـ AI مع هذا الملف:**
> 
> "أنت الآن تعمل كـ **Principal Solutions Architect & Lead Full-Stack Engineer**.  
> أمامك تقرير شامل ومفصل عن البنية التحتية، التقنيات، الميزات المكتملة، والفجوات التقنية لمشروع **Amazon Furniture** (متجر أثاث فاخر متكامل مع لوحة تحكم وخادم Express).  
> **مهمتك المطلوبة:**
> 1. دراسة هذا الملف بدقة واستيعاب البنية المعمارية الحالية (Next.js 16 + Express + MongoDB/In-Memory Cache).
> 2. تحليل الفجوات التقنية المذكورة والنواقص غير المكتملة.
> 3. بناء **خطة عمل تنفيذية مجدولة على مراحل (Phased Action Plan)**، مرتبة حسب الأولوية القصوى (Critical Blocker ثم High ثم Medium ثم Enhancements).
> 4. لكل مرحلة، حدد:
>    - المشكلة والهدف منها.
>    - الملفات المعنية بالتعديل أو الإنشاء.
>    - خطوات التنفيذ البرمجية الدقيقة (Architecture Steps).
>    - كيفية الاختبار والتحقق (Verification)."

---

## 🏢 1. نبذة عن المشروع وهوية العمل (Business & Domain Overview)

* **اسم المشروع:** **Amazon Furniture (أثاث أمازون)** / علامة تجارية متخصصة في الأثاث المودرن والنيوكلاسيك الفاخر.
* **النطاق الجغرافي والسوق المستهدف:** جمهورية مصر العربية (العملة: الجنيه المصري `EGP`، التركيز على مدن الدلتا والقاهرة والإسكندرية مع ورش تصنيع وخدمات معاينة مجانية بالمنصورة).
* **طبيعة المنتجات:** غرف نوم، سفرة، صالونات وركنات، دريسنج روم، مطابخ، ستائر وتنجيد، مع إمكانية تفصيل مقاسات وألوان مخصصة.
* **المميزات التنافسية المطبقة:**
  * ضمان 10 سنوات على الأخشاب الطبيعية (زان روماني / كونتر روسي).
  * تركيب مجاني بالكامل لكافة القطع.
  * خدمة استشارة ومعاينة هندسية مجانية قبل التصنيع.
  * إمكانية طلب عروض أسعار رسمية للشركات والكميات (Quotations).
  * نظام استرجاع واستبدال (Returns & Replacements).

---

## 🏛️ 2. المعمارية التقنية الحالية (Current System Architecture)

المشروع مبني بهيكل **Hybrid Full-Stack Monorepo**:

```
[ Root Directory ]
├── backend/                   --> Express.js API Server (Port 5000)
│   ├── config/                --> MongoDB Connection (Mongoose)
│   ├── controllers/           --> Authentication & Business Logic
│   ├── middlewares/           --> Security (Helmet, CORS, RateLimit, Sanitize) & Auth (JWT)
│   ├── models/                --> Mongoose Models (7 Models)
│   ├── services/              --> In-Memory RAM Cache (jsonCache.js) & Nodemailer (emailService.js)
│   ├── scripts/               --> Database Seeding & E2E Integration Audit Script
│   └── server.js              --> Main Backend Entry Point
│
├── ecom-furniture-main/
│   └── ecom-furniture-main/   --> Next.js 16 Frontend App (Port 3000)
│       ├── src/app/           --> App Router (Shop, Products, Cart, Checkout, Admin, Auth, etc.)
│       ├── src/app/api/       --> Next.js Internal API Routes (Reading/Writing src/data/*.json)
│       ├── src/components/    --> UI, Layout, Home, Products, Admin Components
│       ├── src/store/         --> Zustand Stores (Cart, Wishlist, Auth, Language)
│       └── src/data/          --> JSON Databases (products, orders, customers, quotations, etc.)
│
└── package.json               --> Root Runner using `concurrently` (runs frontend + backend simultaneously)
```

### حزمة التقنيات المستخدمة (Tech Stack Versions):
* **الواجهة الأمامية (Frontend):**
  * **Next.js 16.2.6** (App Router, Turbopack, Server & Client Components).
  * **React 19.2.4 & TypeScript 5**.
  * **Tailwind CSS v4** للتصميم التفاعلي والعصري.
  * **Framer Motion v12 & Anime.js v4** للتحريكات والتأثيرات السينمائية ثلاثية الأبعاد.
  * **Zustand v5** لإدارة الحالة المتزامنة مع التخزين المحلي `localStorage`.
  * **React Hook Form v7 & Zod v4** للتحقق الصارم من صحة النماذج.
  * **Lucide React** للأيقونات العصرية.
* **الخادم الخلفي (Backend):**
  * **Node.js v20+ / v24** & **Express.js v4.19**.
  * **Mongoose v9** للربط مع قاعدة بيانات MongoDB.
  * **In-Memory RAM Cache Engine** لقراءة وكتابة البيانات في 0ms مع تفريغ دوري للقرص.
  * **الأمان:** `helmet`, `cors`, `express-rate-limit`, `cookie-parser`, `jsonwebtoken (JWT HttpOnly)`, `bcryptjs` (12 Salt Rounds), `compression (Gzip)`.
  * **خدمات البريد:** `nodemailer` عبر بروتوكول SMTP (قوالب HTML احترافية للعملاء والإدارة).
* **إدارة التشغيل (Runner):**
  * أداة `concurrently` لتشغيل المنفذين معاً بأمر واحد: `npm run dev`.

---

## ✅ 3. ما تم إنجازه واكتماله بالفعل (Implemented & Completed Features)

### أ. صفحات وميزات المتجر للعميل (Storefront):
1. **الصفحة الرئيسية (`/`):**
   * هيرو سيكشن متطور بأنيميشن كتابة حروف وتأثيرات Parallax و 3D tilt ومؤشرات حية.
   * أقسام: تصفح الفئات، أحدث المنتجات والخصومات، مميزات المتجر، شريط الماركات، آراء العملاء التفاعلية، ومعرض إنستغرام.
2. **كتالوج المنتجات (`/products`):**
   * عرض شبكي وقائمي (Grid / List view).
   * فلترة متقدمة حسب الفئة، نوع الخشب/المادة، اللون، نطاق السعر، والترتيب (الأعلى تقييماً، الأحدث، الأقل سعراً).
   * بحث فوري مع نافذة المعاينة السريعة (Quick View Modal).
3. **صفحة تفاصيل المنتج (`/products/[slug]`):**
   * معرض صور متعدد الزوايا مع تقريب تفاعلي (Zoom on hover).
   * محدد الألوان والأبعاد والمواصفات الفنية مع حساب المخزون الحي.
   * احتساب الشحن والتركيب المجاني، وتبويبات الوصف والمواصفات وسياسة الاسترجاع.
4. **سلة المشتريات (`/cart`):**
   * إدارة الكميات فورياً مع حساب حد الشحن المجاني الترويجي.
   * مزامنة السلة عبر Zustand و `localStorage`.
5. **إتمام الطلب الذكي (`/checkout`):**
   * نموذج خطوات متعددة (بيانات الشحن والعنوان -> ملخص الطلب -> التأكيد).
   * توليد رسالة واتساب تفصيلية بالمنتجات والأسعار والعنوان وإرسالها برابط مباشر للمبيعات.
   * خصم الكمية تلقائياً من مخزون المنتجات وإرسال إشعار فوري.
6. **خدمات إضافية:**
   * حجز استشارة ومعاينة مجانية (`/consultations`).
   * طلب عرض سعر للشركات (`/quotations`).
   * تقديم طلب استبدال أو استرجاع (`/returns`).
   * قائمة المفضلة المحفوظة (`/wishlist`).
   * تتبع حالة الطلب بالرقم التعريفي (`/orders`).

### ب. لوحة التحكم الإدارية الشاملة (`/admin`):
لوحة تحكم كاملة وضخمة (أكثر من 120 كيلوبايت كود) تتضمن:
1. **مؤشرات الأداء (Dashboard KPI Cards):** إجمالي المبيعات، عدد الطلبات النشطة، التنبيه بنقص المخزون، ونسبة النمو.
2. **إدارة المنتجات (Products CRUD):** إضافة منتج جديد، تعديل الأسعار والأبعاد، رفع وتحديث الصور، حذف، وإدارة حالة التوفر في المخزن.
3. **إدارة الطلبات (Orders Management):** استعراض الطلبات، وتغيير حالتها تدريجياً (`قيد التنفيذ` -> `جاري التصنيع` -> `تم الشحن` -> `تم التوصيل` -> `ملغي`)، وتعديل الملاحظات.
4. **إدارة سجل العملاء (CRM):** عرض بيانات العملاء، إجمالي إنفاق كل عميل، وعدد طلباته.
5. **إدارة عروض الأسعار (Quotations):** مراجعة طلبات الشركات وتحميل عروض الأسعار وحذفها.
6. **إدارة المرتجعات (Returns):** مراجعة صور العيوب المقدمة من العملاء، وقبول أو رفض طلب الاستبدال/الاسترجاع.
7. **إدارة المعاينات (Consultations):** جدول مواعيد المعاينات المنزلية للمهندسين وتحديد الحالة (`مؤكدة`، `تمت المعاينة`).
8. **أرشيف البريد الإلكتروني (Email Logs):** استعراض نصوص رسائل SMTP المرسلة للعملاء للتأكد من وصول الفواتير والترحيب.
9. **مراقبة الكاش (Cache Metrics):** إحصائيات فورية لعدد قراءات وكتابات الذاكرة RAM ومعدل الـ Hit/Miss.

### ج. الباك إند والأمان (Backend & Security):
1. نظام مصادقة هجين يدعم HttpOnly Cookies المشفرة بجانب التوكنات.
2. حماية كاملة ضد DoS عبر `express-rate-limit` (حد أقصى 5 محاولات لكل 15 دقيقة على مسارات تسجيل الدخول).
3. تأمين ترويسات HTTP عبر `helmet` مع ضبط سياسات CSP و Frameguard.
4. فلترة المدخلات لمنع هجمات XSS و NoSQL Injection.
5. سكريبت فحص واختبار شامل E2E (`backend/scripts/audit_e2e.js`) يجتاز 100% من الاختبارات بنجاح.

---

## 🔍 4. التحليل العميق للفجوات والنواقص الحالية (Detailed Gap Analysis)

على الرغم من قوة الواجهة ولوحة التحكم، توجد **فجوات تقنية ومعمارية حرجة** يجب معالجتها قبل إطلاق المشروع للجمهور:

### ⚠️ الفجوة الأولى: ازدواجية المعمارية (Dual-Backend Split-Brain Issue)
* **المشكلة الحالية:**  
  الواجهة الأمامية في مسارات Next.js (`src/app/api/products/route.ts`, `src/app/api/orders/route.ts`) تقوم بالقراءة والكتابة مباشرة من ملفات JSON المحلية داخل `src/data/*.json` عبر نظام ملفات السيرفر (`fs`).  
  بينما يوجد خادم Express متكامل (`backend/server.js`) يحتوي على Mongoose Models واتصال MongoDB، ولكن ملف `next.config.ts` يقوم فقط بعمل Proxy لمسار `/api/auth/*` و `/api/cache-stats`!
* **الخطر التقني:**  
  عند رفع موقع Next.js على منصات سحابية مثل **Vercel** أو **Netlify** (بيئة Serverless Ephemeral)، فإن نظام الملفات يكون للقراءة فقط (Read-Only)، وأي عملية شراء أو إضافة منتج عبر مسارات Next.js الحالية **ستفشل فوراً** أو ستختفي البيانات بمجرد إعادة تشغيل الـ Serverless Function.
* **الحل المطلوب من الـ AI:**  
  توحيد مسار البيانات إما بجعل Next.js يوجه كافة طلبات `/api/*` إلى خادم Express المتصل بـ MongoDB، أو جعل مسارات Next.js تتصل مباشرة بقاعدة البيانات المركزية.

### 💳 الفجوة الثانية: بوابات الدفع الإلكتروني (Payment Gateways)
* **المشكلة الحالية:**  
  المتجر يعتمد حالياً بنسبة 100% على الدفع عند الاستلام (COD) مع إرسال الطلب عبر الواتساب.
* **النواقص المطلوبة للسوق المصري:**
  1. الربط مع بوابة دفع مصرية معتمدة مثل **Paymob** (تدعم البطاقات البنكية Visa/Mastercard، المحافظ الإلكترونية مثل فودافون كاش وأورنج كاش، وتقسيط البنوك).
  2. دعم خدمات التقسيط التي تعد عاملاً حاسماً في شراء الأثاث في مصر: **valU (ڤاليو)**، **aman (أمان)**، و **سهولة (Souhoola)**.
  3. نظام Webhooks موثوق وموقع (HMAC Signature) في الباك إند لتأكيد حالة الدفع وتحديث حالة الطلب تلقائياً إلى `paid`.

### 🔐 الفجوة الثالثة: التحقق من هوية العملاء (Auth, OTP & Identity)
* **المشكلة الحالية:**  
  * يمكن لأي شخص وضع أي رقم هاتف وهمي وطلب أثاث بمبالغ كبيرة، مما يعرض ورش العمل لخسائر فادحة في الشحن والمصاريف.
  * زر تسجيل الدخول عبر Google (`GoogleAuthButton`) مجرد محاكاة واجهة أو يحتاج اكتمال الـ OAuth Flow المعتمد.
  * مسار "نسيت كلمة المرور" (Forgot / Reset Password) غير مكتمل بالكامل مع روابط التوكن المشفرة عبر البريد.
* **المطلوب من الـ AI:**
  1. تكامل مع خدمة إرسال رسائل التحقق (SMS OTP) عبر الهاتف (مثل Twilio أو مزود محلي كـ VictoryLink أو WhatsApp Cloud API) لتأكيد رقم العميل قبل إتمام الطلب.
  2. تفعيل OAuth حقيقي (Google / Facebook) وتخزين حساب المستخدم بأمان في MongoDB.
  3. بناء دورة استعادة كلمة المرور كاملة.

### ☁️ الفجوة الرابعة: تخزين وسائط وصور المنتجات (Media & Asset Storage)
* **المشكلة الحالية:**  
  الصور الحالية إما روابط Unsplash خارجية أو تُرفع داخل مجلد محلي `public/uploads`.
* **الخطر التقني:**  
  تخزين صور أثاث عالية الجودة على نفس خادم التطبيق يؤدي لامتلاء القرص، والبطء الشديد، وفقدان الصور المرفوعة عند إعادة نشر المشروع (Redeploy).
* **المطلوب من الـ AI:**
  * التكامل مع خدمة تخزين سحابية مخصصة للوسائط مع شبكة توصيل محتوى (CDN) مثل: **Cloudinary** أو **AWS S3** أو **Supabase Storage**، مع ضغط الصور التلقائي بصيغة `WebP` و `AVIF`.

### ⭐ الفجوة الخامسة: نظام التقييمات والمراجعات الحقيقية (Reviews & Ratings)
* **المشكلة الحالية:**  
  بيانات التقييمات وآراء العملاء ثابتة ومخزنة في ملف `src/data/reviews.ts`.
* **المطلوب من الـ AI:**
  * نموذج Mongoose للتقييمات (`Review`).
  * مسار API لإضافة تقييم مع التحقق من أن المستخدم قام بالفعل بشراء المنتج (Verified Buyer).
  * إمكانية رفع العميل لصور الأثاث الحقيقية بعد استلامه في منزله.
  * لوحة تحكم للأدمن لمراجعة واعتماد التقييمات قبل نشرها للعامة لمنع الإساءات.

### ⚡ الفجوة السادسة: الإشعارات الفورية والمزامنة اللحظية (Real-Time WebSockets)
* **المشكلة الحالية:**  
  لوحة التحكم لا تتلقى إشعاراً صوتياً أو مرئياً لحظياً عند قيام عميل بطلب جديد إلا إذا قام المشرف بإعادة تحميل الصفحة (Page Refresh).
* **المطلوب من الـ AI:**
  * استخدام **Socket.io** أو **Server-Sent Events (SSE)** لإرسال تنبيه فوري للأدمن مع صوت جرس عند وصول طلب أو حجز معاينة جديد.

### 🔍 الفجوة السابعة: محرك البحث وتخصيص تجربة المستخدم (Search & SEO)
* **المشكلة الحالية:**  
  البحث يعتمد على فلترة مصفوفة في الفرونت إند عبر JavaScript، ولا يدعم البحث الدلالي أو الأخطاء الإملائية الشائعة في اللغة العربية (مثل الفرق بين `أ` و `ا`، و `ة` و `ه`).
* **المطلوب من الـ AI:**
  * تحسين محرك البحث ليدعم تقنيات البحث النصي الكامل (MongoDB Full-Text Search أو Meilisearch) مع تطبيع الحروف العربية (Arabic Text Normalization).
  * توليد بطاقات المشاركة الاجتماعية الديناميكية (Open Graph Image Generation / Dynamic OG Images) لكل منتج لتبدو جذابة عند مشاركتها على واتساب وفيسبوك.

### 🐳 الفجوة الثامنة: الجاهزية للإنتاج والنشر (DevOps & Production Readiness)
* **المشكلة الحالية:**  
  المشروع يعمل محلياً فقط عبر `npm run dev` بملفات `.env` محلية ولا يحتوي على ملفات بيئات معيارية، ولا Dockerfile، ولا إعدادات Nginx العكسية.
* **المطلوب من الـ AI:**
  * إعداد ملفات `Dockerfile` و `docker-compose.yml` تشمل: الفرونت إند، الباك إند، قاعدة بيانات MongoDB، و Redis للتخزين المؤقت.
  * خطة النشر الموصى بها (مثال: Vercel للفرونت إند + Render/Railway/DigitalOcean للباك إند وقاعدة البيانات).
  * خط أنابيب أتمتة الاختبارات والنشر (GitHub Actions CI/CD).

---

## 🗄️ 5. ملخص مخططات قاعدة البيانات الحالية (Data Models Reference)

لتسهيل عمل الـ AI، هذه هي النماذج المعرفة حالياً في `backend/models/`:

1. **`Product`**:
   `id`, `name`, `slug`, `description`, `price`, `originalPrice`, `images[]`, `category`, `material`, `color`, `dimensions {width, height, depth}`, `weight`, `stockQuantity`, `rating`, `reviewCount`, `inStock`, `featured`, `tags[]`.
2. **`Customer`**:
   `id`, `name`, `email`, `avatar`, `phone`, `city`, `provider`, `ordersCount`, `totalSpent`, `createdAt`.
3. **`Order`**:
   `id`, `customer (ObjectId ref)`, `customerName`, `customerEmail`, `customerPhone`, `items [{product, quantity, color, selectedDimensions}]`, `total`, `status ('processing'|'manufacturing'|'shipped'|'delivered'|'cancelled')`, `shippingAddress`, `notes`, `date`.
4. **`Quotation`**:
   `id`, `customerName`, `companyName`, `email`, `phone`, `city`, `projectType`, `estimatedBudget`, `details`, `attachmentUrl`, `status ('pending'|'reviewed'|'quoted'|'rejected')`, `createdAt`.
5. **`Return`**:
   `id`, `orderId`, `customerName`, `email`, `phone`, `reason`, `itemDetails`, `photos[]`, `status ('pending'|'approved'|'inspected'|'refunded'|'rejected')`, `createdAt`.
6. **`Consultation`**:
   `id`, `clientName`, `phone`, `email`, `city`, `preferredDate`, `preferredTime`, `roomType`, `budgetRange`, `notes`, `status ('pending'|'confirmed'|'completed'|'cancelled')`, `createdAt`.
7. **`Email`**:
   `id`, `recipient`, `subject`, `previewText`, `htmlBody`, `category ('welcome'|'order_confirmation'|'quotation'|'notification')`, `sentAt`, `status`.

---

## 🎯 6. المطلوب من الذكاء الاصطناعي المُستلم (Deliverables Expected from AI)

عند تقديم هذا الملف لأي نموذج ذكاء اصطناعي، اطلب منه إنتاج المستخرجات التالية بالترتيب:

```
[ المرحلة الأولى: الإصلاحات المعمارية الحرجة (P0 - Critical Architecture Fixes) ]
- حل معضلة الـ Dual-Backend ومزامنة Next.js مع خادم Express وقاعدة بيانات MongoDB السحابية.
- إزالة الاعتماد على كتابة ملفات JSON على القرص لضمان العمل على Vercel / Cloud Platforms.

[ المرحلة الثانية: منظومة المعاملات المالية والمصادقة (P1 - Core Commerce & Security) ]
- خطة تكامل بوابة الدفع المصرية (Paymob + تقسيط valU / أمان).
- نظام التحقق من الهاتف بالـ OTP لمنع الطلبات الوهمية.
- ربط Google OAuth الحقيقي وتأمين جلسات المستخدمين.

[ المرحلة الثالثة: الميزات التشغيلية والوسائط وتجربة المستخدم (P2 - Operations & UX) ]
- نظام تخزين وضغط الصور السحابي (Cloudinary / S3).
- نظام التقييمات والمراجعات الحقيقي بالصور للمشترين الفعليين.
- إشعارات فورية عبر WebSockets للوحة تحكم المشرف.

[ المرحلة الرابعة: النشر والتحسين والـ DevOps (P3 - DevOps, SEO & Production Launch) ]
- إعداد بيئة Docker و Docker Compose كاملة للمشروع.
- تحسين الـ SEO وبطاقات المشاركة الديناميكية للمنتجات باللغة العربية.
- خطوات النشر الحي (Production Deployment Guide) والمراقبة.
```

---
*تم إنشاء وتدقيق هذا التقرير بدقة ليكون بمثابة وثيقة مرجعية شاملة (Single Source of Truth) تتيح لأي مهندس برمجيات أو ذكاء اصطناعي البدء فوراً في إكمال المشروع دون الحاجة لفحص الكود يدوياً من الصفر.*
