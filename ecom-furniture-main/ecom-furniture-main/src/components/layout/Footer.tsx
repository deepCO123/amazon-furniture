"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  Shield,
  Lock,
  MessageCircle,
} from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import { useLanguageStore } from "@/store/languageStore";
import { getTranslation } from "@/lib/translations";

const footerLinksData = {
  ar: {
    shop: [
      { label: "كراسي شبك", href: "/products?category=كراسي شبك" },
      { label: "كراسي طبية", href: "/products?category=كراسي طبية" },
      { label: "ترابيزة تليفزيون", href: "/products?category=ترابيزة تليفزيون" },
      { label: "ستائر مكتبية", href: "/products?category=ستائر مكتبية" },
      { label: "مكاتب", href: "/products?category=مكاتب" },
      { label: "انتريهات", href: "/products?category=انتريهات" },
    ],
    quickLinks: [
      { label: "عن المعرض والمصنع", href: "/about" },
      { label: "تواصل معنا", href: "/contact" },
      { label: "تتبع طلبك", href: "/track" },
      { label: "طلب استشارة ومعاينة مجانية", href: "/#consultation" },
      { label: "طلب تفصيل أثاث خاص", href: "/custom-order" },
    ],
    support: [
      { label: "الضمان والاسترجاع (10 سنوات)", href: "/return-policy" },
      { label: "الشروط والأحكام", href: "/terms" },
      { label: "سياسة الخصوصية", href: "/privacy" },
    ],
  },
  en: {
    shop: [
      { label: "Mesh Chairs", href: "/products?category=كراسي شبك" },
      { label: "Ergonomic Chairs", href: "/products?category=كراسي طبية" },
      { label: "TV Tables", href: "/products?category=ترابيزة تليفزيون" },
      { label: "Office Blinds", href: "/products?category=ستائر مكتبية" },
      { label: "Office Desks", href: "/products?category=مكاتب" },
      { label: "Living Sets", href: "/products?category=انتريهات" },
    ],
    quickLinks: [
      { label: "About Factory & Showroom", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Track Your Order", href: "/track" },
      { label: "Free Consultation & Inspection", href: "/#consultation" },
      { label: "Custom Furniture Order", href: "/custom-order" },
    ],
    support: [
      { label: "10-Year Warranty & Returns", href: "/return-policy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
};

const socials = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/19YB7qVNxZ/?mibextid=wwXIfr",
    icon: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z",
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/201091084863",
    icon: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z",
  },
  {
    label: "Google Maps",
    href: "https://maps.app.goo.gl/NP3m16vbWodtcp9c8?g_st=ic",
    icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  },
];

function MobileAccordion({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 lg:border-0 py-1 lg:py-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-2.5 lg:py-0 lg:pointer-events-none min-h-[40px] cursor-pointer"
        aria-expanded={open}
      >
        <h3 className="font-bold text-sm sm:text-base text-white tracking-wide">{title}</h3>
        <ChevronDown
          size={16}
          className={`lg:hidden transition-transform duration-300 text-white/60 ${
            open ? "rotate-180 text-white" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden lg:!h-auto lg:!opacity-100 lg:overflow-visible"
          >
            <div className="pt-1 pb-3 lg:py-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="hidden lg:block mt-3">{children}</div>
    </div>
  );
}

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { language } = useLanguageStore();

  if (pathname?.startsWith("/admin")) return null;

  const t = getTranslation(language);
  const currentLinks = language === "en" ? footerLinksData.en : footerLinksData.ar;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-[#1C1917] dark:bg-[#0A0D13] text-white border-t border-[#292524] dark:border-[#1E2536]">
      {/* ── Main footer: sleek, compact and clean ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Column 1: Brand & Direct Contact (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <Link href="/" className="inline-block group" aria-label="AMAZON">
              <Image
                src="/logo/amazon-horizontal-white.svg"
                alt="AMAZON"
                width={150}
                height={40}
                className="w-[135px] sm:w-[150px] h-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
              />
            </Link>
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed max-w-sm">
              {t.footerDesc}
            </p>

            {/* Direct Contact Links */}
            <div className="space-y-1.5 text-xs text-white/80 pt-1">
              <a
                href="tel:+201091084863"
                className="flex items-center gap-2 hover:text-[#C58B45] transition-colors"
                title={t.callUs}
              >
                <Phone size={14} className="shrink-0 text-[#C58B45]" />
                <span dir="ltr" className="font-bold">+20 109 1084863</span>
              </a>

              <a
                href="https://wa.me/201091084863"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#25D366] hover:text-[#3ce07a] transition-colors font-medium"
                title={t.chatWhatsApp}
              >
                <MessageCircle size={14} className="shrink-0" />
                <span>واتساب مباشر: <strong dir="ltr">+20 109 1084863</strong></span>
              </a>

              <a
                href="https://maps.app.goo.gl/NP3m16vbWodtcp9c8?g_st=ic"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#C58B45] transition-colors"
                title={t.openInMaps}
              >
                <MapPin size={14} className="shrink-0 text-[#C58B45]" />
                <span className="underline underline-offset-2">المعرض والمصنع: المنصورة، مصر</span>
              </a>

              <a
                href="mailto:hello@amazonfurniture.eg"
                className="flex items-center gap-2 hover:text-[#C58B45] transition-colors"
              >
                <Mail size={14} className="shrink-0 text-[#C58B45]" />
                <span>hello@amazonfurniture.eg</span>
              </a>
            </div>

            {/* Social Icons Row */}
            <div className="flex items-center gap-2.5 pt-2">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C58B45] hover:text-white transition-all text-white/80"
                  aria-label={social.label}
                  title={social.label}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Shop Categories (3 cols) */}
          <div className="lg:col-span-3">
            <MobileAccordion title={t.shop}>
              <ul className="space-y-2">
                {currentLinks.shop.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/60 hover:text-[#C58B45] transition-colors text-xs sm:text-sm block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </MobileAccordion>
          </div>

          {/* Column 3: Quick Links & Policies (2 cols) */}
          <div className="lg:col-span-2">
            <MobileAccordion title="روابط هامة">
              <ul className="space-y-2">
                {currentLinks.quickLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/60 hover:text-[#C58B45] transition-colors text-xs sm:text-sm block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                {currentLinks.support.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/60 hover:text-[#C58B45] transition-colors text-xs sm:text-sm block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </MobileAccordion>
          </div>

          {/* Column 4: Compact Newsletter & Trust (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white mb-1.5">{t.newsletterTitle}</h3>
              <p className="text-white/60 text-xs mb-2.5 leading-relaxed">{t.newsletterSubtitle}</p>
              {subscribed ? (
                <p className="text-[#C58B45] text-xs font-bold">{t.subscribedMsg}</p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-1.5">
                  <input
                    type="email"
                    placeholder={t.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 px-3 py-1.5 bg-white/10 border border-white/10 rounded-lg text-xs placeholder:text-white/40 focus:border-[#C58B45] focus:outline-none min-w-0"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#C58B45] hover:bg-[#b07837] text-white font-bold rounded-lg transition-colors shrink-0 text-xs cursor-pointer"
                  >
                    {t.subscribe}
                  </button>
                </form>
              )}
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-white/50 text-[11px]">
              <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                <Lock size={12} className="text-[#C58B45]" />
                <span>SSL 256-bit Secure</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                <Shield size={12} className="text-[#C58B45]" />
                <span>ضمان 10 سنوات معتمد</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Compact Bottom Bar: Payment Methods & Copyright ── */}
      <div className="border-t border-white/10 dark:border-white/5 bg-[#141211] dark:bg-[#07090E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Payment Methods */}
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span className="text-[11px] font-semibold text-white/40">طرق الدفع:</span>
            {/* Visa */}
            <span className="px-2 py-0.5 rounded bg-white text-[#1A1F71] font-black text-[10px] tracking-wider">
              VISA
            </span>
            {/* Mastercard */}
            <span className="px-2 py-0.5 rounded bg-[#252525] text-white font-bold text-[10px] flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EB001B] inline-block -mr-1" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#F79E1B] inline-block" />
            </span>
            {/* InstaPay */}
            <span className="px-2 py-0.5 rounded bg-[#5A287F] text-white font-bold text-[10px]">
              InstaPay
            </span>
            {/* Fawry */}
            <span className="px-2 py-0.5 rounded bg-[#FECE00] text-black font-extrabold text-[10px]">
              Fawry
            </span>
            {/* Cash on delivery */}
            <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-medium">
              الدفع عند الاستلام
            </span>
          </div>

          {/* Copyright */}
          <p className="text-white/40 text-[11px] text-center sm:text-end">
            &copy; 2026 {SITE_NAME}. {t.rightsReserved}
          </p>
        </div>
      </div>
    </footer>
  );
}
