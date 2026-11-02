import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  id: string;
  name: string;
  code?: string;
  sku?: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  material?: string;
  color?: string;
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
  };
  weight?: number;
  stockQuantity: number;
  inStock: boolean;
  featured?: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

const ProductSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    code: { type: String },
    sku: { type: String },
    slug: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    images: { type: [String], default: [] },
    category: { type: String, required: true },
    material: { type: String, default: "" },
    color: { type: String, default: "" },
    dimensions: {
      width: Number,
      height: Number,
      depth: Number,
    },
    weight: { type: Number },
    stockQuantity: { type: Number, default: 10 },
    inStock: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
  },
  {
    timestamps: true,
    collection: "products",
  }
);

export const ProductModel =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

