"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash, ArrowLeft, SpinnerGap } from "@phosphor-icons/react";

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

export default function CreateExportPage() {
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
    const token = localStorage.getItem("gooli_token");
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch("http://localhost:3001/api/v1/partners?limit=500", { headers }).then(r => r.json()),
      fetch("http://localhost:3001/api/v1/products?limit=1000", { headers }).then(r => r.json()),
    ]).then(([pData, prData]) => {
      setPartners((Array.isArray(pData) ? pData : []).filter((p: Partner) => p.type === "CUSTOMER"));
      setProducts(prData?.items ?? []);
    }).catch(console.error);
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
      const token = localStorage.getItem("gooli_token");
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
      const res = await fetch("http://localhost:3001/api/v1/exports", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message || "Tạo phiếu xuất thất bại.");
      }
      router.push("/admin/exports");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi không xác định.");
    } finally { setSubmitting(false); }
  };

  const selectedPartner = partners.find(p => String(p.id) === partnerId);

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Back */}
      <Link href="/admin/exports" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#64748b", fontSize: 14, marginBottom: 16, textDecoration: "none" }}>
        <ArrowLeft size={16} /> Quay lại danh sách
      </Link>

      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 24px 0" }}>
        Tạo phiếu xuất kho — Bán hàng
      </h1>

      {error && (
        <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, color: "#dc2626", marginBottom: 20, fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* ─── Header Form ─── */}
      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "20px 24px", marginBottom: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>Thông tin phiếu</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px 20px" }}>
          {/* Khách hàng */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Khách hàng</label>
            <select
              value={partnerId}
              onChange={e => setPartnerId(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 14, color: "#1e293b", background: "#fff" }}
            >
              <option value="">-- Khách lẻ --</option>
              {partners.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
              ))}
            </select>
          </div>

          {/* HTTT */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Hình thức thanh toán</label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 14, color: "#1e293b", background: "#fff" }}
            >
              <option>Tiền mặt</option>
              <option>Chuyển khoản</option>
              <option>Công nợ</option>
            </select>
          </div>

          {/* Ghi chú */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Ghi chú</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Ghi chú phiếu xuất..."
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 14, color: "#1e293b", boxSizing: "border-box" }}
            />
          </div>
        </div>

        {/* Thông tin đối tác */}
        {selectedPartner && (
          <div style={{ marginTop: 12, padding: "10px 16px", background: "#eff6ff", borderRadius: 8, border: "1px solid #bfdbfe", fontSize: 13, color: "#1e40af" }}>
            <strong>{selectedPartner.name}</strong>
            {selectedPartner.phone && <> · 📞 {selectedPartner.phone}</>}
            {selectedPartner.address && <> · 📍 {selectedPartner.address}</>}
          </div>
        )}
      </div>

      {/* ─── Product Table ─── */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "14px 20px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Danh sách hàng hóa</span>
          <button
            onClick={() => setShowPicker(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#B06518", color: "#fff", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            <Plus size={14} weight="bold" /> Thêm sản phẩm
          </button>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "#64748b", fontSize: 13, borderBottom: "1px solid #e2e8f0" }}>Tên hàng</th>
              <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "#64748b", fontSize: 13, borderBottom: "1px solid #e2e8f0" }}>ĐVT</th>
              <th style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#64748b", fontSize: 13, borderBottom: "1px solid #e2e8f0" }}>Số lượng</th>
              <th style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#64748b", fontSize: 13, borderBottom: "1px solid #e2e8f0" }}>Đơn giá</th>
              <th style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#64748b", fontSize: 13, borderBottom: "1px solid #e2e8f0" }}>VAT%</th>
              <th style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#64748b", fontSize: 13, borderBottom: "1px solid #e2e8f0" }}>Thành tiền</th>
              <th style={{ padding: "10px 8px", borderBottom: "1px solid #e2e8f0" }}></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>
                  Chưa có sản phẩm nào. Bấm "Thêm sản phẩm" để bắt đầu.
                </td>
              </tr>
            ) : items.map((item, idx) => (
              <tr key={item.productId} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "10px 14px", color: "#1e293b", fontWeight: 600 }}>{item.productName}</td>
                <td style={{ padding: "10px 14px", color: "#64748b" }}>{item.unit}</td>
                <td style={{ padding: "10px 14px", textAlign: "right" }}>
                  <input
                    type="number" min={1} value={item.quantity}
                    onChange={e => updateItem(idx, "quantity", Number(e.target.value))}
                    style={{ width: 70, padding: "5px 8px", border: "1px solid #cbd5e1", borderRadius: 6, textAlign: "right", fontSize: 14 }}
                  />
                </td>
                <td style={{ padding: "10px 14px", textAlign: "right" }}>
                  <input
                    type="number" min={0} value={item.price}
                    onChange={e => updateItem(idx, "price", Number(e.target.value))}
                    style={{ width: 110, padding: "5px 8px", border: "1px solid #cbd5e1", borderRadius: 6, textAlign: "right", fontSize: 14 }}
                  />
                </td>
                <td style={{ padding: "10px 14px", textAlign: "right" }}>
                  <input
                    type="number" min={0} max={100} value={item.vatRate}
                    onChange={e => updateItem(idx, "vatRate", Number(e.target.value))}
                    style={{ width: 60, padding: "5px 8px", border: "1px solid #cbd5e1", borderRadius: 6, textAlign: "right", fontSize: 14 }}
                  />
                </td>
                <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#0f172a" }}>
                  {fmt(item.quantity * item.price)}đ
                </td>
                <td style={{ padding: "10px 8px", textAlign: "center" }}>
                  <button onClick={() => removeItem(idx)} style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer" }}>
                    <Trash size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── Totals + Submit ─── */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 40, alignItems: "flex-start" }}>
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 24px", minWidth: 280 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14, color: "#64748b" }}>
            <span>Tổng trước thuế:</span>
            <span style={{ fontWeight: 600, color: "#1e293b" }}>{fmt(preTaxTotal)}đ</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14, color: "#64748b" }}>
            <span>Thuế VAT:</span>
            <span style={{ fontWeight: 600, color: "#1e293b" }}>{fmt(vatTotal)}đ</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, color: "#0f172a", borderTop: "2px solid #e2e8f0", paddingTop: 10, marginTop: 4 }}>
            <span>Tổng thanh toán:</span>
            <span style={{ color: "#B06518" }}>{fmt(postTaxTotal)}đ</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/admin/exports" style={{ padding: "11px 20px", background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
            Huỷ
          </Link>
          <button
            onClick={handleSubmit}
            disabled={submitting || items.length === 0}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 24px", background: submitting ? "#94a3b8" : "#B06518", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: submitting ? "not-allowed" : "pointer" }}
          >
            {submitting && <SpinnerGap size={16} className="animate-spin" />}
            {submitting ? "Đang lưu..." : "💾 Lưu phiếu xuất"}
          </button>
        </div>
      </div>

      {/* ─── Product Picker Modal ─── */}
      {showPicker && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: "24px", width: 600, maxHeight: "70vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: "#0f172a" }}>Chọn sản phẩm</span>
              <button onClick={() => { setShowPicker(false); setProductSearch(""); }} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>✕</button>
            </div>
            <input
              autoFocus
              placeholder="Tìm theo tên hoặc mã SKU..."
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              style={{ padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 14, marginBottom: 12 }}
            />
            <div style={{ overflowY: "auto", flex: 1 }}>
              {filteredProducts.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>Không tìm thấy sản phẩm.</div>
              ) : filteredProducts.map(p => (
                <div
                  key={p.id}
                  onClick={() => addItem(p)}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", cursor: "pointer", borderRadius: 8, transition: "background .1s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f0f9ff")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 14 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>SKU: {p.sku} · ĐVT: {p.unit}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: "#B06518", fontSize: 14 }}>{fmt(Number(p.pricePerM2))}đ</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
