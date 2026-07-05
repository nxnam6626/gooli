'use client';

import React from 'react';
import { ReceiptAdminDashboard } from '@/features/inventory';

export default function AdminReceiptsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="text-xs text-slate-500 font-bold p-8">
          Đang tải danh sách phiếu nhập...
        </div>
      }
    >
      <ReceiptAdminDashboard />
    </React.Suspense>
  );
}
