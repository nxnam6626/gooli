'use client';

import React from 'react';
import { ChartBar } from '@phosphor-icons/react';
import { useReportsData } from '@/features/reports/hooks/useReportsData';
import ReportTabNav from '@/features/reports/components/ReportTabNav';
import DebtReportTab from '@/features/reports/components/debt/DebtReportTab';
import FinanceReportTab from '@/features/reports/components/finance/FinanceReportTab';
import StockReportTab from '@/features/reports/components/stock/StockReportTab';

export default function ReportsPage() {
  const data = useReportsData();

  return (
    <div className="space-y-6 font-sans text-xs pb-10">
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area {
            position: absolute; left: 0; top: 0;
            width: 100%; padding: 10px;
            font-size: 12px; color: #000; background-color: #fff;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-center pb-1 border-b border-slate-200 no-print select-none">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ChartBar size={24} className="text-[#2563eb]" />
            Báo cáo &amp; Đối soát
          </h1>
          <p className="text-slate-500 mt-1 text-[11px]">
            Báo cáo tổng hợp công nợ đối tác, doanh thu tài chính dòng tiền và giá trị tồn kho.
          </p>
        </div>
      </div>

      <ReportTabNav
        activeTab={data.activeTab}
        setActiveTab={data.setActiveTab}
        onDebtReset={() => data.setSelectedPartnerId('')}
      />

      {data.loading ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center font-bold text-slate-400 no-print flex flex-col items-center justify-center gap-3">
          <svg className="animate-spin h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Đang tổng hợp dữ liệu báo cáo...</span>
        </div>
      ) : (
        <>
          {data.activeTab === 'DEBT' && <DebtReportTab {...data} />}
          {data.activeTab === 'FINANCE' && (
            <FinanceReportTab
              financialReport={data.financialReport}
              monthlyFlows={data.monthlyFlows}
              maxMonthValue={data.maxMonthValue}
              startDate={data.startDate}
              setStartDate={data.setStartDate}
              endDate={data.endDate}
              setEndDate={data.setEndDate}
            />
          )}
          {data.activeTab === 'STOCK' && (
            <StockReportTab
              products={data.products}
              totalStockValue={data.totalStockValue}
              lowStockProducts={data.lowStockProducts}
              stockStats={data.stockStats}
            />
          )}
        </>
      )}
    </div>
  );
}
