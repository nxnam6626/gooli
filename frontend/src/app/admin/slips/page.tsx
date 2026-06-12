"use client";

import React, { useState, useEffect } from "react";
import { 
  getSlips, 
  createSlip, 
  getPartners, 
  getReceipts, 
  getExports 
} from "../../../services/api";
import { Plus, X, Coins, ArrowRight, Funnel } from "@phosphor-icons/react";

interface Partner {
  id: number;
  code: string;
  name: string;
  type: "CUSTOMER" | "SUPPLIER";
  totalDebt: number;
}

interface Receipt {
  id: number;
  code: string;
  invoiceNumber: string;
  postTaxTotal: number;
  paidAmount: number;
  paymentStatus: string;
  partnerId: number;
  createdAt: string;
}

interface Export {
  id: number;
  code: string;
  postTaxTotal: number;
  paidAmount: number;
  paymentStatus: string;
  partnerId: number;
  createdAt: string;
}

interface Slip {
  id: number;
  code: string;
  type: "RECEIPT" | "PAYMENT";
  amount: number;
  paymentMethod: string;
  note?: string;
  createdAt: string;
  partner: Partner;
  receipt?: Receipt;
  export?: Export;
  createdByUser?: {
    name: string;
    email: string;
  };
}

export default function SlipsPage() {
  const [slips, setSlips] = useState<Slip[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [exports, setExports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [searchPartner, setSearchPartner] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form states
  const [formType, setFormType] = useState<"RECEIPT" | "PAYMENT">("RECEIPT");
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | "">("");
  const [linkType, setLinkType] = useState<"FIFO" | "DIRECT">("FIFO");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | "">("");
  const [amount, setAmount] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [note, setNote] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("gooli_token") || "" : "";

  const loadData = async () => {
    setLoading(true);
    try {
      const [slipsData, partnersData, receiptsData, exportsData] = await Promise.all([
        getSlips(token),
        getPartners(token, { limit: 100 }),
        getReceipts(token),
        getExports(token)
      ]);
      setSlips(slipsData);
      setPartners(partnersData.items || []);
      setReceipts(receiptsData || []);
      setExports(exportsData || []);
    } catch (error) {
      console.error("Lỗi tải dữ liệu thu/chi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  // Filter partners by type depending on slip type chosen in form
  const filteredPartnersForForm = partners.filter(p => 
    formType === "RECEIPT" ? p.type === "CUSTOMER" : p.type === "SUPPLIER"
  );

  // Filter invoices for direct linking
  const availableInvoices = React.useMemo(() => {
    if (!selectedPartnerId) return [];
    if (formType === "RECEIPT") {
      // Show exports of this customer
      return exports.filter(e => e.partnerId === selectedPartnerId && e.paymentStatus !== "PAID");
    } else {
      // Show receipts of this supplier
      return receipts.filter(r => r.partnerId === selectedPartnerId && r.paymentStatus !== "PAID");
    }
  }, [selectedPartnerId, formType, receipts, exports]);

  // Compute remaining debt of selected invoice
  const selectedInvoiceDebt = React.useMemo(() => {
    if (!selectedInvoiceId) return 0;
    if (formType === "RECEIPT") {
      const exp = exports.find(e => e.id === selectedInvoiceId);
      return exp ? Number(exp.postTaxTotal) - Number(exp.paidAmount) : 0;
    } else {
      const rec = receipts.find(r => r.id === selectedInvoiceId);
      return rec ? Number(rec.postTaxTotal) - Number(rec.paidAmount) : 0;
    }
  }, [selectedInvoiceId, formType, receipts, exports]);

  // Handle invoice selection change
  useEffect(() => {
    setSelectedInvoiceId("");
    setAmount("");
  }, [selectedPartnerId, formType, linkType]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    if (!selectedPartnerId) {
      setErrorMsg("Vui lòng chọn đối tác.");
      setSubmitting(false);
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setErrorMsg("Số tiền phải lớn hơn 0.");
      setSubmitting(false);
      return;
    }

    if (linkType === "DIRECT" && !selectedInvoiceId) {
      setErrorMsg("Vui lòng chọn hóa đơn cần cấn trừ.");
      setSubmitting(false);
      return;
    }

    if (linkType === "DIRECT" && Number(amount) > selectedInvoiceDebt) {
      setErrorMsg(`Số tiền cấn trừ vượt quá dư nợ còn lại của hóa đơn (${selectedInvoiceDebt.toLocaleString("vi-VN")} đ).`);
      setSubmitting(false);
      return;
    }

    const payload: any = {
      type: formType,
      partnerId: Number(selectedPartnerId),
      amount: Number(amount),
      paymentMethod,
      note: note.trim() || undefined,
    };

    if (linkType === "DIRECT") {
      if (formType === "RECEIPT") {
        payload.exportId = Number(selectedInvoiceId);
      } else {
        payload.receiptId = Number(selectedInvoiceId);
      }
    }

    try {
      await createSlip(payload, token);
      setShowModal(false);
      // Reset form
      setSelectedPartnerId("");
      setSelectedInvoiceId("");
      setAmount("");
      setNote("");
      // Refresh list
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Tạo phiếu thu/chi thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSlips = slips.filter(slip => {
    const typeMatch = typeFilter === "ALL" || slip.type === typeFilter;
    const partnerMatch = !searchPartner || 
      slip.partner.name.toLowerCase().includes(searchPartner.toLowerCase()) ||
      slip.partner.code.toLowerCase().includes(searchPartner.toLowerCase());
    return typeMatch && partnerMatch;
  });

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Coins size={20} className="text-slate-700" />
            Quản lý Sổ quỹ & Phiếu thu/chi
          </h1>
          <p className="text-gray-500 mt-0.5 text-[11px]">Theo dõi dòng tiền thu chi trực tiếp hoặc gối đầu FIFO</p>
        </div>
        <button
          onClick={() => {
            setErrorMsg("");
            setShowModal(true);
          }}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded flex items-center gap-1.5 cursor-pointer transition-all shadow-sm text-[11px]"
        >
          <Plus size={14} weight="bold" />
          Lập phiếu Thu/Chi
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-1.5">
          <Funnel size={14} className="text-gray-400" />
          <span className="font-semibold text-gray-600">Bộ lọc:</span>
        </div>
        
        <div className="flex rounded-md border border-gray-300 overflow-hidden">
          <button
            onClick={() => setTypeFilter("ALL")}
            className={`px-3 py-1 font-semibold ${typeFilter === "ALL" ? "bg-slate-100 text-slate-800" : "bg-white text-gray-600 hover:bg-gray-50"}`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setTypeFilter("RECEIPT")}
            className={`px-3 py-1 font-semibold border-l border-gray-300 ${typeFilter === "RECEIPT" ? "bg-emerald-50 text-emerald-800" : "bg-white text-gray-600 hover:bg-gray-50"}`}
          >
            Phiếu thu (Thu tiền)
          </button>
          <button
            onClick={() => setTypeFilter("PAYMENT")}
            className={`px-3 py-1 font-semibold border-l border-gray-300 ${typeFilter === "PAYMENT" ? "bg-rose-50 text-rose-800" : "bg-white text-gray-600 hover:bg-gray-50"}`}
          >
            Phiếu chi (Chi tiền)
          </button>
        </div>

        <input
          type="text"
          placeholder="Tìm đối tác (tên, mã)..."
          value={searchPartner}
          onChange={(e) => setSearchPartner(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 w-64 bg-gray-50"
        />
      </div>

      {/* List Table */}
      {loading ? (
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center font-semibold text-gray-500">
          Đang tải danh sách phiếu thu/chi...
        </div>
      ) : filteredSlips.length === 0 ? (
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-400">
          Không có phiếu thu/chi nào phù hợp bộ lọc.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
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
                  minute: "2-digit"
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
                      <div className="font-semibold text-gray-900">{slip.partner.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{slip.partner.code}</div>
                    </td>
                    <td className={`py-2 px-3 text-right font-extrabold text-sm ${slip.type === "RECEIPT" ? "text-emerald-600" : "text-rose-600"}`}>
                      {slip.type === "RECEIPT" ? "+" : "-"} {Number(slip.amount).toLocaleString("vi-VN")} đ
                    </td>
                    <td className="py-2 px-3 font-medium text-gray-600">
                      {slip.paymentMethod === "CASH" ? "Tiền mặt" : 
                       slip.paymentMethod === "BANK_TRANSFER" ? "Chuyển khoản" : slip.paymentMethod}
                    </td>
                    <td className="py-2 px-3">
                      {slip.receipt ? (
                        <div className="text-gray-800">
                          <span className="text-gray-400">Nhập: </span>
                          <span className="font-mono font-semibold">{slip.receipt.invoiceNumber || slip.receipt.code}</span>
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
      )}

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
              <h2 className="text-sm font-extrabold flex items-center gap-1.5">
                <Coins size={18} />
                Lập phiếu Thu / Chi mới
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
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
                    className={`py-2 rounded font-bold transition-all border ${formType === "RECEIPT" ? "bg-emerald-50 text-emerald-800 border-emerald-500 shadow-sm" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 col-span-1"}`}
                  >
                    Phiếu Thu (Thu tiền khách)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormType("PAYMENT");
                      setSelectedPartnerId("");
                    }}
                    className={`py-2 rounded font-bold transition-all border ${formType === "PAYMENT" ? "bg-rose-50 text-rose-800 border-rose-500 shadow-sm" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 col-span-1"}`}
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
                  className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:outline-none"
                  required
                >
                  <option value="">-- Chọn đối tác --</option>
                  {filteredPartnersForForm.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Nợ hiện tại: {Number(p.totalDebt).toLocaleString("vi-VN")} đ)
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Link Method */}
              <div>
                <label className="block text-gray-600 font-bold mb-1.5">Phương thức đối soát công nợ</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLinkType("FIFO")}
                    className={`py-2 rounded font-semibold transition-all border ${linkType === "FIFO" ? "bg-slate-100 text-slate-800 border-slate-400 shadow-sm" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}
                  >
                    Tự động phân bổ gối đầu (FIFO)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLinkType("DIRECT")}
                    className={`py-2 rounded font-semibold transition-all border ${linkType === "DIRECT" ? "bg-slate-100 text-slate-800 border-slate-400 shadow-sm" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}
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
                          const inv = availableInvoices.find(item => item.id === id);
                          if (inv) {
                            const debt = Number(inv.postTaxTotal) - Number(inv.paidAmount);
                            setAmount(debt);
                          }
                        } else {
                          setAmount("");
                        }
                      }}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:outline-none"
                      required
                    >
                      <option value="">-- Chọn hóa đơn --</option>
                      {availableInvoices.map(inv => {
                        const invCode = (inv as any).invoiceNumber || inv.code;
                        const unpaid = Number(inv.postTaxTotal) - Number(inv.paidAmount);
                        return (
                          <option key={inv.id} value={inv.id}>
                            {invCode} - Giá trị: {Number(inv.postTaxTotal).toLocaleString("vi-VN")} đ (Còn nợ: {unpaid.toLocaleString("vi-VN")} đ)
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
                  className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:outline-none"
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
                  className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:outline-none h-16"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-600 font-bold rounded cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting || (linkType === "DIRECT" && !selectedInvoiceId)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded flex items-center gap-1 cursor-pointer"
                >
                  {submitting ? "Đang xử lý..." : "Xác nhận tạo"}
                  <ArrowRight size={14} weight="bold" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
