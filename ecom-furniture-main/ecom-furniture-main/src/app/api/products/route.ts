import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import type { Product } from "@/types";
import { slugify } from "@/lib/utils";
import { requireAdmin, requireValidOrigin } from "@/lib/apiAuth";

const DATA_FILE = path.join(process.cwd(), "src", "data", "products.json");

async function getStoredProducts(): Promise<Product[]> {
  try {
    const content = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    // If file doesn't exist, import initial products
    try {
      const { products } = await import("@/data/products");
      return products;
    } catch {
      return [];
    }
  }
}

async function saveStoredProducts(products: Product[]): Promise<void> {
  await writeFile(DATA_FILE, JSON.stringify(products, null, 2), "utf-8");
}

export async function GET() {
  try {
    const products = await getStoredProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error("GET products error:", error);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Admin-only: create product
  const originCheck = requireValidOrigin(request);
  if (originCheck) return originCheck;
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const data = await request.json();

    if (!data.name || !data.price || !data.category) {
      return NextResponse.json(
        { error: "Name, price, and category are required" },
        { status: 400 }
      );
    }

    const products = await getStoredProducts();

    const id = data.id || `prod_${Date.now()}`;
    const slug = data.slug || `${slugify(data.name)}-${Date.now().toString().slice(-4)}`;

    const newProduct: Product = {
      id,
      name: data.name,
      slug,
      description: data.description || "",
      price: Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
      images: Array.isArray(data.images) && data.images.length > 0
        ? data.images
        : ["https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800"],
      category: data.category,
      material: data.material || "خشب طبيعي",
      color: data.color || "طبيعي",
      dimensions: data.dimensions || { width: 100, height: 75, depth: 80 },
      weight: Number(data.weight) || 20,
      stockQuantity: data.stockQuantity !== undefined ? Number(data.stockQuantity) : 10,
      rating: Number(data.rating) || 5.0,
      reviewCount: Number(data.reviewCount) || 1,
      inStock: data.inStock !== false && (data.stockQuantity === undefined || Number(data.stockQuantity) > 0),
      featured: Boolean(data.featured),
      tags: Array.isArray(data.tags) ? data.tags : [data.category.toLowerCase()],
    };

    // Prepend new product so it appears at top
    products.unshift(newProduct);
    await saveStoredProducts(products);

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("POST product error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  // Admin-only: update product
  const originCheck = requireValidOrigin(request);
  if (originCheck) return originCheck;
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const data = await request.json();

    if (!data.id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const products = await getStoredProducts();
    const index = products.findIndex((p) => p.id === data.id);

    if (index === -1) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Merge updates
    const existing = products[index];
    const newStockQuantity = data.stockQuantity !== undefined 
      ? Math.max(0, Number(data.stockQuantity)) 
      : existing.stockQuantity;

    const updated: Product = {
      ...existing,
      ...data,
      stockQuantity: newStockQuantity,
      inStock: data.inStock !== undefined 
        ? data.inStock && (newStockQuantity === undefined || newStockQuantity > 0)
        : (newStockQuantity !== undefined ? newStockQuantity > 0 : existing.inStock),
      price: Number(data.price ?? existing.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
      weight: Number(data.weight ?? existing.weight),
    };

    products[index] = updated;
    await saveStoredProducts(products);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT product error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  // Admin-only: delete product
  const originCheck = requireValidOrigin(request);
  if (originCheck) return originCheck;
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const products = await getStoredProducts();
    const filtered = products.filter((p) => p.id !== id);

    if (filtered.length === products.length) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await saveStoredProducts(filtered);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("DELETE product error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
