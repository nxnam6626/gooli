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
  ClipboardText,
  Printer
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
  expectedDeliveryDate?: string | null;
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
  PENDING: { label: "Đang xử lý", color: "bg-amber-50 text-amber-700 border border-amber-200/30" },
  REJECTED: { label: "Đã hủy", color: "bg-rose-50 text-rose-700 border border-rose-200/30" },
};

const fmt = (n: number | string) =>
  Number(n).toLocaleString("vi-VN");

const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleDateString("vi-VN") : "—";

const fmtDateRange = (dateStr: string) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
};

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
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"incoming" | "completed">("incoming");
  const [startDate, setStartDate] = useState("2026-06-01");
  const [endDate, setEndDate] = useState("2026-06-30");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState("2026-06-01");
  const [tempEndDate, setTempEndDate] = useState("2026-06-30");

  useEffect(() => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
  }, [startDate, endDate]);

  const getDateDisplayString = () => {
    if (!startDate && !endDate) return "Toàn thời gian";
    if (startDate && endDate) return `${fmtDateRange(startDate)} - ${fmtDateRange(endDate)}`;
    if (startDate) return `Từ ${fmtDateRange(startDate)}`;
    if (endDate) return `Đến ${fmtDateRange(endDate)}`;
    return "Chọn thời gian";
  };

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

  const incomingReceipts = React.useMemo(() => {
    return receipts.filter(r => r.status === "PENDING");
  }, [receipts]);

  const completedReceipts = React.useMemo(() => {
    return receipts.filter(r => r.status === "APPROVED" || r.status === "REJECTED");
  }, [receipts]);

  // Client side filtering
  const filteredReceipts = React.useMemo(() => {
    const baseList = activeSubTab === "incoming" ? incomingReceipts : completedReceipts;
    return baseList.filter(r => {
      // 1. Status Filter (only apply on completed sub-tab)
      if (activeSubTab === "completed" && selectedStatus && r.status !== selectedStatus) return false;

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

      // 4. Date Range Filter
      if (startDate) {
        const rDate = new Date(r.createdAt);
        const sDate = new Date(startDate);
        sDate.setHours(0, 0, 0, 0);
        if (rDate < sDate) return false;
      }
      if (endDate) {
        const rDate = new Date(r.createdAt);
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        if (rDate > eDate) return false;
      }

      return true;
    });
  }, [incomingReceipts, completedReceipts, activeSubTab, selectedStatus, selectedPartnerId, searchQuery, startDate, endDate]);

  // Compute stats
  const metrics = React.useMemo(() => {
    const totalCount = receipts.length;
    const pendingCount = receipts.filter(r => r.status === "PENDING").length;
    const totalValue = receipts.reduce((s, r) => s + Number(r.postTaxTotal || 0), 0);
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
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Quản lý nhập hàng</h1>
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

      {/* Sub-tabs for Option B (Receiving Queue) */}
      <div className="flex gap-4 border-b border-slate-200 pb-0.5 select-none">
        <button
          onClick={() => setActiveSubTab("incoming")}
          className={`flex items-center gap-2 py-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer bg-transparent outline-none ${
            activeSubTab === "incoming"
              ? "text-[#2563eb] border-[#2563eb]"
              : "text-slate-500 hover:text-slate-800 border-transparent hover:border-slate-300"
          }`}
        >
          <span>Đang đến / Chờ nhập</span>
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
            activeSubTab === "incoming" ? "bg-blue-50 text-[#2563eb]" : "bg-slate-100 text-slate-500"
          }`}>
            {incomingReceipts.length}
          </span>
        </button>
        <button
          onClick={() => setActiveSubTab("completed")}
          className={`flex items-center gap-2 py-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer bg-transparent outline-none ${
            activeSubTab === "completed"
              ? "text-[#2563eb] border-[#2563eb]"
              : "text-slate-500 hover:text-slate-800 border-transparent hover:border-slate-300"
          }`}
        >
          <span>Lịch sử nhập</span>
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
            activeSubTab === "completed" ? "bg-blue-50 text-[#2563eb]" : "bg-slate-100 text-slate-500"
          }`}>
            {completedReceipts.length}
          </span>
        </button>
      </div>

      {/* 3. Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Tổng phiếu nhập */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider block">TỔNG PHIẾU NHẬP</span>
            <span className="text-2xl font-black text-slate-900 block font-mono">{metrics.total.toLocaleString()}</span>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <span>+12% so với tháng trước (Tốt)</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#2563eb] shrink-0">
            <ClipboardText size={20} weight="bold" />
          </div>
        </div>

        {/* Card 2: Đang kiểm kê */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider block">ĐANG KIỂM KÊ</span>
            <span className="text-2xl font-black text-slate-900 block font-mono">{metrics.pending}</span>
            <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
              <span className="font-semibold">Cần xử lý trong hôm nay</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Clock size={20} weight="bold" />
          </div>
        </div>

        {/* Card 3: Tổng giá trị nhập */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider block">TỔNG GIÁ TRỊ NHẬP</span>
            <span className="text-2xl font-black text-slate-900 block font-mono">{(metrics.value / 1000000000).toFixed(1)}B</span>
            <span className="text-[10px] font-bold text-[#2563eb] flex items-center gap-1">
              <span>VNĐ Quý 3 / 2026</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CurrencyDollar size={20} weight="bold" />
          </div>
        </div>

        {/* Card 4: Lô hàng đang đến */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider block">LÔ HÀNG ĐANG ĐẾN</span>
            <span className="text-2xl font-black text-slate-900 block font-mono">{metrics.overdue}</span>
            <span className="text-[10px] font-bold text-[#2563eb] flex items-center gap-1">
              <span className="font-semibold">Chờ nhận hàng</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#2563eb] shrink-0">
            <Truck size={20} weight="bold" />
          </div>
        </div>
      </div>

      {/* 4. Filter bar */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date range picker */}
          <div className="relative">
            <button
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="flex items-center bg-[#f1f5f9] hover:bg-slate-200/70 transition-colors rounded-lg px-3 py-1.5 gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none border-none outline-none"
            >
              <Calendar size={14} className="text-slate-500" />
              <span className="text-[11px]">
                {getDateDisplayString()}
              </span>
              <CaretDown size={10} className="text-slate-500 transition-transform duration-200" style={{ transform: isDatePickerOpen ? 'rotate(180deg)' : 'none' }} />
            </button>

            {isDatePickerOpen && (
              <>
                {/* Backdrop to close on click outside */}
                <div
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setIsDatePickerOpen(false)}
                />
                <div className="absolute top-full left-0 z-50 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg p-4 w-72 space-y-4 text-xs">
                  {/* Presets */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1 select-none">
                      Chọn nhanh
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { label: "Hôm nay", getValue: () => {
                          const today = new Date().toISOString().split("T")[0];
                          return [today, today];
                        }},
                        { label: "Hôm qua", getValue: () => {
                          const yesterday = new Date();
                          yesterday.setDate(yesterday.getDate() - 1);
                          const yStr = yesterday.toISOString().split("T")[0];
                          return [yStr, yStr];
                        }},
                        { label: "7 ngày qua", getValue: () => {
                          const end = new Date();
                          const start = new Date();
                          start.setDate(end.getDate() - 7);
                          return [start.toISOString().split("T")[0], end.toISOString().split("T")[0]];
                        }},
                        { label: "Tháng này", getValue: () => {
                          return ["2026-06-01", "2026-06-30"];
                        }},
                        { label: "Tháng trước", getValue: () => {
                          return ["2026-05-01", "2026-05-31"];
                        }},
                        { label: "Toàn thời gian", getValue: () => {
                          return ["", ""];
                        }}
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => {
                            const [s, e] = preset.getValue();
                            setStartDate(s);
                            setEndDate(e);
                            setIsDatePickerOpen(false);
                          }}
                          className="py-1.5 px-2 bg-slate-50 hover:bg-blue-50 hover:text-[#2563eb] text-slate-700 font-bold rounded-lg transition-all text-left cursor-pointer border border-transparent hover:border-blue-200/50 text-[11px]"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Range */}
                  <div className="border-t border-slate-100 pt-3 space-y-3">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block select-none">
                      Khoảng ngày tùy chỉnh
                    </span>
                    <div className="space-y-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-500 font-bold">Từ ngày</label>
                        <input
                          type="date"
                          value={tempStartDate}
                          onChange={(e) => setTempStartDate(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 font-bold text-[11px] text-slate-800 focus:outline-none focus:border-[#2563eb] w-full"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-500 font-bold">Đến ngày</label>
                        <input
                          type="date"
                          value={tempEndDate}
                          onChange={(e) => setTempEndDate(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 font-bold text-[11px] text-slate-800 focus:outline-none focus:border-[#2563eb] w-full"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => {
                          setStartDate(tempStartDate);
                          setEndDate(tempEndDate);
                          setIsDatePickerOpen(false);
                        }}
                        className="flex-1 py-1.5 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-center text-xs shadow-2xs shadow-blue-500/10 border-none outline-none"
                      >
                        Áp dụng
                      </button>
                      <button
                        onClick={() => {
                          setTempStartDate(startDate);
                          setTempEndDate(endDate);
                          setIsDatePickerOpen(false);
                        }}
                        className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-lg transition-colors cursor-pointer text-center text-xs shadow-3xs"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
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
          {activeSubTab === "completed" && (
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
                <option value="REJECTED">Đã hủy</option>
              </select>
              <CaretDown size={10} className="text-slate-500 absolute right-1.5 pointer-events-none" />
            </div>
          )}
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
                <th className="px-6 py-3.5 font-bold text-[10px] uppercase tracking-wider">Ngày tạo</th>
                <th className="px-6 py-3.5 font-bold text-[10px] uppercase tracking-wider">Ngày dự kiến</th>
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
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <CircleNotch size={18} className="animate-spin text-[#2563eb]" />
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    Không tìm thấy phiếu nhập kho nào.
                  </td>
                </tr>
              ) : filteredReceipts.map((r) => {
                const st = STATUS_MAP[r.status] ?? { label: r.status, color: "bg-slate-100 text-slate-600" };
                const isSelected = selectedReceipt?.id === r.id;
                return (
                  <tr
                    key={r.id}
                    className={`hover:bg-blue-50/10 cursor-pointer transition-colors ${isSelected ? "bg-blue-50/25" : ""}`}
                    onClick={() => setSelectedReceipt(r)}
                  >
                    {/* Code */}
                    <td className="px-6 py-3.5 font-mono font-bold text-[#2563eb] text-xs">
                      {r.code}
                    </td>

                    {/* Created Date */}
                    <td className="px-6 py-3.5 text-slate-500 text-xs">
                      {r.createdAt ? new Date(r.createdAt).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      }) : "—"}
                    </td>

                    {/* Expected Date */}
                    <td className="px-6 py-3.5 text-slate-700 font-semibold text-xs">
                      {r.status === "APPROVED" ? (
                        r.approvedAt ? new Date(r.approvedAt).toLocaleDateString("vi-VN") : "Đã nhận"
                      ) : r.status === "PENDING" ? (
                        r.expectedDeliveryDate ? new Date(r.expectedDeliveryDate).toLocaleDateString("vi-VN") : (
                          (() => {
                            const d = new Date(r.createdAt);
                            d.setDate(d.getDate() + 1);
                            return d.toLocaleDateString("vi-VN");
                          })()
                        )
                      ) : "—"}
                    </td>

                    {/* Supplier */}
                    <td className="px-6 py-3.5 text-slate-700 font-semibold flex items-center gap-2">
                      {r.partner ? (
                        <>
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${r.partner.id % 3 === 0 ? "bg-blue-500" : r.partner.id % 3 === 1 ? "bg-amber-500" : "bg-slate-500"
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

      {/* RECEIPT DETAIL MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-xl relative text-xs font-semibold text-slate-700 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-3">
                <span>Chi tiết phiếu nhập: <span className="font-mono text-[#2563eb]">{selectedReceipt.code}</span></span>
                <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full border ${
                  STATUS_MAP[selectedReceipt.status]?.color || "bg-slate-100 text-slate-600"
                }`}>
                  {STATUS_MAP[selectedReceipt.status]?.label || selectedReceipt.status}
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
                  <div className="text-[11px] font-bold text-slate-455 uppercase tracking-wider select-none">
                    Thông tin hóa đơn
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-2xs">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-semibold">Tổng trước thuế:</span>
                      <span className="font-mono text-slate-900 font-extrabold">{selectedReceipt.preTaxTotal ? fmt(selectedReceipt.preTaxTotal) + "đ" : "—"}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-2.5">
                      <span className="text-slate-400 font-semibold">Đã thanh toán:</span>
                      <span className="font-mono text-emerald-600 font-extrabold">{selectedReceipt.paidAmount ? fmt(selectedReceipt.paidAmount) + "đ" : "0đ"}</span>
                    </div>
                    <div className="flex justify-between items-start text-xs border-t border-slate-100 pt-2.5">
                      <span className="text-slate-400 font-semibold">Hóa đơn / Ngày:</span>
                      <span className="font-mono text-slate-800 text-right font-semibold">
                        {selectedReceipt.invoiceNumber ? (
                          <>
                            <div className="font-extrabold text-slate-900">{selectedReceipt.invoiceNumber}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{fmtDate(selectedReceipt.invoiceDate)}</div>
                          </>
                        ) : "—"}
                      </span>
                    </div>
                  </div>

                  {selectedReceipt.note && (
                    <div className="bg-amber-50/35 border border-amber-100/50 p-3.5 rounded-xl text-xs text-slate-700 space-y-1">
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block select-none">Ghi chú</span>
                      <p className="font-medium leading-relaxed">{selectedReceipt.note}</p>
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
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-455 uppercase tracking-wider text-[10px] font-extrabold select-none">
                              <th className="py-2.5 px-4 text-left">Tên hàng</th>
                              <th className="py-2.5 px-4 text-right w-24">Số lượng</th>
                              <th className="py-2.5 px-4 text-right w-28">Đơn giá</th>
                              <th className="py-2.5 px-4 text-right w-16">VAT</th>
                              <th className="py-2.5 px-4 text-right w-28">Thành tiền</th>
                              <th className="py-2.5 px-4 text-center w-28">Phân loại</th>
                              <th className="py-2.5 px-4 text-center w-20">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {selectedReceipt.items.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-2.5 px-4 font-semibold text-slate-900">{item.product?.name ?? `ID ${item.productId}`}</td>
                                <td className="py-2.5 px-4 text-right text-slate-700 font-mono font-bold">
                                  {item.quantity} {item.product?.unit ?? ""}
                                </td>
                                <td className="py-2.5 px-4 text-right font-mono text-slate-600">{fmt(item.price)}đ</td>
                                <td className="py-2.5 px-4 text-right text-slate-500 font-mono">{item.vatRate ?? 10}%</td>
                                <td className="py-2.5 px-4 text-right font-mono font-black text-slate-900">
                                  {fmt(item.quantity * item.price)}đ
                                </td>
                                <td className="py-2.5 px-4 text-center">
                                  {item.isFaulty ? (
                                    <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[9px] font-extrabold uppercase tracking-wider rounded-full border border-rose-100">Hàng lỗi</span>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-extrabold uppercase tracking-wider rounded-full border border-emerald-100">Đạt chuẩn</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-4 text-center">
                                  <button
                                    onClick={() => alert(`Đang chuẩn bị lệnh in mã vạch cho sản phẩm: ${item.product?.name || item.productId} (SKU: ${item.product?.sku || 'N/A'})`)}
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
              <div className="text-slate-455 text-[10px] font-bold uppercase tracking-wider">
                Ngày tạo: {selectedReceipt.createdAt ? new Date(selectedReceipt.createdAt).toLocaleString("vi-VN") : "—"}
              </div>
              <div className="flex gap-3">
                {selectedReceipt.status === "PENDING" && userRole === "ADMIN" && (
                  <>
                    <button
                      onClick={() => {
                        handleAction(selectedReceipt.id, "approve");
                        setSelectedReceipt(null);
                      }}
                      disabled={actionId === selectedReceipt.id}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer disabled:opacity-50 text-xs shadow-sm transition-colors"
                    >
                      Duyệt phiếu
                    </button>
                    <button
                      onClick={() => {
                        handleAction(selectedReceipt.id, "reject");
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
      )}
    </div>
  );
}
