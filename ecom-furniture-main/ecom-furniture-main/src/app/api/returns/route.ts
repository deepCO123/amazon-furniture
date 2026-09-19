import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import type { ReturnRequest } from "@/types";

const RETURNS_FILE = path.join(process.cwd(), "src", "data", "returns.json");

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
    const returns = await readJsonFile<ReturnRequest[]>(RETURNS_FILE, []);
    return NextResponse.json(returns);
  } catch (error) {
    console.error("Failed to read returns:", error);
    return NextResponse.json({ error: "Failed to read returns" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, customerName, customerPhone, productName, productId, price, reason, reasonDetails, images } = body;

    if (!orderId || !customerName || !productName) {
      return NextResponse.json({ error: "Missing required return fields" }, { status: 400 });
    }

    const returns = await readJsonFile<ReturnRequest[]>(RETURNS_FILE, []);
    const newReturn: ReturnRequest = {
      id: `RET-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId,
      customerName,
      customerPhone: customerPhone || "",
      productName,
      productId,
      price: Number(price) || 0,
      reason: reason || "other",
      reasonDetails: reasonDetails || "",
      images: images || [],
      status: "pending_review",
      createdAt: new Date().toISOString(),
    };

    returns.unshift(newReturn);
    await writeJsonFile(RETURNS_FILE, returns);

    return NextResponse.json({ success: true, returnRequest: newReturn });
  } catch (error) {
    console.error("Failed to create return request:", error);
    return NextResponse.json({ error: "Failed to create return" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { returnId, status, conditionAssessment, refundAmount } = await request.json();

    if (!returnId || !status) {
      return NextResponse.json({ error: "returnId and status are required" }, { status: 400 });
    }

    const returns = await readJsonFile<ReturnRequest[]>(RETURNS_FILE, []);
    const idx = returns.findIndex((r) => r.id === returnId);

    if (idx === -1) {
      return NextResponse.json({ error: "Return request not found" }, { status: 404 });
    }

    returns[idx].status = status;
    if (conditionAssessment) returns[idx].conditionAssessment = conditionAssessment;
    if (refundAmount !== undefined) returns[idx].refundAmount = Number(refundAmount);

    await writeJsonFile(RETURNS_FILE, returns);

    return NextResponse.json({ success: true, returnRequest: returns[idx] });
  } catch (error) {
    console.error("Failed to update return status:", error);
    return NextResponse.json({ error: "Failed to update return" }, { status: 500 });
  }
}
