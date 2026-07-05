import React from 'react';
import { CircleNotch, DotsThreeVertical } from '@phosphor-icons/react';
import { Receipt, ReceiptItem } from '../hooks/useReceiptAdmin';

interface ReceiptTableProps {
  loading: boolean;
  filteredReceipts: Receipt[];
  selectedReceipt: Receipt | null;
  setSelectedReceipt: (r: Receipt | null) => void;
  actionId: number | null;
  handleAction: (id: number, action: 'approve' | 'reject') => void;
  perms: Record<string, boolean>;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  APPROVED: {
    label: 'Hoàn thành',
    color: 'bg-emerald-50 text-emerald-700 border border-emerald-200/30',
  },
  PENDING: {
    label: 'Đang xử lý',
    color: 'bg-amber-50 text-amber-700 border border-amber-200/30',
  },
  REJECTED: {
    label: 'Đã hủy',
    color: 'bg-rose-50 text-rose-700 border border-rose-200/30',
  },
};

export default function ReceiptTable({
  loading,
  filteredReceipts,
  selectedReceipt,
  setSelectedReceipt,
  actionId,
  handleAction,
  perms,
}: ReceiptTableProps) {
  const fmt = (n: number | string) => Number(n).toLocaleString('vi-VN');
  const totalQty = (items: ReceiptItem[]) =>
    items.reduce((s, i) => s + i.quantity, 0);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs relative p-12 text-center text-slate-400">
        <div className="flex justify-center items-center gap-2">
          <CircleNotch size={18} className="animate-spin text-[#2563eb]" />
          <span>Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  if (filteredReceipts.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs relative p-12 text-center text-slate-400">
        Không tìm thấy phiếu nhập kho nào.
      </div>
    );
  }

  return (
    <div className="bg-white shadow-[0_4px_20px_rgba(15,23,42,0.02)] border border-slate-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-6 py-3.5 font-bold text-[10px] uppercase tracking-wider">
                Số phiếu
              </th>
              <th className="px-6 py-3.5 font-bold text-[10px] uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-6 py-3.5 font-bold text-[10px] uppercase tracking-wider">
                Ngày dự kiến
              </th>
              <th className="px-6 py-3.5 font-bold text-[10px] uppercase tracking-wider">
                Nhà cung cấp
              </th>
              <th className="px-6 py-3.5 font-bold text-[10px] uppercase tracking-wider text-right">
                Số lượng
              </th>
              <th className="px-6 py-3.5 font-bold text-[10px] uppercase tracking-wider text-right">
                Tổng tiền
              </th>
              <th className="px-6 py-3.5 font-bold text-[10px] uppercase tracking-wider text-center">
                Trạng thái
              </th>
              <th className="px-6 py-3.5 font-bold text-[10px] uppercase tracking-wider text-center">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredReceipts.map((r) => {
              const st = STATUS_MAP[r.status] ?? {
                label: r.status,
                color: 'bg-slate-100 text-slate-600',
              };
              const isSelected = selectedReceipt?.id === r.id;
              return (
                <tr
                  key={r.id}
                  className={`hover:bg-blue-50/10 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/25' : ''}`}
                  onClick={() => setSelectedReceipt(r)}
                >
                  {/* Code */}
                  <td className="px-6 py-3.5 font-mono font-bold text-[#2563eb] text-xs">
                    {r.code}
                  </td>

                  {/* Created Date */}
                  <td className="px-6 py-3.5 text-slate-500 text-xs">
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </td>

                  {/* Expected Date */}
                  <td className="px-6 py-3.5 text-slate-700 font-semibold text-xs">
                    {r.status === 'APPROVED'
                      ? r.approvedAt
                        ? new Date(r.approvedAt).toLocaleDateString('vi-VN')
                        : 'Đã nhận'
                      : r.status === 'PENDING'
                        ? r.expectedDeliveryDate
                          ? new Date(r.expectedDeliveryDate).toLocaleDateString(
                              'vi-VN',
                            )
                          : (() => {
                              const d = new Date(r.createdAt);
                              d.setDate(d.getDate() + 1);
                              return d.toLocaleDateString('vi-VN');
                            })()
                        : '—'}
                  </td>

                  {/* Supplier */}
                  <td className="px-6 py-3.5 text-slate-700 font-semibold flex items-center gap-2">
                    {r.partner ? (
                      <>
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
                            r.partner.id % 3 === 0
                              ? 'bg-blue-500'
                              : r.partner.id % 3 === 1
                                ? 'bg-amber-500'
                                : 'bg-slate-500'
                          }`}
                        >
                          {r.partner.name
                            .split(' ')
                            .map((w) => w[0])
                            .join('')
                            .substring(0, 2)
                            .toUpperCase()}
                        </span>
                        <span title={r.partner.code}>{r.partner.name}</span>
                      </>
                    ) : (
                      <span className="text-slate-400 italic font-normal">
                        —
                      </span>
                    )}
                  </td>

                  {/* Qty */}
                  <td className="px-6 py-3.5 text-right font-bold text-slate-800">
                    {totalQty(r.items)}
                  </td>

                  {/* Total money */}
                  <td className="px-6 py-3.5 text-right font-mono font-bold text-slate-800">
                    {r.postTaxTotal ? fmt(r.postTaxTotal) + 'đ' : '—'}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-3.5 text-center">
                    <span
                      className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full border ${st.color}`}
                    >
                      {st.label}
                    </span>
                  </td>

                  {/* Action dot menu */}
                  <td
                    className="px-6 py-3.5 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex gap-1.5 justify-center items-center">
                      {r.status === 'PENDING' && perms.approve_bills ? (
                        <>
                          <button
                            onClick={() => handleAction(r.id, 'approve')}
                            disabled={actionId === r.id}
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-emerald-200/50"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleAction(r.id, 'reject')}
                            disabled={actionId === r.id}
                            className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-rose-200/50"
                          >
                            Từ chối
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setSelectedReceipt(r)}
                          className="p-1 border border-slate-200 text-slate-500 hover:text-[#2563eb] hover:bg-blue-50 bg-white rounded-lg transition-all cursor-pointer"
                        >
                          <DotsThreeVertical size={16} />
                        </button>
                      )}
                    </div>
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
