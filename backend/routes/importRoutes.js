/**
 * backend/routes/importRoutes.js
 * Bulk product import via Excel / CSV file.
 *
 * Endpoints (all under /api/products/import):
 *   GET  /template   — Download a ready-to-fill XLSX template
 *   POST /           — Upload file → validate → upsert products (dry-run supported)
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');

const { verifyToken, checkRole } = require('../middlewares/auth');
const jsonCache = require('../services/jsonCache');

// ── multer: memory storage so we never touch the disk ──────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel',                                           // .xls
      'text/csv',
      'application/csv',
      'text/plain',
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls|csv)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('يُسمح فقط بملفات Excel (.xlsx, .xls) أو CSV'));
    }
  },
});

// ── Known Store Categories ───────────────────────────────────────────
const STORE_CATEGORIES = [
  'كراسي مكتب',
  'كراسي جيمينج',
  'مكاتب',
  'كراسي طبية',
  'ركن ومجالس',
  'ستائر مكتبية',
  'مكتبات ووحدات تخزين',
  'غرف النوم',
  'ليزي بوي',
  'ترابيزة تليفزيون',
  'أثاث خارجي',
  'دريسنج روم',
  'المطابخ',
  'بين باج',
  'اضاءة',
  'إكسسوارات كمبيوتر',
  'إكسسوارات لابتوب',
];

// ── Column headers for the template ─────────────────────────────────
const TEMPLATE_HEADERS = [
  { header: 'الكود / SKU', key: 'sku', required: true, example: 'CHAIR-001' },
  { header: 'اسم المنتج / Name', key: 'name', required: true, example: 'كرسي مكتب طبي مريح' },
  { header: 'القسم / Category', key: 'category', required: true, example: 'كراسي طبية' },
  { header: 'السعر / Price', key: 'price', required: true, example: '3500' },
  { header: 'المخزون / Stock', key: 'stockQuantity', required: false, example: '15' },
  { header: 'الوصف / Description', key: 'description', required: false, example: 'كرسي مريح مع مسند رأس ودعامة للظهر' },
  { header: 'الخامة / Material', key: 'material', required: false, example: 'بولي بروبيلين عالي المتانة' },
  { header: 'اللون / Color', key: 'color', required: false, example: 'أسود' },
  { header: 'السعر قبل الخصم / Original Price', key: 'originalPrice', required: false, example: '4200' },
  { header: 'مميز / Featured', key: 'featured', required: false, example: 'true' },
  { header: 'رابط الصورة / Image URL', key: 'imageUrl', required: false, example: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800' },
];

// ── Helper: slugify ─────────────────────────────────────────────────
function slugify(text, suffix) {
  return `${String(text).toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').replace(/^-|-$/g, '')}-${suffix}`;
}

// ── Helper: clean numeric input ─────────────────────────────────────
function parseCleanNumber(val, defaultVal = 0) {
  if (val === undefined || val === null || val === '') return defaultVal;
  if (typeof val === 'number') return isNaN(val) ? defaultVal : val;
  // Remove commas, currency symbols, spaces
  const cleanStr = String(val).replace(/[^0-9.-]/g, '');
  const n = parseFloat(cleanStr);
  return isNaN(n) ? defaultVal : n;
}

// ── Helper: parse a single row from the sheet with broad aliases ────
function parseRow(raw) {
  const keys = Object.keys(raw);
  
  const getByAliases = (aliases) => {
    for (const alias of aliases) {
      const lowerAlias = alias.toLowerCase();
      // Exact match
      if (raw[alias] !== undefined && raw[alias] !== '') return raw[alias];
      // Case-insensitive match
      const foundKey = keys.find((k) => k.trim().toLowerCase() === lowerAlias);
      if (foundKey && raw[foundKey] !== undefined && raw[foundKey] !== '') return raw[foundKey];
      // Substring fuzzy match
      const subKey = keys.find((k) => k.toLowerCase().includes(lowerAlias) || lowerAlias.includes(k.toLowerCase()));
      if (subKey && raw[subKey] !== undefined && raw[subKey] !== '') return raw[subKey];
    }
    return undefined;
  };

  const rawSku = getByAliases(['sku', 'code', 'الكود', 'كود', 'الرمز', 'باركود', 'كود المنتج']);
  const rawName = getByAliases(['name', 'title', 'الاسم', 'اسم', 'اسم المنتج', 'عنوان']);
  const rawCat = getByAliases(['category', 'cat', 'القسم', 'قسم', 'التصنيف', 'تصنيف', 'الفئة']);
  const rawPrice = getByAliases(['price', 'السعر', 'سعر', 'سعر البيع']);
  const rawStock = getByAliases(['stockquantity', 'stock', 'quantity', 'qty', 'المخزون', 'الكمية', 'كمية', 'العدد']);
  const rawDesc = getByAliases(['description', 'desc', 'الوصف', 'وصف', 'التفاصيل']);
  const rawMaterial = getByAliases(['material', 'الخامة', 'خامة', 'المادة']);
  const rawColor = getByAliases(['color', 'اللون', 'لون']);
  const rawOrigPrice = getByAliases(['originalprice', 'compareprice', 'السعر_قبل_الخصم', 'السعر قبل الخصم', 'السعر القديم']);
  const rawFeatured = getByAliases(['featured', 'مميز', 'مميزة']);
  const rawImage = getByAliases(['imageurl', 'image', 'images', 'photo', 'رابط_الصورة', 'رابط الصورة', 'صورة', 'الصور']);

  const priceNum = parseCleanNumber(rawPrice, NaN);
  const stockNum = Math.floor(parseCleanNumber(rawStock, 10));
  const origPriceNum = rawOrigPrice ? parseCleanNumber(rawOrigPrice, undefined) : undefined;
  
  const isFeatured = String(rawFeatured || '').trim().toLowerCase();
  const featured = isFeatured === 'true' || isFeatured === '1' || isFeatured === 'نعم' || isFeatured === 'yes';

  // Handle images (support comma or newline separated)
  const imageStr = String(rawImage || '').trim();
  const images = imageStr
    ? imageStr.split(/[\n,;]+/).map((s) => s.trim()).filter((s) => s.startsWith('http') || s.startsWith('/'))
    : [];

  return {
    sku: rawSku != null ? String(rawSku).trim().toUpperCase() : '',
    name: rawName != null ? String(rawName).trim() : '',
    category: rawCat != null ? String(rawCat).trim() : '',
    price: priceNum,
    stockQuantity: stockNum,
    description: rawDesc != null ? String(rawDesc).trim() : '',
    material: rawMaterial != null ? String(rawMaterial).trim() : 'خامات عالية الجودة',
    color: rawColor != null ? String(rawColor).trim() : 'متعدد الألوان',
    originalPrice: origPriceNum,
    featured,
    imageUrl: images[0] || (imageStr.startsWith('http') || imageStr.startsWith('/') ? imageStr : ''),
    images: images.length > 0 ? images : undefined,
  };
}

// ── Helper: validate a parsed row ───────────────────────────────────
function validateRow(row, index) {
  const errors = [];
  if (!row.sku) errors.push('كود المنتج (SKU) مطلوب');
  if (!row.name) errors.push('اسم المنتج مطلوب');
  if (!row.category) {
    errors.push('القسم مطلوب');
  } else if (row.category.length < 2) {
    errors.push('اسم القسم قصير جداً (حرفان على الأقل)');
  }
  if (row.price === undefined || isNaN(row.price) || row.price < 0) {
    errors.push('السعر مطلوب ويجب أن يكون رقماً موجباً');
  }
  if (isNaN(row.stockQuantity) || row.stockQuantity < 0) {
    errors.push('المخزون يجب أن يكون رقماً غير سالب');
  }

  return errors.map((e) => `الصف ${index + 2}: ${e}`);
}

// ──────────────────────────────────────────────────────────────────
// GET /api/products/import/template
// Download a ready-to-fill XLSX template file (publicly accessible)
// ──────────────────────────────────────────────────────────────────
router.get('/template', (req, res) => {
  try {
    const wb = XLSX.utils.book_new();

    // Main sheet: headers + example row
    const headerRow = TEMPLATE_HEADERS.map((h) => h.header);
    const exampleRow = TEMPLATE_HEADERS.map((h) => h.example);

    const ws = XLSX.utils.aoa_to_sheet([headerRow, exampleRow]);

    // Set column widths
    ws['!cols'] = TEMPLATE_HEADERS.map(() => ({ wch: 32 }));

    XLSX.utils.book_append_sheet(wb, ws, 'قالب المنتجات');

    // Categories reference sheet
    const catHeaders = ['الأقسام المتاحة بالمتجر (يمكنك أيضاً كتابة قسم جديد)'];
    const catData = STORE_CATEGORIES.map((c) => [c]);
    const wsRef = XLSX.utils.aoa_to_sheet([catHeaders, ...catData]);
    wsRef['!cols'] = [{ wch: 45 }];
    XLSX.utils.book_append_sheet(wb, wsRef, 'دليل الأقسام');

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="amazon-furniture-products-template.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (err) {
    console.error('[Import] Template generation error:', err);
    res.status(500).json({ success: false, error: 'فشل إنشاء القالب' });
  }
});

// ──────────────────────────────────────────────────────────────────
// POST /api/products/import
// Body: multipart/form-data with field "file" (xlsx/csv) + optional "dryRun=true"
// ──────────────────────────────────────────────────────────────────
router.post(
  '/',
  verifyToken,
  checkRole('admin'),
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'لم يتم رفع أي ملف' });
      }

      const dryRun = req.body.dryRun === 'true' || req.body.dryRun === true;

      // ── Parse the uploaded buffer (with codepage 65001 for UTF-8 CSV) ──
      const wb = XLSX.read(req.file.buffer, { type: 'buffer', codepage: 65001 });
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const rawRows = XLSX.utils.sheet_to_json(ws, { defval: '' });

      if (!rawRows || rawRows.length === 0) {
        return res.status(400).json({ success: false, error: 'الملف فارغ أو لا يحتوي على بيانات' });
      }

      // ── Validate ─────────────────────────────────────────────
      const allErrors = [];
      const parsedRows = [];

      rawRows.forEach((raw, i) => {
        const row = parseRow(raw);
        const errs = validateRow(row, i);
        if (errs.length > 0) {
          allErrors.push(...errs);
        } else {
          parsedRows.push(row);
        }
      });

      // Return validation report if dryRun
      if (dryRun) {
        return res.json({
          success: allErrors.length === 0,
          dryRun: true,
          total: rawRows.length,
          valid: parsedRows.length,
          invalid: allErrors.length,
          errors: allErrors,
          preview: parsedRows.slice(0, 5),
        });
      }

      if (parsedRows.length === 0) {
        return res.status(400).json({
          success: false,
          dryRun: false,
          total: rawRows.length,
          valid: 0,
          invalid: allErrors.length,
          errors: allErrors,
          error: 'لا توجد صفوف صالحة للاستيراد في الملف',
        });
      }

      // ── UPSERT into the product store ────────────────────────
      const products = await jsonCache.read('products.json', []);

      let created = 0;
      let updated = 0;
      const processedSkus = new Set();

      for (const row of parsedRows) {
        // Deduplicate within the file itself
        if (processedSkus.has(row.sku)) continue;
        processedSkus.add(row.sku);

        const existingIdx = products.findIndex(
          (p) =>
            (p.sku && String(p.sku).trim().toUpperCase() === row.sku) ||
            (p.code && String(p.code).trim().toUpperCase() === row.sku)
        );

        const defaultImage = 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800';
        const productImages = row.images && row.images.length > 0
          ? row.images
          : row.imageUrl
          ? [row.imageUrl]
          : [defaultImage];

        if (existingIdx !== -1) {
          // Update existing product
          const existing = products[existingIdx];
          products[existingIdx] = {
            ...existing,
            name: row.name || existing.name,
            category: row.category || existing.category,
            price: row.price,
            stockQuantity: row.stockQuantity,
            inStock: row.stockQuantity > 0,
            description: row.description || existing.description,
            material: row.material || existing.material,
            color: row.color || existing.color,
            originalPrice: row.originalPrice !== undefined ? row.originalPrice : existing.originalPrice,
            featured: row.featured !== undefined ? row.featured : existing.featured,
            images: (row.images && row.images.length > 0) || row.imageUrl ? productImages : existing.images,
            sku: row.sku,
            code: row.sku,
          };
          updated++;
        } else {
          // Create new product
          const newProduct = {
            id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            code: row.sku,
            sku: row.sku,
            name: row.name,
            slug: slugify(row.name, Date.now().toString().slice(-5)),
            description: row.description,
            price: row.price,
            originalPrice: row.originalPrice,
            images: productImages,
            category: row.category,
            material: row.material,
            color: row.color,
            dimensions: { width: 100, height: 75, depth: 80 },
            weight: 20,
            stockQuantity: row.stockQuantity,
            returnCount: 0,
            totalSold: 0,
            rating: 5.0,
            reviewCount: 1,
            inStock: row.stockQuantity > 0,
            featured: row.featured,
            tags: [row.category.toLowerCase()],
          };
          products.unshift(newProduct);
          created++;
        }
      }

      await jsonCache.write('products.json', products);

      return res.json({
        success: true,
        dryRun: false,
        total: rawRows.length,
        valid: parsedRows.length,
        invalid: allErrors.length,
        created,
        updated,
        errors: allErrors,
      });
    } catch (err) {
      console.error('[Import] Error processing file:', err);
      res.status(500).json({ success: false, error: `فشل معالجة الملف: ${err.message}` });
    }
  }
);

module.exports = router;
