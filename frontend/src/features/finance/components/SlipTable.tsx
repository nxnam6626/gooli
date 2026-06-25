import React from "react";
import type { Slip } from "../hooks/useFinanceAdmin";

interface SlipTableProps {
  filteredSlips: Slip[];
  loading: boolean;
}

export default function SlipTable({ filteredSlips, loading }: SlipTableProps) {
  if (loading) {
    return (
      <div className="bg-white p-8 rounded-lg border border-gray-200 text-center font-semibold text-gray-500">
        Đang tải danh sách phiếu thu/chi...
      </div>
    );
  }

  if (filteredSlips.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-400">
        Không có phiếu thu/chi nào phù hợp bộ lọc.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-gray-200 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              <th className="py-2.5 px-3">Mã phiếu</th>
              <th className="py-2.5 px-3">Thời gian</th>
              <th className="py-2.5 px-3">Loại phiếu</th>
              <th className="py-2.5 px-3">Đối tác</th>
              <th className="py-2.5 px-3 text-right">Số tiền</th>
              <th className="py-2.5 px-3">Hình thức</th>
              <th className="py-2.5 px-3">Liên kết hóa đơn</th>
              <th className="py-2.5 px-3">Người lập</th>
              <th className="py-2.5 px-3">Ghi chú</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-[11px] text-gray-700">
            {filteredSlips.map((slip) => {
              const date = new Date(slip.createdAt).toLocaleString("vi-VN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <tr key={slip.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2 px-3 font-mono font-bold text-slate-800">{slip.code}</td>
                  <td className="py-2 px-3 text-gray-500">{date}</td>
                  <td className="py-2 px-3">
                    {slip.type === "RECEIPT" ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-100">
                        Phiếu thu
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 font-bold border border-rose-100">
                        Phiếu chi
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    <div className="font-semibold text-gray-900">{slip.partner?.name || "N/A"}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{slip.partner?.code || "N/A"}</div>
                  </td>
                  <td
                    className={`py-2 px-3 text-right font-extrabold text-sm ${
                      slip.type === "RECEIPT" ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {slip.type === "RECEIPT" ? "+" : "-"} {Number(slip.amount).toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2 px-3 font-medium text-gray-600">
                    {slip.paymentMethod === "CASH"
                      ? "Tiền mặt"
                      : slip.paymentMethod === "BANK_TRANSFER"
                      ? "Chuyển khoản"
                      : slip.paymentMethod}
                  </td>
                  <td className="py-2 px-3">
                    {slip.receipt ? (
                      <div className="text-gray-800">
                        <span className="text-gray-400">Nhập: </span>
                        <span className="font-mono font-semibold">
                          {slip.receipt.invoiceNumber || slip.receipt.code}
                        </span>
                      </div>
                    ) : slip.export ? (
                      <div className="text-gray-800">
                        <span className="text-gray-400">Xuất: </span>
                        <span className="font-mono font-semibold">{slip.export.code}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">FIFO (Tự động)</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-gray-600">{slip.createdByUser?.name || "N/A"}</td>
                  <td className="py-2 px-3 text-gray-500 max-w-[200px] truncate" title={slip.note}>
                    {slip.note || <span className="text-gray-300 italic">Không có</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
