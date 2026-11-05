import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { CustomOrderModel } from "@/lib/models/CustomOrder";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    await connectToDatabase();
    const updated = await CustomOrderModel.findOneAndUpdate(
      { id },
      { $set: body },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "طلب التفصيل غير موجود" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      customOrder: updated,
      message: "تم تحديث طلب التفصيل بنجاح",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update custom order";
    console.error("[Next.js API] PATCH /api/custom-orders/[id] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const deleted = await CustomOrderModel.findOneAndDelete({ id }).lean();

    if (!deleted) {
      return NextResponse.json({ error: "طلب التفصيل غير موجود" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "تم حذف طلب التفصيل بنجاح",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete custom order";
    console.error("[Next.js API] DELETE /api/custom-orders/[id] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

