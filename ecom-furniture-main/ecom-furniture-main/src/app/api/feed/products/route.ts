import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import type { Product } from "@/types";

const PRODUCTS_FILE = path.join(process.cwd(), "src", "data", "products.json");

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case "\"": return "&quot;";
      default: return c;
    }
  });
}

export async function GET(request: NextRequest) {
  try {
    const data = await readFile(PRODUCTS_FILE, "utf-8");
    const products: Product[] = JSON.parse(data);

    const baseUrl = request.nextUrl.origin || "https://amazonfurniture.eg";

    const itemsXml = products
      .map((p) => {
        const productUrl = `${baseUrl}/products/${p.slug}`;
        const imageUrl = p.images?.[0] || `${baseUrl}/logo.png`;
        const availability = p.inStock && (p.stockQuantity === undefined || p.stockQuantity > 0)
          ? "in_stock"
          : "out_of_stock";

        return `    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <g:title>${escapeXml(p.name)}</g:title>
      <g:description>${escapeXml(p.description || p.name)}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:brand>Amazon Furniture</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${p.price} EGP</g:price>
      ${p.originalPrice ? `<g:sale_price>${p.price} EGP</g:sale_price>` : ""}
      <g:product_type>${escapeXml(p.category)}</g:product_type>
      <g:google_product_category>Furniture</g:google_product_category>
      <g:material>${escapeXml(p.material || "Solid Wood")}</g:material>
      <g:color>${escapeXml(p.color || "Default")}</g:color>
    </item>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Amazon Furniture Catalog — Meta &amp; Google Product Feed</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>كتالوج منتجات Amazon Furniture المحدث لحظياً لإعلانات Meta Business و Google Merchant Center</description>
${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("Feed generation failed:", error);
    return NextResponse.json({ error: "Failed to generate product feed" }, { status: 500 });
  }
}
