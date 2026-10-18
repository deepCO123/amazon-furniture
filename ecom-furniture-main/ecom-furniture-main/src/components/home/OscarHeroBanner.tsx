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

  const slides = [
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
            {/* Full-width edge-to-edge background photograph with 95% HD quality */}
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority
              quality={95}
              className="object-cover object-center w-full h-full"
              sizes="100vw"
            />

            {/* Gradient overlay for clear typography legibility */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  language === "en"
                    ? "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.60) 35%, rgba(0,0,0,0.20) 60%, rgba(0,0,0,0) 80%)"
                    : "linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.60) 28%, rgba(0,0,0,0.20) 50%, rgba(0,0,0,0) 70%)",
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Content Container */}
        <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 flex items-center justify-start pb-8 sm:pb-12">
          <div className={`max-w-xl space-y-4 sm:space-y-6 ${language === "en" ? "text-left" : "text-right"}`}>
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
