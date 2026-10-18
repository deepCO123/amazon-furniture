"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import ProductGrid from "@/components/products/ProductGrid";
import { useLanguageStore } from "@/store/languageStore";

export default function ProductsPage() {
  const { language } = useLanguageStore();
  const isEn = language === "en";

  return (
    <div className="min-h-screen bg-surface transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-muted mb-4 sm:mb-5">
          <Link href="/" className="flex items-center gap-1 hover:text-accent transition-colors">
            <Home size={14} className="shrink-0" />
            <span>{isEn ? "Home" : "الرئيسية"}</span>
          </Link>
          <span className="text-gray-400 dark:text-gray-600">/</span>
          <span className="text-primary font-semibold">
            {isEn ? "Our Collection" : "معرض المنتجات"}
          </span>
        </nav>

        {/* Page Heading & Tagline */}
        <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-2 border-b border-gray-200/60 dark:border-[#2A3140] pb-4 sm:pb-5">
          <div>
            <span className="text-[11px] sm:text-xs font-bold text-[#C6A46A] uppercase tracking-wider block mb-1">
              {isEn ? "Signature Handcrafted Furniture" : "أثاث منزلي ومكتبي راقٍ بضمان 10 سنوات"}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary tracking-tight">
              {isEn ? "Our Collection" : "تشكيلة معروضاتنا الفاخرة"}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted max-w-md leading-relaxed">
            {isEn
              ? "Discover furniture crafted with master precision, premium materials, and timeless elegance."
              : "استكشف أحدث تصميمات وموديلات الأثاث المصنوعة بخشب زان روماني طبيعي 100% وأعلى معايير الجودة."}
          </p>
        </div>

        {/* Main Content (Filters + Grid) */}
        <Suspense
          fallback={
            <div className="py-24 text-center text-muted font-medium flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span>{isEn ? "Loading collection..." : "جاري تحميل المعروضات..."}</span>
            </div>
          }
        >
          <ProductGrid />
        </Suspense>
      </div>
    </div>
  );
}
