"use client";

import { useEffect } from "react";
import { useProductStore } from "@/store/productStore";
import { useAuthStore } from "@/store/authStore";

export default function ProductInitializer() {
  const fetchProducts = useProductStore((s) => s.fetchProducts);
  const checkSession = useAuthStore((s) => s.checkSession);

  useEffect(() => {
    fetchProducts();

    // Check session on load and when returning from Google OAuth
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("auth") === "google_success") {
        checkSession();
        // Clean URL parameter without reloading
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      } else {
        checkSession();
      }
    }
  }, [fetchProducts, checkSession]);

  return null;
}
