"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal,
  X,
  Grid3X3,
  List,
  Search,
  RotateCcw,
  Tag,
  Palette,
  DollarSign,
  Layers,
} from "lucide-react";
import type { FilterState, SortOption } from "@/types";
import { SORT_OPTIONS } from "@/lib/constants";
import { useProductStore } from "@/store/productStore";
import ProductCard from "./ProductCard";
import { useLanguageStore } from "@/store/languageStore";
import { formatPrice } from "@/lib/utils";

// Curated colors inspired by reference design
const COLOR_OPTIONS = [
  { name: "أخضر / Green", hex: "#1B4D3E" },
  { name: "كحلي / Navy", hex: "#1E2A4A" },
  { name: "عسلي / Camel", hex: "#C6A46A" },
  { name: "رمادي / Charcoal", hex: "#374151" },
  { name: "بيج / Beige", hex: "#D4BFA0" },
  { name: "أصفر / Mustard", hex: "#EAB308" },
  { name: "أبيض / White", hex: "#F3F4F6" },
  { name: "أسود / Black", hex: "#111827" },
];

export default function ProductGrid() {
  const { products, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const { language } = useLanguageStore();
  const isEn = language === "en";

  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category");
  const urlSearch = searchParams.get("search");
  const urlTag = searchParams.get("tag");

  const [filters, setFilters] = useState<FilterState>(() => ({
    category: urlCategory ? [urlCategory] : [],
    material: [],
    color: [],
    priceRange: [0, 500000],
    search: urlSearch || "",
    sort: "newest",
  }));

  const [prevUrlCat, setPrevUrlCat] = useState(urlCategory);
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);

  if (urlCategory !== prevUrlCat || urlSearch !== prevUrlSearch) {
    setPrevUrlCat(urlCategory);
    setPrevUrlSearch(urlSearch);
    setFilters((prev) => ({
      ...prev,
      category: urlCategory ? [urlCategory] : [],
      search: urlSearch || "",
    }));
  }

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(50000);

  // Dynamically extract categories & counts from actual products
  const { categories, categoryCounts, absoluteMaxPrice } = useMemo(() => {
    const cats: string[] = [];
    const counts: Record<string, number> = {};
    let highest = 10000;

    products.forEach((p) => {
      if (p.category) {
        if (!counts[p.category]) cats.push(p.category);
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
      if (p.price && p.price > highest) {
        highest = p.price;
      }
    });

    return {
      categories: cats,
      categoryCounts: counts,
      absoluteMaxPrice: Math.ceil(highest / 500) * 500,
    };
  }, [products]);

  // Synchronize max price filter default once products are loaded
  useEffect(() => {
    if (absoluteMaxPrice > 10000 && maxPriceFilter === 50000) {
      setMaxPriceFilter(absoluteMaxPrice);
    }
  }, [absoluteMaxPrice, maxPriceFilter]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (filters.category.length > 0) {
          const matchesCategory = filters.category.some((cat) => {
            if (!cat) return false;
            if (p.category === cat) return true;
            const cLower = cat.toLowerCase();
            const pLower = (p.category || "").toLowerCase();
            if (pLower.includes(cLower) || cLower.includes(pLower)) return true;
            if (
              (cLower.includes("نوم") || cLower.includes("سرير")) &&
              (pLower.includes("نوم") || p.name.includes("نوم") || p.name.includes("سرير"))
            )
              return true;
            if (cLower.includes("مطبخ") && pLower.includes("مطبخ")) return true;
            if (cLower.includes("دريسنج") && pLower.includes("دريسنج")) return true;
            if (
              cLower.includes("كراسي") &&
              (pLower.includes("كراسي") || pLower.includes("كرسي"))
            )
              return true;
            return false;
          });
          if (!matchesCategory) return false;
        }

        // Search query
        if (
          filters.search &&
          !p.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !p.description.toLowerCase().includes(filters.search.toLowerCase()) &&
          !(p.category || "").toLowerCase().includes(filters.search.toLowerCase())
        ) {
          return false;
        }

        // Sale / Promo tag
        if (
          urlTag === "sale" &&
          !p.originalPrice &&
          !p.tags?.includes("sale") &&
          !p.tags?.includes("عروض")
        ) {
          return false;
        }

        // Color filter
        if (filters.color.length > 0) {
          const pText = `${p.name} ${p.description} ${p.tags?.join(" ")}`.toLowerCase();
          const matchesColor = filters.color.some((c) => {
            const cWords = c.toLowerCase().split(/[\s/]+/);
            return cWords.some((word) => word.length > 2 && pText.includes(word));
          });
          if (!matchesColor) return false;
        }

        // Price filter
        if (p.price > maxPriceFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sort) {
          case "price-asc":
            return a.price - b.price;
          case "price-desc":
            return b.price - a.price;
          case "rating":
            return b.rating - a.rating;
          default:
            return 0;
        }
      });
  }, [products, filters, urlTag, maxPriceFilter]);

  const activeFiltersCount =
    filters.category.length +
    filters.color.length +
    (filters.search ? 1 : 0) +
    (urlTag === "sale" ? 1 : 0) +
    (maxPriceFilter < absoluteMaxPrice ? 1 : 0);

  const handleClearFilters = () => {
    setFilters({
      category: [],
      material: [],
      color: [],
      priceRange: [0, 500000],
      search: "",
      sort: "newest",
    });
    setMaxPriceFilter(absoluteMaxPrice);
  };

  const toggleCategory = (cat: string) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category.includes(cat)
        ? prev.category.filter((v) => v !== cat)
        : [...prev.category, cat],
    }));
  };

  const toggleColor = (colorName: string) => {
    setFilters((prev) => ({
      ...prev,
      color: prev.color.includes(colorName)
        ? prev.color.filter((c) => c !== colorName)
        : [...prev.color, colorName],
    }));
  };

  // Reusable Sidebar content component
  const renderSidebarFilters = () => (
    <div className="space-y-6">
      {/* 1. Search Filter */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-muted mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Search size={14} className="text-[#C6A46A]" />
            <span>{isEn ? "Search Products" : "بحث في المعروضات"}</span>
          </span>
          {filters.search && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
              className="text-[11px] text-accent hover:underline lowercase font-mono"
            >
              {isEn ? "clear" : "إلغاء"}
            </button>
          )}
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder={
              isEn
                ? "Search by name or style..."
                : "ابحث بالاسم، الموديل، أو الخامة..."
            }
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            className="w-full h-11 px-3.5 pe-9 border border-gray-200 dark:border-[#303747] rounded-xl text-xs sm:text-sm bg-white dark:bg-[#191E27] text-primary placeholder:text-gray-400 dark:placeholder:text-[#A7B0C0] outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
          />
          <Search
            size={16}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
          />
        </div>
      </div>

      <div className="h-px bg-gray-200/70 dark:bg-[#2A3140]" />

      {/* 2. Categories Filter */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <Layers size={14} className="text-[#C6A46A]" />
            <span>{isEn ? "Categories" : "الأقسام والتصنيفات"}</span>
          </h3>
          {filters.category.length > 0 && (
            <span className="text-[10px] font-bold bg-[#C6A46A] text-white px-1.5 py-0.5 rounded-full">
              {filters.category.length}
            </span>
          )}
        </div>

        <div className="space-y-1 max-h-[340px] overflow-y-auto pe-1">
          {categories.map((cat) => {
            const isChecked = filters.category.includes(cat);
            const count = categoryCounts[cat] || 0;
            return (
              <label
                key={cat}
                onClick={(e) => {
                  e.preventDefault();
                  toggleCategory(cat);
                }}
                className={`flex items-center justify-between py-2 px-2.5 rounded-xl transition-all cursor-pointer select-none group ${
                  isChecked
                    ? "bg-[#C6A46A]/15 dark:bg-[#C6A46A]/20 text-[#9E7D48] dark:text-[#DFC79C] font-bold"
                    : "hover:bg-gray-100/70 dark:hover:bg-[#151922] text-gray-800 dark:text-[#F5F6F8]"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    readOnly
                    className="filter-checkbox"
                    aria-label={cat}
                  />
                  <span className="text-xs sm:text-sm truncate">
                    {cat}
                  </span>
                </div>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-full shrink-0 ${
                    isChecked
                      ? "bg-[#C6A46A] text-white"
                      : "bg-gray-100 dark:bg-[#151922] text-gray-500 dark:text-[#A7B0C0]"
                  }`}
                >
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-gray-200/70 dark:bg-[#2A3140]" />

      {/* 3. Price Filter (Slider & Indicator) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <DollarSign size={14} className="text-[#C6A46A]" />
            <span>{isEn ? "Max Price" : "الحد الأقصى للسعر"}</span>
          </label>
          <span className="text-xs font-black text-primary" suppressHydrationWarning>
            {formatPrice(maxPriceFilter)}
          </span>
        </div>
        <input
          type="range"
          min={1000}
          max={absoluteMaxPrice || 50000}
          step={500}
          value={maxPriceFilter}
          onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
          className="w-full accent-[#C6A46A] cursor-pointer h-1.5 bg-gray-200 dark:bg-[#303747] rounded-lg"
        />
        <div className="flex items-center justify-between text-[11px] text-muted mt-1.5 font-mono">
          <span>{formatPrice(1000)}</span>
          <span>{formatPrice(absoluteMaxPrice || 50000)}</span>
        </div>
      </div>

      <div className="h-px bg-gray-200/70 dark:bg-[#2A3140]" />

      {/* 4. Color Swatches (Reference inspired) */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
          <Palette size={14} className="text-[#C6A46A]" />
          <span>{isEn ? "Color Theme" : "اللون والخامة"}</span>
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {COLOR_OPTIONS.map((col) => {
            const isSelected = filters.color.includes(col.name);
            return (
              <button
                key={col.hex}
                type="button"
                onClick={() => toggleColor(col.name)}
                title={col.name}
                className={`w-7 h-7 rounded-full transition-transform relative flex items-center justify-center cursor-pointer border ${
                  isSelected
                    ? "scale-110 ring-2 ring-[#C6A46A] ring-offset-2 dark:ring-offset-[#1A1F29]"
                    : "hover:scale-105 border-gray-300 dark:border-gray-600"
                }`}
                style={{ backgroundColor: col.hex }}
              >
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-white shadow-xs" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Clear All Filters Action */}
      {activeFiltersCount > 0 && (
        <div className="pt-2">
          <button
            onClick={handleClearFilters}
            className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#C6A46A] text-[#C6A46A] hover:bg-[#C6A46A]/10 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>
              {isEn
                ? `Clear All Filters (${activeFiltersCount})`
                : `مسح جميع الفلاتر (${activeFiltersCount})`}
            </span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
      {/* ── Mobile Filter Trigger Button ──────────────────────────────── */}
      <div className="lg:hidden flex items-center gap-3 w-full">
        <button
          onClick={() => setShowFilters(true)}
          className="flex-1 flex items-center justify-center gap-2.5 px-4 h-11 bg-white dark:bg-[#1A1F29] border border-gray-200 dark:border-[#2A3140] rounded-xl text-xs sm:text-sm font-bold text-primary shadow-xs hover:border-accent transition-colors cursor-pointer"
        >
          <SlidersHorizontal size={16} className="text-[#C6A46A]" />
          <span>{isEn ? "Filter & Refine" : "تصفية وفلاتر المعروضات"}</span>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 bg-[#C6A46A] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Desktop Filter Sidebar ───────────────────────────────────── */}
      <aside className="hidden lg:block w-72 shrink-0 sticky top-24">
        <div className="bg-white dark:bg-[#1A1F29] border border-gray-200/80 dark:border-[#2A3140] rounded-2xl p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 dark:border-[#2A3140]">
            <h2 className="text-sm font-black text-primary tracking-wide uppercase">
              {isEn ? "Filter Collection" : "تصفية المعروضات"}
            </h2>
            {activeFiltersCount > 0 && (
              <span className="text-[11px] font-bold text-[#C6A46A] bg-[#C6A46A]/10 px-2 py-0.5 rounded-full">
                {activeFiltersCount} {isEn ? "active" : "محدد"}
              </span>
            )}
          </div>
          {renderSidebarFilters()}
        </div>
      </aside>

      {/* ── Mobile Filter Modal Drawer ───────────────────────────────── */}
      <AnimatePresence>
        {showFilters && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Slide Drawer */}
            <motion.div
              initial={{ x: isEn ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: isEn ? "-100%" : "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="relative w-full max-w-xs sm:max-w-sm bg-white dark:bg-[#1A1F29] h-full shadow-2xl flex flex-col z-10 ms-auto overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2A3140]">
                <h3 className="text-base font-bold text-primary flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-[#C6A46A]" />
                  <span>{isEn ? "Filter Collection" : "تصفية المنتجات"}</span>
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#151922] text-gray-500 dark:text-[#A7B0C0] flex items-center justify-center hover:text-primary cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-4">
                {renderSidebarFilters()}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-[#2A3140] bg-gray-50/50 dark:bg-[#151922]/50">
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full h-12 bg-black dark:bg-[#C6A46A] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>
                    {isEn
                      ? `Show ${filteredProducts.length} Results`
                      : `عرض النتائج (${filteredProducts.length} قطعة)`}
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Product Results Area ─────────────────────────────────────── */}
      <main className="flex-1 min-w-0 w-full">
        {/* Results Toolbar */}
        <div className="bg-white dark:bg-[#1A1F29] border border-gray-200/80 dark:border-[#2A3140] rounded-2xl px-4 py-3 mb-6 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 transition-colors">
          {/* Result Count */}
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-[#C6A46A] shrink-0" />
            <p className="text-xs sm:text-sm font-semibold text-primary">
              {isEn ? (
                <>
                  Found{" "}
                  <span className="font-black text-[#C6A46A]">
                    {filteredProducts.length}
                  </span>{" "}
                  curated items
                </>
              ) : (
                <>
                  تم العثور على{" "}
                  <span className="font-black text-[#C6A46A]">
                    {filteredProducts.length}
                  </span>{" "}
                  قطعة أثاث مميزة
                </>
              )}
            </p>
          </div>

          {/* Sort & View Mode */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            {/* Sorting Dropdown */}
            <div className="relative min-w-[170px] sm:min-w-[190px]">
              <select
                value={filters.sort}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sort: e.target.value as SortOption,
                  }))
                }
                className="w-full h-10 px-3 border border-gray-200 dark:border-[#303747] rounded-xl text-xs sm:text-sm bg-white dark:bg-[#191E27] text-primary font-medium focus:border-accent outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Grid / List Switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-gray-100 dark:bg-[#151922] p-1 rounded-xl border border-gray-200/60 dark:border-[#2A3140]">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-[#1A1F29] text-[#C6A46A] shadow-xs"
                    : "text-gray-400 hover:text-primary"
                }`}
                title="Grid View"
                aria-label="Grid View"
              >
                <Grid3X3 size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white dark:bg-[#1A1F29] text-[#C6A46A] shadow-xs"
                    : "text-gray-400 hover:text-primary"
                }`}
                title="List View"
                aria-label="List View"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid / List Display */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-[#1A1F29] border border-gray-200/80 dark:border-[#2A3140] rounded-2xl p-12 text-center my-6">
            <div className="w-16 h-16 bg-[#C6A46A]/10 text-[#C6A46A] rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={28} />
            </div>
            <h3 className="text-lg font-bold text-primary mb-2">
              {isEn ? "No products match your filters" : "لا توجد معروضات تطابق الفلترة المحددة"}
            </h3>
            <p className="text-sm text-muted max-w-sm mx-auto mb-6">
              {isEn
                ? "Try relaxing your category, search term or price constraints to discover more pieces."
                : "جرب تعديل كلمات البحث، أو زيادة ميزانية السعر، أو اختيار أقسام أخرى."}
            </p>
            <button
              onClick={handleClearFilters}
              className="px-6 py-2.5 bg-[#C6A46A] hover:bg-[#B3935B] text-white font-bold rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
            >
              {isEn ? "Reset All Filters" : "إلغاء جميع الفلاتر وعرض المعروضات"}
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6"
                : "flex flex-col gap-4"
            }
          >
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
              >
                <ProductCard product={product} viewMode={viewMode} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
