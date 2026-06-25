import React from "react";
import { Coins, X, ArrowRight } from "@phosphor-icons/react";
import type { Partner, Receipt, Export } from "../hooks/useFinanceAdmin";

interface SlipFormProps {
  showModal: boolean;
  setShowModal: (s: boolean) => void;
  errorMsg: string;
  submitting: boolean;
  formType: "RECEIPT" | "PAYMENT";
  setFormType: (type: "RECEIPT" | "PAYMENT") => void;
  selectedPartnerId: number | "";
  setSelectedPartnerId: (id: number | "") => void;
  linkType: "FIFO" | "DIRECT";
  setLinkType: (type: "FIFO" | "DIRECT") => void;
  selectedInvoiceId: number | "";
  setSelectedInvoiceId: (id: number | "") => void;
  amount: number | "";
  setAmount: (val: number | "") => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  note: string;
  setNote: (note: string) => void;
  filteredPartnersForForm: Partner[];
  availableInvoices: (Receipt | Export)[];
  selectedInvoiceDebt: number;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export default function SlipForm({
  showModal,
  setShowModal,
  errorMsg,
  submitting,
  formType,
  setFormType,
  selectedPartnerId,
  setSelectedPartnerId,
  linkType,
  setLinkType,
  selectedInvoiceId,
  setSelectedInvoiceId,
  amount,
  setAmount,
  paymentMethod,
  setPaymentMethod,
  note,
  setNote,
  filteredPartnersForForm,
  availableInvoices,
  selectedInvoiceDebt,
  handleSubmit,
}: SlipFormProps) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden transform transition-all text-xs">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
          <h2 className="text-sm font-extrabold flex items-center gap-1.5">
            <Coins size={18} />
            Lập phiếu Thu / Chi mới
          </h2>
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer border-none bg-transparent outline-none"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="bg-rose-50 text-rose-800 p-2.5 rounded border border-rose-200 font-semibold">
              {errorMsg}
            </div>
          )}

          {/* 1. Slip Type */}
          <div>
            <label className="block text-gray-600 font-bold mb-1.5">Loại chứng từ</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setFormType("RECEIPT");
                  setSelectedPartnerId("");
                }}
                className={`py-2 rounded font-bold transition-all border cursor-pointer ${
                  formType === "RECEIPT"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-500 shadow-sm"
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                }`}
              >
                Phiếu Thu (Thu tiền khách)
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormType("PAYMENT");
                  setSelectedPartnerId("");
                }}
                className={`py-2 rounded font-bold transition-all border cursor-pointer ${
                  formType === "PAYMENT"
                    ? "bg-rose-50 text-rose-800 border-rose-500 shadow-sm"
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                }`}
              >
                Phiếu Chi (Trả tiền NCC)
              </button>
            </div>
          </div>

          {/* 2. Partner */}
          <div>
            <label className="block text-gray-600 font-bold mb-1">
              {formType === "RECEIPT" ? "Khách hàng (CUSTOMER)" : "Nhà cung cấp (SUPPLIER)"}
            </label>
            <select
              value={selectedPartnerId}
              onChange={(e) => setSelectedPartnerId(e.target.value ? Number(e.target.value) : "")}
              className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:outline-none bg-white text-slate-800"
              required
            >
              <option value="">-- Chọn đối tác --</option>
              {filteredPartnersForForm.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Nợ hiện tại: {Number(p.totalDebt).toLocaleString("vi-VN")} đ)
                </option>
              ))}
            </select>
          </div>

          {/* 3. Link Method */}
          <div>
            <label className="block text-gray-600 font-bold mb-1.5">
              Phương thức đối soát công nợ
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLinkType("FIFO")}
                className={`py-2 rounded font-semibold transition-all border cursor-pointer ${
                  linkType === "FIFO"
                    ? "bg-slate-100 text-slate-800 border-slate-400 shadow-sm"
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                }`}
              >
                Tự động phân bổ gối đầu (FIFO)
              </button>
              <button
                type="button"
                onClick={() => setLinkType("DIRECT")}
                className={`py-2 rounded font-semibold transition-all border cursor-pointer ${
                  linkType === "DIRECT"
                    ? "bg-slate-100 text-slate-800 border-slate-400 shadow-sm"
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                }`}
              >
                Thanh toán đích danh hóa đơn
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1 italic">
              {linkType === "FIFO"
                ? "Hệ thống tự động trừ nợ cho các hóa đơn chưa trả cũ nhất trở về sau."
                : "Chọn trực tiếp 1 hóa đơn chưa thanh toán để cấn trừ cụ thể."}
            </p>
          </div>

          {/* 4. Direct Link Dropdown (Conditional) */}
          {linkType === "DIRECT" && selectedPartnerId && (
            <div>
              <label className="block text-gray-600 font-bold mb-1">Hóa đơn cần thanh toán</label>
              {availableInvoices.length === 0 ? (
                <div className="p-2 bg-yellow-50 text-yellow-800 rounded border border-yellow-100 font-medium">
                  Đối tác này hiện không có hóa đơn chưa thanh toán nào.
                </div>
              ) : (
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => {
                    const id = e.target.value ? Number(e.target.value) : "";
                    setSelectedInvoiceId(id);
                    if (id) {
                      const inv = availableInvoices.find((item) => item.id === id);
                      if (inv) {
                        const debt = Number(inv.postTaxTotal) - Number(inv.paidAmount);
                        setAmount(debt);
                      }
                    } else {
                      setAmount("");
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:outline-none bg-white text-slate-800"
                  required
                >
                  <option value="">-- Chọn hóa đơn --</option>
                  {availableInvoices.map((inv) => {
                    const invCode = "invoiceNumber" in inv ? inv.invoiceNumber : inv.code;
                    const unpaid = Number(inv.postTaxTotal) - Number(inv.paidAmount);
                    return (
                      <option key={inv.id} value={inv.id}>
                        {invCode} - Giá trị: {Number(inv.postTaxTotal).toLocaleString("vi-VN")} đ
                        (Còn nợ: {unpaid.toLocaleString("vi-VN")} đ)
                      </option>
                    );
                  })}
                </select>
              )}
            </div>
          )}

          {/* 5. Amount */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-gray-600 font-bold">Số tiền thanh toán (đ)</label>
              {linkType === "DIRECT" && selectedInvoiceId && (
                <span className="text-[10px] text-slate-500 font-semibold">
                  Dư nợ hóa đơn tối đa: {selectedInvoiceDebt.toLocaleString("vi-VN")} đ
                </span>
              )}
            </div>
            <input
              type="number"
              placeholder="Ví dụ: 5000000"
              value={amount}
              onChange={(e) => setAmount(e.target.value !== "" ? Number(e.target.value) : "")}
              className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:outline-none font-bold text-slate-900 bg-gray-50"
              required
            />
          </div>

          {/* 6. Payment Method */}
          <div>
            <label className="block text-gray-600 font-bold mb-1">Hình thức thanh toán</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:outline-none bg-white text-slate-800"
              required
            >
              <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
              <option value="CASH">Tiền mặt</option>
            </select>
          </div>

          {/* 7. Note */}
          <div>
            <label className="block text-gray-600 font-bold mb-1">Ghi chú phiếu</label>
            <textarea
              placeholder="Ghi chú nội dung thu chi..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2 border border-gray-350 rounded focus:ring-1 focus:ring-slate-500 focus:outline-none h-16"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-600 font-bold rounded cursor-pointer transition-colors bg-white"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting || (linkType === "DIRECT" && !selectedInvoiceId)}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded flex items-center gap-1 cursor-pointer transition-colors"
            >
              {submitting ? "Đang xử lý..." : "Xác nhận tạo"}
              <ArrowRight size={14} weight="bold" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
