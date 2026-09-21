/**
 * backend/routes/productRoutes.js
 * مسارات إدارة المنتجات (CRUD) مع حماية RBAC للعمليات الكتابية
 */

const express = require('express');
const router = express.Router();

const { verifyToken, checkRole } = require('../middlewares/auth');
const jsonCache = require('../services/jsonCache');

// 1. قراءة المنتجات بسرعة فائقة مباشرة من الذاكرة دون الوصول للقرص
router.get('/', async (req, res) => {
  try {
    const products = await jsonCache.read('products.json', []);
    res.json(products);
  } catch (err) {
    console.error('GET /api/products error:', err.message);
    res.status(500).json({ error: 'Failed to read products from cache' });
  }
});

// 2. إضافة منتج جديد: محمي بتوكن الأدمن
router.post('/', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const data = req.body;
    if (!data.name || !data.price || !data.category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }
    const products = await jsonCache.read('products.json', []);
    const newProduct = {
      id: data.id || `prod_${Date.now()}`,
      name: data.name,
      slug: data.slug || `${data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`,
      description: data.description || '',
      price: Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
      images: Array.isArray(data.images) && data.images.length > 0 ? data.images : ['https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800'],
      category: data.category,
      material: data.material || 'خشب طبيعي',
      color: data.color || 'طبيعي',
      dimensions: data.dimensions || { width: 100, height: 75, depth: 80 },
      weight: Number(data.weight) || 20,
      stockQuantity: data.stockQuantity !== undefined ? Number(data.stockQuantity) : 10,
      rating: Number(data.rating) || 5.0,
      reviewCount: Number(data.reviewCount) || 1,
      inStock: data.inStock !== false,
      featured: Boolean(data.featured),
      tags: Array.isArray(data.tags) ? data.tags : [data.category.toLowerCase()],
    };
    products.unshift(newProduct);
    await jsonCache.write('products.json', products);
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// 3. تعديل منتج: محمي بتوكن الأدمن
router.put('/', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    const products = await jsonCache.read('products.json', []);
    const index = products.findIndex((p) => p.id === data.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const updated = { ...products[index], ...data };
    products[index] = updated;
    await jsonCache.write('products.json', products);
    res.json(updated);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// 4. حذف منتج: محمي بتوكن الأدمن
router.delete('/', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const id = req.query.id || req.body?.id;
    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    const products = await jsonCache.read('products.json', []);
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length === products.length) {
      return res.status(404).json({ error: 'Product not found' });
    }
    await jsonCache.write('products.json', filtered);
    res.json({ success: true, deletedId: id });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
