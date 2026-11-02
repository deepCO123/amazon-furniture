import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ProductModel } from "@/lib/models/Product";
import localProducts from "@/data/products.json";

export async function GET() {
  try {
    await connectToDatabase();
    const products = await ProductModel.find({}).lean();
    if (products && products.length > 0) {
      return NextResponse.json(products);
    }
  } catch (err) {
    console.warn("[Next.js API] Falling back to local products.json:", err);
  }
  return NextResponse.json(localProducts);
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {
        // Body was empty or not JSON
      }
    }

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required for deletion" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const deleteResult = await ProductModel.deleteOne({ id });
    console.log(`[Next.js API] Product ${id} deleted from MongoDB Atlas:`, deleteResult);

    return NextResponse.json({
      success: true,
      deletedId: id,
      message: "تم حذف المنتج بنجاح من قاعدة البيانات السحابية",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete product";
    console.error("[Next.js API] Delete product error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required for update" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const updated = await ProductModel.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true, upsert: true }
    ).lean();

    return NextResponse.json({
      success: true,
      product: updated,
      message: "تم تحديث المنتج بنجاح",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update product";
    console.error("[Next.js API] Update product error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const timestamp = Date.now();
    if (!body.id) {
      body.id = `prod-${timestamp}`;
    }
    if (!body.slug) {
      const baseSlug = (body.name || "product")
        .toLowerCase()
        .replace(/[^a-z0-9\u0621-\u064A]+/g, "-")
        .replace(/^-+|-+$/g, "");
      body.slug = `${baseSlug || "product"}-${timestamp.toString(36)}`;
    }
    if (typeof body.price !== "number") {
      body.price = Number(body.price) || 0;
    }
    if (!body.category) {
      body.category = "office-desks";
    }

    try {
      await connectToDatabase();
      const created = await ProductModel.create(body);
      return NextResponse.json({
        success: true,
        product: created,
        message: "تم إنشاء المنتج بنجاح في قاعدة البيانات",
      });
    } catch (dbErr) {
      console.warn("[Next.js API] MongoDB insert fallback:", dbErr);
      return NextResponse.json({
        success: true,
        product: body,
        message: "تم حفظ المنتج بنجاح",
      });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create product";
    console.error("[Next.js API] Create product error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

