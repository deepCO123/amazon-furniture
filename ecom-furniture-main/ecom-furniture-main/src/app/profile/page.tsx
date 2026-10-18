"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Package,
  Ruler,
  KeyRound,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  LogOut,
  Save,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/lib/apiClient";
import type { Order, CustomOrder } from "@/types";
import { formatPrice } from "@/lib/utils";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { useToastStore } from "@/components/ui/Toast";

type ProfileTab = "orders" | "custom_orders" | "details" | "security";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);

  const [activeTab, setActiveTab] = useState<ProfileTab>("orders");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);

  // Profile Form state
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState((user as unknown as { phone?: string })?.phone || "");
  const [city, setCity] = useState((user as unknown as { city?: string })?.city || "المنصورة");
  const [address, setAddress] = useState("");
  const [updatingDetails, setUpdatingDetails] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPass, setChangingPass] = useState(false);

  // Decision loading state for custom orders
  const [respondingId, setRespondingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadProfileData = async () => {
      setLoading(true);
      try {
        const [ordersRes, customOrdersRes, profileRes] = await Promise.all([
          apiClient.getMyOrders(),
          apiClient.getMyCustomOrders(),
          apiClient.getCustomerProfile(),
        ]);

        setOrders(ordersRes || []);
        setCustomOrders(customOrdersRes || []);

        const cust = (profileRes as { customer?: { name?: string; phone?: string; city?: string; address?: string } })?.customer;
        if (cust) {
          setName(cust.name || "");
          setPhone(cust.phone || "");
          setCity(cust.city || "المنصورة");
          setAddress(cust.address || "");
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [user]);

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingDetails(true);
    try {
      const res = await apiClient.updateCustomerProfile({ name, phone, city, address } as unknown as object);
      if (res.success) {
        addToast("تم تحديث بياناتك الشخصية بنجاح!", "success");
      } else {
        addToast(res.message || "فشل تحديث البيانات", "error");
      }
    } catch {
      addToast("حدث خطأ أثناء تحديث البيانات", "error");
    } finally {
      setUpdatingDetails(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast("كلمة المرور الجديدة غير متطابقة", "error");
      return;
    }
    if (newPassword.length < 6) {
      addToast("كلمة المرور يجب أن تكون 6 أحرف على الأقل", "error");
      return;
    }

    setChangingPass(true);
    try {
      const res = await apiClient.changePassword(currentPassword, newPassword);
      if (res.success) {
        addToast("تم تغيير كلمة المرور بنجاح!", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        addToast(res.message || res.error || "كلمة المرور الحالية غير صحيحة", "error");
      }
    } catch {
      addToast("حدث خطأ أثناء تغيير كلمة المرور", "error");
    } finally {
      setChangingPass(false);
    }
  };

  const handleCustomOrderDecision = async (id: string, decision: "approved" | "rejected") => {
    setRespondingId(id);
    try {
      const res = await apiClient.respondToCustomOrder(id, decision);
      if (res.success) {
        addToast(
          decision === "approved"
            ? "تهانينا! تم اعتماد عرض السعر بنجاح، وسيبدأ المصنع بالتنفيذ."
            : "تم رفض عرض السعر.",
          "success"
        );
        // Refresh custom orders
        const updated = await apiClient.getMyCustomOrders();
        setCustomOrders(updated || []);
      } else {
        addToast(res.message || "حدث خطأ أثناء تسجيل قرارك", "error");
      }
    } catch {
      addToast("حدث خطأ في الاتصال بالخادم", "error");
    } finally {
      setRespondingId(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl border border-stone-200 text-center space-y-5">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-700">
            <User size={32} />
          </div>
          <h1 className="text-2xl font-black text-stone-900">تسجيل الدخول للملف الشخصي</h1>
          <p className="text-stone-500 text-sm leading-relaxed">
            يرجى تسجيل الدخول لعرض وتتبع طلباتك، ومتابعة عروض أسعار التفصيل، وإدارة عناوينك.
          </p>
          <div className="pt-2 flex flex-col gap-3">
            <Link
              href="/auth/login?redirect=/profile"
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors shadow-md shadow-amber-600/20"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/"
              className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition-colors"
            >
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 lg:px-8 text-stone-800" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        <Breadcrumb items={[{ label: "الرئيسية", href: "/" }, { label: "حسابي والملف الشخصي" }]} />

        {/* Profile Header Card */}
        <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-right">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-amber-500/20 border-2 border-amber-400/40 shrink-0">
              {user.avatar ? (
                <Image src={user.avatar} alt={user.name || "Customer"} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-amber-400 font-black text-2xl">
                  {user.name ? user.name.slice(0, 1) : "A"}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                <ShieldCheck size={14} />
                <span>عميل مميز (VIP)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{user.name}</h1>
              <p className="text-xs sm:text-sm text-stone-300 flex items-center gap-2">
                <Mail size={14} className="text-amber-400 shrink-0" />
                <span>{user.email}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white text-xs sm:text-sm font-bold border border-white/15 transition-colors"
          >
            <LogOut size={16} />
            <span>تسجيل الخروج</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 p-1.5 bg-stone-200/70 rounded-2xl border border-stone-300/50">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === "orders"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-600 hover:text-stone-900 hover:bg-white/50"
            }`}
          >
            <Package size={16} className={activeTab === "orders" ? "text-amber-600" : ""} />
            <span>طلباتي ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("custom_orders")}
            className={`flex-1 min-w-[170px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === "custom_orders"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-600 hover:text-stone-900 hover:bg-white/50"
            }`}
          >
            <Ruler size={16} className={activeTab === "custom_orders" ? "text-amber-600" : ""} />
            <span>تفصيل خاص 📐 ({customOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("details")}
            className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === "details"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-600 hover:text-stone-900 hover:bg-white/50"
            }`}
          >
            <User size={16} className={activeTab === "details" ? "text-amber-600" : ""} />
            <span>بياناتي والعناوين</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === "security"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-600 hover:text-stone-900 hover:bg-white/50"
            }`}
          >
            <KeyRound size={16} className={activeTab === "security" ? "text-amber-600" : ""} />
            <span>أمان كلمة المرور</span>
          </button>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center text-stone-500 flex items-center justify-center gap-3">
                <Loader2 className="animate-spin text-amber-600" />
                <span>جاري تحميل طلباتك...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center space-y-4 border border-stone-200">
                <Package size={48} className="mx-auto text-stone-300" />
                <h3 className="text-lg font-bold text-stone-800">لا توجد طلبات سابقة حتى الآن</h3>
                <p className="text-stone-500 text-sm max-w-sm mx-auto">
                  تصفح كتالوج الأثاث الفاخر واختر ما يناسب منزلك من المصنع لحد باب بيتك مع استشارة وتركيب مجاني.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl transition-colors shadow-md"
                >
                  <span>تصفح المنتجات</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200 hover:border-amber-400 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-stone-900 text-base sm:text-lg">
                          #{ord.id}
                        </span>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                            ord.status === "delivered"
                              ? "bg-emerald-100 text-emerald-800"
                              : ord.status === "shipped"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {ord.status === "delivered"
                            ? "تم التوصيل والتركيب"
                            : ord.status === "shipped"
                            ? "قيد الشحن"
                            : "قيد التجهيز بالمصنع"}
                        </span>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                            ord.paymentStatus === "paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-stone-100 text-stone-700"
                          }`}
                        >
                          {ord.paymentStatus === "paid" ? "مدفوع ✓" : "دفع عند الاستلام"}
                        </span>
                      </div>

                      <p className="text-xs text-stone-500 flex items-center gap-2">
                        <Clock size={13} />
                        <span>{new Date(ord.date).toLocaleDateString("ar-EG", { dateStyle: "long" })}</span>
                        <span>•</span>
                        <span>{ord.items?.length || 1} قطعة أثاث</span>
                      </p>

                      <div className="text-amber-800 font-black text-base sm:text-lg pt-1">
                        الإجمالي: {formatPrice(ord.total)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto pt-2 md:pt-0">
                      <Link
                        href={`/track?orderId=${encodeURIComponent(ord.id)}`}
                        className="w-full md:w-auto text-center px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-sm"
                      >
                        تتبع الطلب والفاتورة
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Custom Orders */}
        {activeTab === "custom_orders" && (
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center text-stone-500 flex items-center justify-center gap-3">
                <Loader2 className="animate-spin text-amber-600" />
                <span>جاري تحميل طلبات التفصيل...</span>
              </div>
            ) : customOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center space-y-4 border border-stone-200">
                <Ruler size={48} className="mx-auto text-amber-600" />
                <h3 className="text-lg font-bold text-stone-800">ليس لديك طلبات تفصيل خاصة حالياً</h3>
                <p className="text-stone-500 text-sm max-w-sm mx-auto">
                  معاك صورة لمكتب معين أو مقاسات خاصة لغرفتك؟ ارفعها الآن لمهندسينا وسنقوم بتسعيرها وتصنيعها خصيصاً لك.
                </p>
                <Link
                  href="/custom-order"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm rounded-xl transition-colors shadow-md"
                >
                  <Ruler size={16} />
                  <span>اطلب تفصيل أثاث بمقاسك</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {customOrders.map((co) => (
                  <div
                    key={co.id}
                    className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200 hover:border-amber-400 transition-colors space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-stone-900 text-base sm:text-lg">
                            طلب تفصيل #{co.id}
                          </span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                            {co.status === "new"
                              ? "قيد المعاينة الهندسية"
                              : co.status === "priced"
                              ? "تم تحديد عرض السعر 💰"
                              : co.status === "in_production"
                              ? "قيد التصنيع بالمصنع 🪵"
                              : co.status === "ready"
                              ? "جاهز للتسليم والتركيب 🚚"
                              : co.status}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-1">
                          تاريخ الطلب: {new Date(co.createdAt).toLocaleDateString("ar-EG")}
                        </p>
                      </div>

                      {co.quotePrice && co.quotePrice > 0 ? (
                        <div className="text-right">
                          <span className="text-xs text-stone-500 block">عرض السعر المقترح:</span>
                          <span className="text-xl font-black text-emerald-600">
                            {formatPrice(co.quotePrice)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-stone-400 font-semibold bg-stone-100 px-3 py-1 rounded-lg">
                          جاري تحديد التكلفة بالمصنع
                        </span>
                      )}
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-stone-50 p-3.5 rounded-xl">
                      <div>
                        <span className="text-stone-500 block">نوع القطعة:</span>
                        <strong className="text-stone-800">{co.furnitureType}</strong>
                      </div>
                      <div>
                        <span className="text-stone-500 block">الأبعاد:</span>
                        <strong className="text-stone-800">
                          {co.dimensions?.length || "-"} × {co.dimensions?.width || "-"} × {co.dimensions?.height || "-"} سم
                        </strong>
                      </div>
                      <div>
                        <span className="text-stone-500 block">الخامات المفضلة:</span>
                        <strong className="text-stone-800">{co.preferredMaterial || "زان أحمر طبيعي"}</strong>
                      </div>
                    </div>

                    {/* Image Preview if uploaded */}
                    {co.referenceImage && (
                      <div className="flex items-center gap-3 pt-1">
                        <span className="text-xs text-stone-500">التصميم المرفوع:</span>
                        <a
                          href={co.referenceImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-amber-700 font-bold hover:underline"
                        >
                          <span>عرض صورة التصميم الأصلية</span>
                        </a>
                      </div>
                    )}

                    {/* Decision Action Buttons when quote is ready and awaiting approval */}
                    {co.quotePrice && co.quotePrice > 0 && co.status === "priced" && (
                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-right">
                          <strong className="text-stone-900 text-sm block">
                            تم اعتماد المقايسة من مهندس الديكور!
                          </strong>
                          <span className="text-xs text-stone-600">
                            التكلفة تشمل الخامات، التصنيع، والتوصيل والتركيب المجاني.
                          </span>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            disabled={respondingId === co.id}
                            onClick={() => handleCustomOrderDecision(co.id, "approved")}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm disabled:opacity-50"
                          >
                            <CheckCircle2 size={15} />
                            <span>قبول وبدء التصنيع</span>
                          </button>
                          <button
                            disabled={respondingId === co.id}
                            onClick={() => handleCustomOrderDecision(co.id, "rejected")}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs rounded-lg transition-colors disabled:opacity-50"
                          >
                            <XCircle size={15} />
                            <span>رفض</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Personal Details & Address */}
        {activeTab === "details" && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200 max-w-2xl">
            <h2 className="text-xl font-black text-stone-900 mb-6 flex items-center gap-2">
              <User size={20} className="text-amber-600" />
              <span>تحديث البيانات الشخصية وعنوان الشحن</span>
            </h2>

            <form onSubmit={handleUpdateDetails} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">رقم الهاتف (واتساب)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">المدينة / المحافظة</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="المنصورة"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">العنوان التفصيلي للشحن</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="اسم الشارع، رقم العمارة، الشقة"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 text-sm"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={updatingDetails}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl transition-colors shadow-md disabled:opacity-50"
                >
                  {updatingDetails ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 4: Security */}
        {activeTab === "security" && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200 max-w-2xl">
            <h2 className="text-xl font-black text-stone-900 mb-6 flex items-center gap-2">
              <KeyRound size={20} className="text-amber-600" />
              <span>تغيير كلمة المرور</span>
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">كلمة المرور الحالية</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="6 أحرف على الأقل"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">تأكيد كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 text-sm"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={changingPass}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm rounded-xl transition-colors shadow-md disabled:opacity-50"
                >
                  {changingPass ? <Loader2 className="animate-spin" size={16} /> : <KeyRound size={16} />}
                  <span>تحديث كلمة المرور</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
