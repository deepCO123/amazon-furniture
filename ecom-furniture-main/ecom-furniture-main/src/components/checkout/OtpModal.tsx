"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, AlertCircle, RefreshCw, X, CheckCircle2, Lock } from "lucide-react";
import Button from "@/components/ui/Button";

interface OtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  onVerified: () => void;
  isEn?: boolean;
}

export default function OtpModal({
  isOpen,
  onClose,
  phone,
  onVerified,
  isEn = false,
}: OtpModalProps) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // إعادة ضبط المؤقت وتفريغ الحقول عند فتح النافذة
  useEffect(() => {
    if (isOpen) {
      setDigits(["", "", "", "", "", ""]);
      setError(null);
      setTimeLeft(300);
      setTimeout(() => {
        inputsRef.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  // عداد تنازلي مدته 5 دقائق
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, timeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // التعامل مع إدخال كل رقم
  const handleChange = (index: number, value: string) => {
    // قبول الأرقام فقط
    const cleanVal = value.replace(/\D/g, "");
    if (!cleanVal) {
      const newDigits = [...digits];
      newDigits[index] = "";
      setDigits(newDigits);
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleanVal[cleanVal.length - 1]; // أخذ آخر رقم مدخل
    setDigits(newDigits);
    setError(null);

    // نقل التركيز تلقائياً للحقل التالي
    if (index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  // التعامل مع مسح الأرقام (Backspace)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // دعم لصق الكود بالكامل دفعة واحدة (Paste full 6 digits)
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    setError(null);

    const nextIndex = Math.min(pasted.length, 5);
    inputsRef.current[nextIndex]?.focus();
  };

  // التحقق من كود الـ OTP
  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const otpCode = digits.join("");

    if (otpCode.length !== 6) {
      setError(
        isEn
          ? "Please enter the complete 6-digit verification code."
          : "يرجى إدخال رمز التحقق كاملاً المكون من 6 أرقام."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          otp: otpCode,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.verified) {
        setError(
          data.message ||
            (isEn
              ? "Invalid verification code. Please check and try again."
              : "رمز التحقق غير صحيح، يرجى التأكد وإعادة المحاولة.")
        );
        return;
      }

      // تم التحقق بنجاح!
      onVerified();
    } catch {
      setError(
        isEn
          ? "Connection error. Please try again."
          : "تعذر التحقق من الرمز بسبب خطأ في الاتصال، يرجى المحاولة ثانية."
      );
    } finally {
      setLoading(false);
    }
  };

  // إعادة إرسال الكود
  const handleResend = async () => {
    if (timeLeft > 0 || resending) return;
    setResending(true);
    setError(null);

    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || (isEn ? "Failed to resend code." : "تعذر إعادة إرسال الرمز."));
        return;
      }

      setTimeLeft(300);
      setDigits(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
      if (data.debugOtp) {
        setDebugOtp(data.debugOtp);
      }
    } catch {
      setError(isEn ? "Connection error." : "حدث خطأ في الاتصال بالخادم.");
    } finally {
      setResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
          className="relative w-full max-w-md bg-white dark:bg-[#151922] rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 text-center"
          dir={isEn ? "ltr" : "rtl"}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 left-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Header Icon */}
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-600 dark:text-amber-400 shadow-sm">
            <Lock size={28} />
          </div>

          {/* Title & Description */}
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">
            {isEn ? "Confirm Phone Ownership" : "تأكيد ملكية رقم الهاتف"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            {isEn
              ? `We sent a 6-digit security code to `
              : `تم إرسال رمز أمان مكون من 6 أرقام إلى `}
            <span className="font-bold text-slate-800 dark:text-slate-200" dir="ltr">
              {phone}
            </span>
            {isEn
              ? " to verify your order authenticity."
              : " لحماية طلبك وتأكيد حجز قطع الأثاث."}
          </p>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3.5 mb-5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 text-xs text-start"
            >
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* 6-Digit OTP Inputs */}
          <form onSubmit={handleVerify}>
            <div className="flex justify-center items-center gap-2 sm:gap-3 mb-6" dir="ltr">
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputsRef.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  className="w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-black rounded-2xl bg-slate-50 dark:bg-[#0E1119] border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-amber-500 dark:focus:border-amber-400 focus:bg-white dark:focus:bg-[#121622] focus:outline-none transition-all shadow-xs"
                />
              ))}
            </div>

            {/* Countdown Timer & Resend */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-6 px-1">
              <span className="flex items-center gap-1.5 font-medium">
                <span>{isEn ? "Code expires in:" : "تنتهي صلاحية الرمز خلال:"}</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  {formatTimer(timeLeft)}
                </span>
              </span>

              <button
                type="button"
                onClick={handleResend}
                disabled={timeLeft > 0 || resending}
                className={`inline-flex items-center gap-1 font-bold transition-all ${
                  timeLeft > 0 || resending
                    ? "opacity-40 cursor-not-allowed text-slate-400"
                    : "text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                }`}
              >
                <RefreshCw size={13} className={resending ? "animate-spin" : ""} />
                <span>{isEn ? "Resend Code" : "إعادة إرسال الرمز"}</span>
              </button>
            </div>

            {/* Submit Button */}
            <div className="space-y-2.5">
              <Button
                type="submit"
                size="lg"
                disabled={loading || digits.join("").length !== 6}
                className="w-full py-4 rounded-xl font-black text-base shadow-lg shadow-amber-500/20 bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>{isEn ? "Verifying code..." : "جاري التحقق وتأكيد الحجز..."}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={20} />
                    <span>{isEn ? "Verify & Place Order" : "تأكيد الرمز وإتمام الطلب"}</span>
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {isEn ? "Cancel & Edit Phone Number" : "إلغاء وتعديل رقم الهاتف"}
              </button>
            </div>
          </form>

          {/* Development Notice */}
          {process.env.NODE_ENV !== "production" && debugOtp && (
            <div className="mt-4 p-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-lg text-[11px] text-amber-700 dark:text-amber-400">
              <span>{isEn ? "Dev Mode OTP: " : "رمز التحقق التجريبي (بيئة التطوير): "}</span>
              <strong className="font-mono">{debugOtp}</strong>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
