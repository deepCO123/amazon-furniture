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
  const mounted = useHydrated();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
      <div className="min-h-screen -mt-16 lg:-mt-20 bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#C5A880]/10 border border-[#C5A880]/30 flex items-center justify-center mx-auto text-[#C5A880]">
            <ShieldCheck size={36} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              لوحة تحكم Amazon Furniture
            </h2>
            <p className="text-sm text-slate-400">
              يرجى تسجيل الدخول كمسؤول للمتابعة وإدارة المنتجات
            </p>
          </div>
          <Link
            href="/admin/login"
            className="block w-full py-3.5 px-4 rounded-xl bg-[#C5A880] hover:bg-[#b0936b] text-slate-950 font-bold text-base transition-all shadow-lg"
          >
            تسجيل الدخول الآن
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <Store size={14} />
            <span>العودة للمتجر الرئيسي</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen -mt-16 lg:-mt-20 bg-[#F8F9FA] text-slate-900 flex flex-col font-sans" dir="rtl">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand & Title */}
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-xs border border-[#C5A880]/40">
                <Image
                  src="/logo-icon.png"
                  alt="Amazon Furniture"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                    Amazon Furniture
                  </span>
                  <span className="bg-[#C5A880]/20 text-[#8B6E45] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    لوحة الإدارة
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  نظام إدارة المنتجات والتحديث الفوري
                </p>
              </div>
            </Link>
          </div>

          {/* User actions */}
          <div className="flex items-center gap-3">
            {/* View Store button */}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <ExternalLink size={14} />
              <span>معاينة المتجر ↗</span>
            </Link>

            {/* Admin User badge */}
            <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
              <div className="w-7 h-7 rounded-full bg-[#C5A880]/20 text-[#8B6E45] flex items-center justify-center font-bold">
                M
              </div>
              <div className="text-start">
                <span className="font-bold text-slate-800 block leading-tight">
                  Mohamed Esmaeil
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold block">
                  ● المدير العام
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors border border-transparent hover:border-red-200"
              title="تسجيل الخروج"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <p>
          لوحة تحكم منتجات <strong>Amazon Furniture</strong> • تأسس عام 1994 • بإشراف الأستاذ محمد إسماعيل
        </p>
      </footer>
    </div>
  );
}
