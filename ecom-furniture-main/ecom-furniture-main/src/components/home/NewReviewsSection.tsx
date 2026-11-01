"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ArrowLeft, ArrowRight, Quote } from "lucide-react";

interface ReviewItem {
  id: string;
  name: string;
  city: string;
  text: string;
  rating: number;
  avatar: string;
}

const reviews: ReviewItem[] = [
  {
    id: "rev-1",
    name: "أحمد محمد",
    city: "من القاهرة",
    text: "منتجات رائعة وجودة عالية والتوصيل كان سريع جداً",
    rating: 5,
    avatar: "/redesign/avatar-ahmed.jpg",
  },
  {
    id: "rev-2",
    name: "سارة علي",
    city: "من الإسكندرية",
    text: "تصميم عصري وخامات ممتازة أنصح بالتعامل مع المتجر",
    rating: 5,
    avatar: "/redesign/avatar-sara.jpg",
  },
  {
    id: "rev-3",
    name: "محمد حسن",
    city: "من المنصورة",
    text: "تجربة تسوق سهلة ومريحة والخدمة ممتازة",
    rating: 5,
    avatar: "/redesign/avatar-mohamed.jpg",
  },
];

export default function NewReviewsSection() {
  const [activeDot, setActiveDot] = useState(1);

  return (
    <section className="w-full bg-[#FAF7F2] dark:bg-[#120E0B] py-8 sm:py-12">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header Block matching Image 2 */}
        <div className="flex items-center justify-between mb-4">
          {/* Right Arrow (RTL = moves backwards) */}
          <button
            type="button"
            onClick={() => setActiveDot((prev) => (prev > 0 ? prev - 1 : 2))}
            aria-label="Previous Reviews"
            className="w-9 h-9 rounded-full bg-white dark:bg-[#1E1712] border border-[#EDE5DA] dark:border-[#38261A] text-[#7A6B60] dark:text-[#D4A373] hover:bg-[#2B1E16] hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Center Title with lines */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px bg-[#D6CDC2] dark:bg-[#3D2C20] w-8 sm:w-16" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#2B1E16] dark:text-[#F7E7CE] tracking-tight">
                آراء عملائنا الكرام
              </h2>
              <div className="h-px bg-[#D6CDC2] dark:bg-[#3D2C20] w-8 sm:w-16" />
            </div>
            <p className="text-xs sm:text-sm text-[#8C7D73] dark:text-[#D4A373] mt-1 font-medium">
              ثقة عملائنا هي سر نجاحنا
            </p>
          </div>

          {/* Left Arrow (RTL = moves forwards) */}
          <button
            type="button"
            onClick={() => setActiveDot((prev) => (prev < 2 ? prev + 1 : 0))}
            aria-label="Next Reviews"
            className="w-9 h-9 rounded-full bg-white dark:bg-[#1E1712] border border-[#EDE5DA] dark:border-[#38261A] text-[#7A6B60] dark:text-[#D4A373] hover:bg-[#2B1E16] hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Review Cards Grid matching Image 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="relative bg-white dark:bg-[#1C1612] rounded-2xl p-5 sm:p-6 border border-[#EDE5DA] dark:border-[#38261A] shadow-[0_2px_12px_rgba(43,30,22,0.03)] hover:shadow-[0_8px_24px_rgba(43,30,22,0.06)] hover:border-[#D4A373]/50 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Card Top Row: Quote mark on right, stars on left */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#FAF4ED] dark:bg-[#2B1E16] flex items-center justify-center text-[#B07836]">
                  <Quote className="w-4 h-4" />
                </div>

                <div className="flex items-center gap-1">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]"
                    />
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <p className="text-xs sm:text-sm text-[#423630] dark:text-[#E8DDD5] font-medium leading-relaxed mb-6 text-right">
                {rev.text}
              </p>

              {/* Author Info Row: Avatar + Name & City */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F5EFE7] dark:border-[#2D1F17]">
                <div className="text-right">
                  <h4 className="text-xs sm:text-sm font-bold text-[#2B1E16] dark:text-white">
                    {rev.name}
                  </h4>
                  <p className="text-[11px] text-[#8C7D73] dark:text-[#A8988A]">
                    {rev.city}
                  </p>
                </div>
                <div className="relative w-11 h-11 rounded-full overflow-hidden border border-[#D4A373]/40 shrink-0 bg-[#F4EFEA]">
                  <Image
                    src={rev.avatar}
                    alt={rev.name}
                    fill
                    className="object-cover"
                    sizes="44px"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {[0, 1, 2, 3].map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveDot(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                activeDot === idx
                  ? "w-6 h-2 bg-[#7A4B22] dark:bg-[#D4A373]"
                  : "w-2 h-2 bg-[#D6CDC2] dark:bg-[#3D2C20]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
