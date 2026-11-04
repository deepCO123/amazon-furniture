import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { CustomerModel } from "@/lib/models/Customer";
import { SignJWT } from "jose";

export const runtime = "nodejs";

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const JWT_SECRET =
  process.env.JWT_SECRET || "x9mK#vL2@nPqR7sT!uW5yZ3&aB8cD1eF4gH6jM0nQ2rS5vX8yA1bC4dE7fG0hJ";

/**
 * GET /api/auth/google
 * Initiates the Google OAuth 2.0 flow
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const returnTo = searchParams.get("returnTo") || "/";
  const origin = req.nextUrl.origin || "http://localhost:3000";

  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.redirect(
      new URL(`/auth/login?error=google_not_configured`, origin)
    );
  }

  const callbackUrl =
    process.env.GOOGLE_CALLBACK_URL || `${origin}/api/auth/callback/google`;

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
  googleAuthUrl.searchParams.set("redirect_uri", callbackUrl);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid profile email");
  googleAuthUrl.searchParams.set("access_type", "online");
  googleAuthUrl.searchParams.set("prompt", "select_account");
  googleAuthUrl.searchParams.set("state", returnTo);

  return NextResponse.redirect(googleAuthUrl.toString());
}

/**
 * POST /api/auth/google
 * Verifies Google ID Token from Google One-Tap or Google Identity Services
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body.credential || body.idToken || body.token;

    if (!token) {
      return NextResponse.json(
        { error: "Google token is required" },
        { status: 400 }
      );
    }

    // Verify token with Google's official tokeninfo endpoint
    const googleRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`
    );

    if (!googleRes.ok) {
      return NextResponse.json(
        { error: "Invalid or expired Google token" },
        { status: 401 }
      );
    }

    const payload = await googleRes.json();
    if (GOOGLE_CLIENT_ID && payload.aud !== GOOGLE_CLIENT_ID) {
      return NextResponse.json(
        { error: "Google token audience mismatch" },
        { status: 401 }
      );
    }

    const googleId = payload.sub;
    const email = (payload.email || "").toLowerCase();
    const name = payload.name || payload.given_name || email.split("@")[0];
    const avatar = payload.picture || "";

    // Connect to database and find or create customer
    let customerData = {
      id: `cust_g_${Date.now()}`,
      name,
      email,
      role: "customer" as const,
      avatar,
      provider: "google" as const,
    };

    try {
      await connectToDatabase();
      let customer = await CustomerModel.findOne({
        $or: [{ googleId }, { email }],
      });

      if (customer) {
        if (!customer.googleId) customer.googleId = googleId;
        if (!customer.provider) customer.provider = "google";
        if (avatar && !customer.avatar) customer.avatar = avatar;
        await customer.save();
        customerData = {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          role: customer.role || "customer",
          avatar: customer.avatar || avatar,
          provider: "google",
        };
      } else {
        const created = await CustomerModel.create({
          id: customerData.id,
          name,
          email,
          googleId,
          role: "customer",
          avatar,
          provider: "google",
          city: "المنصورة",
          ordersCount: 0,
          totalSpent: 0,
        });
        customerData.id = created.id;
      }
    } catch (dbErr) {
      console.warn("[Next.js Auth] DB fallback:", dbErr);
    }

    // Sign JWT using jose
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    const jwtToken = await new SignJWT({
      id: customerData.id,
      email: customerData.email,
      role: customerData.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secretKey);

    const response = NextResponse.json({
      success: true,
      user: customerData,
      token: jwtToken,
      message: "تم تسجيل الدخول بنجاح عبر Google",
    });

    const isProd = process.env.NODE_ENV === "production";
    response.cookies.set("token", jwtToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "فشل تسجيل الدخول عبر Google";
    console.error("[Next.js Google Auth Error]:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

