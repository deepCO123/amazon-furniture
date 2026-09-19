"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, X, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/components/ui/Toast";

interface GoogleAuthButtonProps {
  onSuccess?: () => void;
  className?: string;
  text?: string;
}

export default function GoogleAuthButton({
  onSuccess,
  className = "",
  text = "المتابعة السريعة بواسطة Google",
}: GoogleAuthButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [showManual, setShowManual] = useState(false);

  const setUser = useAuthStore((s) => s.setUser);
  const addToast = useToastStore((s) => s.addToast);

  // Quick preset Google profiles for testing/demo
  const googlePresets = [
    {
      name: "أحمد محمود إبراهيم",
      email: "ahmed.mahmoud@gmail.com",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120",
    },
    {
      name: "سارة كمال الدين",
      email: "sarah.kamal@gmail.com",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120",
    },
  ];

  const handleGoogleLogin = async (profile: {
    name: string;
    email: string;
    avatar?: string;
  }) => {
    setLoading(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          avatar: profile.avatar,
          provider: "google",
        }),
      });

      const data = await res.json();
      if (data.customer) {
        if (typeof setUser === "function") {
          setUser(data.customer);
        } else {
          useAuthStore.setState({ user: data.customer });
        }

        addToast(
          `أهلاً بك يا ${data.customer.name}! تم تسجيلك كعميل مميز وأرسلنا رسالة ترحيب لميلك ⭐`,
          "cart"
        );

        setModalOpen(false);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error(err);
      addToast("حدث خطأ أثناء تسجيل الدخول عبر Google", "wishlist");
    } finally {
      setLoading(false);
    }
  };

  const handleManualGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes("@")) {
      alert("يرجى إدخال بريد جوجل صالح ينتهي بـ @gmail.com");
      return;
    }
    const name = customName.trim() || customEmail.split("@")[0];
    handleGoogleLogin({
      name,
      email: customEmail.trim().toLowerCase(),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        name
      )}&backgroundColor=c5a880`,
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={`w-full py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer ${className}`}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        <span>{text}</span>
      </button>

      {/* Google Login Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 text-start" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    تسجيل الدخول باستخدام Google
                  </h3>
                  <p className="text-xs text-slate-500">
                    للمتابعة إلى متجر Amazon Furniture
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center space-y-3">
                <Loader2 size={32} className="animate-spin text-[#C5A880] mx-auto" />
                <p className="text-sm font-semibold text-slate-700">
                  جاري تسجيل الحساب وإرسال رسالة الترحيب...
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-600">
                  اختر حساب Google الخاص بك للدخول بنقرة واحدة والحصول على مميزات العميل المميز:
                </p>

                {/* Preset Google Accounts */}
                <div className="space-y-2">
                  {googlePresets.map((acc, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleGoogleLogin(acc)}
                      className="w-full p-3 rounded-xl border border-slate-200 hover:border-[#C5A880] hover:bg-amber-50/40 transition-all flex items-center justify-between text-start group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200">
                          <Image
                            src={acc.avatar}
                            alt={acc.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-[#8B6E45]">
                            {acc.name}
                          </p>
                          <p className="text-xs text-slate-500">{acc.email}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#8B6E45] opacity-0 group-hover:opacity-100 transition-opacity">
                        متابعة ←
                      </span>
                    </button>
                  ))}
                </div>

                {/* Option to type own Gmail */}
                {!showManual ? (
                  <button
                    type="button"
                    onClick={() => setShowManual(true)}
                    className="w-full py-2.5 text-xs text-slate-600 hover:text-slate-900 font-semibold border-t border-slate-100 pt-3 text-center"
                  >
                    + استخدام حساب Google آخر (أدخل بريدك الشخصي)
                  </button>
                ) : (
                  <form
                    onSubmit={handleManualGoogleSubmit}
                    className="space-y-3 pt-3 border-t border-slate-100"
                  >
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        اسمك بالكامل
                      </label>
                      <input
                        type="text"
                        required
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="مثال: محمد مصطفى"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        بريد Google (Gmail)
                      </label>
                      <input
                        type="email"
                        required
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 bg-[#C5A880] hover:bg-[#b0936b] text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-sm"
                    >
                      متابعة وتسجيل الدخول
                    </button>
                  </form>
                )}

                {/* VIP badge footer */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex items-center gap-2 text-[11px] text-amber-900">
                  <Sparkles size={16} className="text-amber-600 shrink-0" />
                  <span>
                    عند التسجيل، سيصلك فوراً إيميل ترحيبي فاخر مع شارة العميل المميز وخدمة التركيب المجانية.
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
