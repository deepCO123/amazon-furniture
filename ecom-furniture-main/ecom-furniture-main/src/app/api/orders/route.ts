import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { OrderModel } from "@/lib/models/Order";

export async function GET() {
  try {
    await connectToDatabase();
    const orders = await OrderModel.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(orders || []);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch orders";
    console.error("[Next.js API] GET /api/orders error:", err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await connectToDatabase();

    const orderId = body.id || `AF-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder = {
      ...body,
      id: orderId,
      date: body.date || new Date().toISOString(),
      status: body.status || "under_review",
    };

    const created = await OrderModel.create(newOrder);

    return NextResponse.json({
      success: true,
      order: created,
      orderId,
      message: "تم حفظ الطلب بنجاح في قاعدة البيانات السحابية",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create order";
    console.error("[Next.js API] POST /api/orders error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "orderId and status are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const updated = await OrderModel.findOneAndUpdate(
      { id: orderId },
      { $set: { status } },
      { new: true }
    ).lean();

    return NextResponse.json({
      success: true,
      order: updated,
      message: "تم تحديث حالة الطلب بنجاح",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update order status";
    console.error("[Next.js API] PATCH /api/orders error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

