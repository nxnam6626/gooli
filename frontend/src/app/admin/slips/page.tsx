import React, { Suspense } from "react";
import { FinanceDashboard } from "@/features/finance";

export const metadata = {
  title: "Quản lý Thu/Chi & Sổ quỹ | Gooli Admin",
};

export default function AdminSlipsPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-24 text-slate-400 font-semibold italic bg-white border border-slate-200 rounded-xl shadow-2xs">
          Đang tải sổ quỹ...
        </div>
      }
    >
      <FinanceDashboard />
    </Suspense>
  );
}
