# ========================================================
# Amazon Furniture - Production Backend Dockerfile
# Optimized lightweight Alpine container
# ========================================================

FROM node:20-alpine AS runner

# تثبيت الحزم الأساسية لتحسين أمان واستقرار الحاوية
RUN apk add --no-cache dumb-init

# تعيين مجلد العمل داخل الحاوية
WORKDIR /app

# ضبط بيئة التشغيل للإنتاج
ENV NODE_ENV=production
ENV PORT=5000

# نسخ ملفات تعريف الحزم أولاً للاستفادة من Docker Layer Caching
COPY package*.json ./

# تثبيت حزم الإنتاج فقط وتخطي حزم التطوير (Clean Production Install)
RUN npm install --omit=dev --ignore-scripts && npm cache clean --force

# نسخ كافة ملفات الكود المصدري للباك إند
COPY . .

# إنشاء مجلدات النسخ الاحتياطي مع الصلاحيات المناسبة
RUN mkdir -p backups && chown -R node:node /app

# استخدام مستخدم غير جذري (non-root) للأمان
USER node

# كشف منفذ خادم Express & Socket.io
EXPOSE 5000

# فحص صحة الحاوية دورياً (Healthcheck)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# تشغيل الخادم عبر dumb-init لإدارة إشارات النظام (SIGTERM/SIGINT) بشكل صحيح
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
