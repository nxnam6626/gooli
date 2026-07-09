import React from 'react';
import { TrendUp, TrendDown } from '@phosphor-icons/react';
import { fmt } from '../../utils';

interface Props {
  totalReceivables: number;
  totalPayables: number;
}

export default function DebtSummaryCards({ totalReceivables, totalPayables }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="space-y-1.5">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            TỔNG PHẢI THU KHÁCH HÀNG
          </span>
          <span className="text-2xl font-black text-emerald-600 block font-mono">
            {fmt(totalReceivables)}đ
          </span>
          <p className="text-slate-500 text-[10px] font-semibold">
            Công nợ tích lũy từ tất cả khách hàng mua sắm
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <TrendUp size={24} weight="bold" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="space-y-1.5">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            TỔNG PHẢI TRẢ NHÀ CUNG CẤP
          </span>
          <span className="text-2xl font-black text-rose-600 block font-mono">
            {fmt(totalPayables)}đ
          </span>
          <p className="text-slate-500 text-[10px] font-semibold">
            Công nợ tích lũy cần thanh toán cho các nhà cung cấp vật tư
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
          <TrendDown size={24} weight="bold" />
        </div>
      </div>
    </div>
  );
}
