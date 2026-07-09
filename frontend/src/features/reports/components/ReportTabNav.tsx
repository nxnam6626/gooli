import React from 'react';
import { Coins, ChartBar, Package } from '@phosphor-icons/react';
import type { ActiveTab } from '../hooks/useReportsData';

interface Props {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onDebtReset: () => void;
}

const TABS: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
  { id: 'DEBT', label: 'Báo cáo công nợ & Đối soát', icon: <Coins size={16} /> },
  { id: 'FINANCE', label: 'Báo cáo tài chính & Dòng tiền', icon: <ChartBar size={16} /> },
  { id: 'STOCK', label: 'Báo cáo tồn kho hiện tại', icon: <Package size={16} /> },
];

export default function ReportTabNav({ activeTab, setActiveTab, onDebtReset }: Props) {
  return (
    <div className="flex border border-slate-200 bg-white p-1 rounded-xl shadow-2xs no-print select-none">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            setActiveTab(tab.id);
            if (tab.id === 'DEBT') onDebtReset();
          }}
          className={`flex-1 py-2.5 text-center font-bold text-xs transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer outline-none border-none ${
            activeTab === tab.id
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
