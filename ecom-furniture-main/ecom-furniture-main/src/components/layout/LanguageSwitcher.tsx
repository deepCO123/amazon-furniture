"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { useLanguageStore, LANGUAGES, type Language } from "@/store/languageStore";

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage } = useLanguageStore();
  const current = LANGUAGES[language] || LANGUAGES.ar;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block text-start">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-surface-dark bg-white/80 hover:bg-surface hover:border-accent/50 transition-all text-xs sm:text-sm font-medium text-primary shadow-xs"
        aria-label="Select Language"
        title="تغيير اللغة / Change Language"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden sm:inline font-semibold">{current.nativeName.split(" ")[0]}</span>
        <span className="sm:hidden font-semibold uppercase">{current.code}</span>
        <ChevronDown size={14} className={`text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-1.5 end-0 z-50 w-52 bg-white rounded-xl shadow-xl border border-surface-dark py-1.5 overflow-hidden"
          >
            <div className="px-3 py-1.5 text-[11px] font-semibold text-muted tracking-wider uppercase border-b border-surface-dark">
              اللغة والعملة / Language
            </div>

            {(Object.keys(LANGUAGES) as Language[]).map((key) => {
              const item = LANGUAGES[key];
              const isSelected = item.code === language;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setLanguage(key);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm text-start hover:bg-surface transition-colors ${
                    isSelected ? "bg-surface text-accent-dark font-bold" : "text-primary"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg leading-none">{item.flag}</span>
                    <div className="flex flex-col leading-tight">
                      <span className="font-semibold">{item.nativeName}</span>
                      <span className="text-[11px] text-muted">
                        {item.name} • {item.currencySymbol}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check size={16} className="text-accent shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
