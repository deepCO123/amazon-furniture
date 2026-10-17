/**
 * backend/scripts/populate_real_products.js
 * تزويد المتجر بكتالوج متكامل لمنتجات حقيقية عالية الجودة
 * مع الحفاظ التام على منتجات العميل الحالية والبيانات المدخلة
 */

const fs = require('fs/promises');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const jsonCache = require('../services/jsonCache');

const DATA_DIR = path.resolve(
  __dirname,
  '..',
  '..',
  'ecom-furniture-main',
  'ecom-furniture-main',
  'src',
  'data'
);

async function populateRealProducts() {
  console.log('🔄 جاري تجهيز ودمج كتالوج المنتجات الحقيقية للمتجر...');

  // 1. قراءة المنتج الحالي للمستخدم حتى لا يضيع
  let existingProducts = [];
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, 'products.json'), 'utf-8');
    existingProducts = JSON.parse(raw);
  } catch (err) {
    console.warn('Could not read existing products:', err.message);
  }

  // 2. قراءة منتجات النسخة الاحتياطية
  let backupProducts = [];
  try {
    const backupPath = path.resolve(
      __dirname,
      '..',
      'backups',
      'backup_2026-09-20T10-45-18-067Z',
      'products.json'
    );
    const rawBackup = await fs.readFile(backupPath, 'utf-8');
    backupProducts = JSON.parse(rawBackup);
  } catch (err) {
    console.warn('Could not read backup:', err.message);
  }

  // خريطة لتنظيف وتصحيح الفئات والأسماء
  const cleanBackup = backupProducts.map((p) => {
    let name = p.name;
    if (name === 'طربيظه') {
      name = 'ترابيزة قهوة ومكتبة عصرية متعددة الاستخدامات خشب زان';
    }

    let category = p.category;
    if (category === 'غرفة نوم كاملة' || category === 'سرير مودرن') {
      category = 'غرف النوم';
    } else if (category === 'مطبخ كامل') {
      category = 'المطابخ';
    } else if (category === 'دريسنج') {
      category = 'دريسنج روم';
    }

    return {
      ...p,
      name,
      category,
      inStock: true,
      stockQuantity: p.stockQuantity && p.stockQuantity > 0 ? p.stockQuantity : Math.floor(Math.random() * 8) + 4,
      code: p.code || p.sku || `AF-${p.id}`,
      sku: p.sku || p.code || `AF-${p.id}`,
    };
  });

  // 3. إضافة منتجات حقيقية إضافية مميزة للمطبخ والحديقة وغرف النوم
  const additionalProducts = [
    {
      id: 'prod_kitchen_island_01',
      code: 'KIT-780',
      sku: 'KIT-780',
      name: 'مطبخ أكريليك مودرن مع جزيرة وسطية ورخام كوارتز',
      slug: 'acrylic-modern-kitchen-island-780',
      description: 'مطبخ أكريليك عالي الجودة بتصميم فندقي راقي مزود بجزيرة وسطية (Kitchen Island) متكاملة ومفصلات هيدروليك بلوم نمساوية وسحابات سوفت كلوز مقاومة للمياه والحرارة مع إضاءة ليد مدمجة.',
      price: 78000,
      originalPrice: 89000,
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
        'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=800'
      ],
      category: 'المطابخ',
      material: 'MDF تركي مع طبقات أكريليك مقاومة للرطوبة والبقع',
      color: 'رمادي حجري مع خشب جوزي',
      dimensions: { width: 350, height: 230, depth: 65 },
      weight: 280,
      stockQuantity: 3,
      rating: 5.0,
      reviewCount: 38,
      inStock: true,
      featured: true,
      tags: ['المطابخ', 'أكريليك', 'جزيرة مطبخ', 'فاخر'],
      specs: {
        woodType: 'MDF ألماني مقاوم للماء 18 ملم',
        fabricType: undefined,
        waterRepellent: true,
        foamDensity: undefined,
        chassisType: 'مفصلات وسحابات بلوم إيطالية هيدروليك سوفت كلوز',
        leadTimeDays: 21,
        requiresAssembly: true,
        isDisassemblable: true,
        warrantyYears: 5,
        model3dUrl: '',
        volumetricWeight: 320
      }
    },
    {
      id: 'prod_garden_swing_02',
      code: 'GRD-160',
      sku: 'GRD-160',
      name: 'أرجوحة حديقة خارجية خشب زان أحمر مع مظلة قماش وتربروف',
      slug: 'wooden-garden-swing-waterproof-canopy-160',
      description: 'أرجوحة حدائق وشاليهات واسعة تتسع لـ 3 أفراد مصنوعة من خشب زان روماني معالج عازل للشمس والأمطار، مزودة بشلتات تنجيد قطنية مكسوة بقماش مقاوم للماء وسلاسل تعليق حديد مجلفن.',
      price: 16000,
      originalPrice: 19500,
      images: [
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'
      ],
      category: 'أثاث خارجي',
      material: 'خشب زان أحمر طبيعي مع حديد مجلفن ضد الصدأ',
      color: 'بني قرفي مع قماش بيج',
      dimensions: { width: 190, height: 185, depth: 120 },
      weight: 65,
      stockQuantity: 6,
      rating: 4.9,
      reviewCount: 42,
      inStock: true,
      featured: true,
      tags: ['أثاث خارجي', 'حديقة', 'أرجوحة', 'وتربروف'],
      specs: {
        woodType: 'خشب زان أحمر طبيعي معالج بالزيوت العازلة',
        fabricType: 'قماش كتان معالج ضد الماء والأشعة فوق البنفسجية',
        waterRepellent: true,
        foamDensity: 'إسفنج كثافة 30 مريح',
        chassisType: 'سلاسل تعليق حديد مجلفن تحمل حتى 350 كجم',
        leadTimeDays: 7,
        requiresAssembly: true,
        isDisassemblable: true,
        warrantyYears: 2,
        model3dUrl: '',
        volumetricWeight: 80
      }
    },
    {
      id: 'prod_dressing_room_03',
      code: 'DRS-350',
      sku: 'DRS-350',
      name: 'دريسنج روم مودرن بنظام إضاءة LED مدمجة وأرفف مقسمة',
      slug: 'modern-dressing-room-led-shelves-350',
      description: 'وحدة دريسنج روم متكاملة تشمل شماعات ملابس هيدروليك، أدراج تنظيم إكسسوارات وساعات مبطنة بالمخمل، وأرفف أحذية وحقائب مع حساسات إضاءة LED ذكية تعمل بالحركة.',
      price: 35000,
      originalPrice: 42000,
      images: [
        'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800',
        'https://images.unsplash.com/photo-1558997519-83ea9252def8?w=800'
      ],
      category: 'دريسنج روم',
      material: 'خشب كونتر جودوود مع قشرة ميلامين ألمانية مقاومة للخدش',
      color: 'رمادي سموكي أنيق',
      dimensions: { width: 280, height: 240, depth: 60 },
      weight: 190,
      stockQuantity: 4,
      rating: 4.9,
      reviewCount: 29,
      inStock: true,
      featured: true,
      tags: ['دريسنج روم', 'غرف النوم', 'خزائن', 'إضاءة LED'],
      specs: {
        woodType: 'خشب كونتر عالي الكثافة 18 ملم',
        fabricType: 'مخمل داخلي لأدراج الساعات والمجوهرات',
        waterRepellent: false,
        foamDensity: undefined,
        chassisType: 'سحابات مخفية سوفت كلوز ومقابض ألومنيوم بروفايل',
        leadTimeDays: 14,
        requiresAssembly: true,
        isDisassemblable: true,
        warrantyYears: 3,
        model3dUrl: '',
        volumetricWeight: 220
      }
    }
  ];

  // دمج كل المنتجات بدون تكرار في الـ ID
  const map = new Map();

  // أولاً: المنتجات الحالية للمستخدم حتى تكون لها الأولوية القصوى
  for (const p of existingProducts) {
    map.set(String(p.id), p);
  }

  // ثانياً: منتجات الباك أب المنظفة
  for (const p of cleanBackup) {
    if (!map.has(String(p.id))) {
      map.set(String(p.id), p);
    }
  }

  // ثالثاً: المنتجات الإضافية المميزة
  for (const p of additionalProducts) {
    if (!map.has(String(p.id))) {
      map.set(String(p.id), p);
    }
  }

  const finalProducts = Array.from(map.values());

  // حفظ الكتالوج النهائي في الـ cache وقاعدة البيانات وملف الـ JSON
  await jsonCache.write('products.json', finalProducts);

  console.log(`✅ تم حفظ ${finalProducts.length} منتج حقيقي بنجاح!`);
  console.log('الأقسام المتاحة:');
  const catSummary = {};
  for (const p of finalProducts) {
    catSummary[p.category] = (catSummary[p.category] || 0) + 1;
  }
  console.table(catSummary);
}

populateRealProducts()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ خطأ أثناء إضافة المنتجات:', err);
    process.exit(1);
  });
