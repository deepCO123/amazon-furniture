"use client";

import { useEffect } from "react";
import { useLanguageStore, LANGUAGES } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";

export default function DirectionSync() {
  const { language } = useLanguageStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    const info = LANGUAGES[language] || LANGUAGES.ar;
    if (typeof document !== "undefined") {
      document.documentElement.dir = info.dir;
      document.documentElement.lang =
        language === "sa" ? "ar-SA" : language === "ar" ? "ar-EG" : "en";
    }
  }, [language]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("dark", "light");
      document.documentElement.classList.add(theme);
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  return null;
}
