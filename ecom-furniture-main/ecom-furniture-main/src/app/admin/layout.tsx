"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Store,
  Lock,
  Sparkles,
} from "lucide-react";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { useProductStore } from "@/store/productStore";
import { useThemeStore } from "@/store/themeStore";
import { useHydrated } from "@/hooks/useHydrated";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, checkSession, login, loading } = useAdminAuthStore();
  const { fetchProducts } = useProductStore();
  const { theme } = useThemeStore();
  const mounted = useHydrated();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleAdminLogin = async (overridePass?: string) => {
    setError("");
    const targetPass = overridePass || password || "Admin@Pass2026!";
    const res = await login("admin@amazonfurniture.eg", targetPass);
    if (!res.success) {
      setError(res.message || "بيانات اعتماد الدخول غير صحيحة.");
    }
  };

  useEffect(() => {
    fetchProducts();
    checkSession();
  }, [fetchProducts, checkSession]);

  // Sync html class on mount
  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.remove("dark", "light");
      document.documentElement.classList.add(theme);
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme, mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#C5A880] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-300">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  // Auth Guard
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0c0e14] text-white flex items-center justify-center p-4 font-sans" dir="rtl">
        <div className="bg-[#151922] border border-[#232736] rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-lg shadow-cyan-500/10">
            <ShieldCheck size={36} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white mb-2">
              لوحة تحكم AMAZON
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              يرجى تسجيل الدخول كمسؤول للمتابعة وإدارة المتجر والطلبات
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-xs text-right">
              {error}
            </div>
          )}

          <div className="space-y-3 text-right">
            <div className="relative">
              <input
                type="password"
                placeholder="كلمة مرور الأدمن (Admin@Pass2026!)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdminLogin();
                }}
                className="w-full py-3 pr-10 pl-4 bg-[#0c0e14] border border-[#2d3345] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <Lock size={16} className="absolute right-3.5 top-3.5 text-slate-400" />
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleAdminLogin()}
              className="w-full py-3.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-base transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "جاري التحقق..." : "تسجيل الدخول للمسؤول"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleAdminLogin("Admin@Pass2026!")}
              className="w-full py-2.5 px-3 rounded-xl bg-[#1e2330] hover:bg-[#282f42] text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-cyan-500/20 cursor-pointer"
            >
              <Sparkles size={14} />
              <span>دخول سريع كمسؤول تجريبي (1-Click ⚡)</span>
            </button>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/auth/login"
              className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
            >
              الانتقال إلى صفحة تسجيل الدخول العامة
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <Store size={14} />
              <span>العودة للمتجر الرئيسي</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`admin-dashboard min-h-screen font-sans transition-colors duration-200 selection:bg-blue-600 selection:text-white ${
        theme === "dark"
          ? "bg-[#0b0e14] text-slate-100"
          : "bg-[#F1F5F9] text-[#0F172A]"
      }`}
      data-admin="true"
      dir="rtl"
    >
      {children}
    </div>
  );
}
