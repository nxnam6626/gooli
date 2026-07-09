import React from 'react';
import { Package, List, WarningCircle } from '@phosphor-icons/react';
import { fmt } from '../../utils';
import type { StockStats } from '../../types';

interface Props {
  totalStockValue: number;
  stockStats: StockStats;
}

export default function StockReportMetrics({ totalStockValue, stockStats }: Props) {
  const cards = [
    {
      label: 'TỔNG GIÁ TRỊ VỐN TỒN KHO',
      value: `${fmt(totalStockValue)}đ`,
      desc: 'Ước tính theo đơn giá định mức của sản phẩm',
      icon: <Package size={24} weight="bold" />,
      iconBg: 'bg-blue-50 text-[#2563eb]',
      valueColor: 'text-slate-900',
      extra: null,
    },
    {
      label: 'TỔNG SỐ LƯỢNG TỒN KHO',
      value: stockStats.total.toLocaleString(),
      desc: null,
      icon: <List size={24} weight="bold" />,
      iconBg: 'bg-slate-50 text-slate-600',
      valueColor: 'text-slate-900',
      extra: (
        <div className="text-[10px] font-bold text-slate-500 flex gap-2">
          <span className="text-emerald-600">Đạt chuẩn: {stockStats.standard.toLocaleString()}</span>
          <span className="text-rose-600">Lỗi/Hỏng: {stockStats.faulty.toLocaleString()}</span>
        </div>
      ),
    },
    {
      label: 'TỶ LỆ LỖI/HỎNG (FAULTY RATE)',
      value: `${stockStats.rate}%`,
      desc: 'Tỷ lệ hao hụt lỗi hỏng trên tổng số hàng hiện tại',
      icon: <WarningCircle size={24} weight="bold" />,
      iconBg: 'bg-rose-50 text-rose-600',
      valueColor: 'text-rose-600',
      extra: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
      {cards.map((c) => (
        <div key={c.label} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">{c.label}</span>
            <span className={`text-2xl font-black block font-mono ${c.valueColor}`}>{c.value}</span>
            {c.desc && <p className="text-slate-500 text-[10px] font-semibold">{c.desc}</p>}
            {c.extra}
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${c.iconBg}`}>
            {c.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
