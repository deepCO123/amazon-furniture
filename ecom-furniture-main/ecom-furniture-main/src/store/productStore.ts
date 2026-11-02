"use client";

import { create } from "zustand";
import type { Product } from "@/types";
import { apiClient } from "@/lib/apiClient";
import initialProductsData from "@/data/products.json";

function getDeletedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem("amazon_deleted_product_ids");
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveDeletedId(id: string) {
  if (typeof window === "undefined") return;
  try {
    const set = getDeletedIds();
    set.add(id);
    localStorage.setItem(
      "amazon_deleted_product_ids",
      JSON.stringify(Array.from(set))
    );
  } catch {
    // Ignore storage quota errors
  }
}

const rawInitial = (initialProductsData as unknown as Product[]) || [];
const initialProducts = rawInitial;

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchProducts: (force?: boolean) => Promise<void>;
  addProduct: (product: Partial<Product>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<boolean>;
  toggleStock: (id: string) => Promise<void>;
  updateStockQuantity: (id: string, quantity: number) => Promise<Product | undefined>;
  toggleFeatured: (id: string) => Promise<void>;
  getProductBySlug: (slug: string) => Product | undefined;
  getFeaturedProducts: () => Product[];
}

export const useProductStore = create<ProductState>()((set, get) => ({
  products: initialProducts,
  loading: false,
  error: null,
  lastFetched: null,

  fetchProducts: async (force = false) => {
    const state = get();
    // High-performance Stale-While-Revalidate: Instant page navigation without blocking
    if (
      !force &&
      state.products.length > 0 &&
      state.lastFetched &&
      Date.now() - state.lastFetched < 180_000
    ) {
      return;
    }
    // Only show loading state on initial cold start if no products exist in RAM
    if (state.products.length === 0) {
      set({ loading: true, error: null });
    }
    try {
      const data = await apiClient.getProducts();
      const deleted = getDeletedIds();
      if (Array.isArray(data) && data.length > 0) {
        set({
          products: data.filter((p) => !deleted.has(p.id)),
          loading: false,
          lastFetched: Date.now(),
        });
      } else {
        set({ loading: false });
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch products";
      console.error("fetchProducts error:", err);
      set({ loading: false, error: message });
    }
  },

  addProduct: async (productData) => {
    set({ loading: true, error: null });
    try {
      const created = await apiClient.createProduct(productData);
      set((state) => ({
        products: [
          created,
          ...state.products.filter((p) => p.id !== created.id),
        ],
        loading: false,
      }));
      return created;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to add product";
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
      const message =
        err instanceof Error ? err.message : "Failed to update product";
      set({ loading: false, error: message });
      throw err;
    }
  },

  deleteProduct: async (id: string) => {
    // 1. Permanently register deleted ID in client storage
    saveDeletedId(id);

    // 2. Optimistically remove from active Zustand state
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
      loading: false,
      error: null,
    }));

    // 3. Propagate deletion to Backend API & MongoDB Atlas
    try {
      await apiClient.deleteProduct(id);
    } catch (err: unknown) {
      console.warn(
        `[ProductStore] Remote API delete notice for ${id} (safely persisted locally):`,
        err
      );
    }
    return true;
  },

  toggleStock: async (id) => {
    const product = get().products.find((p) => p.id === id);
    if (!product) return;
    const nextInStock = !product.inStock;
    await get().updateProduct(id, {
      inStock: nextInStock,
      stockQuantity: nextInStock
        ? product.stockQuantity && product.stockQuantity > 0
          ? product.stockQuantity
          : 5
        : 0,
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
    const deleted = getDeletedIds();
    return get().products.find((p) => p.slug === slug && !deleted.has(p.id));
  },

  getFeaturedProducts: () => {
    const deleted = getDeletedIds();
    return get().products.filter((p) => p.featured && !deleted.has(p.id));
  },
}));
