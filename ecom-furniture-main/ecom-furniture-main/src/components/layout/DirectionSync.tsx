"use client";

import { useEffect } from "react";
import { useLanguageStore, LANGUAGES } from "@/store/languageStore";

export default function DirectionSync() {
  const { language } = useLanguageStore();

  useEffect(() => {
    const info = LANGUAGES[language] || LANGUAGES.ar;
    if (typeof document !== "undefined") {
      document.documentElement.dir = info.dir;
      document.documentElement.lang =
        language === "sa" ? "ar-SA" : language === "ar" ? "ar-EG" : "en";
    }
  }, [language]);

  return null;
}
