import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export const runtime = "nodejs";

const JWT_SECRET =
  process.env.JWT_SECRET || "x9mK#vL2@nPqR7sT!uW5yZ3&aB8cD1eF4gH6jM0nQ2rS5vX8yA1bC4dE7fG0hJ";

export async function GET(req: NextRequest) {
  try {
    let token = req.cookies.get("token")?.value;

    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: "غير مسجل الدخول" },
        { status: 401 }
      );
    }

    const secretKey = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secretKey);

    return NextResponse.json({
      success: true,
      user: {
        id: payload.id as string,
        name: (payload.name as string) || (payload.email as string)?.split("@")[0],
        email: payload.email as string,
        role: (payload.role as string) || "customer",
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: "انتهت صلاحية الجلسة" },
      { status: 401 }
    );
  }
}

