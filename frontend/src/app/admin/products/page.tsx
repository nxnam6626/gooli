'use client';

import React from 'react';
import { ProductAdminDashboard } from '@/features/products';

export default function AdminProductsPage() {
  return (
    <React.Suspense fallback={<div className="text-xs text-slate-500 font-bold p-8">Đang tải danh mục hàng hóa...</div>}>
      <ProductAdminDashboard />
    </React.Suspense>
  );
}
