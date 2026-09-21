"use client";

/**
 * apiClient.ts
 * Centralized fetch wrapper for communicating with the Express backend.
 * - Uses relative URLs routed through Next.js rewrites (avoids CORS)
 * - Automatically includes credentials (HttpOnly cookies)
 * - Strongly typed endpoints for products, orders, auth, customers, consultations, quotations, returns, and emails.
 */

import type {
  Product,
  Order,
  User,
  ConsultationBooking,
  Quotation,
  ReturnRequest,
  EmailLog,
} from "@/types";

const BACKEND_URL = "";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  user?: T;
  data?: T;
  error?: string;
  [key: string]: unknown;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      credentials: "include", // Required for HttpOnly JWT cookies
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
            data.message || data.error || `Request failed with status ${res.status}`,
          error: data.error,
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
      body: JSON.stringify({ email, password, name, phone, city }),
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
      name?: string;
    }>("/api/auth/me");
  }

  getGoogleAuthUrl() {
    return "/api/auth/google";
  }

  // ─── Products Endpoints ───────────────────────────────

  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/products`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("[API Client] getProducts error:", err);
      return [];
    }
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const res = await fetch(`${this.baseUrl}/api/products`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to create product" }));
      throw new Error(err.error || err.message || "Failed to create product");
    }
    return res.json();
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const res = await fetch(`${this.baseUrl}/api/products`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to update product" }));
      throw new Error(err.error || err.message || "Failed to update product");
    }
    return res.json();
  }

  async deleteProduct(id: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/api/products?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to delete product" }));
      throw new Error(err.error || err.message || "Failed to delete product");
    }
    return true;
  }

  // ─── Orders Endpoints ─────────────────────────────────

  async getOrders(): Promise<Order[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/orders`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("[API Client] getOrders error:", err);
      return [];
    }
  }

  async createOrder(orderData: unknown): Promise<{ success: boolean; order?: Order; orderId?: string; error?: string }> {
    return this.request("/api/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  async updateOrderStatus(orderId: string, status: string): Promise<{ success: boolean; order?: Order }> {
    return this.request("/api/orders", {
      method: "PATCH",
      body: JSON.stringify({ orderId, status }),
    });
  }

  async deleteOrder(id: string): Promise<{ success: boolean }> {
    return this.request(`/api/orders?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  }

  // ─── Customers Endpoints ──────────────────────────────

  async getCustomers(): Promise<(User & { orders?: Order[] })[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/customers`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("[API Client] getCustomers error:", err);
      return [];
    }
  }

  async syncCustomer(customerData: Partial<User>): Promise<{ success: boolean; customer?: User }> {
    return this.request("/api/customers", {
      method: "POST",
      body: JSON.stringify(customerData),
    });
  }

  // ─── Consultations Endpoints ──────────────────────────

  async getConsultations(): Promise<ConsultationBooking[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/consultations`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("[API Client] getConsultations error:", err);
      return [];
    }
  }

  async createConsultation(bookingData: Partial<ConsultationBooking>): Promise<{ success: boolean; booking?: ConsultationBooking }> {
    return this.request("/api/consultations", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  }

  async updateConsultationStatus(id: string, status: string): Promise<{ success: boolean; booking?: ConsultationBooking }> {
    return this.request("/api/consultations", {
      method: "PATCH",
      body: JSON.stringify({ id, status }),
    });
  }

  // ─── Quotations Endpoints ─────────────────────────────

  async getQuotations(): Promise<Quotation[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/quotations`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("[API Client] getQuotations error:", err);
      return [];
    }
  }

  async createQuotation(quotationData: Partial<Quotation>): Promise<{ success: boolean; quotation?: Quotation }> {
    return this.request("/api/quotations", {
      method: "POST",
      body: JSON.stringify(quotationData),
    });
  }

  async deleteQuotation(id: string): Promise<{ success: boolean }> {
    return this.request(`/api/quotations?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  }

  // ─── Returns Endpoints ────────────────────────────────

  async getReturns(): Promise<ReturnRequest[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/returns`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("[API Client] getReturns error:", err);
      return [];
    }
  }

  async createReturn(returnData: Partial<ReturnRequest>): Promise<{ success: boolean; returnRequest?: ReturnRequest }> {
    return this.request("/api/returns", {
      method: "POST",
      body: JSON.stringify(returnData),
    });
  }

  async updateReturn(
    returnId: string,
    status: string,
    conditionAssessment?: string,
    refundAmount?: number
  ): Promise<{ success: boolean; returnRequest?: ReturnRequest }> {
    return this.request("/api/returns", {
      method: "PATCH",
      body: JSON.stringify({ returnId, status, conditionAssessment, refundAmount }),
    });
  }

  async updateReturnStatus(returnId: string, status: string): Promise<{ success: boolean; returnRequest?: ReturnRequest }> {
    return this.updateReturn(returnId, status);
  }

  // ─── Emails Endpoints ─────────────────────────────────

  async getEmails(): Promise<EmailLog[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/emails`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("[API Client] getEmails error:", err);
      return [];
    }
  }

  async sendEmail(payload: {
    type: "WELCOME" | "NEW_USER_ADMIN_ALERT" | "ORDER_CONFIRMATION";
    to: string;
    recipientName: string;
    orderId?: string;
    customerData?: unknown;
  }): Promise<{ success: boolean; emailId?: string }> {
    return this.request("/api/email", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // ─── Cache Stats ──────────────────────────────────────

  async getCacheStats() {
    return this.request("/api/cache-stats");
  }
}

export const apiClient = new ApiClient(BACKEND_URL);
export { BACKEND_URL };
