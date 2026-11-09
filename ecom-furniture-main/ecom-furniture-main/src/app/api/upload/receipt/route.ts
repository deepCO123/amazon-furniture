import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import path from "path";
import fs from "fs";

export const runtime = "nodejs";

/**
 * POST /api/upload/receipt
 * Dedicated endpoint for bank transfer / mobile wallet receipt screenshots.
 * 1. Uploads to Cloudinary (folder: amazon-furniture/receipts) if configured.
 * 2. Saves to local public/uploads if filesystem is writable.
 * 3. Falls back safely to Base64 Data URI (zero data loss, guaranteed to render).
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = (formData.get("receipt") ||
      formData.get("file") ||
      formData.get("image")) as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "لم يتم العثور على ملف إيصال التحويل" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || "image/jpeg";
    const base64Data = buffer.toString("base64");
    const dataUri = `data:${mimeType};base64,${base64Data}`;

    // Cloudinary credentials from environment
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    // ── 1. If Cloudinary is configured, upload to Cloudinary CDN ──
    if (cloudName && ((apiKey && apiSecret) || uploadPreset)) {
      try {
        const uploadForm = new FormData();
        uploadForm.append("file", dataUri);

        if (uploadPreset) {
          uploadForm.append("upload_preset", uploadPreset);
          uploadForm.append("folder", "amazon-furniture/receipts");
        } else if (apiKey && apiSecret) {
          const timestamp = Math.round(Date.now() / 1000).toString();
          const folder = "amazon-furniture/receipts";
          const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
          const signature = crypto
            .createHash("sha1")
            .update(stringToSign)
            .digest("hex");

          uploadForm.append("api_key", apiKey);
          uploadForm.append("timestamp", timestamp);
          uploadForm.append("signature", signature);
          uploadForm.append("folder", folder);
        }

        const cloudRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: uploadForm,
          }
        );

        if (cloudRes.ok) {
          const cloudData = await cloudRes.json();
          const secureUrl = cloudData.secure_url || cloudData.url;
          return NextResponse.json({
            success: true,
            url: secureUrl,
            provider: "cloudinary",
            publicId: cloudData.public_id,
          });
        }
      } catch (cloudErr) {
        console.warn("[Receipt Upload] Cloudinary error, falling back:", cloudErr);
      }
    }

    // ── 2. Attempt saving to local public/uploads if filesystem is writable ──
    try {
      const ext = path.extname(file.name || "").toLowerCase() || (mimeType.includes("png") ? ".png" : ".jpg");
      const cleanName = path.basename(file.name || "receipt", ext).replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `receipt-${Date.now()}-${cleanName}${ext}`;

      const candidateDirs = [
        path.resolve(process.cwd(), "public", "uploads"),
        path.resolve(process.cwd(), "ecom-furniture-main", "ecom-furniture-main", "public", "uploads"),
      ];

      for (const dir of candidateDirs) {
        try {
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          await fs.promises.writeFile(path.join(dir, filename), buffer);
          return NextResponse.json({
            success: true,
            url: `/uploads/${filename}`,
            provider: "local",
          });
        } catch {
          // Try next directory
        }
      }
    } catch {
      // Local filesystem write not available (e.g., serverless Vercel)
    }

    // ── 3. Fallback: Return Base64 Data URI (Always works, persists in DB) ──
    return NextResponse.json({
      success: true,
      url: dataUri,
      provider: "base64-fallback",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "فشل رفع صورة الإيصال";
    console.error("[Receipt Upload API Error]:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
