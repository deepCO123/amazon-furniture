"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  Shield,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Wrench,
} from "lucide-react";
import { useLanguageStore } from "@/store/languageStore";
import { useHydrated } from "@/hooks/useHydrated";
import { useProductStore } from "@/store/productStore";
import { getProductBySlug as getFallbackProduct } from "@/data/products";
import { getReviewsByProduct } from "@/data/reviews";
import { formatPrice, getDiscount, getProductUrl } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useToastStore } from "@/components/ui/Toast";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import AnimatedSection from "@/components/ui/AnimatedSection";
import ImageZoom from "@/components/ui/ImageZoom";
import ProductCard from "@/components/products/ProductCard";
import { animate } from "animejs";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const storeProduct = useProductStore((s) => s.getProductBySlug(slug));
  const product = storeProduct || getFallbackProduct(slug);
  const allProducts = useProductStore((s) => s.products);
  const related = product
    ? allProducts
        .filter((p) => p.id !== product.id && p.category === product.category)
        .slice(0, 4)
    : [];
  const reviews = product ? getReviewsByProduct(product.id) : [];
  const addItem = useCartStore((s) => s.addItem);
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } =
    useWishlistStore();
  const { language } = useLanguageStore();
  const isEn = language === "en";

  const isCurtain = Boolean(
    product?.category?.includes("ستائر") ||
    product?.name?.includes("ستائر") ||
    (product?.curtainTypes && product.curtainTypes.length > 0)
  );

  const availableCurtainTypes = product?.curtainTypes && product.curtainTypes.length > 0
    ? product.curtainTypes
    : [
        "ستائر رول بلاك أوت (Roll-up Blackout)",
        "ستائر زيبرا ثنائية الطبقات (Zebra Blinds)",
        "ستائر شرائح معدنية ألومنيوم (Venetian)",
        "ستائر شرائح رأسية فورتيكال (Vertical)",
        "ستائر مكتبية ذكية كهربائية (Smart Motorized)",
      ];

  const [selectedCurtainType, setSelectedCurtainType] = useState(availableCurtainTypes[0]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");
  const [reviewLocaleFilter, setReviewLocaleFilter] = useState<"all" | "ar" | "sa" | "en">("all");
  const [added, setAdded] = useState(false);
  const addToast = useToastStore((s) => s.addToast);
  const hydrated = useHydrated();

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">
            Product Not Found
          </h1>
          <Link href="/products" className="text-accent hover:text-accent-dark">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const wishlisted = hydrated ? isInWishlist(product.id) : false;

  const handleAddToCart = () => {
    addItem(product, quantity, product.color, isCurtain ? selectedCurtainType : undefined);
    setAdded(true);
    addToast(
      isCurtain
        ? `تمت إضافة الستارة (${selectedCurtainType}) إلى السلة`
        : `${product.name} أضيف إلى السلة`,
      "cart"
    );

    // Anime.js cart animation
    animate(".cart-pulse", {
      scale: [1, 1.2, 1],
      duration: 400,
      ease: "outQuad",
    });

    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: isEn ? "Home" : "الرئيسية", href: "/" },
            { label: isEn ? "Shop" : "المتجر", href: "/products" },
            { label: product.category },
            { label: product.name },
          ]}
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Images */}
          <AnimatedSection>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white mb-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full"
                >
                  <ImageZoom
                    src={product.images[selectedImage]}
                    alt={product.name}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </motion.div>
              </AnimatePresence>

              {product.originalPrice && (
                <div className="absolute top-4 left-4">
                  <Badge variant="danger" size="md">
                    -{getDiscount(product.originalPrice, product.price)}% OFF
                  </Badge>
                </div>
              )}

              {/* Nav arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImage(
                        (selectedImage - 1 + product.images.length) %
                          product.images.length
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-md transition-all"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage(
                        (selectedImage + 1) % product.images.length
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-md transition-all"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail selector */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      selectedImage === i
                        ? "border-accent ring-2 ring-accent/20"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} thumbnail ${i + 1}`}
                      fill
                      unoptimized={Boolean(img.startsWith("/uploads/") || img.startsWith("http"))}
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </AnimatedSection>

          {/* Details */}
          <AnimatedSection delay={0.2}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="accent" size="sm">
                  {product.category}
                </Badge>
                {product.originalPrice && (
                  <Badge variant="danger" size="sm">
                    {isEn ? "Save" : "وفر"}{" "}
                    {formatPrice(product.originalPrice - product.price)}
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl font-extrabold text-primary mb-3">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < Math.floor(product.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-surface-dark"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-primary">
                  {product.rating}
                </span>
                <span className="text-sm text-muted">
                  ({reviews.length} {isEn ? "reviews" : "تقييم"})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-extrabold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-muted line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              <p className="text-primary/70 leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Curtain Type Selector (for blinds and curtains) */}
              {isCurtain && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-primary">
                      {isEn ? "Select Curtain / Blind Type:" : "حدد نوع الستارة المطلوب:"}
                    </label>
                    <span className="text-[11px] text-[#8B6E45] font-semibold">
                      {selectedCurtainType}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availableCurtainTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedCurtainType(type)}
                        className={`p-3 rounded-xl border text-xs font-bold text-start transition-all ${
                          selectedCurtainType === type
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-[#C5A880]"
                            : "bg-white text-slate-700 border-slate-200 hover:border-[#C5A880]"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart & Actions */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center border border-surface-dark rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-surface transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-surface transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  className="flex-1 cart-pulse font-bold"
                >
                  <ShoppingBag size={18} className="me-2" />
                  {isEn
                    ? added
                      ? "Added to Cart!"
                      : "Add to Cart"
                    : added
                    ? "تمت الإضافة للسلة! ✓"
                    : "أضف إلى السلة"}
                </Button>
                <button
                  onClick={() => {
                    if (wishlisted) {
                      removeWishlist(product.id);
                      addToast(isEn ? "Removed from wishlist" : "تم الحذف من قائمة الرغبات", "wishlist");
                    } else {
                      addWishlist(product);
                      addToast(isEn ? "Added to wishlist" : "تمت الإضافة لقائمة الرغبات", "wishlist");
                    }
                  }}
                  className={`p-3.5 rounded-lg border-2 transition-all ${
                    wishlisted
                      ? "border-danger bg-red-50 text-danger"
                      : "border-surface-dark hover:border-muted"
                  }`}
                >
                  <Heart
                    size={20}
                    className={wishlisted ? "fill-current" : ""}
                  />
                </button>
              </div>

              {/* Direct WhatsApp Order Button */}
              {(() => {
                const origin = typeof window !== "undefined" ? window.location.origin : "http://192.168.1.7:3000";
                const rawImg = product.images?.[0] || "";
                const fullImgUrl = rawImg ? (rawImg.startsWith("http") ? rawImg : `${origin}${rawImg.startsWith("/") ? "" : "/"}${rawImg}`) : "";
                const waText = `مرحباً أستاذ محمد، أود طلب قطعة الأثاث: *${product.name}* (الكمية: ${quantity}${
                  product.color ? `، اللون: ${product.color}` : ""
                }) بسعر ${formatPrice(product.price * quantity)}.\n${fullImgUrl ? `*صورة القطعة:* ${fullImgUrl}\n` : ""}*رابط المنتج:* ${getProductUrl(product.slug)}`;

                return (
                  <a
                    href={`https://wa.me/201091084863?text=${encodeURIComponent(waText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-sm transition-all"
                  >
                    <MessageCircle size={18} />
                    <span>طلب مباشر وتأكيد عبر واتساب</span>
                  </a>
                );
              })()}

              {/* Features */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-surface-dark">
                {[
                  {
                    icon: Wrench,
                    title: isEn ? "Free Assembly" : "التركيب مجاناً",
                    desc: isEn ? "100% Free Setup" : "معاينة وتركيب احترافي ✓",
                    highlight: true,
                  },
                  {
                    icon: Truck,
                    title: isEn ? "Fast Delivery" : "شحن وتوصيل",
                    desc: isEn ? "Doorstep delivery" : "لكافة المدن والمحافظات",
                    highlight: false,
                  },
                  {
                    icon: Shield,
                    title: isEn ? "Full Warranty" : "ضمان شامل",
                    desc: isEn ? "Premium guarantee" : "على الأخشاب والمتانة",
                    highlight: false,
                  },
                ].map((feature) => (
                  <div
                    key={feature.title}
                    className={`text-center p-2.5 rounded-xl border ${
                      feature.highlight
                        ? "bg-emerald-50/70 border-emerald-100"
                        : "bg-surface/50 border-surface-dark"
                    }`}
                  >
                    <feature.icon
                      size={20}
                      className={`mx-auto mb-1 ${
                        feature.highlight ? "text-emerald-600" : "text-accent"
                      }`}
                    />
                    <p
                      className={`text-xs font-bold ${
                        feature.highlight ? "text-emerald-900" : "text-primary"
                      }`}
                    >
                      {feature.title}
                    </p>
                    <p className="text-[10px] text-muted mt-0.5">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Tabs */}
        <AnimatedSection className="mt-16">
          <div className="border-b border-surface-dark">
            <div className="flex gap-6 sm:gap-8 overflow-x-auto">
              {[
                { id: "description", label: isEn ? "Description" : "الوصف والتفاصيل" },
                { id: "specs", label: isEn ? "Specifications" : "المواصفات والأبعاد" },
                {
                  id: "reviews",
                  label: isEn
                    ? `Reviews (${reviews.length})`
                    : `تقييمات العملاء (${reviews.length})`,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "description" | "specs" | "reviews")}
                  className={`pb-3 text-sm font-bold capitalize transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-accent text-accent"
                      : "border-transparent text-muted hover:text-primary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "description" && (
                  <p className="text-primary/80 leading-relaxed max-w-3xl text-base">
                    {product.description}
                  </p>
                )}

                {activeTab === "specs" && (
                  <div className="max-w-3xl space-y-3">
                    {[
                      {
                        label: isEn ? "Wood / Material" : "نوع الخشب والخامة",
                        value: product.material,
                      },
                      {
                        label: isEn ? "Color" : "اللون",
                        value: product.color,
                      },
                      {
                        label: isEn ? "Dimensions" : "الأبعاد والمقاسات",
                        value: `${product.dimensions.width} عرض × ${product.dimensions.height} ارتفاع × ${product.dimensions.depth} عمق (سم)`,
                      },
                      {
                        label: isEn ? "Weight" : "الوزن التقريبي",
                        value: `${product.weight} كجم`,
                      },
                      {
                        label: isEn ? "Availability" : "حالة التوفر",
                        value: product.inStock
                          ? isEn
                            ? "In Stock & Ready"
                            : "متوفر ومتاح للتسليم الفوري"
                          : isEn
                          ? "Out of Stock"
                          : "غير متوفر حالياً",
                      },
                    ].map((spec) => (
                      <div
                        key={spec.label}
                        className="flex py-3 border-b border-surface-dark justify-between sm:justify-start"
                      >
                        <span className="w-48 text-sm font-semibold text-primary">
                          {spec.label}
                        </span>
                        <span className="text-sm text-primary/80 font-medium">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-6 max-w-3xl">
                    {/* Dialect Filter Tabs */}
                    <div className="flex items-center gap-2 p-1.5 bg-surface rounded-xl flex-wrap">
                      <button
                        type="button"
                        onClick={() => setReviewLocaleFilter("all")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          reviewLocaleFilter === "all"
                            ? "bg-white text-primary shadow-xs"
                            : "text-muted hover:text-primary"
                        }`}
                      >
                        {isEn ? "All Reviews" : "جميع الآراء"} ({reviews.length})
                      </button>

                      <button
                        type="button"
                        onClick={() => setReviewLocaleFilter("ar")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          reviewLocaleFilter === "ar"
                            ? "bg-white text-primary shadow-xs"
                            : "text-muted hover:text-primary"
                        }`}
                      >
                        <span>🇪🇬 عربي (مصر)</span>
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded-full">
                          {reviews.filter((r) => r.locale === "ar").length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReviewLocaleFilter("sa")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          reviewLocaleFilter === "sa"
                            ? "bg-white text-primary shadow-xs"
                            : "text-muted hover:text-primary"
                        }`}
                      >
                        <span>🇸🇦 سعودي (المملكة)</span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded-full">
                          {reviews.filter((r) => r.locale === "sa").length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReviewLocaleFilter("en")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          reviewLocaleFilter === "en"
                            ? "bg-white text-primary shadow-xs"
                            : "text-muted hover:text-primary"
                        }`}
                      >
                        <span>🇬🇧 English</span>
                        <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded-full">
                          {reviews.filter((r) => r.locale === "en").length}
                        </span>
                      </button>
                    </div>

                    {reviews.length === 0 ? (
                      <p className="text-muted">
                        {isEn
                          ? "No reviews yet for this product."
                          : "لا توجد تقييمات سابقة لهذا المنتج بعد."}
                      </p>
                    ) : (
                      (reviewLocaleFilter === "all"
                        ? reviews
                        : reviews.filter((r) => r.locale === reviewLocaleFilter)
                      ).map((review) => (
                        <div
                          key={review.id}
                          className="bg-white rounded-xl p-5 border border-surface-dark shadow-xs"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-accent/15 text-accent-dark font-bold rounded-full flex items-center justify-center text-sm">
                                {review.avatar}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-primary text-sm">
                                    {review.author}
                                  </p>
                                  {review.locale === "sa" && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      🇸🇦 عميل من السعودية
                                    </span>
                                  )}
                                  {review.locale === "ar" && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                      🇪🇬 عميل موثق
                                    </span>
                                  )}
                                  {review.locale === "en" && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                      🇬🇧 Verified Client
                                    </span>
                                  )}
                                </div>
                                {review.location && (
                                  <p className="text-[11px] text-muted mt-0.5">
                                    📍 {review.location}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="text-end shrink-0">
                              <div className="flex items-center gap-0.5 justify-end mb-1">
                                {[...Array(5)].map((_, j) => (
                                  <Star
                                    key={j}
                                    size={12}
                                    className={
                                      j < review.rating
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-surface-dark"
                                    }
                                  />
                                ))}
                              </div>
                              <span className="text-[11px] text-muted">
                                {new Date(review.date).toLocaleDateString("ar-EG", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                          <p className="text-primary/85 text-sm leading-relaxed bg-surface/40 p-3 rounded-xl">
                            &ldquo;{review.comment}&rdquo;
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </AnimatedSection>

        {/* Related Products */}
        {related.length > 0 && (
          <AnimatedSection className="mt-16">
            <h2 className="text-2xl font-bold text-primary mb-8">
              {isEn ? "You May Also Like" : "منتجات وتصميمات قد تعجبك"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
}
