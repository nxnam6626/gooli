'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, Coins, FileText, Calendar, Wallet } from '@phosphor-icons/react';
import { getPartnerLedger } from '@/features/finance/services/financeApi';

export default function PartnerLedgerPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [token] = useState(() =>
    typeof window !== 'undefined'
      ? localStorage.getItem('gooli_token') || ''
      : '',
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ['partner-ledger', id],
    queryFn: () => getPartnerLedger(token, id),
    enabled: !!token && !isNaN(id),
  });

  const formatCurrency = (val: number | undefined) => {
    if (val === undefined) return '0 đ';
    return Math.round(val).toLocaleString('vi-VN') + ' đ';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 bg-white border border-slate-200 rounded-2xl shadow-2xs font-sans text-xs text-slate-400 italic">
        Đang tải sổ chi tiết công nợ đối tác...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-2xs font-sans text-xs text-rose-500 font-bold">
        ⚠️ Lỗi: {error instanceof Error ? error.message : 'Không thể tải sổ chi tiết công nợ.'}
      </div>
    );
  }

  const { partner, ledger } = data;

  return (
    <div className="space-y-6 font-sans antialiased text-slate-800 text-xs pb-10">
      {/* Back button and Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/partners"
          className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl transition-all shadow-2xs"
          title="Quay lại"
        >
          <ArrowLeft size={16} weight="bold" className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Sổ chi tiết công nợ
          </h1>
          <p className="text-slate-500 mt-0.5 text-[11px]">
            Sao kê dòng thời gian các hóa đơn nhập/xuất và phiếu thu/chi của đối tác.
          </p>
        </div>
      </div>

      {/* Partner Info & Debt Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Partner Details */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2.5">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Thông tin đối tác
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 leading-tight">
              {partner.name}
            </h2>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              Mã: {partner.code} | Loại: {partner.type === 'SUPPLIER' ? 'Nhà cung cấp' : 'Khách hàng'}
            </div>
          </div>
        </div>

        {/* Card 2: Current Outstanding Debt */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
            <Wallet size={24} weight="fill" />
          </div>
          <div>
            <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
              Dư nợ hiện tại (Total Debt)
            </div>
            <div className="text-lg font-black text-orange-600 mt-0.5">
              {formatCurrency(partner.totalDebt)}
            </div>
          </div>
        </div>

        {/* Card 3: Action Buttons */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-center">
          <Link
            href="/admin/slips"
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs text-center"
          >
            <Coins size={16} weight="bold" />
            <span>Lập phiếu Thu/Chi mới</span>
          </Link>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="font-extrabold text-slate-800 text-xs">Sổ cái chi tiết công nợ</span>
          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
            <Calendar size={12} />
            Lũy kế từ ngày khởi tạo hệ thống
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-semibold text-slate-700">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-extrabold select-none">
                <th className="py-3 px-4">Ngày ghi sổ</th>
                <th className="py-3 px-4">Mã chứng từ</th>
                <th className="py-3 px-4">Diễn giải / Nội dung</th>
                <th className="py-3 px-4 text-right">Tăng nợ (Ghi Nợ)</th>
                <th className="py-3 px-4 text-right">Giảm nợ (Ghi Có)</th>
                <th className="py-3 px-4 text-right">Số dư công nợ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {ledger.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-bold italic">
                    Chưa có phát sinh giao dịch/công nợ nào.
                  </td>
                </tr>
              ) : (
                ledger.map((entry) => {
                  const dateStr = new Date(entry.date).toLocaleString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-3 px-4 text-slate-500">{dateStr}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{entry.code}</td>
                      <td className="py-3 px-4 text-slate-800 font-semibold">{entry.description}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-500">
                        {entry.increase > 0 ? `+${formatCurrency(entry.increase)}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                        {entry.decrease > 0 ? `-${formatCurrency(entry.decrease)}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900 bg-slate-50/10">
                        {formatCurrency(entry.balance)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
