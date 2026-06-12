"use client";

import React, { useState, useEffect } from "react";
import {
  getCustomerReturns,
  getSupplierReturns,
  createCustomerReturn,
  createSupplierReturn,
  getPartners,
  getProducts,
  getReceipts,
  getExports
} from "../../../services/api";
import { Plus, X, ArrowCounterClockwise, ArrowRight, Funnel } from "@phosphor-icons/react";

interface Partner {
  id: number;
  code: string;
  name: string;
  type: "CUSTOMER" | "SUPPLIER";
  totalDebt: number;
}

interface Product {
  id: number;
  sku: string;
  name: string;
  unit: string;
  pricePerM2: number;
}

interface ReturnItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  vatRate: number;
  product: Product;
}

interface ReturnDoc {
  id: number;
  code: string;
  createdAt: string;
  preTaxTotal: number;
  postTaxTotal: number;
  note?: string;
  partner: Partner;
  items: ReturnItem[];
  createdByUser?: {
    name: string;
    email: string;
  };
}

export default function ReturnsPage() {
  const [activeTab, setActiveTab] = useState<"CUSTOMER" | "SUPPLIER">("CUSTOMER");
  const [customerReturns, setCustomerReturns] = useState<ReturnDoc[]>([]);
  const [supplierReturns, setSupplierReturns] = useState<ReturnDoc[]>([]);
  
  const [partners, setPartners] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [exports, setExports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"CUSTOMER" | "SUPPLIER">("CUSTOMER");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form states
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | "">("");
  const [selectedBillId, setSelectedBillId] = useState<number | "">("");
  const [note, setNote] = useState("");
  const [formItems, setFormItems] = useState<{ productId: number | ""; quantity: number; price: number; vatRate: number }[]>([
    { productId: "", quantity: 1, price: 0, vatRate: 10 }
  ]);

  const token = typeof window !== "undefined" ? localStorage.getItem("gooli_token") || "" : "";

  const loadData = async () => {
    setLoading(true);
    try {
      const [custData, suppData, partnersData, productsData, receiptsData, exportsData] = await Promise.all([
        getCustomerReturns(token),
        getSupplierReturns(token),
        getPartners(token, { limit: 100 }),
        getProducts({ limit: 100 }),
        getReceipts(token),
        getExports(token)
      ]);
      setCustomerReturns(custData);
      setSupplierReturns(suppData);
      setPartners(partnersData.items || []);
      setProducts(productsData.items || []);
      setReceipts(receiptsData || []);
      setExports(exportsData || []);
    } catch (error) {
      console.error("Lỗi tải dữ liệu trả hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  // Filter partners matching modalType
  const filteredPartnersForForm = partners.filter(p => 
    modalType === "CUSTOMER" ? p.type === "CUSTOMER" : p.type === "SUPPLIER"
  );

  // Filter linked documents (Exports for Customer Return, Receipts for Supplier Return)
  const availableBills = React.useMemo(() => {
    if (!selectedPartnerId) return [];
    if (modalType === "CUSTOMER") {
      return exports.filter(e => e.partnerId === selectedPartnerId);
    } else {
      return receipts.filter(r => r.partnerId === selectedPartnerId);
    }
  }, [selectedPartnerId, modalType, receipts, exports]);

  // Sync items when a linked bill is selected
  const handleBillChange = (billIdVal: number | "") => {
    setSelectedBillId(billIdVal);
    if (!billIdVal) {
      setFormItems([{ productId: "", quantity: 1, price: 0, vatRate: 10 }]);
      return;
    }

    if (modalType === "CUSTOMER") {
      const expBill = exports.find(e => e.id === billIdVal);
      if (expBill && expBill.items) {
        setFormItems(expBill.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: Number(item.price),
          vatRate: Number(item.vatRate ?? 10)
        })));
      }
    } else {
      const recBill = receipts.find(r => r.id === billIdVal);
      if (recBill && recBill.items) {
        setFormItems(recBill.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: Number(item.price),
          vatRate: Number(item.vatRate ?? 10)
        })));
      }
    }
  };

  // Add Item row in form
  const addItemRow = () => {
    setFormItems([...formItems, { productId: "", quantity: 1, price: 0, vatRate: 10 }]);
  };

  // Remove Item row
  const removeItemRow = (index: number) => {
    if (formItems.length === 1) return;
    setFormItems(formItems.filter((_, i) => i !== index));
  };

  // Handle Item property change
  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...formItems];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-fill price if productId changed and no bill is selected
    if (field === "productId" && value && !selectedBillId) {
      const prod = products.find(p => p.id === value);
      if (prod) {
        // Since pricePerM2 exists, use it or default
        updated[index].price = Number(prod.pricePerM2) || 0;
      }
    }
    setFormItems(updated);
  };

  // Calculate Form Totals
  const formTotals = React.useMemo(() => {
    let preTax = 0;
    let postTax = 0;
    for (const item of formItems) {
      if (!item.productId) continue;
      const subTotal = item.price * item.quantity;
      preTax += subTotal;
      postTax += subTotal * (1 + item.vatRate / 100);
    }
    return { preTax, postTax };
  }, [formItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    if (!selectedPartnerId) {
      setErrorMsg("Vui lòng chọn đối tác.");
      setSubmitting(false);
      return;
    }

    const itemsToSend = formItems.filter(item => item.productId !== "");
    if (itemsToSend.length === 0) {
      setErrorMsg("Vui lòng chọn ít nhất 1 sản phẩm để trả hàng.");
      setSubmitting(false);
      return;
    }

    const payload = {
      partnerId: Number(selectedPartnerId),
      note: note.trim() || undefined,
      exportId: modalType === "CUSTOMER" && selectedBillId ? Number(selectedBillId) : undefined,
      receiptId: modalType === "SUPPLIER" && selectedBillId ? Number(selectedBillId) : undefined,
      items: itemsToSend.map(it => ({
        productId: Number(it.productId),
        quantity: Number(it.quantity),
        price: Number(it.price),
        vatRate: Number(it.vatRate)
      }))
    };

    try {
      if (modalType === "CUSTOMER") {
        await createCustomerReturn(payload, token);
      } else {
        await createSupplierReturn(payload, token);
      }
      setShowModal(false);
      // Reset form
      setSelectedPartnerId("");
      setSelectedBillId("");
      setNote("");
      setFormItems([{ productId: "", quantity: 1, price: 0, vatRate: 10 }]);
      // Refresh list
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Lưu phiếu trả hàng thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentList = activeTab === "CUSTOMER" ? customerReturns : supplierReturns;

  const filteredList = currentList.filter(doc => {
    const query = searchQuery.toLowerCase();
    return !searchQuery || 
      doc.code.toLowerCase().includes(query) ||
      doc.partner.name.toLowerCase().includes(query) ||
      doc.partner.code.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <ArrowCounterClockwise size={20} className="text-slate-700 font-bold" />
            Nghiệp vụ Trả hàng & Hoàn trả
          </h1>
          <p className="text-gray-500 mt-0.5 text-[11px]">Quản lý khách hàng trả lại hàng hoặc xuất trả hàng lỗi cho nhà cung cấp</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setModalType("CUSTOMER");
              setErrorMsg("");
              setShowModal(true);
            }}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded flex items-center gap-1.5 cursor-pointer transition-all shadow-sm text-[11px]"
          >
            <Plus size={14} weight="bold" />
            Nhận khách trả hàng
          </button>
          <button
            onClick={() => {
              setModalType("SUPPLIER");
              setErrorMsg("");
              setShowModal(true);
            }}
            className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-600 text-white font-bold rounded flex items-center gap-1.5 cursor-pointer transition-all shadow-sm text-[11px]"
          >
            <Plus size={14} weight="bold" />
            Xuất trả NCC
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white p-1 rounded-t-lg shadow-sm">
        <button
          onClick={() => {
            setActiveTab("CUSTOMER");
            setSearchQuery("");
          }}
          className={`flex-1 py-2 text-center font-bold text-xs transition-colors rounded ${activeTab === "CUSTOMER" ? "bg-slate-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}
        >
          Khách hàng trả lại hàng (Nhập trả)
        </button>
        <button
          onClick={() => {
            setActiveTab("SUPPLIER");
            setSearchQuery("");
          }}
          className={`flex-1 py-2 text-center font-bold text-xs transition-colors rounded ${activeTab === "SUPPLIER" ? "bg-slate-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}
        >
          Xuất trả hàng nhà cung cấp (Xuất trả)
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
        <Funnel size={14} className="text-gray-400" />
        <span className="font-semibold text-gray-600">Tìm kiếm:</span>
        <input
          type="text"
          placeholder="Tìm theo số phiếu, đối tác..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 w-80 bg-gray-50 text-[11px]"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center font-semibold text-gray-500">
          Đang tải dữ liệu trả hàng...
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-400">
          Không tìm thấy phiếu hoàn trả nào.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Mã phiếu</th>
                <th className="py-2.5 px-3">Ngày lập</th>
                <th className="py-2.5 px-3">Đối tác</th>
                <th className="py-2.5 px-3 text-right">Tổng chưa thuế</th>
                <th className="py-2.5 px-3 text-right">Tổng có thuế (Giảm nợ)</th>
                <th className="py-2.5 px-3">Sản phẩm hoàn trả</th>
                <th className="py-2.5 px-3">Người tạo</th>
                <th className="py-2.5 px-3">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[11px] text-gray-700">
              {filteredList.map((doc) => {
                const date = new Date(doc.createdAt).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit"
                });

                return (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{doc.code}</td>
                    <td className="py-2.5 px-3 text-gray-500">{date}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-gray-900">{doc.partner.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{doc.partner.code}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-gray-600">
                      {Number(doc.preTaxTotal).toLocaleString("vi-VN")} đ
                    </td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-slate-900 bg-slate-50/50">
                      {Number(doc.postTaxTotal).toLocaleString("vi-VN")} đ
                    </td>
                    <td className="py-2.5 px-3 max-w-[220px]">
                      <div className="space-y-0.5">
                        {doc.items.map((item, index) => (
                          <div key={index} className="text-gray-600 truncate">
                            • {item.product.name} (x{item.quantity} {item.product.unit})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">{doc.createdByUser?.name || "N/A"}</td>
                    <td className="py-2.5 px-3 text-gray-500 max-w-[200px] truncate" title={doc.note}>
                      {doc.note || <span className="text-gray-300 italic">Không có</span>}
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
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
              <h2 className="text-sm font-extrabold flex items-center gap-1.5">
                <ArrowCounterClockwise size={18} className="font-bold" />
                {modalType === "CUSTOMER" 
                  ? "Tạo Phiếu Khách Hàng Trả Lại Hàng" 
                  : "Tạo Phiếu Xuất Trả Hàng Cho Nhà Cung Cấp"}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
              {errorMsg && (
                <div className="bg-rose-50 text-rose-800 p-2.5 rounded border border-rose-200 font-semibold">
                  {errorMsg}
                </div>
              )}

              {/* 1. Partner Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 font-bold mb-1">
                    {modalType === "CUSTOMER" ? "Khách hàng trả hàng" : "Nhà cung cấp nhận trả"}
                  </label>
                  <select
                    value={selectedPartnerId}
                    onChange={(e) => {
                      setSelectedPartnerId(e.target.value ? Number(e.target.value) : "");
                      setSelectedBillId("");
                    }}
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

                {/* 2. Bill Linking Selection */}
                <div>
                  <label className="block text-gray-600 font-bold mb-1">
                    {modalType === "CUSTOMER" ? "Liên kết phiếu xuất kho" : "Liên kết phiếu nhập kho"}
                  </label>
                  <select
                    value={selectedBillId}
                    onChange={(e) => handleBillChange(e.target.value ? Number(e.target.value) : "")}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:outline-none"
                    disabled={!selectedPartnerId}
                  >
                    <option value="">-- Tự chọn sản phẩm (Không liên kết) --</option>
                    {availableBills.map(bill => {
                      const code = bill.invoiceNumber || bill.code;
                      const total = Number(bill.postTaxTotal);
                      return (
                        <option key={bill.id} value={bill.id}>
                          {code} ({new Date(bill.createdAt).toLocaleDateString("vi-VN")} - Tổng: {total.toLocaleString("vi-VN")} đ)
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* 3. Items Selection Table */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-gray-600 font-bold">Danh sách mặt hàng trả lại</label>
                  {!selectedBillId && (
                    <button
                      type="button"
                      onClick={addItemRow}
                      className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5"
                    >
                      + Thêm sản phẩm
                    </button>
                  )}
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 p-2 space-y-2">
                  {formItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded border border-gray-200 shadow-sm">
                      {/* Product */}
                      <div className="flex-1">
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(idx, "productId", e.target.value ? Number(e.target.value) : "")}
                          className="w-full p-1.5 border border-gray-300 rounded text-[11px] focus:outline-none"
                          disabled={!!selectedBillId}
                          required
                        >
                          <option value="">-- Chọn sản phẩm --</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div className="w-16">
                        <input
                          type="number"
                          min="1"
                          placeholder="SL"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                          className="w-full p-1.5 border border-gray-300 rounded text-[11px] text-center focus:outline-none font-semibold"
                          required
                        />
                      </div>

                      {/* Price */}
                      <div className="w-24">
                        <input
                          type="number"
                          placeholder="Đơn giá"
                          value={item.price}
                          onChange={(e) => handleItemChange(idx, "price", Number(e.target.value))}
                          className="w-full p-1.5 border border-gray-300 rounded text-[11px] text-right focus:outline-none"
                          disabled={!!selectedBillId}
                          required
                        />
                      </div>

                      {/* VAT */}
                      <div className="w-16">
                        <select
                          value={item.vatRate}
                          onChange={(e) => handleItemChange(idx, "vatRate", Number(e.target.value))}
                          className="w-full p-1.5 border border-gray-300 rounded text-[11px] focus:outline-none"
                          disabled={!!selectedBillId}
                        >
                          <option value="10">10%</option>
                          <option value="8">8%</option>
                          <option value="5">5%</option>
                          <option value="0">0%</option>
                        </select>
                      </div>

                      {/* Total */}
                      <div className="w-28 text-right font-extrabold text-gray-700 text-[11px]">
                        {((item.price * item.quantity) * (1 + item.vatRate / 100)).toLocaleString("vi-VN")} đ
                      </div>

                      {/* Delete Action */}
                      {!selectedBillId && formItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                        >
                          <X size={14} weight="bold" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Notes & Summary */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-gray-600 font-bold mb-1">Ghi chú phiếu</label>
                  <textarea
                    placeholder="Ghi chú nguyên nhân trả hàng..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:outline-none h-20 text-[11px]"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col justify-center space-y-1.5">
                  <div className="flex justify-between items-center text-gray-500">
                    <span>Tổng tiền chưa VAT:</span>
                    <span className="font-semibold">{formTotals.preTax.toLocaleString("vi-VN")} đ</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-900 text-sm font-extrabold pt-1 border-t border-slate-200">
                    <span>Tổng cấn trừ công nợ:</span>
                    <span className="text-slate-900">{formTotals.postTax.toLocaleString("vi-VN")} đ</span>
                  </div>
                </div>
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
                  disabled={submitting}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded flex items-center gap-1 cursor-pointer"
                >
                  {submitting ? "Đang lưu..." : "Xác nhận lưu"}
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
