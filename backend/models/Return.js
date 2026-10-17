/**
 * backend/models/Return.js
 * مخطط Mongoose لطلبات الاسترجاع والاستبدال
 */

const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, required: true, index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    customerName: { type: String, required: true },
    customerPhone: { type: String, default: '' },
    productName: { type: String, required: true },
    productId: { type: String, default: '', index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    price: { type: Number, default: 0, min: 0 },
    reason: { type: String, default: 'other' },
    reasonDetails: { type: String, default: '' },
    images: { type: [String], default: [] },
    status: {
      type: String,
      enum: [
        'pending_review',
        'approved',
        'rejected',
        'inspected',
        'inspection_approved',
        'outlet_restocked',
        'refunded',
        'completed',
      ],
      default: 'pending_review',
      index: true,
    },
    conditionAssessment: { type: String, default: '' },
    refundAmount: { type: Number, default: 0, min: 0 },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        if (!ret.id && ret._id) {
          ret.id = ret._id.toString();
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

/**
 * Automation Hook (Data Layer):
 * Whenever a new return is logged, automatically update returnCount and totalSold
 * on the Product model to keep returns intelligence lightning-fast without running heavy aggregations.
 */
returnSchema.post('save', async function (doc) {
  try {
    const Product = mongoose.models.Product || mongoose.model('Product');
    const Order = mongoose.models.Order || mongoose.model('Order');

    const pId = doc.productId || (doc.product ? doc.product.toString() : null);
    if (!pId) return;

    const prodQuery = {
      $or: [
        { id: pId },
        { code: pId },
        { sku: pId },
      ],
    };
    if (mongoose.Types.ObjectId.isValid(pId)) {
      prodQuery.$or.push({ _id: new mongoose.Types.ObjectId(pId) });
    }

    // 1. حساب إجمالي المبيعات من واقع الطلبات غير الملغاة
    let totalSold = 0;
    try {
      const orders = await Order.find({
        status: { $ne: 'cancelled' },
        'items.product.id': pId,
      }).lean();

      for (const ord of orders) {
        if (Array.isArray(ord.items)) {
          for (const item of ord.items) {
            if (String(item.product?.id) === String(pId)) {
              totalSold += Number(item.quantity) || 1;
            }
          }
        }
      }
    } catch (orderErr) {
      console.warn('[Return post-save hook] Error reading orders:', orderErr.message);
    }

    // 2. تحديث حقلي returnCount و totalSold على المنتج
    const updatePayload = {
      $inc: { returnCount: 1 },
    };
    if (totalSold > 0) {
      updatePayload.$set = { totalSold };
    }

    const updated = await Product.findOneAndUpdate(prodQuery, updatePayload, { new: true });
    if (updated) {
      console.log(
        `⚡ [Automation Hook] Product "${updated.name}" updated: returnCount=${updated.returnCount}, totalSold=${updated.totalSold}`
      );
    }
  } catch (err) {
    console.error('❌ [Return post-save hook error]:', err.message);
  }
});

module.exports = mongoose.models.Return || mongoose.model('Return', returnSchema);
