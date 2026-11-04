"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star, Check, Flame, Clock } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface OfferProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice: number;
  rating: number;
  image: string;
  category: string;
  discountPercentage: number;
  stockLeft: number;
}

const officeFlashOffersList: OfferProduct[] = [
  {
    id: "offer-exec-chair-mesh",
    slug: "orthopedic-lumbar-chair",
    name: "كرسي شبك طبي إرجونوميك هيدروليك معتمد",
    price: 3650,
    originalPrice: 4800,
    rating: 5,
    discountPercentage: 24,
    stockLeft: 3,
    image: "/redesign/cat-medical-chair.png",
    category: "كراسي طبية",
  },
  {
    id: "prod_executive_metal_leg_desk",
    slug: "modern-executive-desk-metal-legs",
    name: "مكتب تنفيذي فخم بقوائم معدنية هندسية ومخرج كابلات",
    price: 6850,
    originalPrice: 8500,
    rating: 5,
    discountPercentage: 19,
    stockLeft: 4,
    image: "/products/desks/desk-executive-metal-leg.jpg",
    category: "مكاتب",
  },
  {
    id: "offer-leather-boss-chair",
    slug: "luxury-leather-manager-chair",
    name: "كرسي مدير تنفيذي جلد طبيعي مبطن ديلوكس",
    price: 4400,
    originalPrice: 5900,
    rating: 5,
    discountPercentage: 25,
    stockLeft: 4,
    image: "/redesign/cat-leather-chair.png",
    category: "كراسي جلد",
  },
  {
    id: "offer-office-curtains-motor",
    slug: "smart-motorized-blinds",
    name: "ستائر مكتبية رول زيبرا عازلة للحرارة",
    price: 2400,
    originalPrice: 3200,
    rating: 5,
    discountPercentage: 25,
    stockLeft: 5,
    image: "/redesign/cat-corner-sofa.png",
    category: "ستائر مكتبية",
  },
  {
    id: "offer-coffee-corner-flash",
    slug: "luxury-coffee-corner-shelf",
    name: "وحدة كوفي كورنر خشب ميلامين تركي متكاملة",
    price: 4950,
    originalPrice: 6600,
    rating: 5,
    discountPercentage: 25,
    stockLeft: 3,
    image: "/redesign/cat-coffee-corner.png",
    category: "كوفي كورنر",
  },
  {
    id: "offer-shoerack-flash",
    slug: "modern-wooden-shoe-rack",
    name: "جزامة خشبية راقية للأحذية 3 أبواب هيدروليك",
    price: 2950,
    originalPrice: 3900,
    rating: 5,
    discountPercentage: 24,
    stockLeft: 4,
    image: "/redesign/cat-shoerack.png",
    category: "جزامات",
  },
  {
    id: "offer-tv-table-flash",
    slug: "modern-tv-table-unit",
    name: "ترابيزة شاشة وتليفزيون خشب MDF أسباني عصرية",
    price: 3600,
    originalPrice: 4800,
    rating: 5,
    discountPercentage: 25,
    stockLeft: 2,
    image: "/redesign/cat-tv-table.png",
    category: "ترابيزة شاشه",
  },
  {
    id: "offer-sofa-reception-flash",
    slug: "luxury-corner-sofa",
    name: "انتريه استقبال مكتبي فاخر خشب زان أحمر",
    price: 8900,
    originalPrice: 11900,
    rating: 5,
    discountPercentage: 25,
    stockLeft: 3,
    image: "/redesign/prod-sofa.png",
    category: "انتريهات",
  },
];

export default function NewLatestOffersSection() {
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  const [addedItem, setAddedItem] = useState<string | null>(null);

  // Live countdown timer state (hours, minutes, seconds)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toProduct = (prod: OfferProduct): Product => ({
    id: prod.id,
    name: prod.name,
    slug: prod.slug,
    price: prod.price,
    originalPrice: prod.originalPrice,
    images: [prod.image],
    category: prod.category,
    description: "عروض وتجهيزات مكتبية حصرية معتمدة من Amazon Furniture.",
    material: "خامات ممتازة وهيكل معالج",
    color: "طبيعي",
    dimensions: { width: 100, height: 80, depth: 80 },
    weight: 18,
    inStock: true,
    featured: true,
    tags: ["عروض خاصة", prod.category],
    rating: prod.rating,
    reviewCount: 19,
    stockQuantity: prod.stockLeft,
  });

  const handleToggleWishlist = (e: React.MouseEvent, prod: OfferProduct) => {
    e.preventDefault();
    e.stopPropagation();
    const inWish = wishlistItems.some((item) => item.id === prod.id || item.slug === prod.slug);
    if (inWish) {
      removeFromWishlist(prod.id);
    } else {
      addToWishlist(toProduct(prod));
    }
  };

  const handleAddToCart = (e: React.MouseEvent, prod: OfferProduct) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(toProduct(prod), 1);
    setAddedItem(prod.id);
    setTimeout(() => {
      setAddedItem(null);
    }, 1800);
  };

  return (
    <section className="w-full bg-[#FAF7F2] dark:bg-[#120E0B] py-6 sm:py-10">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Flash Sale Header Row with Live Countdown Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-8 pb-3 sm:pb-4 border-b border-[#EAE4DC] dark:border-[#38261A]">
          <div className="text-right w-full md:w-auto">
            <div className="inline-flex items-center gap-1.5 bg-[#C59B63]/15 text-[#9E6D38] dark:text-[#E8D4B0] text-[11px] sm:text-xs font-black px-3 py-1 rounded-full mb-1.5 sm:mb-2">
              <Flame className="w-3.5 h-3.5 text-[#C92A2A] fill-[#C92A2A]" />
              <span>تجهيزات مكتبية بأسعار المصنع</span>
            </div>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-[#1F2421] dark:text-[#F8F9FA] tracking-tight">
              أقوى عروض الأثاث المكتبي والتنفيذي (Flash Sale)
            </h2>
          </div>

          {/* Countdown Timer Widget */}
          <div className="flex items-center justify-between sm:justify-start gap-2 bg-[#1F2421] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl shadow-sm text-xs font-bold w-full md:w-auto">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C59B63]" />
              <span className="text-[11px] sm:text-xs">ينتهي العرض خلال:</span>
            </div>
            <div className="flex items-center gap-1 font-mono font-black text-xs sm:text-sm text-[#C59B63]">
              <span className="bg-white/10 px-1.5 py-0.5 rounded">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span>:</span>
              <span className="bg-white/10 px-1.5 py-0.5 rounded">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span>:</span>
              <span className="bg-white/10 px-1.5 py-0.5 rounded">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>

        {/* 8 Cards Grid: Strictly 2 columns on mobile (منتجين جنب بعض), 2 on sm, 3 on md, 4 on lg */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
          {officeFlashOffersList.map((prod) => {
            const isWish = wishlistItems.some(
              (item) => item.id === prod.id || item.slug === prod.slug
            );
            const isJustAdded = addedItem === prod.id;

            return (
              <div
                key={prod.id}
                className="group relative bg-white dark:bg-[#1C1612] rounded-2xl p-2.5 sm:p-4 border border-[#EDE5DA] dark:border-[#38261A] shadow-[0_2px_10px_rgba(31,36,33,0.04)] hover:shadow-[0_12px_28px_rgba(31,36,33,0.1)] hover:border-[#C59B63]/60 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Top: Wishlist Heart + Discount Percentage Tag */}
                <div className="flex items-center justify-between w-full mb-1 sm:mb-2">
                  <button
                    onClick={(e) => handleToggleWishlist(e, prod)}
                    aria-label="إضافة للمفضلة"
                    className="p-1 sm:p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#251D17] transition-colors cursor-pointer"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
                        isWish
                          ? "fill-[#E03131] text-[#E03131]"
                          : "text-[#9E8E81] dark:text-[#A8988A] group-hover:text-[#2B1E16] dark:group-hover:text-white"
                      }`}
                      strokeWidth={1.8}
                    />
                  </button>

                  <span className="inline-flex items-center gap-0.5 bg-[#C92A2A] text-white text-[10px] sm:text-xs font-black px-1.5 sm:px-2 py-0.5 rounded-full shadow-2xs">
                    %{prod.discountPercentage} خصم
                  </span>
                </div>

                {/* Centered Product Image */}
                <Link
                  href={`/products/${prod.slug}`}
                  className="relative w-full h-24 sm:h-36 md:h-44 my-1 block overflow-hidden"
                >
                  <Image
                    src={prod.image}
                    alt={prod.name}
                    fill
                    className="object-contain object-center transition-transform duration-300 group-hover:scale-108"
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 250px"
                  />
                </Link>

                {/* Stock Left & Fast Delivery Indicator */}
                <div className="flex items-center justify-between text-[10px] sm:text-xs my-1 sm:my-1.5">
                  <span className="text-[#C59B63] font-bold flex items-center gap-0.5">
                    <span className="inline-block w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#C59B63] animate-pulse" />
                    متبقي {prod.stockLeft} قطع
                  </span>
                  <span className="text-[#2B8A3E] font-medium hidden sm:inline">
                    ✓ تسليم فوري
                  </span>
                </div>

                {/* Product Name */}
                <Link
                  href={`/products/${prod.slug}`}
                  className="block text-right mb-1"
                >
                  <h4 className="text-xs sm:text-sm font-bold text-[#1F2421] dark:text-[#F8F9FA] line-clamp-1 sm:line-clamp-2 group-hover:text-[#C59B63] transition-colors leading-snug">
                    {prod.name}
                  </h4>
                  <span className="text-[10px] sm:text-xs text-[#8A7E72] dark:text-[#A8988A] block mt-0.5">
                    {prod.category}
                  </span>
                </Link>

                {/* Star Rating */}
                <div className="flex items-center justify-end gap-0.5 my-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-[#F59E0B] text-[#F59E0B]"
                    />
                  ))}
                </div>

                {/* Bottom Row: Price & Add to Cart Button */}
                <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-[#F5EFE7] dark:border-[#2D1F17] mt-auto">
                  {/* Cart Button */}
                  <button
                    onClick={(e) => handleAddToCart(e, prod)}
                    aria-label="أضف إلى السلة"
                    className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                      isJustAdded
                        ? "bg-[#2B8A3E] text-white scale-110"
                        : "bg-[#1F2421] hover:bg-[#C59B63] active:scale-90 text-white shadow-2xs"
                    }`}
                  >
                    {isJustAdded ? (
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                    ) : (
                      <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}
                  </button>

                  {/* Prices in EGP */}
                  <div className="flex flex-col items-end dir-ltr">
                    <span className="text-xs sm:text-base font-black text-[#1F2421] dark:text-[#E8D4B0]">
                      {formatPrice(prod.price)}
                    </span>
                    <span className="text-[10px] sm:text-xs text-[#9E8E81] line-through">
                      {formatPrice(prod.originalPrice)}
                    </span>
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
