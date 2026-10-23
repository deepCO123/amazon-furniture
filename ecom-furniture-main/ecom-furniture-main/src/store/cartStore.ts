"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/types";
import { trackAddToCart } from "@/lib/analytics";

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, color?: string, curtainType?: string) => void;
  removeItem: (productId: string, color?: string, curtainType?: string) => void;
  updateQuantity: (productId: string, quantity: number, color?: string, curtainType?: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1, color, curtainType) => {
        // Track AddToCart for Meta Pixel and GA4
        trackAddToCart(product, quantity, color);

        set((state) => {
          const existing = state.items.find(
            (item) => item.product.id === product.id && item.color === color && item.curtainType === curtainType
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id && item.color === color && item.curtainType === curtainType
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return { items: [...state.items, { product, quantity, color, curtainType }] };
        });
      },

      removeItem: (productId, color, curtainType) => {
        const targetColor = color || undefined;
        const targetCurtain = curtainType || undefined;
        set((state) => ({
          items: state.items.filter((item) => {
            if (item.product.id !== productId) return true;
            const itemColor = item.color || undefined;
            if (targetColor !== undefined && itemColor !== targetColor) return true;
            const itemCurtain = item.curtainType || undefined;
            if (targetCurtain !== undefined && itemCurtain !== targetCurtain) return true;
            return false;
          }),
        }));
      },

      updateQuantity: (productId, quantity, color, curtainType) => {
        if (quantity <= 0) {
          get().removeItem(productId, color, curtainType);
          return;
        }
        const targetColor = color || undefined;
        const targetCurtain = curtainType || undefined;
        set((state) => ({
          items: state.items.map((item) => {
            if (item.product.id !== productId) return item;
            const itemColor = item.color || undefined;
            if (targetColor !== undefined && itemColor !== targetColor) return item;
            const itemCurtain = item.curtainType || undefined;
            if (targetCurtain !== undefined && itemCurtain !== targetCurtain) return item;
            return { ...item, quantity };
          }),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotal: () =>
        get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        ),

      getItemCount: () =>
        get().items.reduce((count, item) => count + item.quantity, 0),
    }),
    { name: "amazon-furniture-cart" }
  )
);
