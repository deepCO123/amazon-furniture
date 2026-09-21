# 🚀 دليل نشر وتشغيل مشروع Amazon Furniture على سيرفر الإنتاج (VPS Deployment Guide)

دليل شامل ومنظم خطوة بخطوة لنشر الخادم الخلفي (Backend) وقاعدة البيانات (MongoDB) على أي سيرفر سحابي (VPS مثل: DigitalOcean, Hetzner, AWS EC2, Linode, Contabo) يعمل بنظام **Ubuntu 22.04 أو 24.04 LTS**.

---

## 📋 نظرة عامة على معمارية النشر

```
[ Internet / Clients ]
       │
       ▼ (Port 80 / 443 HTTPS - SSL Let's Encrypt)
[ Nginx Reverse Proxy ]
       │ (Proxy Pass http://127.0.0.1:5000 + WebSocket Support)
       ▼
[ Docker Network: app-network ]
  ├── Container: amazon_furniture_backend (Node.js 20 Alpine)
  └── Container: amazon_furniture_mongodb (MongoDB 7 Persistent Volume)
```

---

## 🛠️ الخطوة 1: الاتصال بالسيرفر وتثبيت Docker & Docker Compose

قم بفتح منفذ الأوامر (Terminal) على جهازك، واتصل بالسيرفر عبر بروتوكول SSH:

```bash
ssh root@your_server_ip
```

بعد تسجيل الدخول، قم بتحديث حزم النظام وتثبيت بيئة Docker الحديثة:

```bash
# 1. تحديث النظام
sudo apt update && sudo apt upgrade -y

# 2. تثبيت Docker ومكوناته
sudo apt install docker.io docker-compose-v2 -y

# 3. تفعيل وتشغيل خدمة Docker تلقائياً عند إعادة تشغيل السيرفر
sudo systemctl enable --now docker

# 4. التحقق من التثبيت
docker --version
docker compose version
```

---

## 🔒 الخطوة 2: ضبط جدار الحماية (UFW Firewall)

لحماية قاعدة بيانات MongoDB وسيرفرك من الاختراق، أغلق كافة المنافذ وافتح فقط المنافذ الضرورية (SSH, HTTP, HTTPS):

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
sudo ufw status
```

> ⚠️ **تنبيه أمني هام:** منفذ MongoDB (`27017`) مغلق خارجياً ويعمل حصرياً داخل شبكة Docker الداخلية (`app-network`) لمنع أي وصول خارجي غير مصرح به.

---

## 📂 الخطوة 3: نقل ملفات المشروع إلى السيرفر

أنشئ مجلد المشروع داخل مسار الويب القياسي على السيرفر:

```bash
sudo mkdir -p /var/www/amazon-furniture
sudo chown -R $USER:$USER /var/www/amazon-furniture
```

### الخيار (أ): الرفع المباشر عبر `scp` من جهازك المحلي (Terminal/CMD):

نفذ هذا الأمر **من جهازك الشخصي** داخل مجلد المشروع:

```bash
# من جهازك المحلي:
scp -r ./backend ./docker-compose.yml root@your_server_ip:/var/www/amazon-furniture
```

### الخيار (ب): عبر مستودع Git (الأفضل):
```bash
cd /var/www/amazon-furniture
git clone <your-repository-url> .
```

---

## 🔑 الخطوة 4: إعداد ملف متغيرات البيئة للإنتاج (.env)

لا تقم أبداً برفع ملف `.env` إلى Git. ادخل لمجلد المشروع على السيرفر وأنشئ الملف يدوياً:

```bash
cd /var/www/amazon-furniture
nano .env
```

ضع بداخله كافة المتغيرات الحقيقية الخاصة ببيئة الإنتاج:

```env
# بيئة التشغيل
PORT=5000
NODE_ENV=production
CLIENT_URL=https://yourdomain.com

# قاعدة البيانات (داخل شبكة Docker)
MONGO_URI=mongodb://mongo:27017/amazon_furniture

# مفتاح التشفير لجلسات الـ JWT (سلسلة عشوائية طويلة ومعقدة)
JWT_SECRET=super_secret_jwt_key_min_32_characters_random_string_2026!
JWT_EXPIRES_IN=7d

# خدمة البريد الإلكتروني (Gmail App Password)
EMAIL_SERVICE=gmail
EMAIL_USER=support@yourdomain.com
EMAIL_PASS=your_16_char_gmail_app_password
EMAIL_FROM="Amazon Furniture <support@yourdomain.com>"
ADMIN_NOTIFICATION_EMAIL=admin@yourdomain.com

# خدمة رفع وتخزين الصور السحابية (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

> **حفظ الملف في nano:** اضغط `Ctrl + O` ثم `Enter`، ثم اخرج بالضغط على `Ctrl + X`.

---

## 🐳 الخطوة 5: بناء وتشغيل الحاويات (Docker Containers)

من داخل مجلد `/var/www/amazon-furniture` على السيرفر:

```bash
# بناء صور الحاويات وتشغيلها في الخلفية
docker compose up -d --build

# التأكد من عمل الحاويات وحالتها الصحية (Healthcheck)
docker compose ps

# متابعة سجلات التشغيل الحية للتأكد من الاتصال بـ MongoDB وبدء خادم Express & Socket.io
docker compose logs -f
```

---

## 🌐 الخطوة 6: تأمين النطاق عبر Nginx وشهادة SSL (Reverse Proxy)

### 1. تثبيت Nginx ومولد الشهادات Certbot:
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

### 2. إنشاء ملف إعداد Nginx:
```bash
sudo nano /etc/nginx/sites-available/amazon-furniture
```

ضع بداخله الإعداد الكامل المحدث لدعم **حجم الصور الكبيرة** و **بروتوكول WebSockets للإشعارات الفورية**:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # الحد الأقصى لحجم رفع الصور (20MB)
    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;

        # إعدادات WebSockets الضرورية للإشعارات اللحظية (Socket.io)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # ترويسات الأمان ونقل IP العميل الحقيقي
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

### 3. تفعيل الموقع وإعادة تشغيل Nginx:
```bash
# تفعيل الإعداد برابط رمزي
sudo ln -sf /etc/nginx/sites-available/amazon-furniture /etc/nginx/sites-enabled/

# اختبار صحة إعدادات Nginx
sudo nginx -t

# إعادة تشغيل السيرفر
sudo systemctl restart nginx
```

### 4. استخراج شهادة SSL مجانية وتجديدها تلقائياً (Let's Encrypt):
```bash
sudo certbot --nginx -d api.yourdomain.com
```
*سيقوم Certbot تلقائياً بتحديث ملف Nginx لإجبار التحويل إلى HTTPS وتأمين الموقع.*

---

## 🔄 الخطوة 7: أوامر الصيانة والتحديث الدوري (Day-2 Operations)

### لتحديث الكود عند إطلاق ميزات جديدة:
```bash
cd /var/www/amazon-furniture
git pull
docker compose up -d --build
```

### لأخذ نسخة احتياطية يدوية من قاعدة البيانات MongoDB:
```bash
docker exec -t amazon_furniture_mongodb mongodump --db amazon_furniture --out /data/db/backup_$(date +%F)
```

### لفحص استهلاك المعالج والذاكرة (RAM & CPU):
```bash
docker stats
```
