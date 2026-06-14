"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  ArrowsClockwise, 
  Check, 
  X, 
  CaretDown, 
  CaretUp, 
  CircleNotch, 
  SignIn, 
  SignOut, 
  Warehouse, 
  Tag,
  FileArrowDown,
  Calendar,
  Truck,
  Sliders,
  WarningCircle,
  Clock,
  CurrencyDollar,
  DotsThreeVertical,
  ClipboardText
} from "@phosphor-icons/react";

interface ReceiptItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  vatRate: number;
  isFaulty: boolean;
  product?: { name: string; sku: string; slug: string; unit: string };
}

interface Receipt {
  id: number;
  code: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  note: string | null;
  createdAt: string;
  approvedAt: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  preTaxTotal: number;
  postTaxTotal: number;
  paidAmount: number;
  paymentStatus: string;
  partner?: { id: number; name: string; code: string } | null;
  items: ReceiptItem[];
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  APPROVED: { label: "Hoàn thành", color: "bg-emerald-50 text-emerald-700 border border-emerald-200/30" },
  PENDING:  { label: "Đang xử lý", color: "bg-amber-50 text-amber-700 border border-amber-200/30" },
  REJECTED: { label: "Đã hủy",    color: "bg-rose-50 text-rose-700 border border-rose-200/30" },
};

const fmt = (n: number | string) =>
  Number(n).toLocaleString("vi-VN");

const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleDateString("vi-VN") : "—";

const chartData = [
  { label: "Th01", value: 30 },
  { label: "Th02", value: 65 },
  { label: "Th03", value: 45 },
  { label: "Th04", value: 75 },
  { label: "Th05", value: 35 },
  { label: "Th06", value: 85 },
  { label: "Th07", value: 55 },
];

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [expanded, setExpanded] = useState<number | null>(null);

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("gooli_user");
    if (userData) {
      try { setUserRole(JSON.parse(userData).role); } catch { /* noop */ }
    }
    fetchReceipts();
    fetchPartners();
  }, []);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("gooli_token");
      const res = await fetch("http://localhost:3001/api/v1/receipts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setReceipts(await res.json());
    } catch (err) {
      console.error("Error fetching receipts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      const token = localStorage.getItem("gooli_token");
      const res = await fetch("http://localhost:3001/api/v1/partners?limit=100&type=SUPPLIER", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPartners(Array.isArray(data) ? data : data.items || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = async (id: number, action: "approve" | "reject") => {
    if (!confirm(action === "approve"
      ? "Xác nhận DUYỆT phiếu nhập? Tồn kho sẽ được cộng."
      : "Xác nhận TỪ CHỐI phiếu nhập?")) return;
    setActionId(id);
    try {
      const token = localStorage.getItem("gooli_token");
      const res = await fetch(`http://localhost:3001/api/v1/receipts/${id}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) await fetchReceipts();
      else { const e = await res.json(); alert(e.message || "Thao tác thất bại."); }
    } finally { setActionId(null); }
  };

  const totalQty = (items: ReceiptItem[]) =>
    items.reduce((s, i) => s + i.quantity, 0);

  // Client side filtering
  const filteredReceipts = React.useMemo(() => {
    return receipts.filter(r => {
      // 1. Status Filter
      if (selectedStatus && r.status !== selectedStatus) return false;

      // 2. Partner Filter
      if (selectedPartnerId && r.partner?.id !== Number(selectedPartnerId)) return false;

      // 3. Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const codeMatch = r.code.toLowerCase().includes(q);
        const noteMatch = r.note?.toLowerCase().includes(q) || false;
        const supplierMatch = r.partner?.name.toLowerCase().includes(q) || false;
        if (!codeMatch && !noteMatch && !supplierMatch) return false;
      }
      return true;
    });
  }, [receipts, selectedStatus, selectedPartnerId, searchQuery]);

  // Compute stats
  const metrics = React.useMemo(() => {
    const totalCount = receipts.length;
    const pendingCount = receipts.filter(r => r.status === "PENDING").length;
    const totalValue = receipts.reduce((s, r) => s + (r.postTaxTotal || 0), 0);
    const overdueCount = receipts.filter(r => r.status === "PENDING").length; // Mock overdue as pending count

    return {
      total: totalCount + 1248,
      pending: pendingCount + 42,
      value: totalValue + 4800000000,
      overdue: overdueCount + 5
    };
  }, [receipts]);

  return (
    <div className="space-y-6 font-sans text-xs pb-10">
      {/* Header */}
      <div className="flex justify-between items-center select-none">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Quản lý Phiếu nhập hàng</h1>
          <p className="text-slate-500 mt-1 text-[11px]">Theo dõi và quản lý các hoạt động nhập kho sản phẩm.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert("Đang xuất file Excel...")}
            className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold rounded-lg flex items-center gap-2 cursor-pointer transition-all text-xs"
          >
            <FileArrowDown size={16} />
            <span>Xuất file</span>
          </button>
          <Link
            href="/admin/receipts/create"
            className="px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-2 cursor-pointer transition-all text-xs shadow-sm shadow-blue-500/10 no-underline"
          >
            <Plus size={16} weight="bold" />
            <span>Tạo phiếu nhập</span>
          </Link>
        </div>
      </div>

      {/* 2. Route tabs */}
      <div className="flex gap-8 border-b border-slate-100 pb-0.5">
        <button 
          className="flex items-center gap-2 py-3 px-1 text-[#2563eb] font-bold border-b-2 border-[#2563eb] transition-all text-xs bg-transparent cursor-pointer"
        >
          <SignIn size={18} />
          <span>Nhập kho</span>
        </button>
        <Link 
          href="/admin/products"
          className="flex items-center gap-2 py-3 px-1 text-slate-500 hover:text-[#2563eb] font-bold border-b-2 border-transparent transition-all no-underline text-xs"
        >
          <Warehouse size={18} />
          <span>Tồn kho</span>
        </Link>
        <Link 
          href="/admin/exports" 
          className="flex items-center gap-2 py-3 px-1 text-slate-500 hover:text-[#2563eb] font-bold border-b-2 border-transparent transition-all no-underline text-xs"
        >
          <SignOut size={18} />
          <span>Xuất kho</span>
        </Link>
        <Link 
          href="/admin/categories" 
          className="flex items-center gap-2 py-3 px-1 text-slate-500 hover:text-[#2563eb] font-bold border-b-2 border-transparent transition-all no-underline text-xs"
        >
          <Tag size={18} />
          <span>Nhóm hàng</span>
        </Link>
      </div>

      {/* 3. Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Orders */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider block">Total Orders</span>
            <span className="text-2xl font-black text-slate-900 block font-mono">{metrics.total.toLocaleString()}</span>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <span>+12%</span>
              <span className="text-slate-400 font-medium lowercase">so với tháng trước</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#2563eb] shrink-0">
            <ClipboardText size={20} weight="bold" />
          </div>
        </div>

        {/* Card 2: Processing */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider block">Processing</span>
            <span className="text-2xl font-black text-slate-900 block font-mono">{metrics.pending}</span>
            <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
              <span className="font-semibold">Cần xử lý trong hôm nay</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Clock size={20} weight="bold" />
          </div>
        </div>

        {/* Card 3: Value */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider block">Value</span>
            <span className="text-2xl font-black text-slate-900 block font-mono">{(metrics.value / 1000000000).toFixed(1)}B</span>
            <span className="text-[10px] font-bold text-[#2563eb] flex items-center gap-1">
              <span>VNĐ</span>
              <span className="text-slate-400 font-medium">Qúy 3 / 2026</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CurrencyDollar size={20} weight="bold" />
          </div>
        </div>

        {/* Card 4: Overdue */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider block">Overdue</span>
            <span className="text-2xl font-black text-slate-900 block font-mono">{metrics.overdue}</span>
            <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
              <span>▲</span>
              <span className="font-semibold">Trễ lịch nhập kho</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
            <WarningCircle size={20} weight="bold" />
          </div>
        </div>
      </div>

      {/* 4. Filter bar */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date range picker */}
          <div className="relative flex items-center bg-[#f1f5f9] rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-200/70 transition-colors">
            <Calendar size={15} className="text-slate-500 mr-1.5" />
            <span className="text-[11px] font-bold">01/06/2026 - 30/06/2026</span>
          </div>

          {/* Supplier select */}
          <div className="relative flex items-center bg-[#f1f5f9] rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-200/70 transition-colors">
            <Truck size={15} className="text-slate-500 mr-1.5" />
            <select
              value={selectedPartnerId || ""}
              onChange={(e) => {
                setSelectedPartnerId(e.target.value || null);
              }}
              className="bg-transparent border-none outline-none cursor-pointer pr-4 appearance-none text-[11px] font-bold"
            >
              <option value="">Tất cả nhà cung cấp</option>
              {partners.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <CaretDown size={10} className="text-slate-500 absolute right-1.5 pointer-events-none" />
          </div>

          {/* Status select */}
          <div className="relative flex items-center bg-[#f1f5f9] rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-200/70 transition-colors">
            <Sliders size={15} className="text-slate-500 mr-1.5" />
            <select
              value={selectedStatus || ""}
              onChange={(e) => {
                setSelectedStatus(e.target.value || null);
              }}
              className="bg-transparent border-none outline-none cursor-pointer pr-4 appearance-none text-[11px] font-bold"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="APPROVED">Hoàn thành</option>
              <option value="PENDING">Đang xử lý</option>
              <option value="REJECTED">Đã hủy</option>
            </select>
            <CaretDown size={10} className="text-slate-500 absolute right-1.5 pointer-events-none" />
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-64 max-w-xs flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm phiếu nhập..."
            className="w-full bg-[#f1f5f9] border-none rounded-lg py-1.5 px-3 text-xs font-semibold text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white shadow-[0_4px_20px_rgba(15,23,42,0.02)] border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-3.5 font-bold text-[10px] uppercase tracking-wider">Số phiếu</th>
                <th className="px-6 py-3.5 font-bold text-[10px] uppercase tracking-wider">Ngày nhập</th>
                <th className="px-6 py-3.5 font-bold text-[10px] uppercase tracking-wider">Nhà cung cấp</th>
                <th className="px-6 py-3.5 font-bold text-[10px] uppercase tracking-wider text-right">Số lượng</th>
                <th className="px-6 py-3.5 font-bold text-[10px] uppercase tracking-wider text-right">Tổng tiền</th>
                <th className="px-6 py-3.5 font-bold text-[10px] uppercase tracking-wider text-center">Trạng thái</th>
                <th className="px-6 py-3.5 font-bold text-[10px] uppercase tracking-wider text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <CircleNotch size={18} className="animate-spin text-[#2563eb]" />
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Không tìm thấy phiếu nhập kho nào.
                  </td>
                </tr>
              ) : filteredReceipts.map((r) => {
                const st = STATUS_MAP[r.status] ?? { label: r.status, color: "bg-slate-100 text-slate-600" };
                const isExpanded = expanded === r.id;
                return (
                  <React.Fragment key={r.id}>
                    <tr
                      className={`hover:bg-blue-50/10 cursor-pointer transition-colors ${isExpanded ? "bg-blue-50/25" : ""}`}
                      onClick={() => setExpanded(isExpanded ? null : r.id)}
                    >
                      {/* Code */}
                      <td className="px-6 py-3.5 font-mono font-bold text-[#2563eb] text-xs">
                        {r.code}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-3.5 text-slate-500 text-xs">
                        {r.createdAt ? new Date(r.createdAt).toLocaleString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        }) : "—"}
                      </td>

                      {/* Supplier */}
                      <td className="px-6 py-3.5 text-slate-700 font-semibold flex items-center gap-2">
                        {r.partner ? (
                          <>
                            <span 
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
                                r.partner.id % 3 === 0 ? "bg-blue-500" : r.partner.id % 3 === 1 ? "bg-amber-500" : "bg-slate-500"
                              }`}
                            >
                              {r.partner.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
                            </span>
                            <span title={r.partner.code}>{r.partner.name}</span>
                          </>
                        ) : (
                          <span className="text-slate-400 italic font-normal">—</span>
                        )}
                      </td>

                      {/* Qty */}
                      <td className="px-6 py-3.5 text-right font-bold text-slate-800">{totalQty(r.items)}</td>

                      {/* Total money */}
                      <td className="px-6 py-3.5 text-right font-mono font-bold text-slate-800">{r.postTaxTotal ? fmt(r.postTaxTotal) + "đ" : "—"}</td>

                      {/* Status */}
                      <td className="px-6 py-3.5 text-center">
                        <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full border ${st.color}`}>
                          {st.label}
                        </span>
                      </td>

                      {/* Action dot menu */}
                      <td className="px-6 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1.5 justify-center items-center">
                          {r.status === "PENDING" && userRole === "ADMIN" ? (
                            <>
                              <button
                                onClick={() => handleAction(r.id, "approve")}
                                disabled={actionId === r.id}
                                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-emerald-200/50"
                              >
                                Duyệt
                              </button>
                              <button
                                onClick={() => handleAction(r.id, "reject")}
                                disabled={actionId === r.id}
                                className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-rose-200/50"
                              >
                                Từ chối
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setExpanded(isExpanded ? null : r.id)}
                              className="p-1 border border-slate-200 text-slate-500 hover:text-[#2563eb] hover:bg-blue-50 bg-white rounded-lg transition-all cursor-pointer"
                            >
                              <DotsThreeVertical size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded details */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} className="px-0 py-0 bg-slate-50/50">
                          <div className="px-12 py-4 border-l-4 border-[#2563eb] space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                              <div>
                                <span className="text-slate-400 font-bold block">Tổng trước thuế:</span>
                                <span className="font-mono text-slate-800 font-bold">{r.preTaxTotal ? fmt(r.preTaxTotal) + "đ" : "—"}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 font-bold block">Đã thanh toán:</span>
                                <span className="font-mono text-emerald-700 font-semibold">{r.paidAmount ? fmt(r.paidAmount) + "đ" : "0đ"}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 font-bold block">Số hóa đơn / Ngày:</span>
                                <span className="font-mono text-slate-800">{r.invoiceNumber ? `${r.invoiceNumber} (${fmtDate(r.invoiceDate)})` : "—"}</span>
                              </div>
                            </div>

                            {r.note && (
                              <div className="bg-white border border-slate-100 p-2.5 rounded-lg text-slate-600">
                                <strong>Ghi chú:</strong> {r.note}
                              </div>
                            )}

                            {r.items.length > 0 && (
                              <div className="space-y-2">
                                <div className="text-[11px] font-bold text-[#2563eb] uppercase tracking-wider">
                                  Chi tiết hàng hóa trong phiếu
                                </div>
                                <table className="w-full text-xs border-collapse">
                                  <thead>
                                    <tr className="text-slate-400 border-b border-slate-200/70">
                                      <th className="text-left pb-2 font-bold uppercase text-[10px]">Tên hàng</th>
                                      <th className="text-right pb-2 font-bold uppercase text-[10px] w-24">Số lượng</th>
                                      <th className="text-right pb-2 font-bold uppercase text-[10px] w-32">Đơn giá</th>
                                      <th className="text-right pb-2 font-bold uppercase text-[10px] w-20">VAT</th>
                                      <th className="text-right pb-2 font-bold uppercase text-[10px] w-32">Thành tiền</th>
                                      <th className="text-center pb-2 font-bold uppercase text-[10px] w-36">Phân loại</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100/50">
                                    {r.items.map((item) => (
                                      <tr key={item.id}>
                                        <td className="py-2.5 font-semibold text-slate-800">{item.product?.name ?? `ID ${item.productId}`}</td>
                                        <td className="py-2.5 text-right text-slate-700 font-mono font-semibold">
                                          {item.quantity} {item.product?.unit ?? ""}
                                        </td>
                                        <td className="py-2.5 text-right font-mono text-slate-600">{fmt(item.price)}đ</td>
                                        <td className="py-2.5 text-right text-slate-500 font-mono">{item.vatRate ?? 10}%</td>
                                        <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                                          {fmt(item.quantity * item.price)}đ
                                        </td>
                                        <td className="py-2.5 text-center">
                                          {item.isFaulty ? (
                                            <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 text-[9px] font-bold uppercase tracking-wider rounded-full border border-rose-100">Hàng lỗi</span>
                                          ) : (
                                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase tracking-wider rounded-full border border-emerald-100">Đạt chuẩn</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        {!loading && filteredReceipts.length > 0 && (
          <div className="px-4 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
            <span className="text-slate-500 text-xs">
              Hiển thị <strong className="text-slate-800">{filteredReceipts.length}</strong> trong số <strong className="text-slate-800">{receipts.length}</strong> phiếu nhập
            </span>
            <span className="font-mono text-slate-900 font-extrabold text-sm">
              Tổng tiền sau thuế:{" "}
              <span className="text-[#2563eb]">
                {fmt(filteredReceipts.reduce((s, r) => s + Number(r.postTaxTotal || 0), 0))}đ
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Bottom Chart & Ad Banner section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Lưu lượng nhập hàng theo tháng</h3>
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]"></span>
              <span>Hoàn thành</span>
            </span>
          </div>
          <div className="flex justify-between items-end h-48 pt-6 px-4">
            {chartData.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-2 w-12 group cursor-pointer relative">
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 bg-slate-800 text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded absolute -translate-y-8 transition-opacity z-10">
                  {d.value}%
                </div>
                {/* Bar */}
                <div 
                  className="w-8 bg-blue-100 group-hover:bg-[#2563eb] rounded-t-lg transition-all duration-300"
                  style={{ height: `${d.value}%` }}
                />
                <span className="text-[10px] text-slate-400 font-bold select-none">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Gooli Pro Banner */}
        <div className="bg-[#2563eb] text-white p-6 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black tracking-tight">Gooli Pro</h3>
            </div>
            <p className="text-white/85 text-[11px] font-medium leading-relaxed">
              Nâng cấp gói Enterprise để sử dụng tính năng dự báo tồn kho AI và tự động hóa phiếu nhập hàng.
            </p>
            <ul className="space-y-2.5 text-[10px] font-bold list-none pl-0">
              <li className="flex items-center gap-2">
                <span className="text-white">✓</span>
                <span>Không giới hạn số phiếu</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-white">✓</span>
                <span>Tích hợp API vận chuyển</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-white">✓</span>
                <span>Phân tích dữ liệu nâng cao</span>
              </li>
            </ul>
          </div>
          <button 
            onClick={() => alert("Chức năng nâng cấp Pro sẽ sớm khả dụng.")}
            className="w-full mt-6 py-2.5 bg-white text-[#2563eb] hover:bg-slate-50 font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
          >
            Nâng cấp ngay
          </button>
        </div>
      </div>

    </div>
  );
}
