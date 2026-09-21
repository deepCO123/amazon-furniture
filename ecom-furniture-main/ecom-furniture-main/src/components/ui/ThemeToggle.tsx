"use client";

import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";
import { useHydrated } from "@/hooks/useHydrated";

interface ThemeToggleProps {
  variant?: "header" | "sidebar" | "minimal";
  className?: string;
}

export default function ThemeToggle({
  variant = "header",
  className = "",
}: ThemeToggleProps) {
  const { theme, toggleTheme, setTheme } = useThemeStore();
  const mounted = useHydrated();

  // Keep document element class in sync
  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.remove("dark", "light");
      document.documentElement.classList.add(theme);
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme, mounted]);

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-xl bg-slate-800/40 animate-pulse ${className}`}
      />
    );
  }

  const isDark = theme === "dark";

  if (variant === "sidebar") {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
          isDark
            ? "bg-[#171B24] hover:bg-[#1E2330] text-slate-300 hover:text-white border border-[#262C3D]"
            : "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 border border-slate-200"
        } ${className}`}
        title={isDark ? "التبديل إلى الوضع النهاري (Light Mode)" : "التبديل إلى الوضع الليلي (Dark Mode)"}
      >
        <div className="flex items-center gap-2">
          {isDark ? (
            <Moon size={15} className="text-cyan-400" />
          ) : (
            <Sun size={15} className="text-amber-500" />
          )}
          <span>{isDark ? "الوضع الليلي" : "الوضع النهاري"}</span>
        </div>
        <div
          className={`w-8 h-4 rounded-full p-0.5 transition-colors flex items-center ${
            isDark ? "bg-cyan-500/30 justify-end" : "bg-amber-500/30 justify-start"
          }`}
        >
          <div
            className={`w-3 h-3 rounded-full shadow-xs transition-transform ${
              isDark ? "bg-cyan-400" : "bg-amber-500"
            }`}
          />
        </div>
      </button>
    );
  }

  if (variant === "minimal") {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
          isDark
            ? "bg-[#171B24] hover:bg-[#1E2330] text-cyan-400 border border-[#262C3D]"
            : "bg-slate-100 hover:bg-slate-200 text-amber-600 border border-slate-300 shadow-xs"
        } ${className}`}
        title={isDark ? "التبديل للوضع النهاري (Light Mode)" : "التبديل للوضع الليلي (Dark Mode)"}
        aria-label="تبديل المظهر"
      >
        {isDark ? (
          <Sun size={17} className="text-amber-400 hover:rotate-45 transition-transform" />
        ) : (
          <Moon size={17} className="text-indigo-600 hover:-rotate-12 transition-transform" />
        )}
      </button>
    );
  }

  // Default "header" pill toggle
  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
        isDark
          ? "bg-[#171B24] hover:bg-[#1E2330] text-slate-200 border border-[#262C3D] hover:border-cyan-500/40"
          : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs hover:border-amber-400/50"
      } ${className}`}
      title={isDark ? "التبديل إلى الوضع النهاري (Light Mode)" : "التبديل إلى الوضع الليلي (Dark Mode)"}
    >
      <div className="flex items-center gap-1.5">
        <span
          className={`p-1 rounded-lg transition-colors ${
            isDark ? "bg-cyan-500/15 text-cyan-400" : "bg-amber-500/15 text-amber-600"
          }`}
        >
          {isDark ? <Moon size={14} /> : <Sun size={14} />}
        </span>
        <span>{isDark ? "الوضع الليلي" : "الوضع النهاري"}</span>
      </div>
      <span
        className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
          isDark ? "bg-[#0E1119] text-cyan-400 border border-cyan-500/20" : "bg-slate-100 text-slate-600 border border-slate-200"
        }`}
      >
        {isDark ? "DARK" : "LIGHT"}
      </span>
    </button>
  );
}
