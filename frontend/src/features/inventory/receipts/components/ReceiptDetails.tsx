import React from 'react';
import { Printer } from '@phosphor-icons/react';
import { Receipt } from '../hooks/useReceiptAdmin';

interface ReceiptDetailsProps {
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

export default function ReceiptDetails({
  selectedReceipt,
  setSelectedReceipt,
  actionId,
  handleAction,
  perms,
}: ReceiptDetailsProps) {
  if (!selectedReceipt) return null;

  const fmt = (n: number | string) => Number(n).toLocaleString('vi-VN');
  const fmtDate = (s: string | null) =>
    s ? new Date(s).toLocaleDateString('vi-VN') : '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
      <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-xl relative text-xs font-semibold text-slate-700 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span>
              Chi tiết phiếu nhập:{' '}
              <span className="font-mono text-[#2563eb]">
                {selectedReceipt.code}
              </span>
            </span>
            <span
              className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full border ${
                STATUS_MAP[selectedReceipt.status]?.color ||
                'bg-slate-100 text-slate-600'
              }`}
            >
              {STATUS_MAP[selectedReceipt.status]?.label ||
                selectedReceipt.status}
            </span>
          </h2>
          <button
            onClick={() => setSelectedReceipt(null)}
            className="w-6 h-6 rounded-full hover:bg-slate-200/50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Summary & Metadata */}
            <div className="lg:col-span-4 space-y-3.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none">
                Thông tin hóa đơn
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-2xs">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold">
                    Tổng trước thuế:
                  </span>
                  <span className="font-mono text-slate-900 font-extrabold">
                    {selectedReceipt.preTaxTotal
                      ? fmt(selectedReceipt.preTaxTotal) + 'đ'
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-2.5">
                  <span className="text-slate-400 font-semibold">
                    Đã thanh toán:
                  </span>
                  <span className="font-mono text-emerald-600 font-extrabold">
                    {selectedReceipt.paidAmount
                      ? fmt(selectedReceipt.paidAmount) + 'đ'
                      : '0đ'}
                  </span>
                </div>
                <div className="flex justify-between items-start text-xs border-t border-slate-100 pt-2.5">
                  <span className="text-slate-400 font-semibold">
                    Hóa đơn / Ngày:
                  </span>
                  <span className="font-mono text-slate-800 text-right font-semibold">
                    {selectedReceipt.invoiceNumber ? (
                      <>
                        <div className="font-extrabold text-slate-900">
                          {selectedReceipt.invoiceNumber}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {fmtDate(selectedReceipt.invoiceDate)}
                        </div>
                      </>
                    ) : (
                      '—'
                    )}
                  </span>
                </div>
              </div>

              {selectedReceipt.note && (
                <div className="bg-amber-50/35 border border-amber-100/50 p-3.5 rounded-xl text-xs text-slate-700 space-y-1">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block select-none">
                    Ghi chú
                  </span>
                  <p className="font-medium leading-relaxed">
                    {selectedReceipt.note}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Goods Details */}
            <div className="lg:col-span-8 space-y-3.5">
              <div className="text-[11px] font-bold text-[#2563eb] uppercase tracking-wider select-none">
                Chi tiết hàng hóa trong phiếu
              </div>
              {selectedReceipt.items.length > 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-extrabold select-none">
                          <th className="py-2.5 px-4 text-left">Tên hàng</th>
                          <th className="py-2.5 px-4 text-right w-24">
                            Số lượng
                          </th>
                          <th className="py-2.5 px-4 text-right w-28">
                            Đơn giá
                          </th>
                          <th className="py-2.5 px-4 text-right w-16">VAT</th>
                          <th className="py-2.5 px-4 text-right w-28">
                            Thành tiền
                          </th>
                          <th className="py-2.5 px-4 text-center w-28">
                            Phân loại
                          </th>
                          <th className="py-2.5 px-4 text-center w-20">
                            Thao tác
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedReceipt.items.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="py-2.5 px-4 font-semibold text-slate-900">
                              {item.product?.name ?? `ID ${item.productId}`}
                            </td>
                            <td className="py-2.5 px-4 text-right text-slate-700 font-mono font-bold">
                              {item.quantity} {item.product?.unit ?? ''}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                              {fmt(item.price)}đ
                            </td>
                            <td className="py-2.5 px-4 text-right text-slate-500 font-mono">
                              {item.vatRate ?? 10}%
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-black text-slate-900">
                              {fmt(item.quantity * item.price)}đ
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              {item.isFaulty ? (
                                <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[9px] font-extrabold uppercase tracking-wider rounded-full border border-rose-100">
                                  Hàng lỗi
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-extrabold uppercase tracking-wider rounded-full border border-emerald-100">
                                  Đạt chuẩn
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <button
                                onClick={() =>
                                  alert(
                                    `Đang chuẩn bị lệnh in mã vạch cho sản phẩm: ${item.product?.name || item.productId} (SKU: ${item.product?.sku || 'N/A'})`,
                                  )
                                }
                                className="inline-flex items-center justify-center p-1 bg-blue-50 hover:bg-blue-100 text-[#2563eb] rounded-lg border border-blue-200/50 transition-colors cursor-pointer"
                                title="In tem nhãn"
                              >
                                <Printer size={14} weight="bold" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-400 italic">
                  Không có chi tiết hàng hóa nào.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-between items-center border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            Ngày tạo:{' '}
            {selectedReceipt.createdAt
              ? new Date(selectedReceipt.createdAt).toLocaleString('vi-VN')
              : '—'}
          </div>
          <div className="flex gap-3">
            {selectedReceipt.status === 'PENDING' && perms.approve_bills && (
              <>
                <button
                  onClick={() => {
                    handleAction(selectedReceipt.id, 'approve');
                    setSelectedReceipt(null);
                  }}
                  disabled={actionId === selectedReceipt.id}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer disabled:opacity-50 text-xs shadow-sm transition-colors"
                >
                  Duyệt phiếu
                </button>
                <button
                  onClick={() => {
                    handleAction(selectedReceipt.id, 'reject');
                    setSelectedReceipt(null);
                  }}
                  disabled={actionId === selectedReceipt.id}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer disabled:opacity-50 text-xs shadow-sm transition-colors"
                >
                  Từ chối
                </button>
              </>
            )}
            <button
              onClick={() => setSelectedReceipt(null)}
              className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl font-bold cursor-pointer text-xs transition-colors shadow-2xs"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
