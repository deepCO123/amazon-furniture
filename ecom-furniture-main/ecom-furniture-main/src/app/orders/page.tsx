"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, ShoppingBag, Eye, ExternalLink, CreditCard, X, Image as ImageIcon } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { formatPrice, getOrderReceiptImage } from "@/lib/utils";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import AnimatedSection from "@/components/ui/AnimatedSection";

const statusColors: Record<string, "default" | "success" | "warning" | "accent"> = {
  under_review: "warning",
  pending: "warning",
  processing: "accent",
  shipped: "accent",
  delivered: "success",
};

export default function OrdersPage() {
  const { user, orders } = useAuthStore();
  const [selectedReceipt, setSelectedReceipt] = useState<{ id: string; url: string } | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <Package size={64} className="mx-auto text-surface-dark mb-4" />
          <h1 className="text-2xl font-bold text-primary mb-2">
            Sign In to View Orders
          </h1>
          <p className="text-muted mb-6">
            Access your order history by signing in to your account
          </p>
          <Link href="/auth/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb items={[{ label: "Orders" }]} />
          <div className="flex flex-col items-center justify-center py-20">
            <ShoppingBag size={64} className="text-surface-dark mb-4" />
            <h1 className="text-2xl font-bold text-primary mb-2">
              No Orders Yet
            </h1>
            <p className="text-muted mb-6">
              Start shopping to see your orders here
            </p>
            <Link href="/products">
              <Button>Browse Collection</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: "Orders" }]} />
        <AnimatedSection className="mt-6 mb-8">
          <h1 className="text-3xl font-bold text-primary">Your Orders</h1>
          <p className="text-muted mt-1">
            {orders.length} order{orders.length !== 1 ? "s" : ""} total
          </p>
        </AnimatedSection>

        <div className="space-y-4">
          {orders.map((order, i) => {
            const receiptUrl = getOrderReceiptImage(order);
            const paymentDetails =
              typeof order.paymentDetails === "object" && order.paymentDetails !== null
                ? order.paymentDetails
                : typeof order.paymentDetails === "string"
                ? (() => {
                    try {
                      return JSON.parse(order.paymentDetails);
                    } catch {
                      return {};
                    }
                  })()
                : {};

            return (
              <AnimatedSection key={order.id} delay={i * 0.1}>
                <div className="bg-white rounded-xl border border-surface-dark p-6 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-sm font-semibold text-primary">Order #{order.id}</p>
                      <p className="text-xs text-muted">
                        {new Date(order.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <Badge variant={statusColors[order.status] || "default"} size="md">
                      {order.status === "under_review"
                        ? "Under Review / قيد المراجعة"
                        : order.status.charAt(0).toUpperCase() + order.status.slice(1).replace(/_/g, " ")}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-primary/80">
                          {item.product.name} <span className="text-xs text-muted">x{item.quantity}</span>
                        </span>
                        <span className="font-medium text-primary">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Payment Details & Transfer Screenshot */}
                  {(receiptUrl || order.paymentMethod) && (
                    <div className="my-3 p-3 bg-surface/60 rounded-lg border border-surface-dark/60 text-xs">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 text-primary">
                          <CreditCard size={14} className="text-accent" />
                          <span className="font-medium">
                            {order.paymentMethod === "instapay"
                              ? "InstaPay (إنستاباي)"
                              : order.paymentMethod === "wallet"
                              ? "Mobile Wallet (فودافون كاش / محفظة)"
                              : order.paymentMethod === "cod"
                              ? "Cash on Delivery (دفع عند الاستلام)"
                              : order.paymentMethod}
                          </span>
                        </div>
                        {order.paymentStatus && (
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              order.paymentStatus === "paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {order.paymentStatus === "paid" ? "تم التحقق من الدفع ✓" : "قيد مراجعة التحويل"}
                          </span>
                        )}
                      </div>

                      {paymentDetails.transactionRef && (
                        <p className="mt-1 text-muted text-[11px]">
                          المرجع / اسم المحول: <span className="font-mono text-primary font-semibold">{paymentDetails.transactionRef}</span>
                        </p>
                      )}
                      {paymentDetails.walletPhone && (
                        <p className="mt-0.5 text-muted text-[11px]">
                          رقم المحفظة المحول منها: <span className="font-mono text-primary font-semibold" dir="ltr">{paymentDetails.walletPhone}</span>
                        </p>
                      )}

                      {receiptUrl && (
                        <div className="mt-2.5 pt-2 border-t border-surface-dark/40 flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedReceipt({ id: order.id, url: receiptUrl })}
                              className="relative w-12 h-12 rounded-lg border border-surface-dark overflow-hidden bg-white hover:opacity-90 transition cursor-pointer flex-shrink-0"
                              title="عرض إيصال التحويل"
                            >
                              <img
                                src={receiptUrl}
                                alt="Receipt screenshot"
                                className="w-full h-full object-cover"
                              />
                            </button>
                            <div>
                              <span className="font-semibold text-primary block">إيصال التحويل المرفق</span>
                              <span className="text-[10px] text-muted">تم إرفاق إثبات الدفع مع هذا الطلب</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedReceipt({ id: order.id, url: receiptUrl })}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-surface-dark text-primary hover:bg-surface transition cursor-pointer"
                            >
                              <Eye size={13} />
                              <span>معاينة الإيصال</span>
                            </button>
                            <a
                              href={receiptUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-accent hover:underline"
                            >
                              <ExternalLink size={13} />
                              <span>نافذة جديدة</span>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-surface-dark">
                    <span className="font-bold text-primary">
                      Total: {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>

      {/* Customer Receipt Preview Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-surface-dark overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-dark">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-accent" />
                <h3 className="font-bold text-sm text-primary">
                  إيصال تحويل الطلب #{selectedReceipt.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded-lg text-muted hover:text-primary transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex items-center justify-center bg-surface/30">
              <img
                src={selectedReceipt.url}
                alt={`Order ${selectedReceipt.id} Receipt`}
                className="max-h-[60vh] w-auto object-contain rounded-lg shadow-xs"
              />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-t border-surface-dark bg-surface/50 text-xs">
              <a
                href={selectedReceipt.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-accent font-semibold hover:underline"
              >
                <ExternalLink size={14} />
                <span>فتح الصورة بالحجم الكامل</span>
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedReceipt(null)}
              >
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
