"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function SofaZoneEyeCatchingSplit() {
  const slides = [
    {
      id: 1,
      badge: "قطعة تخطف العين",
      headline: "الفخامة والجرأة في تصميم واحد.",
      description:
        "كل تفصيلة في الكرسي الطبي التنفيذي والجلد مصممة عشان تعكس شياكة مكتبك ومساحتك، مع راحة مطلقة ودعم قطني لفقرات الظهر.",
      product: {
        title: "كرسي مدير تنفيذي جلد فاخر ظهر عالي بريميوم - كود GL-135",
        price: 4850,
        originalPrice: 5800,
        image: "/uploads/gl135-high-black-front.jpg",
        slug: "gl-135-high-ergonomic-mesh-chair",
      },
      lifestyleImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200",
    },
    {
      id: 2,
      badge: "إتقان ودقة تصنيع",
      headline: "مكاتب مديرين تجمع بين الهيبة والعملية.",
      description:
        "تصميمات مكاتب تنفيذية خشب ميلامين أوروبي مع شاسيه إلكتروستاتيك صلب ووحدات أدراج ذكية تلبي كافة متطلبات الشركات والمنازل العصرية.",
      product: {
        title: "مكتب مدير تنفيذي فاخر بوحدة أدراج جانبية وشاسيه صلب",
        price: 8650,
        originalPrice: 10500,
        image: "/uploads/gl135-sofa-black-diamond.jpg",
        slug: "executive-office-desk-premium",
      },
      lifestyleImage: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1200",
    },
    {
      id: 3,
      badge: "راحة واستقبال راقٍ",
      headline: "انتريهات مودرن تخطف الأنظار في كل زاوية.",
      description:
        "خشب زان أحمر روماني طبيعي وتنجيد إسفنج كثافة 36 سوبر سوفت مع أقمشة كتان وجلد معالج ضد البقع والسوائل بضمان معتمد 10 سنوات.",
      product: {
        title: "طقم انتريه واستقبال مكتبي فاخر خشب زان أحمر وتنجيد سوفت",
        price: 18200,
        originalPrice: 22500,
        image: "/uploads/gl135-armchair-grey.jpg",
        slug: "luxury-reception-sofa-set",
      },
      lifestyleImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200",
    },
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const slide = slides[currentIdx];

  const prevSlide = () => {
    setCurrentIdx((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIdx((prev) => (prev + 1) % slides.length);
  };


  return (
    <section className="py-12 bg-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-[#6B4F3A] min-h-[480px] lg:min-h-[540px] flex flex-col lg:flex-row items-stretch">
          
          {/* ── Left Side (RTL): Full Lifestyle Room Image ──────────────── */}
          <div className="relative w-full lg:w-1/2 min-h-[320px] lg:min-h-full">
            <Image
              src={slide.lifestyleImage}
              alt={slide.headline}
              fill
              className="object-cover object-center transition-all duration-700"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#6B4F3A]/85 via-transparent to-transparent pointer-events-none" />

            {/* Subtle Product Floating Tag on the image bottom */}
            <div className="absolute bottom-5 start-5 z-10 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-[#E8E0D5] shadow-xl max-w-xs flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#F8F5F0] shrink-0 border border-[#E8E0D5]">
                <Image
                  src={slide.product.image}
                  alt={slide.product.title}
                  fill
                  className="object-contain p-1"
                  sizes="48px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-[#292321] truncate mb-0.5">{slide.product.title}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#B93832]">{formatPrice(slide.product.price)}</span>
                  <span className="text-[10px] text-[#74685E] line-through font-bold">{formatPrice(slide.product.originalPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Side (RTL): Primary Brown Content Area ─────────────────── */}
          <div className="relative w-full lg:w-1/2 bg-[#6B4F3A] text-white p-6 sm:p-10 lg:p-14 flex flex-col justify-between z-10">
            <div>
              {/* Iconic Oval Badge */}
              <div className="inline-block relative px-7 py-1.5 mb-5">
                <div className="absolute inset-0 border-[2px] border-[#C58B45] rounded-[50%] transform -rotate-1 pointer-events-none scale-105" />
                <span className="text-xs sm:text-sm font-black text-[#C58B45] tracking-wide relative z-10">
                  {slide.badge}
                </span>
              </div>

              {/* Main Headline */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight mb-4">
                {slide.headline}
              </h2>

              {/* Description */}
              <p className="text-xs sm:text-sm lg:text-base text-[#E8D8C3] font-medium leading-relaxed max-w-lg mb-6">
                {slide.description}
              </p>

              {/* 3 Luxury Guarantee Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-7">
                <div className="bg-black/20 backdrop-blur-xs border border-white/10 rounded-xl p-2.5 text-center">
                  <span className="text-xs font-black text-white block">خشب زان طبيعي</span>
                  <span className="text-[10px] text-[#E8D8C3]">أعلى معايير المتانة</span>
                </div>
                <div className="bg-black/20 backdrop-blur-xs border border-white/10 rounded-xl p-2.5 text-center">
                  <span className="text-xs font-black text-white block">ضمان 10 سنوات</span>
                  <span className="text-[10px] text-[#E8D8C3]">عقد موثق ومعتمد</span>
                </div>
                <div className="bg-black/20 backdrop-blur-xs border border-white/10 rounded-xl p-2.5 text-center">
                  <span className="text-xs font-black text-white block">شحن وتركيب</span>
                  <span className="text-[10px] text-[#E8D8C3]">فريق فني محترف</span>
                </div>
              </div>

              {/* Action Button: استكشف الموديل */}
              <Link
                href={`/products/${slide.product.slug}`}
                className="inline-flex items-center gap-2 bg-[#C58B45] hover:bg-[#b07837] text-white font-black text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105"
              >
                <span>استكشف هذا الموديل وتفاصيله</span>
                <ChevronLeft size={16} />
              </Link>
            </div>

            {/* Slider Navigation & Counter */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={prevSlide}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="السابق"
                >
                  <ChevronRight size={20} />
                </button>
                <button
                  onClick={nextSlide}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="التالي"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>

              {/* Counter */}
              <span className="text-xs sm:text-sm font-black text-[#E8D8C3] font-mono tracking-wider">
                {currentIdx + 1} / {slides.length}
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
