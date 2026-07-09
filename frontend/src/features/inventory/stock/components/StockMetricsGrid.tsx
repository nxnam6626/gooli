import React from 'react';
import { Truck, Tag, PaperPlaneTilt } from '@phosphor-icons/react';

interface Props {
  pendingReceiptsCount: number;
  pendingExportsCount: number;
  total: number;
  totalStockValue: number;
}

function formatStockValue(value: number) {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(2) + ' Tỷ';
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + ' Tr';
  return value.toLocaleString('vi-VN') + ' đ';
}

export default function StockMetricsGrid({ pendingReceiptsCount, pendingExportsCount, total, totalStockValue }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#2563eb] shrink-0">
          <Truck size={24} weight="fill" />
        </div>
        <div>
          <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Vận chuyển đang đến</div>
          <div className="text-lg font-black text-slate-900 mt-0.5">{pendingReceiptsCount} Đơn</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-center">
        <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Tổng số mặt hàng</div>
        <div className="text-lg font-black text-slate-900 mt-0.5">{total.toLocaleString()}</div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-center">
        <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Giá trị (VND)</div>
        <div className="text-lg font-black text-slate-900 mt-0.5">{formatStockValue(totalStockValue)}</div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
          <PaperPlaneTilt size={24} weight="fill" />
        </div>
        <div>
          <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Đơn chờ xuất</div>
          <div className="text-lg font-black text-slate-900 mt-0.5">{pendingExportsCount} Đơn</div>
        </div>
      </div>
    </div>
  );
}
