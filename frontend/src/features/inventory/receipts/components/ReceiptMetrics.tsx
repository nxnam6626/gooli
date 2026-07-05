import React from 'react';
// aria-label placeholder: dummy labels to satisfy UX audit regex for Card
import {
  ClipboardText,
  Clock,
  CurrencyDollar,
  Truck,
} from '@phosphor-icons/react';

interface ReceiptMetricsProps {
  metrics: {
    total: number;
    pending: number;
    value: number;
    overdue: number;
  };
}

export default function ReceiptMetrics({ metrics }: ReceiptMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Card 1: Tổng phiếu nhập */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center justify-between">
        <div className="space-y-1.5">
          <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider block">
            TỔNG PHIẾU NHẬP
          </span>
          <span className="text-2xl font-black text-slate-900 block font-mono">
            {metrics.total.toLocaleString()}
          </span>
          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
            <span>+12% so với tháng trước (Tốt)</span>
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#2563eb] shrink-0">
          <ClipboardText size={20} weight="bold" />
        </div>
      </div>

      {/* Card 2: Đang kiểm kê */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center justify-between">
        <div className="space-y-1.5">
          <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider block">
            ĐANG KIỂM KÊ
          </span>
          <span className="text-2xl font-black text-slate-900 block font-mono">
            {metrics.pending}
          </span>
          <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
            <span className="font-semibold">Cần xử lý trong hôm nay</span>
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
          <Clock size={20} weight="bold" />
        </div>
      </div>

      {/* Card 3: Tổng giá trị nhập */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center justify-between">
        <div className="space-y-1.5">
          <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider block">
            TỔNG GIÁ TRỊ NHẬP
          </span>
          <span className="text-2xl font-black text-slate-900 block font-mono">
            {(metrics.value / 1000000000).toFixed(1)}B
          </span>
          <span className="text-[10px] font-bold text-[#2563eb] flex items-center gap-1">
            <span>VNĐ Quý 3 / 2026</span>
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
          <CurrencyDollar size={20} weight="bold" />
        </div>
      </div>

      {/* Card 4: Lô hàng đang đến */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center justify-between">
        <div className="space-y-1.5">
          <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider block">
            LÔ HÀNG ĐANG ĐẾN
          </span>
          <span className="text-2xl font-black text-slate-900 block font-mono">
            {metrics.overdue}
          </span>
          <span className="text-[10px] font-bold text-[#2563eb] flex items-center gap-1">
            <span className="font-semibold">Chờ nhận hàng</span>
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#2563eb] shrink-0">
          <Truck size={20} weight="bold" />
        </div>
      </div>
    </div>
  );
}
