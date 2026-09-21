/**
 * backend/models/Email.js
 * مخطط Mongoose لأرشيف وسجل الإيميلات المرسلة
 */

const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    to: { type: String, required: true, lowercase: true, trim: true, index: true },
    recipientName: { type: String, default: '' },
    subject: { type: String, required: true },
    type: { type: String, default: 'WELCOME' },
    orderId: { type: String, default: '' },
    date: { type: String, default: () => new Date().toISOString() },
    htmlContent: { type: String, default: '' },
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

module.exports = mongoose.models.Email || mongoose.model('Email', emailSchema);
