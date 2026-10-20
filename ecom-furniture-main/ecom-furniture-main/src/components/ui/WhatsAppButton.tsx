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
      className="fixed bottom-20 sm:bottom-6 start-4 sm:start-6 z-40 flex items-center group mb-[env(safe-area-inset-bottom)]"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110 cursor-pointer min-w-[48px] min-h-[48px]"
        title="تواصل عبر واتساب"
        aria-label="WhatsApp Contact"
      >
        {/* Pulsing subtle ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-ping pointer-events-none" />

        {/* WhatsApp Icon */}
        <MessageCircle size={26} className="relative z-10" />

        {/* Clean subtle hover tooltip */}
        <span className="absolute start-full ms-3 px-2.5 py-1 bg-[#292321] text-white text-xs font-bold rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap hidden sm:inline-block">
          تواصل عبر واتساب
        </span>
      </a>
    </motion.aside>
  );
}
