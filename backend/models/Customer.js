/**
 * backend/models/Customer.js
 * مخطط Mongoose لبيانات العملاء وحسابات المتجر
 * يدعم المصادقة عبر البريد الإلكتروني (كلمة مرور مشفرة) وعبر Google OAuth
 */

const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, default: null }, // null for Google OAuth users
    googleId: { type: String, default: null, sparse: true, index: true }, // Google OAuth subject ID
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    avatar: { type: String, default: '' },
    phone: { type: String, default: '' },
    city: { type: String, default: 'القاهرة' },
    provider: { type: String, enum: ['email', 'google'], default: 'email' },
    ordersCount: { type: Number, default: 0, min: 0 },
    totalSpent: { type: Number, default: 0, min: 0 },
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
        delete ret.passwordHash; // Never expose password hash in JSON responses
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
