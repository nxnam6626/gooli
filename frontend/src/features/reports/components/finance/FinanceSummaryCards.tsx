import React from 'react';
import { fmt } from '../../utils';
import type { FinancialReport } from '../../types';

interface Props {
  report: FinancialReport;
}

export default function FinanceSummaryCards({ report }: Props) {
  const cards = [
    {
      label: 'TỔNG THU SỔ QUỸ',
      value: `+${fmt(report.receiptsTotal)}đ`,
      color: 'text-emerald-600',
      border: 'border-l-emerald-500',
      desc: 'Tổng số tiền thu từ khách hàng qua phiếu thu',
    },
    {
      label: 'TỔNG CHI SỔ QUỸ',
      value: `-${fmt(report.paymentsTotal)}đ`,
      color: 'text-rose-600',
      border: 'border-l-rose-500',
      desc: 'Tổng số tiền thanh toán cho nhà cung cấp qua phiếu chi',
    },
    {
      label: 'DÒNG TIỀN THUẦN (NET CASH FLOW)',
      value: `${report.netFlow >= 0 ? '+' : ''}${fmt(report.netFlow)}đ`,
      color: report.netFlow >= 0 ? 'text-slate-900' : 'text-rose-700',
      border: 'border-l-slate-900',
      desc: 'Hiệu số Thu nhập trừ Chi phí thực tế trong kỳ báo cáo',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
      {cards.map((c) => (
        <div key={c.label} className={`bg-white p-5 rounded-xl border border-slate-200 border-l-4 ${c.border} shadow-2xs space-y-2`}>
          <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">{c.label}</div>
          <div className={`text-2xl font-black font-mono ${c.color}`}>{c.value}</div>
          <p className="text-slate-500 text-[10px]">{c.desc}</p>
        </div>
      ))}
    </div>
  );
}
