import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const filename = resolvedParams.filename;

    if (!filename || filename.includes("..")) {
      return new NextResponse("Invalid filename", { status: 400 });
    }

    // Resolve upload path with multi-location fallback
    const candidatePaths = [
      path.join(process.cwd(), "public", "uploads", filename),
      path.join(process.cwd(), "ecom-furniture-main", "ecom-furniture-main", "public", "uploads", filename),
      path.resolve(__dirname, "../../../../../public/uploads", filename),
      path.resolve(__dirname, "../../../../../../public/uploads", filename),
      path.resolve(__dirname, "../../../../../backend/uploads", filename),
      path.resolve(process.cwd(), "..", "backend", "uploads", filename),
    ];

    const filePath = candidatePaths.find((p) => existsSync(p));

    if (!filePath) {
      // Fallback: Attempt to proxy from backend if available
      const backendUrl = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000").trim().replace(/\/$/, "");
      try {
        const backendRes = await fetch(`${backendUrl}/uploads/${encodeURIComponent(filename)}`, {
          cache: "no-store",
        });
        if (backendRes.ok) {
          const arrayBuf = await backendRes.arrayBuffer();
          const ext = path.extname(filename).toLowerCase();
          const contentType = backendRes.headers.get("content-type") || MIME_TYPES[ext] || "image/jpeg";
          return new NextResponse(Buffer.from(arrayBuf), {
            status: 200,
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        }
      } catch {
        // Backend fallback failed
      }

      return new NextResponse("Image not found", { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
    const ext = path.extname(filename).toLowerCase();
    const contentType = MIME_TYPES[ext] || "image/jpeg";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Uploads serving error:", error);
    return new NextResponse("Failed to load image", { status: 500 });
  }
}
