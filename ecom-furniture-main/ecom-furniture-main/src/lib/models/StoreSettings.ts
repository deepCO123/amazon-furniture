import mongoose, { Schema, Document } from "mongoose";

export interface IStoreSettings extends Document {
  metaPixelId: string;
  depositPercentage: number;
  instapayAddress: string;
  instapayPhone: string;
  vodafoneCashNumber: string;
  depositEnabled: boolean;
  updatedAt: Date;
}

const StoreSettingsSchema = new Schema(
  {
    metaPixelId: { type: String, default: "" },
    depositPercentage: { type: Number, default: 25 },
    instapayAddress: { type: String, default: "amazonfurniture@instapay" },
    instapayPhone: { type: String, default: "01091084863" },
    vodafoneCashNumber: { type: String, default: "01091084863" },
    depositEnabled: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: "store_settings",
  }
);

export const StoreSettingsModel =
  mongoose.models.StoreSettings ||
  mongoose.model<IStoreSettings>("StoreSettings", StoreSettingsSchema);
