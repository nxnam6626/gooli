import React, { Suspense } from 'react';
import { StockDashboard } from '@/features/inventory';

export const metadata = {
  title: 'Quản lý Tồn kho | Gooli Admin',
};

export default function AdminStockPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-24 text-slate-400 font-semibold italic bg-white border border-slate-200 rounded-xl shadow-2xs">
          Đang tải thông tin hàng tồn kho...
        </div>
      }
    >
      <StockDashboard />
    </Suspense>
  );
}
