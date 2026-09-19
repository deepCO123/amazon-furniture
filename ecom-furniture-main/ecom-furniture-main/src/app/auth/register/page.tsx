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
      setError(result.message || "فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center py-12 px-4">
      <AnimatedSection className="w-full max-w-md">
        <div className="bg-white rounded-2xl p-8 border border-surface-dark shadow-sm">
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex flex-col items-center gap-2 mb-4 group">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-md border border-accent/40 group-hover:border-accent transition-all duration-300">
                <Image
                  src="/logo-icon.png"
                  alt="Amazon Furniture"
                  fill
                  sizes="56px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-primary">إنشاء حساب جديد / VIP Register</h1>
            <p className="text-muted mt-1 text-sm">انضم لعملاء Amazon Furniture واستمتع بالمزايا الحصرية</p>
          </div>

          {/* 1-Click Google Register */}
          <div className="mb-6">
            <GoogleAuthButton
              text="تسجيل حساب VIP فوراً بـ Google"
              onSuccess={() => router.push("/")}
            />
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-dark" />
              </div>
              <span className="relative px-3 bg-white text-xs text-muted uppercase font-semibold">
                أو بالتسجيل بالبريد
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-danger"
              >
                {error}
              </motion.div>
            )}

            <Input
              label="الاسم بالكامل / Full Name"
              placeholder="مثال: أحمد الشربيني"
              error={errors.name?.message}
              {...register("name")}
            />

            <Input
              label="البريد الإلكتروني / Email"
              type="email"
              placeholder="name@example.com"
              error={errors.email?.message}
              {...register("email")}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="رقم الهاتف / واتساب"
                placeholder="010xxxxxxxx"
                error={errors.phone?.message}
                {...register("phone")}
              />

              <Input
                label="المدينة / المحافظة"
                placeholder="المنصورة / القاهرة"
                error={errors.city?.message}
                {...register("city")}
              />
            </div>

            <Input
              label="كلمة المرور / Password"
              type="password"
              placeholder="6 أحرف على الأقل"
              error={errors.password?.message}
              {...register("password")}
            />

            <Input
              label="تأكيد كلمة المرور / Confirm Password"
              type="password"
              placeholder="أعد كتابة كلمة المرور"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <Button type="submit" size="lg" className="w-full font-bold" loading={loading}>
              إنشاء الحساب وتفعيل VIP
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              لديك حساب بالفعل؟{" "}
              <Link
                href="/auth/login"
                className="text-accent hover:text-accent-dark font-bold underline"
              >
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
