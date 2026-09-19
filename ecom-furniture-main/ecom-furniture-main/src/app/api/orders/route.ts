import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import type { Order, Product, User } from "@/types";

const ORDERS_FILE = path.join(process.cwd(), "src", "data", "orders.json");
const PRODUCTS_FILE = path.join(process.cwd(), "src", "data", "products.json");
const CUSTOMERS_FILE = path.join(process.cwd(), "src", "data", "customers.json");

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
    const orders = await readJsonFile<Order[]>(ORDERS_FILE, []);
    return NextResponse.json(orders);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to read orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, total, shippingAddress, notes, customerName, customerEmail, customerPhone } = body;

    if (!items || !items.length) {
      return NextResponse.json({ error: "Order must contain items" }, { status: 400 });
    }

    const orderId = body.id || `AF-${Math.floor(100000 + Math.random() * 900000)}`;

    // 1. Deduct stock from products
    const products = await readJsonFile<Product[]>(PRODUCTS_FILE, []);
    for (const item of items) {
      const prodIndex = products.findIndex((p) => p.id === item.product.id);
      if (prodIndex !== -1) {
        const currentStock = products[prodIndex].stockQuantity ?? 10;
        const newStock = Math.max(0, currentStock - item.quantity);
        products[prodIndex].stockQuantity = newStock;
        if (newStock === 0) {
          products[prodIndex].inStock = false;
        }
      }
    }
    await writeJsonFile(PRODUCTS_FILE, products);

    // 2. Save order
    const orders = await readJsonFile<Order[]>(ORDERS_FILE, []);
    const newOrder: Order = {
      id: orderId,
      customerName: customerName || shippingAddress.firstName,
      customerEmail: customerEmail || shippingAddress.email,
      customerPhone: customerPhone || shippingAddress.phone,
      items,
      total,
      status: "processing",
      date: new Date().toISOString(),
      shippingAddress,
      notes: notes || "",
    };
    orders.unshift(newOrder);
    await writeJsonFile(ORDERS_FILE, orders);

    // 3. Update customer stats
    const customers = await readJsonFile<User[]>(CUSTOMERS_FILE, []);
    const emailToMatch = (customerEmail || shippingAddress.email || "").toLowerCase();
    const custIndex = customers.findIndex(
      (c) => c.email.toLowerCase() === emailToMatch
    );

    if (custIndex !== -1) {
      customers[custIndex].ordersCount = (customers[custIndex].ordersCount || 0) + 1;
      customers[custIndex].totalSpent = (customers[custIndex].totalSpent || 0) + total;
      customers[custIndex].phone = customerPhone || shippingAddress.phone;
      customers[custIndex].city = shippingAddress.city;
    } else if (emailToMatch) {
      // Register new customer on the fly
      customers.push({
        id: `cust_${Date.now()}`,
        name: customerName || `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim(),
        email: emailToMatch,
        phone: customerPhone || shippingAddress.phone,
        city: shippingAddress.city,
        createdAt: new Date().toISOString(),
        provider: "email",
        ordersCount: 1,
        totalSpent: total,
      });
    }
    await writeJsonFile(CUSTOMERS_FILE, customers);

    // 4. Send Confirmation Email
    try {
      const emailUrl = new URL("/api/email", request.url);
      await fetch(emailUrl.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "ORDER_CONFIRMATION",
          to: customerEmail || shippingAddress.email,
          recipientName: customerName || shippingAddress.firstName,
          orderId,
          items: items.map((it: { product: { name: string; price: number }; quantity: number; color?: string }) => ({
            name: it.product.name,
            quantity: it.quantity,
            price: it.product.price * it.quantity,
            color: it.color,
          })),
          total,
          phone: customerPhone || shippingAddress.phone,
          address: shippingAddress.address,
          city: shippingAddress.city,
          notes,
        }),
      });
    } catch (emailErr) {
      console.error("Auto email dispatch failed:", emailErr);
    }

    return NextResponse.json({
      success: true,
      order: newOrder,
      orderId,
      updatedProducts: products,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { orderId, status } = await request.json();
    if (!orderId || !status) {
      return NextResponse.json(
        { error: "orderId and status are required" },
        { status: 400 }
      );
    }

    const orders = await readJsonFile<Order[]>(ORDERS_FILE, []);
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    orders[idx].status = status;
    await writeJsonFile(ORDERS_FILE, orders);

    return NextResponse.json({ success: true, order: orders[idx] });
  } catch (error) {
    console.error("Failed to update order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}

