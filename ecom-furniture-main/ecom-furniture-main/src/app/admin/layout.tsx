"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { useAuthStore } from "@/store/authStore";
import { useProductStore } from "@/store/productStore";
import { useThemeStore } from "@/store/themeStore";
import { useHydrated } from "@/hooks/useHydrated";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, checkSession } = useAdminAuthStore();
  const { user } = useAuthStore();
  const { fetchProducts } = useProductStore();
  const { theme } = useThemeStore();
  const mounted = useHydrated();

  const isAuthorized = isAuthenticated || user?.role === "admin";

  useEffect(() => {
    fetchProducts();
    checkSession();
  }, [fetchProducts, checkSession]);

  // Sync user role to admin store if logged in via unified login
  useEffect(() => {
    if (user?.role === "admin" && !isAuthenticated) {
      useAdminAuthStore.setState({
        isAuthenticated: true,
        user: {
          name: user.name,
          role: "المدير العام / مسؤول المتجر",
          email: user.email,
        },
      });
    }
  }, [user, isAuthenticated]);

  // Sync html class on mount
  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.remove("dark", "light");
      document.documentElement.classList.add(theme);
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme, mounted]);

  // Redirect unauthenticated users directly to login screen without showing redundant layout login
  useEffect(() => {
    if (mounted && !isAuthorized) {
      router.replace("/auth/login");
    }
  }, [mounted, isAuthorized, router]);

  if (!mounted || !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0b0e14] text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-300">جاري تحميل لوحة التحكم...</p>
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
