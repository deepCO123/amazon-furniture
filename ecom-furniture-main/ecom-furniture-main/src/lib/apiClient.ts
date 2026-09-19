"use client";

/**
 * apiClient.ts
 * Centralized fetch wrapper for communicating with the Express backend.
 * - Uses relative URLs routed through Next.js rewrites (avoids CORS)
 * - Automatically includes credentials (HttpOnly cookies)
 * - Handles 401 responses consistently
 */

// Use relative URLs — Next.js rewrites proxy /api/auth/* to Express backend
const BACKEND_URL = "";

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  user?: T;
  data?: T;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      credentials: "include", // Required for HttpOnly cookies
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    try {
      const res = await fetch(url, config);
      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          message:
            data.message || `Request failed with status ${res.status}`,
        };
      }

      return data;
    } catch (error) {
      console.error(`[API Client] ${endpoint} error:`, error);
      return {
        success: false,
        message: "حدث خطأ في الاتصال بالخادم. يرجى المحاولة لاحقاً.",
      };
    }
  }

  // ─── Auth Endpoints ───────────────────────────────────

  async customerLogin(email: string, password: string, name?: string) {
    return this.request<{
      id: string;
      name: string;
      email: string;
      role: string;
      isNew?: boolean;
    }>("/api/auth/customer-login", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  }

  async customerRegister(
    name: string,
    email: string,
    password: string,
    phone?: string,
    city?: string
  ) {
    return this.request<{
      id: string;
      name: string;
      email: string;
      role: string;
      isNew?: boolean;
    }>("/api/auth/customer-login", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  }

  async adminLogin(email: string, password: string) {
    return this.request<{
      id: string;
      name: string;
      email: string;
      role: string;
    }>("/api/auth/admin-login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request("/api/auth/logout", { method: "POST" });
  }

  async getMe() {
    return this.request<{
      id: string;
      email: string;
      role: string;
    }>("/api/auth/me");
  }
}

export const apiClient = new ApiClient(BACKEND_URL);
export { BACKEND_URL };
