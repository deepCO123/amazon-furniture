"use client";

import Image from "next/image";
import Link from "next/link";
import { Camera, MapPin, Star, ArrowLeft, Building2 } from "lucide-react";

interface DeliveredPhoto {
  id: string;
  image: string;
  title: string;
  location: string;
  customer: string;
  testimonial: string;
  rating: number;
}

const deliveredPhotos: DeliveredPhoto[] = [
  {
    id: "deliv-1",
    image: "/redesign/office-team-real.jpg",
    title: "تجهيز مقر شركة استشارات — 12 محطة عمل ومكتب تنفيذي",
    location: "المنصورة — حي الجامعة",
    customer: "د/ أحمد الشربيني (رئيس مجلس الإدارة)",
    testimonial: "دقة في مواعيد التسليم وتشطيب خشب زان عالي الفخامة والكراسي مريحة جداً للموظفين.",
    rating: 5,
  },
  {
    id: "deliv-2",
    image: "/redesign/office-executive-suite.jpg",
    title: "جناح إدارة تنفيذي كامل مع قاعة اجتماعات VIP",
    location: "القاهرة — التجمع الخامس",
    customer: "م/ كريم عبد العزيز (المدير العام)",
    testimonial: "المكتب يعطي انطباعاً مبهراً لجميع عملائنا، التصميم ثلاثي الأبعاد تم تنفيذه بالمليمتر.",
    rating: 5,
  },
  {
    id: "deliv-3",
    image: "/redesign/office-meeting-lounge.jpg",
    title: "قاعة اجتماعات متكاملة وصالون انتظار جلد طبيعي",
    location: "المنصورة — شارع المشاية",
    customer: "أ/ هشام المنشاوي (مؤسسة المنشاوي)",
    testimonial: "الكراسي الهيدروليكية مريحة جداً للجلسات الطويلة وشكر خاص لفريق التركيب المحترف.",
    rating: 5,
  },
  {
    id: "deliv-4",
    image: "/redesign/delivered-curved-sofa.jpg",
    title: "منطقة استقبال وكاونتر انتظار فاخر للمراجعين",
    location: "الإسكندرية — سموحة",
    customer: "د/ نرمين الموصلي (مركز طبي تخصصي)",
    testimonial: "خامات مضادة للبقع وسهلة التنظيف، تعامل راقي وضمان حقيقي 10 سنوات.",
    rating: 5,
  },
];

export default function NewDeliveredGallerySection() {
  return (
    <section className="w-full bg-[#FAF7F2] dark:bg-[#120E0B] py-10 sm:py-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block matching reference design */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
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

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {deliveredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="group bg-white dark:bg-[#1C1612] rounded-3xl border border-[#EDE5DA] dark:border-[#38261A] overflow-hidden shadow-[0_2px_12px_rgba(31,36,33,0.04)] hover:shadow-[0_12px_32px_rgba(31,36,33,0.1)] hover:border-[#C59B63]/60 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Photo Container */}
              <div className="relative w-full h-52 sm:h-56 overflow-hidden">
                <Image
                  src={photo.image}
                  alt={photo.title}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-108"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                {/* Delivered Badge */}
                <div className="absolute top-3 right-3 bg-emerald-600/95 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <span>تم التسليم والتركيب بنجاح ✓</span>
                </div>

                {/* Location Pill Overlay on bottom */}
                <div className="absolute bottom-3 right-3 left-3 text-right">
                  <div className="inline-flex items-center gap-1.5 bg-black/65 backdrop-blur-xs px-3 py-1 rounded-full text-white text-[11px] font-medium border border-white/10">
                    <MapPin className="w-3 h-3 text-[#C59B63]" />
                    <span>{photo.location}</span>
                  </div>
                </div>
              </div>

              {/* Text Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between text-right">
                <div>
                  <h4 className="text-sm font-black text-[#1F2421] dark:text-[#F0EBE5] leading-snug line-clamp-2 mb-2 group-hover:text-[#C59B63] transition-colors">
                    {photo.title}
                  </h4>
                  <p className="text-[11px] text-[#7A6A5F] dark:text-[#A8988A] italic mb-3 line-clamp-2">
                    &ldquo;{photo.testimonial}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F5EFE7] dark:border-[#2D1F17] flex items-center justify-between text-[11px]">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(photo.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>

                  {/* Customer Name */}
                  <span className="font-bold text-[#1F2421] dark:text-[#E8D4B0]">
                    {photo.customer}
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

      </div>
    </section>
  );
}
