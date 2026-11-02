# 🚀 دليل نشر السيرفر السحابي المستقل (Backend Deployment Guide)
### متجر AMAZON للأثاث الفاخر — حل المشاكل وربط الواجهة بالخادم وقاعدة البيانات

تم إعداد المشروع ليدعم النشر السحابي التلقائي والمجاني بأسهل الطرق المتاحة. يمكنك الاختيار بين **Render (مجاني وموصى به)** أو **Railway** أو خادمك الخاص **VPS عبر Docker**.

---

## 🌟 الطريقة الأولى (الأسهل والمجانية بالكامل): النشر عبر Render.com

Render يدعم تطبيقات Node.js و Express و Socket.io مجاناً، وتم تجهيز ملف `render.yaml` داخل المستودع ليقوم بضبط كل شيء تلقائياً بضغطة زر واحدة.

### الخطوات:
1. افتح موقع [Render.com](https://dashboard.render.com/) وسجل الدخول باستخدام حسابك على **GitHub**.
2. من لوحة التحكم، اضغط على زر **New +** الموجود أعلى اليمين، ثم اختر **Blueprint**.
3. اختر مستودع المشروع: `deepCO123/amazon-furniture`.
4. سيقرأ Render ملف `render.yaml` تلقائياً ويقوم بإعداد:
   - مسار السيرفر: `backend/`
   - الاتصال بقاعدة البيانات السحابية: `MongoDB Atlas (amazon_store)`
   - بريد التنبيهات والفواتير: `khaledeldeep900@gmail.com`
   - منفذ التشغيل وفحص الصحة: `/health`
5. اضغط على **Apply** أو **Deploy**.
6. خلال دقيقة إلى دقيقتين، سيصبح السيرفر يعمل على مدار الساعة وسيعطيك رابطاً سحابياً رسمياً (مثال: `https://amazon-furniture-api.onrender.com`).

---

## 🔗 الخطوة الثانية: ربط سيرفر Render مع الواجهة على Vercel

بعد الحصول على رابط السيرفر من Render:
1. ادخل إلى لوحة تحكم [Vercel Dashboard](https://vercel.com/dashboard).
2. اختر مشروع `amazon-furniture`.
3. اذهب إلى **Settings** ثم **Environment Variables**.
4. أضف المتغير التالي:
   - **Key:** `NEXT_PUBLIC_BACKEND_URL`
   - **Value:** رابط سيرفر Render (مثال: `https://amazon-furniture-api.onrender.com`)
5. اذهب إلى تبويب **Deployments** واضغط على أحدث نسخة ثم اختر **Redeploy**.

🎉 **النتيجة:**
* جميع طلبات الواجهة (`/api/*`) ستتصل بالسيرفر السحابي الحي.
* تُحفظ الطلبات لحظياً في MongoDB Atlas.
* تُصدر الفواتير الإلكترونية (PDF) وتُرسل للعميل ولبريد الإدارة.
* تعمل لوحة الأدمن الحية وإشعارات الطلبات الفورية بنسبة 100%.

---

## 🛠️ الطريقة الثانية: النشر على سيرفرك الخاص (Ubuntu VPS) عبر Docker

إذا كنت تمتلك سيرفر VPS خاص بك:
1. افتح مستودع المشروع على **GitHub**.
2. اذهب إلى: `Settings` -> `Secrets and variables` -> `Actions`.
3. أضف الـ Secrets التالية:
   - `SSH_HOST`: عنوان IP الخاص بالسيرفر.
   - `SSH_USERNAME`: اسم المستخدم (مثلاً: `root` أو `ubuntu`).
   - `SSH_PRIVATE_KEY`: مفتاح الـ SSH الخاص بك.
   - `SSH_PORT`: المنفذ (افتراضياً `22`).
4. بعد إضافة هذه المفاتيح، يمكنك تشغيل الـ Workflow من GitHub Actions بالضغط على:
   `Actions -> 🚀 Production VPS Deployment -> Run workflow`.
5. سيقوم السيرفر بسحب الكود وتشغيل الحاويات تلقائياً عبر `docker compose up -d --build`.

---

## 🛡️ حالة منظومة الـ CI/CD على GitHub:
* تم إنشاء ملف `ci.yml` ليقوم بفحص واختبار كامل الكود تلقائياً على فرع `main`.
* تم تحديث `deploy.yml` ليتخطى خطوة الـ SSH بأمان دون أي فشل (Pass ✅) في حال عدم إدخال مفاتيح الـ VPS.
