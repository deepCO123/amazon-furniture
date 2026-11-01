"use client";

import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Sparkles, CheckCircle2, ArrowLeft, Award, Layers, Hammer } from "lucide-react";

export default function NewFactoryStorySection() {
  const features = [
    {
      icon: Hammer,
      title: "خشب زان أحمر روماني طبيعي 100%",
      desc: "هياكل داخلية معالجة ضد الرطوبة والتسوس تتحمل الضغط والاستخدام المكثف لعشرات السنين.",
    },
    {
      icon: Layers,
      title: "إسفنج سوفت ريبوند كثافة 33-36",
      desc: "مرونة فائقة وراحة تامة دون أي هبوط مع الوقت، مع حشوات فايبر رول مستوردة.",
    },
    {
      icon: Award,
      title: "ضمان معتمد رسمي 10 سنوات",
      desc: "شهادة ضمان موثقة من المعرض والمصنع مع خدمة ما بعد البيع ودعم فني متاح دائماً.",
    },
    {
      icon: Sparkles,
      title: "سعر المصنع مباشرة — وفر 25%",
      desc: "تشتري من المصنع والمعرض الرئيسي بالمنصورة مباشرة دون وسطاء أو هوامش تجارية زائدة.",
    },
  ];

  return (
    <section className="w-full bg-[#FAF7F2] dark:bg-[#120E0B] py-10 sm:py-16 border-t border-[#EDE5DA] dark:border-[#2C1F16]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Right Column: Visual Feature Box (Child 1 in RTL = Right Side) */}
          <div className="lg:col-span-5 order-1">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#EDE5DA] dark:border-[#38261A] bg-white dark:bg-[#1C1612] p-2">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                <Image
                  src="/redesign/showroom-facade.jpg"
                  alt="مصنع ومعرض Amazon Furniture بالمنصورة"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 480px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 right-4 left-4 text-right text-white">
                  <span className="inline-block bg-[#B88A56] text-white text-[11px] font-bold px-3 py-1 rounded-full mb-1">
                    تصنيع محلي بأيدي مصرية
                  </span>
                  <h4 className="text-base sm:text-lg font-black">
                    معرض ومصنع Amazon Furniture — المنصورة
                  </h4>
                </div>
              </div>

              {/* Trust Badge Bar under the photo */}
              <div className="grid grid-cols-2 gap-3 p-4 text-right">
                <div className="flex items-center justify-end gap-2 text-xs font-bold text-[#3B2A20] dark:text-[#E8D4B0]">
                  <span>أكثر من 15 سنة خبرة</span>
                  <CheckCircle2 className="w-4 h-4 text-[#8C532B] dark:text-[#E8D4B0] shrink-0" />
                </div>
                <div className="flex items-center justify-end gap-2 text-xs font-bold text-[#3B2A20] dark:text-[#E8D4B0]">
                  <span>آلاف العملاء في كل مصر</span>
                  <CheckCircle2 className="w-4 h-4 text-[#8C532B] dark:text-[#E8D4B0] shrink-0" />
                </div>
              </div>
            </div>
          </div>

          {/* Left Column: Story & Quality Points (Child 2 in RTL = Left Side) */}
          <div className="lg:col-span-7 order-2 text-right space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#FAF4ED] dark:bg-[#251A13] border border-[#E8DEC8] dark:border-[#38261A] text-[#8C532B] dark:text-[#E8D4B0] text-xs font-bold px-3.5 py-1.5 rounded-full mb-3">
                <ShieldCheck className="w-4 h-4" />
                <span>معايير الجودة والضمان المعتمد</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#3B2A20] dark:text-white leading-tight">
                الأيدي المصرية وراء كل قطعة أثاث في منزلك
              </h2>
              <p className="text-xs sm:text-sm text-[#7A6A5F] dark:text-[#A8988A] mt-3 leading-relaxed font-medium">
                في Amazon Furniture ننطلق من المنصورة لنقدم أثاثاً يجمع بين الفخامة الأوروبية ومتانة الصناعة المصرية الأصيلة. نتحكم في كافة مراحل الإنتاج من تجفيف أخشاب الزان وحتى دهانات الدوكو فرن والتنجيد الدقيق لنضمن لك أعلى جودة وأفضل سعر مباشر.
              </p>
            </div>

            {/* 4 Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {features.map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-white dark:bg-[#1C1612] border border-[#EDE5DA] dark:border-[#38261A] shadow-[0_2px_8px_rgba(43,30,22,0.03)] text-right"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#FAF4ED] dark:bg-[#2B1E16] text-[#8C532B] dark:text-[#E8D4B0] flex items-center justify-center ms-auto mb-2.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#3B2A20] dark:text-white mb-1">
                      {feat.title}
                    </h4>
                    <p className="text-[11px] text-[#7A6A5F] dark:text-[#A8988A] leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* CTA Link Buttons */}
            <div className="pt-3 flex flex-wrap items-center justify-end gap-3">
              <Link
                href="/custom-order"
                className="inline-flex items-center gap-2 bg-[#5A3D2E] hover:bg-[#3D2619] active:scale-95 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-full shadow-md transition-all"
              >
                <span>طلب تفصيل أثاث بمقاساتك</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <Link
                href="/#consultation"
                className="inline-flex items-center gap-2 bg-white dark:bg-[#1C1612] hover:bg-[#FAF4ED] text-[#5A3D2E] dark:text-[#E8D4B0] border border-[#EDE5DA] dark:border-[#38261A] text-xs sm:text-sm font-bold px-6 py-3 rounded-full shadow-2xs transition-all"
              >
                <span>معاينة واستشارة مجانية</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

