import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {
    root: path.resolve(__dirname, "../../"),
  },
  // Allow Cloudflare tunnels and local development
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "localhost:3000",
    "127.0.0.1:3000",
  ],
  async redirects() {
    return [
      {
        source: "/admin/login",
        destination: "/auth/login",
        permanent: true,
      },
    ];
  },
  // Proxy ALL /api/* requests to Express backend — eliminates CORS
  // and makes the frontend a pure UI layer with zero filesystem I/O
  async rewrites() {
    const isProd = process.env.NODE_ENV === "production";
    const isVercel = Boolean(process.env.VERCEL);
    const configuredBackend = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();

    if (isProd && !configuredBackend) {
      console.warn(
        "⚠️ [Configuration Guard] NEXT_PUBLIC_BACKEND_URL is not set in production. " +
        (isVercel
          ? "Please set NEXT_PUBLIC_BACKEND_URL in your Vercel Project Settings."
          : "Falling back to http://localhost:5000 for local production testing.")
      );
    }

    // In Vercel production without a backend URL, avoid silently proxying to localhost
    const backendUrl = configuredBackend || (isVercel ? "" : "http://localhost:5000");

    if (!backendUrl) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/health",
        destination: `${backendUrl}/health`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
    deviceSizes: [480, 768, 1024, 1280, 1536],
    qualities: [75, 95],
   
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  // Enable HTTP/2 server push for critical assets
  httpAgentOptions: {
    keepAlive: true,
  },
};

export default nextConfig;
