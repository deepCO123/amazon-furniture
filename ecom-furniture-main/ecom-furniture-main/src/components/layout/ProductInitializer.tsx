"use client";

import { useEffect } from "react";
import { useProductStore } from "@/store/productStore";

export default function ProductInitializer() {
  const fetchProducts = useProductStore((s) => s.fetchProducts);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return null;
}
