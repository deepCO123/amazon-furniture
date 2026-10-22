"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingBag, MessageCircle, ArrowLeft } from "lucide-react";
import { useProductStore } from "@/store/productStore";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, getProductUrl } from "@/lib/utils";
import type { Product } from "@/types";
import { useToastStore } from "@/components/ui/Toast";

export default function SofaZoneTealShowcase() {
  const router = useRouter();
  const tabs = [
    "كراسي شبك",
    "كراسي طبية",
    "مكاتب",
    "انتريهات",
    "ترابيزة تليفزيون",
    "ستائر مكتبية",
    "كراسي جلد",
  ];

  const [activeTab, setActiveTab] = useState("كراسي طبية");
  const products = useProductStore((s) => s.products);
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useToastStore((s) => s.addToast);

  // Filter products by tab
  const tabProducts = products
    .filter((p) => p.category === activeTab || p.name.includes(activeTab))
    .slice(0, 6);

  const displayProducts = tabProducts.length > 0 ? tabProducts : products.slice(0, 6);

  const handleQuickWhatsApp = (p: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const text = `مرحباً، أود الاستفسار والطلب لهذا الموديل من قسم ${activeTab}:
*المنتج:* ${p.name}
*السعر:* ${formatPrice(p.price)}
*الرابط:* ${getProductUrl(p.slug)}
شكراً لك!`;
    window.open(`https://wa.me/201091084863?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-[#6B4F3A] dark:bg-[#121620] dark:border dark:border-[#232B3C] text-white rounded-3xl py-12 px-4 sm:px-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* ── Section Title with Iconic Oval Badge (Image 4 Style) ──────── */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-block relative px-10 py-2.5">
            {/* The signature gold elliptical ring */}
            <div className="absolute inset-0 border-[2.5px] border-[#C58B45] rounded-[50%] transform -rotate-1 pointer-events-none scale-105" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight relative z-10">
              تسوق حسب القسم
            </h2>
          </div>
        </div>

        {/* ── Sub-Category Tabs with Gold Underline ────────────────────── */}
        <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto pb-3 mb-8 justify-start md:justify-center border-b border-white/15 no-scrollbar relative z-10">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap pb-2 text-sm sm:text-base font-black transition-all relative cursor-pointer ${
                  isActive
                    ? "text-white border-b-2 border-[#C58B45] scale-105"
                    : "text-[#E8D8C3] hover:text-white"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* ── Product Cards Grid (Image 4 Style) ───────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-5 relative z-10">
          {displayProducts.map((p) => {
            const savings = p.originalPrice && p.originalPrice > p.price
              ? p.originalPrice - p.price
              : 650;
            const savingsText = `وفر ${savings.toLocaleString("ar-EG")} جنيه`;

            return (
              <div
                key={p.id}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest("button") || target.closest("a")) return;
                  router.push(`/products/${p.slug}`);
                }}
                className="bg-white dark:bg-[#1A2230] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col group text-[#292321] dark:text-[#F5F6F8] border border-[#E8E0D5] dark:border-[#2D3748] cursor-pointer"
              >
                {/* Image & Discount Badge */}
                <div className="relative aspect-square bg-[#F8F5F0] dark:bg-[#131720] overflow-hidden cursor-pointer">
                  <span className="absolute top-2 right-2 z-10 bg-[#B93832] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
                    {savingsText}
                  </span>

                  <Image
                    src={p.images[0] || "/placeholder.jpg"}
                    alt={p.name}
                    fill
                    className="object-cover group-hover:scale-106 transition-transform duration-300"
                    sizes="200px"
                  />
                </div>

                {/* Info */}
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <Link
                      href={`/products/${p.slug}`}
                      className="block font-bold text-xs sm:text-sm text-[#292321] dark:text-[#F5F6F8] group-hover:text-[#C58B45] transition-colors line-clamp-2 leading-snug mb-1.5"
                    >
                      {p.name}
                    </Link>

                    {/* Price */}
                    <div className="mb-2">
                      <div className="text-sm sm:text-base font-black text-[#B93832] dark:text-[#F87171]">
                        {formatPrice(p.price)}
                      </div>
                      {p.originalPrice && (
                        <div className="text-[11px] text-[#74685E] dark:text-[#8D98AA] line-through font-bold">
                          {formatPrice(p.originalPrice)}
                        </div>
                      )}
                    </div>

                    {/* Color Swatches Thumbnails */}
                    <div className="flex items-center gap-1 mb-2.5">
                      <span className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-gray-600 bg-[#C8B29B]" />
                      <span className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-gray-600 bg-[#374151]" />
                      <span className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-gray-600 bg-[#111827]" />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-[#E8E0D5] dark:border-[#2D3748] flex items-center justify-between gap-1.5">
                    <button
                      onClick={(e) => handleQuickWhatsApp(p, e)}
                      className="flex-1 py-1.5 px-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-black rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <MessageCircle size={13} />
                      <span>واتساب</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addItem(p, 1);
                        addToast("تمت الإضافة للسلة! 🛒", "success");
                      }}
                      className="p-1.5 rounded-lg bg-[#6B4F3A] hover:bg-[#573E2D] dark:bg-[#C58B45] dark:hover:bg-[#B37A38] text-white transition-colors cursor-pointer"
                      title="إضافة للسلة"
                    >
                      <ShoppingBag size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All in Category Link */}
        <div className="text-center mt-8 relative z-10">
          <Link
            href={`/products?category=${encodeURIComponent(activeTab)}`}
            className="inline-flex items-center gap-2 bg-[#C58B45] text-white hover:bg-[#b07837] font-black text-sm px-7 py-3 rounded-xl transition-all shadow-lg hover:scale-105"
          >
            <span>استكشف جميع منتجات قسم {activeTab}</span>
            <ArrowLeft size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
