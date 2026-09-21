"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types";
import { products as fallbackProducts } from "@/data/products";
import { apiClient } from "@/lib/apiClient";

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Partial<Product>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<boolean>;
  toggleStock: (id: string) => Promise<void>;
  updateStockQuantity: (id: string, quantity: number) => Promise<Product | undefined>;
  toggleFeatured: (id: string) => Promise<void>;
  getProductBySlug: (slug: string) => Product | undefined;
  getFeaturedProducts: () => Product[];
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: fallbackProducts,
      loading: false,
      error: null,
      lastFetched: null,

      fetchProducts: async () => {
        set({ loading: true, error: null });
        try {
          const data = await apiClient.getProducts();
          if (Array.isArray(data)) {
            set({ products: data, loading: false, lastFetched: Date.now() });
          } else {
            set({ loading: false });
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Failed to fetch products";
          console.error("fetchProducts error:", err);
          set({ loading: false, error: message });
        }
      },

      addProduct: async (productData) => {
        set({ loading: true, error: null });
        try {
          const created = await apiClient.createProduct(productData);
          set((state) => ({
            products: [created, ...state.products.filter((p) => p.id !== created.id)],
            loading: false,
          }));
          return created;
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Failed to add product";
          set({ loading: false, error: message });
          throw err;
        }
      },

      updateProduct: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          const updated = await apiClient.updateProduct(id, updates);
          set((state) => ({
            products: state.products.map((p) => (p.id === id ? updated : p)),
            loading: false,
          }));
          return updated;
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Failed to update product";
          set({ loading: false, error: message });
          throw err;
        }
      },

      deleteProduct: async (id) => {
        set({ loading: true, error: null });
        try {
          await apiClient.deleteProduct(id);
          set((state) => ({
            products: state.products.filter((p) => p.id !== id),
            loading: false,
          }));
          return true;
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Failed to delete product";
          set({ loading: false, error: message });
          throw err;
        }
      },

      toggleStock: async (id) => {
        const product = get().products.find((p) => p.id === id);
        if (!product) return;
        const nextInStock = !product.inStock;
        await get().updateProduct(id, {
          inStock: nextInStock,
          stockQuantity: nextInStock ? (product.stockQuantity && product.stockQuantity > 0 ? product.stockQuantity : 5) : 0,
        });
      },

      updateStockQuantity: async (id, quantity) => {
        const product = get().products.find((p) => p.id === id);
        if (!product) return;
        const validQuantity = Math.max(0, quantity);
        return await get().updateProduct(id, {
          stockQuantity: validQuantity,
          inStock: validQuantity > 0,
        });
      },

      toggleFeatured: async (id) => {
        const product = get().products.find((p) => p.id === id);
        if (!product) return;
        await get().updateProduct(id, { featured: !product.featured });
      },

      getProductBySlug: (slug) => {
        return get().products.find((p) => p.slug === slug);
      },

      getFeaturedProducts: () => {
        return get().products.filter((p) => p.featured);
      },
    }),
    {
      name: "amazon-furniture-products-v1",
      partialize: (state) => ({ products: state.products }),
    }
  )
);
