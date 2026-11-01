"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Truck, ShieldCheck, Headphones, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

interface HeroSlide {
  id: string;
  image: string;
  badge: string;
  title1: string;
  title2: string;
  subtitle: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
}

const heroSlides: HeroSlide[] = [
  {
    id: "executive-office",
    image: "/redesign/office-executive-suite.jpg",
    badge: "🏢 تجهيز الشركات والمقرات التنفيذية",
    title1: "نصمم بيئة عمل تلهم الإنجاز",
    title2: "حلول أثاث مكتبي متكاملة للشركات والمديرين",
    subtitle: "تجهيز وتنفيذ أرقى المكاتب التنفيذية، كراسي شبك طبية هيدروليكية، ومحطات عمل كبرى بأرقى المعايير الهندسية مع ضمان 10 سنوات.",
    primaryCtaText: "اطلب معاينة مجانية",
    primaryCtaLink: "#consultation",
    secondaryCtaText: "تسوق كراسي ومكاتب المديرين",
    secondaryCtaLink: `/products?category=${encodeURIComponent("مكاتب")}`,
  },
  {
    id: "luxury-living",
    image: "/redesign/hero-living-room-clean.jpg",
    badge: "أثاث عصري بجودة عالية وتفصيل خاص",
    title1: "أقوى عروض وتخفيضات",
    title2: "أثاث لمنزلك ومكتبك الفاخر",
    subtitle: "تصميمات عصرية تناسب جميع الأذواق مع أفضل الأسعار وضمان معتمد 10 سنوات على كافة المنتجات.",
    primaryCtaText: "تسوق العروض الآن",
    primaryCtaLink: "/products",
    secondaryCtaText: "استكشف تشكيلة 2026",
    secondaryCtaLink: "/products?tag=sale",
  },
];

export default function NewHeroSection() {
  const [current, setCurrent] = useState(0);

  // Auto-advance slides every 6.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroSlides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  const slide = heroSlides[current];

  return (
    <section className="relative w-full overflow-hidden bg-[#FAF7F2] dark:bg-[#120E0B]">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5">
        {/* Main Banner Container */}
        <div className="relative rounded-3xl overflow-hidden min-h-[380px] sm:min-h-[440px] md:min-h-[480px] lg:min-h-[520px] shadow-sm border border-[#EBE2D7] dark:border-[#33251C]">
          {/* Background Images with smooth fade */}
          {heroSlides.map((s, idx) => (
            <div
              key={s.id}
              className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${
                idx === current ? "opacity-100 scale-100" : "opacity-0 pointer-events-none scale-105"
              }`}
            >
              <Image
                src={s.image}
                alt={s.title1}
                fill
                priority={idx === 0}
                className="object-cover object-center"
                sizes="(max-width: 1440px) 100vw, 1440px"
              />

            </div>
          ))}

          {/* Banner Inner Content */}
          <div className="relative z-10 w-full h-full min-h-[380px] sm:min-h-[440px] md:min-h-[480px] lg:min-h-[520px] flex flex-col justify-between p-4 sm:p-7 lg:p-10">
            {/* Top / Main Row: In RTL, child 1 is on the RIGHT, child 2 is on the LEFT */}
            <div className="flex flex-col lg:flex-row items-center lg:items-center justify-between gap-6 w-full my-auto">
              {/* 1. RIGHT SIDE: Arabic Typography & Dual CTAs inside Glassmorphism Card */}
              <div className="w-full lg:max-w-2xl text-right flex flex-col items-start order-1 bg-[#1F2421]/80 backdrop-blur-md rounded-2xl p-5 sm:p-7 lg:p-8 border border-white/15 shadow-2xl">
                {/* Top Badge: Warm Amber Gold with Icon */}
                <div className="inline-flex items-center gap-2 bg-[#C59B63]/25 backdrop-blur-xs text-[#F5DEB3] text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full border border-[#C59B63]/50 mb-3 sm:mb-4 shadow-sm animate-fade-in">
                  <Sparkles className="w-3.5 h-3.5 text-[#C59B63]" />
                  <span>{slide.badge}</span>
                </div>

                {/* Main Heading */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black text-white leading-[1.25] tracking-tight mb-2 sm:mb-3 drop-shadow-md">
                  <span className="block">{slide.title1}</span>
                  <span className="block text-[#E8D4B0] text-xl sm:text-2xl md:text-3xl lg:text-[34px] font-bold mt-1">
                    {slide.title2}
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm md:text-base text-white/90 font-medium max-w-xl mb-5 sm:mb-6 leading-relaxed drop-shadow-xs">
                  {slide.subtitle}
                </p>

                {/* Dual CTA Buttons Group */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  {/* Primary CTA Button: Amber Gold #C59B63 */}
                  <Link
                    href={slide.primaryCtaLink}
                    prefetch={true}
                    className="inline-flex items-center justify-center gap-2.5 bg-[#C59B63] hover:bg-[#D4A373] active:scale-95 text-[#1F2421] font-black text-xs sm:text-sm px-6 sm:px-8 py-3 sm:py-3.5 rounded-full shadow-lg transition-all duration-200 group flex-1 sm:flex-initial"
                  >
                    <span>{slide.primaryCtaText}</span>
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  </Link>

                  {/* Secondary CTA Button: Clean White Glass Pill */}
                  <Link
                    href={slide.secondaryCtaLink}
                    prefetch={true}
                    className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/25 font-bold text-xs sm:text-sm px-5 sm:px-6 py-3 sm:py-3.5 rounded-full shadow-sm backdrop-blur-xs transition-all duration-200 flex-1 sm:flex-initial"
                  >
                    <span>{slide.secondaryCtaText}</span>
                  </Link>
                </div>
              </div>

              {/* 2. LEFT SIDE: Frosted Glassmorphism Trust Box (Child 2 in RTL = Left Side) */}
              <div className="hidden md:flex flex-col gap-4 bg-white/20 backdrop-blur-md rounded-2xl p-5 border border-white/35 text-white shadow-xl max-w-[210px] order-2">
                {/* Item 1: Shipping */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/25 flex items-center justify-center shrink-0 border border-white/40">
                    <Truck className="w-5 h-5 text-white" strokeWidth={1.8} />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold leading-tight">شحن سريع</div>
                    <div className="text-[10px] text-white/85">لكل المحافظات</div>
                  </div>
                </div>

                {/* Item 2: Secure Payment */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/25 flex items-center justify-center shrink-0 border border-white/40">
                    <ShieldCheck className="w-5 h-5 text-white" strokeWidth={1.8} />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold leading-tight">دفع آمن</div>
                    <div className="text-[10px] text-white/85">ومتعدد الطرق</div>
                  </div>
                </div>

                {/* Item 3: Support */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/25 flex items-center justify-center shrink-0 border border-white/40">
                    <Headphones className="w-5 h-5 text-white" strokeWidth={1.8} />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold leading-tight">دعم فني</div>
                    <div className="text-[10px] text-white/85">24/7</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Controls Row: Dots in Center, Arrows on Left */}
            <div className="flex items-center justify-between w-full pt-4">
              {/* Left Arrows */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous Slide"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/45 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-all cursor-pointer active:scale-90"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next Slide"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/45 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-all cursor-pointer active:scale-90"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Slider Dots */}
              <div className="flex items-center gap-2 mx-auto">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrent(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      current === idx
                        ? "w-8 h-2.5 bg-white shadow-sm"
                        : "w-2.5 h-2.5 bg-white/45 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>

              <div className="w-20 hidden sm:block" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
