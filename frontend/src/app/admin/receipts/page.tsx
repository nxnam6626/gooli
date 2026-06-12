"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ListDashes, ArrowsClockwise, Check, X } from "@phosphor-icons/react";

interface ReceiptItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  vatRate: number;
  isFaulty: boolean;
  product?: { name: string; slug: string; unit: string };
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
  APPROVED: { label: "Đã nhập kho", color: "bg-emerald-100 text-emerald-700" },
  PENDING:  { label: "Chờ duyệt",   color: "bg-amber-100 text-amber-700"    },
  REJECTED: { label: "Từ chối",     color: "bg-red-100 text-red-700"        },
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

  // Tổng số lượng tất cả items
  const totalQty = (items: ReceiptItem[]) =>
    items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div>
      {/* ─── Header ─── */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800 flex items-center gap-2">
            <ListDashes size={28} className="text-[#B06518]" />
            Nhập hàng — Phiếu Nhập Kho
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Quản lý phiếu nhập hàng từ nhà cung cấp. Tồn kho tự động cộng sau khi duyệt.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchReceipts}
            className="flex items-center gap-2 border border-neutral-300 text-neutral-600 hover:bg-neutral-50 px-3 py-2 rounded-sm text-sm font-semibold transition-colors"
          >
            <ArrowsClockwise size={16} />
            Làm mới
          </button>
          <Link
            href="/admin/receipts/import"
            className="flex items-center gap-2 border border-[#B06518] text-[#B06518] hover:bg-amber-50 px-4 py-2 rounded-sm text-sm font-semibold transition-colors"
          >
            Nhập từ Excel
          </Link>
          <Link
            href="/admin/receipts/create"
            className="flex items-center gap-2 bg-[#B06518] hover:bg-[#905212] text-white px-4 py-2 rounded-sm text-sm font-semibold transition-colors"
          >
            <Plus size={16} weight="bold" />
            Tạo phiếu nhập
          </Link>
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 border-b-2 border-neutral-200 text-neutral-600">
            <tr>
              <th className="px-3 py-3 font-semibold w-8 text-center">#</th>
              <th className="px-3 py-3 font-semibold">Số phiếu</th>
              <th className="px-3 py-3 font-semibold">Nhà cung cấp</th>
              <th className="px-3 py-3 font-semibold">Ngày</th>
              <th className="px-3 py-3 font-semibold text-right">SL</th>
              <th className="px-3 py-3 font-semibold text-right">Tổng tiền (trước thuế)</th>
              <th className="px-3 py-3 font-semibold text-right">Tổng sau thuế</th>
              <th className="px-3 py-3 font-semibold text-right">Đã thanh toán</th>
              <th className="px-3 py-3 font-semibold">Số hoá đơn</th>
              <th className="px-3 py-3 font-semibold">Trạng thái</th>
              <th className="px-3 py-3 font-semibold max-w-[140px]">Ghi chú</th>
              {userRole === "ADMIN" && <th className="px-3 py-3 font-semibold text-center">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              <tr>
                <td colSpan={12} className="px-4 py-10 text-center text-neutral-400">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : receipts.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-10 text-center text-neutral-400">
                  Chưa có phiếu nhập kho nào.
                </td>
              </tr>
            ) : receipts.map((r, idx) => {
              const st = STATUS_MAP[r.status] ?? { label: r.status, color: "bg-gray-100 text-gray-600" };
              const isExpanded = expanded === r.id;
              return (
                <>
                  <tr
                    key={r.id}
                    className={`hover:bg-amber-50/40 cursor-pointer transition-colors ${isExpanded ? "bg-amber-50/60" : ""}`}
                    onClick={() => setExpanded(isExpanded ? null : r.id)}
                  >
                    <td className="px-3 py-3 text-center text-neutral-400 text-xs">{idx + 1}</td>
                    <td className="px-3 py-3 font-mono font-semibold text-neutral-900 text-xs">{r.code}</td>
                    <td className="px-3 py-3 text-neutral-700">
                      {r.partner
                        ? <span title={r.partner.code}>{r.partner.name}</span>
                        : <span className="text-neutral-400 italic">—</span>}
                    </td>
                    <td className="px-3 py-3 text-neutral-600 text-xs">{fmtDate(r.createdAt)}</td>
                    <td className="px-3 py-3 text-right font-semibold text-neutral-800">
                      {totalQty(r.items)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-neutral-700">
                      {r.preTaxTotal ? fmt(r.preTaxTotal) : "—"}
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-slate-800">
                      {r.postTaxTotal ? fmt(r.postTaxTotal) : "—"}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-emerald-700">
                      {r.paidAmount ? fmt(r.paidAmount) : "0"}
                    </td>
                    <td className="px-3 py-3 text-neutral-600 text-xs">{r.invoiceNumber ?? "—"}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-sm ${st.color}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-neutral-500 max-w-[140px] truncate" title={r.note ?? ""}>
                      {r.note || "—"}
                    </td>
                    {userRole === "ADMIN" && (
                      <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                        {r.status === "PENDING" ? (
                          <div className="flex gap-1 justify-center">
                            <button
                              onClick={() => handleAction(r.id, "approve")}
                              disabled={actionId === r.id}
                              className="flex items-center gap-1 px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded text-xs font-semibold"
                            >
                              <Check size={12} weight="bold" /> Duyệt
                            </button>
                            <button
                              onClick={() => handleAction(r.id, "reject")}
                              disabled={actionId === r.id}
                              className="flex items-center gap-1 px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-semibold"
                            >
                              <X size={12} weight="bold" /> Từ chối
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-300 block text-center">—</span>
                        )}
                      </td>
                    )}
                  </tr>

                  {/* ─── Expanded Items ─── */}
                  {isExpanded && r.items.length > 0 && (
                    <tr key={`${r.id}-detail`}>
                      <td colSpan={userRole === "ADMIN" ? 12 : 11} className="px-0 py-0 bg-blue-50/40 border-b border-blue-100">
                        <div className="px-10 py-3">
                          <div className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wide">
                            Chi tiết hàng hóa trong phiếu
                          </div>
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-neutral-500">
                                <th className="text-left pb-1 font-semibold">Tên hàng</th>
                                <th className="text-right pb-1 font-semibold">SL</th>
                                <th className="text-right pb-1 font-semibold">Đơn giá</th>
                                <th className="text-right pb-1 font-semibold">VAT%</th>
                                <th className="text-right pb-1 font-semibold">Thành tiền</th>
                                <th className="text-left pb-1 font-semibold pl-4">Loại</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-100">
                              {r.items.map((item) => (
                                <tr key={item.id}>
                                  <td className="py-1 font-medium text-neutral-800">{item.product?.name ?? `ID ${item.productId}`}</td>
                                  <td className="py-1 text-right text-neutral-700">{item.quantity} {item.product?.unit ?? ""}</td>
                                  <td className="py-1 text-right font-mono text-neutral-700">{fmt(item.price)}</td>
                                  <td className="py-1 text-right text-neutral-600">{item.vatRate ?? 10}%</td>
                                  <td className="py-1 text-right font-mono font-bold text-neutral-900">
                                    {fmt(item.quantity * item.price)}
                                  </td>
                                  <td className="py-1 pl-4">
                                    {item.isFaulty
                                      ? <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-semibold">Hàng lỗi</span>
                                      : <span className="px-1.5 py-0.5 bg-green-100 text-green-600 rounded text-[10px] font-semibold">Đạt tiêu chuẩn</span>}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>

        {/* Footer summary */}
        {!loading && receipts.length > 0 && (
          <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-200 flex justify-between items-center text-sm">
            <span className="text-neutral-500">
              Tổng cộng <strong className="text-neutral-800">{receipts.length}</strong> phiếu nhập
              {" · "}click vào hàng để xem chi tiết hàng hóa
            </span>
            <span className="font-mono font-bold text-slate-800">
              Tổng sau thuế:{" "}
              {fmt(receipts.reduce((s, r) => s + Number(r.postTaxTotal || 0), 0))}đ
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
