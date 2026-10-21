"use client";

import { useState, lazy, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { language } = useLanguageStore();
  const isEn = language === "en";
  const addItem = useCartStore((s) => s.addItem);
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } =
    useWishlistStore();
  const hydrated = useHydrated();
  const wishlisted = hydrated ? isInWishlist(product.id) : false;
  const addToast = useToastStore((s) => s.addToast);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) {
      return;
    }
    router.push(`/products/${product.slug}`);
  };

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
      ? `Hello, I would like to order this item from Amazon Furniture:
*Product:* ${product.name}
*Price:* ${formatPrice(product.price)}
${fullImgUrl ? `*Image:* ${fullImgUrl}\n` : ""}*Link:* ${getProductUrl(product.slug)}

Please confirm order details and free delivery.`
      : `مرحباً، أود شراء هذا المنتج من متجر Amazon Furniture:
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
        onClick={handleCardClick}
        className="product-card group bg-white rounded-2xl border border-[#E8E0D5] overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
      >
        <div className="flex flex-col sm:flex-row items-stretch">
          {/* Image Container */}
          <div className="relative w-full sm:w-60 md:w-72 shrink-0 aspect-[4/3] sm:aspect-square bg-[#F8F5F0] overflow-hidden flex items-center justify-center p-3">
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
              <span className="badge-sale absolute top-3 start-3 text-xs font-black px-2.5 py-0.5 rounded-full shadow-2xs bg-[#B93832] text-white">
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
                    ? "fill-[#B93832] text-[#B93832]"
                    : "text-gray-400 hover:text-[#B93832]"
                }
              />
            </button>
          </div>

          {/* Details & Action Column */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between min-w-0">
            <div>
              <p className="card-category text-xs font-bold text-[#74685E] uppercase tracking-wider mb-1 line-clamp-1">
                {product.category}
              </p>
              <h3 className="card-title text-base sm:text-lg lg:text-xl font-bold text-[#292321] group-hover:text-[#C58B45] transition-colors line-clamp-1 mb-2">
                {product.name}
              </h3>
              <p className="text-xs sm:text-sm text-[#74685E] line-clamp-2 mb-3 leading-relaxed">
                {product.description}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-1.5 mb-4">
                <Star size={14} className="fill-[#C58B45] text-[#C58B45]" />
                <span className="text-xs font-bold text-[#292321]">
                  {product.rating?.toFixed(1) || "4.8"}
                </span>
                <span className="text-xs text-[#74685E]">
                  ({product.reviewCount || 12})
                </span>
              </div>
            </div>

            {/* Price & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E8E0D5]">
              <div className="flex items-baseline gap-2">
                <span
                  className="card-price text-xl sm:text-2xl font-black text-[#B93832]"
                  suppressHydrationWarning
                >
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span
                    className="card-old-price text-sm text-[#74685E] line-through font-bold"
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
                  className="h-10 px-4 rounded-xl bg-[#6B4F3A] hover:bg-[#573E2D] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  title={isEn ? "Add to Cart" : "إضافة للسلة"}
                >
                  <ShoppingBag size={16} />
                  <span>{isEn ? "Add to Cart" : "أضف للسلة"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────────────────────
     GRID VIEW MODE (Inspired by Reference Design)
     ────────────────────────────────────────────────────────────────────────── */
  return (
    <div
      data-card="product"
      onClick={handleCardClick}
      className="product-card group bg-white rounded-xl sm:rounded-3xl p-2.5 sm:p-4 border border-[#E8E0D5] overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative flex flex-col justify-between h-full cursor-pointer"
    >
      <div>
        {/* Image Container with Subtle Background */}
        <div className="relative aspect-[4/3] sm:aspect-square bg-[#F8F5F0] rounded-lg sm:rounded-2xl overflow-hidden flex items-center justify-center p-2 sm:p-3 mb-2.5 sm:mb-3.5 cursor-pointer">
          <Image
            src={product.images[0] || "/placeholder.jpg"}
            alt={product.name}
            fill
            unoptimized={Boolean(
              product.images[0]?.startsWith("/uploads/") ||
                product.images[0]?.startsWith("http")
            )}
            className="object-contain p-1.5 sm:p-2 group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Red Pill Discount Badge */}
          {product.originalPrice && product.originalPrice > product.price ? (
            <span className="absolute top-2 end-2 z-10 bg-[#B93832] text-white text-[9px] sm:text-[11px] font-black px-2 py-0.5 rounded-full shadow-md">
              وفر {(product.originalPrice - product.price).toLocaleString("ar-EG")} ج
            </span>
          ) : discountPercent > 0 ? (
            <span className="absolute top-2 end-2 z-10 bg-[#B93832] text-white text-[9px] sm:text-[11px] font-black px-2 py-0.5 rounded-full shadow-md">
              -{discountPercent}%
            </span>
          ) : null}

          {/* Product Code Watermark */}
          {product.code && (
            <span className="absolute bottom-1.5 start-1.5 z-10 text-[9px] sm:text-[10px] font-mono font-bold text-[#74685E] bg-white/80 backdrop-blur-xs px-1.5 py-0.5 rounded">
              {product.code}
            </span>
          )}

          {/* Floating Round Wishlist Heart */}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-2 start-2 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-10 cursor-pointer border border-[#E8E0D5] group/heart"
            title={isEn ? "Add to wishlist" : "إضافة للمفضلة"}
            aria-label="Wishlist"
          >
            <Heart
              size={14}
              className={
                wishlisted
                  ? "fill-[#B93832] text-[#B93832]"
                  : "text-[#B93832]/60 group-hover/heart:text-[#B93832] group-hover/heart:fill-[#B93832]/20 transition-colors"
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
            className="absolute bottom-2 end-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-xs shadow-xs text-[#74685E] hover:text-[#292321] hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
            title={isEn ? "Quick View" : "نظرة سريعة"}
            aria-label="Quick View"
          >
            <Eye size={14} />
          </button>
        </div>

        {/* Card Content */}
        <Link href={`/products/${product.slug}`} className="block">
          <p className="card-category text-[10px] sm:text-[11px] font-bold text-[#74685E] uppercase tracking-wider mb-1 line-clamp-1">
            {product.category}
          </p>
          <h3 className="card-title text-xs sm:text-base font-bold text-[#292321] group-hover:text-[#C58B45] transition-colors line-clamp-2 min-h-[2rem] sm:min-h-[2.75rem] mb-1.5 leading-snug">
            {product.name}
          </h3>

          {/* Star Rating */}
          <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
            <div className="flex items-center text-[#C58B45]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={11} fill="currentColor" />
              ))}
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-[#292321]">
              ({product.reviewCount || 5})
            </span>
          </div>

          {/* Price */}
          <div className="flex flex-wrap items-baseline gap-1 sm:gap-2 mb-2 sm:mb-3">
            <span
              className="card-price text-sm sm:text-lg font-black text-[#B93832] truncate"
              suppressHydrationWarning
            >
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span
                className="card-old-price text-[11px] sm:text-xs text-[#74685E] line-through font-bold"
                suppressHydrationWarning
              >
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </Link>
      </div>

      {/* Card Actions (WhatsApp Buy & Add to Cart) */}
      <div className="pt-2 sm:pt-2.5 border-t border-[#E8E0D5] flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={handleWhatsAppOrder}
          className="flex-1 min-h-[36px] sm:h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] sm:text-xs font-bold px-2 rounded-lg sm:rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 transition-colors shadow-2xs cursor-pointer truncate"
          title="طلب فوري عبر واتساب"
        >
          <MessageCircle size={13} className="shrink-0" />
          <span className="truncate">{isEn ? "WhatsApp" : "واتساب ⚡"}</span>
        </button>

        <button
          onClick={handleAddToCart}
          className="min-w-[36px] min-h-[36px] sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#6B4F3A] hover:bg-[#573E2D] text-white flex items-center justify-center transition-colors shadow-2xs shrink-0 cursor-pointer"
          title={isEn ? "Add to Cart" : "أضف للسلة"}
          aria-label="Add to Cart"
        >
          <ShoppingBag size={15} />
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
