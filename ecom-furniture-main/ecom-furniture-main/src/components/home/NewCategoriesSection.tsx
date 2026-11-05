"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  image: string;
  href: string;
}

const categories: CategoryItem[] = [
  {
    id: "shoeracks",
    name: "جزامات",
    image: "/redesign/cat-shoerack.png",
    href: "/products?category=" + encodeURIComponent("جزامات"),
  },
  {
    id: "desks",
    name: "مكاتب",
    image: "/redesign/cat-desk.png",
    href: "/products?category=" + encodeURIComponent("مكاتب"),
  },
  {
    id: "leather-chairs",
    name: "كراسي جلد",
    image: "/redesign/cat-leather-chair.png",
    href: "/products?category=" + encodeURIComponent("كراسي جلد"),
  },
  {
    id: "medical-chairs",
    name: "كراسي طبية",
    image: "/redesign/cat-medical-chair.png",
    href: "/products?category=" + encodeURIComponent("كراسي طبية"),
  },
  {
    id: "reception-desks",
    name: "مكاتب استقبال",
    image: "/delivered/delivered-reception-cnc-islamic.jpg",
    href: "/products?category=" + encodeURIComponent("مكاتب استقبال"),
  },
  {
    id: "storage-drawers",
    name: "وحدات أدراج وتخزين",
    image: "/products/desks/desk-black-double-pedestal-10drawers.jpg",
    href: "/products?category=" + encodeURIComponent("وحدات ادراج تخزين"),
  },
  {
    id: "bar-stools",
    name: "كراسي بار",
    image: "/uploads/gl135-high-black-front.jpg",
    href: "/products?category=" + encodeURIComponent("كراسي بار"),
  },
  {
    id: "office-blinds",
    name: "ستائر مكتبية",
    image: "/redesign/cat-corner-sofa.png",
    href: "/products?category=" + encodeURIComponent("ستائر مكتبية"),
  },
  {
    id: "coffee-corner",
    name: "كوفي كورنر",
    image: "/redesign/cat-coffee-corner.png",
    href: "/products?category=" + encodeURIComponent("كوفي كورنر"),
  },
  {
    id: "reception-sofas",
    name: "انتريهات",
    image: "/redesign/cat-sofa.png",
    href: "/products?category=" + encodeURIComponent("انتريهات"),
  },
];

function CategoryCard({ cat }: { cat: CategoryItem }) {
  return (
    <div dir="rtl" className="w-[200px] sm:w-[225px] shrink-0">
      <Link
        href={cat.href}
        className="group relative flex items-center justify-between bg-white dark:bg-[#1C1612] rounded-2xl p-2.5 sm:p-3 border border-[#EDE6DD] dark:border-[#38261A] shadow-[0_2px_8px_rgba(43,30,22,0.04)] hover:shadow-[0_10px_24px_rgba(43,30,22,0.12)] hover:border-[#D4A373]/80 hover:-translate-y-1 transition-all duration-300 h-[80px] sm:h-[86px] overflow-hidden"
      >
        {/* 1. Cutout Furniture Image on Right (Child 1 in RTL = Right Side) */}
        <div className="relative w-13 h-13 sm:w-16 sm:h-16 shrink-0 transition-transform duration-300 group-hover:scale-110 flex items-center justify-center">
          <Image
            src={cat.image}
            alt={cat.name}
            fill
            className="object-contain object-center"
            sizes="64px"
          />
        </div>

        {/* 2. Category Name in Center */}
        <div className="flex-1 text-center px-1">
          <span className="text-xs sm:text-[13px] font-bold text-[#2B1E16] dark:text-[#F0EBE5] group-hover:text-[#9E6D38] dark:group-hover:text-[#D4A373] transition-colors line-clamp-1 block">
            {cat.name}
          </span>
        </div>

        {/* 3. Arrow Circle on Left (Child 3 in RTL = Left Side) */}
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F4EFEA] dark:bg-[#2B1E16] text-[#7A6B60] dark:text-[#D4A373] group-hover:bg-[#2B1E16] dark:group-hover:bg-[#C59B63] group-hover:text-white dark:group-hover:text-[#120E0B] flex items-center justify-center shrink-0 transition-all duration-300 shadow-2xs">
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        </div>
      </Link>
    </div>
  );
}

export default function NewCategoriesSection() {
  return (
    <section className="w-full bg-[#FAF7F2] dark:bg-[#120E0B] py-6 sm:py-8 overflow-hidden select-none">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        {/* Section Heading: —— تسوق حسب القسم —— */}
        <div className="flex items-center justify-center gap-4 mb-5 sm:mb-7">
          <div className="h-px bg-[#D6CDC2] dark:bg-[#3D2C20] w-12 sm:w-20 md:w-32" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#2B1E16] dark:text-[#F7E7CE] tracking-tight">
            تسوق حسب القسم
          </h2>
          <div className="h-px bg-[#D6CDC2] dark:bg-[#3D2C20] w-12 sm:w-20 md:w-32" />
        </div>

        {/* ── Seamless Multi-Track Endless Marquee: Zero Gaps / Pause on Hover ── */}
        <div className="relative w-full overflow-hidden py-1 group/marquee">
          {/* Subtle lateral gradient masks to blend cleanly with background */}
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 md:w-24 bg-gradient-to-l from-[#FAF7F2] dark:from-[#120E0B] to-transparent z-10 pointer-events-none" />
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 md:w-24 bg-gradient-to-r from-[#FAF7F2] dark:from-[#120E0B] to-transparent z-10 pointer-events-none" />

          {/* Continuous multi-track flex container: strictly LTR so tracks sit side by side */}
          <div
            dir="ltr"
            className="flex items-center gap-4 w-full"
          >
            {/* Track 1 */}
            <div className="flex shrink-0 items-center gap-4 animate-category-marquee">
              {categories.map((cat) => (
                <CategoryCard key={`t1-${cat.id}`} cat={cat} />
              ))}
            </div>

            {/* Track 2 (Immediately follows Track 1 seamlessly) */}
            <div
              className="flex shrink-0 items-center gap-4 animate-category-marquee"
              aria-hidden="true"
            >
              {categories.map((cat) => (
                <CategoryCard key={`t2-${cat.id}`} cat={cat} />
              ))}
            </div>

            {/* Track 3 (Guarantees zero gap even on 4K ultra-wide monitors) */}
            <div
              className="flex shrink-0 items-center gap-4 animate-category-marquee"
              aria-hidden="true"
            >
              {categories.map((cat) => (
                <CategoryCard key={`t3-${cat.id}`} cat={cat} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
