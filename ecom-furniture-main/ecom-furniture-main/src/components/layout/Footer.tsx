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
  User,
} from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import { useLanguageStore } from "@/store/languageStore";
import { getTranslation } from "@/lib/translations";
const footerLinks = {
  shop: [
    { label: "كراسي مكتب", href: "/products" },
    { label: "كراسي جيمينج", href: "/products" },
    { label: "مكاتب مديرين وموظفين", href: "/products" },
    { label: "كراسي طبية إرجونوميك", href: "/products" },
    { label: "ركن واستقبال مكاتب", href: "/products" },
    { label: "ستائر مكتبية", href: "/products" },
    { label: "استشارة مجانية بالمنصورة 🎁", href: "/#consultation" },
  ],
  company: [
    { label: "عن المعرض والمصنع", href: "/about" },
    { label: "تواصل معنا", href: "/contact" },
    { label: "الموقع في المنصورة (Google)", href: "https://maps.app.goo.gl/NP3m16vbWodtcp9c8?g_st=ic" },
    { label: "احجز استشارة مجانية", href: "/#consultation" },
  ],
  support: [
    { label: "التركيب: مجاناً 100%", href: "/contact" },
    { label: "معاينة المنصورة مجاناً", href: "/#consultation" },
    { label: "ميتنج فيديو أونلاين", href: "/#consultation" },
    { label: "الضمان والاستبدال", href: "/contact" },
  ],
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
    <div className="border-b border-white/10 lg:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 lg:py-0 lg:pointer-events-none"
      >
        <h3 className="font-semibold text-lg">{title}</h3>
        <ChevronDown
          size={18}
          className={`lg:hidden transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden lg:!h-auto lg:!opacity-100 lg:overflow-visible"
          >
            <div className="pb-4 lg:pb-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="hidden lg:block">{children}</div>
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

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-primary text-white">
      {/* ── Main footer ──────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand + Contact + Newsletter */}
          <div className="lg:col-span-5">
            <Link href="/" className="flex items-center mb-5 group">
              <div className="relative h-11 w-48 transition-transform duration-200 group-hover:scale-[1.02]">
                <Image
                  src="/amazon-furniture-logo-white.png"
                  alt={SITE_NAME}
                  fill
                  sizes="192px"
                  className="object-contain object-right"
                />
              </div>
            </Link>
            <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-md">
              {t.footerDesc}
            </p>

            {/* Contact Details */}
            <div className="space-y-3 text-sm text-white/80 mb-8 bg-white/5 p-4 rounded-xl border border-white/10">
              {/* Manager */}
              <div className="flex items-center gap-2.5 text-accent-light font-semibold">
                <User size={16} className="shrink-0 text-accent" />
                <span>{t.manager} — {t.managerTitle}</span>
              </div>

              {/* Phone */}
              <a
                href="tel:+201091084863"
                className="flex items-center gap-2.5 hover:text-accent transition-colors"
                title={t.callUs}
              >
                <Phone size={16} className="shrink-0 text-accent" />
                <span dir="ltr" className="font-semibold">+20 109 1084863</span>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/201091084863"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-[#25D366] hover:text-[#3ce07a] transition-colors font-semibold"
                title={t.chatWhatsApp}
              >
                <MessageCircle size={16} className="shrink-0" />
                <span>{t.chatWhatsApp}: <strong dir="ltr">+20 109 1084863</strong></span>
              </a>

              {/* Google Maps */}
              <a
                href="https://maps.app.goo.gl/NP3m16vbWodtcp9c8?g_st=ic"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:text-accent transition-colors"
                title={t.openInMaps}
              >
                <MapPin size={16} className="shrink-0 text-accent" />
                <span className="underline underline-offset-4">
                  المعرض والمصنع: المنصورة، محافظة الدقهلية (خرائط Google Maps)
                </span>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/share/19YB7qVNxZ/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-[#1877F2] hover:brightness-125 transition-all font-semibold"
                title={t.facebookPage}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
                <span>{t.facebookPage}</span>
              </a>

              {/* Email */}
              <a
                href="mailto:hello@amazonfurniture.com"
                className="flex items-center gap-2.5 hover:text-accent transition-colors"
              >
                <Mail size={16} className="shrink-0 text-accent" />
                <span>hello@amazonfurniture.com</span>
              </a>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-semibold text-sm mb-2">{t.newsletterTitle}</h4>
              <p className="text-white/60 text-xs mb-3">{t.newsletterSubtitle}</p>
              {subscribed ? (
                <p className="text-accent text-sm">{t.subscribedMsg}</p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                  <input
                    type="email"
                    placeholder={t.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-sm placeholder:text-white/40 focus:border-accent focus:ring-1 focus:ring-accent/30 min-w-0"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-accent hover:bg-accent-light text-primary font-bold rounded-lg transition-colors shrink-0 text-sm"
                  >
                    {t.subscribe}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Shop Links */}
          <div className="lg:col-span-2 lg:col-start-6">
            <MobileAccordion title="Shop">
              <ul className="space-y-2.5">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/60 hover:text-accent transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </MobileAccordion>
          </div>

          {/* Company Links */}
          <div className="lg:col-span-2">
            <MobileAccordion title="Company">
              <ul className="space-y-2.5">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/60 hover:text-accent transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </MobileAccordion>
          </div>

          {/* Support Links */}
          <div className="lg:col-span-2">
            <MobileAccordion title="Support">
              <ul className="space-y-2.5">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/60 hover:text-accent transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </MobileAccordion>
          </div>

          {/* Social + Trust */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-lg mb-4 hidden lg:block">
              Follow Us
            </h3>
            <h3 className="font-semibold text-lg mb-4 lg:hidden">Connect</h3>

            {/* Social icons */}
            <div className="flex gap-3 mb-8">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent/30 transition-colors text-white hover:text-accent"
                  aria-label={social.label}
                  title={social.label}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>

            {/* Trust badges */}
            <div className="space-y-3">
              {[
                { icon: Lock, text: "SSL Secure" },
                { icon: Shield, text: "Buyer Protection" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-white/40 text-xs">
                  <Icon size={12} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Payment methods + copyright ──────────── */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Visa */}
            <svg viewBox="0 0 48 32" className="h-6 w-auto" aria-label="Visa">
              <rect width="48" height="32" rx="4" fill="#1A1F71"/>
              <path d="M19.5 21h-3l1.9-11h3l-1.9 11zm7.8-10.7c-.6-.2-1.5-.5-2.7-.5-3 0-5 1.5-5 3.7 0 1.6 1.5 2.6 2.6 3.1 1.2.6 1.6.9 1.6 1.5 0 .8-1 1.2-1.9 1.2-1.2 0-1.9-.2-2.9-.6l-.4-.2-.4 2.5c.7.3 2 .6 3.4.6 3.2 0 5.3-1.5 5.3-3.8 0-1.3-.8-2.3-2.5-3.1-1-.5-1.7-.9-1.7-1.4 0-.5.6-1 1.8-1 1 0 1.8.2 2.4.5l.3.1.5-2.5zm6.4 0h-2.3c-.7 0-1.3.2-1.6.9l-4.5 10.1h3.2l.6-1.7h3.9l.4 1.7h2.8l-2.5-11zm-3.7 7.1l1.6-4.3.9 4.3h-2.5zM16.3 10l-2.8 7.5-.3-1.5c-.5-1.7-2.1-3.5-3.9-4.4l2.7 10h3.3l4.8-11.6h-3.8z" fill="#fff"/>
            </svg>
            {/* Mastercard */}
            <svg viewBox="0 0 48 32" className="h-6 w-auto" aria-label="Mastercard">
              <rect width="48" height="32" rx="4" fill="#252525"/>
              <circle cx="19" cy="16" r="8" fill="#EB001B"/>
              <circle cx="29" cy="16" r="8" fill="#F79E1B"/>
              <path d="M24 10.2a8 8 0 010 11.6 8 8 0 000-11.6z" fill="#FF5F00"/>
            </svg>
            {/* GCash */}
            <svg viewBox="0 0 48 32" className="h-6 w-auto" aria-label="GCash">
              <rect width="48" height="32" rx="4" fill="#007DFE"/>
              <text x="24" y="20" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold" fontFamily="Arial, sans-serif">GCash</text>
            </svg>
            {/* Maya */}
            <svg viewBox="0 0 48 32" className="h-6 w-auto" aria-label="Maya">
              <rect width="48" height="32" rx="4" fill="#00C4B4"/>
              <text x="24" y="20" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold" fontFamily="Arial, sans-serif">Maya</text>
            </svg>
          </div>
          <p className="text-white/40 text-xs text-center sm:text-end">
            &copy; 2026 {SITE_NAME}. {t.rightsReserved}
          </p>
        </div>
      </div>
    </footer>
  );
}
