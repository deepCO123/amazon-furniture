import type { Metadata } from "next";
import OscarHeroBanner from "@/components/home/OscarHeroBanner";
import ChooseCategorySection from "@/components/home/ChooseCategorySection";
import SaveQuarterCostSection from "@/components/home/SaveQuarterCostSection";
import OscarDualServicesBanner from "@/components/home/OscarDualServicesBanner";
import SeatingStyleSection from "@/components/home/SeatingStyleSection";
import OscarSummerPromoBanner from "@/components/home/OscarSummerPromoBanner";
import FreeConsultationSection from "@/components/home/FreeConsultationSection";
import BrandsTicker from "@/components/home/BrandsTicker";
import TestimonialCarousel from "@/components/home/TestimonialCarousel";
import InstagramGallery from "@/components/home/InstagramGallery";
import Newsletter from "@/components/home/Newsletter";

export const metadata: Metadata = {
  title: "Amazon Furniture | من المصنع لحد باب البيت — أثاث واستشارة مجانية بالمنصورة وأونلاين",
  description:
    "متجر Amazon Furniture للأثاث والديكور الداخلي والمكتبي من المصنع لحد باب البيت. استشارة مجانية ومعاينة بالمنصورة أو أونلاين وضمان معتمد 10 سنوات على خشب الزان وشراء فوري عبر الواتساب.",
};

export default function HomePage() {
  return (
    <>
      {/* Oscar-style Hero with Discount Code & Badges */}
      <OscarHeroBanner />

      {/* "اختر من" Category Tabs Filter Section */}
      <ChooseCategorySection />

      {/* "وفّر ربع التكلفة بخصومات 26%" Section */}
      <SaveQuarterCostSection />

      {/* Oscar-style Dual Service Banners: 3D Design Free & Corporate B2B */}
      <OscarDualServicesBanner />

      {/* "جلسات على ذوقك" 3-Card Visual Section */}
      <SeatingStyleSection />

      {/* "بصمة مكانك تبدأ من أمازون" + "اسبق الكل والحق تخفيضات الصيف" */}
      <OscarSummerPromoBanner />

      {/* Free Consultation Section (Inside Mansoura & Online Video Meeting + Google Maps) */}
      <FreeConsultationSection />

      {/* Multilingual Customer Reviews (Egyptian, Saudi, English) */}
      <TestimonialCarousel />

      {/* Factory & Materials Quality Ticker */}
      <BrandsTicker />

      {/* Instagram Live Gallery */}
      <InstagramGallery />

      {/* Newsletter */}
      <Newsletter />
    </>
  );
}
