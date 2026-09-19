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
  context: { params: Promise<{ filename: string }> | { filename: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const filename = resolvedParams.filename;

    if (!filename || filename.includes("..")) {
      return new NextResponse("Invalid filename", { status: 400 });
    }

    // Possible candidate paths on disk
    const candidatePaths = [
      path.join(process.cwd(), "public", "uploads", filename),
      path.join(process.cwd(), "ecom-furniture-main", "ecom-furniture-main", "public", "uploads", filename),
      path.join(__dirname, "..", "..", "..", "..", "public", "uploads", filename),
      path.resolve("public", "uploads", filename),
    ];

    let foundPath: string | null = null;
    for (const p of candidatePaths) {
      if (existsSync(p)) {
        foundPath = p;
        break;
      }
    }

    if (!foundPath) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const fileBuffer = await readFile(foundPath);
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
