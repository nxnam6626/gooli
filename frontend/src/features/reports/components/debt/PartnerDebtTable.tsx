import React from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { fmt } from '../../utils';
import type { Partner } from '../../types';

interface Props {
  partners: Partner[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  onSelectPartner: (id: number) => void;
}

export default function PartnerDebtTable({ partners, searchQuery, setSearchQuery, onSelectPartner }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-wrap justify-between items-center gap-3 bg-slate-50/50">
        <span className="text-slate-800 font-extrabold text-xs uppercase tracking-wider select-none">
          Danh sách công nợ tất cả đối tác
        </span>
        <div className="relative w-64 max-w-xs">
          <input
            type="text"
            placeholder="Tìm đối tác (tên, mã)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-8 pr-3 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
          />
          <MagnifyingGlass size={14} className="text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] select-none">
              <th className="py-3 px-5">Mã đối tác</th>
              <th className="py-3 px-5">Tên đối tác</th>
              <th className="py-3 px-5">Phân loại</th>
              <th className="py-3 px-5">Số điện thoại</th>
              <th className="py-3 px-5 text-right">Công nợ hiện tại</th>
              <th className="py-3 px-5 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {partners.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400 italic">
                  Không tìm thấy đối tác nào phù hợp.
                </td>
              </tr>
            ) : (
              partners.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2.5 px-5 font-mono font-bold text-slate-800">{p.code}</td>
                  <td className="py-2.5 px-5 font-bold text-slate-900">{p.name}</td>
                  <td className="py-2.5 px-5">
                    {p.type === 'CUSTOMER' ? (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-[9px] font-bold">
                        Khách hàng
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100 text-[9px] font-bold">
                        Nhà cung cấp
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-5 text-slate-500 font-medium">{p.phone || '—'}</td>
                  <td
                    className={`py-2.5 px-5 text-right font-black font-mono ${
                      Number(p.totalDebt || 0) > 0
                        ? p.type === 'CUSTOMER'
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {fmt(p.totalDebt || 0)}đ
                  </td>
                  <td className="py-2.5 px-5 text-center">
                    <button
                      onClick={() => onSelectPartner(p.id)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer transition-all text-[10px]"
                    >
                      Xem đối soát
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
