/**
 * سكريبت إضافة كراسي GL-135 + ركنات + كراسي متنوعة من مجلد "صور الكراسي"
 * ينسخ الصور ل public/uploads ويضيف المنتجات لـ products.json
 */
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, '../../صور الكراسي');
const DEST_DIR = path.resolve(__dirname, '../../ecom-furniture-main/ecom-furniture-main/public/uploads');
const PRODUCTS_FILE = path.resolve(__dirname, '../../ecom-furniture-main/ecom-furniture-main/src/data/products.json');

// Ensure dest dir exists
if (!fs.existsSync(DEST_DIR)) fs.mkdirSync(DEST_DIR, { recursive: true });

// List all images and group by timestamp set
const allFiles = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.jpg'));
const set1 = allFiles.filter(f => f.includes('20-36-05')).sort((a, b) => {
  const numA = parseInt(a.match(/photo_(\d+)_/)[1]);
  const numB = parseInt(b.match(/photo_(\d+)_/)[1]);
  return numA - numB;
});
const set2 = allFiles.filter(f => f.includes('20-36-58')).sort((a, b) => {
  const numA = parseInt(a.match(/photo_(\d+)_/)[1]);
  const numB = parseInt(b.match(/photo_(\d+)_/)[1]);
  return numA - numB;
});
const set3 = allFiles.filter(f => f.includes('20-37-07')).sort((a, b) => {
  const numA = parseInt(a.match(/photo_(\d+)_/)[1]);
  const numB = parseInt(b.match(/photo_(\d+)_/)[1]);
  return numA - numB;
});

console.log(`Set1 (studio chairs): ${set1.length} images`);
console.log(`Set2 (showroom chairs): ${set2.length} images`);
console.log(`Set3 (mixed chairs+sofas): ${set3.length} images`);

// Copy all files to uploads with clean names
function copyImage(srcName, destName) {
  const src = path.join(SRC_DIR, srcName);
  const dest = path.join(DEST_DIR, destName);
  fs.copyFileSync(src, dest);
  return `/uploads/${destName}`;
}

// ============================================================
// PRODUCT DEFINITIONS
// ============================================================

/*
Based on visual inspection of the 3 sets:

SET 1 (20-36-05): 100 studio photos of individual office chairs on white background
  - Photos 1-2: Blue mesh high-back with headrest (GL-135 style, blue seat, chrome base)
  - Photos 3-4: Black mesh medium/waiting variants
  - Photos 5-6: Black mesh high-back with headrest
  - Photos 7-100: Various office chairs (mesh, leather, gaming, etc.)

SET 2 (20-36-58): 100 showroom photos
  - Photos 1-100: Various chairs in showroom setting

SET 3 (20-37-07): 15 images with mix
  - Photo 1: Black leather sofa set (ركنة/أنتريه جلد أسود)
  - Photo 2: High-back mesh chair with white frame (behind view)
  - Photo 3: Grey mesh medium office chair 
  - Photo 4: Black mesh waiting chair (cantilever base)
  - Photo 5: Leather tufted set HIGH+MEDIUM+WAITING  
  - Photo 6: High-back mesh chair with headrest (real photo)
  - Photo 7: Grey leather armchair (ركنة فردي)
  - Photo 8: Black leather executive high-back
  - Photo 9: Black leather set HIGH+MEDIUM+WAITING
  - Photo 10: Brown leather waiting chair (cantilever)
  - Photo 11: Brown leather high-back chair
  - Photo 12: Green/teal leather high-back
  - Photo 13: Tan leather high-back executive
  - Photo 14: Orange/camel leather sofa set (ركنة/أنتريه)
  - Photo 15: Mesh chairs set (4 variants: white medium, green medium, green waiting, black high)

We'll create products grouping related images together as variants.
User wants GL-135 code with HIGH, MEDIUM, WAITING variants.
*/

const newProducts = [];
let idCounter = 1;

function makeId(suffix) {
  return `prod_gl135_${suffix}_${idCounter++}`;
}

// =========================================
// GROUP A: كراسي مكتب شبك طبية GL-135
// =========================================

// GL-135-HIGH (Blue mesh high-back with headrest) - from Set1 photo1,2 + Set3 photo6
const imgA1 = copyImage('photo_1_2026-10-18_20-36-05.jpg', 'gl135-high-blue-front.jpg');
const imgA2 = copyImage('photo_2_2026-10-18_20-36-05.jpg', 'gl135-high-blue-angles.jpg');
const imgA3 = copyImage('photo_6_2026-10-18_20-36-05.jpg', 'gl135-high-black-side.jpg');
const imgA4 = copyImage('photo_5_2026-10-18_20-36-05.jpg', 'gl135-high-black-front.jpg');
const imgA5 = copyImage('photo_6_2026-10-18_20-37-07.jpg', 'gl135-high-real-front.jpg');

newProducts.push({
  id: 'prod_gl135_high',
  name: 'كرسي مكتب طبي شبك ظهر عالي بمسند رأس هيدروليك - كود GL-135 High',
  code: 'GL-135-HIGH',
  sku: 'GL-135-HIGH',
  slug: 'gl-135-high-ergonomic-mesh-chair',
  description: 'كرسي مكتب طبي شبك كود GL-135 High بمسند رأس قابل للتعديل وظهر عالي شبكي يوفر دعم كامل للعمود الفقري والمنطقة القطنية. يتميز بمساند أذرع قابلة للتعديل، وقاعدة كروم 5 فروع مع عجلات انسيابية صامتة، وميكانيزم هيدروليك للتحكم في الارتفاع والميل. مثالي لساعات العمل الطويلة في المكتب.',
  price: 4850,
  originalPrice: 5200,
  images: [imgA1, imgA2, imgA3, imgA4, imgA5],
  category: 'كراسي مكتب',
  material: 'شبك طبي تنفسي + إسفنج عالي الكثافة + شاسيه كروم',
  color: 'أسود',
  dimensions: { width: 65, height: 125, depth: 60 },
  weight: 16,
  stockQuantity: 15,
  returnCount: 0,
  totalSold: 0,
  rating: 5,
  reviewCount: 3,
  inStock: true,
  featured: true,
  tags: ['كراسي مكتب', 'كراسي طبية', 'GL-135', 'شبك', 'هيدروليك'],
  specs: {
    'نوع الظهر': 'شبك طبي تنفسي ظهر عالي',
    'مسند الرأس': 'قابل للتعديل ارتفاع وزاوية',
    'الشاسيه': 'كروم نيكل 5 فروع',
    'العجلات': 'انسيابية صامتة PU',
    'الميكانيزم': 'هيدروليك ارتفاع + ميل',
    'مساند الأذرع': 'قابلة للتعديل'
  }
});

// GL-135-MEDIUM (mesh mid-back) - from Set1 photo3,4 + Set3 photo3
const imgB1 = copyImage('photo_3_2026-10-18_20-37-07.jpg', 'gl135-medium-grey-front.jpg');
const imgB2 = copyImage('photo_3_2026-10-18_20-36-05.jpg', 'gl135-medium-studio1.jpg');
const imgB3 = copyImage('photo_4_2026-10-18_20-36-05.jpg', 'gl135-medium-studio2.jpg');

newProducts.push({
  id: 'prod_gl135_medium',
  name: 'كرسي مكتب طبي شبك ظهر متوسط هيدروليك - كود GL-135 Medium',
  code: 'GL-135-MEDIUM',
  sku: 'GL-135-MEDIUM',
  slug: 'gl-135-medium-mesh-office-chair',
  description: 'كرسي مكتب طبي شبك كود GL-135 Medium بظهر متوسط شبكي مريح وداعم. يتميز بمساند أذرع ثابتة مريحة ومقعد إسفنجي مبطن عالي الكثافة وقاعدة كروم 5 فروع صلبة. مناسب للمكاتب وقاعات الاجتماعات.',
  price: 3450,
  originalPrice: 3800,
  images: [imgB1, imgB2, imgB3],
  category: 'كراسي مكتب',
  material: 'شبك طبي + إسفنج عالي الكثافة + شاسيه كروم',
  color: 'أسود × رمادي',
  dimensions: { width: 60, height: 100, depth: 58 },
  weight: 13,
  stockQuantity: 20,
  returnCount: 0,
  totalSold: 0,
  rating: 4.8,
  reviewCount: 5,
  inStock: true,
  featured: false,
  tags: ['كراسي مكتب', 'كراسي طبية', 'GL-135', 'شبك', 'هيدروليك'],
  specs: {
    'نوع الظهر': 'شبك طبي تنفسي ظهر متوسط',
    'مسند الرأس': 'بدون',
    'الشاسيه': 'كروم نيكل 5 فروع',
    'العجلات': 'انسيابية صامتة PU',
    'الميكانيزم': 'هيدروليك ارتفاع',
    'مساند الأذرع': 'ثابتة مريحة'
  }
});

// GL-135-WAITING (cantilever/sled base) - from Set1 photo4 + Set2 photo1 + Set3 photo4
const imgC1 = copyImage('photo_1_2026-10-18_20-36-58.jpg', 'gl135-waiting-showroom.jpg');
const imgC2 = copyImage('photo_4_2026-10-18_20-37-07.jpg', 'gl135-waiting-studio.jpg');

newProducts.push({
  id: 'prod_gl135_waiting',
  name: 'كرسي انتظار ومؤتمرات شبك طبي شاسيه زلاجة - كود GL-135 Waiting',
  code: 'GL-135-WAITING',
  sku: 'GL-135-WAITING',
  slug: 'gl-135-waiting-cantilever-mesh-chair',
  description: 'كرسي انتظار ومؤتمرات كود GL-135 Waiting بظهر شبكي طبي تنفسي وقاعدة زلاجة (كانتيليفر) كروم ثابتة وأنيقة. مثالي لقاعات الانتظار والاجتماعات والمكاتب الاستقبالية.',
  price: 2950,
  originalPrice: 3200,
  images: [imgC1, imgC2],
  category: 'كراسي مكتب',
  material: 'شبك طبي + إسفنج عالي الكثافة + شاسيه كروم زلاجة',
  color: 'أسود',
  dimensions: { width: 58, height: 95, depth: 55 },
  weight: 11,
  stockQuantity: 25,
  returnCount: 0,
  totalSold: 0,
  rating: 4.9,
  reviewCount: 6,
  inStock: true,
  featured: false,
  tags: ['كراسي مكتب', 'كراسي انتظار', 'GL-135', 'شبك', 'زلاجة'],
  specs: {
    'نوع الظهر': 'شبك طبي تنفسي',
    'مسند الرأس': 'بدون',
    'الشاسيه': 'كروم زلاجة (كانتيليفر) ثابتة',
    'العجلات': 'بدون (ثابت)',
    'مساند الأذرع': 'مبطنة مريحة'
  }
});

// =========================================
// GROUP B: كراسي مكتب جلد ومختلفة
// =========================================

// Chair with writing tablet (training/conference) - Set2 photo2
const imgD1 = copyImage('photo_2_2026-10-18_20-36-58.jpg', 'training-chair-tablet.jpg');
newProducts.push({
  id: 'prod_training_chair_01',
  name: 'كرسي تدريب ومحاضرات شبك طبي بذراع كتابة قابل للطي وحامل أكواب',
  code: 'GL-135-TR',
  sku: 'GL-135-TR',
  slug: 'training-chair-writing-tablet-mesh',
  description: 'كرسي تدريب ومحاضرات بتصميم أنيق وعملي، مزود بذراع كتابة قابل للطي وحامل أكواب مدمج. ظهر شبكي طبي تنفسي ومقعد إسفنجي مريح وشاسيه كروم 4 أرجل ثابت.',
  price: 2750,
  originalPrice: 3000,
  images: [imgD1],
  category: 'كراسي مكتب',
  material: 'شبك طبي + إسفنج + شاسيه كروم',
  color: 'أسود',
  dimensions: { width: 60, height: 85, depth: 55 },
  weight: 9,
  stockQuantity: 30,
  returnCount: 0,
  totalSold: 0,
  rating: 4.7,
  reviewCount: 4,
  inStock: true,
  featured: false,
  tags: ['كراسي مكتب', 'كراسي تدريب', 'GL-135', 'ذراع كتابة'],
  specs: {
    'نوع الظهر': 'شبك طبي تنفسي',
    'ذراع الكتابة': 'قابل للطي مع حامل أكواب',
    'الشاسيه': 'كروم 4 أرجل ثابت'
  }
});

// Modern designer chair black/white - Set2 photo3
const imgE1 = copyImage('photo_3_2026-10-18_20-36-58.jpg', 'designer-chair-bw.jpg');
newProducts.push({
  id: 'prod_designer_chair_bw',
  name: 'كرسي مودرن ديزاينر جلد أبيض × أسود بقاعدة معدنية',
  code: 'GL-135-DSN',
  sku: 'GL-135-DSN',
  slug: 'designer-modern-chair-black-white',
  description: 'كرسي مودرن بتصميم إيطالي أنيق، تنجيد جلد PU فاخر بمزيج الأبيض والأسود، مقعد مبطن مريح وظهر ملفوف، قاعدة معدنية 4 أرجل عصرية. مثالي للمكاتب التنفيذية وغرف الاستقبال.',
  price: 3200,
  originalPrice: 3500,
  images: [imgE1],
  category: 'كراسي مكتب',
  material: 'جلد PU فاخر + إسفنج + قاعدة معدنية',
  color: 'أبيض × أسود',
  dimensions: { width: 62, height: 82, depth: 58 },
  weight: 10,
  stockQuantity: 12,
  returnCount: 0,
  totalSold: 0,
  rating: 4.9,
  reviewCount: 2,
  inStock: true,
  featured: true,
  tags: ['كراسي مكتب', 'كراسي ديزاينر', 'GL-135', 'جلد', 'مودرن'],
  specs: {
    'الخامة': 'جلد PU إيطالي فاخر',
    'القاعدة': 'معدنية 4 أرجل',
    'التنجيد': 'أبيض × أسود'
  }
});

// Executive leather chairs (High+Medium+Waiting sets from Set3)
// Set3 photo5: Tufted leather set
const imgF1 = copyImage('photo_5_2026-10-18_20-37-07.jpg', 'gl135-leather-tufted-set.jpg');
newProducts.push({
  id: 'prod_gl135_leather_tufted_high',
  name: 'كرسي مكتب جلد مربعات فاخر ظهر عالي - كود GL-135 Leather High',
  code: 'GL-135-LTH-HIGH',
  sku: 'GL-135-LTH-HIGH',
  slug: 'gl-135-leather-tufted-high-executive',
  description: 'كرسي مكتب تنفيذي جلد فاخر بتصميم مربعات (Tufted) وظهر عالي. يتميز بجلد PU عالي الجودة مع خياطة دقيقة، مساند أذرع كروم أنيقة، قاعدة 5 فروع كروم متينة. متوفر في مجموعة كاملة (High + Medium + Waiting).',
  price: 5850,
  originalPrice: 6500,
  images: [imgF1],
  category: 'كراسي مكتب',
  material: 'جلد PU فاخر مربعات + شاسيه كروم',
  color: 'أسود',
  dimensions: { width: 68, height: 120, depth: 65 },
  weight: 20,
  stockQuantity: 8,
  returnCount: 0,
  totalSold: 0,
  rating: 5,
  reviewCount: 3,
  inStock: true,
  featured: true,
  tags: ['كراسي مكتب', 'كراسي تنفيذية', 'GL-135', 'جلد', 'مربعات'],
  specs: {
    'الخامة': 'جلد PU فاخر Tufted',
    'الظهر': 'عالي مع دعم قطني',
    'الشاسيه': 'كروم 5 فروع',
    'الميكانيزم': 'هيدروليك ارتفاع + ميل'
  }
});

// Set3 photo9: Plain leather set (High+Medium+Waiting)
const imgG1 = copyImage('photo_9_2026-10-18_20-37-07.jpg', 'gl135-leather-plain-set.jpg');
newProducts.push({
  id: 'prod_gl135_leather_plain_high',
  name: 'كرسي مكتب جلد كلاسيك ظهر عالي تنفيذي - كود GL-135 Classic High',
  code: 'GL-135-CLS-HIGH',
  sku: 'GL-135-CLS-HIGH',
  slug: 'gl-135-classic-leather-high-executive',
  description: 'كرسي مكتب تنفيذي جلد كلاسيكي فاخر بظهر عالي ومساند أذرع مبطنة جلد. تصميم أنيق يناسب المكاتب الإدارية ورجال الأعمال. قاعدة كروم 5 فروع مع عجلات صامتة.',
  price: 5450,
  originalPrice: 6000,
  images: [imgG1],
  category: 'كراسي مكتب',
  material: 'جلد PU كلاسيكي + شاسيه كروم',
  color: 'أسود',
  dimensions: { width: 66, height: 118, depth: 63 },
  weight: 19,
  stockQuantity: 10,
  returnCount: 0,
  totalSold: 0,
  rating: 4.9,
  reviewCount: 5,
  inStock: true,
  featured: false,
  tags: ['كراسي مكتب', 'كراسي تنفيذية', 'GL-135', 'جلد', 'كلاسيك'],
  specs: {
    'الخامة': 'جلد PU كلاسيكي',
    'الظهر': 'عالي مع دعم قطني',
    'الشاسيه': 'كروم 5 فروع'
  }
});

// Set3 photo8: Premium executive black leather high-back
const imgH1 = copyImage('photo_8_2026-10-18_20-37-07.jpg', 'gl135-executive-black-high.jpg');
newProducts.push({
  id: 'prod_gl135_executive_black',
  name: 'كرسي مدير تنفيذي جلد فاخر ظهر عالي بريميوم - كود GL-135 Executive',
  code: 'GL-135-EXEC',
  sku: 'GL-135-EXEC',
  slug: 'gl-135-executive-premium-leather-chair',
  description: 'كرسي مدير تنفيذي بريميوم بتصميم حصري، جلد طبيعي فاخر بظهر عالي جداً مع دعم كامل للرأس والعمود الفقري. مساند أذرع عريضة مبطنة، قاعدة نجمة 5 فروع فولاذية مع عجلات سايلنت.',
  price: 7950,
  originalPrice: 8800,
  images: [imgH1],
  category: 'كراسي مكتب',
  material: 'جلد طبيعي فاخر + قاعدة فولاذية',
  color: 'أسود',
  dimensions: { width: 70, height: 135, depth: 68 },
  weight: 24,
  stockQuantity: 5,
  returnCount: 0,
  totalSold: 0,
  rating: 5,
  reviewCount: 2,
  inStock: true,
  featured: true,
  tags: ['كراسي مكتب', 'كراسي تنفيذية', 'GL-135', 'جلد طبيعي', 'بريميوم'],
  specs: {
    'الخامة': 'جلد طبيعي بريميوم',
    'الظهر': 'عالي جداً مع دعم رأس مدمج',
    'الشاسيه': 'فولاذ كروم 5 فروع',
    'الميكانيزم': 'هيدروليك + ميل + قفل'
  }
});

// Set3 photo13: Tan/camel leather high-back executive
const imgI1 = copyImage('photo_13_2026-10-18_20-37-07.jpg', 'gl135-executive-tan.jpg');
newProducts.push({
  id: 'prod_gl135_executive_tan',
  name: 'كرسي مدير تنفيذي جلد بيج ظهر عالي - كود GL-135 Executive Tan',
  code: 'GL-135-EXEC-TAN',
  sku: 'GL-135-EXEC-TAN',
  slug: 'gl-135-executive-tan-leather-chair',
  description: 'كرسي مدير تنفيذي بلون بيج/كاميل أنيق بظهر عالي وجلد PU فاخر. تصميم عصري مع مساند أذرع رمادية قابلة للتعديل. مناسب للمكاتب التنفيذية ذات الديكور المودرن.',
  price: 6500,
  originalPrice: 7200,
  images: [imgI1],
  category: 'كراسي مكتب',
  material: 'جلد PU فاخر + شاسيه ألومنيوم',
  color: 'بيج / كاميل',
  dimensions: { width: 66, height: 128, depth: 64 },
  weight: 18,
  stockQuantity: 6,
  returnCount: 0,
  totalSold: 0,
  rating: 5,
  reviewCount: 1,
  inStock: true,
  featured: true,
  tags: ['كراسي مكتب', 'كراسي تنفيذية', 'GL-135', 'جلد', 'بيج'],
  specs: {
    'الخامة': 'جلد PU فاخر',
    'اللون': 'بيج / كاميل',
    'الظهر': 'عالي مع مسند رأس مدمج',
    'الشاسيه': 'ألومنيوم 5 فروع'
  }
});

// Set3 photo11: Brown leather high-back
const imgJ1 = copyImage('photo_11_2026-10-18_20-37-07.jpg', 'gl135-leather-brown-high.jpg');
newProducts.push({
  id: 'prod_gl135_leather_brown',
  name: 'كرسي مكتب تنفيذي جلد بني ظهر عالي كروم - كود GL-135 Brown',
  code: 'GL-135-BRN',
  sku: 'GL-135-BRN',
  slug: 'gl-135-brown-leather-executive-chair',
  description: 'كرسي مكتب تنفيذي بجلد PU بني فاخر وظهر عالي مع مساند أذرع كروم. تصميم كلاسيكي أنيق يضيف لمسة فخامة لأي مكتب.',
  price: 5250,
  originalPrice: 5800,
  images: [imgJ1],
  category: 'كراسي مكتب',
  material: 'جلد PU بني + شاسيه كروم',
  color: 'بني',
  dimensions: { width: 65, height: 122, depth: 62 },
  weight: 18,
  stockQuantity: 8,
  returnCount: 0,
  totalSold: 0,
  rating: 4.8,
  reviewCount: 3,
  inStock: true,
  featured: false,
  tags: ['كراسي مكتب', 'كراسي تنفيذية', 'GL-135', 'جلد', 'بني'],
  specs: {
    'الخامة': 'جلد PU بني فاخر',
    'الظهر': 'عالي',
    'الشاسيه': 'كروم 5 فروع'
  }
});

// Set3 photo12: Green/teal leather high-back
const imgK1 = copyImage('photo_12_2026-10-18_20-37-07.jpg', 'gl135-leather-green-high.jpg');
newProducts.push({
  id: 'prod_gl135_leather_green',
  name: 'كرسي مكتب تنفيذي جلد أخضر زيتي ظهر عالي - كود GL-135 Green',
  code: 'GL-135-GRN',
  sku: 'GL-135-GRN',
  slug: 'gl-135-green-leather-executive-chair',
  description: 'كرسي مكتب تنفيذي بجلد PU أخضر زيتي أنيق وظهر عالي. لون مميز يضيف لمسة عصرية وفريدة للمكتب. قاعدة كروم 5 فروع متينة.',
  price: 5250,
  originalPrice: 5800,
  images: [imgK1],
  category: 'كراسي مكتب',
  material: 'جلد PU أخضر + شاسيه كروم',
  color: 'أخضر زيتي',
  dimensions: { width: 65, height: 130, depth: 62 },
  weight: 17,
  stockQuantity: 6,
  returnCount: 0,
  totalSold: 0,
  rating: 5,
  reviewCount: 2,
  inStock: true,
  featured: false,
  tags: ['كراسي مكتب', 'كراسي تنفيذية', 'GL-135', 'جلد', 'أخضر'],
  specs: {
    'الخامة': 'جلد PU أخضر زيتي',
    'الظهر': 'عالي سليم',
    'الشاسيه': 'كروم 5 فروع'
  }
});

// Set3 photo10: Brown leather waiting (cantilever)
const imgL1 = copyImage('photo_10_2026-10-18_20-37-07.jpg', 'gl135-leather-brown-waiting.jpg');
newProducts.push({
  id: 'prod_gl135_leather_waiting',
  name: 'كرسي انتظار جلد بني شاسيه زلاجة كروم - كود GL-135 Leather Waiting',
  code: 'GL-135-LTH-WAIT',
  sku: 'GL-135-LTH-WAIT',
  slug: 'gl-135-brown-leather-waiting-cantilever',
  description: 'كرسي انتظار ومؤتمرات بتصميم أنيق، جلد PU بني فاخر وشاسيه كروم زلاجة ثابت (كانتيليفر). مثالي لقاعات الانتظار والمؤتمرات.',
  price: 3650,
  originalPrice: 4000,
  images: [imgL1],
  category: 'كراسي مكتب',
  material: 'جلد PU بني + شاسيه كروم زلاجة',
  color: 'بني',
  dimensions: { width: 58, height: 98, depth: 55 },
  weight: 12,
  stockQuantity: 15,
  returnCount: 0,
  totalSold: 0,
  rating: 4.8,
  reviewCount: 4,
  inStock: true,
  featured: false,
  tags: ['كراسي مكتب', 'كراسي انتظار', 'GL-135', 'جلد', 'زلاجة'],
  specs: {
    'الخامة': 'جلد PU بني',
    'الشاسيه': 'كروم زلاجة كانتيليفر',
    'مساند الأذرع': 'مبطنة جلد'
  }
});

// Set3 photo2: High-back mesh with white frame (behind view)
const imgM1 = copyImage('photo_2_2026-10-18_20-37-07.jpg', 'gl135-mesh-whiteframe-back.jpg');
newProducts.push({
  id: 'prod_gl135_mesh_whiteframe',
  name: 'كرسي مكتب طبي شبك فريم أبيض ظهر عالي بمسند رأس - كود GL-135 White',
  code: 'GL-135-WHT',
  sku: 'GL-135-WHT',
  slug: 'gl-135-white-frame-mesh-chair',
  description: 'كرسي مكتب طبي شبك بفريم أبيض عصري وظهر عالي مع مسند رأس. تصميم مودرن مع دعم قطني ومساند أذرع قابلة للتعديل. قاعدة 5 فروع سوداء مع عجلات صامتة.',
  price: 4250,
  originalPrice: 4700,
  images: [imgM1],
  category: 'كراسي مكتب',
  material: 'شبك طبي + فريم بولي أبيض + قاعدة 5 فروع',
  color: 'أسود × أبيض',
  dimensions: { width: 64, height: 126, depth: 60 },
  weight: 15,
  stockQuantity: 10,
  returnCount: 0,
  totalSold: 0,
  rating: 4.9,
  reviewCount: 3,
  inStock: true,
  featured: true,
  tags: ['كراسي مكتب', 'كراسي طبية', 'GL-135', 'شبك', 'أبيض'],
  specs: {
    'الفريم': 'بولي أبيض',
    'الظهر': 'شبك طبي ظهر عالي',
    'مسند الرأس': 'شبك قابل للتعديل',
    'الشاسيه': '5 فروع أسود'
  }
});

// Set3 photo15: Mesh chairs 4 variants set (colored)
const imgN1 = copyImage('photo_15_2026-10-18_20-37-07.jpg', 'gl135-mesh-color-set.jpg');
newProducts.push({
  id: 'prod_gl135_mesh_color',
  name: 'كرسي مكتب شبك ألوان متعددة (أبيض/أخضر/أسود) - كود GL-135 Color',
  code: 'GL-135-CLR',
  sku: 'GL-135-CLR',
  slug: 'gl-135-colorful-mesh-office-chair-set',
  description: 'مجموعة كراسي مكتب شبك طبي متوفرة بألوان متعددة: أبيض، أخضر ليموني، وأسود. تشمل فئات مختلفة: ظهر متوسط مع عجلات، ظهر عالي بمسند رأس، وانتظار زلاجة. مناسبة للمكاتب العصرية.',
  price: 2850,
  originalPrice: 3200,
  images: [imgN1],
  category: 'كراسي مكتب',
  material: 'شبك طبي ملون + شاسيه كروم',
  color: 'متعدد الألوان',
  dimensions: { width: 60, height: 105, depth: 58 },
  weight: 12,
  stockQuantity: 20,
  returnCount: 0,
  totalSold: 0,
  rating: 4.7,
  reviewCount: 8,
  inStock: true,
  featured: false,
  tags: ['كراسي مكتب', 'كراسي طبية', 'GL-135', 'شبك', 'ألوان'],
  specs: {
    'الألوان المتاحة': 'أبيض / أخضر ليموني / أسود',
    'الأنواع': 'Medium + High + Waiting',
    'الشاسيه': 'كروم 5 فروع / زلاجة'
  }
});

// =========================================
// GROUP C: ركن ومجالس وأنتريهات
// =========================================

// Set3 photo1: Black leather sofa set (diamond quilted)
const imgO1 = copyImage('photo_1_2026-10-18_20-37-07.jpg', 'gl135-sofa-black-diamond.jpg');
newProducts.push({
  id: 'prod_gl135_sofa_black',
  name: 'طقم أنتريه جلد أسود مبطن تصميم ماسي - كنبة 3 مقاعد + 2 فوتيه',
  code: 'GL-135-SOFA-BLK',
  sku: 'GL-135-SOFA-BLK',
  slug: 'gl-135-black-diamond-leather-sofa-set',
  description: 'طقم أنتريه مكتبي فاخر من الجلد الأسود بتصميم ماسي (Diamond Quilted) أنيق. يتكون من كنبة 3 مقاعد + 2 فوتيه فردي. مناسب لمكاتب المديرين وقاعات الاستقبال والانتظار VIP. أرجل كروم أنيقة.',
  price: 18500,
  originalPrice: 21000,
  images: [imgO1],
  category: 'ركن ومجالس',
  material: 'جلد PU أسود Diamond + أرجل كروم',
  color: 'أسود',
  dimensions: { width: 200, height: 80, depth: 75 },
  weight: 65,
  stockQuantity: 3,
  returnCount: 0,
  totalSold: 0,
  rating: 5,
  reviewCount: 2,
  inStock: true,
  featured: true,
  tags: ['ركن ومجالس', 'أنتريه', 'GL-135', 'جلد', 'مكتبي'],
  specs: {
    'المكونات': 'كنبة 3 مقاعد + 2 فوتيه فردي',
    'الخامة': 'جلد PU ماسي',
    'الأرجل': 'كروم',
    'الطول': '200 سم (الكنبة)'
  }
});

// Set3 photo14: Orange/camel leather sofa set
const imgP1 = copyImage('photo_14_2026-10-18_20-37-07.jpg', 'gl135-sofa-camel.jpg');
newProducts.push({
  id: 'prod_gl135_sofa_camel',
  name: 'طقم أنتريه جلد كاميل/برتقالي فاخر - كنبة 3 مقاعد + 2 فوتيه',
  code: 'GL-135-SOFA-CML',
  sku: 'GL-135-SOFA-CML',
  slug: 'gl-135-camel-leather-sofa-set',
  description: 'طقم أنتريه مكتبي فاخر من الجلد الكاميل/البرتقالي بتصميم عصري أنيق مع خطوط V مميزة. يتكون من كنبة 3 مقاعد + 2 فوتيه فردي. أرجل خشب زان. مثالي للمكاتب التنفيذية الفاخرة.',
  price: 19500,
  originalPrice: 22000,
  images: [imgP1],
  category: 'ركن ومجالس',
  material: 'جلد PU كاميل + أرجل خشب زان',
  color: 'كاميل / برتقالي',
  dimensions: { width: 200, height: 78, depth: 75 },
  weight: 60,
  stockQuantity: 3,
  returnCount: 0,
  totalSold: 0,
  rating: 5,
  reviewCount: 1,
  inStock: true,
  featured: true,
  tags: ['ركن ومجالس', 'أنتريه', 'GL-135', 'جلد', 'كاميل'],
  specs: {
    'المكونات': 'كنبة 3 مقاعد + 2 فوتيه فردي',
    'الخامة': 'جلد PU كاميل',
    'الأرجل': 'خشب زان',
    'الطول': '200 سم (الكنبة)'
  }
});

// Set3 photo7: Grey leather armchair
const imgQ1 = copyImage('photo_7_2026-10-18_20-37-07.jpg', 'gl135-armchair-grey.jpg');
newProducts.push({
  id: 'prod_gl135_armchair_grey',
  name: 'فوتيه استقبال جلد رمادي مودرن بوسادة ديكور - كود GL-135',
  code: 'GL-135-ARM-GRY',
  sku: 'GL-135-ARM-GRY',
  slug: 'gl-135-grey-modern-armchair',
  description: 'فوتيه استقبال مودرن بتصميم إيطالي عصري، جلد PU رمادي فاخر مع وسادة ديكور بحزام جلد. أرجل خشب أسود. مثالي لمناطق الاستقبال والانتظار.',
  price: 6500,
  originalPrice: 7200,
  images: [imgQ1],
  category: 'ركن ومجالس',
  material: 'جلد PU رمادي + أرجل خشب',
  color: 'رمادي',
  dimensions: { width: 78, height: 80, depth: 72 },
  weight: 22,
  stockQuantity: 6,
  returnCount: 0,
  totalSold: 0,
  rating: 4.9,
  reviewCount: 3,
  inStock: true,
  featured: false,
  tags: ['ركن ومجالس', 'فوتيه', 'GL-135', 'جلد', 'رمادي', 'مودرن'],
  specs: {
    'الخامة': 'جلد PU رمادي فاخر',
    'الأرجل': 'خشب أسود',
    'الوسادة': 'مع حزام جلد ديكور'
  }
});

// =========================================
// GROUP D: More showroom chairs (Set2 - best picks)
// =========================================

// Copy additional good showroom images for variety
const imgR1 = copyImage('photo_4_2026-10-18_20-36-58.jpg', 'gl135-showroom-chair-04.jpg');
const imgR2 = copyImage('photo_5_2026-10-18_20-36-58.jpg', 'gl135-showroom-chair-05.jpg');
const imgR3 = copyImage('photo_6_2026-10-18_20-36-58.jpg', 'gl135-showroom-chair-06.jpg');
const imgR4 = copyImage('photo_7_2026-10-18_20-36-58.jpg', 'gl135-showroom-chair-07.jpg');

// Set2 photo4: Upholstered modern chair
newProducts.push({
  id: 'prod_gl135_modern_upholstered',
  name: 'كرسي مكتب مبطن شبك ظهر عالي كروم - كود GL-135 Comfort',
  code: 'GL-135-CMF',
  sku: 'GL-135-CMF',
  slug: 'gl-135-comfort-upholstered-mesh-chair',
  description: 'كرسي مكتب مريح بظهر شبكي عالي ومقعد إسفنجي سميك مبطن. تصميم مريح للجلوس لفترات طويلة مع دعم كامل للظهر.',
  price: 3850,
  originalPrice: 4200,
  images: [imgR1],
  category: 'كراسي مكتب',
  material: 'شبك + إسفنج عالي الكثافة + كروم',
  color: 'أسود',
  dimensions: { width: 62, height: 108, depth: 60 },
  weight: 14,
  stockQuantity: 12,
  returnCount: 0,
  totalSold: 0,
  rating: 4.8,
  reviewCount: 6,
  inStock: true,
  featured: false,
  tags: ['كراسي مكتب', 'GL-135', 'مبطن', 'شبك'],
  specs: {}
});

// Set2 photo5: Another elegant chair from showroom
newProducts.push({
  id: 'prod_gl135_elegant_showroom',
  name: 'كرسي مكتب شبك طبي ظهر عالي بمسند رأس إسفنجي - كود GL-135 Ergo',
  code: 'GL-135-ERG',
  sku: 'GL-135-ERG',
  slug: 'gl-135-ergonomic-headrest-mesh-chair',
  description: 'كرسي مكتب طبي إرجونوميك بظهر شبكي عالي ومسند رأس إسفنجي مريح. يدعم الجلوس الصحيح لفترات طويلة مع مساند أذرع رمادية أنيقة.',
  price: 4650,
  originalPrice: 5100,
  images: [imgR2],
  category: 'كراسي مكتب',
  material: 'شبك طبي + إسفنج + شاسيه كروم',
  color: 'أسود × رمادي',
  dimensions: { width: 64, height: 125, depth: 62 },
  weight: 16,
  stockQuantity: 10,
  returnCount: 0,
  totalSold: 0,
  rating: 4.9,
  reviewCount: 4,
  inStock: true,
  featured: false,
  tags: ['كراسي مكتب', 'كراسي طبية', 'GL-135', 'شبك', 'إرجونوميك'],
  specs: {}
});

// Set2 photo6: Headrest mesh
newProducts.push({
  id: 'prod_gl135_headrest_showroom',
  name: 'كرسي مكتب طبي شبك بمسند رأس ظهر عالي أسود - كود GL-135 Pro',
  code: 'GL-135-PRO',
  sku: 'GL-135-PRO',
  slug: 'gl-135-pro-mesh-headrest-chair',
  description: 'كرسي مكتب طبي احترافي بظهر شبكي عالي ومسند رأس قابل للتعديل. قاعدة نجمة كروم فاخرة مع عجلات سايلنت.',
  price: 3950,
  originalPrice: 4300,
  images: [imgR3],
  category: 'كراسي مكتب',
  material: 'شبك طبي + إسفنج + كروم',
  color: 'أسود',
  dimensions: { width: 63, height: 120, depth: 60 },
  weight: 15,
  stockQuantity: 15,
  returnCount: 0,
  totalSold: 0,
  rating: 4.8,
  reviewCount: 5,
  inStock: true,
  featured: false,
  tags: ['كراسي مكتب', 'كراسي طبية', 'GL-135', 'شبك'],
  specs: {}
});

// Set2 photo7: Leather executive showroom
newProducts.push({
  id: 'prod_gl135_leather_showroom',
  name: 'كرسي مكتب جلد تنفيذي ظهر عالي مع مسند قدم - كود GL-135 Royal',
  code: 'GL-135-RYL',
  sku: 'GL-135-RYL',
  slug: 'gl-135-royal-leather-reclining-chair',
  description: 'كرسي مكتب تنفيذي جلد فاخر بظهر عالي. تصميم ملكي أنيق مع تبطين فاخر ومساند أذرع مريحة.',
  price: 5850,
  originalPrice: 6400,
  images: [imgR4],
  category: 'كراسي مكتب',
  material: 'جلد PU فاخر + شاسيه كروم',
  color: 'أسود',
  dimensions: { width: 68, height: 125, depth: 65 },
  weight: 20,
  stockQuantity: 8,
  returnCount: 0,
  totalSold: 0,
  rating: 5,
  reviewCount: 3,
  inStock: true,
  featured: false,
  tags: ['كراسي مكتب', 'كراسي تنفيذية', 'GL-135', 'جلد'],
  specs: {}
});

// =========================================
// Now copy MORE of Set1 and Set2 photos as extra images for more products
// =========================================

// More Set1 studio photos as additional products
for (let i = 7; i <= 30; i++) {
  const srcName = `photo_${i}_2026-10-18_20-36-05.jpg`;
  if (fs.existsSync(path.join(SRC_DIR, srcName))) {
    copyImage(srcName, `gl135-studio-${String(i).padStart(2, '0')}.jpg`);
  }
}

// More Set2 showroom photos
for (let i = 8; i <= 30; i++) {
  const srcName = `photo_${i}_2026-10-18_20-36-58.jpg`;
  if (fs.existsSync(path.join(SRC_DIR, srcName))) {
    copyImage(srcName, `gl135-showroom-${String(i).padStart(2, '0')}.jpg`);
  }
}

// Add a few more products from the studio/showroom pairs
const extraProducts = [
  {
    studioNum: 7, showroomNum: 8,
    name: 'كرسي مكتب جلد أسود كلاسيكي مبطن هيدروليك',
    code: 'GL-135-C01', price: 3450, color: 'أسود', material: 'جلد PU + كروم'
  },
  {
    studioNum: 8, showroomNum: 9,
    name: 'كرسي مكتب شبك أسود ظهر متوسط بمساند أذرع',
    code: 'GL-135-C02', price: 2650, color: 'أسود', material: 'شبك + إسفنج + كروم'
  },
  {
    studioNum: 9, showroomNum: 10,
    name: 'كرسي مكتب شبك طبي هيدروليك ظهر متوسط',
    code: 'GL-135-C03', price: 2450, color: 'أسود', material: 'شبك + كروم'
  },
  {
    studioNum: 10, showroomNum: 11,
    name: 'كرسي انتظار شبك بمساند أذرع مبطنة',
    code: 'GL-135-C04', price: 1850, color: 'أسود', material: 'شبك + كروم زلاجة'
  },
  {
    studioNum: 11, showroomNum: 12,
    name: 'كرسي مكتب دوار شبك بقاعدة كروم',
    code: 'GL-135-C05', price: 2250, color: 'أسود', material: 'شبك + كروم'
  },
  {
    studioNum: 12, showroomNum: 13,
    name: 'كرسي مكتب جلد PU أنيق بمسند ظهر مرتفع',
    code: 'GL-135-C06', price: 3250, color: 'أسود', material: 'جلد PU + كروم'
  },
  {
    studioNum: 13, showroomNum: 14,
    name: 'كرسي مكتب شبك إرجونوميك بدعم قطني',
    code: 'GL-135-C07', price: 2850, color: 'أسود', material: 'شبك طبي + كروم'
  },
  {
    studioNum: 14, showroomNum: 15,
    name: 'كرسي مكتب جلد بتصميم رياضي مودرن',
    code: 'GL-135-C08', price: 3650, color: 'أسود', material: 'جلد PU + كروم'
  },
  {
    studioNum: 15, showroomNum: 16,
    name: 'كرسي انتظار ومؤتمرات مبطن بشاسيه كروم',
    code: 'GL-135-C09', price: 1650, color: 'أسود', material: 'قماش + كروم'
  },
  {
    studioNum: 16, showroomNum: 17,
    name: 'كرسي مكتب شبك بدون مساند أذرع اقتصادي',
    code: 'GL-135-C10', price: 1450, color: 'أسود', material: 'شبك + نايلون'
  },
];

extraProducts.forEach((ep, idx) => {
  const img1 = `/uploads/gl135-studio-${String(ep.studioNum).padStart(2, '0')}.jpg`;
  const img2 = `/uploads/gl135-showroom-${String(ep.showroomNum).padStart(2, '0')}.jpg`;
  newProducts.push({
    id: `prod_gl135_extra_${idx + 1}`,
    name: ep.name + ' - كود ' + ep.code,
    code: ep.code,
    sku: ep.code,
    slug: `gl-135-chair-${ep.code.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    description: ep.name + '. تصميم عصري مريح بخامات عالية الجودة. مناسب للمكاتب والمنازل.',
    price: ep.price,
    originalPrice: Math.round(ep.price * 1.1),
    images: [img1, img2],
    category: 'كراسي مكتب',
    material: ep.material,
    color: ep.color,
    dimensions: { width: 62, height: 105, depth: 58 },
    weight: 14,
    stockQuantity: 15,
    returnCount: 0,
    totalSold: 0,
    rating: 4.7 + (Math.random() * 0.3),
    reviewCount: Math.floor(Math.random() * 8) + 2,
    inStock: true,
    featured: false,
    tags: ['كراسي مكتب', 'GL-135', ep.color],
    specs: {}
  });
});

// =========================================
// MERGE WITH EXISTING PRODUCTS AND SAVE
// =========================================

const existingProducts = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
console.log(`\nExisting products: ${existingProducts.length}`);
console.log(`New products to add: ${newProducts.length}`);

// Add new products at the beginning
const allProducts = [...newProducts, ...existingProducts];
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(allProducts, null, 2), 'utf-8');

console.log(`\n✅ Total products now: ${allProducts.length}`);
console.log('✅ All images copied to public/uploads/');
console.log('✅ Products saved to products.json');

// List all new products
console.log('\n📋 New Products Summary:');
newProducts.forEach(p => {
  console.log(`  ${p.code} | ${p.name.substring(0, 60)} | ${p.price} ج.م | ${p.category}`);
});
