# 🚀 دليل تشغيل مشروع متجر Amazon Furniture بالكامل (Complete App Run Guide)

هذا الدليل يوضح الطريقة الكاملة والمفصلة لتثبيت وتشغيل منصة **Amazon Furniture** (الواجهة الأمامية **Next.js** + الخادم الخلفي **Express.js API** + قاعدة البيانات **MongoDB / In-Memory Cache**).

---

## ⚡ 1. التشغيل السريع بأمر واحد (Quick Start)

إذا كانت المكتبات مثبتة لديك مسبقاً، كل ما تحتاجه هو فتح مجلد المشروع الرئيسي في منفذ الأوامر (Terminal):

```bash
# تشغيل الفرونت إند والباك إند معاً بأمر واحد:
npm run dev
```

> **ماذا يحدث عند تنفيذ هذا الأمر؟**  
> يقوم سكريبت `concurrently` بتشغيل خادم الباك إند على البورت **5000** بالتزامن مع خادم الفرونت إند على البورت **3000**.

---

## 📋 2. التثبيت والتشغيل خطوة بخطوة (من الصفر)

### الخطوة 1: تثبيت الحزم والمكتبات (Dependencies)
المشروع مقسم إلى جزأين (Root/Backend/Frontend)، يمكنك تثبيت جميع الحزم بأمر واحد من المجلد الرئيسي:

```bash
npm run install:all
```

*أو يدوياً لكل مجلد على حدة:*
```bash
# 1. تثبيت حزم الجذر (Root):
npm install

# 2. تثبيت حزم الباك إند (Backend):
cd backend
npm install
cd ..

# 3. تثبيت حزم الفرونت إند (Frontend):
cd ecom-furniture-main/ecom-furniture-main
npm install
cd ../..
```

---

### الخطوة 2: فحص ملفات البيئة والإعدادات (.env)

المشروع يحتوي بالفعل على ملفات البيئة المهيأة للعمل المحلي:

1. **ملف إعدادات الباك إند:**  
   المسار: `backend/.env`  
   يحتوي على إعدادات المنفذ (5000)، ومفتاح JWT السري، ورابط قاعدة البيانات.
   
2. **ملف إعدادات الفرونت إند:**  
   المسار: `ecom-furniture-main/ecom-furniture-main/.env.local`  
   يحتوي على رابط بوابة الباك إند: `NEXT_PUBLIC_BACKEND_URL=http://localhost:5000` ورابط الموقع: `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.

---

### الخطوة 3: ملء قاعدة البيانات بالبيانات الأولية (Database Seeding - اختياري)
إذا أردت ملء قاعدة بيانات MongoDB بكافة المنتجات، والطلبات، والعملاء، وعروض الأسعار الأولية:

```bash
npm run seed
```
*(أو من داخل مجلد الباك إند: `node backend/scripts/seed.js`)*.

---

### الخطوة 4: تشغيل المشروع

#### الخيار (أ): تشغيل كامل المنظومة معاً (الموصى به)
من المجلد الرئيسي للمشروع:
```bash
npm run dev
```

#### الخيار (ب): تشغيل كل طرف بشكل مستقل (في شاشتين Terminal منفصلتين)
* **لتشغيل الباك إند فقط:**
  ```bash
  npm run backend
  # أو
  cd backend && node server.js
  ```
  يعمل على الرابط: `http://localhost:5000`

* **لتشغيل الفرونت إند فقط:**
  ```bash
  npm run frontend
  # أو
  cd ecom-furniture-main/ecom-furniture-main && npm run dev
  ```
  يعمل على الرابط: `http://localhost:3000`

---

## 🌐 3. روابط الوصول السريع (Project URLs)

| الوجهة | الرابط في المتصفح | الوصف |
| :--- | :--- | :--- |
| **🛍️ واجهة المتجر الرئيسية** | [http://localhost:3000](http://localhost:3000) | تصفح المنتجات، الكتالوج، والعربة |
| **🔐 لوحة تحكم الإدارة (Admin)** | [http://localhost:3000/admin](http://localhost:3000/admin) | إدارة المنتجات، الطلبات، العملاء، والنسخ الاحتياطي |
| **⚙️ فحص حالة الـ API (Health)** | [http://localhost:5000/health](http://localhost:5000/health) | التأكد من أن سيرفر Express يعمل بنجاح |
| **📊 إحصائيات الـ Cache والذاكرة** | [http://localhost:5000/api/cache-stats](http://localhost:5000/api/cache-stats) | إحصائيات التخزين المؤقت للأدمن |

---

## 🔑 4. بيانات تسجيل الدخول التجريبية (Admin Login)

للوصول إلى لوحة الإدارة والصلاحيات الكاملة:
* **البريد الإلكتروني:** `admin@amazonfurniture.eg`
* **كلمة المرور:** `Admin@Pass2026!`
* **الرابط:** [http://localhost:3000/admin](http://localhost:3000/admin) أو عبر زر تسجيل الدخول في الموقع.

---

## 🖱️ 5. تشغيل فوري بنقرة واحدة (Windows 1-Click Runner)

تم إنشاء ملف تشغيل سريع لنظام ويندوز: [`start-project.bat`](file:///c:/Users/VICTUS/website%20amazon%20systeem/website/Bulid%20website/start-project.bat)  
- بمجرد الضغط عليه مرتين (Double Click)، سيقوم بتشغيل المنظومة وفتح المتصفح تلقائياً على الموقع!

---

## 🛠️ 6. حل المشاكل الشائعة (Troubleshooting)

### 1. رسالة `Terminate batch job (Y/N)?`
- **السبب:** تظهر هذه الرسالة في نظام Windows عند الضغط على `Ctrl + C` لإيقاف السيرفر.
- **الحل:** اضغط حرف `Y` ثم `Enter` لإيقاف العملية تماماً.

### 2. تنبيه خطأ اتصال MongoDB Atlas / OpenSSL (`SSL alert number 80` أو `querySrv ECONNREFUSED`)
- **السبب:** حجب بروتوكول DNS أو عدم إضافة الـ IP الحالي في قائمة الـ Network Access داخل MongoDB Atlas.
- **النتيجة:** النظام **لن يتوقف ولن يتعطل!** حيث يتم تفعيل نظام الطوارئ التلقائي (**RAM In-Memory Cache Fallback**) ويستمر المتجر في العمل وعرض المنتجات مباشرة من الذاكرة وملفات JSON.
- **الحل النهائي (إذا أردت الربط بالسحابة):** أدخل إلى لوحة تحكم MongoDB Atlas واضغط على `Network Access` ثم أضف `0.0.0.0/0` (Allow Access from Anywhere).

### 3. منفذ مشغول (Port 3000 or Port 5000 Already in Use)
إذا كان هناك سيرفر قديم لم يُغلق بشكل صحيح:
```powershell
# في ويندوز PowerShell لإنهاء أي عملية على البورت 3000:
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force

# لإنهاء أي عملية على البورت 5000:
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force
```
ثم أعد تشغيل `npm run dev`.
