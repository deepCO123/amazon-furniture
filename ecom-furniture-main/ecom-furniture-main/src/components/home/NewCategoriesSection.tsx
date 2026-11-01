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
    id: "leather-chairs",
    name: "كراسي جلد",
    image: "/redesign/cat-leather-chair.png",
    href: "/products?category=" + encodeURIComponent("كراسي جلد"),
  },
  {
    id: "comfortable-chairs",
    name: "كراسي مريحة",
    image: "/redesign/cat-sofa.png",
    href: "/products?category=" + encodeURIComponent("انتريهات"),
  },
  {
    id: "desks",
    name: "مكاتب",
    image: "/redesign/cat-desk.png",
    href: "/products?category=" + encodeURIComponent("مكاتب"),
  },
  {
    id: "wardrobes",
    name: "دواليب",
    image: "/redesign/cat-wardrobe.png",
    href: "/products?category=" + encodeURIComponent("دواليب"),
  },
  {
    id: "corners",
    name: "ركن",
    image: "/redesign/cat-corner-sofa.png",
    href: "/products?category=" + encodeURIComponent("ركن"),
  },
  {
    id: "medical-chairs",
    name: "كراسي طبية",
    image: "/redesign/cat-medical-chair.png",
    href: "/products?category=" + encodeURIComponent("كراسي طبية"),
  },
];

export default function NewCategoriesSection() {
  return (
    <section className="w-full bg-[#FAF7F2] dark:bg-[#120E0B] py-6 sm:py-8">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        {/* Section Heading: —— تسوق حسب القسم —— */}
        <div className="flex items-center justify-center gap-4 mb-6 sm:mb-8">
          <div className="h-px bg-[#D6CDC2] dark:bg-[#3D2C20] w-12 sm:w-20 md:w-32" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#2B1E16] dark:text-[#F7E7CE] tracking-tight">
            تسوق حسب القسم
          </h2>
          <div className="h-px bg-[#D6CDC2] dark:bg-[#3D2C20] w-12 sm:w-20 md:w-32" />
        </div>

        {/* 6 Horizontal Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <div key={cat.id}>
              <Link
                href={cat.href}
                className="group relative flex items-center justify-between bg-white dark:bg-[#1C1612] rounded-2xl p-2.5 sm:p-3 border border-[#EDE6DD] dark:border-[#38261A] shadow-[0_2px_8px_rgba(43,30,22,0.04)] hover:shadow-[0_8px_20px_rgba(43,30,22,0.1)] hover:border-[#D4A373]/60 transition-all duration-300 h-[80px] sm:h-[86px] overflow-hidden"
              >
                {/* 1. Cutout Furniture Image on Right (Child 1 in RTL = Right Side) */}
                <div className="relative w-13 h-13 sm:w-16 sm:h-16 shrink-0 transition-transform duration-300 group-hover:scale-108">
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
                  <span className="text-xs sm:text-[13px] font-bold text-[#2B1E16] dark:text-[#F0EBE5] group-hover:text-[#9E6D38] dark:group-hover:text-[#D4A373] transition-colors line-clamp-1">
                    {cat.name}
                  </span>
                </div>

                {/* 3. Arrow Circle on Left (Child 3 in RTL = Left Side) */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F4EFEA] dark:bg-[#2B1E16] text-[#7A6B60] dark:text-[#D4A373] group-hover:bg-[#2B1E16] group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs">
                  <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
