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
  { name: "عسلي / Camel", hex: "#C58B45" },
  { name: "رمادي / Charcoal", hex: "#374151" },
  { name: "بيج / Beige", hex: "#D4BFA0" },
  { name: "أصفر / Mustard", hex: "#EAB308" },
  { name: "أبيض / White", hex: "#F3F4F6" },
  { name: "أسود / Black", hex: "#111827" },
];

// All categories ordered logically
const ORDERED_CATEGORIES = [
  "كوفي كورنر",
  "كراسي شبك",
  "كراسي طبية",
  "ترابيزة تليفزيون",
  "ترابيزات",
  "ستائر مكتبية",
  "مكاتب",
  "انتريهات",
  "كراسي جلد",
  "ليزي بوي",
  "ركن",
  "سراير",
  "دولاب",
  "جزامات",
  "تسريحه",
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
  const [userMaxPrice, setUserMaxPrice] = useState<number | null>(null);

  // Dynamically extract categories & counts from actual products
  const { categories, absoluteMaxPrice } = useMemo(() => {
    const counts: Record<string, number> = {};
    let highest = 10000;

    products.forEach((p) => {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
      if (p.price && p.price > highest) {
        highest = p.price;
      }
    });

    // Sort categories according to the 7 defined categories first
    const cats = Object.keys(counts).sort((a, b) => {
      const idxA = ORDERED_CATEGORIES.indexOf(a);
      const idxB = ORDERED_CATEGORIES.indexOf(b);
      return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
    });

    return {
      categories: cats,
      categoryCounts: counts,
      absoluteMaxPrice: Math.ceil(highest / 500) * 500,
    };
  }, [products]);

  const currentMaxPrice = userMaxPrice ?? (absoluteMaxPrice || 50000);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter - strict match or mapping
        if (filters.category.length > 0) {
          const matchesCategory = filters.category.some((cat) => {
            if (!cat) return false;
            return p.category === cat;
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
        if (p.price > currentMaxPrice) {
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
  }, [products, filters, urlTag, currentMaxPrice]);

  const activeFiltersCount =
    filters.category.length +
    filters.color.length +
    (filters.search ? 1 : 0) +
    (urlTag === "sale" ? 1 : 0) +
    (userMaxPrice !== null && userMaxPrice < absoluteMaxPrice ? 1 : 0);

  const handleClearFilters = () => {
    setFilters({
      category: [],
      material: [],
      color: [],
      priceRange: [0, 500000],
      search: "",
      sort: "newest",
    });
    setUserMaxPrice(null);
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
            <Search size={14} className="text-[#C58B45]" />
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
            <Layers size={14} className="text-[#C58B45]" />
            <span>{isEn ? "Categories" : "الأقسام والتصنيفات"}</span>
          </h3>
          {filters.category.length > 0 && (
            <span className="text-[10px] font-bold bg-[#C58B45] text-white px-1.5 py-0.5 rounded-full">
              {filters.category.length}
            </span>
          )}
        </div>

        <div className="space-y-1.5 max-h-[380px] overflow-y-auto pe-1">
          {categories.map((cat) => {
            const isChecked = filters.category.includes(cat);
            return (
              <label
                key={cat}
                onClick={(e) => {
                  e.preventDefault();
                  toggleCategory(cat);
                }}
                className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition-all cursor-pointer select-none border ${
                  isChecked
                    ? "bg-[#C58B45]/15 border-[#C58B45] text-[#8C692D] dark:text-[#E8D4B0] font-black shadow-xs"
                    : "border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#151922] text-gray-900 dark:text-white font-bold"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    readOnly
                    className="w-4 h-4 rounded text-[#C58B45] focus:ring-[#C58B45] border-gray-300 accent-[#C58B45] cursor-pointer"
                    aria-label={cat}
                  />
                  <span className="text-[13px] sm:text-sm font-extrabold tracking-wide truncate">
                    {cat}
                  </span>
                </div>
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
            <DollarSign size={14} className="text-[#C58B45]" />
            <span>{isEn ? "Max Price" : "الحد الأقصى للسعر"}</span>
          </label>
          <span className="text-xs font-black text-primary" suppressHydrationWarning>
            {formatPrice(currentMaxPrice)}
          </span>
        </div>
        <input
          type="range"
          min={1000}
          max={absoluteMaxPrice || 50000}
          step={500}
          value={currentMaxPrice}
          onChange={(e) => setUserMaxPrice(Number(e.target.value))}
          className="w-full accent-[#C58B45] cursor-pointer h-1.5 bg-gray-200 dark:bg-[#303747] rounded-lg"
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
          <Palette size={14} className="text-[#C58B45]" />
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
                    ? "scale-110 ring-2 ring-[#C58B45] ring-offset-2 dark:ring-offset-[#1A1F29]"
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
            className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#C58B45] text-[#C58B45] hover:bg-[#C58B45]/10 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
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
          <SlidersHorizontal size={16} className="text-[#C58B45]" />
          <span>{isEn ? "Filter & Refine" : "تصفية وفلاتر المعروضات"}</span>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 bg-[#C58B45] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
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
              <span className="text-[11px] font-bold text-[#C58B45] bg-[#C58B45]/10 px-2 py-0.5 rounded-full">
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
                  <SlidersHorizontal size={18} className="text-[#C58B45]" />
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
                  className="w-full h-12 bg-black dark:bg-[#C58B45] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
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
        {/* ── SofaZone Catalog Results Toolbar (Image 4 & 5 Style) ─────────────── */}
        <div className="bg-white border border-gray-200/90 rounded-2xl px-4 sm:px-6 py-3 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          
          {/* Right (in RTL): Mobile Filter Button */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-1.5 text-xs font-black text-white bg-[#6B4F3A] hover:bg-[#573E2D] px-3.5 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <SlidersHorizontal size={14} />
              <span>تصفية وفلاتر المعروضات</span>
            </button>
          </div>

          {/* Center & Left: Sort & View Mode Switcher */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 hidden md:inline">ترتيب حسب:</span>
              <select
                value={filters.sort}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sort: e.target.value as SortOption,
                  }))
                }
                className="h-9 px-3 border border-gray-200 rounded-xl text-xs sm:text-sm bg-white text-gray-800 font-bold focus:border-[#D97706] outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Grid / List Switcher */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200/80">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white text-[#D97706] shadow-xs font-black"
                    : "text-gray-400 hover:text-black"
                }`}
                title="عرض شبكي (كروت)"
                aria-label="Grid View"
              >
                <Grid3X3 size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white text-[#D97706] shadow-xs font-black"
                    : "text-gray-400 hover:text-black"
                }`}
                title="عرض تفصيلي"
                aria-label="List View"
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid / List Display */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-[#1A1F29] border border-gray-200/80 dark:border-[#2A3140] rounded-2xl p-12 text-center my-6">
            <div className="w-16 h-16 bg-[#C58B45]/10 text-[#C58B45] rounded-full flex items-center justify-center mx-auto mb-4">
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
              className="px-6 py-2.5 bg-[#C58B45] hover:bg-[#B3935B] text-white font-bold rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
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
