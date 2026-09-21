/**
 * backend/scripts/backup.js
 * خدمة ومجدول النسخ الاحتياطي التلقائي (Disaster Recovery)
 * يقوم بتصدير وتأمين بيانات المتجر وقاعدة البيانات يومياً الساعة 3:00 صباحاً
 */

const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const jsonCache = require('../services/jsonCache');

const BACKUP_ROOT = path.join(__dirname, '..', 'backups');
const MAX_BACKUPS_TO_KEEP = 14; // الاحتفاظ بآخر 14 نسخة احتياطية

/**
 * تنفيذ عملية أخذ نسخة احتياطية فورية وتخزينها في مجلد backups/
 * @returns {Promise<{ success: boolean, backupDir: string, files: string[], timestamp: string }>}
 */
async function performBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(BACKUP_ROOT, `backup_${timestamp}`);

  try {
    if (!fs.existsSync(BACKUP_ROOT)) {
      fs.mkdirSync(BACKUP_ROOT, { recursive: true });
    }
    fs.mkdirSync(backupDir, { recursive: true });

    const collections = [
      'products.json',
      'orders.json',
      'customers.json',
      'consultations.json',
      'quotations.json',
      'returns.json',
      'emails.json',
    ];

    const exportedFiles = [];
    const stats = {};

    // 1. تصدير بيانات الكاش وقاعدة البيانات المدمجة
    for (const filename of collections) {
      try {
        const data = await jsonCache.read(filename, []);
        const targetPath = path.join(backupDir, filename);
        fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), 'utf-8');
        exportedFiles.push(filename);
        stats[filename.replace('.json', '')] = Array.isArray(data) ? data.length : 0;
      } catch (fileErr) {
        console.warn(`[Backup Warning] Could not export ${filename}:`, fileErr.message);
      }
    }

    // 2. تصدير بيانات MongoDB إذا كانت متصلة
    if (jsonCache.isMongoConnected()) {
      try {
        const models = require('../models');
        const mongoDumpDir = path.join(backupDir, 'mongodb_raw');
        fs.mkdirSync(mongoDumpDir, { recursive: true });

        for (const [modelName, Model] of Object.entries(models)) {
          try {
            const docs = await Model.find({}).lean();
            fs.writeFileSync(
              path.join(mongoDumpDir, `${modelName.toLowerCase()}.json`),
              JSON.stringify(docs, null, 2),
              'utf-8'
            );
            stats[`mongo_${modelName.toLowerCase()}`] = docs.length;
          } catch (modelErr) {
            console.warn(`[Backup Warning] Mongo export ${modelName}:`, modelErr.message);
          }
        }
      } catch (mongoErr) {
        console.warn('[Backup Notice] MongoDB raw dump notice:', mongoErr.message);
      }
    }

    // 3. كتابة ملف الميتاداتا
    const metadata = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      source: 'Amazon Furniture Disaster Recovery Unit',
      mongoConnected: jsonCache.isMongoConnected(),
      recordCounts: stats,
      filesCount: exportedFiles.length,
    };

    fs.writeFileSync(
      path.join(backupDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2),
      'utf-8'
    );

    // 4. حذف النسخ القديمة الزائدة عن الحد المسموح
    cleanupOldBackups();

    console.log(`[Disaster Recovery] Backup successfully created at: ${backupDir}`);
    return {
      success: true,
      backupDir,
      files: exportedFiles,
      timestamp: metadata.timestamp,
    };
  } catch (err) {
    console.error('[Disaster Recovery Error] Failed to create backup:', err);
    throw err;
  }
}

/**
 * تنظيف النسخ القديمة لحماية مساحة القرص
 */
function cleanupOldBackups() {
  try {
    if (!fs.existsSync(BACKUP_ROOT)) return;

    const items = fs.readdirSync(BACKUP_ROOT)
      .filter((name) => name.startsWith('backup_'))
      .map((name) => ({
        name,
        path: path.join(BACKUP_ROOT, name),
        time: fs.statSync(path.join(BACKUP_ROOT, name)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    if (items.length > MAX_BACKUPS_TO_KEEP) {
      const toDelete = items.slice(MAX_BACKUPS_TO_KEEP);
      for (const item of toDelete) {
        fs.rmSync(item.path, { recursive: true, force: true });
        console.log(`[Disaster Recovery] Purged older backup archive: ${item.name}`);
      }
    }
  } catch (cleanErr) {
    console.warn('[Backup Notice] Cleanup warning:', cleanErr.message);
  }
}

/**
 * بدء جدولة النسخ الاحتياطي التلقائي يومياً الساعة 3:00 صباحاً
 */
function scheduleBackups() {
  // تشغيل كل يوم الساعة 3:00 صباحاً بتوقيت مصر (0 3 * * *)
  cron.schedule(
    '0 3 * * *',
    async () => {
      console.log('[Disaster Recovery] Initiating scheduled 3:00 AM database backup...');
      try {
        await performBackup();
      } catch (err) {
        console.error('[Disaster Recovery] Scheduled backup failed:', err.message);
      }
    },
    {
      scheduled: true,
      timezone: 'Africa/Cairo',
    }
  );

  console.log('⏰ [Disaster Recovery] Automated 3:00 AM Daily Backup Cron: INITIALIZED');
}

// إذا تم استدعاء الملف مباشرة عبر السطر البرمجي: node scripts/backup.js
if (require.main === module) {
  (async () => {
    console.log('Starting manual backup execution...');
    try {
      const res = await performBackup();
      console.log('Backup finished successfully:', res);
      process.exit(0);
    } catch {
      process.exit(1);
    }
  })();
}

module.exports = {
  performBackup,
  scheduleBackups,
};
