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

const slides: Slide[] = [
  {
    id: 1,
    title: "أقوى عروض وتخفيضات أمازون للأثاث",
    subtitle: "خصومات كبرى وتصاميم عصرية فاخرة لغرف النوم والركنات والمطابخ مع استشارة هندسية وضمان 10 سنوات..",
    image: "/oscar-hero.jpg",
    cta1Text: "تسوق العروض الآن",
    cta1Link: "/products",
    cta2Text: "احجز استشارة مجانية",
    cta2Link: "/#consultation",
  },
  {
    id: 2,
    title: "أثاث مكتبي ومنزلي يلهم الإبداع والكفاءة",
    subtitle: "مجموعة متميزة من الأثاث المكتبي والحلول العملية بأسعار حصرية... والركنات الأنيقة لمساحة عمل متكاملة..",
    image: "/hero-office-day.jpg",
    cta1Text: "تواصل معنا",
    cta1Link: "https://wa.me/201099684784?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%A7%D9%84%D8%A3%D8%AB%D8%A7%D8%AB%20%D8%A7%D9%84%D9%85%D9%83%D8%AA%D8%A8%D9%8A",
    cta2Text: "صمم الآن",
    cta2Link: "/#consultation",
  },
  {
    id: 3,
    title: "فخامة التنفيذ لأرقى المساحات",
    subtitle: "تصاميم تنفيذية راقية وتشطيبات خشب زان روماني طبيعي تمنح مكانك هيبة استثنائية وأداء يدوم طويلاً..",
    image: "/hero-office-night.jpg",
    cta1Text: "تواصل معنا",
    cta1Link: "https://wa.me/201099684784?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%A7%D9%84%D8%A3%D8%AB%D8%A7%D8%AB%20%D8%A7%D9%84%D9%85%D9%83%D8%AA%D8%A8%D9%8A",
    cta2Text: "صمم الآن",
    cta2Link: "/#consultation",
  },
];

export default function OscarHeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <section className="w-full bg-[#f6f2ec]">
      {/* ── 1. Full-Bleed Edge-to-Edge Hero Banner ───────────────────── */}
      <div className="relative w-full h-[480px] sm:h-[540px] md:h-[600px] lg:h-[680px] overflow-hidden select-none bg-[#1e1b18]">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Full-width edge-to-edge background photograph */}
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority
              className="object-cover object-center w-full h-full"
              sizes="100vw"
            />

            {/* Gradient overlay on the right side for clear typography legibility */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.65) 35%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0) 85%)",
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Content Container aligned strictly to the RIGHT (RTL First Focus) */}
        <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 flex items-center justify-start pb-8 sm:pb-12">
          <div className="max-w-xl text-right space-y-4 sm:space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={false}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-4 sm:space-y-5"
              >
                {/* Main Heading */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] font-sans">
                  {slide.title}
                </h1>

                {/* Subtitle description */}
                <p className="text-sm sm:text-base lg:text-lg text-gray-100 max-w-lg leading-relaxed font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                  {slide.subtitle}
                </p>

                {/* Interactive Action Buttons side-by-side */}
                <div className="pt-3 flex flex-wrap items-center gap-3.5 justify-start">
                  <Link
                    href={slide.cta1Link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center bg-white hover:bg-gray-100 text-gray-900 font-extrabold text-sm sm:text-base px-8 sm:px-10 py-3 rounded-lg shadow-xl hover:shadow-2xl transition-all cursor-pointer"
                  >
                    <span>{slide.cta1Text}</span>
                  </Link>

                  <Link
                    href={slide.cta2Link}
                    className="inline-flex items-center justify-center bg-[#3c2a1e]/85 hover:bg-[#3c2a1e] text-white border border-white/30 backdrop-blur-md font-extrabold text-sm sm:text-base px-8 sm:px-10 py-3 rounded-lg shadow-xl transition-all cursor-pointer"
                  >
                    <span>{slide.cta2Text}</span>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        <button
          onClick={() => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
          aria-label="السابق"
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm flex items-center justify-center transition-all opacity-80 hover:opacity-100 cursor-pointer shadow-lg"
        >
          <ChevronRight size={24} />
        </button>

        <button
          onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
          aria-label="التالي"
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm flex items-center justify-center transition-all opacity-80 hover:opacity-100 cursor-pointer shadow-lg"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Slider Pagination Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrent(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                current === idx ? "w-8 bg-[#e58e26]" : "w-2.5 bg-white/70 hover:bg-white"
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
