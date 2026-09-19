"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Send,
  ChevronDown,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  User,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useLanguageStore } from "@/store/languageStore";
import { getTranslation } from "@/lib/translations";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(10),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { language } = useLanguageStore();
  const t = getTranslation(language);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 600));
    setSubmitted(true);
    reset();
    setTimeout(() => setSubmitted(false), 5000);
  };

  const contactCards = [
    {
      icon: User,
      title: t.manager,
      subtitle: t.managerTitle,
      highlight: true,
    },
    {
      icon: Phone,
      title: t.callUs,
      subtitle: "+20 109 1084863",
      action: "tel:+201091084863",
      badge: "اتصال مباشر",
    },
    {
      icon: MessageCircle,
      title: t.chatWhatsApp,
      subtitle: "+20 109 1084863",
      action: "https://wa.me/201091084863",
      badge: "محادثة فورية",
      isWhatsapp: true,
    },
    {
      icon: MapPin,
      title: language === "en" ? "Showroom & Factory Location" : "موقع المعرض والمصنع",
      subtitle: language === "en" ? "Mansoura, Dakahlia, Egypt" : "المنصورة، محافظة الدقهلية",
      action: "https://maps.app.goo.gl/NP3m16vbWodtcp9c8?g_st=ic",
      badge: language === "en" ? "Open Google Maps" : "فتح الموقع في Google",
    },
    {
      icon: Sparkles,
      title: language === "en" ? "Free Consultation" : "استشارة مجانية 100%",
      subtitle: language === "en" ? "In Mansoura or Online Video" : "معاينة بالمنصورة أو ميتنج فيديو",
      action: "/#consultation",
      badge: language === "en" ? "Book Free" : "احجز مجاناً",
      highlight: true,
    },
    {
      icon: Mail,
      title: t.emailAddr,
      subtitle: "hello@amazonfurniture.com",
      action: "mailto:hello@amazonfurniture.com",
    },
  ];

  const faqs = [
    {
      q: language === "en" ? "What is your delivery timeframe?" : "ما هي مدة وتكلفة التوصيل؟",
      a:
        language === "en"
          ? "Standard delivery takes 3-5 business days. White glove delivery with home assembly is available."
          : "يتم التوصيل والشحن السريع خلال 3 إلى 5 أيام عمل، مع خدمة التركيب والمعاينة الاحترافية داخل منزلك.",
    },
    {
      q: language === "en" ? "Can I customize furniture dimensions and fabrics?" : "هل يمكن تفصيل وتخصيص المقاسات والأقمشة؟",
      a:
        language === "en"
          ? "Yes! We specialize in custom handcrafted orders. Contact Mohamed Esmaeil directly via WhatsApp to discuss your custom project."
          : "نعم بالتأكيد! نصنع قطع الأثاث يدويًا ويمكنك اختيار المقاسات ونوع الخشب والقماش المناسب لذوقك بالتواصل المباشر مع الأستاذ محمد إسماعيل.",
    },
    {
      q: language === "en" ? "What warranty do you provide?" : "ما هي تفاصيل الضمان؟",
      a:
        language === "en"
          ? "All Amazon Furniture pieces come with a certified structural warranty against wood and manufacturing defects."
          : "نقدم ضماناً شاملاً معتمداً على كافة منتجاتنا ضد عيوب الصناعة وجودة الأخشاب لضمان رضاك التام.",
    },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: t.contact }]} />

        {/* Header */}
        <AnimatedSection className="mt-6 mb-12 text-start">
          <h1 className="text-3xl lg:text-4xl font-bold text-primary tracking-tight">
            {t.contactHeaderTitle}
          </h1>
          <p className="text-muted mt-2 text-base max-w-2xl leading-relaxed">
            {t.contactHeaderSubtitle}
          </p>
        </AnimatedSection>

        {/* Top Direct Action Banner */}
        <AnimatedSection className="mb-10">
          <div className="bg-gradient-to-r from-primary to-primary-light text-white p-6 sm:p-8 rounded-2xl shadow-md border border-accent/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-start">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <User size={28} className="text-accent" />
              </div>
              <div>
                <p className="text-xs text-accent-light uppercase tracking-widest font-semibold">
                  {t.directContact}
                </p>
                <h2 className="text-2xl font-bold">{t.manager}</h2>
                <p className="text-sm text-white/70">{t.managerTitle}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <a
                href="https://wa.me/201091084863"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold transition-all shadow-sm"
              >
                <MessageCircle size={18} />
                <span>{t.chatWhatsApp}</span>
              </a>

              <a
                href="tel:+201091084863"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-primary hover:bg-surface font-bold transition-all shadow-sm"
              >
                <Phone size={18} />
                <span dir="ltr">+20 109 1084863</span>
              </a>

              <a
                href="https://maps.app.goo.gl/NP3m16vbWodtcp9c8?g_st=ic"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium transition-all border border-white/20"
              >
                <MapPin size={18} />
                <span>Google Maps</span>
              </a>
            </div>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Form */}
          <AnimatedSection className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 lg:p-8 border border-surface-dark shadow-xs">
              <h2 className="text-xl font-bold text-primary mb-6 text-start">
                {t.sendMessage}
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t.fullName}
                    placeholder={t.fullName}
                    error={errors.name?.message}
                    {...register("name")}
                  />
                  <Input
                    label={t.emailAddr}
                    type="email"
                    placeholder="name@example.com"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                </div>

                <Input
                  label={t.phoneNum}
                  placeholder="+20 1XX XXX XXXX"
                  error={errors.phone?.message}
                  {...register("phone")}
                />

                <div>
                  <label className="block text-sm font-medium text-primary mb-1.5 text-start">
                    {t.messageContent}
                  </label>
                  <textarea
                    placeholder={t.messageContent}
                    rows={5}
                    className="w-full px-4 py-2.5 rounded-lg border border-surface-dark bg-white text-primary placeholder:text-muted transition-colors duration-200 focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none text-start"
                    {...register("message")}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-danger text-start">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <AnimatePresence>
                  {submitted && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-success font-medium text-start"
                    >
                      {t.sentSuccess}
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button type="submit" size="lg" className="w-full sm:w-auto">
                  <Send size={16} className="me-2" />
                  {t.sendBtn}
                </Button>
              </form>
            </div>
          </AnimatedSection>

          {/* Contact Cards */}
          <AnimatedSection delay={0.1}>
            <div className="space-y-4">
              {contactCards.map((item, idx) => {
                const Icon = item.icon;
                const content = (
                  <div
                    className={`rounded-2xl p-5 border transition-all duration-200 text-start flex items-start gap-4 ${
                      item.highlight
                        ? "bg-primary text-white border-primary"
                        : "bg-white border-surface-dark hover:border-accent/40 hover:shadow-xs"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        item.isWhatsapp
                          ? "bg-[#25D366]/15 text-[#25D366]"
                          : item.highlight
                          ? "bg-accent/20 text-accent"
                          : "bg-surface text-primary"
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-xs font-semibold uppercase tracking-wider ${
                            item.highlight ? "text-accent" : "text-muted"
                          }`}
                        >
                          {item.title}
                        </p>
                        {item.badge && (
                          <span className="text-[10px] bg-accent/15 text-accent-dark px-2 py-0.5 rounded-full font-bold">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-base font-bold mt-1 truncate ${
                          item.highlight ? "text-white" : "text-primary"
                        }`}
                        dir="ltr"
                      >
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                );

                return item.action ? (
                  <a
                    key={idx}
                    href={item.action}
                    target={item.action.startsWith("http") ? "_blank" : undefined}
                    rel={item.action.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="block group"
                  >
                    {content}
                  </a>
                ) : (
                  <div key={idx}>{content}</div>
                );
              })}

              {/* Official Facebook Card */}
              <a
                href="https://www.facebook.com/share/19YB7qVNxZ/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-[#1877F2]/10 hover:bg-[#1877F2]/15 border border-[#1877F2]/30 rounded-2xl p-5 transition-all text-start group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1877F2] text-white flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-[#1877F2] font-bold uppercase tracking-wider">
                        {t.facebookPage}
                      </p>
                      <p className="text-sm font-semibold text-primary">
                        تابعنا على صفحتنا الرسمية
                      </p>
                    </div>
                  </div>
                  <ExternalLink size={16} className="text-[#1877F2]" />
                </div>
              </a>
            </div>
          </AnimatedSection>
        </div>

        {/* FAQ */}
        <AnimatedSection className="mt-16">
          <h2 className="text-2xl font-bold text-primary mb-8 text-center">
            {language === "en" ? "Frequently Asked Questions" : "الأسئلة الشائعة"}
          </h2>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-surface-dark overflow-hidden text-start"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-start"
                >
                  <span className="font-semibold text-primary">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-muted transition-transform shrink-0 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-5 text-sm text-primary/70 leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
