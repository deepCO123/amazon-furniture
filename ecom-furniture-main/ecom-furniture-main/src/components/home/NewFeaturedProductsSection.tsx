"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star, ArrowLeft, Check } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface FeaturedProductItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  image: string;
  category: string;
}

// 10 Featured products (2 rows of 5 on desktop, 5 clean rows of 2 on mobile)
const featuredProductsList: FeaturedProductItem[] = [
  {
    id: "prod-bed-royal",
    slug: "luxury-royal-bed",
    name: "سرير عصري فاخر",
    price: 4900,
    rating: 5,
    image: "/redesign/prod-bed.png",
    category: "غرف نوم",
  },
  {
    id: "prod_executive_metal_leg_desk",
    slug: "modern-executive-desk-metal-legs",
    name: "مكتب تنفيذي مودرن بقوائم هندسية",
    price: 6850,
    rating: 5,
    image: "/products/desks/desk-executive-metal-leg.jpg",
    category: "مكاتب",
  },
  {
    id: "prod-chair-modern",
    slug: "modern-comfy-chair",
    name: "كرسي مريح حديث",
    price: 3850,
    rating: 5,
    image: "/redesign/prod-chair.png",
    category: "كراسي جلد",
  },
  {
    id: "prod-wardrobe-deluxe",
    slug: "luxury-wood-wardrobe",
    name: "دولاب خشب فاخر",
    price: 7800,
    rating: 5,
    image: "/redesign/prod-wardrobe.png",
    category: "دواليب",
  },
  {
    id: "prod-sofa-corner",
    slug: "luxury-corner-sofa",
    name: "ركنة مريحة عصرية",
    price: 11500,
    rating: 5,
    image: "/redesign/prod-sofa.png",
    category: "ركن",
  },
  {
    id: "prod-coffee-corner-luxury",
    slug: "luxury-coffee-corner-shelf",
    name: "وحدة كوفي كورنر مودرن متكاملة",
    price: 6200,
    rating: 5,
    image: "/redesign/cat-coffee-corner.png",
    category: "كوفي كورنر",
  },
  {
    id: "prod-shoe-rack-deluxe",
    slug: "wide-shoe-rack-white-beige-szg14",
    name: "جزامة عريضة أبيض وبيج – SZG14",
    price: 15272,
    rating: 5,
    image: "/products/shoe-racks/szg14-white-beige-main.jpg",
    category: "جزامات",
  },
  {
    id: "prod-tv-table-modern",
    slug: "modern-tv-table-unit",
    name: "ترابيزة شاشة وتليفزيون عصرية",
    price: 4800,
    rating: 5,
    image: "/redesign/cat-tv-table.png",
    category: "ترابيزة شاشه",
  },
  {
    id: "prod-medical-lumbar-chair",
    slug: "orthopedic-lumbar-chair",
    name: "كرسي شبك طبي إرجونوميك هيدروليك",
    price: 4200,
    rating: 5,
    image: "/redesign/cat-medical-chair.png",
    category: "كراسي طبية",
  },
  {
    id: "prod-leather-manager-deluxe",
    slug: "luxury-leather-manager-chair",
    name: "كرسي مدير تنفيذي جلد طبيعي",
    price: 5400,
    rating: 5,
    image: "/redesign/cat-leather-chair.png",
    category: "كراسي جلد",
  },
];

export default function NewFeaturedProductsSection() {
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  const [addedItem, setAddedItem] = useState<string | null>(null);

  const toProduct = (prod: FeaturedProductItem): Product => ({
    id: prod.id,
    name: prod.name,
    slug: prod.slug,
    price: prod.price,
    originalPrice: prod.originalPrice,
    images: [prod.image],
    category: prod.category,
    description: "قطعة أثاث فاخرة من تصميم وتنفيذ مصنع ومعرض Amazon Furniture بخامات عالية الجودة.",
    material: "خشب وخامات فاخرة",
    color: "طبيعي",
    dimensions: { width: 100, height: 80, depth: 80 },
    weight: 18,
    inStock: true,
    featured: true,
    tags: [prod.category],
    rating: prod.rating,
    reviewCount: 12,
    stockQuantity: 10,
  });

  const handleToggleWishlist = (e: React.MouseEvent, prod: FeaturedProductItem) => {
    e.preventDefault();
    e.stopPropagation();
    const inWish = wishlistItems.some((item) => item.id === prod.id || item.slug === prod.slug);
    if (inWish) {
      removeFromWishlist(prod.id);
    } else {
      addToWishlist(toProduct(prod));
    }
  };

  const handleAddToCart = (e: React.MouseEvent, prod: FeaturedProductItem) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(toProduct(prod), 1);
    setAddedItem(prod.id);
    setTimeout(() => {
      setAddedItem(null);
    }, 1800);
  };

  return (
    <section className="w-full bg-[#FAF7F2] dark:bg-[#120E0B] py-6 sm:py-8">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch">
          {/* ── 1. RIGHT SIDE: Featured Products Grid (8 cols on lg) ──
              In RTL, the first element appears on the RIGHT! */}
          <div className="lg:col-span-8 flex flex-col justify-between order-1">
            {/* Header Row: Badge "منتجات مميزة 👑" on right, arrow circle on left */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Link
                href="/products"
                className="w-8 h-8 rounded-full bg-white dark:bg-[#1E1712] border border-[#EDE5DA] dark:border-[#38261A] text-[#7A6B60] dark:text-[#D4A373] hover:bg-[#2B1E16] hover:text-white flex items-center justify-center transition-colors shadow-2xs"
                title="عرض جميع المنتجات"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>

              <div className="inline-flex items-center gap-2 bg-[#3D2619] text-[#F7E7CE] text-xs sm:text-sm font-black px-4 py-1.5 rounded-full shadow-xs">
                <span>منتجات مميزة 👑</span>
              </div>
            </div>

            {/* Products Grid: 2 columns on mobile, 3 on sm, 4 on md, 5 on lg */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
              {featuredProductsList.map((prod) => {
                const isWish = wishlistItems.some(
                  (item) => item.id === prod.id || item.slug === prod.slug
                );
                const isJustAdded = addedItem === prod.id;

                return (
                  <div
                    key={prod.id}
                    className="group relative bg-white dark:bg-[#1C1612] rounded-2xl p-2.5 sm:p-3 border border-[#EDE5DA] dark:border-[#38261A] shadow-[0_2px_10px_rgba(43,30,22,0.03)] hover:shadow-[0_8px_24px_rgba(43,30,22,0.08)] hover:border-[#D4A373]/50 transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Top Action: Heart Wishlist Button */}
                    <div className="flex items-center justify-between w-full mb-1">
                      <button
                        onClick={(e) => handleToggleWishlist(e, prod)}
                        aria-label="إضافة للمفضلة"
                        className="p-1 rounded-full hover:bg-[#FAF4ED] dark:hover:bg-[#2B1E16] transition-colors cursor-pointer"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 transition-colors ${isWish
                              ? "fill-[#E03131] text-[#E03131]"
                              : "text-[#9E8E81] dark:text-[#A8988A] group-hover:text-[#2B1E16] dark:group-hover:text-white"
                            }`}
                          strokeWidth={1.8}
                        />
                      </button>
                    </div>

                    {/* Centered Product Image */}
                    <Link
                      href={`/products/${prod.slug}`}
                      className="relative w-full h-24 sm:h-28 md:h-32 my-1 block overflow-hidden"
                    >
                      <Image
                        src={prod.image}
                        alt={prod.name}
                        fill
                        className="object-contain object-center transition-transform duration-300 group-hover:scale-108"
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 180px"
                      />
                    </Link>

                    {/* Product Name */}
                    <Link
                      href={`/products/${prod.slug}`}
                      className="block text-right mt-1.5"
                    >
                      <h4 className="text-xs sm:text-[13px] font-bold text-[#2B1E16] dark:text-[#F0EBE5] line-clamp-1 group-hover:text-[#A3704C] transition-colors">
                        {prod.name}
                      </h4>
                    </Link>

                    {/* 5 Golden Stars Rating */}
                    <div className="flex items-center justify-end gap-0.5 my-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-2.5 h-2.5 fill-[#F59E0B] text-[#F59E0B]"
                        />
                      ))}
                    </div>

                    {/* Bottom Row: Dark Coffee Cart Button + Price */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-[#F5EFE7] dark:border-[#2D1F17] mt-auto">
                      {/* Cart Button */}
                      <button
                        onClick={(e) => handleAddToCart(e, prod)}
                        aria-label="أضف إلى السلة"
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${isJustAdded
                            ? "bg-[#2B8A3E] text-white scale-110"
                            : "bg-[#422C1D] hover:bg-[#2B1E16] active:scale-90 text-white shadow-2xs"
                          }`}
                      >
                        {isJustAdded ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : (
                          <ShoppingBag className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Price in Arabic EGP */}
                      <div className="text-left font-black text-xs sm:text-sm text-[#2B1E16] dark:text-[#E8D4B0] dir-ltr">
                        {formatPrice(prod.price)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 2. LEFT SIDE: Promo Banner Card (4 cols on lg) ──
              In RTL, the second element appears on the LEFT! */}
          <div className="lg:col-span-4 order-2 flex flex-col">
            <div className="hidden lg:block h-7 mb-4" /> {/* Spacer matching products header */}
            <div className="relative rounded-2xl overflow-hidden h-full min-h-[190px] sm:min-h-[260px] bg-[#241710] border border-[#523A2A]/40 shadow-sm text-white group flex items-center justify-between p-4 sm:p-5">
              {/* Right Side (in RTL): Text & CTA Button */}
              <div className="relative z-10 flex flex-col items-start justify-center pr-1 sm:pr-2 max-w-[55%]">
                <h3 className="text-xl sm:text-2xl lg:text-[26px] font-black text-white leading-tight mb-1 drop-shadow-sm">
                  راحة أكبر
                </h3>
                <p className="text-xs sm:text-sm font-bold text-[#E8D4B0] mb-3 sm:mb-5 drop-shadow-xs">
                  في عملك ومنزلك
                </p>
                <Link
                  href={`/products?category=${encodeURIComponent("كراسي طبية")}`}
                  prefetch={true}
                  className="inline-flex items-center gap-2 bg-[#E8D4B0] hover:bg-[#F3E2C3] active:scale-95 text-[#2B1E16] font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-md transition-all duration-200 group/btn"
                >
                  <span>اكتشف المزيد</span>
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover/btn:-translate-x-1" />
                </Link>
              </div>

              {/* Left Side (in RTL): Chair with Glowing Halo on Wooden Podium */}
              <div className="relative w-32 h-32 sm:w-44 sm:h-44 md:w-48 md:h-48 shrink-0 flex items-center justify-center">
                <Image
                  src="/redesign/promo-chair-square.jpg"
                  alt="كرسي مريح طبي Amazon Furniture"
                  fill
                  className="object-contain object-center rounded-xl transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 150px, (max-width: 1024px) 200px, 220px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
