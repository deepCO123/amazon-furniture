/**
 * backend/models/Coupon.js
 * نموذج Mongoose لكوبونات وقسائم الخصم الديناميكية
 */

const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'كود الخصم مطلوب'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      required: [true, 'قيمة الخصم مطلوبة'],
      min: [1, 'قيمة الخصم يجب أن تكون 1 على الأقل'],
    },
    minOrderTotal: {
      type: Number,
      default: 0,
      min: [0, 'الحد الأدنى للطلب لا يمكن أن يكون سالباً'],
    },
    maxDiscount: {
      type: Number,
      default: null,
    },
    usageLimit: {
      type: Number,
      default: null, // null means unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    perCustomerLimit: {
      type: Number,
      default: 1,
      min: 1,
    },
    usedBy: [
      {
        email: { type: String, lowercase: true, trim: true },
        orderId: { type: String },
        usedAt: { type: Date, default: Date.now },
      },
    ],
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    descriptionAr: {
      type: String,
      default: '',
    },
    descriptionEn: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Coupon', couponSchema);
