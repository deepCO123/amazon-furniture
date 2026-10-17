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
  CustomOrder,
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

  public getAuthHeader(): Record<string, string> {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("amazon_token");
      if (token) {
        return { Authorization: `Bearer ${token}` };
      }
    }
    return {};
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
        ...this.getAuthHeader(),
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
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(productData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to create product" }));
      throw new Error(err.error || err.message || `Failed to create product (${res.status})`);
    }
    return res.json();
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const res = await fetch(`${this.baseUrl}/api/products`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ id, ...updates }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to update product" }));
      throw new Error(err.error || err.message || `Failed to update product (${res.status})`);
    }
    return res.json();
  }

  async deleteProduct(id: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/api/products?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        ...this.getAuthHeader(),
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to delete product" }));
      throw new Error(err.error || err.message || `Failed to delete product (${res.status})`);
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

  // ─── Analytics & Intelligence ──────────────────────────

  async getReturnsIntelligence() {
    try {
      const res = await fetch(`${this.baseUrl}/api/admin/analytics/returns-intelligence`, {
        cache: "no-store",
        credentials: "include",
        headers: {
          ...this.getAuthHeader(),
        },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch returns intelligence (${res.status})`);
      }
      return await res.json();
    } catch (err) {
      console.error("[API Client] getReturnsIntelligence error:", err);
      throw err;
    }
  }

  // ─── Bulk Import ──────────────────────────────────────

  /**
   * Trigger browser download of the XLSX import template.
   * Uses a temporary anchor element so the response is saved as a file.
   */
  downloadImportTemplate() {
    if (typeof window === "undefined") return;
    const link = document.createElement("a");
    link.href = "/api/products/import/template";
    link.download = "amazon-furniture-import-template.xlsx";
    // Include auth header manually by building the URL with a bearer token if needed
    link.click();
    link.remove();
  }

  /**
   * Upload an Excel/CSV file for bulk product import.
   * @param file      The xlsx/csv File object selected by the user
   * @param dryRun    If true, validate only without saving
   */
  async importProducts(
    file: File,
    dryRun = false
  ): Promise<{
    success: boolean;
    dryRun: boolean;
    total: number;
    valid: number;
    invalid: number;
    created?: number;
    updated?: number;
    errors: string[];
    preview?: Record<string, unknown>[];
    error?: string;
  }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("dryRun", String(dryRun));

    try {
      const res = await fetch("/api/products/import", {
        method: "POST",
        credentials: "include",
        headers: {
          ...this.getAuthHeader(),
          // Don't set Content-Type — browser sets it with boundary for multipart
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          dryRun,
          total: 0,
          valid: 0,
          invalid: 0,
          errors: [],
          error: data.error || data.message || `HTTP ${res.status}`,
        };
      }

      return data;
    } catch (err) {
      console.error("[API Client] importProducts error:", err);
      return {
        success: false,
        dryRun,
        total: 0,
        valid: 0,
        invalid: 0,
        errors: [],
        error: "حدث خطأ في الاتصال بالخادم",
      };
    }
  }

  // ─── Custom Orders (تفصيل ومقاسات خاصة) ────────────

  async getCustomOrders(): Promise<CustomOrder[]> {
    const res = await this.request<CustomOrder[]>("/api/custom-orders");
    if (Array.isArray(res)) return res as unknown as CustomOrder[];
    if (res.data && Array.isArray(res.data)) return res.data as CustomOrder[];
    return [];
  }

  async createCustomOrder(data: Partial<CustomOrder>): Promise<{ success: boolean; customOrder?: CustomOrder; message?: string }> {
    return this.request<{ customOrder: CustomOrder }>("/api/custom-orders", {
      method: "POST",
      body: JSON.stringify(data),
    }) as unknown as Promise<{ success: boolean; customOrder?: CustomOrder; message?: string }>;
  }

  async updateCustomOrder(
    id: string,
    updates: { status?: string; quotePrice?: number; adminNotes?: string }
  ): Promise<{ success: boolean; customOrder?: CustomOrder; message?: string }> {
    return this.request<{ customOrder: CustomOrder }>(`/api/custom-orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }) as unknown as Promise<{ success: boolean; customOrder?: CustomOrder; message?: string }>;
  }

  async deleteCustomOrder(id: string) {
    return this.request(`/api/custom-orders/${id}`, {
      method: "DELETE",
    });
  }

  // ─── Cache Stats ──────────────────────────────────────

  async getCacheStats() {
    return this.request("/api/cache-stats");
  }
}

export const apiClient = new ApiClient(BACKEND_URL);
export { BACKEND_URL };
