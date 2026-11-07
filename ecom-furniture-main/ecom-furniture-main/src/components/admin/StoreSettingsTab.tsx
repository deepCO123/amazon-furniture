"use client";

import { useState, useEffect } from "react";
import {
  Zap,
  Smartphone,
  Save,
  CheckCircle2,
  Copy,
  CheckCheck,
  Percent,
  Activity,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

interface StoreSettingsData {
  metaPixelId: string;
  depositPercentage: number;
  instapayAddress: string;
  instapayPhone: string;
  vodafoneCashNumber: string;
  depositEnabled: boolean;
}

interface StoreSettingsTabProps {
  isDark: boolean;
  panelCls: string;
  cardCls: string;
  inputCls: string;
  textMuted: string;
  showNotification: (msg: string) => void;
}

export default function StoreSettingsTab({
  isDark,
  cardCls,
  inputCls,
  textMuted,
  showNotification,
}: StoreSettingsTabProps) {
  const [settings, setSettings] = useState<StoreSettingsData>({
    metaPixelId: "",
    depositPercentage: 25,
    instapayAddress: "amazonfurniture@instapay",
    instapayPhone: "01091084863",
    vodafoneCashNumber: "01091084863",
    depositEnabled: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings) {
          setSettings(data.settings);
        }
      })
      .catch((err) => {
        console.error("Failed to load settings:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (text: string, field: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        showNotification("✓ تم حفظ إعدادات الدفع والعربون وبيكسل الإعلانات بنجاح!");
      } else {
        showNotification("حدث خطأ أثناء حفظ الإعدادات: " + (data.error || ""));
      }
    } catch (err: unknown) {
      showNotification("فشل الاتصال بالخادم لحفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-sm font-semibold text-slate-500">
        جاري تحميل إعدادات الدفع والتسويق...
      </div>
    );
  }

  const isPixelValid = Boolean(
    settings.metaPixelId && /^\d+$/.test(settings.metaPixelId.trim())
  );

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-5xl">
      {/* ── 1. Top Header & Quick Save ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-md">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#E8D4B0] font-bold">
            إعدادات التجارة الإلكترونية والتسويق
          </span>
          <h2 className="text-xl sm:text-2xl font-bold mt-1">
            إعدادات بيكسل ميتا (Meta Pixel) والدفع السريع (InstaPay & فودافون كاش)
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            تحكم في حسابات استقبال الأموال والعربون وتتبع الحملات الإعلانية على فيسبوك وإنستجرام مباشرة
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Save size={18} />
          <span>{saving ? "جاري الحفظ..." : "حفظ التغييرات الآن"}</span>
        </button>
      </div>

      {/* ── 2. Meta Pixel (Facebook & Instagram) Section ── */}
      <div className={`p-6 rounded-2xl border ${cardCls} space-y-5 shadow-xs`}>
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Activity size={24} />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>بيكسل الإعلانات (Meta Pixel - Facebook & Instagram)</span>
                {isPixelValid ? (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    <span>نشط ومفعل ✓</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    بانتظار إضافة الـ Pixel ID
                  </span>
                )}
              </h3>
              <p className={`text-xs ${textMuted} mt-0.5`}>
                يقوم بتتبع زوار إعلاناتك، المشاهدات، إضافة السلة، والطلبات تلقائياً لتحسين تكلفة الإعلانات (ROAS)
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">
                معرّف البيكسل (Meta Pixel ID / Dataset ID)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={settings.metaPixelId}
                  onChange={(e) =>
                    setSettings({ ...settings, metaPixelId: e.target.value.trim() })
                  }
                  placeholder="مثال: 123456789012345 (أرقام فقط)"
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-sm outline-none transition-all ${inputCls}`}
                />
              </div>
              <p className={`text-[11px] ${textMuted} mt-1.5`}>
                انسخ الـ Pixel ID المكون من 15-16 رقماً من Meta Events Manager والصقه هنا ثم اضغط حفظ.
              </p>
            </div>

            {/* Quick Helper */}
            <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs space-y-2">
              <span className="font-bold text-blue-950 dark:text-blue-300 flex items-center gap-1.5">
                <HelpCircle size={15} />
                <span>كيف تجلب الـ Pixel ID الخاص بك؟</span>
              </span>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 dark:text-slate-300 text-[11px]">
                <li>افتح حسابك في مدير أحداث ميتا (Meta Events Manager).</li>
                <li>اختر البيكسل أو الـ Dataset الخاص بمتجرك.</li>
                <li>انسخ الرقم التعريفي (Pixel ID) والصقه في الحقل أعلاه.</li>
              </ol>
              <a
                href="https://adsmanager.facebook.com/events_manager"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 mt-1"
              >
                <span>فتح Meta Events Manager ↗</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Active Auto Events Tracked */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#151922] border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>الأحداث المعيارية المتتبعة تلقائياً في المتجر:</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#10141D] border border-slate-200/70 dark:border-slate-800">
                <span className="font-semibold text-slate-800 dark:text-slate-200">مشاهدة المنتج (ViewContent)</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">مفعل تلقائياً</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#10141D] border border-slate-200/70 dark:border-slate-800">
                <span className="font-semibold text-slate-800 dark:text-slate-200">إضافة للسلة (AddToCart)</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">مفعل تلقائياً</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#10141D] border border-slate-200/70 dark:border-slate-800">
                <span className="font-semibold text-slate-800 dark:text-slate-200">بدء الدفع (InitiateCheckout)</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">مفعل تلقائياً</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#10141D] border border-slate-200/70 dark:border-slate-800">
                <span className="font-semibold text-slate-800 dark:text-slate-200">إتمام الشراء (Purchase)</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">مفعل تلقائياً</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#10141D] border border-slate-200/70 dark:border-slate-800">
                <span className="font-semibold text-slate-800 dark:text-slate-200">نقرة واتساب المباشرة (Contact)</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">مفعل تلقائياً</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Quick Payment & Deposit Section (InstaPay & Vodafone Cash) ── */}
      <div className={`p-6 rounded-2xl border ${cardCls} space-y-6 shadow-xs`}>
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="font-bold text-base">
                طرق الدفع السريع ونظام دفع العربون (Deposit Plan)
              </h3>
              <p className={`text-xs ${textMuted} mt-0.5`}>
                تحكم في حسابات استقبال التحويلات الفورية ونسبة العربون لتصنيع وحجز الأثاث
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              تفعيل خيار العربون في الـ Checkout:
            </span>
            <input
              type="checkbox"
              checked={settings.depositEnabled}
              onChange={(e) =>
                setSettings({ ...settings, depositEnabled: e.target.checked })
              }
              className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
            />
          </label>
        </div>

        {/* Deposit Percentage Setting */}
        <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-bold text-sm text-amber-950 dark:text-amber-300">
              <Percent size={18} className="text-amber-600" />
              <span>نسبة العربون المطلوب (Deposit Percentage):</span>
            </div>
            <p className="text-xs text-amber-900/80 dark:text-amber-300/80 mt-1 max-w-xl">
              تُحسب تلقائياً للعميل عند اختيار إنستاباي أو فودافون كاش، ويكون الباقي للدفع كاش عند الاستلام والمعاينة.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min={5}
              max={100}
              step={5}
              value={settings.depositPercentage}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  depositPercentage: Number(e.target.value) || 25,
                })
              }
              className={`w-20 px-3 py-2 rounded-xl border text-center font-bold text-base outline-none ${inputCls}`}
            />
            <span className="text-sm font-extrabold text-amber-950 dark:text-amber-200">%</span>
          </div>
        </div>

        {/* Account Details: InstaPay & Vodafone Cash */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* InstaPay */}
          <div className="p-5 rounded-xl border border-indigo-200/70 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/15 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  IPN
                </div>
                <div>
                  <h4 className="font-bold text-sm text-indigo-950 dark:text-indigo-200">
                    إنستاباي (InstaPay Egypt)
                  </h4>
                  <span className="text-[10px] text-indigo-800/80 dark:text-indigo-300">تحويل بنكي فوري لحظي 0% عمولة</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  معرّف الدفع اللحظي (IPA):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={settings.instapayAddress}
                    onChange={(e) =>
                      setSettings({ ...settings, instapayAddress: e.target.value.trim() })
                    }
                    placeholder="مثال: amazonfurniture@instapay"
                    className={`flex-1 px-3 py-2 rounded-lg border font-mono text-xs outline-none ${inputCls}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(settings.instapayAddress, "ipa")}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 text-indigo-600 hover:bg-indigo-50 border border-slate-200 dark:border-slate-700 cursor-pointer"
                    title="نسخ"
                  >
                    {copiedField === "ipa" ? <CheckCheck size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رقم الهاتف المرتبط بإنستاباي:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={settings.instapayPhone}
                    onChange={(e) =>
                      setSettings({ ...settings, instapayPhone: e.target.value.trim() })
                    }
                    placeholder="01091084863"
                    className={`flex-1 px-3 py-2 rounded-lg border font-mono text-xs outline-none ${inputCls}`}
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(settings.instapayPhone, "ipa_phone")}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 text-indigo-600 hover:bg-indigo-50 border border-slate-200 dark:border-slate-700 cursor-pointer"
                    title="نسخ"
                  >
                    {copiedField === "ipa_phone" ? <CheckCheck size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Vodafone Cash */}
          <div className="p-5 rounded-xl border border-red-200/70 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/15 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                  <Smartphone size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-red-950 dark:text-red-200">
                    فودافون كاش ومحافظ المحمول
                  </h4>
                  <span className="text-[10px] text-red-800/80 dark:text-red-300">فودافون / أورانج / اتصالات / WE</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رقم محفظة كاش المعتمد لاستقبال العربون:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={settings.vodafoneCashNumber}
                    onChange={(e) =>
                      setSettings({ ...settings, vodafoneCashNumber: e.target.value.trim() })
                    }
                    placeholder="01091084863"
                    className={`flex-1 px-3 py-2 rounded-lg border font-mono text-xs outline-none ${inputCls}`}
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(settings.vodafoneCashNumber, "voda")}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 text-red-600 hover:bg-red-50 border border-slate-200 dark:border-slate-700 cursor-pointer"
                    title="نسخ"
                  >
                    {copiedField === "voda" ? <CheckCheck size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <p className={`text-[10px] ${textMuted} mt-1`}>
                  يظهر في صفحة الدفع بنقرة نسخ واحدة، ويُطلب من العميل إرفاق لقطة شاشة التحويل.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Save Button Footer ── */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
        >
          <Save size={18} />
          <span>{saving ? "جاري حفظ الإعدادات..." : "حفظ جميع الإعدادات وتطبيقها فوراً"}</span>
        </button>
      </div>
    </form>
  );
}
