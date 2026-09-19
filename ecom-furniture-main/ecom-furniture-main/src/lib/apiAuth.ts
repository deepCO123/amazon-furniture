/**
 * apiAuth.ts
 * Server-side JWT authentication helper for Next.js API Routes.
 * Reads JWT from cookie or Authorization header, verifies with JWT_SECRET.
 * 
 * IMPORTANT: This file runs on the server only (used in API routes).
 * The JWT_SECRET comes from process.env (NOT NEXT_PUBLIC_).
 */

import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";

// Re-export for convenience — no dependency on jsonwebtoken in Next.js
// Using jose which is Edge-compatible and works with Next.js middleware

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Extract JWT token from request cookies or Authorization header
 */
function extractToken(request: NextRequest): string | null {
  // 1. Try cookie first (HttpOnly cookie set by Express)
  const cookieToken = request.cookies.get("token")?.value;
  if (cookieToken) return cookieToken;

  // 2. Fallback to Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return null;
}

/**
 * Verify and decode JWT token
 */
async function verifyToken(token: string): Promise<JwtPayload | null> {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("[apiAuth] JWT_SECRET environment variable is not set!");
    return null;
  }

  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jose.jwtVerify(token, secretKey);
    return payload as unknown as JwtPayload;
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired) {
      console.warn("[apiAuth] Token expired");
    } else {
      console.warn("[apiAuth] Token verification failed:", (error as Error).message);
    }
    return null;
  }
}

/**
 * Check if Origin/Referer header matches allowed domains (basic CSRF protection)
 */
function checkOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const allowedOrigins = [
    process.env.CLIENT_URL || "http://localhost:3000",
    "http://localhost:3000",
    "http://localhost:5000",
  ];

  // Allow requests with no origin (server-side, curl, etc. in development)
  if (!origin && !referer) {
    return process.env.NODE_ENV !== "production";
  }

  if (origin && allowedOrigins.some((o) => origin.startsWith(o))) return true;
  if (referer && allowedOrigins.some((o) => referer.startsWith(o))) return true;

  return false;
}

/**
 * Middleware: Require authenticated user (any role)
 * Returns the user payload if authenticated, or a 401 response.
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: JwtPayload } | NextResponse> {
  const token = extractToken(request);

  if (!token) {
    return NextResponse.json(
      { error: "Authentication required. Please log in." },
      { status: 401 }
    );
  }

  const user = await verifyToken(token);
  if (!user) {
    return NextResponse.json(
      { error: "Invalid or expired session. Please log in again." },
      { status: 401 }
    );
  }

  return { user };
}

/**
 * Middleware: Require admin role
 * Returns the user payload if admin, or a 403 response.
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ user: JwtPayload } | NextResponse> {
  const authResult = await requireAuth(request);

  // If it's a NextResponse, it means authentication failed
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  if (authResult.user.role !== "admin") {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 403 }
    );
  }

  return authResult;
}

/**
 * Middleware: CSRF origin check for mutating requests
 */
export function requireValidOrigin(request: NextRequest): NextResponse | null {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    if (!checkOrigin(request)) {
      return NextResponse.json(
        { error: "Invalid request origin." },
        { status: 403 }
      );
    }
  }
  return null;
}

export type { JwtPayload };
