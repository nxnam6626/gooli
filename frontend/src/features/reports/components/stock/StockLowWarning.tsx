import React from 'react';
import { WarningCircle } from '@phosphor-icons/react';
import type { ReportProduct } from '../../types';

interface Props {
  products: ReportProduct[];
}

export default function StockLowWarning({ products }: Props) {
  if (products.length === 0) return null;

  return (
    <div className="bg-amber-50/30 border border-amber-100 p-4 rounded-xl space-y-2.5 select-none">
      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
        <WarningCircle size={14} weight="bold" />
        Cảnh Báo Tồn Kho Sắp Hết Hạn Mức An Toàn
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white border border-amber-100 p-2.5 rounded-lg flex items-center justify-between text-xs shadow-3xs"
          >
            <div>
              <div className="font-bold text-slate-800">{p.name}</div>
              <div className="font-mono text-[10px] text-slate-400 font-bold mt-0.5">{p.sku}</div>
            </div>
            <span className="px-2 py-1 bg-amber-50 border border-amber-200 text-amber-800 font-black font-mono rounded-lg text-[10px]">
              Tồn: {p.stock} {p.unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
