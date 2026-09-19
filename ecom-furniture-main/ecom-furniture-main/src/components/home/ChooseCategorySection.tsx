"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, MessageCircle, Heart, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useProductStore } from "@/store/productStore";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { formatPrice, getProductUrl } from "@/lib/utils";
import type { Product } from "@/types";
import { useToastStore } from "@/components/ui/Toast";

const categoryTabs = [
  "غرفة نوم كاملة",
  "ركنة مودرن",
  "سرير مودرن",
  "مطبخ كامل",
  "دريسنج",
  "ترابيزة تليفزيون",
  "ستائر",
  "اضاءة",
  "بين باج",
  "ليزي بوي",
];

export default function ChooseCategorySection() {
  const [activeTab, setActiveTab] = useState("غرفة نوم كاملة");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const products = useProductStore((s) => s.products);
  const addItem = useCartStore((s) => s.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const addToast = useToastStore((s) => s.addToast);

  // Filter products for active tab
  const filteredProducts = products.filter((p) => {
    if (activeTab === "غرفة نوم كاملة") {
      return p.category === "غرفة نوم كاملة" || p.tags.includes("غرفة نوم كاملة");
    }
    if (activeTab === "ركنة مودرن") {
      return p.category === "ركن ومجالس" || p.tags.includes("كنبة") || p.tags.includes("ركن ومجالس");
    }
    if (activeTab === "سرير مودرن") {
      return p.category === "سرير مودرن" || p.name.includes("سرير");
    }
    if (activeTab === "مطبخ كامل") {
      return p.category === "مطبخ كامل";
    }
    if (activeTab === "دريسنج") {
      return p.category === "دريسنج";
    }
    if (activeTab === "ترابيزة تليفزيون") {
      return p.category === "ترابيزة تليفزيون";
    }
    if (activeTab === "ستائر") {
      return p.category === "ستائر مكتبية" || p.category === "ستائر";
    }
    if (activeTab === "اضاءة") {
      return p.category === "اضاءة";
    }
    if (activeTab === "بين باج") {
      return p.category === "بين باج";
    }
    if (activeTab === "ليزي بوي") {
      return p.category === "ليزي بوي";
    }
    return p.category.toLowerCase().includes(activeTab.toLowerCase());
  });

  // Fallback if tab has few items
  const displayProducts =
    filteredProducts.length > 0 ? filteredProducts : products.slice(0, 5);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  // WhatsApp 1-click buy function
  const handleQuickWhatsAppBuy = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const text = `مرحباً أستاذ محمد إسماعيل، أود طلب وشراء هذا المنتج من متجر Amazon Furniture:
*المنتج:* ${product.name}
*السعر:* ${formatPrice(product.price)}
*القسم:* ${product.category}
*الماتريال:* ${product.material}
*رابط المنتج:* ${getProductUrl(product.slug)}

برجاء تأكيد حجز الأوردر وميعاد التوصيل والتركيب المجاني. شكراً لك!`;

    const url = `https://wa.me/201091084863?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <section className="py-10 lg:py-14 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Sub-Category Tabs (Oscar Image 2) ─────────────────────────── */}
        <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto pb-3 mb-8 scrollbar-none justify-start md:justify-center border-b border-gray-100">
          {categoryTabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                }}
                className={`whitespace-nowrap pb-2.5 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
                  isActive
                    ? "text-[#ff7b1b] font-black border-b-2 border-[#ff7b1b]"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* ── Product Slider Container with Left / Right Arrows (Oscar Image 2) ── */}
        <div className="relative group/slider">
          {/* Navigation Arrows */}
          <button
            onClick={scrollRight}
            className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-700 hover:text-[#ff7b1b] hover:scale-110 transition-all cursor-pointer"
            aria-label="Previous Products"
          >
            <ChevronRight size={20} />
          </button>

          <button
            onClick={scrollLeft}
            className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-700 hover:text-[#ff7b1b] hover:scale-110 transition-all cursor-pointer"
            aria-label="Next Products"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Scrollable Products Row */}
          <div
            ref={scrollContainerRef}
            className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto scrollbar-none py-2 px-1 scroll-smooth"
          >
            {displayProducts.map((product) => {
              const discountPercent = product.originalPrice
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 25;

              const isFav = isInWishlist(product.id);

              return (
                <div
                  key={product.id}
                  className="w-[260px] sm:w-[280px] shrink-0 group rounded-2xl bg-white border border-gray-200/90 hover:border-[#ff7b1b] hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative text-right"
                >
                  {/* Top Badges & Actions */}
                  <div className="relative">
                    {/* Discount Badge (-10%, -40%) Top Right */}
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <span className="bg-[#ff4e00] text-white font-black text-[11px] px-2.5 py-0.5 rounded shadow-sm">
                        -{discountPercent}%
                      </span>
                    </div>

                    {/* Wishlist Heart Top Left */}
                    <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (isFav) {
                            removeFromWishlist(product.id);
                            addToast("تم الحذف من قائمة الرغبات", "wishlist");
                          } else {
                            addToWishlist(product);
                            addToast("تمت الإضافة لقائمة الرغبات", "wishlist");
                          }
                        }}
                        className="p-1.5 rounded-full bg-white/90 hover:bg-white text-gray-400 hover:text-red-500 shadow-sm transition-colors cursor-pointer"
                        title="إضافة للمفضلة"
                      >
                        <Heart size={15} className={isFav ? "fill-red-600 text-red-600" : ""} />
                      </button>
                      <Link
                        href={`/products/${product.slug}`}
                        className="p-1.5 rounded-full bg-white/90 hover:bg-white text-gray-400 hover:text-primary shadow-sm transition-colors cursor-pointer hidden sm:flex items-center justify-center"
                        title="معاينة سريعة"
                      >
                        <Eye size={15} />
                      </Link>
                    </div>

                    {/* Product Image */}
                    <Link
                      href={`/products/${product.slug}`}
                      className="relative block w-full pt-[90%] bg-gray-50 overflow-hidden"
                    >
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="280px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    {/* Small Color Swatches indicator */}
                    <div className="p-2 pb-0 flex items-center justify-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full border border-gray-300 bg-[#e3d8c8]" />
                      <span className="w-3.5 h-3.5 rounded-full border border-gray-300 bg-[#ffffff]" />
                      <span className="w-3.5 h-3.5 rounded-full border border-gray-300 bg-[#3c342f]" />
                    </div>
                  </div>

                  {/* Product Details & Actions */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/products/${product.slug}`}>
                        <h4 className="font-bold text-xs sm:text-sm text-gray-800 group-hover:text-[#ff7b1b] transition-colors line-clamp-2 mb-2 leading-relaxed">
                          {product.name}
                        </h4>
                      </Link>
                    </div>

                    <div className="pt-2">
                      {/* Price in Oscar style (LE red bold + crossed out) */}
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-sm sm:text-base font-black text-[#ec0101]">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons: Add to Cart / Quick Shop */}
                      <div className="space-y-1.5">
                        <button
                          onClick={() => {
                            addItem(product);
                            addToast(`تمت إضافة ${product.name} إلى السلة`, "cart");
                          }}
                          className="w-full bg-white hover:bg-[#ff7b1b] text-gray-800 hover:text-white border border-gray-200 hover:border-[#ff7b1b] font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                        >
                          <ShoppingBag size={14} />
                          <span>أضف إلى السلة</span>
                        </button>

                        <button
                          onClick={(e) => handleQuickWhatsAppBuy(product, e)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                        >
                          <MessageCircle size={14} />
                          <span>شراء فوري عبر الواتساب</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots Indicator (Oscar Image 2) */}
          <div className="flex items-center justify-center gap-1.5 mt-6">
            <span className="w-5 h-1.5 rounded-full bg-[#ff7b1b]" />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          </div>
        </div>
      </div>
    </section>
  );
}
