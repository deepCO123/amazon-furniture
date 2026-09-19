"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ShieldCheck,
  Wrench,
  Truck,
  MessageCircle,
  Ruler,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

interface Slide {
  id: number;
  badge?: string;
  titleMain: string;
  titleAccent: string;
  codeText: string;
  code: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

const slides: Slide[] = [
  {
    id: 1,
    titleMain: "خصم إضافي",
    titleAccent: "على جميع المنتجات",
    codeText: "عند أستخدامك كود :",
    code: "AMAZON",
    subtitle: "أفخم تصاميم الأثاث المكتبي والركن وغرف النوم والمطابخ من المصنع لحد باب بيتك بأعلى خامات الخشب الزان.",
    image: "/oscar-hero-exact.jpg",
    ctaText: "تسوق العروض الآن",
    ctaLink: "/products?tag=sale",
    secondaryCtaText: "استشارة ومعاينة مجانية بالمنصورة",
    secondaryCtaLink: "/#consultation",
  },
  {
    id: 2,
    titleMain: "شوف مساحتك",
    titleAccent: "قبل التنفيذ مجاناً",
    codeText: "عند حجز كود :",
    code: "CONSULT",
    subtitle: "فريق هندسي متخصص يزور موقعك داخل المنصورة أو ميتنج أونلاين لمراجعة المخططات ورفع المقاسات مجاناً.",
    image: "/oscar-hero.jpg",
    ctaText: "احجز استشارتك الآن",
    ctaLink: "/#consultation",
    secondaryCtaText: "تصفح أحدث الموديلات",
    secondaryCtaLink: "/products",
  },
];

export default function OscarHeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <section className="w-full bg-[#f6f2ec]">
      {/* ── 1. Full-Bleed Edge-to-Edge Hero Banner (Oscar Style) ─────── */}
      <div className="relative w-full h-[460px] sm:h-[540px] md:h-[580px] lg:h-[640px] overflow-hidden select-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Full-width edge-to-edge background photograph */}
            <Image
              src={slide.image}
              alt="Amazon Furniture Hero Banner"
              fill
              priority
              className="object-cover object-center w-full h-full"
              sizes="100vw"
            />

            {/* Subtle soft directional gradient to guarantee high text contrast without darkening the beautiful room */}
            <div className="absolute inset-0 bg-gradient-to-l from-black/50 via-black/25 to-transparent sm:from-black/45 sm:via-transparent sm:to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Content Container aligned inside standard max width */}
        <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 flex items-center justify-between">
          {/* Right Text Block (RTL First Focus) */}
          <div className="max-w-xl text-right space-y-4 sm:space-y-6 pt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-4"
              >
                {/* Main Heading identical to Oscar typography */}
                <div>
                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] font-sans">
                    {slide.titleMain}
                  </h1>
                  <p className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mt-1 drop-shadow-[0_3px_12px_rgba(0,0,0,0.6)]">
                    {slide.titleAccent}
                  </p>
                </div>

                {/* Promo Code Line (Oscar Orange Code) */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-lg sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
                    {slide.codeText}
                  </span>
                  <span className="text-[#e58e26] text-2xl sm:text-3xl lg:text-4xl font-black tracking-wider drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] font-mono">
                    {slide.code}
                  </span>
                </div>

                {/* Subtitle description */}
                <p className="text-xs sm:text-sm md:text-base text-gray-100 max-w-lg leading-relaxed font-medium drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
                  {slide.subtitle}
                </p>

                {/* Interactive Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    href={slide.ctaLink}
                    className="inline-flex items-center gap-2 bg-[#e58e26] hover:bg-[#d6801c] text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-full shadow-lg hover:shadow-amber-600/30 transition-all group cursor-pointer"
                  >
                    <span>{slide.ctaText}</span>
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  </Link>

                  {slide.secondaryCtaText && slide.secondaryCtaLink && (
                    <Link
                      href={slide.secondaryCtaLink}
                      className="inline-flex items-center gap-2 bg-black/40 hover:bg-black/60 text-white border border-white/30 backdrop-blur-sm font-bold text-xs sm:text-sm px-5 py-3 rounded-full transition-all cursor-pointer"
                    >
                      <Ruler size={15} className="text-[#e58e26]" />
                      <span>{slide.secondaryCtaText}</span>
                    </Link>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Left area: Left open so the photorealistic 3D 5% sculpture in the background is fully showcased */}
          <div className="hidden lg:block w-72" />
        </div>

        {/* Carousel Slider Arrows (Next / Prev) */}
        <button
          onClick={() => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
          aria-label="السابق"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm flex items-center justify-center transition-all opacity-80 hover:opacity-100"
        >
          <ChevronRight size={22} />
        </button>

        <button
          onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
          aria-label="التالي"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm flex items-center justify-center transition-all opacity-80 hover:opacity-100"
        >
          <ChevronLeft size={22} />
        </button>

        {/* Slider Pagination Dots (Exact Oscar Style) */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrent(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                current === idx ? "w-8 bg-[#e58e26]" : "w-2.5 bg-white/60 hover:bg-white"
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ── 2. Feature Highlights Strip (Underneath the Banner) ──────── */}
      <div className="border-b border-amber-200/50 bg-white shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: "شحن وتوصيل لكافة المحافظات", subtitle: "من المصنع لحد باب بيتك" },
              { icon: Wrench, title: "التركيب مجاناً بالكامل", subtitle: "فريق فني متخصص للمعاينة والتركيب" },
              { icon: ShieldCheck, title: "ضمان حقيقي معتمد 3 سنوات", subtitle: "خشب زان أحمر وشاسيه حديد" },
              { icon: MessageCircle, title: "شراء ودفع عبر الواتساب", subtitle: "تواصل فوري وتأكيد فوري للطلب" },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-[#faf8f5] border border-amber-100/80 rounded-xl p-3 sm:p-4 flex items-center gap-3 shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <item.icon size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">{item.title}</h4>
                  <p className="text-[11px] text-gray-500 truncate">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
