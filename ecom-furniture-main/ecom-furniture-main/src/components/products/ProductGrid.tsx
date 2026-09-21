"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { SlidersHorizontal, X, Grid3X3, List } from "lucide-react";
import type { FilterState, SortOption } from "@/types";
import { SORT_OPTIONS } from "@/lib/constants";
import { useProductStore } from "@/store/productStore";
import ProductCard from "./ProductCard";
import { useLanguageStore } from "@/store/languageStore";
import { cn } from "@/lib/utils";

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

  // Dynamically extract categories & materials from actual registered products in Admin/Store
  const categories = useMemo(() => {
    return [...new Set(products.map((p) => p.category).filter(Boolean))];
  }, [products]);

  const filteredProducts = products
    .filter((p) => {
      if (
        filters.category.length > 0 &&
        !filters.category.includes(p.category)
      )
        return false;
      if (
        filters.search &&
        !p.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !p.description.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      if (
        urlTag === "sale" &&
        !p.originalPrice &&
        !p.tags?.includes("sale") &&
        !p.tags?.includes("عروض")
      )
        return false;
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

  const handleClearFilters = () => {
    setFilters({
      category: [],
      material: [],
      color: [],
      priceRange: [0, 500000],
      search: "",
      sort: "newest",
    });
  };

  const toggleFilter = (
    key: "category" | "material" | "color",
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Filter Toggle (Mobile) */}
      <div className="lg:hidden flex items-center gap-3 w-full">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-surface-dark rounded-xl text-xs font-bold text-primary shadow-xs hover:border-accent transition-colors"
        >
          <SlidersHorizontal size={15} className="text-[#8B6E45]" />
          <span>{isEn ? "Filter & Sort" : "تصفية وفرز المنتجات"}</span>
          {filters.category.length > 0 && (
            <span className="w-5 h-5 bg-[#8B6E45] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {filters.category.length}
            </span>
          )}
        </button>
      </div>

      {/* Filters Sidebar */}
      <div
        className={cn(
          "lg:w-64 shrink-0",
          showFilters
            ? "fixed inset-0 z-50 bg-white p-6 overflow-y-auto lg:static lg:bg-transparent lg:p-0"
            : "hidden lg:block"
        )}
      >
        {showFilters && (
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-surface-dark lg:hidden">
            <h2 className="text-base font-bold text-primary">
              {isEn ? "Filter Products" : "تصفية واختيار المعروضات"}
            </h2>
            <button
              onClick={() => setShowFilters(false)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="space-y-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-bold text-primary mb-2">
              {isEn ? "Search" : "بحث في المنتجات"}
            </label>
            <input
              type="text"
              placeholder={isEn ? "Search products or materials..." : "ابحث بالاسم، الخامة، أو القسم..."}
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="w-full px-3 py-2 border border-surface-dark rounded-lg text-sm focus:border-accent focus:ring-1 focus:ring-accent/20"
            />
          </div>

          {/* Category */}
          <div>
            <h3 className="text-sm font-bold text-primary mb-3">
              {isEn ? "Category" : "الأقسام والمعروضات"}
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pe-1">
              {categories.map((cat) => (
                <label
                  key={cat}
                  className="flex items-center gap-2 cursor-pointer hover:text-accent transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.category.includes(cat)}
                    onChange={() => toggleFilter("category", cat)}
                    className="w-4 h-4 rounded border-surface-dark text-accent focus:ring-accent/20 accent-[#C5A880]"
                  />
                  <span className="text-sm text-primary/80">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {(filters.category.length > 0 ||
            filters.search !== "" ||
            urlTag === "sale") && (
            <button
              onClick={handleClearFilters}
              className="text-xs sm:text-sm font-semibold text-accent hover:text-accent-dark transition-colors block w-full text-center py-1"
            >
              {isEn ? "Clear all filters" : "مسح جميع الفلاتر"}
            </button>
          )}

          {/* Apply Filters (Mobile only) */}
          <div className="pt-4 lg:hidden sticky bottom-0 bg-white pb-2">
            <button
              onClick={() => setShowFilters(false)}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              {isEn ? `Show ${filteredProducts.length} Results` : `عرض النتائج (${filteredProducts.length} منتج)`}
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1">
        {/* Sort & View */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted">
            {isEn
              ? `${filteredProducts.length} product${filteredProducts.length !== 1 ? "s" : ""} found`
              : `تم العثور على ${filteredProducts.length} منتج`}
          </p>
          <div className="flex items-center gap-4">
            <select
              value={filters.sort}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sort: e.target.value as SortOption,
                }))
              }
              className="px-3 py-2 border border-surface-dark rounded-lg text-sm bg-white focus:border-accent"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="hidden sm:flex items-center gap-1 border border-surface-dark rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded",
                  viewMode === "grid" ? "bg-surface" : ""
                )}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded",
                  viewMode === "list" ? "bg-surface" : ""
                )}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Products */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted">
              {isEn ? "No products match your filters" : "لا توجد منتجات تطابق اختيارات الفلترة المحددة"}
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-4 text-accent hover:text-accent-dark transition-colors font-semibold"
            >
              {isEn ? "Clear filters" : "مسح جميع الفلاتر وعرض المعروضات"}
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                : "flex flex-col gap-4"
            )}
          >
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ProductCard product={product} viewMode={viewMode} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
