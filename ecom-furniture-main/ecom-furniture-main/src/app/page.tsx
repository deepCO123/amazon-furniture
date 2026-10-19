import type { Metadata } from "next";
import OscarHeroBanner from "@/components/home/OscarHeroBanner";
import SofaZoneCategoryGrid from "@/components/home/SofaZoneCategoryGrid";
import SofaZoneInstantProducts from "@/components/home/SofaZoneInstantProducts";
import SofaZoneEyeCatchingSplit from "@/components/home/SofaZoneEyeCatchingSplit";
import SofaZoneTealShowcase from "@/components/home/SofaZoneTealShowcase";
import SofaZoneLifestyleBanners from "@/components/home/SofaZoneLifestyleBanners";
import SofaZoneAboutFactory from "@/components/home/SofaZoneAboutFactory";
import SofaZoneCustomerReviews from "@/components/home/SofaZoneCustomerReviews";
import FreeConsultationSection from "@/components/home/FreeConsultationSection";
import BrandsTicker from "@/components/home/BrandsTicker";
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
      {/* ── 1. Hero Banner (SofaZone Image 1 Style) ────────────────────────── */}
      <OscarHeroBanner />

      {/* ── 2. "تسوق حسب القسم" 7 Categories Grid (SofaZone Image 2 Style) ─── */}
      <SofaZoneCategoryGrid />

      {/* ── 3. "منتجات استلام فوري" Slider (SofaZone Image 3 Style) ────────── */}
      <SofaZoneInstantProducts />

      {/* ── 4. "قطعة تخطف العين" Split Feature Showcase (SofaZone Image 1 Style) */}
      <SofaZoneEyeCatchingSplit />

      {/* ── 5. Deep Teal "تسوق حسب القسم" Showcase (SofaZone Image 4 Style) ── */}
      <SofaZoneTealShowcase />

      {/* ── 6. "خد بريك واستمتع" 4-Card Lifestyle Grid (SofaZone Image 5 Style) */}
      <SofaZoneLifestyleBanners />

      {/* ── 7. "الأيدي المصرية وراء كل قطعة" Showroom & Factory (Image 2 Style) ─ */}
      <SofaZoneAboutFactory />

      {/* ── 8. "Reviews" Real Delivered Customer Photos (Image 3 Style) ─────── */}
      <SofaZoneCustomerReviews />

      {/* ── 9. Free Consultation & 3D Engineering Design ─────────────────── */}
      <FreeConsultationSection />

      {/* ── 10. Factory Quality & Materials Ticker ─────────────────────────── */}
      <BrandsTicker />

      {/* ── 11. Live Instagram Community Gallery ───────────────────────────── */}
      <InstagramGallery />

      {/* ── 12. Newsletter ───────────────────────────────────────────────── */}
      <Newsletter />
    </>
  );
}
