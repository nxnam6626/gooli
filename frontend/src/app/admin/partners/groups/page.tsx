import React, { Suspense } from "react";
import { PartnerGroupDashboard } from "@/features/partners";

export const metadata = {
  title: "Quản lý Nhóm Đối tác | Gooli Admin",
};

export default function AdminPartnerGroupsPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-24 text-slate-400 font-semibold italic bg-white border border-slate-200 rounded-xl shadow-2xs">
          Đang tải nhóm đối tác...
        </div>
      }
    >
      <PartnerGroupDashboard />
    </Suspense>
  );
}
