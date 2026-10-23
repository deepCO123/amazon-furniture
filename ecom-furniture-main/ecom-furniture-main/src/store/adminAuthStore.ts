"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "@/lib/apiClient";

interface AdminUser {
  name: string;
  role: string;
  email: string;
}

interface AdminAuthState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<boolean>;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      loading: false,

      login: async (email: string, password: string) => {
        set({ loading: true });
        const normalized = email.trim().toLowerCase();
        const requestEmail = normalized === "admin" ? "admin@amazonfurniture.eg" : normalized;

        try {
          const res = await apiClient.adminLogin(requestEmail, password);

          if (res.success && res.user) {
            // NOTE: Token is stored in HttpOnly cookie by the backend (secure)
            // We do NOT store it in localStorage to prevent XSS token theft
            set({
              isAuthenticated: true,
              loading: false,
              user: {
                name: res.user.name,
                role: "المدير العام / مسؤول المتجر",
                email: res.user.email,
              },
            });
            return { success: true };
          }

          set({ loading: false });
          return {
            success: false,
            message: res.message || "بيانات اعتماد الأدمن غير صحيحة.",
          };
        } catch {
          set({ loading: false });
          return {
            success: false,
            message: "حدث خطأ في الاتصال بالخادم.",
          };
        }
      },

      logout: async () => {
        try {
          await apiClient.logout();
        } catch {
          // Clear local state even if backend call fails
        }
        set({ isAuthenticated: false, user: null });
        if (typeof window !== "undefined") {
          localStorage.removeItem("woodcraft-auth");
        }
      },

      checkSession: async () => {
        try {
          const res = await apiClient.getMe();
          if (res.success && res.user && res.user.role === "admin") {
            set({
              isAuthenticated: true,
              user: {
                name: res.user.name || "محمد إسماعيل (المدير العام)",
                role: "المدير العام / مسؤول المتجر",
                email: res.user.email,
              },
            });
            return true;
          }
        } catch {
          // Session check failed
        }

        if (typeof window !== "undefined") {
          localStorage.removeItem("amazon_token");
        }
        set({ isAuthenticated: false, user: null });
        return false;
      },
    }),
    {
      name: "amazon-furniture-admin-auth",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);
