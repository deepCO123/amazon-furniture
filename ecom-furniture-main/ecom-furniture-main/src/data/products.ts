import type { Product } from "@/types";
import productsJson from "@/data/products.json";

export const products: Product[] = productsJson as Product[];

export const getProductBySlug = (slug: string) =>
  products.find((p) => p.slug === slug);

export const getFeaturedProducts = () =>
  products.filter((p) => p.featured);

export const getProductsByCategory = (category: string) =>
  products.filter(
    (p) => p.category.toLowerCase() === category.toLowerCase()
  );

export const getRelatedProducts = (productId: string, category: string) =>
  products
    .filter((p) => p.id !== productId && p.category === category)
    .slice(0, 4);
