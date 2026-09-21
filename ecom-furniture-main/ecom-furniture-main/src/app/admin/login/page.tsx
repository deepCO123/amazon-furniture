"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, User, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { useAdminAuthStore } from "@/store/adminAuthStore";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { login } = useAdminAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        router.push("/admin");
      } else {
        setError(result.message || "بيانات الدخول غير صحيحة، يرجى التأكد من البريد الإلكتروني وكلمة المرور.");
      }
    } catch {
      setError("حدث خطأ غير متوقع أثناء تسجيل الدخول.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-2xl border-2 border-[#C5A880] mx-auto">
            <Image
              src="/logo-icon.png"
              alt="Amazon Furniture"
              fill
              priority
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Amazon Furniture
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              لوحة تحكم وإدارة المتجر • حساب الإدارة
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          {error && (
            <div className="p-3.5 bg-red-950/80 border border-red-800 rounded-xl flex items-center gap-2.5 text-red-200 text-xs sm:text-sm">
              <AlertCircle size={18} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Fill Demo Credentials */}
          <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">بيانات الدخول الافتراضية:</span>
              <button
                type="button"
                onClick={() => {
                  setUsername("admin@amazonfurniture.eg");
                  setPassword("Admin@Pass2026!");
                }}
                className="text-[#C5A880] hover:underline font-semibold cursor-pointer"
              >
                تعبئة تلقائية ⚡
              </button>
            </div>
            <div className="text-slate-300 font-mono text-[11px] space-y-0.5" dir="ltr">
              <div>User: <span className="text-[#C5A880]">admin@amazonfurniture.eg</span></div>
              <div>Pass: <span className="text-[#C5A880]">Admin@Pass2026!</span></div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                اسم المستخدم / المسؤول
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="اسم المستخدم المعتمد"
                  className="w-full pl-3 pr-10 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]"
                />
                <User size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3 pr-10 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]"
                />
                <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#C5A880] hover:bg-[#b0936b] text-slate-950 font-bold text-base transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>جاري التحقق...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={20} />
                  <span>دخول لوحة التحكم</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to store */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowRight size={14} />
            <span>العودة لمتجر Amazon Furniture</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
