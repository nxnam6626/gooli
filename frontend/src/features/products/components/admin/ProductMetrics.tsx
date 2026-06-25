import React from 'react';
import { Hash, CheckCircle, ListDashes, CurrencyDollar } from '@phosphor-icons/react';

interface ProductMetricsProps {
  total: number;
  activeCount: number;
  categoryCount: number;
  averagePrice: number;
}

export default function ProductMetrics({ total, activeCount, categoryCount, averagePrice }: ProductMetricsProps) {
  const fmt = (n: number | string) => Number(n).toLocaleString("vi-VN");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#2563eb] shrink-0">
          <Hash size={24} weight="bold" />
        </div>
        <div>
          <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Tổng số SKU</div>
          <div className="text-lg font-black text-slate-900 mt-0.5">{total.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
          <CheckCircle size={24} weight="bold" />
        </div>
        <div>
          <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">SKU Hoạt động</div>
          <div className="text-lg font-black text-slate-900 mt-0.5">{activeCount}</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
          <ListDashes size={24} weight="bold" />
        </div>
        <div>
          <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Số nhóm hàng</div>
          <div className="text-lg font-black text-slate-900 mt-0.5">{categoryCount}</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
          <CurrencyDollar size={24} weight="bold" />
        </div>
        <div>
          <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Đơn giá TB (đ)</div>
          <div className="text-lg font-black text-slate-900 mt-0.5">{fmt(averagePrice)}</div>
        </div>
      </div>
    </div>
  );
}
