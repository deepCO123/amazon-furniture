"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, MessageCircle, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useProductStore } from "@/store/productStore";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { formatPrice, getProductUrl } from "@/lib/utils";
import type { Product } from "@/types";
import { useToastStore } from "@/components/ui/Toast";

export default function SaveQuarterCostSection() {
  const products = useProductStore((s) => s.products);
  const addItem = useCartStore((s) => s.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const addToast = useToastStore((s) => s.addToast);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Exact products from Oscar Screenshots 3 & 4
  const targetIds = ["18", "19", "20", "21", "22"];
  const exactProducts = targetIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  const saleProducts =
    exactProducts.length >= 4
      ? exactProducts
      : products.filter((p) => p.originalPrice && p.originalPrice > p.price).slice(0, 5);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -280, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 280, behavior: "smooth" });
    }
  };

  const handleQuickWhatsAppBuy = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const text = `مرحباً أستاذ محمد إسماعيل، أود الاستفادة من خصم الـ 26% وطلب هذا المنتج من متجر Amazon Furniture:
*المنتج:* ${product.name}
*السعر بعد الخصم:* ${formatPrice(product.price)}
*رابط المنتج:* ${getProductUrl(product.slug)}

يرجى تأكيد الحجز والتوصيل المجاني. شكراً!`;

    const url = `https://wa.me/201091084863?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Section Title (Oscar Images 3 & 4) ────────────────────────── */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            وفّر ربع التكلفة بخصومات 26 %
          </h2>
        </div>

        {/* ── Boxed Border Container with Rounded Corners (Oscar Style) ──── */}
        <div className="relative rounded-3xl border border-gray-300 p-4 sm:p-7 bg-white shadow-sm">
          {/* Navigation Arrows on the edges */}
          <button
            onClick={scrollRight}
            className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:text-[#ff7b1b] transition-all cursor-pointer"
            aria-label="Previous"
          >
            <ChevronRight size={18} />
          </button>

          <button
            onClick={scrollLeft}
            className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:text-[#ff7b1b] transition-all cursor-pointer"
            aria-label="Next"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Product Cards Row */}
          <div
            ref={scrollRef}
            className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto scrollbar-none py-1 scroll-smooth"
          >
            {saleProducts.map((product) => {
              const discountPercent = product.originalPrice
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 26;

              const isFav = isInWishlist(product.id);

              return (
                <div
                  key={product.id}
                  className="w-[230px] sm:w-[245px] shrink-0 group flex flex-col justify-between rounded-xl bg-white border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all overflow-hidden text-right"
                >
                  <div className="relative">
                    {/* Discount Badge in Top Right (Oscar style) */}
                    <div className="absolute top-2 right-2 z-10">
                      <span className="bg-[#ff4e00] text-white font-black text-[10px] px-2 py-0.5 rounded shadow-sm">
                        -{discountPercent}%
                      </span>
                    </div>

                    {/* Wishlist Button */}
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
                      className="absolute top-2 left-2 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-red-500 transition-colors shadow-sm cursor-pointer"
                    >
                      <Heart size={14} className={isFav ? "fill-red-600 text-red-600" : ""} />
                    </button>

                    {/* Image */}
                    <Link
                      href={`/products/${product.slug}`}
                      className="relative block w-full pt-[90%] bg-gray-50 overflow-hidden"
                    >
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="245px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/products/${product.slug}`}>
                        <h4 className="font-bold text-xs text-gray-800 group-hover:text-[#ff7b1b] transition-colors line-clamp-2 mb-2 leading-relaxed">
                          {product.name}
                        </h4>
                      </Link>
                    </div>

                    <div className="mt-2">
                      {/* Price in Oscar style */}
                      <div className="flex items-baseline gap-1.5 mb-2.5">
                        <span className="text-xs sm:text-sm font-black text-[#ec0101]">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-[10px] text-gray-400 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* Add to Cart / Quick WhatsApp Button */}
                      <div className="space-y-1">
                        <button
                          onClick={() => {
                            addItem(product);
                            addToast(`تمت إضافة ${product.name} إلى السلة`, "cart");
                          }}
                          className="w-full bg-gray-50 hover:bg-[#ff7b1b] text-gray-700 hover:text-white border border-gray-200 hover:border-[#ff7b1b] font-bold text-[11px] py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <ShoppingBag size={12} />
                          <span>أضف إلى السلة</span>
                        </button>

                        <button
                          onClick={(e) => handleQuickWhatsAppBuy(product, e)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] py-1 px-2 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <MessageCircle size={12} />
                          <span>طلب فوري ⚡</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots Indicator Below (Oscar Images 3 & 4) */}
          <div className="flex items-center justify-center gap-1.5 mt-5">
            <span className="w-5 h-1.5 rounded-full bg-[#ff7b1b]" />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          </div>
        </div>
      </div>
    </section>
  );
}
