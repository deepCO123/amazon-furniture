import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import type { Quotation } from "@/types";

const QUOTATIONS_FILE = path.join(process.cwd(), "src", "data", "quotations.json");

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const data = await readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return fallback;
  }
}

async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  try {
    const quotations = await readJsonFile<Quotation[]>(QUOTATIONS_FILE, []);
    return NextResponse.json(quotations);
  } catch (error) {
    console.error("Failed to read quotations:", error);
    return NextResponse.json({ error: "Failed to read quotations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, customerEmail, companyName, city, items, subtotal, discount, tax, total, validUntil, notes } = body;

    if (!customerName || !items || !items.length) {
      return NextResponse.json({ error: "Customer name and items are required" }, { status: 400 });
    }

    const quotations = await readJsonFile<Quotation[]>(QUOTATIONS_FILE, []);
    const newQuotation: Quotation = {
      id: `QOT-${new Date().getFullYear()}-${String(quotations.length + 1).padStart(3, "0")}`,
      customerName,
      customerPhone: customerPhone || "",
      customerEmail: customerEmail || "",
      companyName: companyName || "",
      city: city || "",
      items,
      subtotal: Number(subtotal) || 0,
      discount: Number(discount) || 0,
      tax: Number(tax) || 0,
      total: Number(total) || 0,
      validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: notes || "",
      status: "draft",
      createdAt: new Date().toISOString(),
    };

    quotations.unshift(newQuotation);
    await writeJsonFile(QUOTATIONS_FILE, quotations);

    return NextResponse.json({ success: true, quotation: newQuotation });
  } catch (error) {
    console.error("Failed to create quotation:", error);
    return NextResponse.json({ error: "Failed to create quotation" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const quotations = await readJsonFile<Quotation[]>(QUOTATIONS_FILE, []);
    const filtered = quotations.filter((q) => q.id !== id);
    await writeJsonFile(QUOTATIONS_FILE, filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete quotation:", error);
    return NextResponse.json({ error: "Failed to delete quotation" }, { status: 500 });
  }
}
