"use client";

import { useState, lazy, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star, Eye, MessageCircle } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice, getDiscount, getProductUrl } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useToastStore } from "@/components/ui/Toast";
import { useHydrated } from "@/hooks/useHydrated";
import { useLanguageStore } from "@/store/languageStore";

const QuickView = lazy(() => import("./QuickView"));

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
}

export default function ProductCard({
  product,
  viewMode = "grid",
}: ProductCardProps) {
  const { language } = useLanguageStore();
  const isEn = language === "en";
  const addItem = useCartStore((s) => s.addItem);
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } =
    useWishlistStore();
  const hydrated = useHydrated();
  const wishlisted = hydrated ? isInWishlist(product.id) : false;
  const addToast = useToastStore((s) => s.addToast);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const discountPercent = product.originalPrice
    ? getDiscount(product.originalPrice, product.price)
    : 0;

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";
    const rawImg = product.images?.[0] || "";
    const fullImgUrl = rawImg
      ? rawImg.startsWith("http")
        ? rawImg
        : `${origin}${rawImg.startsWith("/") ? "" : "/"}${rawImg}`
      : "";
    const text = isEn
      ? `Hello Mr. Mohamed Esmaeil, I would like to order this item from Amazon Furniture:
*Product:* ${product.name}
*Price:* ${formatPrice(product.price)}
${fullImgUrl ? `*Image:* ${fullImgUrl}\n` : ""}*Link:* ${getProductUrl(product.slug)}

Please confirm order details and free delivery.`
      : `مرحباً أستاذ محمد إسماعيل، أود شراء هذا المنتج من متجر Amazon Furniture:
*المنتج:* ${product.name}
*السعر:* ${formatPrice(product.price)}
${fullImgUrl ? `*صورة المنتج:* ${fullImgUrl}\n` : ""}*رابط المنتج:* ${getProductUrl(product.slug)}

برجاء تأكيد الطلب مع التوصيل والتركيب المجاني.`;
    window.open(
      `https://wa.me/201091084863?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlisted) {
      removeWishlist(product.id);
      addToast(
        isEn ? "Removed from wishlist" : "تم الحذف من قائمة المفضلة",
        "wishlist"
      );
    } else {
      addWishlist(product);
      addToast(
        isEn ? "Added to wishlist" : "تمت الإضافة لقائمة المفضلة ❤️",
        "wishlist"
      );
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    addToast(
      isEn
        ? `${product.name} added to cart ✓`
        : `تمت إضافة ${product.name} إلى السلة بنجاح ✓`,
      "cart"
    );
  };

  /* ──────────────────────────────────────────────────────────────────────────
     LIST VIEW MODE
     ────────────────────────────────────────────────────────────────────────── */
  if (viewMode === "list") {
    return (
      <div
        data-card="product"
        className="product-card group bg-white rounded-2xl border border-gray-100 dark:border-gray-200 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
      >
        <Link
          href={`/products/${product.slug}`}
          className="flex flex-col sm:flex-row items-stretch"
        >
          {/* Image Container */}
          <div className="relative w-full sm:w-60 md:w-72 shrink-0 aspect-[4/3] sm:aspect-square bg-[#F8F9FA] overflow-hidden flex items-center justify-center p-3">
            <Image
              src={product.images[0] || "/placeholder.jpg"}
              alt={product.name}
              fill
              unoptimized={Boolean(
                product.images[0]?.startsWith("/uploads/") ||
                  product.images[0]?.startsWith("http")
              )}
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, 288px"
            />

            {/* Sale Badge */}
            {discountPercent > 0 && (
              <span className="badge-sale absolute top-3 start-3 text-xs font-black px-2.5 py-0.5 rounded-full shadow-2xs">
                -{discountPercent}%
              </span>
            )}

            {/* Floating Wishlist Button */}
            <button
              onClick={handleToggleWishlist}
              className="absolute top-3 end-3 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-10 cursor-pointer"
              title={isEn ? "Wishlist" : "المفضلة"}
              aria-label="Wishlist"
            >
              <Heart
                size={18}
                className={
                  wishlisted
                    ? "fill-red-500 text-red-500"
                    : "text-gray-400 hover:text-red-500"
                }
              />
            </button>
          </div>

          {/* Details & Action Column */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between min-w-0">
            <div>
              <p className="card-category text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 line-clamp-1">
                {product.category}
              </p>
              <h3 className="card-title text-base sm:text-lg lg:text-xl font-bold text-gray-900 group-hover:text-[#C6A46A] transition-colors line-clamp-1 mb-2">
                {product.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                {product.description}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-1.5 mb-4">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-gray-800">
                  {product.rating?.toFixed(1) || "4.8"}
                </span>
                <span className="text-xs text-gray-400">
                  ({product.reviewCount || 12})
                </span>
              </div>
            </div>

            {/* Price & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
              <div className="flex items-baseline gap-2">
                <span
                  className="card-price text-xl sm:text-2xl font-black text-gray-950"
                  suppressHydrationWarning
                >
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span
                    className="card-old-price text-sm text-gray-400 line-through"
                    suppressHydrationWarning
                  >
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleWhatsAppOrder}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-3.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  title="طلب فوري عبر واتساب"
                >
                  <MessageCircle size={15} />
                  <span>{isEn ? "WhatsApp Order" : "طلب واتساب ⚡"}</span>
                </button>

                <button
                  onClick={handleAddToCart}
                  className="h-10 px-4 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  title={isEn ? "Add to Cart" : "إضافة للسلة"}
                >
                  <ShoppingBag size={16} />
                  <span>{isEn ? "Add to Cart" : "أضف للسلة"}</span>
                </button>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────────────────────
     GRID VIEW MODE (Inspired by Reference Design)
     ────────────────────────────────────────────────────────────────────────── */
  return (
    <div
      data-card="product"
      className="product-card group bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-gray-100 dark:border-gray-200 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative flex flex-col justify-between h-full"
    >
      <div>
        {/* Image Container with Subtle Background */}
        <div className="relative aspect-[4/3] sm:aspect-square bg-[#F8F9FA] rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center p-3 mb-3.5">
          <Image
            src={product.images[0] || "/placeholder.jpg"}
            alt={product.name}
            fill
            unoptimized={Boolean(
              product.images[0]?.startsWith("/uploads/") ||
                product.images[0]?.startsWith("http")
            )}
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Sale Discount Badge (Soft Red) */}
          {discountPercent > 0 && (
            <span className="badge-sale absolute top-2.5 start-2.5 text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-full shadow-2xs">
              -{discountPercent}%
            </span>
          )}

          {/* Floating Round Wishlist Heart (Reference Design Match) */}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-2.5 end-2.5 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-10 cursor-pointer border border-gray-100/80 group/heart"
            title={isEn ? "Add to wishlist" : "إضافة للمفضلة"}
            aria-label="Wishlist"
          >
            <Heart
              size={18}
              className={
                wishlisted
                  ? "fill-red-500 text-red-500"
                  : "text-red-400 group-hover/heart:text-red-500 group-hover/heart:fill-red-500/20 transition-colors"
              }
            />
          </button>

          {/* Quick View Trigger on Hover */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuickViewOpen(true);
            }}
            className="absolute bottom-2.5 end-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs shadow-xs text-gray-600 hover:text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
            title={isEn ? "Quick View" : "نظرة سريعة"}
            aria-label="Quick View"
          >
            <Eye size={15} />
          </button>
        </div>

        {/* Card Content */}
        <Link href={`/products/${product.slug}`} className="block">
          <p className="card-category text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 line-clamp-1">
            {product.category}
          </p>
          <h3 className="card-title text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#C6A46A] transition-colors line-clamp-1 mb-2">
            {product.name}
          </h3>

          {/* Star Rating */}
          <div className="flex items-center gap-1.5 mb-2.5">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-gray-800">
              {product.rating?.toFixed(1) || "4.8"}
            </span>
            <span className="text-xs text-gray-400">
              ({product.reviewCount || 18})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span
              className="card-price text-base sm:text-lg font-black text-gray-950"
              suppressHydrationWarning
            >
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span
                className="card-old-price text-xs text-gray-400 line-through"
                suppressHydrationWarning
              >
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </Link>
      </div>

      {/* Card Actions (WhatsApp Buy & Add to Cart) */}
      <div className="pt-2.5 border-t border-gray-100 flex items-center gap-2">
        <button
          onClick={handleWhatsAppOrder}
          className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          title="طلب فوري عبر واتساب"
        >
          <MessageCircle size={14} />
          <span>{isEn ? "WhatsApp" : "طلب واتساب ⚡"}</span>
        </button>

        <button
          onClick={handleAddToCart}
          className="w-9 h-9 rounded-xl bg-black hover:bg-[#C6A46A] text-white flex items-center justify-center transition-colors shadow-2xs shrink-0 cursor-pointer"
          title={isEn ? "Add to Cart" : "أضف للسلة"}
          aria-label="Add to Cart"
        >
          <ShoppingBag size={16} />
        </button>
      </div>

      {/* Quick View Modal */}
      {quickViewOpen && (
        <Suspense fallback={null}>
          <QuickView
            product={product}
            isOpen={quickViewOpen}
            onClose={() => setQuickViewOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
