import React from 'react';
import { Warning } from '@phosphor-icons/react';

interface Transaction {
  id: number;
  code: string;
  note?: string | null;
  createdAt: string;
  items: { quantity: number; product?: { name: string } | null }[];
}

interface Props {
  recentReceipts: Transaction[];
  recentExports: Transaction[];
  lowStockCount: number;
}

function formatTime(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function TransactionList({ items, emptyText }: { items: Transaction[]; emptyText: string }) {
  if (items.length === 0) {
    return <div className="text-slate-400 italic text-[11px] py-4 text-center">{emptyText}</div>;
  }
  return (
    <div className="space-y-3">
      {items.map((tx) => {
        const totalQty = tx.items.reduce((s, i) => s + i.quantity, 0);
        const summary = tx.items[0]?.product?.name
          ? tx.items[0].product.name + (tx.items.length > 1 ? '...' : '')
          : tx.note || 'Giao dịch kho';
        return (
          <div key={tx.id} className="flex justify-between items-start border-t first:border-t-0 border-slate-100 first:pt-0 pt-2.5">
            <div>
              <div className="font-extrabold text-slate-800 text-[11px]">{tx.code}</div>
              <div className="text-slate-500 text-[10px] mt-0.5 max-w-[150px] truncate" title={summary}>
                {summary} x{totalQty}
              </div>
            </div>
            <div className="text-slate-400 font-semibold text-[10px]">{formatTime(tx.createdAt)}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function StockRecentActivity({ recentReceipts, recentExports, lowStockCount }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Recent receipts */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center justify-between">
          <span>Giao dịch gần đây</span>
          <span className="text-[#2563eb] text-[9px] lowercase tracking-normal font-semibold">Nhập kho</span>
        </div>
        <TransactionList items={recentReceipts} emptyText="Không có giao dịch gần đây" />
      </div>

      {/* Low stock warning */}
      <div className="bg-[#fef2f2] border border-red-100 rounded-xl p-4 shadow-2xs flex flex-col justify-center space-y-2">
        <div className="flex items-center gap-2 text-red-800">
          <Warning size={18} weight="fill" className="text-red-600" />
          <span className="text-[10px] font-extrabold uppercase tracking-wider">Cảnh báo tồn kho</span>
        </div>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-black text-red-600 leading-none">{lowStockCount}</span>
          <span className="text-red-800 font-extrabold text-[11px]">mặt hàng sắp hết</span>
        </div>
      </div>

      {/* Recent exports */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center justify-between">
          <span>Giao dịch gần đây</span>
          <span className="text-emerald-600 text-[9px] lowercase tracking-normal font-semibold">Xuất kho</span>
        </div>
        <TransactionList items={recentExports} emptyText="Không có giao dịch gần đây" />
      </div>
    </div>
  );
}
