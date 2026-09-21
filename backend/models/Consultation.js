/**
 * backend/models/Consultation.js
 * مخطط Mongoose لطلبات الاستشارة والمعاينة المجانية
 */

const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    consultType: {
      type: String,
      enum: ['mansoura', 'online', 'custom'],
      default: 'mansoura',
    },
    address: { type: String, default: '' },
    googleMapsUrl: { type: String, default: '' },
    spaceType: { type: String, default: 'شركة ومكاتب إدارية' },
    preferredTime: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['new', 'contacted', 'scheduled', 'completed', 'cancelled'],
      default: 'new',
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

module.exports = mongoose.models.Consultation || mongoose.model('Consultation', consultationSchema);
