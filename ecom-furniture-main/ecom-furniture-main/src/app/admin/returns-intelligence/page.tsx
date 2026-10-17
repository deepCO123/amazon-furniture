"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  TrendingDown,
  AlertTriangle,
  RotateCcw,
  DollarSign,
  Package,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  Sparkles,
  Info,
  Layers,
  Wrench,
  Ban,
  Activity,
  Download,
  Printer,
  PlayCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Cell,
  CartesianGrid,
} from "recharts";

import { useThemeStore } from "@/store/themeStore";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { useProductStore } from "@/store/productStore";
import { useToastStore } from "@/components/ui/Toast";
import { apiClient } from "@/lib/apiClient";
import { formatPrice } from "@/lib/utils";

// أنواع بيانات التحليلات
interface ReturnReasonBreakdown {
  reason: string;
  count: number;
  en?: string;
  ar?: string;
}

interface AnalyzedProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  images: string[];
  stockQuantity: number;
  totalSold: number;
  totalRevenue: number;
  totalReturned: number;
  totalLoss: number;
  returnRate: number;
  isHighRisk: boolean;
  riskLevel: "Critical" | "High Risk" | "Medium" | "Low";
  topReturnReason: string;
  returnReasons: ReturnReasonBreakdown[];
}

interface AnalyticsData {
  summary: {
    totalFinancialLoss: number;
    averageReturnRate: number;
    totalUnitsSold: number;
    totalUnitsReturned: number;
    highRiskProductsCount: number;
    totalProductsAnalyzed: number;
  };
  reasonsDistribution: Array<{
    reason: string;
    reasonKey: string;
    labelAr: string;
    count: number;
    percentage: number;
  }>;
  products: AnalyzedProduct[];
}

// ألوان مخصصة لأعمدة الرسم البياني
const REASON_COLORS = [
  "#EF4444", // أحمر - Defect
  "#F59E0B", // برتقالي - Size Mismatch
  "#3B82F6", // أزرق - Shipping Damage
  "#8B5CF6", // بنفسجي - Quality Issue
  "#EC4899", // وردي - Not as Described
  "#10B981", // أخضر - Changed Mind
  "#6B7280", // رمادي - Other
];

export default function ReturnsIntelligencePage() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const { checkSession } = useAdminAuthStore();
  const { updateProduct } = useProductStore();
  const addToast = useToastStore((s) => s.addToast);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRisk, setFilterRisk] = useState<"all" | "high" | "safe">("all");
  const [investigatingProduct, setInvestigatingProduct] = useState<AnalyzedProduct | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // التحقق من صلاحية الجلسة
  useEffect(() => {
    let mounted = true;
    checkSession().then((valid) => {
      if (!valid && mounted) {
        router.push("/admin/login");
      }
    });
    return () => {
      mounted = false;
    };
  }, [checkSession, router]);

  // جلب البيانات من الـ API
  const fetchAnalytics = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await apiClient.getReturnsIntelligence();
      if (res && res.success) {
        setData(res);
        if (isManualRefresh) {
          addToast("تمت إعادة حساب مصفوفات الذكاء وتجميع المرتجعات لحظياً.", "success");
        }
      }
    } catch (err: unknown) {
      console.error("Failed to load returns intelligence:", err);
      addToast("تعذر جلب تحليلات ذكاء المرتجعات. تأكد من عمل الخادم.", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchAnalytics();
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // إجراء إيقاف البيع لمنتج عالي الخطورة
  const handleStopSelling = async (prod: AnalyzedProduct) => {
    if (!confirm(`هل أنت متأكد من إيقاف بيع "${prod.name}" وحجبه من المتجر لارتفاع معدل المرتجعات؟`)) {
      return;
    }

    setActionLoadingId(prod.id);
    try {
      await updateProduct(prod.id, { inStock: false, stockQuantity: 0 });
      addToast(`تم إيقاف بيع "${prod.name}" وتحويله لغير متوفر بنجاح.`, "success");
      // تحديث الحالة محلياً
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          products: prev.products.map((p) =>
            p.id === prod.id ? { ...p, stockQuantity: 0 } : p
          ),
        };
      });
    } catch {
      addToast("حدث خطأ أثناء تعديل حالة المنتج.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // إعادة تفعيل بيع منتج
  const handleReactivateProduct = async (prod: AnalyzedProduct) => {
    setActionLoadingId(prod.id);
    try {
      await updateProduct(prod.id, { inStock: true, stockQuantity: 10 });
      addToast(`تمت إعادة تفعيل "${prod.name}" وإتاحته للطلب برصيد 10 قطع.`, "success");
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          products: prev.products.map((p) =>
            p.id === prod.id ? { ...p, stockQuantity: 10 } : p
          ),
        };
      });
    } catch {
      addToast("حدث خطأ أثناء إعادة تفعيل المنتج.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // تصدير ملف الإكسل (CSV)
  const handleExportCSV = () => {
    if (!data?.products || data.products.length === 0) return;

    const headers = [
      "ID",
      "Product Name",
      "Category",
      "Price (EGP)",
      "Total Sold",
      "Total Returned",
      "Return Rate %",
      "Risk Level",
      "Top Return Reason",
      "Financial Loss (EGP)",
    ];

    const rows = data.products.map((p) => [
      `"${p.id}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.price,
      p.totalSold,
      p.totalReturned,
      `${p.returnRate}%`,
      `"${p.riskLevel}"`,
      `"${p.topReturnReason}"`,
      p.totalLoss,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `returns-intelligence-report-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast("تم تحميل ملف Excel (CSV) ببيانات المرتجعات وتحليل المخزون بنجاح.", "success");
  };

  // طباعة وحفظ التقرير كـ PDF رسمي
  const handlePrintReport = () => {
    window.print();
  };

  // فلترة المنتجات في الجدول
  const filteredProducts = useMemo(() => {
    if (!data?.products) return [];
    return data.products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase());

      if (filterRisk === "high") {
        return matchesSearch && p.isHighRisk;
      }
      if (filterRisk === "safe") {
        return matchesSearch && !p.isHighRisk;
      }
      return matchesSearch;
    });
  }, [data, searchTerm, filterRisk]);

  // إعداد بيانات الرسم البياني
  const chartData = useMemo(() => {
    if (!data?.reasonsDistribution) return [];
    return data.reasonsDistribution.map((item, idx) => ({
      name: item.labelAr || item.reason,
      count: item.count,
      percentage: item.percentage,
      color: REASON_COLORS[idx % REASON_COLORS.length],
    }));
  }, [data]);

  // Styling Tokens
  const cardCls = isDark
    ? "bg-[#131722] border-[#202738] text-slate-100 shadow-xl"
    : "bg-white border-slate-200 text-slate-900 shadow-sm";
  const headerCls = isDark
    ? "bg-[#0E111A] border-[#1E2538]"
    : "bg-slate-50 border-slate-200";

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#0A0D14] text-slate-100" : "bg-[#F8FAFC] text-slate-900"} font-sans transition-colors duration-200`}>
      {/* ─── Top Header & Navigation ────────────────────────────── */}
      <header className={`sticky top-0 z-40 border-b ${headerCls} backdrop-blur-md bg-opacity-95 px-4 sm:px-8 py-4`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className={`p-2 rounded-xl transition-all ${
                isDark
                  ? "bg-[#181F30] text-slate-400 hover:text-white hover:bg-[#222B42]"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
              title="العودة للوحة الإدارة الرئيسية"
            >
              <ArrowRight size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles size={13} />
                  نظام ذكاء الأعمال المتقدم (AI Intelligence)
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                <ShieldAlert className="text-amber-500" size={24} />
                ذكاء المرتجعات وتحليل المخزون
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              disabled={loading || !data?.products?.length}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isDark
                  ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30"
                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs"
              }`}
              title="تصدير تقرير المخاطر بصيغة Excel CSV"
            >
              <Download size={14} />
              <span>تصدير إكسل</span>
            </button>

            {/* Print / Save PDF */}
            <button
              onClick={handlePrintReport}
              disabled={loading}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isDark
                  ? "bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30"
                  : "bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 shadow-xs"
              }`}
              title="طباعة أو حفظ كـ PDF لتقديمه لإدارة المصنع"
            >
              <Printer size={14} />
              <span>طباعة تقرير الجودة</span>
            </button>

            <button
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing || loading}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isDark
                  ? "bg-[#1A2236] hover:bg-[#242F4A] text-slate-200 border border-[#27324E]"
                  : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-xs"
              }`}
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin text-cyan-400" : ""} />
              <span>{refreshing ? "جاري التحديث..." : "تحديث المؤشرات"}</span>
            </button>

            <Link
              href="/admin"
              className="px-4 py-2 rounded-xl text-xs font-black bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30 transition-all flex items-center gap-1.5"
            >
              <Layers size={14} />
              <span>الداشبورد الرئيسية</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Main Content Container ─────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Banner Alert if High Risk Detected */}
        {data && data.summary.highRiskProductsCount > 0 && (
          <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-red-950/40 via-amber-950/20 to-transparent border border-red-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 shrink-0 mt-0.5 sm:mt-0">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="text-sm font-black text-red-400">
                  تنبيه ذكاء المخزون: تم رصد {data.summary.highRiskProductsCount} منتجات ذات معدل إرجاع حرج!
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  نسبة الاسترجاع لهذه المنتجات تتجاوز حد الأمان (15%)، مما يتسبب في خسائر شحن وصيانة. يُنصح بإيقاف بيعها مؤقتاً أو بدء فحص جودة عاجل.
                </p>
              </div>
            </div>
            <button
              onClick={() => setFilterRisk("high")}
              className="text-xs font-black px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 whitespace-nowrap cursor-pointer transition-all"
            >
              عرض المنتجات الخطرة الآن &larr;
            </button>
          </div>
        )}

        {/* ─── 1. KPI Cards Grid ─────────────────────────────────── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Total Financial Loss */}
          <div className={`rounded-2xl p-5 border ${cardCls} relative overflow-hidden group`}>
            <div className="absolute top-0 left-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400">إجمالي الخسارة من المرتجعات</span>
              <div className="p-2.5 rounded-xl bg-red-500/15 text-red-400">
                <DollarSign size={18} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-black text-red-500 tracking-tight">
                {data ? formatPrice(data.summary.totalFinancialLoss) : "..."}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
                <TrendingDown size={13} className="text-red-400" />
                مبالغ تم ردها واسترداد بضائع من العملاء
              </p>
            </div>
          </div>

          {/* Card 2: Average Return Rate */}
          <div className={`rounded-2xl p-5 border ${cardCls} relative overflow-hidden group`}>
            <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400">متوسط نسبة المرتجع الإجمالية</span>
              <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400">
                <RotateCcw size={18} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
                {data ? `${data.summary.averageReturnRate}%` : "..."}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
                <Activity size={13} className="text-amber-400" />
                مقياس (إجمالي المرتجع &divide; إجمالي المبيعات)
              </p>
            </div>
          </div>

          {/* Card 3: High Risk Products Flagged */}
          <div className={`rounded-2xl p-5 border ${cardCls} relative overflow-hidden group`}>
            <div className="absolute top-0 left-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400">منتجات عالية الخطورة (&gt; 15%)</span>
              <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400">
                <ShieldAlert size={18} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight">
                {data ? data.summary.highRiskProductsCount : "..."}
                <span className="text-sm font-bold text-slate-400 ms-1.5">منتج</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
                <AlertTriangle size={13} className="text-rose-400" />
                تتطلب تدخلاً فورياً لمنع تكرار المرتجع
              </p>
            </div>
          </div>

          {/* Card 4: Total Units Sold vs Returned */}
          <div className={`rounded-2xl p-5 border ${cardCls} relative overflow-hidden group`}>
            <div className="absolute top-0 left-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400">القطع المباعة / المرتجعة</span>
              <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400">
                <Package size={18} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-black text-cyan-400 tracking-tight flex items-baseline gap-2">
                <span>{data ? data.summary.totalUnitsReturned : "..."}</span>
                <span className="text-sm font-bold text-slate-500">/ {data ? data.summary.totalUnitsSold : "..."} مباع</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
                <CheckCircle2 size={13} className="text-emerald-400" />
                من إجمالي {data?.summary.totalProductsAnalyzed || 0} منتجاً مسجلاً
              </p>
            </div>
          </div>
        </section>

        {/* ─── 2. Return Reasons Distribution Chart ─────────────── */}
        <section className={`rounded-2xl border p-6 ${cardCls}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-inherit gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
                تحليل وتوزيع أسباب المرتجعات (Return Reasons Breakdown)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                رسم بياني يوضح الأسباب الأكثر تكراراً في طلبات الاسترجاع وفق خطوط تجميع قاعدة البيانات
              </p>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 self-start sm:self-auto">
              إجمالي الحالات: {data?.summary.totalUnitsReturned || 0}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
            {/* Bar Chart */}
            <div className="lg:col-span-2 h-72 sm:h-80 w-full" dir="ltr">
              {loading ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  <RefreshCw className="animate-spin text-cyan-400 me-2" size={18} />
                  جاري تحميل الرسم البياني...
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#21293B" : "#E2E8F0"} vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke={isDark ? "#94A3B8" : "#64748B"}
                      fontSize={11}
                      tickLine={false}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis stroke={isDark ? "#94A3B8" : "#64748B"} fontSize={11} tickLine={false} allowDecimals={false} />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className={`p-3 rounded-xl border shadow-xl text-xs ${isDark ? "bg-[#111520] border-[#252E44] text-white" : "bg-white border-slate-200 text-slate-900"}`}>
                              <p className="font-black text-cyan-400 mb-1">{item.name}</p>
                              <p>عدد الحالات: <span className="font-bold">{item.count}</span></p>
                              <p>النسبة المئوية: <span className="font-bold text-amber-400">{item.percentage}%</span></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400">
                  <CheckCircle2 size={32} className="text-emerald-400 mb-2" />
                  <span>لا توجد مرتجعات مسجلة حتى الآن، السجل نظيف تماماً!</span>
                </div>
              )}
            </div>

            {/* Reasons Percentage List */}
            <div className="flex flex-col justify-center space-y-3 ps-0 lg:ps-4 border-t lg:border-t-0 lg:border-s border-inherit pt-4 lg:pt-0">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
                النسبة المئوية لكل سبب:
              </span>
              {chartData.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="truncate max-w-[140px]">{item.name}</span>
                    </span>
                    <span className="font-black text-slate-400">{item.percentage}% ({item.count})</span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? "bg-[#1A2030]" : "bg-slate-200"}`}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 3. High-Risk Products Table ───────────────────────── */}
        <section className={`rounded-2xl border ${cardCls} overflow-hidden`}>
          {/* Table Header & Controls */}
          <div className="p-5 sm:p-6 border-b border-inherit flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <SlidersHorizontal className="text-amber-500" size={20} />
                قائمة المنتجات ومؤشرات التنبؤ بالمرتجع (Predictive Return Index)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                تصنيف تفاعلي للمنتجات حسب معدل الاسترجاع مع إمكانية التحقيق أو وقف البيع بضغطة زر
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className={`relative flex items-center rounded-xl px-3 py-1.5 border text-xs ${
                isDark ? "bg-[#0E1119] border-[#242C40]" : "bg-white border-slate-300"
              }`}>
                <Search size={14} className="text-slate-400 me-2" />
                <input
                  type="text"
                  placeholder="بحث باسم المنتج أو الكود..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent focus:outline-none w-36 sm:w-48 placeholder:text-slate-500"
                />
              </div>

              {/* Risk Filter Buttons */}
              <div className={`flex rounded-xl p-1 border text-xs font-bold ${
                isDark ? "bg-[#0E1119] border-[#242C40]" : "bg-slate-100 border-slate-200"
              }`}>
                <button
                  onClick={() => setFilterRisk("all")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    filterRisk === "all"
                      ? isDark
                        ? "bg-cyan-500/20 text-cyan-300 font-black"
                        : "bg-white text-cyan-800 shadow-xs font-black"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  الكل ({data?.products?.length || 0})
                </button>
                <button
                  onClick={() => setFilterRisk("high")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    filterRisk === "high"
                      ? "bg-red-500/20 text-red-400 font-black border border-red-500/30"
                      : "text-slate-400 hover:text-red-400"
                  }`}
                >
                  عالية الخطورة ({data?.summary?.highRiskProductsCount || 0})
                </button>
                <button
                  onClick={() => setFilterRisk("safe")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    filterRisk === "safe"
                      ? "bg-emerald-500/20 text-emerald-400 font-black"
                      : "text-slate-400 hover:text-emerald-400"
                  }`}
                >
                  آمنة
                </button>
              </div>
            </div>
          </div>

          {/* Table Element */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className={`border-b border-inherit font-black uppercase text-slate-400 ${
                isDark ? "bg-[#10141E]" : "bg-slate-50"
              }`}>
                <tr>
                  <th className="py-3.5 px-4">المنتج</th>
                  <th className="py-3.5 px-4 text-center">القسم</th>
                  <th className="py-3.5 px-4 text-center">السعر</th>
                  <th className="py-3.5 px-4 text-center">المبيعات / المرتجع</th>
                  <th className="py-3.5 px-4 text-center">نسبة الإرجاع (Return Rate)</th>
                  <th className="py-3.5 px-4 text-center">السبب الشائع</th>
                  <th className="py-3.5 px-4 text-center">إجمالي الخسائر</th>
                  <th className="py-3.5 px-4 text-center">إجراءات التدخل السريع</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-inherit">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <RefreshCw className="animate-spin text-cyan-400 mx-auto mb-2" size={24} />
                      جاري فحص مؤشرات الأداء والبيانات...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      لا توجد منتجات مطابقة لخيارات الفلترة الحالية.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => {
                    const isCrit = prod.riskLevel === "Critical";
                    const isHigh = prod.isHighRisk;

                    return (
                      <tr
                        key={prod.id}
                        className={`transition-colors ${
                          isCrit
                            ? isDark
                              ? "bg-red-950/20 hover:bg-red-950/30"
                              : "bg-red-50/50 hover:bg-red-50"
                            : isDark
                            ? "hover:bg-[#161B28]"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        {/* Product Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700/50">
                              {prod.images?.[0] ? (
                                <Image
                                  src={prod.images[0]}
                                  alt={prod.name}
                                  fill
                                  sizes="44px"
                                  className="object-cover"
                                  unoptimized={prod.images[0].startsWith("/uploads/") || prod.images[0].startsWith("http")}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500">
                                  <Package size={16} />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 max-w-xs">
                              <h4 className="font-bold text-slate-200 truncate leading-tight">
                                {prod.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-slate-400 font-mono">
                                  ID: {prod.id}
                                </span>
                                {prod.stockQuantity <= 0 && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-red-500/20 text-red-400 font-bold">
                                    موقوف / نافد
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 text-center font-medium text-slate-300">
                          {prod.category}
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4 text-center font-bold text-slate-300">
                          {formatPrice(prod.price)}
                        </td>

                        {/* Sales vs Returns */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-baseline gap-1 font-mono">
                            <span className="font-black text-emerald-400">{prod.totalSold} مباع</span>
                            <span className="text-slate-500">|</span>
                            <span className="font-black text-red-400">{prod.totalReturned} مرتجع</span>
                          </div>
                        </td>

                        {/* Return Rate Badge */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black border ${
                              isCrit
                                ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse"
                                : isHigh
                                ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                                : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            }`}
                          >
                            {isHigh && <AlertTriangle size={12} />}
                            {prod.returnRate}%
                          </span>
                        </td>

                        {/* Top Reason */}
                        <td className="py-3.5 px-4 text-center">
                          {prod.topReturnReason !== "None" ? (
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-800 text-amber-300 border border-slate-700">
                              {prod.returnReasons?.[0]?.ar || prod.topReturnReason}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">—</span>
                          )}
                        </td>

                        {/* Total Loss */}
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-red-400">
                          {prod.totalLoss > 0 ? formatPrice(prod.totalLoss) : "0 ج.م"}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Investigate Button */}
                            <button
                              onClick={() => setInvestigatingProduct(prod)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                isDark
                                  ? "bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30"
                                  : "bg-cyan-100 hover:bg-cyan-200 text-cyan-800"
                              }`}
                              title="فحص أسباب الاسترجاع والعملاء المتضررين"
                            >
                              <Wrench size={12} />
                              <span>فحص الجودة</span>
                            </button>

                            {/* Stop Selling / Reactivate Button */}
                            {prod.stockQuantity > 0 ? (
                              <button
                                onClick={() => handleStopSelling(prod)}
                                disabled={actionLoadingId === prod.id}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                  isDark
                                    ? "bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40"
                                    : "bg-red-100 hover:bg-red-200 text-red-800"
                                }`}
                                title="إيقاف بيع المنتج فوراً لحماية الأرباح"
                              >
                                <Ban size={12} />
                                <span>{actionLoadingId === prod.id ? "جاري الإيقاف..." : "إيقاف البيع"}</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReactivateProduct(prod)}
                                disabled={actionLoadingId === prod.id}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                  isDark
                                    ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
                                    : "bg-emerald-100 hover:bg-emerald-200 text-emerald-800"
                                }`}
                                title="إعادة تفعيل المنتج في المتجر وتعيين رصيد مخزون"
                              >
                                <PlayCircle size={12} />
                                <span>{actionLoadingId === prod.id ? "جاري التفعيل..." : "إعادة التفعيل"}</span>
                              </button>
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
        </section>
      </main>

      {/* ─── 4. Quality Investigation Modal ────────────────────── */}
      {investigatingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div
            className={`w-full max-w-xl rounded-3xl border p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in duration-200 ${
              isDark ? "bg-[#121622] border-[#252E44] text-slate-100" : "bg-white border-slate-300 text-slate-900"
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-inherit">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400">
                  <Wrench size={22} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight">
                    تقرير فحص الجودة والأسباب (Quality Audit)
                  </h3>
                  <p className="text-xs text-slate-400">
                    {investigatingProduct.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInvestigatingProduct(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-5 space-y-4 text-xs">
              {/* Stats Summary Bar */}
              <div className={`grid grid-cols-3 gap-3 p-3.5 rounded-2xl ${isDark ? "bg-[#181D2D]" : "bg-slate-100"}`}>
                <div>
                  <span className="text-slate-400 block text-[10px]">معدل الاسترجاع</span>
                  <span className={`text-base font-black ${
                    investigatingProduct.isHighRisk ? "text-red-400" : "text-emerald-400"
                  }`}>
                    {investigatingProduct.returnRate}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">إجمالي الخسائر</span>
                  <span className="text-base font-black text-amber-400 font-mono">
                    {formatPrice(investigatingProduct.totalLoss)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">القطع المرتجعة</span>
                  <span className="text-base font-black text-cyan-400">
                    {investigatingProduct.totalReturned} من أصل {investigatingProduct.totalSold}
                  </span>
                </div>
              </div>

              {/* Reasons Breakdown List */}
              <div>
                <h4 className="font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Info size={14} className="text-cyan-400" />
                  تفصيل أسباب شكاوى العملاء:
                </h4>
                {investigatingProduct.returnReasons && investigatingProduct.returnReasons.length > 0 ? (
                  <div className="space-y-2">
                    {investigatingProduct.returnReasons.map((r, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border flex items-center justify-between ${
                          isDark ? "bg-[#171C2A] border-[#222A3E]" : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold">
                          <span className="w-2 h-2 rounded-full bg-red-400" />
                          <span>{r.ar || r.en || r.reason}</span>
                        </div>
                        <span className="font-black text-amber-400">{r.count} طلب استرجاع</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 py-2">لا توجد شكاوى تفصيلية مسجلة لهذا المنتج.</p>
                )}
              </div>

              {/* AI Recommendations */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1.5">
                <h5 className="font-black flex items-center gap-1.5 text-xs">
                  <Sparkles size={14} />
                  توصيات التحسين الفوري المقترحة:
                </h5>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-200/90 font-medium">
                  {investigatingProduct.topReturnReason === "Defect" && (
                    <li>إلزام قسم الجودة في مصنع Amazon Furniture بفحص شاسيه المنتج وعجلات التحمل قبل الشحن.</li>
                  )}
                  {investigatingProduct.topReturnReason === "Size Mismatch" && (
                    <li>تحديث أبعاد المنتج (العرض &times; الارتفاع &times; العمق) على صفحة المتجر وإضافة رسم توضيحي لمطابقة المساحة.</li>
                  )}
                  {investigatingProduct.topReturnReason === "Shipping Damage" && (
                    <li>تعزيز خامات التغليف الكرتوني وإضافة زوايا فوم مضغوطة لحماية الأطراف أثناء الشحن والتنزيل.</li>
                  )}
                  <li>مراجعة تقييم الموردين للخامات وإيقاف الشحنات المعيبة فوراً.</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-inherit flex items-center justify-end gap-2.5">
              <button
                onClick={() => setInvestigatingProduct(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                  isDark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-200 text-slate-700"
                }`}
              >
                إغلاق
              </button>

              {investigatingProduct.stockQuantity > 0 && (
                <button
                  onClick={() => {
                    handleStopSelling(investigatingProduct);
                    setInvestigatingProduct(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 cursor-pointer flex items-center gap-1.5"
                >
                  <Ban size={13} />
                  <span>إيقاف بيع المنتج مؤقتاً</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
