/**
 * src/lib/analytics.ts
 * دوال التتبع التسويقي الموحدة لـ Meta Pixel و Google Analytics 4
 * تعمل بأمان تام في بيئة العميل (Client-Side) دون التأثير على Server Components
 */

import type { Product, CartItem } from "@/types";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * تتبع مشاهدة منتج (ViewContent / view_item)
 */
export function trackViewContent(product: Product) {
  if (typeof window === "undefined") return;

  // Google Analytics
  if (typeof window.gtag === "function") {
    window.gtag("event", "view_item", {
      currency: "EGP",
      value: product.price,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          price: product.price,
        },
      ],
    });
  }

  // Meta Pixel
  if (typeof window.fbq === "function") {
    window.fbq("track", "ViewContent", {
      content_name: product.name,
      content_category: product.category,
      content_ids: [product.id],
      content_type: "product",
      value: product.price,
      currency: "EGP",
    });
  }
}

/**
 * تتبع إضافة إلى السلة (AddToCart / add_to_cart)
 */
export function trackAddToCart(product: Product, quantity = 1, color?: string) {
  if (typeof window === "undefined") return;

  const value = product.price * quantity;

  // Google Analytics
  if (typeof window.gtag === "function") {
    window.gtag("event", "add_to_cart", {
      currency: "EGP",
      value,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          item_variant: color || product.color,
          price: product.price,
          quantity,
        },
      ],
    });
  }

  // Meta Pixel
  if (typeof window.fbq === "function") {
    window.fbq("track", "AddToCart", {
      content_name: product.name,
      content_ids: [product.id],
      content_type: "product",
      value,
      currency: "EGP",
    });
  }
}

/**
 * تتبع بدء عملية الدفع (InitiateCheckout / begin_checkout)
 */
export function trackInitiateCheckout(items: CartItem[], total: number) {
  if (typeof window === "undefined") return;

  // Google Analytics
  if (typeof window.gtag === "function") {
    window.gtag("event", "begin_checkout", {
      currency: "EGP",
      value: total,
      items: items.map((it) => ({
        item_id: it.product.id,
        item_name: it.product.name,
        price: it.product.price,
        quantity: it.quantity,
      })),
    });
  }

  // Meta Pixel
  if (typeof window.fbq === "function") {
    window.fbq("track", "InitiateCheckout", {
      content_ids: items.map((it) => it.product.id),
      num_items: items.reduce((acc, it) => acc + it.quantity, 0),
      value: total,
      currency: "EGP",
    });
  }
}

/**
 * تتبع إتمام الشراء (Purchase / purchase)
 */
export function trackPurchase(orderId: string, total: number, items: CartItem[]) {
  if (typeof window === "undefined") return;

  // Google Analytics
  if (typeof window.gtag === "function") {
    window.gtag("event", "purchase", {
      transaction_id: orderId,
      value: total,
      currency: "EGP",
      items: items.map((it) => ({
        item_id: it.product?.id || "prod_item",
        item_name: it.product?.name || "Amazon Furniture Piece",
        price: it.product?.price || 0,
        quantity: it.quantity || 1,
      })),
    });
  }

  // Meta Pixel
  if (typeof window.fbq === "function") {
    window.fbq("track", "Purchase", {
      content_ids: items.map((it) => it.product?.id || "prod_item"),
      content_type: "product",
      value: total,
      currency: "EGP",
      num_items: items.reduce((acc, it) => acc + (it.quantity || 1), 0),
    });
  }
}

/**
 * تتبع حجز المعاينات والاستشارات (Lead)
 */
export function trackLead(consultationType = "showroom_visit", details: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  if (typeof window.gtag === "function") {
    window.gtag("event", "generate_lead", {
      lead_type: consultationType,
      ...details,
    });
  }

  if (typeof window.fbq === "function") {
    window.fbq("track", "Lead", {
      content_name: consultationType,
      ...details,
    });
  }
}
