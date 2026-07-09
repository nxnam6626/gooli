import React from 'react';
import { Users } from '@phosphor-icons/react';
import { fmt } from '../../utils';
import type { Partner } from '../../types';

interface Props {
  topDebtors: Partner[];
  topCreditors: Partner[];
  totalReceivables: number;
  totalPayables: number;
}

function TopList({
  items,
  total,
  color,
  emptyText,
}: {
  items: Partner[];
  total: number;
  color: 'emerald' | 'rose';
  emptyText: string;
}) {
  const barColor = color === 'emerald' ? 'bg-emerald-500' : 'bg-rose-500';
  if (items.length === 0) {
    return <p className="text-slate-400 italic py-4 text-center">{emptyText}</p>;
  }
  return (
    <div className="space-y-3">
      {items.map((p) => {
        const pct = Math.round((Number(p.totalDebt) / (total || 1)) * 100);
        return (
          <div key={p.id} className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">
                {p.name} ({p.code})
              </span>
              <span className="font-bold font-mono text-slate-900">{fmt(p.totalDebt || 0)}đ</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className={`${barColor} h-full rounded-full transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DebtTopLists({ topDebtors, topCreditors, totalReceivables, totalPayables }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2">
          <Users size={16} className="text-emerald-600" />
          Top 5 Khách Hàng Nợ Nhiều Nhất
        </h3>
        <TopList items={topDebtors} total={totalReceivables} color="emerald" emptyText="Không có công nợ khách hàng." />
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2">
          <Users size={16} className="text-rose-600" />
          Top 5 Nhà Cung Cấp Mình Nợ Nhiều Nhất
        </h3>
        <TopList items={topCreditors} total={totalPayables} color="rose" emptyText="Không có công nợ nhà cung cấp." />
      </div>
    </div>
  );
}
