import React from "react";
import { PencilSimple, Trash, ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import type { Partner } from "../../../types";

interface PartnerTableProps {
  partners: Partner[];
  loading: boolean;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  total: number;
  formatCurrency: (val: number | undefined) => string;
  handleEditOpen: (partner: Partner) => void;
  handleDelete: (id: number, name: string) => Promise<void>;
}

export default function PartnerTable({
  partners,
  loading,
  page,
  setPage,
  totalPages,
  total,
  formatCurrency,
  handleEditOpen,
  handleDelete,
}: PartnerTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
      {loading ? (
        <div className="text-center py-24 text-slate-400 font-semibold italic">
          Đang tải danh sách đối tác...
        </div>
      ) : partners.length === 0 ? (
        <div className="p-16 text-center text-slate-400 font-bold italic">
          Không tìm thấy đối tác nào khớp bộ lọc.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-semibold text-slate-700">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-extrabold select-none">
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 w-3.5 h-3.5 cursor-pointer text-[#2563eb] focus:ring-[#2563eb]/20"
                    readOnly
                  />
                </th>
                <th className="py-3 px-4">Mã đối tác</th>
                <th className="py-3 px-4">Tên đối tác</th>
                <th className="py-3 px-4">Nhóm đối tác</th>
                <th className="py-3 px-4">Số điện thoại</th>
                <th className="py-3 px-4">Công nợ hiện tại</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {partners.map((partner) => {
                const debt = Number(partner.totalDebt || 0);
                return (
                  <tr key={partner.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 w-3.5 h-3.5 cursor-pointer text-[#2563eb] focus:ring-[#2563eb]/20"
                        readOnly
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleEditOpen(partner)}
                        className="font-bold text-[#2563eb] hover:underline cursor-pointer"
                      >
                        {partner.code}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-slate-900 font-bold max-w-xs truncate">
                      {partner.name}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-600">
                      {partner.partnerGroup?.name ||
                        (partner.type === "SUPPLIER" ? "Nhà cung cấp" : "Khách hàng")}
                    </td>
                    <td className="py-3.5 px-4 font-bold font-mono text-slate-700">
                      {partner.phone || "-"}
                    </td>
                    <td
                      className={`py-3.5 px-4 font-bold font-mono ${
                        debt > 0 ? "text-rose-600" : "text-slate-500"
                      }`}
                    >
                      {formatCurrency(debt)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          partner.isActive
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-slate-100 border-slate-200 text-slate-600"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            partner.isActive ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                        <span>{partner.isActive ? "Đang hoạt động" : "Tạm dừng"}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditOpen(partner)}
                          className="p-1 text-[#2563eb] hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          title="Sửa thông tin"
                        >
                          <PencilSimple size={15} weight="bold" />
                        </button>
                        <button
                          onClick={() => handleDelete(partner.id, partner.name)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Xóa đối tác"
                        >
                          <Trash size={15} weight="bold" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION FOOTER */}
      {!loading && partners.length > 0 && (
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 text-slate-500 select-none text-[11px] font-bold">
          <span>
            Hiển thị {(page - 1) * 10 + 1} - {Math.min(page * 10, total)} của {total} đối tác
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
                className="p-1.5 border border-slate-300 rounded-lg hover:border-[#2563eb] hover:text-[#2563eb] disabled:opacity-30 disabled:border-slate-200 disabled:text-slate-300 bg-white transition-colors cursor-pointer"
              >
                <ArrowLeft size={12} weight="bold" />
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-7 h-7 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      page === pageNum
                        ? "bg-[#2563eb] text-white"
                        : "bg-white border border-slate-300 text-slate-700 hover:border-[#2563eb] hover:text-[#2563eb]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((prev) => prev + 1)}
                className="p-1.5 border border-slate-300 rounded-lg hover:border-[#2563eb] hover:text-[#2563eb] disabled:opacity-30 disabled:border-slate-200 disabled:text-slate-300 bg-white transition-colors cursor-pointer"
              >
                <ArrowRight size={12} weight="bold" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
