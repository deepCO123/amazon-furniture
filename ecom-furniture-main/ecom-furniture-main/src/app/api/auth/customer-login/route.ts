import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { CustomerModel } from "@/lib/models/Customer";
import { SignJWT } from "jose";

export const runtime = "nodejs";

const JWT_SECRET =
  process.env.JWT_SECRET || "x9mK#vL2@nPqR7sT!uW5yZ3&aB8cD1eF4gH6jM0nQ2rS5vX8yA1bC4dE7fG0hJ";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "يرجى إدخال البريد الإلكتروني." },
        { status: 400 }
      );
    }

    const rawEmail = (email || "").toLowerCase().trim();
    const normalizedEmail =
      rawEmail === "admin" ? "admin@amazonfurniture.eg" : rawEmail;

    // ── 1. Check if Admin Login ──
    const isAdminEmail =
      normalizedEmail === "admin@amazonfurniture.eg" ||
      normalizedEmail === "admin";
    const isAdminPass =
      password === "Admin@Pass2026!" ||
      password === "admin" ||
      password === "admin123";

    if (isAdminEmail) {
      if (!password) {
        return NextResponse.json(
          { success: false, message: "يرجى إدخال كلمة المرور." },
          { status: 400 }
        );
      }
      if (!isAdminPass) {
        return NextResponse.json(
          { success: false, message: "بيانات اعتماد الدخول غير صحيحة." },
          { status: 401 }
        );
      }

      const adminUser = {
        id: "admin_01",
        name: "محمد إسماعيل (المدير العام)",
        email: "admin@amazonfurniture.eg",
        role: "admin",
      };

      const secretKey = new TextEncoder().encode(JWT_SECRET);
      const token = await new SignJWT(adminUser)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secretKey);

      const response = NextResponse.json({
        success: true,
        token,
        message: "مرحباً بعودتك للوحة التحكم الإدارية.",
        user: adminUser,
      });

      const isProd = process.env.NODE_ENV === "production";
      response.cookies.set("token", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      return response;
    }

    // ── 2. Standard Customer Login / Auto-Registration ──
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, message: "البريد الإلكتروني غير صالح." },
        { status: 400 }
      );
    }

    let customerUser = {
      id: `cust_${Date.now()}`,
      email: normalizedEmail,
      name: name || normalizedEmail.split("@")[0] || "عميل كريم",
      role: "customer",
      provider: "email",
    };

    try {
      await connectToDatabase();
      let customer = await CustomerModel.findOne({ email: normalizedEmail });

      if (customer) {
        customerUser = {
          id: customer.id,
          email: customer.email,
          name: customer.name || customerUser.name,
          role: customer.role || "customer",
          provider: customer.provider || "email",
        };
      } else {
        const created = await CustomerModel.create({
          id: customerUser.id,
          email: normalizedEmail,
          name: customerUser.name,
          role: "customer",
          provider: "email",
          city: "المنصورة",
          ordersCount: 0,
          totalSpent: 0,
        });
        customerUser.id = created.id;
      }
    } catch (dbErr) {
      console.warn("[Customer Login DB fallback]:", dbErr);
    }

    const secretKey = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT(customerUser)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secretKey);

    const response = NextResponse.json({
      success: true,
      token,
      message: "تم تسجيل الدخول بنجاح",
      user: customerUser,
    });

    const isProd = process.env.NODE_ENV === "production";
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "حدث خطأ أثناء تسجيل الدخول";
    console.error("[Customer Login API Error]:", err);
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

