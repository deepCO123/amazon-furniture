"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Truck, ShieldCheck, Headphones, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

interface HeroSlide {
  id: string;
  image: string;
  badge: string;
  title: string;
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
    badge: "✨ حلول أثاث مكتبي وتنفيذي متكاملة للشركات والمديرين",
    title: "نصمم بيئة عمل تلهم الإنجاز والفخامة",
    subtitle: "تجهيز وتنفيذ أرقى المكاتب التنفيذية، كراسي جلد طبيعي فاخرة، وشبكات طبية إرجونوميك بأعلى المعايير الهندسية مع ضمان 10 سنوات.",
    primaryCtaText: "تسوق كراسي ومكاتب المديرين",
    primaryCtaLink: `/products?category=${encodeURIComponent("مكاتب")}`,
    secondaryCtaText: "اطلب معاينة وتصميم 3D",
    secondaryCtaLink: "#consultation",
  },
  {
    id: "modern-workstations",
    image: "/redesign/office-meeting-lounge.jpg",
    badge: "🏢 قاعات اجتماعات ومحطات عمل ذكية",
    title: "فخامة وأناقة عصرية تليق بنجاحك",
    subtitle: "مكاتب تنفيذية، قاعات اجتماعات مجهزة، وكراسي هيدروليكية معتمدة تدعم الإنتاجية وتمنحك بيئة عمل متكاملة.",
    primaryCtaText: "استكشف الكراسي الطبية والشبك",
    primaryCtaLink: `/products?category=${encodeURIComponent("كراسي طبية")}`,
    secondaryCtaText: "تصفح جميع العروض",
    secondaryCtaLink: "/products",
  },
];

export default function NewHeroSection() {
  const [current, setCurrent] = useState(0);

  // Auto-advance slides every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  const slide = heroSlides[current];

  return (
    <section className="relative w-full overflow-hidden bg-[#FAF7F2] dark:bg-[#120E0B]">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5">
        {/* Main Banner Container */}
        <div className="relative rounded-3xl overflow-hidden min-h-[420px] sm:min-h-[460px] md:min-h-[500px] lg:min-h-[540px] shadow-sm border border-[#EBE2D7] dark:border-[#33251C]">
          {/* Background Images: Corporate Executive Office Interiors */}
          {heroSlides.map((s, idx) => (
            <div
              key={s.id}
              className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${
                idx === current ? "opacity-100 scale-100" : "opacity-0 pointer-events-none scale-105"
              }`}
            >
              <Image
                src={s.image}
                alt={s.title}
                fill
                priority={idx === 0}
                className="object-cover object-center"
                sizes="(max-width: 1440px) 100vw, 1440px"
              />
              {/* Natural Smooth Vignette: High contrast for RTL text without any box */}
              <div className="absolute inset-0 bg-gradient-to-l from-black/85 via-black/45 to-transparent pointer-events-none" />
            </div>
          ))}

          {/* Banner Inner Content */}
          <div className="relative z-10 w-full h-full min-h-[420px] sm:min-h-[460px] md:min-h-[500px] lg:min-h-[540px] flex flex-col justify-between p-5 sm:p-8 lg:p-12">
            {/* Top / Main Row: In RTL, child 1 is on the RIGHT, child 2 is on the LEFT */}
            <div className="flex flex-col lg:flex-row items-center lg:items-center justify-between gap-6 w-full my-auto">
              {/* 1. RIGHT SIDE: Clean Floating Typography (NO BOX CONTAINER) */}
              <div className="w-full lg:max-w-2xl text-right flex flex-col items-start order-1">
                {/* Top Badge: Pill badge with subtle gold accent */}
                <div className="inline-flex items-center gap-2 bg-[#C59B63]/25 backdrop-blur-sm text-[#F5DEB3] text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full border border-[#C59B63]/50 mb-3 sm:mb-4 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-[#C59B63]" />
                  <span>{slide.badge}</span>
                </div>

                {/* Main Headline: Large, Bold, Crisp White */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-black text-white leading-[1.25] tracking-tight mb-3 drop-shadow-md">
                  {slide.title}
                </h1>

                {/* Sub-headline / Core Description */}
                <p className="text-xs sm:text-sm md:text-base text-white/95 font-medium max-w-xl mb-6 sm:mb-7 leading-relaxed drop-shadow-sm">
                  {slide.subtitle}
                </p>

                {/* Action Buttons (CTAs) */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  {/* Primary CTA: Warm Executive Camel/Gold */}
                  <Link
                    href={slide.primaryCtaLink}
                    prefetch={true}
                    className="inline-flex items-center justify-center gap-2.5 bg-[#C59B63] hover:bg-[#B28852] active:scale-95 text-white font-black text-xs sm:text-sm px-7 sm:px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group flex-1 sm:flex-initial"
                  >
                    <span>{slide.primaryCtaText}</span>
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  </Link>

                  {/* Secondary CTA: Frosted Glass / Ghost Button */}
                  <Link
                    href={slide.secondaryCtaLink}
                    prefetch={true}
                    className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/30 font-bold text-xs sm:text-sm px-6 sm:px-7 py-3.5 rounded-xl backdrop-blur-sm transition-all duration-200 flex-1 sm:flex-initial"
                  >
                    <span>{slide.secondaryCtaText}</span>
                  </Link>
                </div>
              </div>

              {/* 2. LEFT SIDE: Matching Ultra-light Glassmorphism Feature Badges */}
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  backdropFilter: "blur(14px) saturate(140%)",
                  WebkitBackdropFilter: "blur(14px) saturate(140%)",
                }}
                className="hidden md:flex flex-col gap-4 rounded-2xl p-5 border border-white/25 text-white shadow-xl max-w-[215px] order-2"
              >
                {/* Item 1: Shipping */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
                    <Truck className="w-5 h-5 text-white" strokeWidth={1.8} />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold leading-tight">شحن سريع</div>
                    <div className="text-[10px] text-white/90">لكل المحافظات</div>
                  </div>
                </div>

                {/* Item 2: Secure Payment */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
                    <ShieldCheck className="w-5 h-5 text-white" strokeWidth={1.8} />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold leading-tight">دفع آمن</div>
                    <div className="text-[10px] text-white/90">ومتعدد الطرق</div>
                  </div>
                </div>

                {/* Item 3: Support */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
                    <Headphones className="w-5 h-5 text-white" strokeWidth={1.8} />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold leading-tight">دعم فني</div>
                    <div className="text-[10px] text-white/90">24/7</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Controls Row: Dots in Center, Arrows on Left */}
            <div className="flex items-center justify-between w-full pt-4">
              {/* Left Navigation Arrows */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous Slide"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all cursor-pointer active:scale-90"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next Slide"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all cursor-pointer active:scale-90"
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
