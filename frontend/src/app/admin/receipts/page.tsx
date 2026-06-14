"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ListDashes, ArrowsClockwise, Check, X, CaretDown, CaretUp, CircleNotch, SignIn, SignOut, Warehouse, Tag } from "@phosphor-icons/react";

interface ReceiptItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  vatRate: number;
  isFaulty: boolean;
  product?: { name: string; sku: string; slug: string; unit: string };
}

interface Receipt {
  id: number;
  code: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  note: string | null;
  createdAt: string;
  approvedAt: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  preTaxTotal: number;
  postTaxTotal: number;
  paidAmount: number;
  paymentStatus: string;
  partner?: { id: number; name: string; code: string } | null;
  items: ReceiptItem[];
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  APPROVED: { label: "Đã nhập kho", color: "bg-emerald-50 text-emerald-700 border border-emerald-200/30" },
  PENDING:  { label: "Chờ duyệt",   color: "bg-amber-50 text-amber-700 border border-amber-200/30"    },
  REJECTED: { label: "Từ chối",     color: "bg-rose-50 text-rose-700 border border-rose-200/30"        },
};

const fmt = (n: number | string) =>
  Number(n).toLocaleString("vi-VN");

const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleDateString("vi-VN") : "—";

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading]   = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("gooli_user");
    if (userData) {
      try { setUserRole(JSON.parse(userData).role); } catch { /* noop */ }
    }
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("gooli_token");
      const res = await fetch("http://localhost:3001/api/v1/receipts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setReceipts(await res.json());
    } catch (err) {
      console.error("Error fetching receipts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: "approve" | "reject") => {
    if (!confirm(action === "approve"
      ? "Xác nhận DUYỆT phiếu nhập? Tồn kho sẽ được cộng."
      : "Xác nhận TỪ CHỐI phiếu nhập?")) return;
    setActionId(id);
    try {
      const token = localStorage.getItem("gooli_token");
      const res = await fetch(`http://localhost:3001/api/v1/receipts/${id}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) await fetchReceipts();
      else { const e = await res.json(); alert(e.message || "Thao tác thất bại."); }
    } finally { setActionId(null); }
  };

  const totalQty = (items: ReceiptItem[]) =>
    items.reduce((s, i) => s + i.quantity, 0);

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
            onClick={fetchReceipts}
            className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold rounded-lg flex items-center gap-2 cursor-pointer transition-all text-xs"
          >
            <ArrowsClockwise size={16} />
            <span>Làm mới</span>
          </button>
          <Link
            href="/admin/receipts/import"
            className="px-4 py-2 border border-[#2563eb] text-[#2563eb] hover:bg-blue-50 font-bold rounded-lg flex items-center gap-2 cursor-pointer transition-all text-xs no-underline"
          >
            <span>Nhập từ Excel</span>
          </Link>
          <Link
            href="/admin/receipts/create"
            className="px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-2 cursor-pointer transition-all text-xs shadow-sm shadow-blue-500/10 no-underline"
          >
            <Plus size={16} weight="bold" />
            <span>Tạo phiếu nhập</span>
          </Link>
        </div>
      </div>

      {/* 2. Route tabs */}
      <div className="flex gap-8 border-b border-slate-100 pb-0.5">
        <button 
          className="flex items-center gap-2 py-3 px-1 text-[#2563eb] font-bold border-b-2 border-[#2563eb] transition-all text-xs bg-transparent cursor-pointer"
        >
          <SignIn size={18} />
          <span>Nhập kho</span>
        </button>
        <Link 
          href="/admin/products"
          className="flex items-center gap-2 py-3 px-1 text-slate-500 hover:text-[#2563eb] font-bold border-b-2 border-transparent transition-all no-underline text-xs"
        >
          <Warehouse size={18} />
          <span>Tồn kho</span>
        </Link>
        <Link 
          href="/admin/exports" 
          className="flex items-center gap-2 py-3 px-1 text-slate-500 hover:text-[#2563eb] font-bold border-b-2 border-transparent transition-all no-underline text-xs"
        >
          <SignOut size={18} />
          <span>Xuất kho</span>
        </Link>
        <Link 
          href="/admin/categories" 
          className="flex items-center gap-2 py-3 px-1 text-slate-500 hover:text-[#2563eb] font-bold border-b-2 border-transparent transition-all no-underline text-xs"
        >
          <Tag size={18} />
          <span>Nhóm hàng</span>
        </Link>
      </div>

      {/* Table Section */}
      <div className="bg-white shadow-[0_4px_20px_rgba(15,23,42,0.02)] border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-3.5 font-bold text-[11px] uppercase tracking-wider w-8 text-center">#</th>
                <th className="px-4 py-3.5 font-bold text-[11px] uppercase tracking-wider">Số phiếu</th>
                <th className="px-4 py-3.5 font-bold text-[11px] uppercase tracking-wider">Nhà cung cấp</th>
                <th className="px-4 py-3.5 font-bold text-[11px] uppercase tracking-wider">Ngày</th>
                <th className="px-4 py-3.5 font-bold text-[11px] uppercase tracking-wider text-right">SL</th>
                <th className="px-4 py-3.5 font-bold text-[11px] uppercase tracking-wider text-right">Tổng trước thuế</th>
                <th className="px-4 py-3.5 font-bold text-[11px] uppercase tracking-wider text-right">Tổng sau thuế</th>
                <th className="px-4 py-3.5 font-bold text-[11px] uppercase tracking-wider text-right">Đã trả</th>
                <th className="px-4 py-3.5 font-bold text-[11px] uppercase tracking-wider">Số hoá đơn</th>
                <th className="px-4 py-3.5 font-bold text-[11px] uppercase tracking-wider">Trạng thái</th>
                <th className="px-4 py-3.5 font-bold text-[11px] uppercase tracking-wider max-w-[140px]">Ghi chú</th>
                {userRole === "ADMIN" && <th className="px-4 py-3.5 font-bold text-[11px] uppercase tracking-wider text-center">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <CircleNotch size={18} className="animate-spin text-[#2563eb]" />
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center text-slate-400">
                    Chưa có phiếu nhập kho nào.
                  </td>
                </tr>
              ) : receipts.map((r, idx) => {
                const st = STATUS_MAP[r.status] ?? { label: r.status, color: "bg-slate-100 text-slate-600" };
                const isExpanded = expanded === r.id;
                return (
                  <React.Fragment key={r.id}>
                    <tr
                      className={`hover:bg-blue-50/10 cursor-pointer transition-colors ${isExpanded ? "bg-blue-50/25" : ""}`}
                      onClick={() => setExpanded(isExpanded ? null : r.id)}
                    >
                      <td className="px-4 py-3 text-center text-slate-400 text-xs">{idx + 1}</td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 text-xs flex items-center gap-2.5 h-[45px]">
                        {isExpanded ? <CaretUp size={12} className="text-[#2563eb]" /> : <CaretDown size={12} className="text-slate-400" />}
                        {r.code}
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-semibold">
                        {r.partner ? (
                          <span title={r.partner.code}>{r.partner.name}</span>
                        ) : (
                          <span className="text-slate-400 italic font-normal">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{fmtDate(r.createdAt)}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">{totalQty(r.items)}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600 text-xs">{r.preTaxTotal ? fmt(r.preTaxTotal) + "đ" : "—"}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">{r.postTaxTotal ? fmt(r.postTaxTotal) + "đ" : "—"}</td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-700 font-semibold">{r.paidAmount ? fmt(r.paidAmount) + "đ" : "0đ"}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs font-mono">{r.invoiceNumber ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-[140px] truncate" title={r.note ?? ""}>
                        {r.note || "—"}
                      </td>
                      {userRole === "ADMIN" && (
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          {r.status === "PENDING" ? (
                            <div className="flex gap-1.5 justify-center">
                              <button
                                onClick={() => handleAction(r.id, "approve")}
                                disabled={actionId === r.id}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-emerald-200/50"
                              >
                                <Check size={12} weight="bold" /> Duyệt
                              </button>
                              <button
                                onClick={() => handleAction(r.id, "reject")}
                                disabled={actionId === r.id}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-rose-200/50"
                              >
                                <X size={12} weight="bold" /> Từ chối
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300 block text-center">—</span>
                          )}
                        </td>
                      )}
                    </tr>

                    {/* Expanded Items */}
                    {isExpanded && r.items.length > 0 && (
                      <tr>
                        <td colSpan={userRole === "ADMIN" ? 12 : 11} className="px-0 py-0 bg-slate-50/50">
                          <div className="px-12 py-4 border-l-4 border-[#2563eb]">
                            <div className="text-[11px] font-bold text-[#2563eb] mb-3 uppercase tracking-wider">
                              Chi tiết hàng hóa trong phiếu
                            </div>
                            <table className="w-full text-xs border-collapse">
                              <thead>
                                <tr className="text-slate-400 border-b border-slate-200/70">
                                  <th className="text-left pb-2 font-bold uppercase text-[10px]">Tên hàng</th>
                                  <th className="text-right pb-2 font-bold uppercase text-[10px] w-24">Số lượng</th>
                                  <th className="text-right pb-2 font-bold uppercase text-[10px] w-32">Đơn giá</th>
                                  <th className="text-right pb-2 font-bold uppercase text-[10px] w-20">VAT</th>
                                  <th className="text-right pb-2 font-bold uppercase text-[10px] w-32">Thành tiền</th>
                                  <th className="text-center pb-2 font-bold uppercase text-[10px] w-36">Phân loại</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100/50">
                                {r.items.map((item) => (
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
                                    <td className="py-2.5 text-center">
                                      {item.isFaulty ? (
                                        <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 text-[9px] font-bold uppercase tracking-wider rounded-full border border-rose-100">Hàng lỗi</span>
                                      ) : (
                                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase tracking-wider rounded-full border border-emerald-100">Đạt tiêu chuẩn</span>
                                      )}
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
        {!loading && receipts.length > 0 && (
          <div className="px-4 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
            <span className="text-slate-500 text-xs">
              Tổng cộng <strong className="text-slate-800">{receipts.length}</strong> phiếu nhập · Bấm vào dòng phiếu để xem chi tiết
            </span>
            <span className="font-mono text-slate-900 font-extrabold text-base">
              Tổng tiền sau thuế:{" "}
              <span className="text-[#2563eb]">
                {fmt(receipts.reduce((s, r) => s + Number(r.postTaxTotal || 0), 0))}đ
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

