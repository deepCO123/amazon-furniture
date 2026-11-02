"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, MapPin, Star, ArrowLeft, Building2, Play, X } from "lucide-react";

interface DeliveredItem {
  id: string;
  type?: "image" | "video";
  mediaUrl: string;
  poster?: string;
  title: string;
  location: string;
  customer: string;
  testimonial: string;
  rating: number;
  badge?: string;
}

const deliveredItems: DeliveredItem[] = [
  {
    id: "deliv-1",
    type: "image",
    mediaUrl: "/delivered/delivered-reception-cnc-islamic.jpg",
    title: "كاونتر استقبال واستعلامات فاخر بواجهة زخارف إسلامية CNC",
    location: "المنصورة — مجمع عيادات ومقر إداري",
    customer: "د/ أحمد عبد الهادي",
    testimonial: "دقة لا متناهية في تفريغ الـ CNC والتشطيب، الكاونتر لفت أنظار جميع المراجعين والزوار من أول يوم افتتاح.",
    rating: 5,
    badge: "كاونتر استقبال CNC",
  },
  {
    id: "deliv-2",
    type: "image",
    mediaUrl: "/delivered/delivered-executive-walnut-desk.jpg",
    title: "تجهيز مكتب إدارة تنفيذي خشب جوزي إسباني مع وحدة أدراج سنترال",
    location: "القاهرة — التجمع الخامس",
    customer: "م/ شريف عثمان (مقر شركة مقاولات)",
    testimonial: "متانة الخشب وتقفيل الحواف ممتازة، ومطابقة تامة للمقاسات المطلوبة في صالة العرض والمقر.",
    rating: 5,
    badge: "مكتب إدارة تنفيذي",
  },
  {
    id: "deliv-3",
    type: "image",
    mediaUrl: "/delivered/delivered-white-compact-desk-chair.jpg",
    title: "محطة عمل موظفين بيضاء سمارت مع كرسي طبي شبك هيدروليك",
    location: "المنصورة — شارع المشاية",
    customer: "أ/ مروان الجمال (شركة تسويق وتطوير)",
    testimonial: "الكرسي مريح جداً لساعات العمل الطويلة، والمكتب الأبيض استغل مساحة الغرفة بأفضل شكل ممكن.",
    rating: 5,
    badge: "محطة عمل + كرسي طبي",
  },
  {
    id: "deliv-4",
    type: "image",
    mediaUrl: "/delivered/delivered-employee-lockers-9doors.jpg",
    title: "دولاب لوكر أمانات موظفين 9 عيون مع أقفال ومفاتيح أمان مستقلة",
    location: "دمياط — المنطقة الصناعية",
    customer: "م/ طارق الحديدي (مؤسسة صناعية)",
    testimonial: "قوة ومتانة عالية جداً للدهان الإلكتروستاتيك والأقفال سلسة ومحكمة. تسليم في الوقت المحدد بالضبط.",
    rating: 5,
    badge: "لوكر أمانات 9 عيون",
  },
  {
    id: "deliv-5",
    type: "image",
    mediaUrl: "/delivered/delivered-custom-vanity-desk-mirror.jpg",
    title: "مكتب تفصيل متعدد الاستخدامات بمرآة هيدروليك مخفية ووحدة أدراج",
    location: "المنصورة — حي توريل",
    customer: "د/ ميادة السعيد (عيادة تجميل وتغذية)",
    testimonial: "فكرة المرآة الهيدروليكية المخفية داخل سطح المكتب عبقرية وفرت مساحة كبيرة وعملية جداً في الاستخدام.",
    rating: 5,
    badge: "تصميم مخصص بالبستم",
  },
];

export default function NewDeliveredGallerySection() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  return (
    <section className="w-full bg-[#FAF7F2] dark:bg-[#120E0B] py-10 sm:py-16 transition-colors duration-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block matching user requirement */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-[#251A13] border border-[#E8DEC8] dark:border-[#38261A] text-[#C59B63] dark:text-[#E8D4B0] text-xs font-bold px-4 py-1.5 rounded-full mb-3 shadow-2xs">
            <Building2 className="w-3.5 h-3.5" />
            <span>سابقة أعمالنا وتجهيزات المقرات والشركات</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="h-px bg-[#D6CDC2] dark:bg-[#3D2C20] w-12 sm:w-20" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1F2421] dark:text-[#FAF4ED] tracking-tight">
              سلّمنا في كبرى الشركات والمكاتب
            </h2>
            <div className="h-px bg-[#D6CDC2] dark:bg-[#3D2C20] w-12 sm:w-20" />
          </div>

          <p className="text-xs sm:text-sm text-[#7A6A5F] dark:text-[#A8988A] mt-2.5 font-medium leading-relaxed">
            لقطات واقعية بعد التركيب في مقرات شركاء نجاحنا بالمنصورة والقاهرة وجميع المحافظات
          </p>
        </div>

        {/* 5 Cards Grid (Responsive & Balanced) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
          {deliveredItems.map((item) => (
            <div
              key={item.id}
              className="group bg-white dark:bg-[#1C1612] rounded-3xl border border-[#EDE5DA] dark:border-[#38261A] overflow-hidden shadow-[0_2px_12px_rgba(31,36,33,0.04)] hover:shadow-[0_12px_32px_rgba(31,36,33,0.1)] hover:border-[#C59B63]/60 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Media Container */}
              <div className="relative w-full h-56 sm:h-64 overflow-hidden bg-slate-900/10">
                {item.type === "video" ? (
                  <div
                    className="relative w-full h-full cursor-pointer"
                    onClick={() => setSelectedVideo(item.mediaUrl)}
                  >
                    <Image
                      src={item.poster || "/redesign/showroom-facade.jpg"}
                      alt={item.title}
                      fill
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-108"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/90 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={item.mediaUrl}
                    alt={item.title}
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-108"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                {/* Delivered Badge */}
                <div className="absolute top-3 right-3 bg-emerald-600/95 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <span>تم التسليم بنجاح ✓</span>
                </div>

                {/* Optional category badge on top left */}
                {item.badge && (
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-md border border-white/15">
                    {item.badge}
                  </div>
                )}

                {/* Location Pill Overlay on bottom */}
                <div className="absolute bottom-3 right-3 left-3 text-right">
                  <div className="inline-flex items-center gap-1.5 bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-full text-white text-[10px] sm:text-[11px] font-medium border border-white/10 max-w-full">
                    <MapPin className="w-3 h-3 text-[#C59B63] shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                </div>
              </div>

              {/* Text Body */}
              <div className="p-4 sm:p-4.5 flex-1 flex flex-col justify-between text-right">
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-[#1F2421] dark:text-[#F0EBE5] leading-snug line-clamp-2 mb-2 group-hover:text-[#C59B63] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#7A6A5F] dark:text-[#A8988A] italic mb-3 line-clamp-3 leading-relaxed">
                    &ldquo;{item.testimonial}&rdquo;
                  </p>
                </div>

                <div className="pt-2.5 border-t border-[#F5EFE7] dark:border-[#2D1F17] flex items-center justify-between text-[11px]">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>

                  {/* Customer Name */}
                  <span className="font-bold text-[#1F2421] dark:text-[#E8D4B0] text-[11px] truncate max-w-[140px]">
                    {item.customer}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Button */}
        <div className="mt-8 sm:mt-12 text-center">
          <Link
            href="#consultation"
            className="inline-flex items-center gap-2 bg-[#1F2421] hover:bg-[#C59B63] active:scale-95 text-white font-bold text-xs sm:text-sm px-7 sm:px-9 py-3 sm:py-3.5 rounded-full shadow-md transition-all duration-200 group"
          >
            <span>تريد تجهيز مكتب أو مقر شركتك؟ احجز استشارة ومعاينة مجانية</span>
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          </Link>
        </div>

        {/* Video Modal if active */}
        {selectedVideo && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative w-full max-w-3xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-3 left-3 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <video
                src={selectedVideo}
                controls
                autoPlay
                className="w-full h-auto max-h-[80vh]"
              />
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
