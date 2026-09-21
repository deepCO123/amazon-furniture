/**
 * backend/models/Product.js
 * مخطط Mongoose لمنتجات المتجر
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    images: { type: [String], default: [] },
    category: { type: String, required: true, index: true },
    material: { type: String, default: 'خشب طبيعي' },
    color: { type: String, default: 'طبيعي' },
    dimensions: {
      width: { type: Number, default: 100 },
      height: { type: Number, default: 75 },
      depth: { type: Number, default: 80 },
    },
    weight: { type: Number, default: 20 },
    stockQuantity: { type: Number, default: 10, min: 0 },
    rating: { type: Number, default: 5.0, min: 1, max: 5 },
    reviewCount: { type: Number, default: 1, min: 0 },
    inStock: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
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

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
