"use client";

import Script from "next/script";
import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Read measurement IDs from environment variables
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID;
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

// Validate IDs (avoid sending requests with placeholder or invalid IDs)
const isGaValid = Boolean(GA_ID && GA_ID.startsWith("G-") && GA_ID !== "G-ECOMFURNITURE");
const isPixelValid = Boolean(PIXEL_ID && /^\d+$/.test(PIXEL_ID) && PIXEL_ID !== "987654321098765");

// ── Global TypeScript definitions for window ──
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

// ── E-commerce Tracking Helper Functions ──

export function trackPageView(url: string) {
  if (typeof window === "undefined") return;
  if (isGaValid && typeof window.gtag === "function") {
    window.gtag("config", GA_ID!, { page_path: url });
  }
  if (isPixelValid && typeof window.fbq === "function") {
    window.fbq("track", "PageView");
  }
}

export function trackViewItem(product: {
  id: string;
  name: string;
  price: number;
  category?: string;
}) {
  if (typeof window === "undefined") return;
  if (isGaValid && typeof window.gtag === "function") {
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
  if (isPixelValid && typeof window.fbq === "function") {
    window.fbq("track", "ViewContent", {
      content_name: product.name,
      content_ids: [product.id],
      content_type: "product",
      value: product.price,
      currency: "EGP",
    });
  }
}

export function trackAddToCart(product: {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  category?: string;
}) {
  if (typeof window === "undefined") return;
  const qty = product.quantity || 1;
  if (isGaValid && typeof window.gtag === "function") {
    window.gtag("event", "add_to_cart", {
      currency: "EGP",
      value: product.price * qty,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          price: product.price,
          quantity: qty,
        },
      ],
    });
  }
  if (isPixelValid && typeof window.fbq === "function") {
    window.fbq("track", "AddToCart", {
      content_name: product.name,
      content_ids: [product.id],
      content_type: "product",
      value: product.price * qty,
      currency: "EGP",
    });
  }
}

export function trackInitiateCheckout(total: number, itemsCount: number) {
  if (typeof window === "undefined") return;
  if (isGaValid && typeof window.gtag === "function") {
    window.gtag("event", "begin_checkout", {
      currency: "EGP",
      value: total,
    });
  }
  if (isPixelValid && typeof window.fbq === "function") {
    window.fbq("track", "InitiateCheckout", {
      value: total,
      currency: "EGP",
      num_items: itemsCount,
    });
  }
}

export function trackPurchase(order: {
  id: string;
  total: number;
  items?: Array<{ name: string; price: number; quantity: number }>;
}) {
  if (typeof window === "undefined") return;
  if (isGaValid && typeof window.gtag === "function") {
    window.gtag("event", "purchase", {
      transaction_id: order.id,
      value: order.total,
      currency: "EGP",
      items: (order.items || []).map((it) => ({
        item_name: it.name,
        price: it.price,
        quantity: it.quantity,
      })),
    });
  }
  if (isPixelValid && typeof window.fbq === "function") {
    window.fbq("track", "Purchase", {
      value: order.total,
      currency: "EGP",
      content_type: "product",
    });
  }
}

export function trackWhatsAppClick(source: string, itemName?: string) {
  if (typeof window === "undefined") return;
  if (isGaValid && typeof window.gtag === "function") {
    window.gtag("event", "contact", {
      method: "WhatsApp",
      event_category: "Lead",
      event_label: itemName ? `${source}: ${itemName}` : source,
    });
  }
  if (isPixelValid && typeof window.fbq === "function") {
    window.fbq("track", "Contact", {
      content_name: itemName || source,
      status: "WhatsApp Clicked",
    });
  }
}

// ── Automatic PageView Tracker Component ──
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
    trackPageView(url);
  }, [pathname, searchParams]);

  return null;
}

// ── Main Analytics Scripts Component ──
export default function Analytics() {
  return (
    <>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>

      {/* ─── 1. Google Analytics 4 (gtag.js) ─────────────── */}
      {isGaValid && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                  send_page_view: true
                });
              `,
            }}
          />
        </>
      )}

      {/* ─── 2. Meta Pixel (Facebook Pixel) ──────────────── */}
      {isPixelValid && (
        <>
          <Script
            id="meta-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${PIXEL_ID}');
                fbq('track', 'PageView');
              `,
            }}
          />
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
              alt="Meta Pixel"
            />
          </noscript>
        </>
      )}
    </>
  );
}
