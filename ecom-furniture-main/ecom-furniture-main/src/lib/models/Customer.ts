import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  role: "customer" | "admin";
  avatar?: string;
  phone?: string;
  city?: string;
  provider: "email" | "google";
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
}

const CustomerSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, default: null },
    googleId: { type: String, default: null, sparse: true, index: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    avatar: { type: String, default: "" },
    phone: { type: String, default: "" },
    city: { type: String, default: "المنصورة" },
    provider: { type: String, enum: ["email", "google"], default: "email" },
    ordersCount: { type: Number, default: 0, min: 0 },
    totalSpent: { type: Number, default: 0, min: 0 },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: true,
    collection: "customers",
  }
);

export const CustomerModel =
  mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", CustomerSchema);

