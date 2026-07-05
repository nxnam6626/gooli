"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash, ArrowLeft, SpinnerGap, SignOut } from "@phosphor-icons/react";
import { getPartners, getProducts, createExport } from "../services/exportApi";

interface Product {
  id: number;
  sku: string;
  name: string;
  unit: string;
  pricePerM2: number;
}

interface Partner {
  id: number;
  code: string;
  name: string;
  type: string;
  phone?: string;
  address?: string;
}

interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
  vatRate: number;
  isFaulty: boolean;
  // display
  productName: string;
  unit: string;
  subtotal: number;
}

const fmt = (n: number) => n.toLocaleString("vi-VN");

export default function ExportForm() {
  const router = useRouter();

  // master data
  const [partners, setPartners] = useState<Partner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // header form
  const [partnerId, setPartnerId]       = useState<string>("");
  const [note, setNote]                 = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Tiền mặt");

  // product picker
  const [productSearch, setProductSearch] = useState("");
  const [showPicker, setShowPicker]       = useState(false);
  const [items, setItems]                 = useState<OrderItem[]>([]);

  // submit state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");

  // Load master data
  useEffect(() => {
    const token = localStorage.getItem("gooli_token") || "";
    Promise.all([
      getPartners(token),
      getProducts(token),
    ]).then(([pData, prData]) => {
      setPartners(pData);
      setProducts(prData);
    }).catch(err => {
      console.error("Failed to load master data", err);
    });
  }, []);

  // Filter products by search
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const addItem = (product: Product) => {
    setItems(prev => {
      const exists = prev.find(i => i.productId === product.id);
      if (exists) {
        return prev.map(i => i.productId === product.id
          ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.price }
          : i
        );
      }
      const price = Number(product.pricePerM2);
      return [...prev, {
        productId: product.id,
        productName: product.name,
        unit: product.unit,
        quantity: 1,
        price,
        vatRate: 10,
        isFaulty: false,
        subtotal: price,
      }];
    });
    setShowPicker(false);
    setProductSearch("");
  };

  const updateItem = (index: number, field: "quantity" | "price" | "vatRate", value: number) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      updated.subtotal = updated.quantity * updated.price;
      return updated;
    }));
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Totals
  const preTaxTotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
  const vatTotal    = items.reduce((sum, i) => sum + i.quantity * i.price * (i.vatRate / 100), 0);
  const postTaxTotal = preTaxTotal + vatTotal;

  const handleSubmit = async () => {
    if (items.length === 0) { setError("Vui lòng thêm ít nhất 1 sản phẩm."); return; }
    setError(""); setSubmitting(true);
    try {
      const token = localStorage.getItem("gooli_token") || "";
      const payload = {
        partnerId: partnerId ? Number(partnerId) : null,
        note: note || null,
        items: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
          vatRate: i.vatRate,
          isFaulty: false,
        })),
      };
      await createExport(payload, token);
      router.push("/admin/exports");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi không xác định.");
    } finally { setSubmitting(false); }
  };

  const selectedPartner = partners.find(p => String(p.id) === partnerId);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto py-2">
      {/* Back to list link */}
      <div>
        <Link
          href="/admin/exports"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider no-underline"
        >
          <ArrowLeft size={14} weight="bold" /> Quay lại danh sách
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[#1e3a8a] tracking-tight flex items-center gap-2">
          <SignOut size={24} className="text-[#2563eb]" />
          Tạo phiếu xuất kho — Bán hàng
        </h1>
        <p className="text-[11px] text-slate-500 mt-1">
          Lập phiếu xuất hàng bán cho khách hàng. Thông tin tồn kho sẽ tự động cập nhật sau khi phê duyệt.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-lg text-sm border border-rose-200/50 font-bold">
          {error}
        </div>
      )}

      {/* ─── Header Form ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-6 border border-slate-200 rounded-xl">
        {/* Khách hàng */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Khách hàng
          </label>
          <select
            value={partnerId}
            onChange={e => setPartnerId(e.target.value)}
            className="w-full border border-slate-200 bg-white rounded-lg p-2.5 text-sm font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]/20 transition-colors cursor-pointer"
          >
            <option value="">-- Khách lẻ --</option>
            {partners.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>
        </div>

        {/* Hình thức thanh toán */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Hình thức thanh toán
          </label>
          <select
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value)}
            className="w-full border border-slate-200 bg-white rounded-lg p-2.5 text-sm font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]/20 transition-colors cursor-pointer"
          >
            <option>Tiền mặt</option>
            <option>Chuyển khoản</option>
            <option>Công nợ</option>
          </select>
        </div>

        {/* Ghi chú */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Ghi chú
          </label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Ghi chú phiếu xuất..."
            className="w-full border border-slate-200 bg-white rounded-lg p-2.5 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]/20 transition-colors"
          />
        </div>

        {/* Khách hàng Info Card */}
        {selectedPartner && (
          <div className="col-span-1 md:col-span-3 p-3.5 bg-blue-50/30 border border-blue-200/20 text-slate-700 text-xs font-semibold rounded-lg">
            <span className="text-[#2563eb] font-bold uppercase text-[10px] tracking-wider block mb-1">
              Thông tin chi tiết Khách hàng
            </span>
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              <span>Mã khách: <strong className="text-slate-900">{selectedPartner.code}</strong></span>
              <span>Họ tên: <strong className="text-slate-900">{selectedPartner.name}</strong></span>
              {selectedPartner.phone && <span>Số điện thoại: <strong className="text-slate-900">{selectedPartner.phone}</strong></span>}
              {selectedPartner.address && <span>Địa chỉ: <strong className="text-slate-900">{selectedPartner.address}</strong></span>}
            </div>
          </div>
        )}
      </div>

      {/* ─── Product Table ─── */}
      <div className="bg-white shadow-[0_4px_20px_rgba(15,23,42,0.02)] border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chi tiết Hàng hóa</h3>
          <button
            type="button"
            onClick={() => setShowPicker(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#2563eb] hover:text-blue-700 transition-colors cursor-pointer"
          >
            <Plus size={14} weight="bold" /> Thêm sản phẩm
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-400">
              <tr>
                <th className="px-6 py-3 font-bold text-[10px] uppercase tracking-wider">Tên hàng</th>
                <th className="px-6 py-3 font-bold text-[10px] uppercase tracking-wider w-24">ĐVT</th>
                <th className="px-6 py-3 font-bold text-[10px] uppercase tracking-wider w-32 text-right">Số lượng</th>
                <th className="px-6 py-3 font-bold text-[10px] uppercase tracking-wider w-40 text-right">Đơn giá</th>
                <th className="px-6 py-3 font-bold text-[10px] uppercase tracking-wider w-24 text-right">VAT%</th>
                <th className="px-6 py-3 font-bold text-[10px] uppercase tracking-wider w-44 text-right">Thành tiền</th>
                <th className="px-6 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Chưa có sản phẩm nào. Bấm &quot;Thêm sản phẩm&quot; để bắt đầu.
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={item.productId} className="hover:bg-slate-50/20">
                    <td className="px-6 py-2.5 font-semibold text-slate-800">{item.productName}</td>
                    <td className="px-6 py-2.5 text-slate-500 font-medium">{item.unit}</td>
                    <td className="px-6 py-2.5">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={e => updateItem(idx, "quantity", Number(e.target.value))}
                        className="w-full border border-slate-200 bg-white rounded-lg p-1.5 text-sm font-mono font-semibold text-slate-800 text-right focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]/20 transition-colors"
                      />
                    </td>
                    <td className="px-6 py-2.5">
                      <input
                        type="number"
                        min={0}
                        value={item.price}
                        onChange={e => updateItem(idx, "price", Number(e.target.value))}
                        className="w-full border border-slate-200 bg-white rounded-lg p-1.5 text-sm font-mono font-semibold text-slate-800 text-right focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]/20 transition-colors"
                      />
                    </td>
                    <td className="px-6 py-2.5">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={item.vatRate}
                        onChange={e => updateItem(idx, "vatRate", Number(e.target.value))}
                        className="w-full border border-slate-200 bg-white rounded-lg p-1.5 text-sm font-mono font-semibold text-slate-800 text-right focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]/20 transition-colors"
                      />
                    </td>
                    <td className="px-6 py-2.5 text-right font-mono font-bold text-slate-900">
                      {fmt(item.quantity * item.price)}đ
                    </td>
                    <td className="px-6 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Totals + Submit Actions ─── */}
      <div className="flex flex-col sm:flex-row justify-end items-start gap-6 pt-4">
        {/* Summary Receipt Block */}
        <div className="w-full sm:w-80 bg-slate-50 border border-slate-200 p-5 rounded-xl flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
            <span>Tổng giá trước thuế:</span>
            <span className="font-mono text-slate-700">{fmt(preTaxTotal)}đ</span>
          </div>
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
            <span>Thuế GTGT (VAT):</span>
            <span className="font-mono text-slate-700">{fmt(vatTotal)}đ</span>
          </div>
          <div className="border-t border-slate-200 my-1"></div>
          <div className="flex justify-between items-center text-sm font-extrabold text-slate-900">
            <span>TỔNG THANH TOÁN:</span>
            <span className="font-mono text-base text-[#2563eb]">{fmt(postTaxTotal)}đ</span>
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="flex gap-3">
          <Link
            href="/admin/exports"
            className="px-6 py-2.5 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors text-sm font-bold rounded-lg shadow-sm text-center no-underline cursor-pointer"
          >
            Hủy bỏ
          </Link>
          <button
            onClick={handleSubmit}
            disabled={submitting || items.length === 0}
            className="px-6 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm shadow-blue-500/10 transition-colors disabled:opacity-75 flex items-center gap-2 cursor-pointer"
          >
            {submitting && <SpinnerGap size={18} className="animate-spin" />}
            {submitting ? "Đang lưu..." : "💾 Lưu phiếu xuất"}
          </button>
        </div>
      </div>

      {/* ─── Product Picker Modal ─── */}
      {showPicker && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-lg max-h-[75vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-200 bg-slate-50">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Chọn sản phẩm xuất kho</span>
              <button
                onClick={() => { setShowPicker(false); setProductSearch(""); }}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold font-mono transition-colors focus:outline-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Search Input */}
            <div className="p-4 border-b border-slate-200">
              <input
                autoFocus
                placeholder="Tìm theo tên hoặc mã SKU..."
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]/20 transition-colors"
              />
            </div>

            {/* Modal Product List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400 italic">
                  Không tìm thấy sản phẩm phù hợp.
                </div>
              ) : (
                filteredProducts.map(p => (
                  <div
                     key={p.id}
                     onClick={() => addItem(p)}
                     className="p-3.5 flex justify-between items-center hover:bg-blue-50/10 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{p.name}</div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mt-0.5">
                        SKU: <span className="font-mono text-slate-500 font-bold">{p.sku}</span> · ĐVT: {p.unit}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-[#2563eb]">{fmt(Number(p.pricePerM2))}đ</div>
                      <div className="text-[9px] text-slate-400">Đơn giá m²</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
