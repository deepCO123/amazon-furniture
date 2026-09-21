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

module.exports = mongoose.models.Return || mongoose.model('Return', returnSchema);
