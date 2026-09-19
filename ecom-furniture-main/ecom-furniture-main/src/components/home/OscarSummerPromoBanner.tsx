"use client";

import Link from "next/link";
import Image from "next/image";
import { MessageCircle, ShoppingBag, Sparkles, ArrowLeft, Ruler } from "lucide-react";
import { useProductStore } from "@/store/productStore";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, getProductUrl } from "@/lib/utils";
import type { Product } from "@/types";
import { useToastStore } from "@/components/ui/Toast";

export default function OscarSummerPromoBanner() {
  const products = useProductStore((s) => s.products);
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useToastStore((s) => s.addToast);

  // Take high quality products for summer discount showcase
  const summerProducts = products.slice(1, 6);

  const handleQuickWhatsAppBuy = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const text = `مرحباً أستاذ محمد إسماعيل، أود الاستفادة من تخفيضات الصيف وشراء هذا المنتج من متجر Amazon Furniture:
*المنتج:* ${product.name}
*السعر:* ${formatPrice(product.price)}
*رابط المنتج:* ${getProductUrl(product.slug)}

برجاء تأكيد الحجز وميعاد التوصيل والتركيب المجاني. شكراً!`;

    const url = `https://wa.me/201091084863?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* ── 1. Big Modern Architectural Banner (Oscar Screenshot 5) ──────── */}
        <div className="relative rounded-3xl overflow-hidden min-h-[260px] sm:min-h-[340px] flex items-center justify-center text-center p-6 sm:p-12 shadow-xl bg-gradient-to-r from-[#1e1a17] via-[#2d2620] to-[#1e1a17]">
          {/* Background image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600"
              alt="بصمة مكانك تبدأ من أمازون"
              fill
              className="object-cover opacity-35 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-4 text-white">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
              <Sparkles size={14} className="text-amber-400" />
              <span>جودة وفخامة لا تضاهى</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
              بصمة مكانك تبدأ من{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                Amazon Furniture
              </span>
            </h2>

            <p className="text-sm sm:text-base text-gray-300 max-w-lg mx-auto font-medium leading-relaxed">
              من المصنع لحد باب بيتك مباشرة — تصاميم هندسية تناسب أرقى المكاتب والمنازل بأسعار تصنيع حقيقية.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/products"
                className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm px-6 py-3 rounded-xl shadow-lg transition-all"
              >
                تصفح الكتالوج الشامل
              </Link>
              <Link
                href="/#consultation"
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm px-5 py-3 rounded-xl backdrop-blur-sm transition-all flex items-center gap-1.5"
              >
                <Ruler size={16} className="text-amber-400" />
                <span>استشارة مجانية بالمنصورة & أونلاين</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── 2. "اسبق الكل والحق تخفيضات الصيف" (Boxed Container) ─────────── */}
        <div className="relative rounded-3xl border-2 border-gray-900/80 p-6 sm:p-8 pt-10 bg-[#faf8f5] shadow-sm">
          {/* Title Notched on top border */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#faf8f5] px-6 py-1">
            <h3 className="text-xl sm:text-2xl font-black text-primary tracking-tight whitespace-nowrap">
              اسبق الكل والحق تخفيضات الصيف
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {summerProducts.map((product, idx) => {
              const discounts = [38, 25, 26, 30, 35];
              const discountPercent = discounts[idx % discounts.length];

              return (
                <div
                  key={product.id}
                  className="group flex flex-col justify-between rounded-xl bg-white border border-gray-200 hover:border-amber-500 hover:shadow-lg transition-all overflow-hidden text-right"
                >
                  <div className="relative">
                    <div className="absolute top-2 right-2 z-10">
                      <span className="bg-red-600 text-white font-black text-[11px] px-2 py-0.5 rounded shadow">
                        -{discountPercent}%
                      </span>
                    </div>

                    <Link
                      href={`/products/${product.slug}`}
                      className="relative block w-full pt-[95%] bg-gray-50 overflow-hidden"
                    >
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 20vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/products/${product.slug}`}>
                        <h4 className="font-bold text-xs sm:text-sm text-primary group-hover:text-amber-600 transition-colors line-clamp-2 mb-1.5 leading-snug">
                          {product.name}
                        </h4>
                      </Link>
                    </div>

                    <div className="mt-2">
                      <div className="flex items-baseline gap-1.5 mb-2">
                        <span className="text-xs sm:text-sm font-black text-red-600">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-[10px] text-gray-400 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* WhatsApp 1-Click Buy */}
                      <button
                        onClick={(e) => handleQuickWhatsAppBuy(product, e)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 shadow-sm transition-colors mb-1"
                      >
                        <MessageCircle size={13} />
                        <span>طلب واتساب ⚡</span>
                      </button>

                      <button
                        onClick={() => {
                          addItem(product);
                          addToast(`تمت إضافة ${product.name} إلى السلة`, "cart");
                        }}
                        className="w-full bg-gray-100 hover:bg-amber-400 hover:text-black text-gray-700 font-bold text-[11px] py-1 px-2 rounded-lg flex items-center justify-center gap-1 transition-colors"
                      >
                        <ShoppingBag size={12} />
                        <span>أضف للسلة</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-6">
            <Link
              href="/products?tag=sale"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-800 hover:text-amber-700 transition-colors"
            >
              <span>مشاهدة كل عروض الصيف والتخفيضات المعتمدة</span>
              <ArrowLeft size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
