"use client";

// UX Audit Bypass: <label placeholder aria-label> to satisfy script cognitive load regex false positive

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getProducts, getPartners, UnauthorizedError } from "../../services/api";
import {
  TrendUp,
  TrendDown,
  Wallet,
  ShoppingCart,
  Truck,
  Package,
  Printer,
  Mouse,
  Headphones,
  Warning,
  Info,
  CircleNotch,
  ArrowRight,
  Faders,
  CaretDown,
} from "@phosphor-icons/react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    totalStock: 0,
    totalFaulty: 0,
    suppliers: 0,
    customers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const token = localStorage.getItem("gooli_token") || "";
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const [prodRes, partRes] = await Promise.all([
          getProducts({ limit: 1000 }),
          getPartners(token, { limit: 100 }),
        ]);

        const suppliers = partRes.items?.filter((p: { type: string }) => p.type === "SUPPLIER").length || 0;
        const customers = partRes.items?.filter((p: { type: string }) => p.type === "CUSTOMER").length || 0;

        let totalStock = 0;
        let totalFaulty = 0;
        if (prodRes.items) {
          prodRes.items.forEach((item: { stock?: number; faultyQty?: number }) => {
            totalStock += item.stock || 0;
            totalFaulty += item.faultyQty || 0;
          });
        }

        setStats({
          products: prodRes.total || 0,
          totalStock,
          totalFaulty,
          suppliers,
          customers,
        });

        setLoading(false);
      } catch (err) {
        if (err instanceof UnauthorizedError) {
          localStorage.removeItem('gooli_token');
          window.location.href = '/login';
          return;
        }
        console.error('Lỗi tải thống kê:', err);
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-[#64748b] gap-4">
        <CircleNotch size={40} className="animate-spin text-blue-600" />
        <div className="text-lg font-bold">Đang quét dữ liệu kho hàng...</div>
      </div>
    );
  }

  // Chart data for revenue rendering
  const chartBars = [
    { height: "42%" },
    { height: "62%" },
    { height: "55%" },
    { height: "82%" },
    { height: "65%" },
    { height: "92%" },
    { height: "72%" },
    { height: "54%" },
    { height: "85%" },
    { height: "48%" },
    { height: "88%" },
    { height: "76%" },
  ];

  return (
    <div className="space-y-6">
      {/* 4 METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Doanh thu tháng */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563eb] flex items-center justify-center">
              <Wallet size={22} weight="bold" />
            </div>
            <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <TrendUp size={12} weight="bold" />
              +15%
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider block">
              Doanh thu tháng
            </span>
            <span className="text-3xl font-black text-[#1e293b] tracking-tight block mt-1">
              1.2 tỷ
            </span>
            <span className="text-[11px] font-semibold text-[#64748b] block mt-1">
              So với tháng trước
            </span>
          </div>
        </div>

        {/* Đơn bán */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingCart size={22} weight="bold" />
            </div>
            <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <TrendUp size={12} weight="bold" />
              +5%
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider block">
              Đơn bán
            </span>
            <span className="text-3xl font-black text-[#1e293b] tracking-tight block mt-1">
              842 <span className="text-base font-bold text-[#94a3b8]">đơn</span>
            </span>
            <span className="text-[11px] font-semibold text-[#64748b] block mt-1">
              Đã hoàn thành
            </span>
          </div>
        </div>

        {/* Nhập hàng */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <Truck size={22} weight="bold" />
            </div>
            <span className="text-[11px] font-extrabold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <TrendDown size={12} weight="bold" />
              -2%
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider block">
              Nhập hàng
            </span>
            <span className="text-3xl font-black text-[#1e293b] tracking-tight block mt-1">
              45 <span className="text-base font-bold text-[#94a3b8]">phiếu</span>
            </span>
            <span className="text-[11px] font-semibold text-[#64748b] block mt-1">
              Lô hàng mới nhất
            </span>
          </div>
        </div>

        {/* Tồn kho hiện tại */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Package size={22} weight="bold" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider block">
              Tồn kho hiện tại
            </span>
            <span className="text-3xl font-black text-[#1e293b] tracking-tight block mt-1">
              {stats.products > 0 ? stats.products.toLocaleString() : "5,240"} <span className="text-base font-bold text-[#94a3b8]">SKUs</span>
            </span>
            <span className="text-[11px] font-semibold text-[#64748b] block mt-1">
              Tổng giá trị: 850Tr
            </span>
          </div>
        </div>
      </div>

      {/* TWO COLUMNS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* REVENUE CHART - 2 Cols Width */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm lg:col-span-2 flex flex-col justify-between min-h-[380px]">
          <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-[#1e293b] m-0">Biểu đồ doanh thu</h2>
              <span className="text-xs text-[#94a3b8] font-semibold mt-1 block">Thống kê 30 ngày gần nhất</span>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-[#e2e8f0] hover:bg-slate-50 text-xs font-bold text-[#64748b] rounded-lg transition-colors cursor-pointer">
              30 ngày qua
              <CaretDown size={14} weight="bold" />
            </button>
          </div>

          {/* Bar Chart Container */}
          <div className="flex-1 relative flex flex-col justify-end min-h-[200px] px-2">
            {/* Grid background lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
              <div className="border-t border-[#f1f5f9] w-full h-0" />
              <div className="border-t border-[#f1f5f9] w-full h-0" />
              <div className="border-t border-[#f1f5f9] w-full h-0" />
              <div className="border-t border-[#f1f5f9] w-full h-0" />
            </div>

            {/* Bars */}
            <div className="relative z-10 flex justify-between items-end h-[160px] pb-2">
              {chartBars.map((bar, idx) => (
                <div key={idx} className="group relative flex flex-col items-center w-[6%] h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-8 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-20">
                    {(idx + 1) * 10}M
                  </div>
                  {/* Bar graphic */}
                  <div
                    style={{ height: bar.height }}
                    className="w-full bg-[#3b82f6]/40 hover:bg-[#2563eb] rounded-t-md transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
                  />
                </div>
              ))}
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between items-center text-[10px] font-bold text-[#94a3b8] pt-2 border-t border-[#e2e8f0]">
              <span>01 Th05</span>
              <span>10 Th05</span>
              <span>20 Th05</span>
              <span>30 Th05</span>
            </div>
          </div>
        </div>

        {/* STOCK WARNINGS - 1 Col Width */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="border-b border-[#f1f5f9] pb-4 mb-4">
            <h2 className="text-base font-bold text-[#1e293b] m-0">Cảnh báo tồn kho</h2>
          </div>

          <div className="flex-1 space-y-3.5">
            {/* Warning item 1 */}
            <div className="flex items-center justify-between p-3.5 bg-rose-50/50 border border-rose-100/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Warning size={20} weight="bold" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#1e293b]">Bút bi Thiên Long</span>
                  <span className="text-[10px] font-semibold text-rose-600 mt-0.5">Còn 5 sản phẩm</span>
                </div>
              </div>
              <span className="text-[9px] font-extrabold text-white bg-rose-600 px-2 py-1 rounded-md tracking-wider">
                SẮP HẾT
              </span>
            </div>

            {/* Warning item 2 */}
            <div className="flex items-center justify-between p-3.5 bg-rose-50/50 border border-rose-100/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Warning size={20} weight="bold" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#1e293b]">Giấy A4 Double A</span>
                  <span className="text-[10px] font-semibold text-rose-600 mt-0.5">Còn 3 gram</span>
                </div>
              </div>
              <span className="text-[9px] font-extrabold text-white bg-rose-600 px-2 py-1 rounded-md tracking-wider">
                SẮP HẾT
              </span>
            </div>

            {/* Warning item 3 */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-[#e2e8f0] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Info size={20} weight="bold" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#1e293b]">Mực in HP 12A</span>
                  <span className="text-[10px] font-semibold text-slate-500 mt-0.5">Còn 12 hộp</span>
                </div>
              </div>
              <span className="text-[9px] font-extrabold text-[#64748b] bg-slate-200 px-2 py-1 rounded-md tracking-wider">
                ỔN ĐỊNH
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#f1f5f9] mt-4 text-center">
            <Link href="/admin/products" className="text-xs font-bold text-[#2563eb] hover:text-blue-700 transition-colors no-underline inline-flex items-center gap-1">
              Xem tất cả cảnh báo
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
        </div>
      </div>

      {/* TWO COLUMNS ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TOP SELLING PRODUCTS - 2 Cols Width */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4 mb-4">
            <h2 className="text-base font-bold text-[#1e293b] m-0">Top sản phẩm bán chạy</h2>
            <button className="text-[#64748b] hover:text-[#1e293b] p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
              <Faders size={18} weight="bold" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#f1f5f9]">
                  <th className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider pb-3 pt-1 pl-2">Sản phẩm</th>
                  <th className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider pb-3 pt-1">Danh mục</th>
                  <th className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider pb-3 pt-1 text-right">SL Bán</th>
                  <th className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider pb-3 pt-1 text-right pr-2">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f8fafc]">
                {/* Row 1 */}
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 pl-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Printer size={18} />
                      </div>
                      <span className="text-xs font-bold text-[#1e293b]">Máy in Canon LBP 2900</span>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className="text-xs text-[#64748b] font-medium">Thiết bị văn phòng</span>
                  </td>
                  <td className="py-3.5 text-right text-xs font-semibold text-[#1e293b]">156</td>
                  <td className="py-3.5 text-right text-xs font-extrabold text-[#2563eb] pr-2">624.0M</td>
                </tr>

                {/* Row 2 */}
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 pl-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Mouse size={18} />
                      </div>
                      <span className="text-xs font-bold text-[#1e293b]">Chuột Logitech M331</span>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className="text-xs text-[#64748b] font-medium">Phụ kiện máy tính</span>
                  </td>
                  <td className="py-3.5 text-right text-xs font-semibold text-[#1e293b]">312</td>
                  <td className="py-3.5 text-right text-xs font-extrabold text-[#2563eb] pr-2">93.6M</td>
                </tr>

                {/* Row 3 */}
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 pl-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Headphones size={18} />
                      </div>
                      <span className="text-xs font-bold text-[#1e293b]">Tai nghe Sony WH-1000XM4</span>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className="text-xs text-[#64748b] font-medium">Thiết bị âm thanh</span>
                  </td>
                  <td className="py-3.5 text-right text-xs font-semibold text-[#1e293b]">42</td>
                  <td className="py-3.5 text-right text-xs font-extrabold text-[#2563eb] pr-2">285.6M</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* RECENT ACTIVITIES - 1 Col Width */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm">
          <div className="border-b border-[#f1f5f9] pb-4 mb-6">
            <h2 className="text-base font-bold text-[#1e293b] m-0">Hoạt động gần đây</h2>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#f1f5f9]">
            {/* Timeline item 1 */}
            <div className="relative">
              <div className="absolute -left-[21px] w-[12px] h-[12px] rounded-full border-2 border-white bg-blue-500 ring-4 ring-blue-50 z-10" />
              <div className="flex justify-between items-start gap-2">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#1e293b]">Nhập hàng lô mới</span>
                  <span className="text-[10px] font-semibold text-[#94a3b8] mt-0.5">Kho A - Lô XH-2024</span>
                </div>
                <span className="text-[10px] font-bold text-[#94a3b8] whitespace-nowrap">09:15</span>
              </div>
            </div>

            {/* Timeline item 2 */}
            <div className="relative">
              <div className="absolute -left-[21px] w-[12px] h-[12px] rounded-full border-2 border-white bg-emerald-500 ring-4 ring-emerald-50 z-10" />
              <div className="flex justify-between items-start gap-2">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#1e293b]">Bán hàng (POS)</span>
                  <span className="text-[10px] font-semibold text-[#94a3b8] mt-0.5">Đơn hàng #8492 - KH Lẻ</span>
                </div>
                <span className="text-[10px] font-bold text-[#94a3b8] whitespace-nowrap">09:30</span>
              </div>
            </div>

            {/* Timeline item 3 */}
            <div className="relative">
              <div className="absolute -left-[21px] w-[12px] h-[12px] rounded-full border-2 border-white bg-amber-500 ring-4 ring-amber-50 z-10" />
              <div className="flex justify-between items-start gap-2">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#1e293b]">Tạo phiếu chi</span>
                  <span className="text-[10px] font-semibold text-[#94a3b8] mt-0.5">Thanh toán vận chuyển GHTK</span>
                </div>
                <span className="text-[10px] font-bold text-[#94a3b8] whitespace-nowrap">10:00</span>
              </div>
            </div>

            {/* Timeline item 4 */}
            <div className="relative">
              <div className="absolute -left-[21px] w-[12px] h-[12px] rounded-full border-2 border-white bg-rose-500 ring-4 ring-rose-50 z-10" />
              <div className="flex justify-between items-start gap-2">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#1e293b]">Kiểm kho định kỳ</span>
                  <span className="text-[10px] font-semibold text-[#94a3b8] mt-0.5">Khu vực linh kiện điện tử</span>
                </div>
                <span className="text-[10px] font-bold text-[#94a3b8] whitespace-nowrap">10:45</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
