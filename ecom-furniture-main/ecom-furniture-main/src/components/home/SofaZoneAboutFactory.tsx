"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Smile, Truck, ArrowLeft } from "lucide-react";

export default function SofaZoneAboutFactory() {
  return (
    <section className="py-16 bg-[#F8F5F0] border-t border-b border-[#E8E0D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          
          {/* ── Left Side: Real Showroom / Factory Building Photo with Badge ── */}
          <div className="relative group">
            {/* Showroom Image Container */}
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-[#E8E0D5] bg-[#6B4F3A]">
              <Image
                src="/oscar-hero.jpg"
                alt="معرض ومصنع أمازون فرنتشر بالمنصورة"
                fill
                className="object-cover object-center group-hover:scale-103 transition-transform duration-500"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-4 right-4 z-10 bg-[#292321]/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-white/15">
                📍 معرض ومصنع Amazon Furniture — المنصورة
              </div>
            </div>

            {/* Signature Floating Circular Badge */}
            <div className="absolute -top-5 -right-5 sm:-right-7 w-20 sm:w-24 h-20 sm:h-24 rounded-full bg-[#6B4F3A] text-white p-2 shadow-2xl border-4 border-[#C58B45] flex flex-col items-center justify-center text-center rotate-6 group-hover:rotate-12 transition-transform duration-300">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#E8D8C3]">
                تصنيع محلي
              </span>
              <span className="text-[10px] sm:text-xs font-extrabold text-white leading-tight">
                100% مصري
              </span>
              <span className="text-[8px] text-[#E8D8C3]/80">
                ضمان 10 سنوات
              </span>
            </div>
          </div>

          {/* ── Right Side: Content & Features ──────────────────────────── */}
          <div className="space-y-6">
            <div>
              <span className="text-xs sm:text-sm font-black text-[#C58B45] uppercase tracking-wider block mb-2">
                من نحن
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#6B4F3A] tracking-tight leading-tight">
                الأيدي المصرية وراء كل قطعة
              </h2>
            </div>

            <p className="text-sm sm:text-base text-[#74685E] font-medium leading-relaxed">
              أمازون فرنتشر شركة أثاث مصرية متخصصة تنطلق من مدينة المنصورة، نجمع بين جودة التصنيع المحلي الفائقة والتصميم الأوروبي العصري لنحول مساحتك المكتبية أو المنزلية إلى مزيج استثنائي من الراحة، العملية، والأناقة بأفضل سعر مباشر من المصنع دون أي وسيط.
            </p>

            {/* 3 Bullet Features */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#E8D8C3] text-[#6B4F3A] flex items-center justify-center shrink-0 shadow-xs">
                  <MapPin size={20} className="text-[#6B4F3A]" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-[#292321]">
                    مصنعنا ومعرضنا في المنصورة
                  </h4>
                  <p className="text-xs text-[#74685E] font-medium">
                    تقدر تشرفنا بالمعاينة والتجربة الواقعية لأي موديل قبل الشراء
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#E8D8C3] text-[#6B4F3A] flex items-center justify-center shrink-0 shadow-xs">
                  <Smile size={20} className="text-[#6B4F3A]" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-[#292321]">
                    أكثر من 1000 تصميم مميز وضمان معتمد
                  </h4>
                  <p className="text-xs text-[#74685E] font-medium">
                    خشب زان أحمر روماني طبيعي 100% وشاسيهات إلكتروستاتيك صلبة
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#E8D8C3] text-[#6B4F3A] flex items-center justify-center shrink-0 shadow-xs">
                  <Truck size={20} className="text-[#6B4F3A]" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-[#292321]">
                    توصيل وتركيب مجاني لجميع أنحاء مصر
                  </h4>
                  <p className="text-xs text-[#74685E] font-medium">
                    فريق فني محترف يقوم بالتركيب والتسليم لحد باب بيتك
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button: اعرف أكثر عنا */}
            <div className="pt-3">
              <Link
                href="/about"
                className="inline-flex items-center gap-2.5 bg-[#C58B45] hover:bg-[#b07837] text-white font-black text-sm px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105"
              >
                <span>اعرف أكثر عنا</span>
                <ArrowLeft size={16} />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
