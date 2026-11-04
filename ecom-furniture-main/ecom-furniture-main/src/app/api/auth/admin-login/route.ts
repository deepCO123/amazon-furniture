import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

export const runtime = "nodejs";

const JWT_SECRET =
  process.env.JWT_SECRET || "x9mK#vL2@nPqR7sT!uW5yZ3&aB8cD1eF4gH6jM0nQ2rS5vX8yA1bC4dE7fG0hJ";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const normalizedEmail = (email || "").toLowerCase().trim();
    const isAdminEmail =
      normalizedEmail === "admin@amazonfurniture.eg" ||
      normalizedEmail === "admin";
    const isAdminPass =
      password === "Admin@Pass2026!" ||
      password === "admin" ||
      password === "admin123";

    if (!isAdminEmail || !isAdminPass) {
      return NextResponse.json(
        { success: false, message: "بيانات اعتماد الأدمن غير صحيحة." },
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
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "خطأ أثناء تسجيل دخول الإدارة";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
