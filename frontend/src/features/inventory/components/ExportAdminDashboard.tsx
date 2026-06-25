"use client";

import React from "react";
import Link from "next/link";
import { Plus, CaretDown, CaretUp, CircleNotch } from "@phosphor-icons/react";
import { useExportAdmin } from "../hooks/useExportAdmin";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Chờ duyệt", color: "bg-amber-50 text-amber-700 border-amber-200" },
  APPROVED: { label: "Đã xuất kho", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED: { label: "Đã từ chối", color: "bg-rose-50 text-rose-700 border-rose-200" },
};

const fmt = (n: number | string) =>
  Number(n).toLocaleString("vi-VN");

const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleDateString("vi-VN") : "—";

export default function ExportAdminDashboard() {
  const {
    exports,
    loading,
    actionId,
    expanded,
    setExpanded,
    perms,
    fetchExports,
    handleAction,
    totalQty
  } = useExportAdmin();

  return (
    <div className="space-y-6 font-sans text-xs pb-10">
      {/* Header */}
      <div className="flex justify-between items-center select-none">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Quản lý Kho hàng</h1>
          <p className="text-slate-500 mt-1 text-[11px]">Cập nhật và theo dõi tồn kho theo thời gian thực.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchExports}
            className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold rounded-lg flex items-center gap-2 cursor-pointer transition-all text-xs"
          >
            <span>Làm mới</span>
          </button>
          <Link
            href="/admin/exports/create"
            className="px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-2 cursor-pointer transition-all text-xs shadow-sm shadow-blue-500/10 no-underline"
          >
            <Plus size={16} weight="bold" />
            <span>Tạo phiếu xuất</span>
          </Link>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white shadow-[0_4px_20px_rgba(15,23,42,0.02)] border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-3.5 font-bold text-[11px] uppercase tracking-wider w-8 text-center">#</th>
                <th className="px-4 py-3.5 font-bold text-[11px] uppercase tracking-wider">Số phiếu</th>
                <th className="px-4 py-3.5 font-bold text-[11px] uppercase tracking-wider">Khách hàng</th>
                <th className="px-4 py-3.5 font-bold text-[11px] uppercase tracking-wider text-right">SL</th>
                <th className="px-4 py-3.5 font-bold text-[11px] uppercase tracking-wider text-right">Tổng trước thuế</th>
                <th className="px-4 py-3.5 font-bold text-[11px] uppercase tracking-wider text-right">Tổng sau thuế</th>
                <th className="px-4 py-3.5 font-bold text-[11px] uppercase tracking-wider">Ngày tạo</th>
                <th className="px-4 py-3.5 font-bold text-[11px] uppercase tracking-wider">Trạng thái</th>
                {perms.approve_bills && <th className="px-4 py-3.5 font-bold text-[11px] uppercase tracking-wider text-center">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <CircleNotch size={18} className="animate-spin text-[#2563eb]" />
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : exports.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                    Chưa có phiếu xuất kho nào.
                  </td>
                </tr>
              ) : exports.map((ex, idx) => {
                const st = STATUS_MAP[ex.status] ?? { label: ex.status, color: "bg-slate-100 text-slate-600" };
                const isExpanded = expanded === ex.id;
                return (
                  <React.Fragment key={ex.id}>
                    <tr
                      className={`hover:bg-blue-50/10 cursor-pointer transition-colors ${isExpanded ? "bg-blue-50/25" : ""}`}
                      onClick={() => setExpanded(isExpanded ? null : ex.id)}
                    >
                      <td className="px-4 py-3 text-center text-slate-400 text-xs">{idx + 1}</td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 text-xs flex items-center gap-2.5 h-[45px]">
                        {isExpanded ? <CaretUp size={12} className="text-[#2563eb]" /> : <CaretDown size={12} className="text-slate-400" />}
                        {ex.code}
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-semibold">
                        {ex.partner ? (
                          <span title={ex.partner.code}>{ex.partner.name}</span>
                        ) : (
                          <span className="text-slate-400 italic font-normal">Khách lẻ</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">{totalQty(ex.items)}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600 text-xs">{ex.preTaxTotal ? fmt(ex.preTaxTotal) + "đ" : "—"}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">{ex.postTaxTotal ? fmt(ex.postTaxTotal) + "đ" : "—"}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{fmtDate(ex.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      {perms.approve_bills && (
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          {ex.status === "PENDING" ? (
                            <div className="flex gap-1.5 justify-center">
                              <button
                                onClick={() => handleAction(ex.id, "approve")}
                                disabled={actionId === ex.id}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-emerald-200/50"
                              >
                                Duyệt
                              </button>
                              <button
                                onClick={() => handleAction(ex.id, "reject")}
                                disabled={actionId === ex.id}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-rose-200/50"
                              >
                                Từ chối
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300 block text-center">—</span>
                          )}
                        </td>
                      )}
                    </tr>

                    {/* Collapsible detail drawer */}
                    {isExpanded && ex.items.length > 0 && (
                      <tr>
                        <td colSpan={perms.approve_bills ? 9 : 8} className="px-0 py-0 bg-slate-50/50">
                          <div className="px-12 py-4 border-l-4 border-[#2563eb]">
                            <div className="text-[11px] font-bold text-[#2563eb] mb-3 uppercase tracking-wider">
                              Chi tiết sản phẩm đã xuất
                            </div>
                            <table className="w-full text-xs border-collapse">
                              <thead>
                                <tr className="text-slate-400 border-b border-slate-200/70">
                                  <th className="text-left pb-2 font-bold uppercase text-[10px]">Tên hàng</th>
                                  <th className="text-right pb-2 font-bold uppercase text-[10px] w-24">Số lượng</th>
                                  <th className="text-right pb-2 font-bold uppercase text-[10px] w-32">Đơn giá</th>
                                  <th className="text-right pb-2 font-bold uppercase text-[10px] w-20">VAT</th>
                                  <th className="text-right pb-2 font-bold uppercase text-[10px] w-32">Thành tiền</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100/50">
                                {ex.items.map((item) => (
                                  <tr key={item.id}>
                                    <td className="py-2.5 font-semibold text-slate-800">{item.product?.name ?? `ID ${item.productId}`}</td>
                                    <td className="py-2.5 text-right text-slate-700 font-mono font-semibold">
                                      {item.quantity} {item.product?.unit ?? ""}
                                    </td>
                                    <td className="py-2.5 text-right font-mono text-slate-600">{fmt(item.price)}đ</td>
                                    <td className="py-2.5 text-right text-slate-500 font-mono">{item.vatRate ?? 10}%</td>
                                    <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                                      {fmt(item.quantity * item.price)}đ
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        {!loading && exports.length > 0 && (
          <div className="px-4 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
            <span className="text-slate-500 text-xs">
              Tổng cộng <strong className="text-slate-800">{exports.length}</strong> phiếu xuất · Bấm vào dòng phiếu để xem chi tiết
            </span>
            <span className="font-mono text-slate-900 font-extrabold text-base">
              Tổng tiền sau thuế:{" "}
              <span className="text-[#2563eb]">
                {fmt(exports.reduce((s, ex) => s + Number(ex.postTaxTotal || 0), 0))}đ
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
