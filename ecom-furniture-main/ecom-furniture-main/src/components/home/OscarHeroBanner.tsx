"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Wrench,
  Truck,
  MessageCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  cta1Text: string;
  cta1Link: string;
  cta2Text: string;
  cta2Link: string;
}

import { useLanguageStore } from "@/store/languageStore";
import { getTranslation } from "@/lib/translations";

export default function OscarHeroBanner() {
  const [current, setCurrent] = useState(0);
  const { language } = useLanguageStore();
  const t = getTranslation(language);

  // Touch Swipe Support
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const minSwipeDistance = 45;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (language === "en") {
      if (isLeftSwipe) setCurrent((prev) => (prev + 1) % slides.length);
      if (isRightSwipe) setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    } else {
      // RTL: Swiping left advances in RTL layout
      if (isLeftSwipe) setCurrent((prev) => (prev + 1) % slides.length);
      if (isRightSwipe) setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    }
  };

  const slides: Slide[] = [
    {
      id: 1,
      title: t.slide1Title,
      subtitle: t.slide1Subtitle,
      image: "/oscar-hero.jpg",
      cta1Text: t.slide1Cta1,
      cta1Link: "/products",
      cta2Text: t.slide1Cta2,
      cta2Link: "/#consultation",
    },
    {
      id: 2,
      title: t.slide2Title,
      subtitle: t.slide2Subtitle,
      image: "/hero-office-warm-hd.jpg",
      cta1Text: t.slide2Cta1,
      cta1Link: "https://wa.me/201099684784?text=Hello",
      cta2Text: t.slide2Cta2,
      cta2Link: "/#consultation",
    },
    {
      id: 3,
      title: t.slide3Title,
      subtitle: t.slide3Subtitle,
      image: "/hero-office-cool-hd.jpg",
      cta1Text: t.slide3Cta1,
      cta1Link: "https://wa.me/201099684784?text=Hello",
      cta2Text: t.slide3Cta2,
      cta2Link: "/#consultation",
    },
  ];

  const highlights = language === "en"
    ? [
        { icon: Truck, title: "Nationwide Safe Delivery", subtitle: "Direct from factory to doorstep" },
        { icon: Wrench, title: "100% Free Assembly", subtitle: "Professional on-site installation" },
        { icon: ShieldCheck, title: "10-Year Certified Warranty", subtitle: "Solid beech wood guarantee" },
        { icon: MessageCircle, title: "Instant WhatsApp Checkout", subtitle: "Instant support & order confirmation" },
      ]
    : language === "sa"
    ? [
        { icon: Truck, title: "توصيل آمن وسريع", subtitle: "لباب بيتك بكل مدن المملكة" },
        { icon: Wrench, title: "التركيب مجاناً 100%", subtitle: "فريق فني متخصص للمعاينة والتركيب" },
        { icon: ShieldCheck, title: "ضمان ذهبي 10 سنوات", subtitle: "خشب زان طبيعي وشاسيه معتمد" },
        { icon: MessageCircle, title: "طلب ودفع فوري بالواتساب", subtitle: "تأكيد فوري للطلب مع الإدارة" },
      ]
    : [
        { icon: Truck, title: "شحن وتوصيل لكافة المحافظات", subtitle: "من المصنع لحد باب بيتك" },
        { icon: Wrench, title: "التركيب مجاناً بالكامل", subtitle: "فريق فني متخصص للمعاينة والتركيب" },
        { icon: ShieldCheck, title: "ضمان حقيقي معتمد 10 سنوات", subtitle: "خشب زان أحمر وشاسيه حديد" },
        { icon: MessageCircle, title: "شراء ودفع عبر الواتساب", subtitle: "تواصل فوري وتأكيد فوري للطلب" },
      ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[current] || slides[0];

  return (
    <section className="w-full bg-white pt-2 sm:pt-4 pb-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* ── 1. Rounded Card Hero Banner (Primary Brown #6B4F3A & Gold #C58B45) ─── */}
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="relative w-full min-h-[450px] sm:min-h-[460px] md:h-[500px] lg:h-[540px] rounded-2xl sm:rounded-3xl overflow-hidden select-none bg-[#6B4F3A] shadow-2xl border border-[#83644D] flex flex-col justify-center"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Background Image */}
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority
                quality={95}
                className="object-cover object-center w-full h-full"
                sizes="100vw"
              />

              {/* Gradient Overlay for Warm Brown Atmosphere */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to left, rgba(107,79,58,0.96) 0%, rgba(107,79,58,0.85) 45%, rgba(107,79,58,0.4) 75%, rgba(0,0,0,0.1) 100%)",
                }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Content Container */}
          <div className="relative z-10 w-full h-full p-4 sm:p-8 lg:p-14 flex items-center justify-start">
            <div className={`max-w-xl space-y-3 sm:space-y-4 ${language === "en" ? "text-left" : "text-right"}`}>
              {/* Promotional Ribbon */}
              <div className="inline-flex items-center gap-1.5 bg-[#B93832] text-white text-[11px] sm:text-xs font-black px-3 py-1 rounded-full shadow-lg">
                <span>🔥 عروض التخفيضات الكبرى | خصومات حتى 50%</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-snug sm:leading-tight tracking-tight drop-shadow-md">
                {slide.title}
              </h1>

              {/* Subtitle description */}
              <p className="text-xs sm:text-sm lg:text-base text-[#E8D8C3] max-w-lg leading-relaxed font-bold drop-shadow-sm line-clamp-2 sm:line-clamp-none">
                {slide.subtitle}
              </p>

              {/* Installment Badges Strip */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 pt-0.5">
                <div className="bg-white/15 backdrop-blur-md border border-white/25 text-white px-2.5 py-1 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black flex items-center gap-1">
                  <span className="text-[#C58B45] font-extrabold text-xs sm:text-sm">0%</span>
                  <span>مقدم</span>
                </div>
                <div className="bg-white/15 backdrop-blur-md border border-white/25 text-white px-2.5 py-1 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black flex items-center gap-1">
                  <span className="text-[#C58B45] font-extrabold text-xs sm:text-sm">0%</span>
                  <span>مصاريف</span>
                </div>
                <div className="bg-white/15 backdrop-blur-md border border-white/25 text-white px-2.5 py-1 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black flex items-center gap-1">
                  <span className="text-[#C58B45] font-extrabold text-xs sm:text-sm">10</span>
                  <span>سنوات ضمان</span>
                </div>
              </div>

              {/* Interactive Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 justify-start w-full sm:w-auto">
                <Link
                  href={slide.cta1Link}
                  className="inline-flex min-h-[44px] items-center justify-center bg-[#C58B45] hover:bg-[#B07836] text-white font-black text-xs sm:text-sm px-6 py-2.5 sm:py-3 rounded-xl shadow-xl transition-all cursor-pointer hover:scale-102 active:scale-98 text-center"
                >
                  <span>تسوق العروض فوراً</span>
                </Link>

                <Link
                  href={slide.cta2Link}
                  className="inline-flex min-h-[44px] items-center justify-center bg-white/20 hover:bg-white/30 text-white border border-white/40 backdrop-blur-md font-black text-xs sm:text-sm px-5 py-2.5 sm:py-3 rounded-xl shadow-lg transition-all cursor-pointer text-center"
                >
                  <span>طلب استشارة ومعاينة مجانية</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Carousel Navigation Arrows - Hidden on extra small mobile, visible sm+ */}
          <button
            onClick={() => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
            aria-label="السابق"
            className="hidden sm:flex absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs items-center justify-center transition-all cursor-pointer shadow-lg"
          >
            <ChevronRight size={20} />
          </button>

          <button
            onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
            aria-label="التالي"
            className="hidden sm:flex absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs items-center justify-center transition-all cursor-pointer shadow-lg"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Slider Pagination Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrent(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer min-w-[8px] min-h-[8px] ${
                  current === idx ? "w-6 bg-[#D97706]" : "w-2 bg-white/60 hover:bg-white"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. Feature Highlights Strip (Underneath the Banner) ──────── */}
      <div className="border-b border-amber-200/50 bg-white shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {highlights.map((item, i) => (
              <div
                key={i}
                className="bg-[#faf8f5] border border-amber-100/80 rounded-xl p-3.5 sm:p-4 flex items-center gap-3 shadow-2xs hover:shadow-xs transition-shadow"
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
