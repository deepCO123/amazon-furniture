"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Order } from "@/types";
import { apiClient } from "@/lib/apiClient";

interface AuthStore {
  user: User | null;
  orders: Order[];
  loading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string, phone?: string, city?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  addOrder: (order: Order) => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      orders: [],
      loading: false,

      setUser: (user) => set({ user }),

      login: async (email, password) => {
        set({ loading: true });
        try {
          const res = await apiClient.customerLogin(email, password);

          if (res.success && res.user) {
            const loggedInUser: User = {
              id: res.user.id,
              name: res.user.name,
              email: res.user.email,
              avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(res.user.name)}&backgroundColor=c5a880`,
            };
            set({ user: loggedInUser, loading: false });
            return { success: true };
          }

          set({ loading: false });
          return { success: false, message: res.message || "بيانات الدخول غير صحيحة." };
        } catch {
          set({ loading: false });
          return { success: false, message: "حدث خطأ في الاتصال بالخادم." };
        }
      },

      register: async (name, email, password, phone, city) => {
        set({ loading: true });
        try {
          const res = await apiClient.customerRegister(name, email, password, phone, city);

          if (res.success && res.user) {
            const newUser: User = {
              id: res.user.id,
              name: res.user.name,
              email: res.user.email,
              phone: phone || "",
              city: city || "المنصورة",
              avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(res.user.name)}&backgroundColor=c5a880`,
            };
            set({ user: newUser, loading: false });

            // Sync with Next.js customer CRM (fire-and-forget)
            if (typeof window !== "undefined") {
              fetch("/api/customers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: newUser.name,
                  email: newUser.email,
                  phone: newUser.phone,
                  city: newUser.city,
                  provider: "credentials",
                }),
              }).catch((err) => console.warn("Background customer sync notice:", err));
            }

            return { success: true };
          }

          set({ loading: false });
          return { success: false, message: res.message || "فشل إنشاء الحساب." };
        } catch {
          set({ loading: false });
          return { success: false, message: "حدث خطأ في الاتصال بالخادم." };
        }
      },

      logout: async () => {
        try {
          await apiClient.logout();
        } catch {
          // Clear local state even if backend call fails
        }
        set({ user: null });
      },

      checkSession: async () => {
        try {
          const res = await apiClient.getMe();
          if (res.success && res.user) {
            // Session is valid — update user data from server
            const currentUser = get().user;
            set({
              user: {
                id: res.user.id,
                email: res.user.email,
                name: currentUser?.name || res.user.email.split("@")[0],
                avatar: currentUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(res.user.email)}&backgroundColor=c5a880`,
                phone: currentUser?.phone,
                city: currentUser?.city,
              },
            });
          } else {
            // Session expired or invalid — clear local user
            set({ user: null });
          }
        } catch {
          // Network error — keep existing user state (offline support)
        }
      },

      addOrder: (order) =>
        set((state) => ({ orders: [order, ...state.orders] })),

      isAuthenticated: () => get().user !== null,
    }),
    {
      name: "woodcraft-auth",
      partialize: (state) => ({
        user: state.user,
        orders: state.orders,
      }),
    }
  )
);
