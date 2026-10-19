"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  ShoppingBag,
  Heart,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  CheckCircle2,
  RotateCcw,
  Ruler,
} from "lucide-react";
import { useLanguageStore } from "@/store/languageStore";
import { useHydrated } from "@/hooks/useHydrated";
import { useProductStore } from "@/store/productStore";
import { getReviewsByProduct } from "@/data/reviews";
import { formatPrice, getProductUrl } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useToastStore } from "@/components/ui/Toast";
import ImageZoom from "@/components/ui/ImageZoom";
import ProductCard from "@/components/products/ProductCard";
import { useRouter } from "next/navigation";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const storeProduct = useProductStore((s) => s.getProductBySlug(slug));
  const product = storeProduct;
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

  const availableCurtainTypes =
    product?.curtainTypes && product.curtainTypes.length > 0
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
  const [showTechnicalSketch, setShowTechnicalSketch] = useState(false);
  const [added, setAdded] = useState(false);
  const addToast = useToastStore((s) => s.addToast);
  const hydrated = useHydrated();

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5F0]">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <h1 className="text-2xl font-black text-[#6B4F3A] mb-3">
            {isEn ? "Product Not Found" : "عفواً، المنتج غير موجود"}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {isEn ? "This item may have been removed or updated." : "ربما تم تعديل كود المنتج أو نقله."}
          </p>
          <Link
            href="/products"
            className="inline-block bg-[#6B4F3A] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#573E2D] transition-colors"
          >
            {isEn ? "Back to Shop" : "العودة إلى المعرض"}
          </Link>
        </div>
      </div>
    );
  }

  const wishlisted = hydrated ? isInWishlist(product.id) : false;

  const handleAddToCart = () => {
    addItem(product, 1, product.color, isCurtain ? selectedCurtainType : undefined);
    setAdded(true);
    addToast(
      isCurtain
        ? `تمت إضافة الستارة (${selectedCurtainType}) إلى السلة`
        : `تمت إضافة ${product.name} إلى السلة بنجاح ✓`,
      "cart"
    );
    setTimeout(() => setAdded(false), 2000);
  };

  const handleDirectBuy = () => {
    addItem(product, 1, product.color, isCurtain ? selectedCurtainType : undefined);
    addToast(`تم تحويلك إلى السلة لإتمام الطلب فوراً`, "cart");
    router.push("/cart");
  };

  const handleAskQuestion = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const rawImg = product.images?.[0] || "";
    const fullImgUrl = rawImg ? (rawImg.startsWith("http") ? rawImg : `${origin}${rawImg.startsWith("/") ? "" : "/"}${rawImg}`) : "";
    const text = `مرحباً، لدي استفسار بخصوص هذا المنتج من متجر Amazon Furniture:
*المنتج:* ${product.name}
*كود المنتج:* ${product.code || "SZ-101"}
*السعر:* ${formatPrice(product.price)}
${fullImgUrl ? `*صورة القطعة:* ${fullImgUrl}\n` : ""}*رابط المنتج:* ${getProductUrl(product.slug)}`;
    window.open(`https://wa.me/201091084863?text=${encodeURIComponent(text)}`, "_blank");
  };

  const savingsAmount = product.originalPrice && product.originalPrice > product.price
    ? product.originalPrice - product.price
    : 0;

  const dimensionsText = product.dimensions
    ? `${product.dimensions.width}×${product.dimensions.depth} سم`
    : "80×40 سم";

  const heightText = product.dimensions?.height
    ? `${product.dimensions.height} سم`
    : product.category.includes("كرسي")
    ? "قابل للتعديل هيدروليك (105-125 سم)"
    : "75 سم";

  return (
    <div className="min-h-screen bg-[#F8F5F0] pb-24">
      {/* ── 1. Top Breadcrumb Navigation (SofaZone Reference) ─────────── */}
      <div className="bg-white border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-medium">
            <Link href="/" className="hover:text-[#C58B45] transition-colors">
              الرئيسية
            </Link>
            <span>/</span>
            <Link
              href={`/products?category=${encodeURIComponent(product.category)}`}
              className="hover:text-[#C58B45] transition-colors"
            >
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-bold line-clamp-1">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ── 2. Left Column (in RTL): Product Information & Specs ───── */}
          <div className="lg:col-span-5 order-2 lg:order-1 space-y-4">
            
            {/* Red Pill Discount Badge (Image 1 Style) */}
            {savingsAmount > 0 && (
              <div className="inline-block">
                <span className="bg-[#B93832] text-white text-xs sm:text-sm font-black px-3.5 py-1 rounded-full shadow-xs">
                  وفر {savingsAmount.toLocaleString("ar-EG")} جنيه
                </span>
              </div>
            )}

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-3xl font-black text-[#6B4F3A] leading-tight tracking-tight">
              {product.name}
            </h1>

            {/* Rating Stars & Product Code */}
            <div className="flex items-center justify-between gap-4 text-xs text-gray-500 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-700">({reviews.length})</span>
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.floor(product.rating || 5) ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                    />
                  ))}
                </div>
              </div>

              {/* Product Code Watermark */}
              <div className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                رمز المنتج: {product.code || `SZ-${product.id.slice(-4).toUpperCase()}`}
              </div>
            </div>

            {/* Price Row (SofaZone Red Price) */}
            <div className="flex items-baseline gap-3 pt-1 pb-2">
              <span className="text-2xl sm:text-3xl font-black text-[#B93832]" suppressHydrationWarning>
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm sm:text-base text-gray-400 line-through font-bold" suppressHydrationWarning>
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Guarantees Strip (Image 1 Style) */}
            <div className="space-y-1.5 py-2 border-y border-gray-200/90 text-xs font-bold text-gray-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>ضمان معتمد لمدة 10 سنوات على الهيكل والخامات</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw size={16} className="text-[#C58B45] shrink-0" />
                <span>التبديل والإرجاع مجاناً خلال 14 يوماً وفق شروط الضمان</span>
              </div>
            </div>

            {/* Curtain Type Selector (for blinds and curtains) */}
            {isCurtain && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 my-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black text-[#6B4F3A]">
                    نوع الستارة المطلوب:
                  </label>
                  <span className="text-[11px] text-[#C58B45] font-bold">
                    {selectedCurtainType}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {availableCurtainTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedCurtainType(type)}
                      className={`p-2 rounded-lg border text-xs font-bold text-start transition-all ${
                        selectedCurtainType === type
                          ? "bg-[#6B4F3A] text-white border-[#6B4F3A] shadow-xs"
                          : "bg-white text-gray-700 border-gray-200 hover:border-[#C58B45]"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── 3. SofaZone Specifications Table (Image 1 & 2 Style) ──── */}
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs bg-white text-xs">
              <div className="grid grid-cols-2 divide-x divide-x-reverse divide-gray-200 border-b border-gray-200">
                <div className="bg-gray-50 p-2.5 font-bold text-gray-700 text-center">المقاس</div>
                <div className="p-2.5 text-gray-900 text-center font-medium font-mono">{dimensionsText}</div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-x-reverse divide-gray-200 border-b border-gray-200">
                <div className="bg-gray-50 p-2.5 font-bold text-gray-700 text-center">الإرتفاع</div>
                <div className="p-2.5 text-gray-900 text-center font-medium">{heightText}</div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-x-reverse divide-gray-200 border-b border-gray-200">
                <div className="bg-gray-50 p-2.5 font-bold text-gray-700 text-center">نوع الخشب / الخامة</div>
                <div className="p-2.5 text-gray-900 text-center font-medium">{product.material || "خشب زان أحمر / شبك طبي معالج"}</div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-x-reverse divide-gray-200 border-b border-gray-200">
                <div className="bg-gray-50 p-2.5 font-bold text-gray-700 text-center">كثافة الخشب / الإسفنج</div>
                <div className="p-2.5 text-gray-900 text-center font-medium">
                  {product.category === "مكاتب" || product.category === "ترابيزة تليفزيون"
                    ? "MDF إسباني عالي الكثافة 16.5 مم"
                    : "إسفنج كثافة 36 سوبر سوفت"}
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-x-reverse divide-gray-200 border-b border-gray-200">
                <div className="bg-gray-50 p-2.5 font-bold text-gray-700 text-center">الميكانيزم / الشاسيه</div>
                <div className="p-2.5 text-gray-900 text-center font-medium">
                  {product.category.includes("كرسي")
                    ? "ميكانيزم تركي هيدروليك أصلي متعدد الأوضاع"
                    : "شاسيه حديد صلب معالج إلكتروستاتيك"}
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-x-reverse divide-gray-200 border-b border-gray-200">
                <div className="bg-gray-50 p-2.5 font-bold text-gray-700 text-center">الضمان</div>
                <div className="p-2.5 text-emerald-700 text-center font-black">10 سنوات ضمان معتمد</div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-x-reverse divide-gray-200">
                <div className="bg-gray-50 p-2.5 font-bold text-gray-700 text-center">ميعاد الاستلام</div>
                <div className="p-2.5 text-gray-900 text-center font-bold text-[#D97706]">استلام فوري (أو خلال 3-5 أيام)</div>
              </div>
            </div>

            {/* Quick Actions (Ask Question & In Stock Indicator) */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleAskQuestion}
                className="flex items-center gap-1.5 text-xs font-black text-gray-700 hover:text-[#C58B45] transition-colors cursor-pointer"
              >
                <HelpCircle size={15} className="text-[#C58B45]" />
                <span>اطرح سؤالاً عن هذا المنتج 💬</span>
              </button>

              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>متوفر بالمصنع</span>
              </div>
            </div>

            {/* Main Action Buttons (Desktop & Top View) */}
            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={handleDirectBuy}
                className="flex-1 py-3 px-6 rounded-xl bg-[#C58B45] hover:bg-[#b07837] text-white font-black text-sm shadow-md transition-all hover:scale-[1.02] cursor-pointer"
              >
                شراء الآن
              </button>
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3 px-6 rounded-xl bg-[#6B4F3A] hover:bg-[#573E2D] text-white font-black text-sm shadow-md transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                <span>{added ? "تمت الإضافة للسلة! ✓" : "أضف إلى السلة"}</span>
              </button>
            </div>
          </div>

          {/* ── 4. Right Column (in RTL): Image Gallery & Dimension Sketch ─ */}
          <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col md:flex-row gap-4 items-start">
            
            {/* Vertical Thumbnail Strip (Image 1 Style) */}
            <div className="order-2 md:order-1 flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto shrink-0 w-full md:w-20">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedImage(i);
                    setShowTechnicalSketch(false);
                  }}
                  className={`relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-white shadow-xs cursor-pointer ${
                    selectedImage === i && !showTechnicalSketch
                      ? "border-[#C58B45] ring-2 ring-[#C58B45]/20 scale-105"
                      : "border-gray-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} thumbnail ${i + 1}`}
                    fill
                    unoptimized={Boolean(img.startsWith("/uploads/") || img.startsWith("http"))}
                    className="object-contain p-1"
                  />
                </button>
              ))}

              {/* Technical Sketch Thumbnail (Image 2 Style) */}
              <button
                onClick={() => setShowTechnicalSketch(true)}
                className={`relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-gray-50 flex flex-col items-center justify-center shadow-xs cursor-pointer ${
                  showTechnicalSketch
                    ? "border-[#C58B45] ring-2 ring-[#C58B45]/20 scale-105 bg-amber-50"
                    : "border-gray-200 opacity-70 hover:opacity-100"
                }`}
                title="مخطط المقاسات والأبعاد"
              >
                <Ruler size={20} className="text-[#6B4F3A] mb-1" />
                <span className="text-[10px] font-black text-gray-700">الأبعاد CM</span>
              </button>
            </div>

            {/* Main Stage Image / Technical Diagram */}
            <div className="order-1 md:order-2 flex-1 w-full bg-white rounded-3xl border border-gray-200/80 p-4 sm:p-8 relative shadow-lg overflow-hidden min-h-[380px] sm:min-h-[480px] flex items-center justify-center">
              
              {/* Wishlist Button */}
              <button
                onClick={() => {
                  if (wishlisted) {
                    removeWishlist(product.id);
                    addToast(isEn ? "Removed from wishlist" : "تم الحذف من المفضلة", "wishlist");
                  } else {
                    addWishlist(product);
                    addToast(isEn ? "Added to wishlist" : "تمت الإضافة للمفضلة ❤️", "wishlist");
                  }
                }}
                className="absolute top-4 start-4 z-20 w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center hover:scale-110 transition-all cursor-pointer"
                title="إضافة للمفضلة"
              >
                <Heart size={18} className={wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"} />
              </button>

              {/* Technical Sketch View (Image 2 Style with CM dimensions) */}
              {showTechnicalSketch ? (
                <div className="w-full h-full flex flex-col items-center justify-center py-6 text-center animate-fadeIn relative">
                  <div className="relative w-64 h-72 border-2 border-dashed border-gray-400 rounded-xl flex flex-col items-center justify-center p-4 bg-gray-50/80">
                    {/* Width dimension marker */}
                    <div className="absolute -top-6 inset-x-0 flex items-center justify-center text-xs font-mono font-black text-[#6B4F3A]">
                      ◀─── {product.dimensions?.width || 80} CM ───▶
                    </div>
                    {/* Height dimension marker */}
                    <div className="absolute -right-10 inset-y-0 flex items-center justify-center -rotate-90 text-xs font-mono font-black text-[#6B4F3A] whitespace-nowrap">
                      ◀─── {product.dimensions?.height || 110} CM ───▶
                    </div>
                    {/* Depth dimension marker */}
                    <div className="absolute -left-10 inset-y-0 flex items-center justify-center rotate-90 text-xs font-mono font-black text-gray-500 whitespace-nowrap">
                      العمق: {product.dimensions?.depth || 40} CM
                    </div>

                    <Image
                      src={product.images[0] || "/placeholder.jpg"}
                      alt={product.name}
                      fill
                      className="object-contain opacity-35 p-6"
                    />

                    <div className="relative z-10 bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-gray-200 text-xs shadow-sm">
                      <p className="font-black text-[#6B4F3A] mb-1">المخطط الهندسي للمقاسات</p>
                      <p className="font-mono text-gray-600">
                        {product.dimensions?.width || 80}W × {product.dimensions?.depth || 40}D × {product.dimensions?.height || 110}H CM
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Main Product Image with Zoom */
                <div className="relative aspect-square w-full max-w-[420px] mx-auto">
                  <ImageZoom
                    src={product.images[selectedImage]}
                    alt={product.name}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              )}

              {/* Prev / Next Navigation Arrows */}
              {product.images.length > 1 && !showTechnicalSketch && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImage(
                        (selectedImage - 1 + product.images.length) % product.images.length
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-md transition-all cursor-pointer z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage((selectedImage + 1) % product.images.length)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-md transition-all cursor-pointer z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── 5. Product Description & Factory Guarantees ───────────────── */}
        <div className="mt-12 bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs">
          <h3 className="text-xl font-black text-[#6B4F3A] mb-4">
            تفاصيل ومميزات القطعة
          </h3>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed max-w-4xl mb-6">
            {product.description}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70">
              <h4 className="font-black text-[#6B4F3A] text-sm mb-1">خشب زان أحمر ومواد مطابقة للمواصفات</h4>
              <p className="text-xs text-gray-500">تم اختيار الخامات والميكانيزمات المقاومة للإجهاد لتدوم أطول فترة ممكنة.</p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70">
              <h4 className="font-black text-[#6B4F3A] text-sm mb-1">شحن وتركيب مجاني</h4>
              <p className="text-xs text-gray-500">فريق فني متخصص يقوم بالمعاينة والتركيب الفوري لضمان أعلى مستوى من الرضا.</p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70">
              <h4 className="font-black text-[#6B4F3A] text-sm mb-1">خدمة ما بعد البيع وضمان حقيقي</h4>
              <p className="text-xs text-gray-500">فريق الدعم الفني متاح دائماً عبر الواتساب والمصنع لمتابعة أي استفسار.</p>
            </div>
          </div>
        </div>

        {/* ── 6. Related Products (Strictly from same category) ─────────── */}
        {related.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-black text-[#6B4F3A]">
                منتجات أخرى من قسم {product.category}
              </h3>
              <Link
                href={`/products?category=${encodeURIComponent(product.category)}`}
                className="text-xs sm:text-sm font-bold text-[#D97706] hover:underline"
              >
                عرض كل قسم {product.category} ←
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 7. SofaZone Sticky Bottom Action Bar (Image 1 & 2 Style) ─────── */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl py-3 px-4 sm:px-8 z-40 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Action Buttons on Left (in RTL) */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleDirectBuy}
              className="bg-[#C58B45] hover:bg-[#b07837] text-white font-black text-xs sm:text-sm px-6 sm:px-8 py-2.5 rounded-xl shadow-md transition-all hover:scale-105 cursor-pointer"
            >
              شراء الآن
            </button>
            <button
              onClick={handleAddToCart}
              className="bg-[#6B4F3A] hover:bg-[#573E2D] text-white font-black text-xs sm:text-sm px-5 sm:px-7 py-2.5 rounded-xl shadow-md transition-all hover:scale-105 cursor-pointer flex items-center gap-2"
            >
              <ShoppingBag size={16} />
              <span>{added ? "تمت الإضافة! ✓" : "أضف إلى السلة"}</span>
            </button>
          </div>

          {/* Mini Product Preview on Right (in RTL) */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-end">
              <h4 className="text-xs sm:text-sm font-black text-gray-900 line-clamp-1 max-w-[280px]">
                {product.name}
              </h4>
              <div className="flex items-center gap-2 justify-end">
                <span className="text-sm font-black text-[#B93832]">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs text-gray-400 line-through font-bold">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
            </div>
            <div className="relative w-12 h-12 rounded-xl bg-gray-50 overflow-hidden border border-gray-200 shrink-0">
              <Image
                src={product.images[0] || "/placeholder.jpg"}
                alt={product.name}
                fill
                className="object-contain p-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
