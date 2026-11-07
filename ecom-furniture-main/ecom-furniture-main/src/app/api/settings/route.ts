import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { StoreSettingsModel } from "@/lib/models/StoreSettings";

export const runtime = "nodejs";

const defaultSettings = {
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID && process.env.NEXT_PUBLIC_META_PIXEL_ID !== "987654321098765"
    ? process.env.NEXT_PUBLIC_META_PIXEL_ID
    : "",
  depositPercentage: 25,
  instapayAddress: "amazonfurniture@instapay",
  instapayPhone: "01091084863",
  vodafoneCashNumber: "01091084863",
  depositEnabled: true,
};

export async function GET() {
  try {
    await connectToDatabase();
    let settings = await StoreSettingsModel.findOne({}).lean();
    if (!settings) {
      settings = await StoreSettingsModel.create(defaultSettings);
    }
    return NextResponse.json({
      success: true,
      settings: {
        metaPixelId: settings.metaPixelId || defaultSettings.metaPixelId,
        depositPercentage: settings.depositPercentage ?? defaultSettings.depositPercentage,
        instapayAddress: settings.instapayAddress || defaultSettings.instapayAddress,
        instapayPhone: settings.instapayPhone || defaultSettings.instapayPhone,
        vodafoneCashNumber: settings.vodafoneCashNumber || defaultSettings.vodafoneCashNumber,
        depositEnabled: settings.depositEnabled ?? true,
      },
    });
  } catch (err: unknown) {
    console.error("[API settings] GET error:", err);
    return NextResponse.json({
      success: true,
      settings: defaultSettings,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await connectToDatabase();

    const updateData = {
      metaPixelId: typeof body.metaPixelId === "string" ? body.metaPixelId.trim() : "",
      depositPercentage: typeof body.depositPercentage === "number" ? Math.max(5, Math.min(100, body.depositPercentage)) : 25,
      instapayAddress: typeof body.instapayAddress === "string" ? body.instapayAddress.trim() : "amazonfurniture@instapay",
      instapayPhone: typeof body.instapayPhone === "string" ? body.instapayPhone.trim() : "01091084863",
      vodafoneCashNumber: typeof body.vodafoneCashNumber === "string" ? body.vodafoneCashNumber.trim() : "01091084863",
      depositEnabled: typeof body.depositEnabled === "boolean" ? body.depositEnabled : true,
    };

    const updated = await StoreSettingsModel.findOneAndUpdate(
      {},
      { $set: updateData },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: "تم حفظ إعدادات المتجر والدفع والبيكسل بنجاح",
      settings: updated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "فشل حفظ الإعدادات";
    console.error("[API settings] POST error:", err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
