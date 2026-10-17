"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Ruler, Upload, Palette, Sparkles, CheckCircle2, ArrowLeft, MessageCircle } from "lucide-react";

export default function CustomFurniturePromoSection() {
  const steps = [
    {
      num: "1",
      icon: Ruler,
      title: "حدد مقاسات مكانك",
      desc: "طول، عرض، وارتفاع المساحة سواء مكتب، ركنة، دريسنج روم أو مطبخ.",
    },
    {
      num: "2",
      icon: Upload,
      title: "ارفع صورة التصميم",
      desc: "صورة لمكتب عاجبك من بنترست أو صورة لغرفتك على الطبيعة.",
    },
    {
      num: "3",
      icon: Palette,
      title: "اختر الخامات والألوان",
      desc: "نوع الخشب (زان / MDF إسباني / كاونتر)، نوع القماش ولون الدهان.",
    },
    {
      num: "4",
      icon: MessageCircle,
      title: "نرد عليك بالسعر والتنفيذ",
      desc: "دراسة فنية وتسعير فوري مع ميعاد التسليم وضمان 10 سنوات.",
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 border-y border-amber-100/60 overflow-hidden relative">
      {/* Background ambient accents */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-2xl relative overflow-hidden">
          {/* Subtle wood texture overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left/Main Column: Text & Value proposition */}
            <div className="lg:col-span-7 space-y-6 text-right" dir="rtl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-bold backdrop-blur-sm">
                <Sparkles size={16} className="text-amber-400 animate-spin" style={{ animationDuration: "8s" }} />
                <span>خدمة التفصيل والتصنيع الخاص من المصنع مباشرة</span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                معاك ديزاين معين أو مقاسات خاصة لمكتب أو ركنة؟
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-amber-100">
                  نفصلهولك بالمللي مع ضمان 10 سنين
                </span>
              </h2>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                مش لاقي مقاس يناسب غرفتك أو مكتبك في المعارض الجاهزة؟ ارفع لنا صورة التصميم اللي بتحلم بيه وحدد أبعاد مساحتك، ومهندسينا في مصنع <strong>Amazon Furniture</strong> هيدرسوا التصميم وينفذوه بنفس الخامات والألوان مع توصيل وتركيب لحد باب بيتك.
              </p>

              {/* Steps row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {steps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.num}
                      className="bg-white/5 border border-white/10 rounded-2xl p-3 text-right hover:bg-white/10 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 mb-2 font-black text-xs">
                        <Icon size={16} />
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-white">{step.title}</h4>
                      <p className="text-[11px] text-stone-300 mt-1 line-clamp-2">{step.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-3">
                <Link
                  href="/custom-order"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm sm:text-base px-8 py-4 rounded-full shadow-lg shadow-amber-600/30 hover:shadow-amber-600/50 transition-all transform hover:-translate-y-0.5"
                >
                  <Ruler size={18} />
                  <span>ابدأ طلب تفصيل الآن (ارفع المقاسات والصورة)</span>
                  <ArrowLeft size={16} />
                </Link>

                <a
                  href="https://wa.me/201091084863?text=مرحباً%20مهندس%20محمد%20إسماعيل،%20عندي%20تصميم%20بمقاسات%20خاصة%20وعايز%20استفسر%20عن%20التفصيل%20والتكلفة"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm px-6 py-4 rounded-full transition-all"
                >
                  <MessageCircle size={16} className="text-emerald-400" />
                  <span>تواصل فوري واتساب</span>
                </a>
              </div>
            </div>

            {/* Right Column: Visual Preview Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-2xl overflow-hidden border-2 border-amber-400/30 shadow-2xl group">
                <div className="aspect-[4/3] relative">
                  <Image
                    src="https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800"
                    alt="تفصيل مكاتب وركنيات ودواليب حسب المقاس"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
                </div>

                {/* Floating Dimension Tag */}
                <div className="absolute top-4 right-4 bg-amber-500/95 text-stone-950 text-xs font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                  <Ruler size={13} />
                  <span>تفصيل بالمللي</span>
                </div>

                {/* Floating Upload Tag */}
                <div className="absolute bottom-4 left-4 right-4 bg-stone-900/90 backdrop-blur-md border border-white/15 rounded-xl p-3 text-right" dir="rtl">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 size={14} />
                      معاينة واستشارة مجانية
                    </span>
                    <span className="text-stone-300 text-xs font-medium">مكاتب • ركنيات • مطابخ</span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">
                    أنت تتخيل ونحن نصنع بدقة متناهية من خشب زان أحمر طبيعي ودهانات دوكو ومقاومة للخدش.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
