"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ListDashes } from "@phosphor-icons/react";

interface Receipt {
  id: number;
  code: string;
  status: string;
  note: string | null;
  createdAt: string;
  items: any[];
  invoiceNumber?: string | null;
  invoiceDate?: string | null;
  preTaxTotal?: number;
  postTaxTotal?: number;
}

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const token = localStorage.getItem("gooli_token");
        const response = await fetch("http://localhost:3001/api/v1/receipts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setReceipts(data);
        }
      } catch (error) {
        console.error("Error fetching receipts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
          <ListDashes size={28} className="text-[#B06518]" />
          Phiếu Nhập Kho
        </h1>
        <div className="flex gap-3">
          <Link
            href="/admin/receipts/import"
            className="flex items-center gap-2 border border-[#B06518] text-[#B06518] hover:bg-amber-50 px-4 py-2 rounded-sm text-sm font-semibold transition-colors"
          >
            Nhập hàng từ Excel
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

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Mã Phiếu</th>
              <th className="px-4 py-3 font-semibold">Số hóa đơn</th>
              <th className="px-4 py-3 font-semibold text-right">Tổng trước thuế</th>
              <th className="px-4 py-3 font-semibold text-right">Tổng sau thuế (VAT)</th>
              <th className="px-4 py-3 font-semibold">Ngày tạo</th>
              <th className="px-4 py-3 font-semibold">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : receipts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                  Chưa có phiếu nhập kho nào.
                </td>
              </tr>
            ) : (
              receipts.map((receipt) => (
                <tr key={receipt.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">
                    {receipt.code}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400 font-semibold">
                    {receipt.invoiceNumber || "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-neutral-700 dark:text-neutral-300">
                    {receipt.preTaxTotal ? Number(receipt.preTaxTotal).toLocaleString("vi-VN") + "đ" : "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                    {receipt.postTaxTotal ? Number(receipt.postTaxTotal).toLocaleString("vi-VN") + "đ" : "-"}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                    {new Date(receipt.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-sm ${
                      receipt.status === "APPROVED" 
                        ? "bg-emerald-100 text-emerald-700" 
                        : receipt.status === "PENDING"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {receipt.status === "APPROVED" ? "Đã nhập kho" : receipt.status}
                    </span>
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
