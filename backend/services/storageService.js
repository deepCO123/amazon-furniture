/**
 * backend/services/storageService.js
 * خدمة التخزين السحابي المركزية (Cloud Storage Service)
 * تدعم Cloudinary للإنتاج السحابي والتخزين المحلي لبيئات التطوير
 */

const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const UPLOADS_DIR = path.resolve(
  __dirname,
  '..',
  '..',
  'ecom-furniture-main',
  'ecom-furniture-main',
  'public',
  'uploads'
);

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

class StorageService {
  isConfigured() {
    return isCloudinaryConfigured;
  }

  isProduction() {
    return process.env.NODE_ENV === 'production';
  }

  /**
   * رفع ملف buffer إلى السحابة أو القرص المحلي
   * @param {Buffer} buffer 
   * @param {Object} options { folder, originalName, mimeType }
   * @returns {Promise<{ url: string, publicId: string, provider: 'cloudinary' | 'local' }>}
   */
  async uploadBuffer(buffer, options = {}) {
    const folder = options.folder || 'amazon-furniture/general';
    const mimeType = options.mimeType || 'image/jpeg';
    const originalName = options.originalName || `upload-${Date.now()}`;
    const cleanBaseName = path.basename(originalName, path.extname(originalName)).replace(/[^a-zA-Z0-9_-]/g, '_');
    const publicId = `${folder}/${Date.now()}-${cleanBaseName}`;

    // 1. إذا كان Cloudinary مفعل
    if (this.isConfigured()) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: publicId,
            resource_type: 'image',
            format: 'webp',
            transformation: [
              { width: 1920, crop: 'limit' },
              { quality: 'auto:good' },
              { fetch_format: 'webp' },
            ],
          },
          (error, result) => {
            if (error) {
              console.error('[Cloudinary Upload Error]', error);
              return reject(new Error(`فشل رفع الصورة إلى السحابة: ${error.message}`));
            }
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              provider: 'cloudinary',
              format: result.format,
              sizeBytes: result.bytes,
            });
          }
        );
        uploadStream.end(buffer);
      });
    }

    // 2. فحص بيئة الإنتاج: تحذير إذا كان السيرفر على سحابة بدون Cloudinary
    if (this.isProduction()) {
      console.warn(
        '⚠️ [STORAGE NOTICE] Cloudinary credentials are not set in production! Uploading to local disk which may be ephemeral.'
      );
    }

    // 3. التخزين المحلي كـ Fallback
    const ext = path.extname(originalName).toLowerCase() || '.webp';
    const fileName = `${Date.now()}-${cleanBaseName}${ext}`;
    const localFilePath = path.join(UPLOADS_DIR, fileName);

    await fs.promises.writeFile(localFilePath, buffer);

    return {
      url: `/uploads/${fileName}`,
      publicId: fileName,
      provider: 'local',
      format: ext.replace('.', ''),
      sizeBytes: buffer.length,
    };
  }

  /**
   * حذف ملف من التخزين (سحابي أو محلي)
   */
  async deleteFile(identifier) {
    if (!identifier) return { success: false, message: 'معرف الملف مطلوب' };

    if (this.isConfigured() && !identifier.startsWith('/uploads/')) {
      try {
        const res = await cloudinary.uploader.destroy(identifier);
        return { success: res.result === 'ok' };
      } catch (err) {
        console.warn('[Cloudinary Delete Error]', err.message);
        return { success: false, error: err.message };
      }
    }

    // محلي
    try {
      const fileName = path.basename(identifier);
      const localFilePath = path.join(UPLOADS_DIR, fileName);
      if (fs.existsSync(localFilePath)) {
        await fs.promises.unlink(localFilePath);
      }
      return { success: true };
    } catch (err) {
      console.warn('[Local Storage Delete Error]', err.message);
      return { success: false, error: err.message };
    }
  }
}

module.exports = new StorageService();
