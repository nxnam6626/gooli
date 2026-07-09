import React from 'react';
import { ChartBar } from '@phosphor-icons/react';
import { fmt } from '../../utils';
import type { MonthlyFlow } from '../../types';

interface Props {
  monthlyFlows: MonthlyFlow[];
  maxMonthValue: number;
}

export default function MonthlyCashFlowChart({ monthlyFlows, maxMonthValue }: Props) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-6">
      <div className="flex justify-between items-center select-none">
        <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
          <ChartBar size={18} className="text-[#2563eb]" />
          Xu hướng thu chi quỹ két (6 tháng gần đây)
        </h3>
      </div>

      {monthlyFlows.length === 0 ? (
        <p className="text-slate-400 italic py-10 text-center">
          Chưa có giao dịch phát sinh để vẽ biểu đồ.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="h-64 flex items-end justify-around border-b border-slate-200 pb-2 pt-6">
            {monthlyFlows.map((flow, idx) => {
              const recH = (flow.receipts / maxMonthValue) * 100;
              const payH = (flow.payments / maxMonthValue) * 100;
              return (
                <div key={idx} className="flex flex-col items-center gap-1 w-1/6 group">
                  <div className="flex items-end gap-1.5 h-48 w-full justify-center">
                    <div
                      className="bg-emerald-500 hover:bg-emerald-600 rounded-t-sm w-4 sm:w-6 transition-all duration-500 relative cursor-pointer"
                      style={{ height: `${Math.max(4, recH)}%` }}
                      title={`Thu: ${fmt(flow.receipts)}đ`}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-900 text-white font-mono font-bold text-[9px] py-0.5 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none mb-1 whitespace-nowrap z-10 shadow-sm">
                        +{fmt(flow.receipts)}
                      </div>
                    </div>
                    <div
                      className="bg-rose-500 hover:bg-rose-600 rounded-t-sm w-4 sm:w-6 transition-all duration-500 relative cursor-pointer"
                      style={{ height: `${Math.max(4, payH)}%` }}
                      title={`Chi: ${fmt(flow.payments)}đ`}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-900 text-white font-mono font-bold text-[9px] py-0.5 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none mb-1 whitespace-nowrap z-10 shadow-sm">
                        -{fmt(flow.payments)}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 mt-2 select-none">{flow.month}</span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 text-[10px] font-bold uppercase text-slate-500 justify-center select-none pt-2">
            {[
              { color: 'bg-emerald-500', label: 'Tổng tiền thu (+)' },
              { color: 'bg-rose-500', label: 'Tổng tiền chi (-)' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 ${item.color} rounded-sm`} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
