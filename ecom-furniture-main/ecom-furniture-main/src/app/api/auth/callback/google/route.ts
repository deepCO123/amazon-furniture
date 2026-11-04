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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state") || "/";
  const origin = req.nextUrl.origin || "http://localhost:3000";

  if (error || !code) {
    console.error("[Google OAuth Callback Error]:", error || "Missing code");
    return NextResponse.redirect(
      new URL(`/auth/login?error=google_failed`, origin)
    );
  }

  try {
    const callbackUrl =
      process.env.GOOGLE_CALLBACK_URL || `${origin}/api/auth/callback/google`;

    // 1. Exchange authorization code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID || "",
        client_secret: GOOGLE_CLIENT_SECRET || "",
        redirect_uri: callbackUrl,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error("[Google Token Exchange Failed]:", errBody);
      return NextResponse.redirect(
        new URL(`/auth/login?error=token_exchange_failed`, origin)
      );
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch user profile from Google
    const userRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!userRes.ok) {
      return NextResponse.redirect(
        new URL(`/auth/login?error=user_info_failed`, origin)
      );
    }

    const profile = await userRes.json();
    const googleId = profile.id;
    const email = (profile.email || "").toLowerCase();
    const name = profile.name || email.split("@")[0];
    const avatar = profile.picture || "";

    // 3. Find or create in Customer collection
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
      console.warn("[Google Callback] DB error, proceeding with session:", dbErr);
    }

    // 4. Issue JWT and set cookie
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

    const redirectPath = state.startsWith("/") ? state : "/";
    const separator = redirectPath.includes("?") ? "&" : "?";
    const redirectUrl = new URL(
      `${redirectPath}${separator}auth=google_success`,
      origin
    );

    const response = NextResponse.redirect(redirectUrl);
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
    console.error("[Google OAuth Callback Catch]:", err);
    return NextResponse.redirect(
      new URL(`/auth/login?error=callback_exception`, origin)
    );
  }
}

