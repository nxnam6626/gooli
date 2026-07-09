import React from 'react';
import { Coins } from '@phosphor-icons/react';
import { fmt } from '../../utils';
import type { FinancialReport } from '../../types';

interface Props {
  report: FinancialReport;
}

export default function PaymentMethodStats({ report }: Props) {
  const methods = [
    {
      label: 'Chuyển khoản (BANK_TRANSFER)',
      desc: 'Giá trị giao dịch qua tài khoản ngân hàng',
      value: report.bankTransferTotal,
    },
    {
      label: 'Tiền mặt (CASH)',
      desc: 'Giá trị giao dịch thanh toán bằng tiền mặt tại két',
      value: report.cashTotal,
    },
  ];

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 select-none">
      <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
        <Coins size={16} className="text-[#2563eb]" />
        Thống kê theo phương thức thanh toán sổ quỹ
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {methods.map((m) => (
          <div key={m.label} className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
            <div>
              <div className="font-bold text-slate-800 text-xs">{m.label}</div>
              <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{m.desc}</div>
            </div>
            <div className={`text-sm font-extrabold font-mono ${m.value >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {m.value >= 0 ? '+' : ''}{fmt(m.value)}đ
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
