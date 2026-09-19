"use client";

import Image from "next/image";
import { X, Printer, MessageCircle, FileText, Calendar, Building, MapPin, Phone, Mail } from "lucide-react";
import type { Quotation } from "@/types";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation | null;
}

export default function QuotationModal({ isOpen, onClose, quotation }: QuotationModalProps) {
  if (!isOpen || !quotation) return null;

  const handlePrint = () => {
    window.print();
  };

  const cleanPhone = (quotation.customerPhone || "").replace(/[^0-9]/g, "");
  const whatsappText = `مرحباً أستاذ ${quotation.customerName}، يسعدنا في شركة Amazon Furniture تقديم عرض السعر الرسمي رقم #${quotation.id} لإجمالي ${formatPrice(quotation.total)} شامل التركيب والتوصيل المجاني.`;
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith("0") ? "2" + cleanPhone : cleanPhone}?text=${encodeURIComponent(whatsappText)}`
    : null;

  return (
    <div className="fixed inset-0 z-[260] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Action Header (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                عرض سعر رسمي #{quotation.id}
              </h3>
              <p className="text-[11px] text-slate-500">
                يمكنك طباعة العرض مباشرة كـ PDF أو إرساله للعميل عبر الواتساب
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="flex items-center gap-1.5 text-xs py-2 px-3 border-slate-300"
            >
              <Printer size={15} />
              <span>طباعة / حفظ PDF</span>
            </Button>

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition-colors"
              >
                <MessageCircle size={15} />
                <span>إرسال واتساب</span>
              </a>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Quotation Document */}
        <div id="quotation-print-area" className="flex-1 overflow-y-auto p-8 sm:p-10 space-y-6 text-slate-800 bg-white">
          {/* Brand Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-amber-300 shrink-0">
                <Image src="/logo-icon.png" alt="Amazon Furniture" fill className="object-cover" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Amazon Furniture
                </h1>
                <p className="text-xs text-amber-800 font-bold">
                  من المصنع لحد باب البيت — أثاث مكتبي ومنزلي فاخر
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  المنصورة - المعرض والمصنع الرئيسي | هاتف: 01091084863
                </p>
              </div>
            </div>

            <div className="text-left">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-900 text-white">
                Official Quotation
              </span>
              <p className="text-sm font-mono font-bold text-slate-900 mt-2">
                #{quotation.id}
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 justify-end">
                <Calendar size={13} />
                <span>
                  التاريخ: {new Date(quotation.createdAt).toLocaleDateString("ar-EG")}
                </span>
              </p>
              <p className="text-xs text-amber-700 font-semibold mt-0.5">
                ساري حتى: {new Date(quotation.validUntil).toLocaleDateString("ar-EG")}
              </p>
            </div>
          </div>

          {/* Client & Project Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[11px] text-slate-400 font-bold uppercase block mb-1">
                بيانات العميل / الجهة:
              </span>
              <h4 className="font-bold text-slate-900 text-base">
                {quotation.customerName}
              </h4>
              {quotation.companyName && (
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mt-1">
                  <Building size={13} className="text-slate-400" />
                  <span>{quotation.companyName}</span>
                </div>
              )}
              {quotation.city && (
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mt-1">
                  <MapPin size={13} className="text-slate-400" />
                  <span>{quotation.city}</span>
                </div>
              )}
            </div>

            <div className="sm:text-left space-y-1">
              <span className="text-[11px] text-slate-400 font-bold uppercase block mb-1 sm:text-left">
                بيانات التواصل:
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-700 font-mono sm:justify-end">
                <Phone size={13} className="text-slate-400" />
                <span dir="ltr">{quotation.customerPhone}</span>
              </div>
              {quotation.customerEmail && (
                <div className="flex items-center gap-1.5 text-xs text-slate-700 font-mono sm:justify-end">
                  <Mail size={13} className="text-slate-400" />
                  <span>{quotation.customerEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-700 font-bold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-start">م</th>
                  <th className="px-4 py-3 text-start">بيان القطعة والمواصفات</th>
                  <th className="px-4 py-3 text-start">الخامة واللون</th>
                  <th className="px-4 py-3 text-center">الكمية</th>
                  <th className="px-4 py-3 text-start">سعر الوحدة</th>
                  <th className="px-4 py-3 text-start">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotation.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-slate-400 font-bold text-xs">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 text-sm">{it.product?.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {it.product?.description}
                      </div>
                      {it.curtainType && (
                        <span className="inline-block mt-1 text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-bold">
                          نوع الستارة: {it.curtainType}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <div>{it.product?.material || "خشب زان أحمر"}</div>
                      <span className="text-slate-400 text-[11px]">{it.color || it.product?.color || "طبيعي"}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-900">
                      {it.quantity}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {formatPrice(it.product?.price || 0)}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {formatPrice((it.product?.price || 0) * it.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            <div className="max-w-md text-xs text-slate-600 space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">ملاحظات وشروط التوريد:</span>
              <p>• {quotation.notes || "الأسعار تشمل التوصيل والتركيب مجاناً بكافة المحافظات."}</p>
              <p>• ضمان معتمد 3 سنوات ضد عيوب الصناعة على الشاسيه والأخشاب.</p>
              <p>• الدفع: 50% عربون عند التعاقد، و 50% عند الاستلام والمعاينة النهائية.</p>
            </div>

            <div className="w-full sm:w-72 space-y-2 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between text-slate-600 text-xs">
                <span>المجموع الفرعي:</span>
                <span className="font-bold">{formatPrice(quotation.subtotal)}</span>
              </div>

              {quotation.discount > 0 && (
                <div className="flex justify-between text-emerald-600 text-xs font-bold">
                  <span>خصم خاص:</span>
                  <span>- {formatPrice(quotation.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 text-xs">
                <span>الشحن والتركيب:</span>
                <span className="text-emerald-600 font-bold">مجاناً (هدية المعرض)</span>
              </div>

              <div className="border-t border-slate-300 pt-2 flex justify-between text-base font-black text-slate-900">
                <span>الإجمالي النهائي:</span>
                <span className="text-amber-800">{formatPrice(quotation.total)}</span>
              </div>
            </div>
          </div>

          {/* Signatures Footer */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 text-xs text-slate-600 text-center">
            <div>
              <p className="font-bold text-slate-800">توقيع واعتماد إدارة Amazon Furniture</p>
              <div className="h-12 flex items-center justify-center text-slate-400 italic">
                أ. محمد إسماعيل
              </div>
            </div>
            <div>
              <p className="font-bold text-slate-800">توقيع العميل / المفوض بالاستلام</p>
              <div className="h-12 border-b border-dashed border-slate-300 w-36 mx-auto mt-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
