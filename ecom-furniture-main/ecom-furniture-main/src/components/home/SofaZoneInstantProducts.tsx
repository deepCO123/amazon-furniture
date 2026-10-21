"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Star, ShoppingBag, MessageCircle } from "lucide-react";
import { useProductStore } from "@/store/productStore";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, getProductUrl } from "@/lib/utils";
import type { Product } from "@/types";
import { useToastStore } from "@/components/ui/Toast";

export default function SofaZoneInstantProducts() {
  const router = useRouter();
  const products = useProductStore((s) => s.products);
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useToastStore((s) => s.addToast);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Products with discounts or featured products
  const instantProducts = products.slice(0, 10);

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const handleQuickWhatsApp = (p: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const text = `مرحباً، أود حجز وشراء منتج الاستلام الفوري هذا:
*المنتج:* ${p.name}
*السعر:* ${formatPrice(p.price)}
*الرابط:* ${getProductUrl(p.slug)}
برجاء تأكيد الحجز وميعاد التوصيل السريع. شكراً لك!`;
    window.open(`https://wa.me/201091084863?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <section className="py-12 bg-[#F9FAFB] border-t border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Section Header ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#B93832] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full">
                عروض حصرية
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#6B4F3A] tracking-tight">
                منتجات متاحة للإستلام الفوري
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#74685E] font-bold">
              جاهزة للشحن والتوصيل خلال 24 ساعة فقط لحد باب البيت
            </p>
          </div>

          {/* Navigation Arrows (Image 3 Style) */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={scrollRight}
              className="w-10 h-10 rounded-full bg-white border border-[#E8E0D5] shadow-xs flex items-center justify-center text-[#292321] hover:text-[#C58B45] hover:border-[#C58B45] transition-all cursor-pointer"
              aria-label="Previous"
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={scrollLeft}
              className="w-10 h-10 rounded-full bg-white border border-[#E8E0D5] shadow-xs flex items-center justify-center text-[#292321] hover:text-[#C58B45] hover:border-[#C58B45] transition-all cursor-pointer"
              aria-label="Next"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>

        {/* ── Products Slider (Image 3 Cards) ─────────────────────────── */}
        <div
          ref={scrollRef}
          className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto pb-4 scroll-smooth no-scrollbar"
        >
          {instantProducts.map((p) => {
            const savings = p.originalPrice && p.originalPrice > p.price
              ? p.originalPrice - p.price
              : 500;
            const savingsText = `وفر ${savings.toLocaleString("ar-EG")} جنيه`;

            return (
              <div
                key={p.id}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest("button") || target.closest("a")) return;
                  router.push(`/products/${p.slug}`);
                }}
                className="w-[260px] sm:w-[290px] shrink-0 bg-white rounded-2xl border border-[#E8E0D5] hover:border-[#C58B45] hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer"
              >
                {/* Image Container with Badges */}
                <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                  {/* Top Right Red Pill Badge */}
                  <span className="absolute top-2.5 right-2.5 z-10 bg-[#B93832] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-md">
                    {savingsText}
                  </span>

                  <Image
                    src={p.images[0] || "/placeholder.jpg"}
                    alt={p.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="290px"
                  />

                  {/* Primary Brown Bottom Ribbon: منتجات استلام فوري */}
                  <div className="absolute bottom-0 inset-x-0 bg-[#6B4F3A]/95 backdrop-blur-xs text-white text-[11px] font-black py-1 text-center tracking-wide">
                    منتجات استلام فوري ⚡
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Title */}
                    <Link
                      href={`/products/${p.slug}`}
                      className="block font-bold text-sm text-[#292321] group-hover:text-[#C58B45] transition-colors line-clamp-2 leading-snug mb-2"
                    >
                      {p.name}
                    </Link>

                    {/* Star Rating & Reviews */}
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <div className="flex items-center text-[#C58B45]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={13} fill="currentColor" />
                        ))}
                      </div>
                      <span className="text-[11px] font-bold text-[#74685E]">
                        ({p.reviewCount || 5})
                      </span>
                    </div>

                    {/* Color Swatch Previews */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="w-4 h-4 rounded-full border border-gray-300 bg-[#E8D8C3]" title="بيج فاتح" />
                      <span className="w-4 h-4 rounded-full border border-gray-300 bg-[#6B4F3A]" title="بني" />
                      <span className="w-4 h-4 rounded-full border border-gray-300 bg-[#292321]" title="داكن" />
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-2 border-t border-[#E8E0D5] flex items-center justify-between">
                    <div>
                      <div className="text-base sm:text-lg font-black text-[#B93832]">
                        {formatPrice(p.price)}
                      </div>
                      {p.originalPrice && (
                        <div className="text-xs text-[#74685E] line-through font-bold">
                          {formatPrice(p.originalPrice)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* WhatsApp Buy */}
                      <button
                        onClick={(e) => handleQuickWhatsApp(p, e)}
                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                        title="شراء فوري عبر الواتساب"
                      >
                        <MessageCircle size={16} />
                      </button>

                      {/* Add to Cart */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addItem(p, 1);
                          addToast("تمت الإضافة إلى السلة بنجاح! 🛒", "success");
                        }}
                        className="p-2 rounded-xl bg-[#6B4F3A] hover:bg-[#573E2D] text-white transition-colors cursor-pointer shadow-xs"
                        title="إضافة للسلة"
                      >
                        <ShoppingBag size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
