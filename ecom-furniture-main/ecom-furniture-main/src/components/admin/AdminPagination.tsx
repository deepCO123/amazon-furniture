"use client";

import React from "react";
import { ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from "lucide-react";

interface AdminPaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (perPage: number) => void;
  isDark?: boolean;
  itemLabel?: string;
}

export default function AdminPagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  isDark = false,
  itemLabel = "عنصر",
}: AdminPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Ensure currentPage is within bounds
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (validPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(validPage * itemsPerPage, totalItems);

  // Generate page numbers to display with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (validPage > 3) pages.push("...");

      const start = Math.max(2, validPage - 1);
      const end = Math.min(totalPages - 1, validPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (validPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  const containerCls = isDark
    ? "bg-[#121622] border-t border-[#1F2535] text-slate-300"
    : "bg-white border-t border-slate-200 text-slate-700";

  const btnBase = "h-8 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer select-none";
  const btnActive = "bg-cyan-600 text-white shadow-xs font-extrabold";
  const btnInactive = isDark
    ? "bg-[#181E2E] hover:bg-[#222B42] text-slate-300 border border-[#27324E]"
    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200";
  const btnDisabled = "opacity-40 cursor-not-allowed pointer-events-none";

  if (totalItems === 0) return null;

  return (
    <div
      className={`px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs select-none ${containerCls}`}
      dir="rtl"
    >
      {/* Items count & Per Page Selector */}
      <div className="flex items-center gap-3">
        <span className="font-medium text-slate-600 dark:text-slate-400">
          عرض <strong className="font-black text-slate-900 dark:text-white">{startItem}</strong> -{" "}
          <strong className="font-black text-slate-900 dark:text-white">{endItem}</strong> من أصل{" "}
          <strong className="font-black text-slate-900 dark:text-white">{totalItems}</strong> {itemLabel}
        </span>

        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5 ms-2 border-s ps-3 border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">لكل صفحة:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                onItemsPerPageChange(Number(e.target.value));
                onPageChange(1);
              }}
              className={`px-2 py-1 rounded-md text-xs font-bold border focus:outline-none cursor-pointer ${
                isDark
                  ? "bg-[#161C2C] border-[#29354F] text-slate-200"
                  : "bg-slate-50 border-slate-300 text-slate-800"
              }`}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={validPage === 1}
          className={`${btnBase} ${validPage === 1 ? btnDisabled : btnInactive}`}
          title="الصفحة الأولى"
        >
          <ChevronsRight size={15} />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(validPage - 1)}
          disabled={validPage === 1}
          className={`${btnBase} ${validPage === 1 ? btnDisabled : btnInactive}`}
          title="الصفحة السابقة"
        >
          <ChevronRight size={15} />
          <span className="hidden md:inline ms-1">السابق</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 font-bold">
                  ...
                </span>
              );
            }
            const isCurrent = p === validPage;
            return (
              <button
                key={`page-${p}`}
                onClick={() => onPageChange(p)}
                className={`min-w-[32px] ${btnBase} ${isCurrent ? btnActive : btnInactive}`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(validPage + 1)}
          disabled={validPage === totalPages}
          className={`${btnBase} ${validPage === totalPages ? btnDisabled : btnInactive}`}
          title="الصفحة التالية"
        >
          <span className="hidden md:inline me-1">التالي</span>
          <ChevronLeft size={15} />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={validPage === totalPages}
          className={`${btnBase} ${validPage === totalPages ? btnDisabled : btnInactive}`}
          title="الصفحة الأخيرة"
        >
          <ChevronsLeft size={15} />
        </button>
      </div>
    </div>
  );
}
