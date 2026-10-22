"use client";

import Link from "next/link";
import Image from "next/image";

interface CategoryItem {
  id: string;
  name: string;
  image: string;
  href: string;
}

const row1Categories: CategoryItem[] = [
  {
    id: "tv-table",
    name: "ترابيزة شاشة",
    image: "/categories/tv-table.png",
    href: "/products?category=ترابيزة تليفزيون",
  },
  {
    id: "coffee-table",
    name: "ترابيزة قهوة",
    image: "/categories/coffee-table.png",
    href: "/products?category=ترابيزات",
  },
  {
    id: "vanity",
    name: "تسريحه",
    image: "/categories/vanity.png",
    href: "/products?category=تسريحه",
  },
  {
    id: "shoe-rack",
    name: "جزامات",
    image: "/categories/shoe-rack.png",
    href: "/products?category=جزامات",
  },
  {
    id: "wardrobe",
    name: "دولاب",
    image: "/categories/wardrobe.png",
    href: "/products?category=دولاب",
  },
  {
    id: "corner-sofa",
    name: "ركن",
    image: "/categories/corner-sofa.png",
    href: "/products?category=ركن",
  },
];

const row2Categories: CategoryItem[] = [
  {
    id: "living-set",
    name: "غرف أنتريه",
    image: "/categories/living-set.png",
    href: "/products?category=انتريهات",
  },
  {
    id: "beds",
    name: "سراير",
    image: "/categories/beds.png",
    href: "/products?category=سراير",
  },
  {
    id: "chairs",
    name: "كراسي",
    image: "/categories/chairs.png",
    href: "/products?category=كراسي",
  },
  {
    id: "coffee-corner",
    name: "كوفي كورنر",
    image: "/categories/coffee-corner.png",
    href: "/products?category=كوفي كورنر",
  },
  {
    id: "lazy-boy",
    name: "ليزي بوي",
    image: "/categories/lazy-boy.png",
    href: "/products?category=ليزي بوي",
  },
];

export default function SofaZoneCategoryGrid() {
  return (
    <section className="py-10 bg-[#F8F5F0] dark:bg-[#0B0E14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Section Header with Exact Oval Ring Badge from Image 1 ────────── */}
        <div className="text-center mb-8 flex justify-center">
          <div className="relative inline-flex items-center justify-center px-10 sm:px-14 py-2 sm:py-2.5">
            {/* Smooth elliptical golden loop */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
              viewBox="0 0 240 50"
              fill="none"
              preserveAspectRatio="none"
            >
              <ellipse
                cx="120"
                cy="25"
                rx="115"
                ry="21"
                stroke="#C58B45"
                strokeWidth="2.5"
              />
            </svg>
            <h2 className="text-2xl sm:text-3xl font-black text-[#6B4F3A] dark:text-[#E8D4B0] tracking-tight relative z-10 px-4">
              تسوق حسب القسم
            </h2>
          </div>
        </div>

        {/* ── Outer White Unified Grid Container (Image 1 Style) ─────────────── */}
        <div className="bg-white dark:bg-[#121620] rounded-2xl border border-[#E5E7EB] dark:border-[#232B3C] shadow-sm overflow-hidden">
          {/* Row 1: 6 Category Cells */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-b border-[#E5E7EB] dark:border-[#232B3C] divide-x divide-x-reverse divide-[#E5E7EB] dark:divide-[#232B3C]">
            {row1Categories.map((cat) => (
              <Link
                key={cat.id}
                href={cat.href}
                className="group flex flex-col items-center justify-between p-4 sm:p-5 hover:bg-[#FDFBF9] dark:hover:bg-[#181E2B] transition-all duration-200 text-center"
              >
                {/* Product cutout image with natural drop shadow */}
                <div className="relative w-full h-28 sm:h-36 flex items-center justify-center my-auto">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    width={160}
                    height={160}
                    className="max-h-full max-w-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.08)] group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                {/* Category Label */}
                <span className="text-xs sm:text-sm font-bold text-[#292321] dark:text-[#F5F6F8] group-hover:text-[#C58B45] transition-colors mt-3">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>

          {/* Row 2: 5 Category Cells (غرف النوم removed as requested) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-x-reverse divide-[#E5E7EB] dark:divide-[#232B3C]">
            {row2Categories.map((cat) => (
              <Link
                key={cat.id}
                href={cat.href}
                className="group flex flex-col items-center justify-between p-4 sm:p-5 hover:bg-[#FDFBF9] dark:hover:bg-[#181E2B] transition-all duration-200 text-center"
              >
                {/* Product cutout image with natural drop shadow */}
                <div className="relative w-full h-28 sm:h-36 flex items-center justify-center my-auto">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    width={160}
                    height={160}
                    className="max-h-full max-w-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.08)] group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                {/* Category Label */}
                <span className="text-xs sm:text-sm font-bold text-[#292321] dark:text-[#F5F6F8] group-hover:text-[#C58B45] transition-colors mt-3">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
