"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ExternalLink,
  LogOut,
  ShieldCheck,
  Store,
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
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout } = useAdminAuthStore();
  const { fetchProducts } = useProductStore();
  const { theme } = useThemeStore();
  const mounted = useHydrated();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Sync html class on mount
  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.remove("dark", "light");
      document.documentElement.classList.add(theme);
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme, mounted]);

  // Handle logout
  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

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

  // If on login page, render child without layout
  if (pathname === "/admin/login") {
    return <>{children}</>;
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
              لوحة تحكم Amazon Furniture
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              يرجى تسجيل الدخول كمسؤول للمتابعة وإدارة المتجر والطلبات
            </p>
          </div>
          <Link
            href="/admin/login"
            className="block w-full py-3.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-base transition-all shadow-lg shadow-cyan-500/25"
          >
            تسجيل الدخول الآن
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors pt-2"
          >
            <Store size={14} />
            <span>العودة للمتجر الرئيسي</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-200 selection:bg-cyan-500 selection:text-black ${
        theme === "dark"
          ? "bg-[#0b0e14] text-slate-100"
          : "bg-[#F3F5F9] text-slate-800"
      }`}
      dir="rtl"
    >
      {children}
    </div>
  );
}
