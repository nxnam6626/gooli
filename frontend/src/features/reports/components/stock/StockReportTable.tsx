import React from 'react';
import { Package } from '@phosphor-icons/react';
import type { ReportProduct } from '../../types';

interface Props {
  products: ReportProduct[];
}

export default function StockReportTable({ products }: Props) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4">
      <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 select-none">
        <Package size={16} className="text-[#2563eb]" />
        Báo cáo lượng tồn kho hiện tại chi tiết
      </h3>

      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] select-none">
              <th className="py-3 px-4">Mã SKU</th>
              <th className="py-3 px-4">Tên sản phẩm</th>
              <th className="py-3 px-4">Đơn vị tính</th>
              <th className="py-3 px-4 text-right">Tồn kho chuẩn (Đạt chuẩn)</th>
              <th className="py-3 px-4 text-right">Tồn hàng hỏng (Lỗi/Hỏng)</th>
              <th className="py-3 px-4">Trạng thái tồn kho</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {products.map((prod) => (
              <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-2.5 px-4 font-mono font-bold text-slate-800">{prod.sku}</td>
                <td className="py-2.5 px-4 font-bold text-slate-900">{prod.name}</td>
                <td className="py-2.5 px-4 text-slate-500 font-medium">{prod.unit}</td>
                <td className="py-2.5 px-4 text-right font-black font-mono text-slate-900">
                  {Number(prod.stock).toLocaleString('vi-VN')}
                </td>
                <td className="py-2.5 px-4 text-right font-bold font-mono text-rose-600">
                  {Number(prod.faultyQty || 0).toLocaleString('vi-VN')}
                </td>
                <td className="py-2.5 px-4">
                  {prod.stock <= 5 ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200/50 text-[9px] uppercase tracking-wider select-none">
                      Tồn kho thấp
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/50 text-[9px] uppercase tracking-wider select-none">
                      Đảm bảo an toàn
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
