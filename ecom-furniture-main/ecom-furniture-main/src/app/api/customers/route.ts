import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import type { User, Order } from "@/types";
import { requireAdmin } from "@/lib/apiAuth";

const CUSTOMERS_FILE = path.join(process.cwd(), "src", "data", "customers.json");
const ORDERS_FILE = path.join(process.cwd(), "src", "data", "orders.json");

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

export async function GET(request: NextRequest) {
  // Admin-only: view all customers
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const customers = await readJsonFile<User[]>(CUSTOMERS_FILE, []);
    const orders = await readJsonFile<Order[]>(ORDERS_FILE, []);

    // Enrich each customer with their real orders
    const enriched = customers.map((c) => {
      const userOrders = orders.filter(
        (o) =>
          (o.userId && o.userId === c.id) ||
          (o.customerEmail && o.customerEmail.toLowerCase() === c.email.toLowerCase()) ||
          (o.shippingAddress?.email &&
            o.shippingAddress.email.toLowerCase() === c.email.toLowerCase())
      );

      const totalSpent = userOrders.reduce((sum, ord) => sum + (ord.total || 0), 0);

      return {
        ...c,
        ordersCount: userOrders.length,
        totalSpent: totalSpent > 0 ? totalSpent : (c.totalSpent || 0),
        orders: userOrders,
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Customers GET error:", error);
    return NextResponse.json({ error: "Failed to read customers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, avatar, phone, city, provider } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const customers = await readJsonFile<User[]>(CUSTOMERS_FILE, []);
    const existingIndex = customers.findIndex(
      (c) => c.email.toLowerCase() === email.toLowerCase()
    );

    let customer: User;
    let isNew = false;

    if (existingIndex !== -1) {
      // Update existing
      customer = {
        ...customers[existingIndex],
        name: name || customers[existingIndex].name,
        avatar: avatar || customers[existingIndex].avatar,
        phone: phone || customers[existingIndex].phone,
        city: city || customers[existingIndex].city,
      };
      customers[existingIndex] = customer;
    } else {
      // Create new customer
      isNew = true;
      customer = {
        id: `cust_${Date.now()}`,
        name: name || email.split("@")[0],
        email: email.toLowerCase(),
        avatar:
          avatar ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
            name || email
          )}&backgroundColor=c5a880`,
        phone: phone || "",
        city: city || "القاهرة",
        createdAt: new Date().toISOString(),
        provider: provider || "google",
        ordersCount: 0,
        totalSpent: 0,
      };
      customers.unshift(customer);

      // 1. Send Welcome VIP Email to Customer
      try {
        const emailUrl = new URL("/api/email", request.url);
        await fetch(emailUrl.toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "WELCOME",
            to: customer.email,
            recipientName: customer.name,
          }),
        });
      } catch (e) {
        console.error("Welcome email trigger failed:", e);
      }

      // 2. Send Real-time Admin Notification Email to khaledeldeep900@gmail.com
      try {
        const emailUrl = new URL("/api/email", request.url);
        const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "khaledeldeep900@gmail.com";
        await fetch(emailUrl.toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "NEW_USER_ADMIN_ALERT",
            to: adminEmail,
            recipientName: "أ. خالد الديب (مالك المتجر)",
            customerData: {
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
              city: customer.city,
              provider: customer.provider,
              date: new Date().toLocaleString("ar-EG", { timeZone: "Africa/Cairo" }),
            },
          }),
        });
      } catch (e) {
        console.error("Admin notification email trigger failed:", e);
      }
    }

    await writeJsonFile(CUSTOMERS_FILE, customers);
    return NextResponse.json({ success: true, customer, isNew });
  } catch (error) {
    console.error("Customer POST error:", error);
    return NextResponse.json({ error: "Failed to register customer" }, { status: 500 });
  }
}
