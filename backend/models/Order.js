/**
 * backend/models/Order.js
 * مخطط Mongoose لطلبات وفواتير الشراء
 */

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      images: { type: [String], default: [] },
      category: { type: String, default: '' },
      slug: { type: String, default: '' },
    },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    color: { type: String, default: '' },
    curtainType: { type: String, default: '' },
    selectedDimensions: { type: Object, default: null },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
    customerPhone: { type: String, default: '' },
    items: { type: [orderItemSchema], required: true, default: [] },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['processing', 'confirmed', 'manufacturing', 'shipped', 'delivered', 'cancelled'],
      default: 'processing',
      index: true,
    },
    date: { type: String, default: () => new Date().toISOString() },
    shippingAddress: { type: shippingAddressSchema, default: () => ({}) },
    notes: { type: String, default: '' },
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

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
