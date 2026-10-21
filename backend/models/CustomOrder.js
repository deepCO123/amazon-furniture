/**
 * backend/models/CustomOrder.js
 * نموذج Mongoose لطلبات تفصيل وتصنيع الأثاث بمقاسات ومواصفات خاصة
 */

const mongoose = require('mongoose');

const customOrderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerEmail: { type: String, default: '', lowercase: true, trim: true },
    city: { type: String, default: '' },
    address: { type: String, default: '' },
    furnitureType: { type: String, required: true },
    dimensions: {
      length: { type: String, default: '' },
      width: { type: String, default: '' },
      height: { type: String, default: '' },
      shape: { type: String, default: '' },
    },
    preferredMaterial: { type: String, default: '' },
    preferredColor: { type: String, default: '' },
    notes: { type: String, default: '' },
    referenceImage: { type: String, default: '' },
    status: {
      type: String,
      enum: ['new', 'under_review', 'quoted', 'agreed', 'in_production', 'completed', 'cancelled'],
      default: 'under_review',
      index: true,
    },
    quotePrice: { type: Number, default: 0 },
    adminNotes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.CustomOrder || mongoose.model('CustomOrder', customOrderSchema);
