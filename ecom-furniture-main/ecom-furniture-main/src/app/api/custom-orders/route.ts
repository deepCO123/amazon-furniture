import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { CustomOrderModel } from "@/lib/models/CustomOrder";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectToDatabase();
    const customOrders = await CustomOrderModel.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(customOrders || []);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch custom orders";
    console.error("[Next.js API] GET /api/custom-orders error:", msg);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await connectToDatabase();

    const orderId = body.id || `CUS-${Math.floor(100000 + Math.random() * 900000)}`;
    const newCustomOrder = {
      ...body,
      id: orderId,
      status: body.status || "under_review",
    };

    const created = await CustomOrderModel.create(newCustomOrder);

    return NextResponse.json({
      success: true,
      customOrder: created,
      id: orderId,
      message: "تم تسجيل طلب التفصيل بنجاح",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create custom order";
    console.error("[Next.js API] POST /api/custom-orders error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const all = searchParams.get("all");

    await connectToDatabase();

    if (all === "true") {
      await CustomOrderModel.deleteMany({});
      return NextResponse.json({ success: true, message: "تم حذف جميع طلبات التفصيل" });
    }

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await CustomOrderModel.findOneAndDelete({ id });
    return NextResponse.json({ success: true, message: "تم حذف طلب التفصيل بنجاح" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete custom order";
    console.error("[Next.js API] DELETE /api/custom-orders error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

