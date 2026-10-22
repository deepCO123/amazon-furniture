"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, CheckCircle, SlidersHorizontal, ChevronDown } from "lucide-react";

export default function SofaZoneCustomerReviews() {
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const reviews = [
    {
      id: "1",
      customerName: "Sara A.",
      date: "2026/02/14",
      rating: 5,
      comment: "الكرسي الطبي GL-135 وصل في ميعاده ومظبوط زي الصورة بالظبط! مسند الرأس والدعم القطني مريحين جداً لفقرات الظهر وخصوصاً لشغل البرمجة بالساعات.",
      deliveredImage: "/uploads/gl135-high-real-front.jpg",
      productName: "كرسي طبي شبك GL-135 High",
      productThumb: "/uploads/gl135-high-blue-front.jpg",
    },
    {
      id: "2",
      customerName: "م. نهى كمال",
      date: "2026/01/28",
      rating: 5,
      comment: "شكراً أمازون فرنتشر على التعامل الراقي والمصداقية.. من أول استفساري على الواتساب لحد التسليم في الميعاد. التغليف ممتاز وخشب المكتب والكرسي متين وتقفيل نظيف جداً.",
      deliveredImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
      productName: "مكتب وتنفيذي مودرن + كرسي مدير جلد",
      productThumb: "/uploads/gl135-sofa-black-diamond.jpg",
    },
    {
      id: "3",
      customerName: "أ. سمر سامي",
      date: "2026/01/15",
      rating: 5,
      comment: "الانتريه وخامة القماش ممتازة جداً وتنجيد إسفنج كثافة 36 مريح لأقصى درجة. تجربة أنصح بيها كل اللي بيدور على أثاث يعيش بضمان حقيقي 10 سنوات.",
      deliveredImage: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800",
      productName: "طقم انتريه واستقبال مكاتب ومنازل",
      productThumb: "/uploads/gl135-armchair-grey.jpg",
    },
    {
      id: "4",
      customerName: "د. طارق الحسين",
      date: "2025/12/20",
      rating: 5,
      comment: "كراسي الانتظار والستائر المكتبية فرقت جداً في شكل العيادة والاستقبال. خامات ممتازة وتركيب سريع بالمنصورة وبدون أي تعب.",
      deliveredImage: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800",
      productName: "ستائر مكتبية رول + كراسي شبك",
      productThumb: "/uploads/gl135-showroom-chair-04.jpg",
    },
  ];

  const filteredReviews = filterRating
    ? reviews.filter((r) => r.rating === filterRating)
    : reviews;

  return (
    <section className="py-14 bg-[#F8F5F0] dark:bg-[#0B0E14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── Top Reviews Banner ───────────────────────── */}
        <div className="relative rounded-3xl overflow-hidden bg-[#6B4F3A] text-white py-12 px-6 text-center mb-8 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-[#573E2D]/70 via-transparent to-[#6B4F3A]/70 pointer-events-none" />

          {/* Signature Reviews Graphic Bubble */}
          <div className="inline-block relative mb-3">
            <div className="bg-[#573E2D] text-white font-black text-2xl sm:text-4xl px-10 py-3 rounded-2xl shadow-2xl border-2 border-[#C58B45] tracking-wider transform -rotate-1">
              Reviews 💬
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-[#C58B45] mt-2">
            صور حقيقية وتجارب عملاء موثقة بعد الاستلام والتجربة
          </h3>
          <p className="text-xs sm:text-sm text-[#E8D8C3] font-bold mt-1">
            نفخر بثقة أكثر من 15,000 عميل في كافة محافظات مصر
          </p>
        </div>

        {/* ── Rating Stats & Filter Header Bar ─────────────────────────── */}
        <div className="flex items-center justify-between pb-4 mb-8 border-b border-[#E8E0D5] dark:border-[#232B3C]">
          <div className="flex items-center gap-2">
            <div className="flex items-center text-[#C58B45]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill="currentColor" />
              ))}
            </div>
            <span className="text-sm font-black text-[#292321] dark:text-[#F5F6F8]">
              72 تقييماً معتمداً
            </span>
            <ChevronDown size={14} className="text-[#74685E] dark:text-[#9DA8B9]" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterRating(filterRating ? null : 5)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                filterRating === 5
                  ? "bg-[#6B4F3A] dark:bg-[#C58B45] text-white border-[#6B4F3A] dark:border-[#C58B45]"
                  : "bg-white dark:bg-[#1A2230] text-[#74685E] dark:text-gray-200 border-[#E8E0D5] dark:border-[#2D3748] hover:bg-white/80 dark:hover:bg-[#232B3C]"
              }`}
            >
              <SlidersHorizontal size={13} />
              <span>{filterRating ? "عرض الكل" : "تقييمات 5 نجوم"}</span>
            </button>
          </div>
        </div>

        {/* ── Real Customer Reviews Cards Grid ─────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredReviews.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-[#151A24] rounded-2xl border border-[#E8E0D5] dark:border-[#232B3C] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Real Delivered Customer Photo */}
              <div className="relative aspect-[4/3] bg-gray-100 dark:bg-[#1C2230] overflow-hidden">
                <Image
                  src={r.deliveredImage}
                  alt={`صورة حقيقية من منزل أو مكتب ${r.customerName}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, 25vw"
                />
              </div>

              {/* Review Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  {/* Verified Buyer & Date */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1 text-xs font-black text-[#292321] dark:text-[#F5F6F8]">
                      <span>{r.customerName}</span>
                      <CheckCircle size={13} className="text-emerald-600 fill-emerald-100" />
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded">
                        مشتري موثق
                      </span>
                    </div>
                    <span className="text-[10px] text-[#74685E] dark:text-[#8D98AA] font-mono">{r.date}</span>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center text-[#C58B45] gap-0.5 mb-2.5">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} size={13} fill="currentColor" />
                    ))}
                  </div>

                  {/* Customer Comment */}
                  <p className="text-xs text-[#292321] dark:text-[#D1D7E0] leading-relaxed font-medium mb-3">
                    &ldquo;{r.comment}&rdquo;
                  </p>
                </div>

                {/* Product Thumbnail at Bottom */}
                <div className="pt-2.5 border-t border-[#E8E0D5] dark:border-[#232B3C] flex items-center justify-between gap-2 bg-[#F8F5F0]/60 dark:bg-[#11151F] -mx-4 -mb-4 p-3 rounded-b-2xl">
                  <span className="text-[11px] font-bold text-[#74685E] dark:text-[#A7B0C0] truncate">
                    {r.productName}
                  </span>
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white dark:bg-[#1A2230] border border-[#E8E0D5] dark:border-[#2D3748] shrink-0">
                    <Image
                      src={r.productThumb}
                      alt={r.productName}
                      fill
                      className="object-contain p-0.5"
                      sizes="32px"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
