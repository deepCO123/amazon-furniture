/**
 * backend/scripts/restore_sample_data.js
 * سكربت استرجاع البيانات التجريبية من مجلد sample_backup في أي وقت عند الحاجة
 */

const path = require('path');
const fs = require('fs/promises');

const DATA_DIR = path.resolve(
  __dirname,
  '..',
  '..',
  'ecom-furniture-main',
  'ecom-furniture-main',
  'src',
  'data'
);
const BACKUP_DIR = path.join(DATA_DIR, 'sample_backup');

const filesToRestore = [
  { backup: 'orders.sample.json', target: 'orders.json' },
  { backup: 'customers.sample.json', target: 'customers.json' },
  { backup: 'quotations.sample.json', target: 'quotations.json' },
  { backup: 'returns.sample.json', target: 'returns.json' },
  { backup: 'consultations.sample.json', target: 'consultations.json' },
  { backup: 'emails.sample.json', target: 'emails.json' },
  { backup: 'products.sample.json', target: 'products.json' },
];

async function restoreSampleData() {
  console.log('===========================================================');
  console.log('📦 استرجاع البيانات التجريبية من النسخ الاحتياطية...');
  console.log('===========================================================');

  for (const { backup, target } of filesToRestore) {
    const backupPath = path.join(BACKUP_DIR, backup);
    const targetPath = path.join(DATA_DIR, target);

    try {
      const data = await fs.readFile(backupPath, 'utf-8');
      await fs.writeFile(targetPath, data, 'utf-8');
      console.log(`  ✅ تم استرجاع: ${target}`);
    } catch (err) {
      console.error(`  ❌ تعذر استرجاع ${target}:`, err.message);
    }
  }

  console.log('===========================================================');
  console.log('🎉 تم استرجاع البيانات التجريبية بنجاح!');
  console.log('===========================================================');
}

restoreSampleData().catch(console.error);
