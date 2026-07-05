import React, { Suspense } from 'react';
import { PartnerAdminDashboard } from '@/features/partners';

export const metadata = {
  title: 'Quản lý Đối tác | Gooli Admin',
};

export default function AdminPartnersPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-24 text-slate-400 font-semibold italic bg-white border border-slate-200 rounded-xl shadow-2xs">
          Đang tải trang đối tác...
        </div>
      }
    >
      <PartnerAdminDashboard />
    </Suspense>
  );
}
