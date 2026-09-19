"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "ar" | "sa" | "en";

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  dir: "rtl" | "ltr";
  currency: string;
  currencySymbol: string;
  rate: number; // Conversion rate relative to USD (USD = 1, EGP ~ 50, SAR ~ 3.75)
}

export const LANGUAGES: Record<Language, LanguageInfo> = {
  ar: {
    code: "ar",
    name: "Arabic (Egypt)",
    nativeName: "عربي (مصر)",
    flag: "🇪🇬",
    dir: "rtl",
    currency: "EGP",
    currencySymbol: "ج.م",
    rate: 50.0,
  },
  sa: {
    code: "sa",
    name: "Arabic (Saudi Arabia)",
    nativeName: "سعودي (المملكة)",
    flag: "🇸🇦",
    dir: "rtl",
    currency: "SAR",
    currencySymbol: "ر.س",
    rate: 3.75,
  },
  en: {
    code: "en",
    name: "English",
    nativeName: "English (US)",
    flag: "🇺🇸",
    dir: "ltr",
    currency: "USD",
    currencySymbol: "$",
    rate: 1.0,
  },
};

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  getLanguageInfo: () => LanguageInfo;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      language: "ar", // Default to Arabic for Egyptian & Arab market

      setLanguage: (lang) => {
        set({ language: lang });
        if (typeof document !== "undefined") {
          const info = LANGUAGES[lang];
          document.documentElement.dir = info.dir;
          document.documentElement.lang = lang === "sa" ? "ar-SA" : (lang === "ar" ? "ar-EG" : "en");
        }
      },

      getLanguageInfo: () => {
        const lang = get().language;
        return LANGUAGES[lang] || LANGUAGES.ar;
      },
    }),
    {
      name: "amazon-furniture-language",
      onRehydrateStorage: () => (state) => {
        if (typeof document !== "undefined" && state?.language) {
          const info = LANGUAGES[state.language] || LANGUAGES.ar;
          document.documentElement.dir = info.dir;
          document.documentElement.lang = state.language === "sa" ? "ar-SA" : (state.language === "ar" ? "ar-EG" : "en");
        }
      },
    }
  )
);
