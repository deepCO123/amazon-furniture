import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: unknown[];
  total: number;
  subtotal?: number;
  shippingCost?: number;
  discount?: number;
  couponCode?: string;
  status: string;
  paymentMethod?: string;
  paymentStatus?: string;
  shippingAddress?: unknown;
  notes?: string;
  date?: string;
}

const OrderSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, default: "" },
    customerPhone: { type: String, required: true },
    items: { type: [Schema.Types.Mixed], default: [] },
    total: { type: Number, required: true },
    subtotal: { type: Number },
    shippingCost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    status: {
      type: String,
      enum: ["under_review", "confirmed", "in_production", "shipped", "delivered", "cancelled"],
      default: "under_review",
    },
    paymentMethod: { type: String, default: "cod" },
    paymentStatus: { type: String, default: "pending" },
    paymentDetails: { type: Schema.Types.Mixed, default: {} },
    shippingAddress: { type: Schema.Types.Mixed, default: {} },
    notes: { type: String, default: "" },
    date: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: true,
    collection: "orders",
  }
);

export const OrderModel =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

