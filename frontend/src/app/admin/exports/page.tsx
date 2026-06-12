"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ListDashes, Check, X } from "@phosphor-icons/react";

interface ExportItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  vatRate: number;
}

interface Export {
  id: number;
  code: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  note: string | null;
  createdAt: string;
  approvedAt: string | null;
  preTaxTotal: number;
  postTaxTotal: number;
  paidAmount: number;
  paymentStatus: string;
  items: ExportItem[];
  partner?: { id: number; name: string; code: string } | null;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  APPROVED: { label: "Đã xuất kho", color: "bg-emerald-100 text-emerald-700" },
  PENDING:  { label: "Chờ duyệt",   color: "bg-amber-100 text-amber-700" },
  REJECTED: { label: "Từ chối",     color: "bg-red-100 text-red-700" },
};

export default function ExportsPage() {
  const [exports, setExports] = useState<Export[]>([]);
  const [loading, setLoading]   = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const userData = localStorage.getItem("gooli_user");
    if (userData) {
      try { setUserRole(JSON.parse(userData).role); } catch { /* noop */ }
    }
    fetchExports();
  }, []);

  const fetchExports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("gooli_token");
      const res = await fetch("http://localhost:3001/api/v1/exports", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setExports(await res.json());
    } catch (err) {
      console.error("Error fetching exports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: "approve" | "reject") => {
    if (!confirm(action === "approve" ? "Xác nhận DUYỆT phiếu xuất này? Tồn kho sẽ bị trừ." : "Xác nhận TỪ CHỐI phiếu xuất?")) return;
    setActionId(id);
    try {
      const token = localStorage.getItem("gooli_token");
      const res = await fetch(`http://localhost:3001/api/v1/exports/${id}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) await fetchExports();
      else { const e = await res.json(); alert(e.message || "Thao tác thất bại."); }
    } finally { setActionId(null); }
  };

  const fmt = (n: number | string) => Number(n).toLocaleString("vi-VN");

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800 flex items-center gap-2">
            <ListDashes size={28} className="text-[#B06518]" />
            Bán hàng — Phiếu Xuất Kho
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Quản lý phiếu xuất hàng cho khách hàng. Sau khi duyệt, tồn kho sẽ tự động giảm.
          </p>
        </div>
        <Link
          href="/admin/exports/create"
          className="flex items-center gap-2 bg-[#B06518] hover:bg-[#905212] text-white px-4 py-2 rounded-sm text-sm font-semibold transition-colors"
        >
          <Plus size={16} weight="bold" />
          Tạo phiếu xuất
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Số phiếu</th>
              <th className="px-4 py-3 font-semibold">Khách hàng</th>
              <th className="px-4 py-3 font-semibold text-right">Tổng trước thuế</th>
              <th className="px-4 py-3 font-semibold text-right">Tổng sau thuế</th>
              <th className="px-4 py-3 font-semibold">Ngày tạo</th>
              <th className="px-4 py-3 font-semibold">Trạng thái</th>
              {userRole === "ADMIN" && <th className="px-4 py-3 font-semibold text-center">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-neutral-500">Đang tải dữ liệu...</td></tr>
            ) : exports.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-neutral-500">Chưa có phiếu xuất kho nào.</td></tr>
            ) : exports.map((ex) => {
              const st = STATUS_MAP[ex.status] ?? { label: ex.status, color: "bg-gray-100 text-gray-700" };
              return (
                <tr key={ex.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium font-mono text-neutral-900">{ex.code}</td>
                  <td className="px-4 py-3 text-neutral-700">{ex.partner?.name ?? <span className="text-neutral-400 italic">Khách lẻ</span>}</td>
                  <td className="px-4 py-3 text-right font-mono text-neutral-700">
                    {ex.preTaxTotal ? fmt(ex.preTaxTotal) + "đ" : "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">
                    {ex.postTaxTotal ? fmt(ex.postTaxTotal) + "đ" : "-"}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {new Date(ex.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-sm ${st.color}`}>{st.label}</span>
                  </td>
                  {userRole === "ADMIN" && (
                    <td className="px-4 py-3 text-center">
                      {ex.status === "PENDING" ? (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleAction(ex.id, "approve")}
                            disabled={actionId === ex.id}
                            className="flex items-center gap-1 px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded text-xs font-semibold"
                          >
                            <Check size={13} weight="bold" /> Duyệt
                          </button>
                          <button
                            onClick={() => handleAction(ex.id, "reject")}
                            disabled={actionId === ex.id}
                            className="flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-semibold"
                          >
                            <X size={13} weight="bold" /> Từ chối
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400">—</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
