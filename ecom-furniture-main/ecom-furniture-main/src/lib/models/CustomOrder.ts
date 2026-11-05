import mongoose, { Schema, Document } from "mongoose";

export interface ICustomOrder extends Document {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  city?: string;
  address?: string;
  furnitureType: string;
  dimensions?: {
    length?: string;
    width?: string;
    height?: string;
    shape?: string;
  };
  preferredMaterial?: string;
  preferredColor?: string;
  notes?: string;
  referenceImage?: string;
  status: "new" | "under_review" | "quoted" | "agreed" | "in_production" | "completed" | "cancelled";
  quotePrice?: number;
  adminNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CustomOrderSchema = new Schema<ICustomOrder>(
  {
    id: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerEmail: { type: String, default: "", lowercase: true, trim: true },
    city: { type: String, default: "" },
    address: { type: String, default: "" },
    furnitureType: { type: String, required: true },
    dimensions: {
      length: { type: String, default: "" },
      width: { type: String, default: "" },
      height: { type: String, default: "" },
      shape: { type: String, default: "" },
    },
    preferredMaterial: { type: String, default: "" },
    preferredColor: { type: String, default: "" },
    notes: { type: String, default: "" },
    referenceImage: { type: String, default: "" },
    status: {
      type: String,
      enum: ["new", "under_review", "quoted", "agreed", "in_production", "completed", "cancelled"],
      default: "under_review",
      index: true,
    },
    quotePrice: { type: Number, default: 0 },
    adminNotes: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

export const CustomOrderModel =
  mongoose.models.CustomOrder ||
  mongoose.model<ICustomOrder>("CustomOrder", CustomOrderSchema);

