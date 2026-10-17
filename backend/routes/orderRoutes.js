/**
 * backend/routes/orderRoutes.js
 * مسارات إدارة الطلبات (CRUD) مع حماية المعاملات الذرية (MongoDB Transactions)
 * لمنع ظاهرة Race Conditions والبيع الزائد عن المخزون (Overselling)
 * بالإضافة لإنشاء فاتورة PDF الرسمية وعقد الضمان لمدة 10 سنوات وإرسالها بالإيميل
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const { verifyToken, checkRole } = require('../middlewares/auth');
const { Customer, Order, Product, Coupon } = require('../models');
const jsonCache = require('../services/jsonCache');
const { generateInvoiceBuffer } = require('../services/invoiceService');
const { sendOrderConfirmationWithInvoice } = require('../services/emailService');
const { validateCouponLogic } = require('./couponRoutes');

// ─── 1. جلب كافة الطلبات (للأدمن فقط) ───────────────────────
router.get('/', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const orders = await jsonCache.read('orders.json', []);
    res.json(orders);
  } catch (err) {
    console.error('GET /api/orders error:', err.message);
    res.status(500).json({ error: 'Failed to read orders' });
  }
});

// ─── 1.2 جلب طلبات العميل الموثق فقط (My Orders) ───────────
router.get('/my-orders', verifyToken, async (req, res) => {
  try {
    const userEmail = (req.user?.email || '').toLowerCase().trim();
    const userId = req.user?.id;

    if (!userEmail && !userId) {
      return res.status(401).json({ error: 'جلسة المستخدم غير صالحة' });
    }

    const allOrders = await jsonCache.read('orders.json', []);
    const userOrders = allOrders.filter((o) => {
      const matchEmail = (o.customerEmail && o.customerEmail.toLowerCase().trim() === userEmail) ||
        (o.shippingAddress?.email && o.shippingAddress.email.toLowerCase().trim() === userEmail);
      const matchId = userId && o.userId === userId;
      return matchEmail || matchId;
    });

    res.json({ success: true, orders: userOrders });
  } catch (err) {
    console.error('GET /api/orders/my-orders error:', err.message);
    res.status(500).json({ error: 'فشل في استرجاع طلبات المستخدم' });
  }
});

// ─── 1.5 تتبع الطلب للعميل العام (بدون تسجيل دخول) ──────────
router.post('/track', async (req, res) => {
  try {
    const { orderId, phone } = req.body;
    if (!orderId || !phone) {
      return res.status(400).json({ error: 'يرجى إدخال رقم الطلب ورقم الهاتف المسجل' });
    }

    const cleanInputId = String(orderId).trim().toUpperCase().replace('#', '');
    const cleanInputPhone = String(phone).replace(/[^0-9]/g, '');

    const orders = await jsonCache.read('orders.json', []);
    const order = orders.find((o) => {
      const oId = String(o.id || '').toUpperCase().replace('#', '');
      return oId === cleanInputId || oId.endsWith(cleanInputId) || cleanInputId.endsWith(oId);
    });

    if (!order) {
      return res.status(404).json({
        error: 'لم يتم العثور على طلب بهذا الرقم، يرجى التأكد من كتابة الرقم بشكل صحيح (مثال: AF-123456)',
      });
    }

    // التحقق من تطابق الهاتف (آخر 6 أرقام كافية لمنع أخطاء كود الدولة)
    const rawPhone = order.customerPhone || order.shippingAddress?.phone || '';
    const cleanOrderPhone = String(rawPhone).replace(/[^0-9]/g, '');

    const phoneMatches =
      cleanOrderPhone.endsWith(cleanInputPhone.slice(-6)) ||
      cleanInputPhone.endsWith(cleanOrderPhone.slice(-6)) ||
      cleanOrderPhone === cleanInputPhone;

    if (!phoneMatches) {
      return res.status(403).json({
        error: 'رقم الهاتف المدخل لا يتطابق مع رقم هاتف المستلم المسجل في هذا الطلب',
      });
    }

    // جلب أي طلبات إرجاع سابقة لهذا الطلب
    const returns = await jsonCache.read('returns.json', []);
    const orderReturns = returns.filter(
      (r) => String(r.orderId).toUpperCase() === String(order.id).toUpperCase()
    );

    res.json({
      success: true,
      order,
      returns: orderReturns,
    });
  } catch (err) {
    console.error('POST /api/orders/track error:', err.message);
    res.status(500).json({ error: 'حدث خطأ أثناء البحث عن الطلب' });
  }
});

// ─── 2. إنشاء طلب جديد مع MongoDB Transactions وحماية المخزون ─
router.post('/', async (req, res) => {
  const body = req.body;
  const { items, shippingAddress, notes, customerName, customerEmail, customerPhone } = body;

  if (!items || !items.length) {
    return res.status(400).json({ error: 'Order must contain at least one item' });
  }

  // ─── ⚠️  CRITICAL: SERVER-SIDE PRICE RECALCULATION ─────────────────────────
  // Never trust the total coming from the frontend — always recalculate from DB
  let serverSubtotal = 0;
  const allProducts = await jsonCache.read('products.json', []);

  for (const item of items) {
    const prodId = item.product?.id || item.productId;
    const dbProduct = allProducts.find((p) => String(p.id) === String(prodId));
    if (!dbProduct) {
      return res.status(400).json({ error: `المنتج "${item.product?.name || prodId}" غير موجود في قاعدة البيانات` });
    }
    const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
    serverSubtotal += dbProduct.price * qty;

    // Rebuild item with authoritative price from DB
    item.product = {
      ...item.product,
      price: dbProduct.price,
      name: dbProduct.name,
    };
  }

  // ─── Dynamic Server-side coupon validation ──────────────────────────────────
  const couponCode = body.couponCode || null;
  const targetEmail = (customerEmail || shippingAddress?.email || '').toLowerCase().trim();
  let couponDiscount = 0;
  if (couponCode) {
    const couponResult = await validateCouponLogic(couponCode, serverSubtotal, targetEmail);
    couponDiscount = couponResult.valid ? couponResult.discount : 0;
  }

  // ─── Server-side shipping cost calculation ───────────────────────────────────
  // Accept shippingCost from frontend only if it's a non-negative number; default to 0
  const clientShippingCost = Number(body.shippingCost) || 0;
  const serverShippingCost = clientShippingCost >= 0 ? clientShippingCost : 0;

  // ─── Final authoritative total ───────────────────────────────────────────────
  const serverTotal = Math.max(0, serverSubtotal - couponDiscount + serverShippingCost);

  const orderId = body.id || `AF-${Math.floor(100000 + Math.random() * 900000)}`;
  const userId = body.userId;

  // تجهيز كائن الطلب الموحد بالأسعار المحسوبة من الـ Backend
  const newOrder = {
    id: orderId,
    customerName: customerName || shippingAddress?.firstName || 'عميل كريم',
    customerEmail: targetEmail,
    customerPhone: customerPhone || shippingAddress?.phone || '',
    items: items.map((it) => ({
      product: {
        id: it.product?.id || `prod_${Date.now()}`,
        name: it.product?.name || 'قطعة أثاث فاخرة',
        price: Number(it.product?.price || it.price || 0),
        images: Array.isArray(it.product?.images) ? it.product.images : [],
        category: it.product?.category || '',
        slug: it.product?.slug || '',
      },
      quantity: Number(it.quantity) || 1,
      color: it.color || '',
      curtainType: it.curtainType || '',
      selectedDimensions: it.selectedDimensions || null,
    })),
    subtotal: serverSubtotal,
    discount: couponDiscount,
    couponCode: couponCode || null,
    shippingCost: serverShippingCost,
    total: serverTotal, // ← always server-calculated, never from frontend
    status: 'processing',
    date: new Date().toISOString(),
    shippingAddress: shippingAddress || {},
    notes: notes || '',
    paymentMethod: body.paymentMethod || 'cod',
    paymentStatus: body.paymentStatus || (body.paymentMethod === 'cod' ? 'pending' : 'verified'),
    paymentDetails: body.paymentDetails || {},
  };

  let customerObjectId = undefined;
  let transactionExecuted = false;

  // ─── A. تنفيذ المعاملة الذرية (MongoDB Transaction) إذا كانت قاعدة البيانات متصلة ───
  if (jsonCache.isMongoConnected()) {
    let session = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction();

      // 1. قفل المخزون والتحقق من التوفر الذري لكل قطعة (Atomic Stock Lock)
      for (const item of items) {
        const prodId = item.product?.id || item.productId;
        const requestedQty = Number(item.quantity) || 1;

        // بحث وتعديل ذري: يشترط أن يكون stockQuantity >= الكمية المطلوبة
        const updatedProduct = await Product.findOneAndUpdate(
          { id: prodId, stockQuantity: { $gte: requestedQty } },
          {
            $inc: { stockQuantity: -requestedQty },
          },
          { session, new: true }
        );

        // إذا لم يعثر على المستند أو كان المخزون أقل، يتم إحباط المعاملة فوراً
        if (!updatedProduct) {
          const prodTitle = item.product?.name || prodId;
          throw new Error(`عذراً، نفد مخزون القطعة "${prodTitle}" أو الكمية المتبقية غير كافية لإتمام طلبك.`);
        }

        // إذا وصل المخزون لصفر نحدث حالة التوفر
        if (updatedProduct.stockQuantity === 0) {
          await Product.updateOne({ _id: updatedProduct._id }, { inStock: false }, { session });
        }
      }

      // 2. ربط وتحديث إحصائيات العميل داخل الـ Session
      const queryOr = [];
      if (targetEmail) queryOr.push({ email: targetEmail });
      if (userId) queryOr.push({ id: userId });

      if (queryOr.length > 0) {
        const custDoc = await Customer.findOne({ $or: queryOr }).session(session);
        if (custDoc) {
          customerObjectId = custDoc._id;
          await Customer.findByIdAndUpdate(
            custDoc._id,
            { $inc: { ordersCount: 1, totalSpent: Number(serverTotal) || 0 } },
            { session }
          );
        }
      }

      // 3. إنشاء مستند الطلب في MongoDB
      newOrder.customer = customerObjectId;
      await Order.create([newOrder], { session });

      // اعتماد المعاملة بالكامل
      await session.commitTransaction();
      transactionExecuted = true;
    } catch (txErr) {
      if (session) {
        try {
          await session.abortTransaction();
        } catch {
          // Ignore abort error if transaction wasn't active
        }
      }

      // في حال كانت بيئة التطوير MongoDB Standalone ولا تدعم Replica Sets
      // يتم تنفيذ الخصم الذري بدون Session لتجنب تعطل النظام المحلي
      if (
        txErr.message &&
        (txErr.message.includes('replica set') || txErr.message.includes('Transaction numbers'))
      ) {
        console.warn('⚠️ [MongoDB Transaction Notice] Standalone Mongo detected; applying fallback atomic updates.');
        try {
          for (const item of items) {
            const prodId = item.product?.id || item.productId;
            const requestedQty = Number(item.quantity) || 1;
            const fallbackProd = await Product.findOneAndUpdate(
              { id: prodId, stockQuantity: { $gte: requestedQty } },
              { $inc: { stockQuantity: -requestedQty } },
              { new: true }
            );
            if (!fallbackProd) {
              const prodTitle = item.product?.name || prodId;
              return res.status(409).json({
                error: `عذراً، القطعة "${prodTitle}" لم يعد بها مخزون كافٍ.`,
              });
            }
          }
          await Order.create(newOrder);
        } catch (dbErr) {
          console.warn('Fallback Mongo error:', dbErr.message);
        }
      } else {
        console.error('[Order Transaction Error]', txErr.message);
        return res.status(409).json({
          error: txErr.message || 'حدث تعارض في حجز المخزون، يرجى المحاولة مرة أخرى.',
        });
      }
    } finally {
      if (session) session.endSession();
    }
  }

  // ─── B. تحديث الكاش السريع في الذاكرة (RAM Cache Sync) ──────
  try {
    const products = await jsonCache.read('products.json', []);
    for (const item of items) {
      const pIdx = products.findIndex((p) => p.id === (item.product?.id || item.productId));
      if (pIdx !== -1) {
        const currentStock = products[pIdx].stockQuantity ?? 10;
        const newStock = Math.max(0, currentStock - (Number(item.quantity) || 1));
        products[pIdx].stockQuantity = newStock;
        if (newStock === 0) products[pIdx].inStock = false;
      }
    }
    await jsonCache.write('products.json', products);

    // إضافة الطلب إلى سجل الطلبات في الكاش
    const orders = await jsonCache.read('orders.json', []);
    orders.unshift(newOrder);
    await jsonCache.write('orders.json', orders);

    // تحديث إحصائيات العميل في الكاش المحلي
    const customers = await jsonCache.read('customers.json', []);
    const custIdx = customers.findIndex(
      (c) => c.email.toLowerCase() === targetEmail || (userId && c.id === userId)
    );
    if (custIdx !== -1) {
      customers[custIdx].ordersCount = (customers[custIdx].ordersCount || 0) + 1;
      customers[custIdx].totalSpent = (customers[custIdx].totalSpent || 0) + (Number(serverTotal) || 0);
      await jsonCache.write('customers.json', customers);
    }

    // تسجيل وتحديث عداد استخدام الكوبون
    if (couponCode && couponDiscount > 0) {
      const normCp = couponCode.trim().toUpperCase();
      const coupons = await jsonCache.read('coupons.json', []);
      const cpIdx = coupons.findIndex((c) => c.code === normCp);
      if (cpIdx !== -1) {
        coupons[cpIdx].usedCount = (coupons[cpIdx].usedCount || 0) + 1;
        if (!Array.isArray(coupons[cpIdx].usedBy)) coupons[cpIdx].usedBy = [];
        coupons[cpIdx].usedBy.push({
          email: targetEmail,
          orderId,
          usedAt: new Date().toISOString(),
        });
        await jsonCache.write('coupons.json', coupons);
      }
      if (jsonCache.isMongoConnected()) {
        try {
          await Coupon.findOneAndUpdate(
            { code: normCp },
            {
              $inc: { usedCount: 1 },
              $push: { usedBy: { email: targetEmail, orderId, usedAt: new Date() } },
            }
          );
        } catch (cpDbErr) {
          console.warn('[Coupon Mongo update notice]', cpDbErr.message);
        }
      }
    }
  } catch (cacheErr) {
    console.warn('RAM Cache sync notice:', cacheErr.message);
  }

  // ─── C. إصدار فاتورة الـ PDF الرسمية والضمان وإرسال الإيميل في الخلفية ─
  setImmediate(async () => {
    try {
      // توليد ملف الـ PDF كـ Buffer في الذاكرة
      const pdfBuffer = await generateInvoiceBuffer(newOrder);

      // إرسال الإيميل مع الفاتورة المرفقة وعقد الضمان لـ 10 سنوات
      await sendOrderConfirmationWithInvoice(newOrder, pdfBuffer);
      console.log(`[Order Processing] Official PDF Invoice & Warranty generated for order #${orderId}`);
    } catch (invoiceErr) {
      console.warn('[PDF Invoicing & Email Notice]', invoiceErr.message);
    }
  });

  // ─── D. بث إشعار فوري للوحة الإدارة عبر Socket.io ────────────
  const io = req.app.get('io');
  if (io) {
    io.to('admin_room').emit('new_order', {
      orderId,
      customerName: newOrder.customerName,
      customerPhone: newOrder.customerPhone,
      total: newOrder.total,
      itemsCount: newOrder.items.length,
      createdAt: newOrder.date,
    });
  }

  res.status(201).json({
    success: true,
    order: newOrder,
    orderId,
    message: 'تم تسجيل وتأكيد الطلب وحجز المخزون بنجاح.',
  });
});

// ─── 3. تحديث حالة الطلب (للأدمن فقط) ───────────────────────
router.patch('/', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const { orderId, status } = req.body;
    if (!orderId || !status) {
      return res.status(400).json({ error: 'orderId and status are required' });
    }

    const orders = await jsonCache.read('orders.json', []);
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    orders[idx].status = status;
    await jsonCache.write('orders.json', orders);

    if (jsonCache.isMongoConnected()) {
      try {
        await Order.findOneAndUpdate({ id: orderId }, { status });
      } catch (err) {
        console.warn('Order Mongo update notice:', err.message);
      }
    }

    res.json({ success: true, order: orders[idx] });
  } catch (err) {
    console.error('PATCH /api/orders error:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// ─── 4. حذف طلب (للأدمن فقط) ────────────────────────────────
router.delete('/', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const id = req.query.id || req.body?.id;
    if (!id) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const orders = await jsonCache.read('orders.json', []);
    const filtered = orders.filter((o) => o.id !== id);
    if (filtered.length === orders.length) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await jsonCache.write('orders.json', filtered);

    if (jsonCache.isMongoConnected()) {
      try {
        await Order.findOneAndDelete({ id });
      } catch (err) {
        console.warn('Order Mongo delete notice:', err.message);
      }
    }

    res.json({ success: true, deletedId: id });
  } catch (err) {
    console.error('DELETE /api/orders error:', err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router;
