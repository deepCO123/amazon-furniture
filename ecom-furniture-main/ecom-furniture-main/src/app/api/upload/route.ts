import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

/**
 * POST /api/upload
 * Handles product image uploads.
 * If Cloudinary environment variables are set, uploads directly to Cloudinary CDN
 * with automatic image optimization (f_auto, q_auto).
 * Falls back gracefully to base64 Data URL if Cloudinary is not configured.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = (formData.get("file") ||
      formData.get("receipt") ||
      formData.get("image")) as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "لم يتم العثور على ملف الصورة" },
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
          // Unsigned upload via preset
          uploadForm.append("upload_preset", uploadPreset);
          uploadForm.append("folder", "amazon-furniture/products");
        } else if (apiKey && apiSecret) {
          // Signed upload
          const timestamp = Math.round(Date.now() / 1000).toString();
          const folder = "amazon-furniture/products";
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
          console.log(`[Cloudinary] Image uploaded successfully: ${secureUrl}`);
          return NextResponse.json({
            success: true,
            url: secureUrl,
            provider: "cloudinary",
            publicId: cloudData.public_id,
            format: cloudData.format,
            bytes: cloudData.bytes,
          });
        } else {
          const errText = await cloudRes.text();
          console.warn("[Cloudinary] Upload failed, falling back to base64:", errText);
        }
      } catch (cloudErr) {
        console.warn("[Cloudinary] Error connecting to Cloudinary:", cloudErr);
      }
    }

    // ── 2. Fallback: Return optimized base64 Data URL ──
    return NextResponse.json({
      success: true,
      url: dataUri,
      provider: "base64-fallback",
      message:
        cloudName
          ? "تم حفظ الصورة كـ Base64 (تحقق من مفاتيح Cloudinary)"
          : "تم حفظ الصورة كـ Base64 (للتفعيل السحابي الدائم، أضف مفاتيح Cloudinary في Vercel)",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "فشل رفع الصورة";
    console.error("[Upload API Error]:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

