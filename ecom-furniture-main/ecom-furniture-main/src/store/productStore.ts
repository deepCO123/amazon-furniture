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
    // Also remove from custom products if it was a user-created item
    const custom = getCustomProducts().filter((p) => p.id !== id);
    localStorage.setItem("amazon_custom_products", JSON.stringify(custom));
  } catch {
    // Ignore storage quota errors
  }
}

function getCustomProducts(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("amazon_custom_products");
    return raw ? (JSON.parse(raw) as Product[]) : [];
  } catch {
    return [];
  }
}

function saveCustomProduct(product: Product) {
  if (typeof window === "undefined") return;
  try {
    const custom = getCustomProducts().filter((p) => p.id !== product.id);
    custom.unshift(product);
    localStorage.setItem("amazon_custom_products", JSON.stringify(custom));
  } catch {
    // Ignore storage quota
  }
}

function getUpdatedProducts(): Record<string, Partial<Product>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("amazon_updated_products");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveUpdatedProduct(id: string, updates: Partial<Product>) {
  if (typeof window === "undefined") return;
  try {
    const current = getUpdatedProducts();
    current[id] = { ...(current[id] || {}), ...updates };
    localStorage.setItem("amazon_updated_products", JSON.stringify(current));
  } catch {
    // Ignore storage quota
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
      let baseList: Product[] = [];
      try {
        const data = await apiClient.getProducts();
        if (Array.isArray(data) && data.length > 0) {
          baseList = data;
        } else {
          baseList = initialProducts;
        }
      } catch {
        baseList = initialProducts;
      }

      const deleted = getDeletedIds();
      const custom = getCustomProducts();
      const updatedMap = getUpdatedProducts();

      // Merge: Custom products first, then base products
      const customIds = new Set(custom.map((c) => c.id));
      let merged: Product[] = [
        ...custom,
        ...baseList.filter((p) => !customIds.has(p.id)),
      ];

      // Filter out deleted products
      merged = merged.filter((p) => !deleted.has(p.id));

      // Apply locally persisted updates
      merged = merged.map((p) =>
        updatedMap[p.id] ? ({ ...p, ...updatedMap[p.id] } as Product) : p
      );

      set({
        products: merged,
        loading: false,
        lastFetched: Date.now(),
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch products";
      console.error("fetchProducts error:", err);
      set({ loading: false, error: message });
    }
  },

  addProduct: async (productData) => {
    set({ loading: true, error: null });

    const timestamp = Date.now();
    const id = productData.id || `prod-${timestamp}`;
    const baseSlug = (productData.name || "product")
      .toLowerCase()
      .replace(/[^a-z0-9\u0621-\u064A]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const slug = productData.slug || `${baseSlug || "product"}-${timestamp.toString(36)}`;

    const newProduct: Product = {
      id,
      slug,
      name: productData.name || "منتج جديد",
      price: typeof productData.price === "number" ? productData.price : Number(productData.price) || 0,
      originalPrice: productData.originalPrice ? Number(productData.originalPrice) : undefined,
      images: Array.isArray(productData.images) && productData.images.length > 0 ? productData.images : ["/images/products/desk-default.jpg"],
      category: productData.category || "office-desks",
      description: productData.description || "أثاث مكتبي عالي الجودة من أمازون للأثاث المكتبي.",
      material: productData.material || "خشب MDF إسباني عالي الكثافة",
      color: productData.color || "أسود / بني",
      dimensions: productData.dimensions || { width: 120, height: 75, depth: 80 },
      weight: productData.weight || 25,
      stockQuantity: typeof productData.stockQuantity === "number" ? productData.stockQuantity : 10,
      inStock: productData.inStock ?? true,
      featured: productData.featured ?? false,
      tags: productData.tags || [],
      ...productData,
    } as Product;

    // 1. Immediately persist locally in client storage
    saveCustomProduct(newProduct);

    // 2. Optimistically add to Zustand state
    set((state) => ({
      products: [
        newProduct,
        ...state.products.filter((p) => p.id !== newProduct.id),
      ],
      loading: false,
    }));

    // 3. Sync to API / Database in the background
    try {
      const serverProduct = await apiClient.createProduct(newProduct);
      if (serverProduct && serverProduct.id) {
        saveCustomProduct(serverProduct);
        set((state) => ({
          products: [
            serverProduct,
            ...state.products.filter((p) => p.id !== serverProduct.id),
          ],
        }));
        return serverProduct;
      }
    } catch (err: unknown) {
      console.warn(
        `[ProductStore] Remote API create notice for ${id} (safely persisted locally):`,
        err
      );
    }

    return newProduct;
  },

  updateProduct: async (id, updates) => {
    // 1. Save update locally
    saveUpdatedProduct(id, updates);

    // 2. Optimistically update state
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? ({ ...p, ...updates } as Product) : p
      ),
      loading: false,
    }));

    // 3. Sync to API / Database
    try {
      const updated = await apiClient.updateProduct(id, updates);
      if (updated && updated.id) {
        return updated;
      }
    } catch (err: unknown) {
      console.warn(
        `[ProductStore] Remote API update notice for ${id} (safely persisted locally):`,
        err
      );
    }
    const current = get().products.find((p) => p.id === id);
    return current!;
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
