"use client";

import { Suspense } from "react";
import Link from "next/link";
import ProductGrid from "@/components/products/ProductGrid";
import { useLanguageStore } from "@/store/languageStore";

export default function ProductsPage() {
  const { language } = useLanguageStore();
  const isEn = language === "en";

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-1.5 text-sm text-muted mb-6">
          <Link href="/" className="hover:text-primary transition-colors">
            {isEn ? "Home" : "الرئيسية"}
          </Link>
          <span>/</span>
          <span className="text-primary font-medium">
            {isEn ? "Shop" : "المتجر"}
          </span>
        </nav>
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-primary">
            {isEn ? "Our Collection" : "تشكيلة معروضاتنا الفاخرة"}
          </h1>
          <p className="text-muted mt-2 text-sm sm:text-base">
            {isEn
              ? "Discover furniture crafted with care and designed for living"
              : "استكشف أحدث تصميمات وموديلات الأثاث المنزلي المصنوعة بعناية ودقة وفخامة"}
          </p>
        </div>
        <Suspense
          fallback={
            <div className="py-20 text-center text-muted font-medium">
              {isEn ? "Loading collection..." : "جاري تحميل المعروضات..."}
            </div>
          }
        >
          <ProductGrid />
        </Suspense>
      </div>
    </div>
  );
}
