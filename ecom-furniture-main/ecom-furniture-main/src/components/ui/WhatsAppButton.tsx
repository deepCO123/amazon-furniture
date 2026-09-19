"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useLanguageStore } from "@/store/languageStore";
import { getTranslation } from "@/lib/translations";

export default function WhatsAppButton() {
  const pathname = usePathname();
  const { language } = useLanguageStore();

  if (pathname?.startsWith("/admin")) return null;

  const t = getTranslation(language);

  const phone = "201091084863";
  const encodedMsg = encodeURIComponent(t.whatsappDefaultMsg);
  const whatsappUrl = `https://wa.me/${phone}?text=${encodedMsg}`;

  return (
    <motion.aside
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      aria-label="WhatsApp Contact"
      className="fixed bottom-6 start-6 z-40 flex items-center group"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105"
        title={t.whatsappHelp}
      >
        {/* Pulsing ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/40 animate-ping pointer-events-none" />

        {/* WhatsApp Icon */}
        <MessageCircle size={24} className="shrink-0 relative z-10" />

        {/* Tooltip text for desktop */}
        <div className="hidden sm:flex flex-col text-start relative z-10 leading-tight">
          <span className="text-[11px] font-medium opacity-90">{t.whatsappHelp}</span>
          <span className="text-xs font-bold tracking-wide">واتساب مباشر</span>
        </div>
      </a>
    </motion.aside>
  );
}
