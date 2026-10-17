import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { useLanguageStore, LANGUAGES, type Language } from "@/store/languageStore";

export function formatPrice(price: number | undefined | null, overrideLang?: Language): string {
  if (price === undefined || price === null || isNaN(Number(price))) {
    return "0 ج.م";
  }
  const numPrice = Number(price);

  let currentLang: Language = overrideLang || "ar";
  if (!overrideLang && typeof window !== "undefined") {
    // Inside admin panel, always format in exact Egyptian Pounds (EGP)
    if (window.location.pathname.startsWith("/admin")) {
      currentLang = "ar";
    } else {
      try {
        currentLang = useLanguageStore.getState().language || "ar";
      } catch {
        currentLang = "ar";
      }
    }
  }

  const info = LANGUAGES[currentLang] || LANGUAGES.ar;
  const converted = Math.round(numPrice * (info.rate || 1.0));

  if (info.code === "en") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(converted);
  }

  // Format with clean comma-separated numerals for maximum clarity
  const formattedNumber = new Intl.NumberFormat("en-US").format(converted);
  return `${formattedNumber} ${info.currencySymbol}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function truncate(text: string, length: number): string {
  return text.length > length ? text.slice(0, length) + "..." : text;
}

export function getDiscount(originalPrice: number, price: number): number {
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export function generateStars(rating: number): ("full" | "half" | "empty")[] {
  const stars: ("full" | "half" | "empty")[] = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) stars.push("full");
    else if (i - rating < 1) stars.push("half");
    else stars.push("empty");
  }
  return stars;
}

export function getProductUrl(slug: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/products/${slug}`;
  }
  return `http://localhost:3000/products/${slug}`;
}
