import type { Metadata } from "next";
import NewHeroSection from "@/components/home/NewHeroSection";
import NewCategoriesSection from "@/components/home/NewCategoriesSection";
import NewFeaturedProductsSection from "@/components/home/NewFeaturedProductsSection";
import NewLatestOffersSection from "@/components/home/NewLatestOffersSection";
import NewReviewsSection from "@/components/home/NewReviewsSection";
import NewTrustBar from "@/components/home/NewTrustBar";
import NewShowroomConsultationSection from "@/components/home/NewShowroomConsultationSection";
import NewBlogSection from "@/components/home/NewBlogSection";
import NewNewsletterBanner from "@/components/home/NewNewsletterBanner";
import NewFactoryStorySection from "@/components/home/NewFactoryStorySection";
import NewDeliveredGallerySection from "@/components/home/NewDeliveredGallerySection";
import NewOfficeShowcaseSection from "@/components/home/NewOfficeShowcaseSection";

export const metadata: Metadata = {
  title: "Amazon Furniture | أثاث عصري بجودة عالية وتخفيضات حصرية لمنزلك ومكتبك",
  description:
    "متجر Amazon Furniture للأثاث المنزلي والمكتبي والديكور العصري بالمنصورة وأونلاين. تصميمات عصرية بأعلى معايير الجودة، استشارات تصميم ثلاثي الأبعاد مجانية، وضمان معتمد 10 سنوات.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F8F9FA] dark:bg-[#121614] text-[#1F2421] dark:text-[#FAF4ED] overflow-x-hidden selection:bg-[#C59B63] selection:text-white">
      {/* ── 1. Hero Banner: Executive Office Solutions & Ergonomic Seating ── */}
      <NewHeroSection />

      {/* ── 2. Trust Badges Bar (4 Core Corporate Guarantees) ──────────────── */}
      <NewTrustBar />

      {/* ── 3. "تسوق حسب القسم" Interactive Category Previews ─────────────── */}
      <NewCategoriesSection />

      {/* ── 3. Promo Banner Card + "منتجات مميزة" & "أحدث العروض" ────────── */}
      <NewFeaturedProductsSection />
      <NewLatestOffersSection />

      {/* ── 4. Executive Office & Corporate Solutions Showcase ────────────── */}
      <NewOfficeShowcaseSection />

      {/* ── 5. Factory Story & 10 Years Guarantee: الأيدي المصرية وراء كل قطعة ─ */}
      <NewFactoryStorySection />

      {/* ── 7. Two-Column Block: Mansoura Showroom & Free Consultation ────── */}
      <NewShowroomConsultationSection />

      {/* ── 8. "آراء عملائنا الكرام" Customer Testimonials ──────────────── */}
      <NewReviewsSection />

      {/* ── 9. "سلمنا في بيوت عملائنا" Real Delivered Customer Photos ───── */}
      <NewDeliveredGallerySection />


      {/* ── 11. "مقالات ونصائح" Blog & Decor Advice ──────────────────────── */}
      <NewBlogSection />

      {/* ── 12. Newsletter Subscription Banner ───────────────────────────── */}
      <NewNewsletterBanner />
    </main>
  );
}
