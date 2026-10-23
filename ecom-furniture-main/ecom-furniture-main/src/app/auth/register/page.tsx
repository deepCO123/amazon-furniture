"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

const registerSchema = z
  .object({
    name: z.string().min(2, "يرجى إدخال الاسم بالكامل"),
    email: z.string().email("يرجى إدخال بريد إلكتروني صحيح"),
    phone: z.string().min(8, "يرجى إدخال رقم الهاتف / الواتساب").optional().or(z.literal("")),
    city: z.string().optional().or(z.literal("")),
    password: z.string().min(6, "كلمة المرور يجب أن لا تقل عن 6 أحرف"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const registerUser = useAuthStore((s) => s.register);
  const { language } = useLanguageStore();
  const isEn = language === "en";

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError("");

    const result = await registerUser(
      data.name,
      data.email,
      data.password,
      data.phone,
      data.city || "المنصورة"
    );

    if (result.success) {
      router.push("/");
    } else {
      setError(
        result.message ||
          (isEn
            ? "Failed to create account. Please try again."
            : "فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.")
      );
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center py-12 px-4">
      <AnimatedSection className="w-full max-w-md">
        <div className="bg-white dark:bg-[#151D2A] rounded-2xl p-8 border border-surface-dark shadow-sm">
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex flex-col items-center gap-2 mb-4 group" aria-label="AMAZON">
              <Image
                src="/logo/amazon-logo-bronze.svg"
                alt="AMAZON"
                width={160}
                height={80}
                className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </Link>
            <h1 className="text-2xl font-bold text-primary">
              {isEn ? "Create VIP Account" : "إنشاء حساب جديد"}
            </h1>
            <p className="text-muted mt-1 text-sm">
              {isEn
                ? "Join AMAZON clients and enjoy exclusive privileges"
                : "انضم لعملاء AMAZON واستمتع بالمزايا الحصرية"}
            </p>
          </div>

          {/* 1-Click Google Register */}
          <div className="mb-6">
            <GoogleAuthButton
              text={isEn ? "Sign up instantly with Google" : "تسجيل حساب VIP فوراً بـ Google"}
              onSuccess={() => router.push("/")}
            />
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-dark" />
              </div>
              <span className="relative px-3 bg-white dark:bg-[#151D2A] text-xs text-muted uppercase font-semibold">
                {isEn ? "Or register with email" : "أو بالتسجيل بالبريد"}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg text-sm text-danger"
              >
                {error}
              </motion.div>
            )}

            <Input
              label={isEn ? "Full Name" : "الاسم بالكامل"}
              placeholder={isEn ? "e.g. John Doe" : "مثال: أحمد الشربيني"}
              error={errors.name?.message}
              {...register("name")}
            />

            <Input
              label={isEn ? "Email Address" : "البريد الإلكتروني"}
              type="email"
              placeholder="name@example.com"
              error={errors.email?.message}
              {...register("email")}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label={isEn ? "Phone / WhatsApp" : "رقم الهاتف / واتساب"}
                placeholder="010xxxxxxxx"
                error={errors.phone?.message}
                {...register("phone")}
              />

              <Input
                label={isEn ? "City / Governorate" : "المدينة / المحافظة"}
                placeholder={isEn ? "Cairo / Mansoura" : "المنصورة / القاهرة"}
                error={errors.city?.message}
                {...register("city")}
              />
            </div>

            <Input
              label={isEn ? "Password" : "كلمة المرور"}
              type="password"
              placeholder={isEn ? "At least 6 characters" : "6 أحرف على الأقل"}
              error={errors.password?.message}
              {...register("password")}
            />

            <Input
              label={isEn ? "Confirm Password" : "تأكيد كلمة المرور"}
              type="password"
              placeholder={isEn ? "Re-enter password" : "أعد كتابة كلمة المرور"}
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <Button type="submit" size="lg" className="w-full font-bold" loading={loading}>
              {isEn ? "Create Account & Activate VIP" : "إنشاء الحساب وتفعيل VIP"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              {isEn ? "Already have an account? " : "لديك حساب بالفعل؟ "}
              <Link
                href="/auth/login"
                className="text-accent hover:text-accent-dark font-bold underline"
              >
                {isEn ? "Sign In" : "تسجيل الدخول"}
              </Link>
            </p>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
