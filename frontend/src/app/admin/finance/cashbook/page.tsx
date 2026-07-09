'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Coins, Calendar, Funnel, FileArrowUp, ArrowLeft, TrendUp, TrendDown, BookOpen } from '@phosphor-icons/react';
import { getCashbook } from '@/features/finance/services/financeApi';

export default function CashbookPage() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  const endOfDay = today.toISOString().slice(0, 10);

  const [from, setFrom] = useState(startOfMonth);
  const [to, setTo] = useState(endOfDay);
  const [method, setMethod] = useState('ALL');

  const [token] = useState(() =>
    typeof window !== 'undefined'
      ? localStorage.getItem('gooli_token') || ''
      : '',
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ['cashbook', from, to, method],
    queryFn: () => getCashbook(token, { 
      from: from ? new Date(from).toISOString() : undefined, 
      to: to ? new Date(`${to}T23:59:59.999Z`).toISOString() : undefined, 
      method: method === 'ALL' ? undefined : method 
    }),
    enabled: !!token,
  });

  const formatCurrency = (val: number | undefined) => {
    if (val === undefined) return '0 đ';
    return Math.round(val).toLocaleString('vi-VN') + ' đ';
  };

  const totalReceipts = useMemo(() => {
    if (!data) return 0;
    return data.items
      .filter((i) => i.type === 'RECEIPT')
      .reduce((sum, i) => sum + i.amount, 0);
  }, [data]);

  const totalPayments = useMemo(() => {
    if (!data) return 0;
    return data.items
      .filter((i) => i.type === 'PAYMENT')
      .reduce((sum, i) => sum + i.amount, 0);
  }, [data]);

  const exportToCSV = () => {
    if (!data || data.items.length === 0) return;
    const headers = 'Thoi gian,Ma chung tu,Loai phieu,Doi tac,Thu (VND),Chi (VND),So du quy (VND),Phuong thuc,Ghi chu\n';
    const rows = data.items.map((item) => {
      const dateStr = new Date(item.createdAt).toLocaleString('vi-VN');
      const typeStr = item.type === 'RECEIPT' ? 'Phiếu thu' : 'Phiếu chi';
      const partnerName = item.partner?.name || '';
      const thu = item.type === 'RECEIPT' ? item.amount : 0;
      const chi = item.type === 'PAYMENT' ? item.amount : 0;
      const phuongThuc = item.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản';
      const note = item.note || '';
      return `"${dateStr}","${item.code}","${typeStr}","${partnerName}",${thu},${chi},${item.balance},"${phuongThuc}","${note}"`;
    }).join('\n');

    const csvContent = '\uFEFF' + headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `so_quy_${from}_to_${to}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans antialiased text-slate-800 text-xs pb-10">
      {/* Header */}
      <div className="flex justify-between items-center select-none">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen size={22} className="text-slate-700" />
            Sổ quỹ Dòng tiền
          </h1>
          <p className="text-slate-500 mt-0.5 text-[11px]">
            Theo dõi dòng tiền mặt, chuyển khoản ngân hàng và đối soát quỹ thu chi.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            disabled={!data || data.items.length === 0}
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
          >
            <FileArrowUp size={16} className="text-slate-600" />
            <span>Xuất Excel/CSV</span>
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap gap-6 items-center">
        <div className="flex items-center gap-2 text-slate-500">
          <Funnel size={16} weight="bold" />
          <span className="font-extrabold uppercase tracking-wider text-[10px]">Bộ lọc sổ quỹ</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold">Từ ngày:</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-500 bg-slate-50 font-semibold"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold">Đến ngày:</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-500 bg-slate-50 font-semibold"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold">Phương thức:</span>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-500 bg-slate-50 font-bold"
            >
              <option value="ALL">Tất cả phương thức</option>
              <option value="CASH">Tiền mặt (CASH)</option>
              <option value="BANK_TRANSFER">Chuyển khoản (BANK)</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-32 bg-white border border-slate-200 rounded-2xl shadow-2xs text-slate-400 italic">
          Đang tải sổ quỹ dòng tiền...
        </div>
      ) : error || !data ? (
        <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-2xs text-rose-500 font-bold">
          ⚠️ Lỗi tải sổ quỹ: {error instanceof Error ? error.message : 'Lỗi không xác định.'}
        </div>
      ) : (
        <>
          {/* Cashbook metrics cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none font-sans">
            {/* 1. Opening Balance */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                Số dư đầu kỳ
              </div>
              <div className="text-lg font-black text-slate-800 mt-1">
                {formatCurrency(data.openingBalance)}
              </div>
            </div>

            {/* 2. Total Receipts */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <TrendUp size={20} weight="bold" />
              </div>
              <div>
                <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                  Tổng thu phát sinh
                </div>
                <div className="text-lg font-black text-emerald-600 mt-0.5">
                  +{formatCurrency(totalReceipts)}
                </div>
              </div>
            </div>

            {/* 3. Total Payments */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                <TrendDown size={20} weight="bold" />
              </div>
              <div>
                <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                  Tổng chi phát sinh
                </div>
                <div className="text-lg font-black text-rose-600 mt-0.5">
                  -{formatCurrency(totalPayments)}
                </div>
              </div>
            </div>

            {/* 4. Closing Balance */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                Số dư cuối kỳ
              </div>
              <div className="text-lg font-black text-blue-600 mt-1">
                {formatCurrency(data.closingBalance)}
              </div>
            </div>
          </div>

          {/* Slips table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="font-extrabold text-slate-800 text-xs">Sổ quỹ tiền chi tiết</span>
              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <Calendar size={12} />
                Thời gian ghi nhận
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-semibold text-slate-700">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-extrabold select-none">
                    <th className="py-3 px-4">Thời gian</th>
                    <th className="py-3 px-4">Mã chứng từ</th>
                    <th className="py-3 px-4">Loại phiếu</th>
                    <th className="py-3 px-4">Đối tác</th>
                    <th className="py-3 px-4 text-right">Thu (Ghi Nợ)</th>
                    <th className="py-3 px-4 text-right">Chi (Ghi Có)</th>
                    <th className="py-3 px-4 text-right">Số dư quỹ lũy kế</th>
                    <th className="py-3 px-4">Phương thức</th>
                    <th className="py-3 px-4">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {data.items.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400 font-bold italic">
                        Không có phát sinh thu/chi nào trong khoảng thời gian này.
                      </td>
                    </tr>
                  ) : (
                    data.items.map((item) => {
                      const dateStr = new Date(item.createdAt).toLocaleString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="py-3 px-4 text-slate-500">{dateStr}</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{item.code}</td>
                          <td className="py-3 px-4">
                            {item.type === 'RECEIPT' ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-100">
                                Thu
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 font-bold border border-rose-100">
                                Chi
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {item.partner ? (
                              <div>
                                <div className="text-slate-900 font-bold truncate max-w-[150px]">{item.partner.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono font-semibold">{item.partner.code}</div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">N/A</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                            {item.type === 'RECEIPT' ? `+${formatCurrency(item.amount)}` : '-'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-rose-500">
                            {item.type === 'PAYMENT' ? `-${formatCurrency(item.amount)}` : '-'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900 bg-slate-50/10">
                            {formatCurrency(item.balance)}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {item.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}
                          </td>
                          <td className="py-3 px-4 text-slate-500 max-w-[150px] truncate" title={item.note || ''}>
                            {item.note || <span className="text-slate-300 italic">Không có</span>}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
