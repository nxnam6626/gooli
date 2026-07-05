import React from 'react';
import { ExportAdminDashboard } from '@/features/inventory';

export const metadata = {
  title: 'Quản lý Xuất Kho | Gooli Admin',
};

export default function AdminExportsPage() {
  return (
    <React.Suspense fallback={<div>Đang tải...</div>}>
      <ExportAdminDashboard />
    </React.Suspense>
  );
}
