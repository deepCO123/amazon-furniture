"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  ArrowUp,
  CreditCard,
  Banknote,
} from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <footer className="bg-[#1F2421] text-white border-t border-[#2D3530] relative z-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 items-start text-right">
            
            {/* ── 1. Brand & Licensing Column (4 cols) ── */}
            <div className="lg:col-span-4 space-y-4">
              <Link href="/" className="inline-block group mb-1" aria-label="AMAZON">
                <Image
                  src="/logo/amazon-horizontal-white.svg"
                  alt="AMAZON - Premium Furniture & Office Solutions"
                  width={180}
                  height={46}
                  className="h-10 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105"
                />
              </Link>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-medium">
                AMAZON Furniture — الصرح الرائد لتجهيز المكاتب التنفيذية والشركات الكبرى والأثاث الفاخر بالمنصورة وجميع أنحاء مصر بأعلى المعايير الهندسية وجودة تدوم لأجيال.
              </p>

              {/* Commercial Licensing & Quality Standards */}
              <div className="pt-2 border-t border-white/10 space-y-1.5 text-[11px] text-[#C59B63] font-bold">
                <div className="flex items-center justify-end gap-2">
                  <span>سجل تجاري رقم: 48921 | بطاقة ضريبية معتمدة</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C59B63]" />
                </div>
                <p className="text-white/60 text-[10px]">
                  مصنع ومعرض معتمد لإنتاج وتوريد الأثاث المكتبي وفق المواصفات القياسية.
                </p>
              </div>

              {/* Payment & Installment Badges */}
              <div className="pt-2">
                <h5 className="text-xs font-bold text-[#C59B63] mb-2 flex items-center justify-end gap-1.5">
                  <span>طرق الدفع والتقسيط المعتمدة</span>
                  <CreditCard className="w-3.5 h-3.5 text-[#C59B63]" />
                </h5>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {/* ValU Installment */}
                  <div className="bg-[#002D62] text-[#FFDD00] font-black text-[11px] px-2.5 py-1 rounded-md shadow-xs border border-white/10">
                    ValU تقسيط
                  </div>
                  {/* Visa Badge */}
                  <div className="bg-white rounded-md px-2.5 py-1 flex items-center justify-center shadow-xs">
                    <span className="text-[#1A1F71] font-black text-xs tracking-wider">VISA</span>
                  </div>
                  {/* Mastercard Badge */}
                  <div className="bg-white rounded-md px-2 py-1 flex items-center justify-center gap-0.5 shadow-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EB001B] inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F79E1B] -ms-1.5 inline-block opacity-90" />
                  </div>
                  {/* Cash on Delivery */}
                  <div className="bg-emerald-800 text-white font-bold text-[10px] px-2 py-1 rounded-md shadow-xs flex items-center gap-1">
                    <Banknote className="w-3 h-3" />
                    <span>الدفع عند الاستلام</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 2. Quick Links (2 cols) ── */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-[#C59B63] flex items-center justify-end gap-2">
                <span>أقسام المعرض</span>
                <span className="w-4 h-px bg-[#C59B63]/50" />
              </h4>
              <ul className="space-y-2 text-xs text-white/80 font-medium">
                <li>
                  <Link href="/products?category=مكاتب" className="hover:text-[#C59B63] transition-colors">
                    مكاتب تنفيذية ومحطات عمل
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=جزامات" className="hover:text-[#C59B63] transition-colors">
                    جزامات مودرن ووحدات تخزين
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=مكاتب استقبال" className="hover:text-[#C59B63] transition-colors">
                    مكاتب وكاونترات استقبال
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=كراسي جلد" className="hover:text-[#C59B63] transition-colors">
                    كراسي مدراء جلد فاخرة
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=كراسي طبية" className="hover:text-[#C59B63] transition-colors">
                    كراسي شبك طبية هيدروليكية
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=كراسي بار" className="hover:text-[#C59B63] transition-colors">
                    كراسي بار وكاونتر
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=وحدات ادراج تخزين" className="hover:text-[#C59B63] transition-colors">
                    وحدات أدراج وتخزين
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=ستائر مكتبية" className="hover:text-[#C59B63] transition-colors">
                    ستائر مكتبية ورول
                  </Link>
                </li>
                <li>
                  <Link href="/custom-order" className="hover:text-[#C59B63] transition-colors">
                    تصميم 3D وتفصيل خاص
                  </Link>
                </li>
              </ul>
            </div>

            {/* ── 3. Contact & Working Hours (3 cols) ── */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-[#C59B63] flex items-center justify-end gap-2">
                <span>المعرض ومواعيد العمل</span>
                <span className="w-4 h-px bg-[#C59B63]/50" />
              </h4>
              <ul className="space-y-2.5 text-xs text-white/85">
                <li>
                  <a
                    href="tel:01091084863"
                    className="flex items-center justify-end gap-2 hover:text-[#C59B63] transition-colors"
                  >
                    <span dir="ltr" className="font-bold">01091084863</span>
                    <Phone className="w-3.5 h-3.5 text-[#C59B63]" />
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:info@amazonfurniture.eg"
                    className="flex items-center justify-end gap-2 hover:text-[#C59B63] transition-colors"
                  >
                    <span>info@amazonfurniture.eg</span>
                    <Mail className="w-3.5 h-3.5 text-[#C59B63]" />
                  </a>
                </li>
                <li className="flex items-center justify-end gap-2">
                  <span>المنصورة - ش سامية الجمل تقاطع أحمد ماهر (أمازون للأثاث المكتبي)</span>
                  <MapPin className="w-3.5 h-3.5 text-[#C59B63] shrink-0" />
                </li>
                <li className="flex items-center justify-end gap-2 pt-1 border-t border-white/10 text-[#E8D4B0]">
                  <span>مواعيد العمل: يومياً من 10:00 ص حتى 10:00 م</span>
                  <Clock className="w-3.5 h-3.5 text-[#C59B63] shrink-0" />
                </li>
              </ul>
            </div>

            {/* ── 4. Google Maps Showroom Embed (3 cols) ── */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-[#C59B63] flex items-center justify-end gap-2">
                <span>موقع المعرض على الخريطة</span>
                <span className="w-4 h-px bg-[#C59B63]/50" />
              </h4>
              <div className="rounded-2xl overflow-hidden border border-white/15 shadow-md h-40 relative group">
                <iframe
                  title="Amazon Furniture Mansoura Showroom"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13697.877839352932!2d31.3654!3d31.0425!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14f79db7b6d19119%3A0xb35151f1f1d7a8d5!2sFaculty%20of%20Engineering%2C%20Mansoura%20University!5e0!3m2!1sen!2seg!4v1700000000000!5m2!1sen!2seg"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full filter contrast-105"
                />
                <a
                  href="https://maps.app.goo.gl/NP3m16vbWodtcp9c8?g_st=ic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 bg-[#1F2421]/60 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2"
                >
                  <MapPin className="w-4 h-4 text-[#C59B63]" />
                  <span>فتح في خرائط Google ↗</span>
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* ── Bottom Bar: Copyright & Back To Top Button ── */}
        <div className="border-t border-[#2D3530] bg-[#171B19]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
            <div className="w-8 hidden sm:block" />
            <p className="text-white/60 text-xs text-center flex-1">
              2026 Amazon Furniture © جميع الحقوق محفوظة — أثاث مكتبي وتنفيذي بمعايير أوروبية
            </p>
            <button
              onClick={scrollToTop}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#C59B63] hover:text-[#1F2421] text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20"
              aria-label="الرجوع للأعلى"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
