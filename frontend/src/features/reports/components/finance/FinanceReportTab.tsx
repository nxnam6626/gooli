import React from 'react';
import { Calendar } from '@phosphor-icons/react';
import FinanceSummaryCards from './FinanceSummaryCards';
import MonthlyCashFlowChart from './MonthlyCashFlowChart';
import PaymentMethodStats from './PaymentMethodStats';
import type { FinancialReport, MonthlyFlow } from '../../types';

interface Props {
  financialReport: FinancialReport;
  monthlyFlows: MonthlyFlow[];
  maxMonthValue: number;
  startDate: string; setStartDate: (v: string) => void;
  endDate: string; setEndDate: (v: string) => void;
}

export default function FinanceReportTab({
  financialReport, monthlyFlows, maxMonthValue,
  startDate, setStartDate, endDate, setEndDate,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Date filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3 no-print select-none">
        <Calendar size={15} className="text-slate-400" />
        <span className="font-bold text-slate-700">Thời gian báo cáo:</span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-2.5 py-1.5 border border-slate-200 bg-slate-50 font-bold rounded-lg text-[11px] outline-none focus:border-[#2563eb]"
        />
        <span className="text-slate-400 select-none">đến</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-2.5 py-1.5 border border-slate-200 bg-slate-50 font-bold rounded-lg text-[11px] outline-none focus:border-[#2563eb]"
        />
      </div>

      <FinanceSummaryCards report={financialReport} />
      <MonthlyCashFlowChart monthlyFlows={monthlyFlows} maxMonthValue={maxMonthValue} />
      <PaymentMethodStats report={financialReport} />
    </div>
  );
}
