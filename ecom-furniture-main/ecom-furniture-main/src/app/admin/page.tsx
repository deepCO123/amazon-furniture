"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Package,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Users,
  ShoppingBag,
  Mail,
  TrendingUp,
  MessageCircle,
  Phone,
  Layers,
  Clock,
  ShieldCheck,
  X,
  RotateCcw,
  FileText,
  BarChart3,
  Copy,
  Rss,
  Printer,
  Calendar,
  MapPin,
  Navigation,
  Zap,
  CreditCard,
  Activity,
  LogOut,
  SlidersHorizontal,
} from "lucide-react";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { useProductStore } from "@/store/productStore";
import { useThemeStore } from "@/store/themeStore";
import type { Product, User, Order, EmailLog, ReturnRequest, Quotation, ConsultationBooking } from "@/types";
import { categories } from "@/data/categories";
import { formatPrice } from "@/lib/utils";
import { apiClient } from "@/lib/apiClient";
import dynamic from "next/dynamic";
import { useToastStore } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAdminSocket } from "@/hooks/useAdminSocket";

// Lazy-load heavy admin modals to significantly reduce initial JS bundle size
const ProductModal = dynamic(() => import("@/components/admin/ProductModal"), {
  ssr: false,
});
const CustomerModal = dynamic(() => import("@/components/admin/CustomerModal"), {
  ssr: false,
});
const QuotationModal = dynamic(() => import("@/components/admin/QuotationModal"), {
  ssr: false,
});

type AdminTab = "products" | "customers" | "orders" | "returns" | "quotations" | "consultations" | "analytics" | "emails";

export default function AdminDashboardPage() {
  const {
    products,
    loading: productsLoading,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleStock,
    updateStockQuantity,
    toggleFeatured,
  } = useProductStore();

  const [activeTab, setActiveTab] = useState<AdminTab>("products");
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  // Dynamic Theme Styling Tokens
  const panelCls = isDark
    ? "bg-[#12151D] border-[#1F2433] text-slate-100"
    : "bg-white border-slate-200 text-slate-800 shadow-sm";
  const subcardCls = isDark
    ? "bg-[#151922] border-[#232838]"
    : "bg-slate-50/90 border-slate-200 shadow-xs";
  const inputCls = isDark
    ? "bg-[#0E1119] border-[#282E3E] text-white placeholder:text-slate-500"
    : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-xs";
  const chipCls = isDark
    ? "bg-[#171B24] border-[#262C3D] text-slate-200"
    : "bg-slate-100 border-slate-200 text-slate-700";
  const textTitle = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const borderSep = isDark ? "border-[#1F2433]" : "border-slate-200";
  const thCls = isDark
    ? "bg-[#161B26] text-slate-400 border-[#1F2433]"
    : "bg-slate-100 text-slate-700 border-slate-200";
  const trHoverCls = isDark
    ? "border-[#1A1F2C] hover:bg-[#161B26]/60"
    : "border-slate-100 hover:bg-slate-50";

  const addToast = useToastStore((s) => s.addToast);
  const router = useRouter();
  const { logout } = useAdminAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  // Products Tab State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [stockFilter, setStockFilter] = useState<string>("ALL");

  // Customers Tab State
  const [customers, setCustomers] = useState<(User & { orders?: Order[] })[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<(User & { orders?: Order[] }) | null>(null);

  // Orders Tab State
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");

  // Emails Tab State
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [emailSearch, setEmailSearch] = useState("");
  const [previewEmail, setPreviewEmail] = useState<EmailLog | null>(null);

  // Returns Tab State
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [returnsLoading, setReturnsLoading] = useState(false);
  const [returnSearch, setReturnSearch] = useState("");

  // Quotations Tab State
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [quotationsLoading, setQuotationsLoading] = useState(false);
  const [quotationSearch, setQuotationSearch] = useState("");
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  // Consultations Tab State
  const [consultations, setConsultations] = useState<ConsultationBooking[]>([]);
  const [consultationsLoading, setConsultationsLoading] = useState(false);
  const [consultationSearch, setConsultationSearch] = useState("");

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch Customers
  const loadCustomers = async () => {
    setCustomersLoading(true);
    try {
      const data = await apiClient.getCustomers();
      setCustomers(data);
    } catch (e) {
      console.error("Failed to load customers", e);
    } finally {
      setCustomersLoading(false);
    }
  };

  // Fetch Orders
  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const data = await apiClient.getOrders();
      setOrders(data);
    } catch (e) {
      console.error("Failed to load orders", e);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Real-time listener for incoming customer orders via Socket.io
  useAdminSocket(() => {
    loadOrders();
  });

  // Fetch Returns
  const loadReturns = async () => {
    setReturnsLoading(true);
    try {
      const data = await apiClient.getReturns();
      setReturns(data);
    } catch (e) {
      console.error("Failed to load returns", e);
    } finally {
      setReturnsLoading(false);
    }
  };

  // Fetch Quotations
  const loadQuotations = async () => {
    setQuotationsLoading(true);
    try {
      const data = await apiClient.getQuotations();
      setQuotations(data);
    } catch (e) {
      console.error("Failed to load quotations", e);
    } finally {
      setQuotationsLoading(false);
    }
  };

  // Fetch Emails
  const loadEmails = async () => {
    setEmailsLoading(true);
    try {
      const data = await apiClient.getEmails();
      setEmails(data);
    } catch (e) {
      console.error("Failed to load emails", e);
    } finally {
      setEmailsLoading(false);
    }
  };

  // Fetch Consultations
  const loadConsultations = async () => {
    setConsultationsLoading(true);
    try {
      const data = await apiClient.getConsultations();
      setConsultations(data);
    } catch (e) {
      console.error("Failed to load consultations", e);
    } finally {
      setConsultationsLoading(false);
    }
  };

  const handleUpdateConsultationStatus = async (id: string, status: ConsultationBooking["status"]) => {
    try {
      const res = await apiClient.updateConsultationStatus(id, status);
      if (res.success) {
        setConsultations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status } : c))
        );
        addToast("تم تحديث حالة الاستشارة بنجاح", "success");
      }
    } catch (e) {
      console.error("Failed to update consultation status", e);
    }
  };

  // Refresh all data
  const refreshAll = () => {
    fetchProducts();
    loadCustomers();
    loadOrders();
    loadReturns();
    loadQuotations();
    loadConsultations();
    loadEmails();
    showNotification("تم تحديث ومزامنة جميع البيانات بنجاح!");
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCustomers();
    loadOrders();
    loadReturns();
    loadQuotations();
    loadConsultations();
    loadEmails();
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.color.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "ALL" ||
        p.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesStock =
        stockFilter === "ALL" ||
        (stockFilter === "IN_STOCK" && p.inStock) ||
        (stockFilter === "OUT_OF_STOCK" && !p.inStock) ||
        (stockFilter === "LOW_STOCK" && (p.stockQuantity ?? 0) > 0 && (p.stockQuantity ?? 0) <= 3);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = customerSearch.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q))
      );
    });
  }, [customers, customerSearch]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = orderSearch.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerPhone && o.customerPhone.includes(q)) ||
        (o.customerEmail && o.customerEmail.toLowerCase().includes(q))
      );
    });
  }, [orders, orderSearch]);

  // Filtered Emails
  const filteredEmails = useMemo(() => {
    return emails.filter((e) => {
      const q = emailSearch.toLowerCase();
      return (
        e.recipientName.toLowerCase().includes(q) ||
        e.to.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q)
      );
    });
  }, [emails, emailSearch]);

  // Filtered Returns
  const filteredReturns = useMemo(() => {
    return returns.filter((r) => {
      const q = returnSearch.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.orderId.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        (r.customerPhone && r.customerPhone.includes(q))
      );
    });
  }, [returns, returnSearch]);

  // Filtered Quotations
  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      const query = quotationSearch.toLowerCase();
      return (
        q.id.toLowerCase().includes(query) ||
        q.customerName.toLowerCase().includes(query) ||
        (q.companyName && q.companyName.toLowerCase().includes(query)) ||
        (q.customerPhone && q.customerPhone.includes(query))
      );
    });
  }, [quotations, quotationSearch]);

  // Filtered Consultations
  const filteredConsultations = useMemo(() => {
    return consultations.filter((c) => {
      const query = consultationSearch.toLowerCase();
      return (
        c.id.toLowerCase().includes(query) ||
        c.fullName.toLowerCase().includes(query) ||
        c.phone.includes(query) ||
        c.address.toLowerCase().includes(query) ||
        c.spaceType.toLowerCase().includes(query)
      );
    });
  }, [consultations, consultationSearch]);

  // Products Statistics
  const productStats = useMemo(() => {
    const total = products.length;
    const featured = products.filter((p) => p.featured).length;
    const inStock = products.filter((p) => p.inStock).length;
    const lowStock = products.filter((p) => (p.stockQuantity ?? 0) > 0 && (p.stockQuantity ?? 0) <= 3).length;
    const totalUnits = products.reduce((acc, p) => acc + (p.stockQuantity ?? (p.inStock ? 5 : 0)), 0);
    return { total, featured, inStock, lowStock, totalUnits };
  }, [products]);

  // Customer Statistics
  const customerStats = useMemo(() => {
    const totalCustomers = customers.length;
    const googleUsers = customers.filter((c) => c.provider === "google").length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    return { totalCustomers, googleUsers, totalOrders: orders.length, totalRevenue };
  }, [customers, orders]);

  // Open Create
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setModalOpen(true);
  };

  // Handle Save
  const handleSaveProduct = async (productData: Partial<Product>) => {
    if (editingProduct?.id) {
      await updateProduct(editingProduct.id, productData);
      showNotification(`تم تحديث المنتج "${productData.name}" بنجاح!`);
    } else {
      await addProduct(productData);
      showNotification(`تمت إضافة المنتج الجديد "${productData.name}" للمتجر بنجاح!`);
    }
  };

  // Open Delete
  const handleOpenDelete = (p: Product) => {
    setProductToDelete(p);
    setDeleteConfirmOpen(true);
  };

  // Execute Delete
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      showNotification(`تم حذف المنتج "${productToDelete.name}" من المتجر.`);
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    } catch {
      alert("حدث خطأ أثناء محاولة حذف المنتج.");
    } finally {
      setDeleting(false);
    }
  };

  // Quick Stock Step
  const handleQuickStockChange = async (p: Product, delta: number) => {
    const currentQty = p.stockQuantity ?? (p.inStock ? 5 : 0);
    const newQty = Math.max(0, currentQty + delta);
    await updateStockQuantity(p.id, newQty);
    showNotification(`تم تحديث مخزون "${p.name}" إلى: ${newQty} قطعة.`);
  };

  return (
    <div className={`admin-dashboard flex flex-col lg:flex-row min-h-screen font-sans selection:bg-cyan-500 selection:text-black transition-colors duration-200 ${
      isDark ? "bg-[#0B0E14] text-slate-100" : "bg-[#F4F6F9] text-slate-800"
    }`} dir="rtl">
      {/* Toast notification */}
      {notification && (
        <div className="fixed bottom-6 left-6 z-[300] bg-[#161A24] text-white border border-cyan-500/40 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 size={20} className="text-cyan-400 shrink-0" />
          <span className="text-sm font-semibold">{notification}</span>
        </div>
      )}

      {/* Desktop spacer to preserve layout flow while sidebar is fixed */}
      <div className="hidden lg:block lg:w-64 xl:w-72 shrink-0" aria-hidden="true" />

      {/* ── 1. Right Sidebar (100% Fixed to Viewport, Never Scrolls Away) ── */}
      <aside className={`w-full lg:fixed lg:top-0 lg:right-0 lg:w-64 xl:w-72 lg:h-screen lg:max-h-screen shrink-0 border-b lg:border-b-0 lg:border-s p-4 lg:p-5 flex flex-col justify-between z-40 transition-colors duration-200 ${panelCls}`}>
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand header */}
          <div className={`flex items-center gap-3 pb-4 border-b mb-3 shrink-0 ${borderSep}`}>
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-cyan-500/40 bg-[#171B24] shrink-0">
              <Image src="/logo-icon.png" alt="Amazon Furniture" fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <h2 className={`font-black text-sm truncate ${textTitle}`}>Amazon Furniture</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className={`text-[11px] font-bold ${textMuted}`}>لوحة الإدارة المباشرة</span>
              </div>
            </div>
          </div>

          {/* Navigation Items (Scrollable internally with no-scrollbar if viewport is short) */}
          <nav className="space-y-1 overflow-y-auto no-scrollbar flex-1 pe-0.5">
            {[
              { id: "products", label: "المنتجات والمخزون", icon: Package, count: products.length },
              { id: "orders", label: "الطلبات والتصنيع", icon: ShoppingBag, count: orders.length },
              { id: "customers", label: "العملاء (CRM)", icon: Users, count: customers.length },
              { id: "consultations", label: "الاستشارات واللوكيشن", icon: Calendar, count: consultations.length },
              { id: "quotations", label: "عروض الأسعار B2B", icon: FileText, count: quotations.length },
              { id: "returns", label: "المرتجعات وفحص الجودة", icon: RotateCcw, count: returns.length },
              { id: "analytics", label: "تحليلات الأثاث والـ Feed", icon: BarChart3 },
              { id: "emails", label: "سجل الإيميلات", icon: Mail, count: emails.length },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`w-full text-right px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? isDark
                        ? "bg-[#182a3d] text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-950/40 font-black"
                        : "bg-cyan-50 text-cyan-800 border border-cyan-300 shadow-sm font-black"
                      : isDark
                        ? "text-slate-400 hover:text-slate-100 hover:bg-[#181C26] border border-transparent"
                        : "text-slate-600 hover:text-slate-950 hover:bg-slate-100 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={17} className={isActive ? "text-cyan-500" : isDark ? "text-slate-400" : "text-slate-500"} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isActive
                          ? isDark
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                            : "bg-cyan-100 text-cyan-800 border border-cyan-200"
                          : isDark
                            ? "bg-[#1B202C] text-slate-400"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Actions (Firmly Pinned in Viewport at all times) */}
        <div className={`pt-3 border-t space-y-2 mt-2 shrink-0 ${borderSep}`}>
          {/* Dark / Light Mode Switcher */}
          <ThemeToggle variant="sidebar" />

          <button
            onClick={handleOpenCreate}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>إضافة منتج جديد +</span>
          </button>

          <Link
            href="/"
            target="_blank"
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
              isDark
                ? "bg-[#171B24] hover:bg-[#1E2330] text-slate-300 hover:text-white"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 border border-slate-200"
            }`}
          >
            <ExternalLink size={14} />
            <span>معاينة المتجر ↗</span>
          </Link>

          <button
            onClick={handleLogout}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              isDark ? "text-red-400 hover:bg-red-500/10 hover:text-red-300" : "text-red-600 hover:bg-red-50 hover:text-red-700"
            }`}
          >
            <LogOut size={14} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* ── 2. Main Content Area (To the left of Sidebar in RTL) ── */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto overflow-x-hidden">
        {/* Top Header Row matching the user screenshot */}
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border rounded-2xl p-4 sm:p-5 shadow-lg transition-colors ${panelCls}`}>
          {/* Right: Section title & live radar icon */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/10 shrink-0">
              <Activity size={22} className="animate-pulse" />
            </div>
            <div>
              <h1 className={`text-lg sm:text-xl font-black ${textTitle}`}>
                {activeTab === "products" && "إدارة المنتجات والمخزون"}
                {activeTab === "orders" && "الطلبات والتصنيع الفوري"}
                {activeTab === "customers" && "سجل العملاء وإدارة العلاقات CRM"}
                {activeTab === "consultations" && "حجز الاستشارات المجانية واللوكيشن"}
                {activeTab === "quotations" && "عروض الأسعار B2B وتجهيز المقرات"}
                {activeTab === "returns" && "طلبات الاسترجاع وفحص الجودة"}
                {activeTab === "analytics" && "تحليلات المشاهدات ومبيعات الأثاث"}
                {activeTab === "emails" && "سجل الإيميلات والتنبيهات الآلية"}
              </h1>
              <p className={`text-xs font-medium mt-0.5 ${textMuted}`}>
                تتبع أداء حملاتك، مبيعاتك، ومخزونك بدقة لحظية
              </p>
            </div>
          </div>

          {/* Left: Date selector pill, Quick Add button, Theme Toggle, & user profile */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {/* Dark / Light Mode Switcher */}
            <ThemeToggle variant="header" />

            {/* Quick Add Product Button in the Top Bar */}
            <button
              onClick={handleOpenCreate}
              className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>إضافة منتج +</span>
            </button>

            {/* "مدى الحياة (Lifetime)" selector pill matching screenshot */}
            <div className={`flex items-center gap-1.5 border px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${chipCls}`}>
              <Calendar size={13} className="text-cyan-500" />
              <span>مدى الحياة (Lifetime)</span>
            </div>

            {/* User Profile avatar */}
            <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-xl text-xs transition-colors ${chipCls}`}>
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                M
              </div>
              <div className="text-start">
                <span className={`font-bold block text-xs leading-tight ${textTitle}`}>محمد إسماعيل</span>
                <span className="text-[10px] text-emerald-500 font-bold block">● متصل الآن</span>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={refreshAll}
              disabled={productsLoading || customersLoading || ordersLoading}
              className={`p-2.5 border rounded-xl transition-colors cursor-pointer ${
                isDark ? "bg-[#171B24] border-[#262C3D] hover:bg-[#1E2330] text-slate-300 hover:text-white" : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700 hover:text-slate-950"
              }`}
              title="تحديث البيانات"
            >
              <RefreshCw
                size={14}
                className={productsLoading || customersLoading || ordersLoading ? "animate-spin text-cyan-400" : ""}
              />
            </button>
          </div>
        </div>

        {/* ── 3. The 4 Metric Cards Row (EXACT match to the user screenshot!) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: المبلغ المصروف */}
          <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden group transition-all ${
            isDark ? "bg-[#12151D] border-[#1F2433] hover:border-[#2D354A]" : "bg-white border-slate-200 shadow-sm hover:border-slate-300"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold ${textMuted}`}>المبلغ المصروف</span>
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
                isDark ? "bg-[#1A1E29] border-[#282E3E] text-slate-300" : "bg-slate-100 border-slate-200 text-slate-700"
              }`}>
                <CreditCard size={16} />
              </div>
            </div>
            <p className={`text-2xl sm:text-3xl font-black ${textTitle}`}>
              51,959.58 <span className={`text-xs font-bold ${textMuted}`}>ج.م</span>
            </p>
            <span className="text-[11px] text-emerald-500 font-semibold block mt-1.5">
              ↑ +18.4% نمو المبيعات الشهرية
            </span>
          </div>

          {/* Card 2: إجمالي النتائج (Cyan Accent Highlighted!) */}
          <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden group transition-all ${
            isDark
              ? "bg-[#12151D] border-cyan-500/30 bg-gradient-to-b from-[#12151D] to-[#111A26] hover:border-cyan-500/50"
              : "bg-white border-cyan-300 bg-gradient-to-b from-white to-cyan-50/50 shadow-sm hover:border-cyan-400"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold ${isDark ? "text-cyan-300" : "text-cyan-700"}`}>إجمالي النتائج</span>
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
                <Zap size={16} />
              </div>
            </div>
            <p className={`text-2xl sm:text-3xl font-black ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>
              5,239
            </p>
            <span className={`text-[11px] font-semibold block mt-1.5 ${isDark ? "text-cyan-300/80" : "text-cyan-600"}`}>
              {orders.length > 0 ? `${orders.length} طلب تصنيع وتوريد نشط` : "أوردرات مؤكدة وشحن فوري"}
            </span>
          </div>

          {/* Card 3: مرات الظهور */}
          <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden group transition-all ${
            isDark ? "bg-[#12151D] border-[#1F2433] hover:border-[#2D354A]" : "bg-white border-slate-200 shadow-sm hover:border-slate-300"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold ${textMuted}`}>مرات الظهور</span>
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
                isDark ? "bg-[#1A1E29] border-[#282E3E] text-slate-300" : "bg-slate-100 border-slate-200 text-slate-700"
              }`}>
                <Eye size={16} />
              </div>
            </div>
            <p className={`text-2xl sm:text-3xl font-black ${textTitle}`}>
              1,008,967
            </p>
            <span className={`text-[11px] font-semibold block mt-1.5 ${textMuted}`}>
              زيارات كتالوج ومعروضات المتجر
            </span>
          </div>

          {/* Card 4: الوصول (Reach) */}
          <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden group transition-all ${
            isDark ? "bg-[#12151D] border-[#1F2433] hover:border-[#2D354A]" : "bg-white border-slate-200 shadow-sm hover:border-slate-300"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold ${textMuted}`}>الوصول (Reach)</span>
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
                isDark ? "bg-[#1A1E29] border-[#282E3E] text-slate-300" : "bg-slate-100 border-slate-200 text-slate-700"
              }`}>
                <Users size={16} />
              </div>
            </div>
            <p className={`text-2xl sm:text-3xl font-black ${textTitle}`}>
              568,285
            </p>
            <span className={`text-[11px] font-semibold block mt-1.5 ${textMuted}`}>
              عميل مستهدف في المنصورة والدلتا
            </span>
          </div>
        </div>

        {/* ── 4. Main Panel Container (Matching "حملاتي الإعلانية" with LIVE badge) ── */}
        <div className={`border rounded-2xl p-4 sm:p-6 shadow-xl space-y-6 transition-colors ${panelCls}`}>
          {/* Panel Header */}
          <div className={`flex items-center justify-between pb-4 border-b ${borderSep}`}>
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50 animate-pulse" />
              <h2 className={`text-base sm:text-lg font-black ${textTitle}`}>
                {activeTab === "products" && "حملاتي الإعلانية • إدارة المنتجات والمخزون"}
                {activeTab === "orders" && "حملاتي الإعلانية • سجل الطلبات والمبيعات"}
                {activeTab === "customers" && "قاعدة بيانات العملاء المسجلين CRM"}
                {activeTab === "consultations" && "جدول مواعيد المعاينات والاستشارات"}
                {activeTab === "quotations" && "طلبات مقايسة وتجهيز مقرات الشركات B2B"}
                {activeTab === "returns" && "فحص المرتجعات وتقارير الجودة"}
                {activeTab === "analytics" && "لوحة التحليلات المتقدمة"}
                {activeTab === "emails" && "سجل الإيميلات والتنبيهات الآلية"}
              </h2>
            </div>

            <div className="flex items-center gap-2 bg-emerald-950/70 border border-emerald-800/60 px-3.5 py-1 rounded-full text-emerald-400 text-xs font-black">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE</span>
            </div>
          </div>

      {/* ======================================================== */}
      {/* TAB 1: PRODUCTS & INVENTORY */}
      {/* ======================================================== */}
      {activeTab === "products" && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-sm transition-colors ${subcardCls}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${textMuted}`}>إجمالي الموديلات</span>
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <Package size={17} />
                </div>
              </div>
              <p className={`text-2xl sm:text-3xl font-black mt-2.5 ${textTitle}`}>{productStats.total}</p>
              <span className={`text-[11px] ${textMuted} mt-1 block`}>موديل مسجل بالمتجر</span>
            </div>

            <div className={`p-4 sm:p-5 rounded-2xl border shadow-sm transition-colors ${subcardCls}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${textMuted}`}>إجمالي قطع المخزون</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Layers size={17} />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-500 mt-2.5">{productStats.totalUnits}</p>
              <span className={`text-[11px] ${textMuted} mt-1 block`}>قطعة جاهزة للتسليم فوراً</span>
            </div>

            <div className={`p-4 sm:p-5 rounded-2xl border shadow-sm transition-colors ${subcardCls}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${textMuted}`}>أوشكت على النفاد (1-3)</span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <AlertTriangle size={17} />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-amber-500 mt-2.5">{productStats.lowStock}</p>
              <span className={`text-[11px] ${textMuted} mt-1 block`}>تحتاج تصنيع إضافي</span>
            </div>

            <div className={`p-4 sm:p-5 rounded-2xl border shadow-sm transition-colors ${subcardCls}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${textMuted}`}>المميزة بالرئيسية</span>
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <Sparkles size={17} />
                </div>
              </div>
              <p className={`text-2xl sm:text-3xl font-black mt-2.5 ${textTitle}`}>{productStats.featured}</p>
              <span className={`text-[11px] ${textMuted} mt-1 block`}>معروضة بالصفحة الأولى</span>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className={`p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row items-center gap-3 transition-colors ${subcardCls}`}>
            {/* Search */}
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم، القسم، أو الماتريال..."
                className={`w-full pl-4 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-cyan-500 transition-colors ${inputCls}`}
              />
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full md:w-44 px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-cyan-500 transition-colors ${inputCls}`}
              >
                <option value="ALL">جميع الأقسام</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name} className={isDark ? "bg-[#151922] text-white" : "bg-white text-slate-900"}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Stock filter */}
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className={`w-full md:w-44 px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-cyan-500 transition-colors ${inputCls}`}
              >
                <option value="ALL" className={isDark ? "bg-[#151922] text-white" : "bg-white text-slate-900"}>كل حالات المخزون</option>
                <option value="IN_STOCK" className={isDark ? "bg-[#151922] text-white" : "bg-white text-slate-900"}>متوفر فقط</option>
                <option value="LOW_STOCK" className={isDark ? "bg-[#151922] text-white" : "bg-white text-slate-900"}>أوشك على النفاد (1-3)</option>
                <option value="OUT_OF_STOCK" className={isDark ? "bg-[#151922] text-white" : "bg-white text-slate-900"}>نفد المخزون (0)</option>
              </select>
            </div>
          </div>

          {/* Products Table with Live Stock */}
          <div className={`rounded-2xl border shadow-sm overflow-hidden transition-colors ${subcardCls}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead className={`border-b text-xs font-bold uppercase tracking-wider transition-colors ${thCls}`}>
                  <tr>
                    <th className="px-6 py-3.5 text-start">المنتج والصورة</th>
                    <th className="px-6 py-3.5 text-start">القسم</th>
                    <th className="px-6 py-3.5 text-start">السعر</th>
                    <th className="px-6 py-3.5 text-center">المخزون المتوفر (الكمية)</th>
                    <th className="px-6 py-3.5 text-center">الحالة بالمتجر</th>
                    <th className="px-6 py-3.5 text-center">الصفحة الرئيسية</th>
                    <th className="px-6 py-3.5 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-[#1D2230]" : "divide-slate-100"}`}>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">
                        <Package size={36} className="mx-auto mb-2 opacity-40 text-cyan-400" />
                        <p className="font-semibold text-slate-300">لا توجد منتجات مطابقة للبحث</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const qty = p.stockQuantity ?? (p.inStock ? 5 : 0);
                      const isLow = qty > 0 && qty <= 3;
                      const isZero = qty === 0;

                      return (
                        <tr key={p.id} className={`transition-colors ${isDark ? "hover:bg-[#1A1F2D]" : "hover:bg-slate-50/80"}`}>
                          {/* Image & Name */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border ${
                                isDark ? "bg-[#0D1017] border-[#282E3E]" : "bg-slate-100 border-slate-200"
                              }`}>
                                <Image
                                  src={p.images[0] || "/placeholder.jpg"}
                                  alt={p.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <h3 className={`font-bold text-sm truncate max-w-xs ${textTitle}`}>
                                  {p.name}
                                </h3>
                                <p className={`text-xs truncate ${textMuted}`}>
                                  {p.material} • {p.color}
                                </p>
                                <Link
                                  href={`/products/${p.slug}`}
                                  target="_blank"
                                  className="text-[11px] text-cyan-500 hover:text-cyan-600 inline-flex items-center gap-0.5 mt-0.5 font-bold"
                                >
                                  <span>رابط المنتج بالمتجر ↗</span>
                                </Link>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-6 py-4">
                            <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                              isDark ? "bg-[#192231] text-cyan-300 border border-[#26354D]" : "bg-cyan-50 text-cyan-800 border border-cyan-200"
                            }`}>
                              {p.category}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="px-6 py-4">
                            <div className={`font-black ${textTitle}`}>
                              {formatPrice(p.price)}
                            </div>
                            {p.originalPrice && (
                              <div className="text-xs text-slate-500 line-through">
                                {formatPrice(p.originalPrice)}
                              </div>
                            )}
                          </td>

                          {/* Live Stock Adjustment (+ / -) */}
                          <td className="px-6 py-4 text-center">
                            <div className="inline-flex items-center gap-2 bg-[#0E121A] px-3 py-1.5 rounded-xl border border-[#252C3E]">
                              <button
                                onClick={() => handleQuickStockChange(p, -1)}
                                className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors disabled:opacity-30"
                                title="إنقاص قطعة واحدة"
                                disabled={qty === 0}
                              >
                                -
                              </button>

                              <span
                                className={`font-mono font-bold text-sm min-w-[28px] ${
                                  isZero
                                    ? "text-rose-600"
                                    : isLow
                                    ? "text-amber-600"
                                    : "text-emerald-700"
                                }`}
                              >
                                {qty}
                              </span>

                              <button
                                onClick={() => handleQuickStockChange(p, +1)}
                                className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors"
                                title="زيادة قطعة واحدة"
                              >
                                +
                              </button>
                            </div>
                            <div className="mt-1">
                              {isZero ? (
                                <span className="text-[10px] text-rose-600 font-bold">نفد المخزون</span>
                              ) : isLow ? (
                                <span className="text-[10px] text-amber-600 font-bold">متبقي {qty} فقط!</span>
                              ) : (
                                <span className="text-[10px] text-emerald-600 font-medium">متوفر</span>
                              )}
                            </div>
                          </td>

                          {/* In Stock Toggle */}
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={async () => {
                                await toggleStock(p.id);
                                showNotification(
                                  `تم تحويل "${p.name}" إلى: ${!p.inStock ? "متوفر" : "غير متوفر"}`
                                );
                              }}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                                p.inStock
                                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                              }`}
                              title="انقر للتبديل"
                            >
                              {p.inStock ? (
                                <>
                                  <CheckCircle2 size={13} />
                                  <span>متوفر</span>
                                </>
                              ) : (
                                <>
                                  <XCircle size={13} />
                                  <span>غير متوفر</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Featured toggle */}
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={async () => {
                                await toggleFeatured(p.id);
                                showNotification(
                                  `تم ${!p.featured ? "تثبيت" : "إزالة"} "${p.name}" ${
                                    !p.featured ? "في" : "من"
                                  } الصفحة الرئيسية.`
                                );
                              }}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                                p.featured
                                  ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                              }`}
                              title="انقر للتبديل"
                            >
                              <Sparkles size={13} />
                              <span>{p.featured ? "مميز ✓" : "عادي"}</span>
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenEdit(p)}
                                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                title="تعديل المنتج والمخزون"
                              >
                                <Edit2 size={16} />
                              </button>

                              <Link
                                href={`/products/${p.slug}`}
                                target="_blank"
                                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                title="معاينة في المتجر"
                              >
                                <Eye size={16} />
                              </Link>

                              <button
                                onClick={() => handleOpenDelete(p)}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="حذف المنتج"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CUSTOMERS & CRM */}
      {/* ======================================================== */}
      {activeTab === "customers" && (
        <div className="space-y-6">
          {/* Admin Email Notification Status Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Mail size={22} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>إشعارات تسجيل العملاء الجدد مفعلة تلقائياً</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    نشط الآن ✓
                  </span>
                </p>
                <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
                  يصلك إشعار فوري بكامل بيانات أي عميل يسجل في متجرك على إيميلك: <strong className="text-slate-900 font-mono underline">khaledeldeep900@gmail.com</strong>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-emerald-900 bg-white border border-emerald-200 px-3.5 py-1.5 rounded-xl shadow-xs">
                إجمالي المسجلين: {customers.length} عميل
              </span>
            </div>
          </div>

          {/* Customer CRM Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">إجمالي العملاء</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users size={18} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-3">
                {customerStats.totalCustomers}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">عميل مسجل في قاعدة البيانات</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">مسجلين بحساب Google</span>
                <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.4 0-.8.1-1.6.4-2.4L1.6 7.1C.6 9.1 0 11.5 0 14s.6 4.9 1.6 6.9l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-3">
                {customerStats.googleUsers}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">
                استلموا إيميل الترحيب الـ VIP ⭐
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">إجمالي الأوردرات</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <ShoppingBag size={18} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-purple-600 mt-3">
                {customerStats.totalOrders}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">طلب تم تسجيله بالمتجر</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">إجمالي المبيعات</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp size={18} />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-emerald-600 mt-3">
                {formatPrice(customerStats.totalRevenue)}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">قيمة مشتريات العملاء</span>
            </div>
          </div>

          {/* Search bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="بحث باسم العميل، الإيميل، رقم التليفون، أو المدينة..."
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
              />
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5 text-start">العميل</th>
                    <th className="px-6 py-3.5 text-start">بيانات التواصل</th>
                    <th className="px-6 py-3.5 text-start">المدينة / العنوان</th>
                    <th className="px-6 py-3.5 text-center">عدد الأوردرات</th>
                    <th className="px-6 py-3.5 text-start">إجمالي المشتريات</th>
                    <th className="px-6 py-3.5 text-center">الإجراء والملف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        <Users size={36} className="mx-auto mb-2 opacity-40" />
                        <p className="font-semibold text-slate-600">لا يوجد عملاء مطابقون للبحث</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c) => {
                      const cleanPhone = (c.phone || "").replace(/[^0-9]/g, "");
                      const whatsappUrl = cleanPhone
                        ? `https://wa.me/${cleanPhone.startsWith("0") ? "2" + cleanPhone : cleanPhone}?text=${encodeURIComponent(
                            `أهلاً بحضرتك أستاذ ${c.name}، معك أ. محمد إسماعيل من إدارة Amazon Furniture.`
                          )}`
                        : null;

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Avatar & Name */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-11 h-11 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                <Image
                                  src={c.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.name)}`}
                                  alt={c.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                                  {c.provider === "google" ? (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 flex items-center gap-0.5">
                                      <span>Google</span>
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-0.5">
                                      <span>إيميل شخصي</span>
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-400 block">
                                  انضم في:{" "}
                                  {c.createdAt
                                    ? new Date(c.createdAt).toLocaleDateString("ar-EG", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })
                                    : "حديثاً"}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Contact Info */}
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-xs text-slate-700">
                                <Mail size={13} className="text-slate-400 shrink-0" />
                                <span className="font-mono">{c.email}</span>
                              </div>
                              {c.phone && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-700">
                                  <Phone size={13} className="text-slate-400 shrink-0" />
                                  <span dir="ltr" className="font-mono text-slate-800">
                                    {c.phone}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* City */}
                          <td className="px-6 py-4">
                            <span className="text-xs text-slate-700 font-medium">
                              {c.city || "القاهرة الكبرى"}
                            </span>
                          </td>

                          {/* Orders Count Badge */}
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              <ShoppingBag size={12} />
                              <span>{c.ordersCount || 0} أوردر</span>
                            </span>
                          </td>

                          {/* Total Spent */}
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-900 text-sm">
                              {formatPrice(c.totalSpent || 0)}
                            </span>
                          </td>

                          {/* Actions: View Profile Modal & WhatsApp */}
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setSelectedCustomer(c)}
                                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                                title="عرض ملف العميل وسجل طلباته الكامل"
                              >
                                <Eye size={14} />
                                <span>سجل الطلبات</span>
                              </button>

                              {whatsappUrl && (
                                <a
                                  href={whatsappUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                  title="محادثة واتساب مباشرة"
                                >
                                  <MessageCircle size={16} />
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: ORDERS LOG */}
      {/* ======================================================== */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          {/* Order Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="بحث برقم الطلب (ORD-...)، اسم العميل، أو الهاتف..."
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
              />
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5 text-start">رقم وتاريخ الطلب</th>
                    <th className="px-6 py-3.5 text-start">العميل</th>
                    <th className="px-6 py-3.5 text-start">القطع المطلوبة</th>
                    <th className="px-6 py-3.5 text-start">المبلغ الإجمالي</th>
                    <th className="px-6 py-3.5 text-center">حالة الطلب</th>
                    <th className="px-6 py-3.5 text-center">التواصل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        <ShoppingBag size={36} className="mx-auto mb-2 opacity-40" />
                        <p className="font-semibold text-slate-600">لا توجد طلبات مسجلة حالياً</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const cleanPhone = (order.customerPhone || order.shippingAddress?.phone || "").replace(/[^0-9]/g, "");
                      const whatsappUrl = cleanPhone
                        ? `https://wa.me/${cleanPhone.startsWith("0") ? "2" + cleanPhone : cleanPhone}?text=${encodeURIComponent(
                            `مرحباً أستاذ ${order.customerName || "العميل العزيز"}، معك أ. محمد إسماعيل من معرض Amazon Furniture بخصوص طلبك رقم #${order.id}.`
                          )}`
                        : null;

                      return (
                        <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Order ID & Date */}
                          <td className="px-6 py-4">
                            <span className="font-mono font-bold text-slate-900 text-sm block">
                              #{order.id}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock size={11} />
                              <span>
                                {order.date
                                  ? new Date(order.date).toLocaleDateString("ar-EG", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "اليوم"}
                              </span>
                            </span>
                          </td>

                          {/* Customer */}
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 text-sm">
                              {order.customerName || `${order.shippingAddress?.firstName || ""} ${order.shippingAddress?.lastName || ""}`}
                            </div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">
                              {order.customerPhone || order.shippingAddress?.phone}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                              {order.shippingAddress?.city} - {order.shippingAddress?.address}
                            </div>
                          </td>

                          {/* Items Preview */}
                          <td className="px-6 py-4">
                            <div className="space-y-1.5">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                    <Image
                                      src={item.product?.images?.[0] || "/placeholder.jpg"}
                                      alt={item.product?.name || "قطعة"}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <span className="text-xs text-slate-800 font-medium truncate max-w-[180px]">
                                    {item.product?.name} × {item.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* Total */}
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 text-sm">
                              {formatPrice(order.total)}
                            </div>
                            <span className="text-[11px] text-emerald-600 font-medium block">
                              شامل التركيب مجاناً ✓
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 text-center">
                            <select
                              value={order.status}
                              onChange={async (e) => {
                                const newStatus = e.target.value as Order["status"];
                                try {
                                  const res = await apiClient.updateOrderStatus(order.id, newStatus);
                                  if (res.success) {
                                    setOrders((prev) =>
                                      prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o))
                                    );
                                    addToast("تم تحديث حالة الطلب بنجاح", "success");
                                  } else {
                                    addToast("تعذر تحديث حالة الطلب", "error");
                                  }
                                } catch {
                                  addToast("خطأ في الاتصال بالخادم", "error");
                                }
                              }}
                              className={`text-xs font-bold px-3 py-1.5 rounded-full border cursor-pointer outline-none transition-colors ${
                                order.status === "delivered"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                  : order.status === "under_production"
                                  ? "bg-purple-50 text-purple-700 border-purple-300"
                                  : order.status === "qc_passed"
                                  ? "bg-teal-50 text-teal-700 border-teal-300"
                                  : order.status === "ready_for_dispatch"
                                  ? "bg-indigo-50 text-indigo-700 border-indigo-300"
                                  : order.status === "scheduled_delivery"
                                  ? "bg-sky-50 text-sky-700 border-sky-300"
                                  : order.status === "confirmed"
                                  ? "bg-cyan-50 text-cyan-700 border-cyan-300"
                                  : order.status === "shipped"
                                  ? "bg-blue-50 text-blue-700 border-blue-300"
                                  : order.status === "cancelled"
                                  ? "bg-rose-50 text-rose-700 border-rose-300"
                                  : "bg-amber-50 text-amber-700 border-amber-300"
                              }`}
                            >
                              <option value="pending">قيد الانتظار</option>
                              <option value="confirmed">تم التأكيد والعربون</option>
                              <option value="under_production">قيد التصنيع بالورشة</option>
                              <option value="qc_passed">اجتياز فحص الجودة</option>
                              <option value="ready_for_dispatch">جاهز بالمخزن للشحن</option>
                              <option value="scheduled_delivery">مجدول للتوصيل والتركيب</option>
                              <option value="processing">قيد التجهيز</option>
                              <option value="shipped">جاري الشحن</option>
                              <option value="delivered">تم التسليم والتركيب</option>
                              <option value="cancelled">ملغي</option>
                            </select>
                          </td>

                          {/* Contact */}
                          <td className="px-6 py-4 text-center">
                            {whatsappUrl ? (
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors"
                              >
                                <MessageCircle size={14} />
                                <span>واتساب</span>
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: RETURNS & QUALITY INSPECTION */}
      {/* ======================================================== */}
      {activeTab === "returns" && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block">إجمالي طلبات الارتجاع</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{returns.length}</div>
              <span className="text-[11px] text-purple-700 font-semibold mt-1 block">تتبع لوجستي عكسي</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block">قيد الفحص والمعاينة</span>
              <div className="text-2xl font-black text-amber-600 mt-1">
                {returns.filter((r) => r.status === "pending_review").length}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">تحت إشراف فني الجودة</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block">معروضات وتصفيات Outlet</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {returns.filter((r) => r.status === "outlet_restocked").length}
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">أعيد إدراجها للمخزن بخصم</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block">إجمالي مبالغ المرتجعات</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {formatPrice(returns.reduce((sum, r) => sum + (r.price || 0), 0))}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">معدل ارتداد منخفض 1.6%</span>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={returnSearch}
                onChange={(e) => setReturnSearch(e.target.value)}
                placeholder="بحث برقم المرتجع، رقم الطلب، اسم العميل، أو القطعة..."
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
              />
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5 text-start">رقم المرتجع والأوردر</th>
                    <th className="px-6 py-3.5 text-start">العميل والتواصل</th>
                    <th className="px-6 py-3.5 text-start">القطعة والقيمة</th>
                    <th className="px-6 py-3.5 text-start">سبب الإرجاع والتقرير</th>
                    <th className="px-6 py-3.5 text-center">حالة المرتجع</th>
                    <th className="px-6 py-3.5 text-center">الإجراء اللوجستي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {returnsLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-[#C5A880]" />
                        <p className="font-semibold text-slate-600">جاري تحميل سجل المرتجعات...</p>
                      </td>
                    </tr>
                  ) : filteredReturns.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        <RotateCcw size={36} className="mx-auto mb-2 opacity-40 text-purple-600" />
                        <p className="font-semibold text-slate-600">لا توجد طلبات مرتجعات مطابقة</p>
                      </td>
                    </tr>
                  ) : (
                    filteredReturns.map((ret) => {
                      const cleanPhone = (ret.customerPhone || "").replace(/[^0-9]/g, "");
                      const whatsappUrl = cleanPhone
                        ? `https://wa.me/${cleanPhone.startsWith("0") ? "2" + cleanPhone : cleanPhone}?text=${encodeURIComponent(
                            `أهلاً بحضرتك أستاذ ${ret.customerName}، معك إدارة الجودة من معرض Amazon Furniture بخصوص طلب معاينة المرتجع رقم #${ret.id}.`
                          )}`
                        : null;

                      return (
                        <tr key={ret.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* ID & Order */}
                          <td className="px-6 py-4">
                            <span className="font-mono font-bold text-slate-900 text-sm block">
                              #{ret.id}
                            </span>
                            <span className="text-xs text-amber-800 font-mono font-semibold">
                              طلب: #{ret.orderId}
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {new Date(ret.createdAt).toLocaleDateString("ar-EG")}
                            </span>
                          </td>

                          {/* Customer */}
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 text-sm">{ret.customerName}</div>
                            {ret.customerPhone && (
                              <div className="text-xs text-slate-500 font-mono mt-0.5" dir="ltr">
                                {ret.customerPhone}
                              </div>
                            )}
                            {whatsappUrl && (
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold hover:underline mt-1"
                              >
                                <MessageCircle size={12} />
                                <span>محادثة واتساب للمعاينة</span>
                              </a>
                            )}
                          </td>

                          {/* Product & Price */}
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 text-sm">{ret.productName}</div>
                            <span className="text-xs font-mono font-bold text-amber-700">
                              {formatPrice(ret.price)}
                            </span>
                          </td>

                          {/* Reason */}
                          <td className="px-6 py-4 max-w-xs">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold mb-1 ${
                                ret.reason === "size_mismatch"
                                  ? "bg-amber-100 text-amber-800"
                                  : ret.reason === "shipping_damage"
                                  ? "bg-red-100 text-red-800"
                                  : ret.reason === "color_mismatch"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {ret.reason === "size_mismatch"
                                ? "خطأ مقاس (لم تدخل من الباب)"
                                : ret.reason === "shipping_damage"
                                ? "تلف أثناء الشحن والتنزيل"
                                : ret.reason === "color_mismatch"
                                ? "اختلاف لون القماش"
                                : ret.reason === "factory_defect"
                                ? "عيب تصنيع بالخشب"
                                : "طلب العميل"}
                            </span>
                            <p className="text-xs text-slate-600 line-clamp-2">{ret.reasonDetails}</p>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 text-center">
                            <select
                              value={ret.status}
                              onChange={async (e) => {
                                const newStatus = e.target.value as ReturnRequest["status"];
                                try {
                                  const res = await apiClient.updateReturnStatus(ret.id, newStatus);
                                  if (res.success) {
                                    setReturns((prev) =>
                                      prev.map((r) => (r.id === ret.id ? { ...r, status: newStatus } : r))
                                    );
                                    addToast("تم تحديث حالة المرتجع بنجاح", "success");
                                  } else {
                                    addToast("تعذر تحديث حالة المرتجع", "error");
                                  }
                                } catch {
                                  addToast("خطأ في الاتصال بالخادم", "error");
                                }
                              }}
                              className={`text-xs font-bold px-3 py-1.5 rounded-full border cursor-pointer outline-none ${
                                ret.status === "outlet_restocked"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                  : ret.status === "inspection_approved"
                                  ? "bg-blue-50 text-blue-700 border-blue-300"
                                  : ret.status === "refunded"
                                  ? "bg-purple-50 text-purple-700 border-purple-300"
                                  : ret.status === "rejected"
                                  ? "bg-rose-50 text-rose-700 border-rose-300"
                                  : "bg-amber-50 text-amber-700 border-amber-300"
                              }`}
                            >
                              <option value="pending_review">قيد المراجعة والمعاينة</option>
                              <option value="inspection_approved">تمت الموافقة على الاستلام</option>
                              <option value="outlet_restocked">تم التحويل لـ Outlet</option>
                              <option value="refunded">تم استرداد المبلغ</option>
                              <option value="rejected">مرفوض</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-center">
                            {ret.status !== "outlet_restocked" ? (
                              <button
                                onClick={async () => {
                                  try {
                                    const res = await apiClient.updateReturn(
                                      ret.id,
                                      "outlet_restocked",
                                      "minor_scratch"
                                    );
                                    if (res.success) {
                                      setReturns((prev) =>
                                        prev.map((r) =>
                                          r.id === ret.id ? { ...r, status: "outlet_restocked" } : r
                                        )
                                      );
                                      addToast("تم إدراج القطعة بقسم تصفيات Outlet بخصم!", "success");
                                    }
                                  } catch {
                                    addToast("تعذر التحديث", "error");
                                  }
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors border border-amber-200 cursor-pointer"
                              >
                                <RotateCcw size={13} />
                                <span>تحويل لقسم Outlet</span>
                              </button>
                            ) : (
                              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                                بالمخزن (Outlet ✓)
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: B2B QUOTATIONS */}
      {/* ======================================================== */}
      {activeTab === "quotations" && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block">عروض الأسعار المسجلة</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{quotations.length}</div>
              <span className="text-[11px] text-slate-400 mt-1 block">تجهيز شركات وفلل وعرائس</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block">إجمالي مبالغ العروض المقدمة</span>
              <div className="text-2xl font-black text-amber-700 mt-1">
                {formatPrice(quotations.reduce((sum, q) => sum + (q.total || 0), 0))}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">شامل الخصومات والتركيب</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
              <span className="text-xs text-slate-500 font-bold block">متوسط قيمة العرض</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {quotations.length > 0
                  ? formatPrice(Math.round(quotations.reduce((sum, q) => sum + (q.total || 0), 0) / quotations.length))
                  : "0 ج.م"}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">طلبات توريد بالجملة والمكاتب</span>
            </div>
          </div>

          {/* Quotations Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={quotationSearch}
                onChange={(e) => setQuotationSearch(e.target.value)}
                placeholder="بحث برقم عرض السعر، اسم العميل، الشركة، أو الهاتف..."
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
              />
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Quotations Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5 text-start">رقم وتاريخ العرض</th>
                    <th className="px-6 py-3.5 text-start">العميل / الشركة</th>
                    <th className="px-6 py-3.5 text-start">القطع المطلوبة</th>
                    <th className="px-6 py-3.5 text-start">المبلغ الإجمالي</th>
                    <th className="px-6 py-3.5 text-center">صلاحية العرض</th>
                    <th className="px-6 py-3.5 text-center">الإجراءات والطباعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotationsLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-[#C5A880]" />
                        <p className="font-semibold text-slate-600">جاري تحميل عروض الأسعار...</p>
                      </td>
                    </tr>
                  ) : filteredQuotations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        <FileText size={36} className="mx-auto mb-2 opacity-40 text-amber-600" />
                        <p className="font-semibold text-slate-600">لا توجد عروض أسعار مسجلة</p>
                      </td>
                    </tr>
                  ) : (
                    filteredQuotations.map((q) => {
                      const cleanPhone = (q.customerPhone || "").replace(/[^0-9]/g, "");
                      const whatsappUrl = cleanPhone
                        ? `https://wa.me/${cleanPhone.startsWith("0") ? "2" + cleanPhone : cleanPhone}?text=${encodeURIComponent(
                            `مرحباً أستاذ ${q.customerName}، يسعدنا في Amazon Furniture إرسال عرض السعر الرسمي رقم #${q.id} لإجمالي ${formatPrice(q.total)}.`
                          )}`
                        : null;

                      return (
                        <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-mono font-bold text-slate-900 text-sm block">
                              #{q.id}
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {new Date(q.createdAt).toLocaleDateString("ar-EG")}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 text-sm">{q.customerName}</div>
                            {q.companyName && (
                              <div className="text-xs text-slate-500">{q.companyName}</div>
                            )}
                            <div className="text-xs text-slate-400 font-mono mt-0.5" dir="ltr">
                              {q.customerPhone}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {q.items.map((it, idx) => (
                                <div key={idx} className="text-xs text-slate-700 font-medium truncate max-w-[200px]">
                                  • {it.product?.name} × {it.quantity}
                                </div>
                              ))}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 text-sm">{formatPrice(q.total)}</div>
                            {q.discount > 0 && (
                              <span className="text-[11px] text-emerald-600 block">
                                وفر: {formatPrice(q.discount)}
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-center">
                            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                              حتى {new Date(q.validUntil).toLocaleDateString("ar-EG")}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setSelectedQuotation(q)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                                title="معاينة وطباعة العرض PDF"
                              >
                                <Printer size={13} />
                                <span>عرض وطباعة PDF</span>
                              </button>

                              {whatsappUrl && (
                                <a
                                  href={whatsappUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                                  title="إرسال عبر الواتساب"
                                >
                                  <MessageCircle size={16} />
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: CONSULTATIONS & SITE VISITS (الاستشارات والمعاينة) */}
      {/* ======================================================== */}
      {activeTab === "consultations" && (
        <div className="space-y-6">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block">إجمالي طلبات الاستشارة</span>
              <div className="text-3xl font-black text-slate-900 mt-1">{consultations.length}</div>
              <span className="text-[11px] text-slate-400 mt-1 block">من الموقع ومحادثات الواتساب</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block">معاينات ميدانية (المنصورة)</span>
              <div className="text-3xl font-black text-emerald-600 mt-1">
                {consultations.filter((c) => c.consultType === "mansoura").length}
              </div>
              <span className="text-[11px] text-emerald-700 font-medium mt-1 block">زيارات وفحص خامات مجاني</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block">ميتنج فيديو أونلاين</span>
              <div className="text-3xl font-black text-blue-600 mt-1">
                {consultations.filter((c) => c.consultType === "online").length}
              </div>
              <span className="text-[11px] text-blue-700 font-medium mt-1 block">للمحافظات وخارج مصر</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block">طلبات جديدة للمتابعة</span>
              <div className="text-3xl font-black text-amber-600 mt-1">
                {consultations.filter((c) => c.status === "new").length}
              </div>
              <span className="text-[11px] text-amber-700 font-medium mt-1 block">تتطلب اتصال أو رسالة تأكيد</span>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="ابحث بالاسم، الهاتف، العنوان، نوع المكان..."
                  value={consultationSearch}
                  onChange={(e) => setConsultationSearch(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B6E45]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadConsultations}
                  disabled={consultationsLoading}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw size={13} className={consultationsLoading ? "animate-spin text-[#8B6E45]" : ""} />
                  <span>تحديث البيانات</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold">
                    <th className="px-6 py-4">العميل والتواصل</th>
                    <th className="px-6 py-4">نوع الاستشارة</th>
                    <th className="px-6 py-4">العنوان بالتفصيل</th>
                    <th className="px-6 py-4 text-center">اللوكيشن على Google Maps</th>
                    <th className="px-6 py-4">نوع المكان والموعد</th>
                    <th className="px-6 py-4 text-center">الحالة</th>
                    <th className="px-6 py-4 text-center">الإجراءات المباشرة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredConsultations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                        لا توجد طلبات استشارة مطابقة للبحث
                      </td>
                    </tr>
                  ) : (
                    filteredConsultations.map((c) => {
                      const waText = encodeURIComponent(
                        `أهلاً بك يا أستاذ ${c.fullName}، معك أ. محمد إسماعيل من Amazon Furniture بخصوص طلب الاستشارة والمعاينة المجانية لمساحتك (${c.spaceType}).`
                      );
                      const waCustomerUrl = c.phone
                        ? `https://wa.me/${c.phone.replace(/[^0-9]/g, "")}?text=${waText}`
                        : "";

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 text-sm">{c.fullName}</div>
                            <div className="text-xs text-slate-500 font-mono mt-0.5" dir="ltr">
                              {c.phone}
                            </div>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {new Date(c.createdAt).toLocaleDateString("ar-EG")}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            {c.consultType === "mansoura" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                <MapPin size={12} />
                                <span>معاينة بالمنصورة 📍</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                <span>ميتنج أونلاين 💻</span>
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 max-w-xs">
                            <div className="font-medium text-slate-800 text-xs leading-relaxed">
                              {c.address || "لم يحدد عنواناً تفصيلياً"}
                            </div>
                            {c.notes && (
                              <div className="text-[11px] text-slate-500 mt-1 bg-slate-100 p-1.5 rounded-lg">
                                💡 {c.notes}
                              </div>
                            )}
                          </td>

                          <td className="px-6 py-4 text-center">
                            {c.googleMapsUrl ? (
                              <a
                                href={c.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition-colors border border-red-200"
                                title="فتح اللوكيشن على خرائط جوجل"
                              >
                                <Navigation size={13} className="text-red-600" />
                                <span>فتح اللوكيشن 🗺️</span>
                              </a>
                            ) : (
                              <span className="text-slate-400 text-xs">غير مرفق</span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-800 text-xs">{c.spaceType}</div>
                            <div className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1">
                              <Clock size={11} className="text-accent" />
                              <span>{c.preferredTime}</span>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <select
                              value={c.status}
                              onChange={(e) =>
                                handleUpdateConsultationStatus(
                                  c.id,
                                  e.target.value as ConsultationBooking["status"]
                                )
                              }
                              className={`text-xs font-bold px-3 py-1.5 rounded-xl border cursor-pointer focus:outline-none ${
                                c.status === "new"
                                  ? "bg-amber-50 text-amber-800 border-amber-300"
                                  : c.status === "contacted"
                                  ? "bg-blue-50 text-blue-800 border-blue-300"
                                  : c.status === "scheduled"
                                  ? "bg-purple-50 text-purple-800 border-purple-300"
                                  : c.status === "completed"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                  : "bg-slate-100 text-slate-600 border-slate-300"
                              }`}
                            >
                              <option value="new">جديد (بانتظار التواصل)</option>
                              <option value="contacted">تم التواصل هاتفياً</option>
                              <option value="scheduled">تم جدولة الموعد</option>
                              <option value="completed">تمت المعاينة بنجاح</option>
                              <option value="cancelled">ملغي</option>
                            </select>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {waCustomerUrl && (
                                <a
                                  href={waCustomerUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors shadow-xs"
                                  title="مراسلة العميل واتساب"
                                >
                                  <MessageCircle size={15} />
                                </a>
                              )}

                              {c.phone && (
                                <a
                                  href={`tel:${c.phone}`}
                                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-xs"
                                  title="اتصال هاتفي مباشر"
                                >
                                  <Phone size={15} />
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: FURNITURE ANALYTICS & PRODUCT FEED */}
      {/* ======================================================== */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Top Operational Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block">معدل ارتداد المرتجعات</span>
              <div className="text-3xl font-black text-emerald-600 mt-1">1.6%</div>
              <span className="text-[11px] text-emerald-700 font-medium mt-1 block">أقل من معدل السوق (8%)</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block">متوسط زمن التصنيع (Lead Time)</span>
              <div className="text-3xl font-black text-slate-900 mt-1">7.4 <span className="text-sm font-normal text-slate-500">أيام</span></div>
              <span className="text-[11px] text-slate-400 mt-1 block">بين تأكيد العربون والجاهزية</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block">طلبات تتطلب فني تركيب</span>
              <div className="text-3xl font-black text-[#8B6E45] mt-1">94%</div>
              <span className="text-[11px] text-slate-400 mt-1 block">تغطيها فرق التركيب المجانية</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block">متوسط قيمة الأوردر (AOV)</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {orders.length > 0
                  ? formatPrice(Math.round(orders.reduce((sum, o) => sum + (o.total || 0), 0) / orders.length))
                  : "0 ج.م"}
              </div>
              <span className="text-[11px] text-purple-700 font-medium mt-1 block">نمو +18% هذا الموسم</span>
            </div>
          </div>

          {/* Meta & Google Catalog Product Feed Card */}
          <div className="bg-gradient-to-r from-slate-900 to-neutral-900 text-white p-6 rounded-2xl shadow-xl border border-neutral-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
                  <Rss size={13} />
                  <span>Meta Business Suite & Google Merchant Center Feed</span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  رابط كتالوج المنتجات التلقائي المحدث لحظياً (Dynamic Product Feed)
                </h3>
                <p className="text-xs text-gray-300 mt-1 max-w-2xl leading-relaxed">
                  انسخ هذا الرابط وضعه في مدير التجارة بفيسبوك (Meta Commerce Manager) وإعلانات Google Shopping لتحديث الأسعار والمخزون في الحملات الإعلانية تلقائياً دون الحاجة لرفع المنتجات يدوياً.
                </p>
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => {
                    const feedUrl = `${window.location.origin}/api/feed/products`;
                    navigator.clipboard.writeText(feedUrl);
                    addToast("تم نسخ رابط الكتالوج بنجاح: " + feedUrl, "success");
                  }}
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  <Copy size={16} />
                  <span>نسخ رابط الـ XML Feed</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-black/50 rounded-xl border border-white/10 font-mono text-xs text-amber-300 break-all select-all">
              {typeof window !== "undefined" ? `${window.location.origin}/api/feed/products` : "https://amazonfurniture.eg/api/feed/products"}
            </div>
          </div>

          {/* Analytics Visual Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Best Selling Materials */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="font-bold text-slate-900 text-base flex items-center justify-between">
                <span>🌲 الخامات والأخشاب الأكثر طلباً</span>
                <span className="text-xs text-slate-500">حسب إجمالي المبيعات</span>
              </h4>

              <div className="space-y-3">
                {[
                  { name: "خشب زان أحمر روماني طبيعي", percentage: 68, color: "bg-amber-600" },
                  { name: "ميلامين إسباني مقاوم للخدش والرطوبة", percentage: 22, color: "bg-blue-600" },
                  { name: "خشب أرو أمريكي فاخر", percentage: 10, color: "bg-emerald-600" },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-800">
                      <span>{item.name}</span>
                      <span>{item.percentage}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Geographic Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="font-bold text-slate-900 text-base flex items-center justify-between">
                <span>📍 التوزيع الجغرافي للطلبات (المحافظات)</span>
                <span className="text-xs text-slate-500">خريطة المبيعات</span>
              </h4>

              <div className="space-y-3">
                {[
                  { region: "القاهرة الكبرى (التجمع الخامس، الشيخ زايد، المعادي)", percentage: 44, color: "bg-purple-600" },
                  { region: "المنصورة ومحافظة الدقهلية (المعرض والمصنع)", percentage: 36, color: "bg-[#8B6E45]" },
                  { region: "الإسكندرية والساحل الشمالي", percentage: 14, color: "bg-sky-600" },
                  { region: "باقي محافظات الدلتا والصعيد", percentage: 6, color: "bg-slate-500" },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-800">
                      <span>{item.region}</span>
                      <span>{item.percentage}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: EMAILS LOG */}
      {/* ======================================================== */}
      {activeTab === "emails" && (
        <div className="space-y-6">
          {/* Email Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                placeholder="بحث بالمستلم، الإيميل، أو موضوع الرسالة..."
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
              />
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Emails Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5 text-start">نوع الإشعار</th>
                    <th className="px-6 py-3.5 text-start">المستلم والإيميل</th>
                    <th className="px-6 py-3.5 text-start">عنوان الإيميل</th>
                    <th className="px-6 py-3.5 text-start">تاريخ ووقت الإرسال</th>
                    <th className="px-6 py-3.5 text-center">معاينة الرسالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {emailsLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-400">
                        <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-[#C5A880]" />
                        <p className="font-semibold text-slate-600">جاري تحميل سجل الإيميلات...</p>
                      </td>
                    </tr>
                  ) : filteredEmails.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-400">
                        <Mail size={36} className="mx-auto mb-2 opacity-40" />
                        <p className="font-semibold text-slate-600">لا توجد إيميلات مسجلة بعد</p>
                      </td>
                    </tr>
                  ) : (
                    filteredEmails.map((email) => (
                      <tr key={email.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Type */}
                        <td className="px-6 py-4">
                          {email.type === "WELCOME" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#C5A880]/15 text-[#8B6E45] border border-[#C5A880]/30">
                              <Sparkles size={12} />
                              <span>ترحيب عميل VIP</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <ShoppingBag size={12} />
                              <span>تأكيد طلب #{email.orderId || ""}</span>
                            </span>
                          )}
                        </td>

                        {/* Recipient */}
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 text-sm block">
                            {email.recipientName}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            {email.to}
                          </span>
                        </td>

                        {/* Subject */}
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-800 text-xs line-clamp-1">
                            {email.subject}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock size={12} />
                            <span>
                              {email.date
                                ? new Date(email.date).toLocaleDateString("ar-EG", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "الآن"}
                            </span>
                          </span>
                        </td>

                        {/* Preview */}
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setPreviewEmail(email)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 mx-auto"
                          >
                            <Eye size={13} />
                            <span>معاينة الإيميل</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

        </div>
      </main>

      {/* ======================================================== */}
      {/* MODALS */}
      {/* ======================================================== */}

      {/* Product Modal (Create / Edit) */}
      <ProductModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        product={editingProduct}
      />

      {/* Customer Profile & Orders Modal */}
      <CustomerModal
        isOpen={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        customer={selectedCustomer}
      />

      {/* Email Preview Modal */}
      {previewEmail && (
        <div className="fixed inset-0 z-[260] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold text-[#8B6E45] block">
                  معاينة الإيميل المرسل للعميل
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {previewEmail.subject}
                </h3>
              </div>
              <button
                onClick={() => setPreviewEmail(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 text-slate-600">
              <div><strong>إلى:</strong> {previewEmail.recipientName} &lt;{previewEmail.to}&gt;</div>
              <div><strong>من:</strong> Amazon Furniture VIP &lt;vip@amazonfurniture.com&gt;</div>
              <div>
                <strong>التاريخ:</strong>{" "}
                {previewEmail.date
                  ? new Date(previewEmail.date).toLocaleString("ar-EG")
                  : "الآن"}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl p-4 bg-white">
              {previewEmail.htmlContent ? (
                <div
                  dangerouslySetInnerHTML={{ __html: previewEmail.htmlContent }}
                  className="prose prose-sm max-w-none"
                />
              ) : (
                <p className="text-sm text-slate-700">{previewEmail.subject}</p>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button onClick={() => setPreviewEmail(null)}>إغلاق المعاينة</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && productToDelete && (
        <div className="fixed inset-0 z-[250] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={26} />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">
                تأكيد حذف المنتج
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                هل أنت متأكد من حذف <strong>&quot;{productToDelete.name}&quot;</strong> نهائياً من المتجر؟
              </p>
              <p className="text-xs text-red-600 mt-2">
                لن يتمكن العملاء من رؤيته أو طلبه مجدداً.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setProductToDelete(null);
                }}
                disabled={deleting}
                className="flex-1"
              >
                إلغاء
              </Button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {deleting ? "جاري الحذف..." : "نعم، احذف المنتج"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quotation Official Modal */}
      <QuotationModal
        isOpen={Boolean(selectedQuotation)}
        onClose={() => setSelectedQuotation(null)}
        quotation={selectedQuotation}
      />
    </div>
  );
}
