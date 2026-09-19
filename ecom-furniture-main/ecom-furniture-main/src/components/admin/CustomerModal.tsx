"use client";

import Image from "next/image";
import {
  X,
  Phone,
  Mail,
  MapPin,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  MessageCircle,
  ShoppingBag,
} from "lucide-react";
import type { User, Order } from "@/types";
import { formatPrice } from "@/lib/utils";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: (User & { orders?: Order[] }) | null;
}

export default function CustomerModal({
  isOpen,
  onClose,
  customer,
}: CustomerModalProps) {
  if (!isOpen || !customer) return null;

  const orders = customer.orders || [];
  const totalSpent = customer.totalSpent || 0;

  const cleanPhone = (customer.phone || "").replace(/[^0-9]/g, "");
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith("0") ? "2" + cleanPhone : cleanPhone}?text=${encodeURIComponent(
        `مرحباً أستاذ ${customer.name}، معك أ. محمد إسماعيل من إدارة Amazon Furniture بخصوص طلباتك وحسابك المميز لدينا.`
      )}`
    : null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 size={12} />
            <span>تم التسليم</span>
          </span>
        );
      case "shipped":
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Truck size={12} />
            <span>جاري الشحن والتوصيل</span>
          </span>
        );
      default:
        return (
          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Clock size={12} />
            <span>قيد التجهيز والمتابعة</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[250] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col text-start" dir="rtl">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#C5A880] shrink-0 bg-white shadow-sm">
              <Image
                src={
                  customer.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    customer.name
                  )}&backgroundColor=c5a880`
                }
                alt={customer.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">
                  {customer.name}
                </h2>
                {customer.provider === "google" && (
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
                    Google Verified ✓
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-1.5">
                <span className="flex items-center gap-1">
                  <Mail size={13} className="text-slate-400" />
                  {customer.email}
                </span>
                {customer.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={13} className="text-slate-400" />
                    {customer.phone}
                  </span>
                )}
                {customer.city && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" />
                    {customer.city}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Stats Banner & Contact Actions */}
        <div className="p-6 border-b border-slate-100 bg-white space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-bold block">
                عدد الطلبات
              </span>
              <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                {orders.length > 0 ? orders.length : customer.ordersCount || 0} أوردر
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-bold block">
                إجمالي المشتريات
              </span>
              <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                {formatPrice(totalSpent)}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-bold block">
                تاريخ الانضمام
              </span>
              <span className="text-xs font-bold text-slate-700 mt-2 block">
                {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString("ar-EG") : "حديثاً"}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <MessageCircle size={16} />
                <span>محادثة واتساب مباشرة مع العميل</span>
              </a>
            )}

            {customer.phone && (
              <a
                href={`tel:${customer.phone}`}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Phone size={14} />
                <span>اتصال هاتفياً</span>
              </a>
            )}
          </div>
        </div>

        {/* Orders Timeline */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Package size={16} className="text-[#8B6E45]" />
              <span>سجل الأوردرات والطلبات السابقة ({orders.length})</span>
            </h3>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <ShoppingBag size={32} className="mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-sm">لم يقم هذا العميل بأي طلبات بعد</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">
                        طلب #{ord.id}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(ord.date).toLocaleDateString("ar-EG", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div>{getStatusBadge(ord.status)}</div>
                  </div>

                  {/* Items in order */}
                  <div className="space-y-2">
                    {ord.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs py-1"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            <Image
                              src={item.product?.images?.[0] || "/placeholder.jpg"}
                              alt={item.product?.name || "Product"}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">
                              {item.product?.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              الكمية: {item.quantity}{" "}
                              {item.color && `• اللون: ${item.color}`}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900">
                          {formatPrice((item.product?.price || 0) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total & Delivery note */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      📍 {ord.shippingAddress?.city} - {ord.shippingAddress?.address}
                    </span>
                    <span className="font-extrabold text-sm text-slate-900">
                      الإجمالي: {formatPrice(ord.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
