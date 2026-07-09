'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChartBar, Calendar, Funnel, TrendUp, ArrowUpRight, ArrowDownRight } from '@phosphor-icons/react';
import { getProfitAndLoss } from '@/features/finance/services/financeApi';

function FinanceBar({ label, value, widthPct, color, textColor, formatFn }: {
  label: string;
  value: number;
  widthPct: number;
  color: string;    // Tailwind bg class e.g. 'bg-blue-500'
  textColor?: string;
  formatFn: (v: number) => string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between font-bold text-slate-600">
        <span>{label}</span>
        <span className={textColor}>{formatFn(value)}</span>
      </div>
      <div className="h-6 w-full bg-slate-100 rounded-lg overflow-hidden">
        <div
          className={`h-full ${color} rounded-lg transition-all duration-500 flex items-center pl-3`}
          style={{ width: `${widthPct}%` }}
        >
          {value > 0 && <span className="text-white font-extrabold text-[10px]">{label.split(' ')[0]}</span>}
        </div>
      </div>
    </div>
  );
}

export default function ProfitAndLossPage() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  const endOfDay = today.toISOString().slice(0, 10);

  const [from, setFrom] = useState(startOfMonth);
  const [to, setTo] = useState(endOfDay);

  const [token] = useState(() =>
    typeof window !== 'undefined'
      ? localStorage.getItem('gooli_token') || ''
      : '',
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ['pnl-report', from, to],
    queryFn: () => getProfitAndLoss(token, {
      from: from ? new Date(from).toISOString() : undefined,
      to: to ? new Date(`${to}T23:59:59.999Z`).toISOString() : undefined,
    }),
    enabled: !!token,
  });

  const formatCurrency = (val: number | undefined) => {
    if (val === undefined) return '0 đ';
    return Math.round(val).toLocaleString('vi-VN') + ' đ';
  };

  // Calculations for proportions in the visual chart
  const chartProps = useMemo(() => {
    if (!data) return { revWidth: 0, costWidth: 0, profitWidth: 0 };
    const rev = data.summary.revenue;
    const cost = data.summary.cost;
    const profit = data.summary.profit;

    if (rev <= 0) return { revWidth: 0, costWidth: 0, profitWidth: 0 };

    return {
      revWidth: 100,
      costWidth: Math.min(100, Math.max(5, (cost / rev) * 100)),
      profitWidth: Math.min(100, Math.max(5, (profit / rev) * 100)),
    };
  }, [data]);

  return (
    <div className="space-y-6 font-sans antialiased text-slate-800 text-xs pb-10">
      {/* Header */}
      <div className="flex justify-between items-center select-none">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ChartBar size={22} className="text-slate-700" />
            Báo cáo Lãi / Lỗ (P&L)
          </h1>
          <p className="text-slate-500 mt-0.5 text-[11px]">
            Phân tích hiệu quả kinh doanh, doanh thu bán lẻ và lợi nhuận gộp theo nhóm hàng.
          </p>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap gap-6 items-center">
        <div className="flex items-center gap-2 text-slate-500">
          <Funnel size={16} weight="bold" />
          <span className="font-extrabold uppercase tracking-wider text-[10px]">Bộ lọc báo cáo</span>
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
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-32 bg-white border border-slate-200 rounded-2xl shadow-2xs text-slate-400 italic">
          Đang tải báo cáo lãi/lỗ...
        </div>
      ) : error || !data ? (
        <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-2xs text-rose-500 font-bold">
          ⚠️ Lỗi tải báo cáo: {error instanceof Error ? error.message : 'Lỗi không xác định.'}
        </div>
      ) : (
        <>
          {/* Metrics summary grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none font-sans">
            {/* 1. Revenue */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <ArrowUpRight size={20} weight="bold" />
              </div>
              <div>
                <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                  Doanh thu bán hàng
                </div>
                <div className="text-lg font-black text-blue-600 mt-0.5">
                  {formatCurrency(data.summary.revenue)}
                </div>
              </div>
            </div>

            {/* 2. COGS */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                <ArrowDownRight size={20} weight="bold" />
              </div>
              <div>
                <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                  Giá vốn hàng bán (COGS)
                </div>
                <div className="text-lg font-black text-slate-700 mt-0.5">
                  {formatCurrency(data.summary.cost)}
                </div>
              </div>
            </div>

            {/* 3. Gross Profit */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <TrendUp size={20} weight="bold" />
              </div>
              <div>
                <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                  Lợi nhuận gộp
                </div>
                <div className="text-lg font-black text-emerald-600 mt-0.5">
                  {formatCurrency(data.summary.profit)}
                </div>
              </div>
            </div>

            {/* 4. Margin */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                Tỉ suất lãi gộp
              </div>
              <div className="text-lg font-black text-slate-800 mt-1 flex items-baseline gap-1">
                <span>{data.summary.margin.toFixed(1)}%</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Gross Margin</span>
              </div>
            </div>
          </div>

          {/* Visual proportions dashboard */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Trực quan hóa Cơ cấu Tài chính (Revenue vs Cost vs Profit)
            </h2>
            <div className="space-y-4 font-sans select-none">
              <FinanceBar
                label="Doanh thu thực tế (100%)"
                value={data.summary.revenue}
                widthPct={chartProps.revWidth}
                color="bg-blue-500"
                formatFn={formatCurrency}
              />
              <FinanceBar
                label={`Giá vốn hàng bán (${data.summary.revenue > 0 ? ((data.summary.cost / data.summary.revenue) * 100).toFixed(1) : 0}%)`}
                value={data.summary.cost}
                widthPct={chartProps.costWidth}
                color="bg-slate-400"
                formatFn={formatCurrency}
              />
              <FinanceBar
                label={`Lợi nhuận gộp (${data.summary.margin.toFixed(1)}%)`}
                value={data.summary.profit}
                widthPct={chartProps.profitWidth}
                color="bg-emerald-500"
                textColor="text-emerald-600 font-extrabold"
                formatFn={formatCurrency}
              />
            </div>
          </div>

          {/* Breakdown Table by category */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="font-extrabold text-slate-800 text-xs">Hiệu quả kinh doanh theo Nhóm sản phẩm</span>
              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <Calendar size={12} />
                Lọc theo thời gian trên
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-semibold text-slate-700">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-extrabold select-none">
                    <th className="py-3 px-4">Tên nhóm sản phẩm</th>
                    <th className="py-3 px-4 text-right">Doanh số bán lẻ</th>
                    <th className="py-3 px-4 text-right">Giá vốn ước tính</th>
                    <th className="py-3 px-4 text-right">Lợi nhuận gộp</th>
                    <th className="py-3 px-4 text-right">Tỷ suất lãi gộp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {data.categories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-bold italic">
                        Không có số liệu bán hàng cho danh mục nào trong kỳ.
                      </td>
                    </tr>
                  ) : (
                    data.categories.map((cat) => {
                      const margin = cat.revenue > 0 ? ((cat.revenue - cat.cost) / cat.revenue) * 100 : 0;
                      return (
                        <tr key={cat.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="py-3 px-4 text-slate-900 font-bold">{cat.name}</td>
                          <td className="py-3 px-4 text-right font-mono">{formatCurrency(cat.revenue)}</td>
                          <td className="py-3 px-4 text-right font-mono text-slate-500">{formatCurrency(cat.cost)}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                            {formatCurrency(cat.revenue - cat.cost)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900 bg-slate-50/10">
                            {margin.toFixed(1)}%
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
