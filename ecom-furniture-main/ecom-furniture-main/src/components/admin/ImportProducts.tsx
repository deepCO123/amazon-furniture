"use client";

/**
 * components/admin/ImportProducts.tsx
 * Bulk product import modal for the admin panel.
 *
 * Features:
 * - Download XLSX template
 * - Drag-and-drop or click-to-pick file
 * - Dry-run validation before actual import
 * - Detailed per-row error reporting
 * - Import report (created / updated counts)
 */

import { useState, useRef, useCallback } from "react";
import {
  X,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";

// ── Types ─────────────────────────────────────────────────────────

interface ImportResult {
  success: boolean;
  dryRun: boolean;
  total: number;
  valid: number;
  invalid: number;
  created?: number;
  updated?: number;
  errors: string[];
  preview?: Record<string, unknown>[];
  error?: string;
}

type Step = "idle" | "validating" | "validated" | "importing" | "done" | "error";

interface Props {
  onClose: () => void;
  onImportComplete: () => void;
  isDark: boolean;
}

// ── Component ─────────────────────────────────────────────────────

export default function ImportProducts({ onClose, onImportComplete, isDark }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<Step>("idle");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Theme helpers ───────────────────────────────────────────────
  const bg = isDark ? "bg-[#12151D]" : "bg-white";
  const border = isDark ? "border-[#1F2433]" : "border-slate-200";
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const dropzoneBg = isDark ? "bg-[#0E1119]" : "bg-slate-50";
  const dropzoneActiveBg = isDark ? "bg-[#101823]" : "bg-cyan-50";

  // ── File selection ──────────────────────────────────────────────
  const handleFile = useCallback((f: File) => {
    const ok = /\.(xlsx|xls|csv)$/i.test(f.name);
    if (!ok) {
      alert("يُسمح فقط بملفات .xlsx أو .xls أو .csv");
      return;
    }
    setFile(f);
    setStep("idle");
    setResult(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  // ── Dry-run validation ──────────────────────────────────────────
  const handleValidate = async () => {
    if (!file) return;
    setStep("validating");
    setResult(null);
    const r = await apiClient.importProducts(file, true);
    setResult(r);
    setStep(r.error ? "error" : "validated");
  };

  // ── Actual import ───────────────────────────────────────────────
  const handleImport = async () => {
    if (!file) return;
    setStep("importing");
    const r = await apiClient.importProducts(file, false);
    setResult(r);
    setStep(r.success ? "done" : "error");
    if (r.success) {
      onImportComplete();
    }
  };

  // ── Reset ───────────────────────────────────────────────────────
  const reset = () => {
    setFile(null);
    setStep("idle");
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isLoading = step === "validating" || step === "importing";
  const canImport =
    step === "validated" && result && result.valid > 0 && result.invalid === 0;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" dir="rtl">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl flex flex-col ${bg} ${border}`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b ${border} shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
              <FileSpreadsheet size={20} className="text-cyan-400" />
            </div>
            <div>
              <h2 className={`font-black text-base ${textPrimary}`}>استيراد منتجات من Excel / CSV</h2>
              <p className={`text-xs ${textMuted}`}>رفع ملف وإضافة أو تحديث المنتجات دفعة واحدة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${isDark ? "hover:bg-[#1E2330] text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Step 1: Download template */}
          <div className={`p-4 rounded-xl border ${isDark ? "bg-[#0E1119] border-[#282E3E]" : "bg-slate-50 border-slate-200"}`}>
            <p className={`text-xs font-bold mb-2 ${textMuted}`}>الخطوة 1 — تحميل قالب Excel الجاهز</p>
            <button
              onClick={() => apiClient.downloadImportTemplate()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md shadow-emerald-900/30"
            >
              <Download size={15} />
              تحميل القالب الجاهز (.xlsx)
            </button>
            <p className={`text-[11px] mt-2 ${textMuted}`}>
              يحتوي القالب على أعمدة شرح لكل حقل وورقة منفصلة بأسماء الأقسام المتاحة.
            </p>
          </div>

          {/* Step 2: Upload file */}
          <div>
            <p className={`text-xs font-bold mb-2 ${textMuted}`}>الخطوة 2 — رفع الملف المعبأ</p>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragOver
                  ? `${dropzoneActiveBg} border-cyan-500`
                  : file
                  ? isDark
                    ? "bg-[#0E1119] border-cyan-500/50"
                    : "bg-cyan-50 border-cyan-400"
                  : `${dropzoneBg} ${isDark ? "border-[#282E3E] hover:border-[#3A4255]" : "border-slate-300 hover:border-slate-400"}`
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleChange}
                aria-label="اختيار ملف Excel أو CSV للاستيراد"
              />
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <FileSpreadsheet size={36} className="text-cyan-400" />
                  <p className={`font-bold text-sm ${textPrimary}`}>{file.name}</p>
                  <p className={`text-xs ${textMuted}`}>{(file.size / 1024).toFixed(1)} كيلوبايت</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); reset(); }}
                    className="text-xs text-red-400 hover:text-red-300 underline cursor-pointer mt-1"
                  >
                    إزالة الملف
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload size={36} className={textMuted} />
                  <p className={`font-bold text-sm ${textPrimary}`}>اسحب الملف هنا أو اضغط للاختيار</p>
                  <p className={`text-xs ${textMuted}`}>يدعم: .xlsx، .xls، .csv</p>
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Validate button */}
          {file && step !== "done" && (
            <button
              onClick={handleValidate}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-orange-900/20"
            >
              {step === "validating" ? (
                <><Loader2 size={17} className="animate-spin" /> جاري التحقق من البيانات...</>
              ) : (
                <><CheckCircle2 size={17} /> تحقق من البيانات أولاً (Dry Run)</>
              )}
            </button>
          )}

          {/* Validation / Import Report */}
          {result && (
            <div
              className={`rounded-xl border p-4 space-y-3 ${
                result.error
                  ? isDark ? "bg-red-950/30 border-red-500/40" : "bg-red-50 border-red-300"
                  : result.invalid > 0
                  ? isDark ? "bg-amber-950/30 border-amber-500/40" : "bg-amber-50 border-amber-300"
                  : isDark ? "bg-emerald-950/30 border-emerald-500/40" : "bg-emerald-50 border-emerald-300"
              }`}
            >
              {/* Summary row */}
              <div className="flex flex-wrap gap-3">
                <Chip label="إجمالي الصفوف" value={result.total} color="blue" isDark={isDark} />
                <Chip label="صالح للاستيراد" value={result.valid} color="green" isDark={isDark} />
                <Chip label="يحتوي أخطاء" value={result.invalid} color={result.invalid > 0 ? "red" : "green"} isDark={isDark} />
                {result.created !== undefined && (
                  <Chip label="أُضيف جديد" value={result.created} color="cyan" isDark={isDark} />
                )}
                {result.updated !== undefined && (
                  <Chip label="تم تحديثه" value={result.updated} color="purple" isDark={isDark} />
                )}
              </div>

              {/* Error list */}
              {result.errors && result.errors.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-red-400 mb-1.5 flex items-center gap-1">
                    <XCircle size={13} /> الأخطاء الموجودة ({result.errors.length}):
                  </p>
                  <ul className={`text-xs space-y-1 max-h-36 overflow-y-auto rounded-lg p-2 ${isDark ? "bg-[#0E1119]" : "bg-white"}`}>
                    {result.errors.map((e, i) => (
                      <li key={i} className="text-red-400 flex gap-1.5">
                        <span className="text-red-500 shrink-0">•</span>
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Top-level error */}
              {result.error && (
                <p className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                  <AlertTriangle size={13} /> {result.error}
                </p>
              )}

              {/* Done message */}
              {step === "done" && result.success && (
                <p className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 size={15} />
                  تم استيراد المنتجات بنجاح! تم تحديث المتجر.
                </p>
              )}
            </div>
          )}

          {/* Action buttons row */}
          <div className="flex gap-3 flex-wrap">
            {/* Import button — only after clean validation */}
            {canImport && (
              <button
                id="confirm-import-btn"
                onClick={handleImport}
                disabled={isLoading}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 shadow-md shadow-cyan-900/25"
              >
                {isLoading ? (
                  <><Loader2 size={17} className="animate-spin" /> جاري الاستيراد...</>
                ) : (
                  <><Upload size={17} /> ابدأ الاستيراد الفعلي ({result!.valid} منتج)</>
                )}
              </button>
            )}

            {/* Reset button */}
            {(step === "validated" || step === "done" || step === "error") && (
              <button
                onClick={reset}
                className={`px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isDark
                    ? "bg-[#171B24] border border-[#262C3D] text-slate-300 hover:text-white hover:bg-[#1E2330]"
                    : "bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <RefreshCw size={14} />
                رفع ملف جديد
              </button>
            )}

            {/* Close / done */}
            {step === "done" && (
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                <CheckCircle2 size={17} />
                إغلاق وعرض المنتجات
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Small helper component: stat chip ─────────────────────────────

function Chip({
  label,
  value,
  color,
  isDark,
}: {
  label: string;
  value: number;
  color: "blue" | "green" | "red" | "cyan" | "purple";
  isDark: boolean;
}) {
  const colors: Record<string, string> = {
    blue: isDark ? "bg-blue-500/15 text-blue-300 border-blue-500/30" : "bg-blue-50 text-blue-800 border-blue-200",
    green: isDark ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-emerald-50 text-emerald-800 border-emerald-200",
    red: isDark ? "bg-red-500/15 text-red-300 border-red-500/30" : "bg-red-50 text-red-800 border-red-200",
    cyan: isDark ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" : "bg-cyan-50 text-cyan-800 border-cyan-200",
    purple: isDark ? "bg-purple-500/15 text-purple-300 border-purple-500/30" : "bg-purple-50 text-purple-800 border-purple-200",
  };
  return (
    <div className={`flex flex-col items-center px-3 py-1.5 rounded-lg border text-center ${colors[color]}`}>
      <span className="text-lg font-black leading-tight">{value}</span>
      <span className="text-[10px] font-bold">{label}</span>
    </div>
  );
}
