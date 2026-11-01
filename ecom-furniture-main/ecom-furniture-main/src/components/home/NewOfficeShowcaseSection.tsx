"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Compass,
  ShieldCheck,
  Palette,
  Truck,
  Briefcase,
  Users,
  Video,
  X,
  Sparkles,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";

export default function NewOfficeShowcaseSection() {
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [imageMode, setImageMode] = useState<"render" | "real">("render");

  const guarantees = [
    {
      id: "3d-planning",
      icon: Compass,
      label: "تخطيط ثلاثي الأبعاد مجاني",
    },
    {
      id: "warranty",
      icon: ShieldCheck,
      label: "ضمان ممتد حتى 10 سنوات",
    },
    {
      id: "custom-sizing",
      icon: Palette,
      label: "تفصيل حسب المقاسات والألوان",
    },
    {
      id: "free-delivery",
      icon: Truck,
      label: "توصيل وتركيب احترافي مجاني",
    },
  ];

  return (
    <section className="relative w-full bg-[#FAF7F2] dark:bg-[#120E0B] py-8 sm:py-14 overflow-hidden">
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── 1. Top Sub-Header Floating Pill Bar matching mockup ── */}
        <div className="mb-8 sm:mb-10 bg-white/90 dark:bg-[#1C1612]/90 backdrop-blur-md rounded-full border border-[#EAE6DF] dark:border-[#38261A] shadow-sm px-4 sm:px-8 py-3 flex items-center justify-between">
          {/* Right (in RTL): Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <span className="font-serif text-lg sm:text-xl font-black tracking-wider text-[#201815] dark:text-[#F7E7CE] flex items-center gap-1.5">
              <span className="text-[#8B5E3C] text-xl font-bold font-sans">A</span>
              <span>AMAZON</span>
              <span className="text-xs font-normal text-[#6E6660] dark:text-[#A8988A] hidden sm:inline mr-1">
                Furniture
              </span>
            </span>
          </Link>

          {/* Center: Corporate Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-8 text-xs sm:text-[13px] font-bold text-[#1F1A17] dark:text-[#E8D4B0]">
            <Link
              href={`/products?category=${encodeURIComponent("مكاتب")}`}
              className="text-[#8B5E3C] dark:text-[#F7E7CE] hover:text-[#5A3D2E] transition-colors"
            >
              تجهيز الشركات
            </Link>
            <Link
              href="#consultation"
              className="hover:text-[#8B5E3C] transition-colors"
            >
              صالة العرض
            </Link>
            <Link
              href="/custom-order"
              className="hover:text-[#8B5E3C] transition-colors"
            >
              التصميم المخصص
            </Link>
            <Link
              href="#consultation"
              className="hover:text-[#8B5E3C] transition-colors"
            >
              طلب معاينة
            </Link>
            <Link
              href="/about"
              className="hover:text-[#8B5E3C] transition-colors"
            >
              من نحن
            </Link>
          </nav>

          {/* Left (in RTL): Contact Us Pill Button */}
          <Link
            href="#consultation"
            className="inline-flex items-center gap-2 bg-[#201815] hover:bg-[#38261A] active:scale-95 text-white font-bold text-xs sm:text-sm px-5 sm:px-7 py-2 sm:py-2.5 rounded-full shadow-sm transition-all"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#E8D4B0]" />
            <span>تواصل معنا</span>
          </Link>
        </div>

        {/* ── 2. Asymmetric 2-Column Hero Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* ═════ RIGHT COLUMN (5 cols in lg): Typography, CTAs & Secondary Feature Card ═════ */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            {/* Top Text Content Area */}
            <div className="text-right mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl lg:text-[38px] font-black text-[#1F1A17] dark:text-[#FAF4ED] leading-[1.25] tracking-tight mb-3">
                <span className="block text-[#8B5E3C] dark:text-[#E8D4B0]">نصمم المستقبل..</span>
                <span className="block">مساحات عمل تلهم الإنجاز</span>
              </h2>

              <p className="text-xs sm:text-sm md:text-base text-[#6E6660] dark:text-[#B0A69D] font-medium leading-relaxed mb-6 max-w-lg">
                حلول متكاملة لتجهيز المكاتب والشركات الكبرى بأرقى المعايير الهندسية والأثاث المريح المصمم خصيصاً لرفع الإنتاجية.
              </p>

              {/* CTA Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                {/* Primary Button: Dark Espresso Pill */}
                <Link
                  href="#consultation"
                  className="inline-flex items-center gap-2.5 bg-[#201815] hover:bg-[#38261A] active:scale-95 text-white font-bold text-xs sm:text-sm px-6 sm:px-7 py-3 sm:py-3.5 rounded-full shadow-md transition-all group"
                >
                  <span>طلب استشارة مجانية</span>
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                </Link>

                {/* Secondary Button: Light Bordered Pill */}
                <button
                  type="button"
                  onClick={() => setShowVideoModal(true)}
                  className="inline-flex items-center gap-2 bg-white dark:bg-[#1C1612] hover:bg-[#FAF4ED] dark:hover:bg-[#251D17] text-[#201815] dark:text-[#E8D4B0] border border-[#201815]/30 dark:border-[#38261A] font-bold text-xs sm:text-sm px-5 sm:px-6 py-3 sm:py-3.5 rounded-full shadow-2xs transition-all cursor-pointer"
                >
                  <Video className="w-4 h-4 text-[#8B5E3C]" />
                  <span>استكشف مشاريعنا</span>
                </button>
              </div>
            </div>

            {/* Secondary Feature Card: Meeting Rooms & Reception */}
            <div className="relative rounded-3xl overflow-hidden shadow-lg min-h-[260px] sm:min-h-[300px] bg-[#201815] border border-[#EDE5DA] dark:border-[#38261A] group mt-auto">
              <Image
                src="/redesign/office-meeting-lounge.jpg"
                alt="قاعات اجتماعات واستقبال"
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 42vw"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

              {/* Top Floating Badge */}
              <div className="absolute top-4 right-4 z-10">
                <div className="inline-flex items-center gap-2 bg-white/95 dark:bg-[#201815]/90 backdrop-blur-md text-[#201815] dark:text-[#F7E7CE] text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md border border-[#EAE6DF] dark:border-white/10">
                  <Users className="w-3.5 h-3.5 text-[#8B5E3C]" />
                  <span>قاعات اجتماعات واستقبال</span>
                </div>
              </div>

              {/* Bottom Content Overlay */}
              <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-6 z-10 text-right text-white">
                <h4 className="text-base sm:text-lg font-bold text-white leading-tight mb-1">
                  مساحات تفاعلية تبني الشراكات
                </h4>
                <p className="text-[11px] sm:text-xs text-white/85 leading-relaxed font-medium">
                  قاعات اجتماعات متكاملة ومناطق استقبال مريحة تترك انطباعاً أولياً لا يُنسى لعملائك وشركائك.
                </p>
              </div>
            </div>
          </div>

          {/* ═════ LEFT COLUMN (7 cols in lg): Large Executive Showcase Card ═════ */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="relative rounded-3xl overflow-hidden shadow-xl min-h-[480px] sm:min-h-[560px] lg:min-h-[620px] h-full bg-[#201815] border border-[#EDE5DA] dark:border-[#38261A] group">
              {/* Executive Suite Showcase Image */}
              <Image
                src={
                  imageMode === "real"
                    ? "/redesign/office-team-real.jpg"
                    : "/redesign/office-executive-suite.jpg"
                }
                alt="أجنحة تنفيذية تليق بالصدارة"
                fill
                priority
                className="object-cover object-center transition-transform duration-700 group-hover:scale-103"
                sizes="(max-width: 1024px) 100vw, 58vw"
              />

              {/* Cinematic Bottom Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none" />

              {/* Top Floating VIP Badge (Top Right in RTL) */}
              <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20 flex items-center gap-2">
                <div className="inline-flex items-center gap-2 bg-[#201815]/85 backdrop-blur-md text-white text-xs sm:text-[13px] font-bold px-4 py-2 rounded-full border border-white/20 shadow-md">
                  <Briefcase className="w-3.5 h-3.5 text-[#E8D4B0]" />
                  <span>تصاميم VIP</span>
                </div>

                {/* View Switcher: 3D Render vs Real Team */}
                <button
                  type="button"
                  onClick={() => setImageMode((prev) => (prev === "render" ? "real" : "render"))}
                  className="bg-white/80 dark:bg-black/80 hover:bg-white text-[#201815] dark:text-white text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/30 backdrop-blur-xs transition-all shadow-sm cursor-pointer"
                  title="تبديل زاوية العرض"
                >
                  {imageMode === "render" ? "عرض الواقع الفعلي 📸" : "عرض التصميم ثلاثي الأبعاد 📐"}
                </button>
              </div>

              {/* ── Interactive Hotspot Pins (exact placements matching mockup) ── */}
              {/* Hotspot 1: Natural Wood Desk & Wall Shelving */}
              <div
                className="absolute top-[60%] sm:top-[63%] left-[12%] sm:left-[16%] z-20"
                onMouseEnter={() => setActiveHotspot(1)}
                onMouseLeave={() => setActiveHotspot(null)}
              >
                <div className="relative flex items-center gap-2 cursor-pointer group/pin">
                  {/* Glowing White Dot with Pulse */}
                  <div className="relative w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-[0_0_12px_rgba(255,255,255,0.9)] transition-transform group-hover/pin:scale-125">
                    <span className="absolute -inset-1 rounded-full bg-white/40 animate-ping" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#201815]" />
                  </div>

                  {/* Hotspot Label Pill */}
                  <div className="bg-[#201815]/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/25 shadow-lg whitespace-nowrap flex items-center gap-1.5">
                    <span>خشب طبيعي</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E8D4B0]" />
                  </div>

                  {/* Micro Tooltip */}
                  {activeHotspot === 1 && (
                    <div className="absolute bottom-full right-0 mb-2 w-48 p-2.5 bg-[#2C211C] text-white text-[11px] rounded-xl shadow-2xl border border-[#D4A373]/40 z-30 animate-fade-in text-right">
                      <p className="font-bold text-[#E8D4B0] mb-0.5">خشب زان وقشرة أرو طبيعي</p>
                      <p className="text-white/85 text-[10px] leading-tight">
                        معالجة ضد الخدش والرطوبة مع فتحات كابلات مخفية
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Hotspot 2: Ergonomic Hydraulic Chair */}
              <div
                className="absolute top-[72%] sm:top-[74%] left-[28%] sm:left-[35%] z-20"
                onMouseEnter={() => setActiveHotspot(2)}
                onMouseLeave={() => setActiveHotspot(null)}
              >
                <div className="relative flex items-center gap-2 cursor-pointer group/pin">
                  {/* Glowing White Dot with Pulse */}
                  <div className="relative w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-[0_0_12px_rgba(255,255,255,0.9)] transition-transform group-hover/pin:scale-125">
                    <span className="absolute -inset-1 rounded-full bg-white/40 animate-ping" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#201815]" />
                  </div>

                  {/* Hotspot Label Pill */}
                  <div className="bg-[#201815]/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/25 shadow-lg whitespace-nowrap flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E8D4B0]" />
                    <span>كراسي هيدروليكية</span>
                  </div>

                  {/* Micro Tooltip */}
                  {activeHotspot === 2 && (
                    <div className="absolute bottom-full left-0 mb-2 w-48 p-2.5 bg-[#2C211C] text-white text-[11px] rounded-xl shadow-2xl border border-[#D4A373]/40 z-30 animate-fade-in text-right">
                      <p className="font-bold text-[#E8D4B0] mb-0.5">ميكانيزم هيدروليك ألماني</p>
                      <p className="text-white/85 text-[10px] leading-tight">
                        جلد فاخر مع دعم كامل للفقرات القطنية وضمان 10 سنوات
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Text Overlay */}
              <div className="absolute bottom-5 sm:bottom-8 right-5 sm:right-8 left-5 sm:left-8 z-10 text-right text-white">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight mb-2 drop-shadow-md">
                  أجنحة تنفيذية تليق بالصدارة
                </h3>
                <p className="text-xs sm:text-sm text-[#FAF4ED]/90 font-medium max-w-xl leading-relaxed drop-shadow">
                  أثاث يعبر عن هيبة القيادة، مجهز بأعلى مستويات الفخامة والراحة لمدراء الشركات الكبرى.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Bottom Corporate Guarantees / Value Proposition Strip ── */}
        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-[#EAE6DF] dark:border-[#38261A]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {guarantees.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-center gap-2.5 sm:gap-3 text-right py-2 ${
                    idx < guarantees.length - 1
                      ? "md:border-l md:border-l-[#EAE6DF] dark:md:border-l-[#38261A]"
                      : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#F3EDE5] dark:bg-[#231A14] text-[#8B5E3C] dark:text-[#E8D4B0] flex items-center justify-center shrink-0 shadow-2xs">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#201815] dark:text-[#E8D4B0]">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Video Modal: Projects Showcase ── */}
      {showVideoModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowVideoModal(false)}
        >
          <div
            className="relative w-full max-w-3xl bg-[#1C1612] rounded-3xl overflow-hidden border border-[#523A2A] shadow-2xl p-6 text-white text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E8D4B0]" />
                <h3 className="font-bold text-base sm:text-lg">مشاريع وتجهيزات Amazon Furniture للشركات</h3>
              </div>
            </div>

            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center group">
              <Image
                src="/redesign/office-team-real.jpg"
                alt="فريق عمل ومشاريع Amazon Furniture"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 rounded-full bg-[#E8D4B0] text-[#201815] flex items-center justify-center shadow-2xl mb-3">
                  <Video className="w-7 h-7" />
                </div>
                <h4 className="text-base sm:text-lg font-bold text-white mb-1">
                  جولة فيديو حصرية في أحدث المقرات المنفذة
                </h4>
                <p className="text-xs text-white/80 max-w-md">
                  تم تجهيز أكثر من 350 مقراً للشركات الكبرى في القاهرة والمنصورة والدلتا بأعلى مستويات الجودة والضمان.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <Link
                href="#consultation"
                onClick={() => setShowVideoModal(false)}
                className="bg-[#E8D4B0] hover:bg-[#F3E2C3] text-[#201815] font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full transition-all"
              >
                احجز معاينة مجانية لمقرك
              </Link>
              <div className="flex items-center gap-2 text-xs text-[#E8D4B0]">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>تنفيذ متكامل من التصميم وحتى التركيب</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
