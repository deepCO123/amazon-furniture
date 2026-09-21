/**
 * backend/models/Quotation.js
 * مخطط Mongoose لعروض الأسعار الرسمية للشركات والعملاء
 */

const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema(
  {
    name: { type: String },
    product: { type: Object },
    quantity: { type: Number, default: 1 },
    color: { type: String, default: '' },
    unitPrice: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  { _id: false, strict: false }
);

const quotationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, default: '' },
    customerEmail: { type: String, default: '', lowercase: true },
    companyName: { type: String, default: '' },
    city: { type: String, default: '' },
    items: { type: [quotationItemSchema], default: [] },
    subtotal: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
    validUntil: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['draft', 'sent', 'accepted', 'declined', 'expired'],
      default: 'draft',
      index: true,
    },
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

module.exports = mongoose.models.Quotation || mongoose.model('Quotation', quotationSchema);
