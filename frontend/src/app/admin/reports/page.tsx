"use client";

import React, { useState, useEffect } from "react";
import { 
  getPartners, 
  getSlips, 
  getReceipts, 
  getExports, 
  getProducts
} from "../../../services/api";
import { 
  ChartBar, 
  Coins, 
  Printer, 
  Calendar, 
  Package, 
  ArrowLeft, 
  MagnifyingGlass, 
  WarningCircle, 
  TrendUp, 
  TrendDown, 
  Users,
  List
} from "@phosphor-icons/react";

interface Partner {
  id: number;
  code: string;
  name: string;
  type: "CUSTOMER" | "SUPPLIER";
  totalDebt?: number;
  phone?: string | null;
  address?: string | null;
}

interface Product {
  id: number;
  sku: string;
  name: string;
  unit: string;
  stock: number;
  faultyQty?: number;
  pricePerM2?: number;
}

interface LedgerEntry {
  id: number;
  code: string;
  date: Date;
  type: "RECEIPT_BILL" | "EXPORT_BILL" | "SLIP" | "RETURN_DOC";
  description: string;
  debit: number;  // increases debt
  credit: number; // decreases debt
}

const fmt = (n: number | string) =>
  Number(n).toLocaleString("vi-VN");

const fmtDateRange = (dateStr: string) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
};

interface ReportSlip {
  id: number;
  code: string;
  createdAt: string;
  type: "RECEIPT" | "PAYMENT";
  note: string | null;
  amount: number | string;
  paymentMethod: "CASH" | "BANK_TRANSFER" | string;
  partnerId?: number | null;
}

interface ReportReceipt {
  id: number;
  code: string;
  invoiceNumber: string | null;
  createdAt: string;
  postTaxTotal: number | string;
  partnerId?: number | null;
}

interface ReportExport {
  id: number;
  code: string;
  createdAt: string;
  postTaxTotal: number | string;
  partnerId?: number | null;
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"DEBT" | "FINANCE" | "STOCK">("DEBT");
  
  // Data lists
  const [partners, setPartners] = useState<Partner[]>([]);
  const [slips, setSlips] = useState<ReportSlip[]>([]);
  const [receipts, setReceipts] = useState<ReportReceipt[]>([]);
  const [exports, setExports] = useState<ReportExport[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Debt Detailed Ledger filters
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Search filter for All-Partners Table
  const [partnerSearchQuery, setPartnerSearchQuery] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("gooli_token") || "" : "";

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [
        partnersData,
        slipsData,
        receiptsData,
        exportsData,
        productsData
      ] = await Promise.all([
        getPartners(token, { limit: 100 }),
        getSlips(token),
        getReceipts(token),
        getExports(token),
        getProducts({ limit: 100 })
      ]);
      setPartners(partnersData.items || []);
      setSlips(slipsData || []);
      setReceipts(receiptsData || []);
      setExports(exportsData || []);
      setProducts(productsData.items || []);
    } catch (error) {
      console.error("Lỗi tải báo cáo:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      Promise.resolve().then(() => {
        loadData();
      });
    }
  }, [token, loadData]);

  const selectedPartnerObj = partners.find(p => p.id === selectedPartnerId);

  // Tab 1 Calculations: Summaries & Top lists
  const totalReceivables = React.useMemo(() => {
    return partners
      .filter(p => p.type === "CUSTOMER")
      .reduce((sum, p) => sum + Number(p.totalDebt || 0), 0);
  }, [partners]);

  const totalPayables = React.useMemo(() => {
    return partners
      .filter(p => p.type === "SUPPLIER")
      .reduce((sum, p) => sum + Number(p.totalDebt || 0), 0);
  }, [partners]);

  const topDebtors = React.useMemo(() => {
    return [...partners]
      .filter(p => p.type === "CUSTOMER" && Number(p.totalDebt || 0) > 0)
      .sort((a, b) => Number(b.totalDebt || 0) - Number(a.totalDebt || 0))
      .slice(0, 5);
  }, [partners]);

  const topCreditors = React.useMemo(() => {
    return [...partners]
      .filter(p => p.type === "SUPPLIER" && Number(p.totalDebt || 0) > 0)
      .sort((a, b) => Number(b.totalDebt || 0) - Number(a.totalDebt || 0))
      .slice(0, 5);
  }, [partners]);

  const filteredPartnersList = React.useMemo(() => {
    return partners.filter(p => {
      const q = partnerSearchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
    });
  }, [partners, partnerSearchQuery]);

  // Generate detailed ledger statements for a partner
  const ledgerReport = React.useMemo(() => {
    if (!selectedPartnerId || !selectedPartnerObj) return { entries: [], openingBalance: 0, totalDebit: 0, totalCredit: 0, closingBalance: 0 };

    const isCustomer = selectedPartnerObj.type === "CUSTOMER";
    const allEntries: LedgerEntry[] = [];

    const partnerSlips = slips.filter(s => s.partnerId === selectedPartnerId);
    const partnerReceipts = receipts.filter(r => r.partnerId === selectedPartnerId);
    const partnerExports = exports.filter(e => e.partnerId === selectedPartnerId);

    // 1. Process Slips
    partnerSlips.forEach(s => {
      allEntries.push({
        id: s.id,
        code: s.code,
        date: new Date(s.createdAt),
        type: "SLIP",
        description: s.note || (s.type === "RECEIPT" ? "Thu tiền công nợ" : "Chi trả tiền mua hàng"),
        debit: 0,
        credit: Number(s.amount)
      });
    });

    // 2. Process Bills
    if (isCustomer) {
      partnerExports.forEach(e => {
        allEntries.push({
          id: e.id,
          code: e.code,
          date: new Date(e.createdAt),
          type: "EXPORT_BILL",
          description: `Xuất kho bán hàng ${e.code}`,
          debit: Number(e.postTaxTotal),
          credit: 0
        });
      });
    } else {
      partnerReceipts.forEach(r => {
        allEntries.push({
          id: r.id,
          code: r.invoiceNumber || r.code,
          date: new Date(r.createdAt),
          type: "RECEIPT_BILL",
          description: `Nhập kho từ NCC (Hóa đơn: ${r.invoiceNumber || r.code})`,
          debit: Number(r.postTaxTotal),
          credit: 0
        });
      });
    }

    allEntries.sort((a, b) => a.date.getTime() - b.date.getTime());

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    let openingBalance = 0;
    const filteredEntries: LedgerEntry[] = [];
    let rangeDebit = 0;
    let rangeCredit = 0;

    allEntries.forEach(entry => {
      const entryTime = entry.date.getTime();
      if (start && entryTime < start.getTime()) {
        openingBalance += entry.debit - entry.credit;
      } else if ((!start || entryTime >= start.getTime()) && (!end || entryTime <= end.getTime())) {
        filteredEntries.push(entry);
        rangeDebit += entry.debit;
        rangeCredit += entry.credit;
      } else if (!start && (!end || entryTime <= end.getTime())) {
        filteredEntries.push(entry);
        rangeDebit += entry.debit;
        rangeCredit += entry.credit;
      }
    });

    const closingBalance = openingBalance + rangeDebit - rangeCredit;

    return {
      entries: filteredEntries,
      openingBalance,
      totalDebit: rangeDebit,
      totalCredit: rangeCredit,
      closingBalance
    };
  }, [selectedPartnerId, selectedPartnerObj, slips, receipts, exports, startDate, endDate]);

  // Tab 2 Calculations: Financial cash flow & charts
  const financialReport = React.useMemo(() => {
    let receiptsTotal = 0;
    let paymentsTotal = 0;
    let bankTransferTotal = 0;
    let cashTotal = 0;

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    slips.forEach(slip => {
      const slipTime = new Date(slip.createdAt).getTime();
      if (start && slipTime < start.getTime()) return;
      if (end && slipTime > end.getTime()) return;

      const amt = Number(slip.amount);
      if (slip.type === "RECEIPT") {
        receiptsTotal += amt;
      } else {
        paymentsTotal += amt;
      }

      if (slip.paymentMethod === "BANK_TRANSFER") {
        bankTransferTotal += (slip.type === "RECEIPT" ? amt : -amt);
      } else if (slip.paymentMethod === "CASH") {
        cashTotal += (slip.type === "RECEIPT" ? amt : -amt);
      }
    });

    return {
      receiptsTotal,
      paymentsTotal,
      netFlow: receiptsTotal - paymentsTotal,
      bankTransferTotal,
      cashTotal
    };
  }, [slips, startDate, endDate]);

  const monthlyFlows = React.useMemo(() => {
    const flows: Record<string, { month: string; receipts: number; payments: number }> = {};
    const sortedSlips = [...slips].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    sortedSlips.forEach(slip => {
      const date = new Date(slip.createdAt);
      if (isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = `Tháng ${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
      
      if (!flows[key]) {
        flows[key] = { month: label, receipts: 0, payments: 0 };
      }
      
      const amt = Number(slip.amount || 0);
      if (slip.type === "RECEIPT") {
        flows[key].receipts += amt;
      } else {
        flows[key].payments += amt;
      }
    });
    
    return Object.values(flows).slice(-6); // Display up to 6 months
  }, [slips]);

  const maxMonthValue = React.useMemo(() => {
    let maxVal = 1000000;
    monthlyFlows.forEach(f => {
      if (f.receipts > maxVal) maxVal = f.receipts;
      if (f.payments > maxVal) maxVal = f.payments;
    });
    return maxVal;
  }, [monthlyFlows]);

  // Tab 3 Calculations: Inventory Valuation
  const totalStockValue = React.useMemo(() => {
    return products.reduce((sum, p) => sum + (Number(p.stock || 0) * Number(p.pricePerM2 || 450000)), 0);
  }, [products]);

  const lowStockProducts = React.useMemo(() => {
    return products.filter(p => Number(p.stock || 0) <= 5);
  }, [products]);

  const stockStats = React.useMemo(() => {
    const standard = products.reduce((sum, p) => sum + Number(p.stock || 0), 0);
    const faulty = products.reduce((sum, p) => sum + Number(p.faultyQty || 0), 0);
    const total = standard + faulty || 1;
    const rate = ((faulty / total) * 100).toFixed(1);
    return { standard, faulty, total, rate };
  }, [products]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans text-xs pb-10">
      {/* CSS for printing detailed ledger */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 10px;
            font-size: 12px;
            color: #000;
            background-color: #fff;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-center pb-1 border-b border-slate-200 no-print select-none">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ChartBar size={24} className="text-[#2563eb]" />
            Báo cáo & Đối soát
          </h1>
          <p className="text-slate-500 mt-1 text-[11px]">Báo cáo tổng hợp công nợ đối tác, doanh thu tài chính dòng tiền và giá trị tồn kho.</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border border-slate-200 bg-white p-1 rounded-xl shadow-2xs no-print select-none">
        <button
          onClick={() => {
            setActiveTab("DEBT");
            setSelectedPartnerId("");
          }}
          className={`flex-1 py-2.5 text-center font-bold text-xs transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer outline-none border-none ${
            activeTab === "DEBT" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Coins size={16} />
          Báo cáo công nợ & Đối soát
        </button>
        <button
          onClick={() => setActiveTab("FINANCE")}
          className={`flex-1 py-2.5 text-center font-bold text-xs transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer outline-none border-none ${
            activeTab === "FINANCE" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <ChartBar size={16} />
          Báo cáo tài chính & Dòng tiền
        </button>
        <button
          onClick={() => setActiveTab("STOCK")}
          className={`flex-1 py-2.5 text-center font-bold text-xs transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer outline-none border-none ${
            activeTab === "STOCK" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Package size={16} />
          Báo cáo tồn kho hiện tại
        </button>
      </div>

      {/* Main Tab Contents */}
      {loading ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center font-bold text-slate-400 no-print flex flex-col items-center justify-center gap-3">
          <svg className="animate-spin h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Đang tổng hợp dữ liệu báo cáo...</span>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* TAB 1: DEBT REPORT */}
          {activeTab === "DEBT" && (
            <div className="space-y-6">
              {/* If a partner is selected, show their ledger. If not, show the dashboard. */}
              {selectedPartnerId ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                  {/* Left Filters Sidebar */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4 no-print col-span-1">
                    <button
                      onClick={() => setSelectedPartnerId("")}
                      className="w-full py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-3xs"
                    >
                      <ArrowLeft size={14} weight="bold" />
                      Trở lại danh sách
                    </button>
                    
                    <h3 className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider flex items-center gap-1.5 border-t border-slate-100 pt-3 select-none">
                      <Calendar size={14} />
                      Bộ lọc đối soát
                    </h3>
                    
                    {/* Date range */}
                    <div className="space-y-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-500 font-bold">Từ ngày</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg text-[11px] font-bold focus:outline-none focus:border-[#2563eb] bg-slate-50"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-500 font-bold">Đến ngày</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg text-[11px] font-bold focus:outline-none focus:border-[#2563eb] bg-slate-50"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handlePrint}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Printer size={16} />
                      In sổ đối soát công nợ
                    </button>
                  </div>

                  {/* Right Ledger View */}
                  <div className="col-span-1 md:col-span-3">
                    <div id="print-area" className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
                      {/* Header printed style */}
                      <div className="text-center space-y-1 pb-4 border-b border-slate-100">
                        <h2 className="text-sm font-black text-slate-900 tracking-wider">
                          SỔ CHI TIẾT ĐỐI SOÁT CÔNG NỢ ĐỐI TÁC
                        </h2>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">
                          {startDate ? `Từ ngày: ${fmtDateRange(startDate)}` : ""} 
                          {endDate ? ` Đến ngày: ${fmtDateRange(endDate)}` : ""}
                          {!startDate && !endDate ? "Tất cả thời gian" : ""}
                        </p>
                      </div>

                      {/* Partner Details */}
                      <div className="grid grid-cols-2 gap-4 text-[11px] text-slate-600">
                        <div>
                          <div className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">Thông tin đối tác:</div>
                          <div className="mt-1.5 font-bold text-slate-900 text-xs">{selectedPartnerObj?.name}</div>
                          <div className="mt-0.5">Mã đối tác: <span className="font-mono font-bold text-slate-800">{selectedPartnerObj?.code}</span></div>
                          <div>Phân loại: <span className="font-bold text-slate-800">{selectedPartnerObj?.type === "CUSTOMER" ? "Khách hàng" : "Nhà cung cấp"}</span></div>
                        </div>
                        <div className="text-right flex flex-col justify-end">
                          <div>Điện thoại: <span className="font-bold text-slate-800">{selectedPartnerObj?.phone || "N/A"}</span></div>
                          <div>Địa chỉ: <span className="font-bold text-slate-800">{selectedPartnerObj?.address || "N/A"}</span></div>
                          <div className="font-extrabold mt-1.5 text-slate-900 text-xs">
                            Nợ hiện tại: {fmt(selectedPartnerObj?.totalDebt || 0)}đ
                          </div>
                        </div>
                      </div>

                      {/* Table Statement */}
                      <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                              <th className="py-2.5 px-3 border-r border-slate-200">Ngày ghi sổ</th>
                              <th className="py-2.5 px-3 border-r border-slate-200">Số chứng từ</th>
                              <th className="py-2.5 px-3 border-r border-slate-200">Diễn giải / Ghi chú</th>
                              <th className="py-2.5 px-3 text-right border-r border-slate-200">Phát sinh Tăng (+)</th>
                              <th className="py-2.5 px-3 text-right border-r border-slate-200">Phát sinh Giảm (-)</th>
                              <th className="py-2.5 px-3 text-right">Dư nợ lũy kế</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {/* Opening Balance Row */}
                            <tr className="bg-slate-50/35 font-bold italic">
                              <td className="py-2 px-3 border-r border-slate-100 text-slate-454 text-slate-400">Đầu kỳ</td>
                              <td className="py-2 px-3 border-r border-slate-100 text-slate-400">—</td>
                              <td className="py-2 px-3 border-r border-slate-100">Dư nợ đầu kỳ báo cáo</td>
                              <td className="py-2 px-3 text-right border-r border-slate-100">—</td>
                              <td className="py-2 px-3 text-right border-r border-slate-100">—</td>
                              <td className="py-2 px-3 text-right font-extrabold text-slate-900">
                                {fmt(ledgerReport.openingBalance)}đ
                              </td>
                            </tr>

                            {/* List entries */}
                            {ledgerReport.entries.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="py-8 text-center text-slate-400 italic font-semibold">
                                  Không có giao dịch phát sinh trong kỳ báo cáo này.
                                </td>
                              </tr>
                            ) : (
                              (() => {
                                let currentRunning = ledgerReport.openingBalance;
                                return ledgerReport.entries.map((entry, idx) => {
                                  currentRunning += entry.debit - entry.credit;
                                  return (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                      <td className="py-2 px-3 border-r border-slate-100 text-slate-500">
                                        {entry.date.toLocaleDateString("vi-VN")}
                                      </td>
                                      <td className="py-2 px-3 border-r border-slate-100 font-mono font-bold text-slate-800">
                                        {entry.code}
                                      </td>
                                      <td className="py-2 px-3 border-r border-slate-100 text-slate-600 max-w-[200px] truncate" title={entry.description}>
                                        {entry.description}
                                      </td>
                                      <td className="py-2 px-3 text-right border-r border-slate-100 font-bold text-emerald-600">
                                        {entry.debit > 0 ? `+${fmt(entry.debit)}đ` : "—"}
                                      </td>
                                      <td className="py-2 px-3 text-right border-r border-slate-100 font-bold text-rose-600">
                                        {entry.credit > 0 ? `-${fmt(entry.credit)}đ` : "—"}
                                      </td>
                                      <td className="py-2 px-3 text-right font-extrabold text-slate-950">
                                        {fmt(currentRunning)}đ
                                      </td>
                                    </tr>
                                  );
                                });
                              })()
                            )}

                            {/* Totals Summary Row */}
                            <tr className="bg-slate-50 border-t border-slate-200 font-extrabold text-slate-900 text-[12px]">
                              <td className="py-3 px-3 border-r border-slate-200">Tổng cộng</td>
                              <td className="py-3 px-3 border-r border-slate-200">—</td>
                              <td className="py-3 px-3 border-r border-slate-200">Số dư nợ cuối kỳ báo cáo</td>
                              <td className="py-3 px-3 text-right border-r border-slate-200 text-emerald-700">
                                +{fmt(ledgerReport.totalDebit)}đ
                              </td>
                              <td className="py-3 px-3 text-right border-r border-slate-200 text-rose-700">
                                -{fmt(ledgerReport.totalCredit)}đ
                              </td>
                              <td className="py-3 px-3 text-right bg-slate-100 font-black">
                                {fmt(ledgerReport.closingBalance)}đ
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Signature block for Printing */}
                      <div className="pt-12 hidden print:grid grid-cols-2 text-center text-xs">
                        <div>
                          <div className="font-bold text-gray-800">ĐẠI DIỆN ĐỐI TÁC</div>
                          <div className="text-[10px] text-gray-400 mt-1 italic">(Ký, ghi rõ họ tên)</div>
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">KẾ TOÁN CÔNG NỢ</div>
                          <div className="text-[10px] text-gray-400 mt-1 italic">(Ký, ghi rõ họ tên)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Debt Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                      <div className="space-y-1.5">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">TỔNG PHẢI THU KHÁCH HÀNG</span>
                        <span className="text-2xl font-black text-emerald-600 block font-mono">{fmt(totalReceivables)}đ</span>
                        <p className="text-slate-450 text-[10px] font-semibold">Công nợ tích lũy từ tất cả khách hàng mua sắm</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <TrendUp size={24} weight="bold" />
                      </div>
                    </div>
                    
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                      <div className="space-y-1.5">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">TỔNG PHẢI TRẢ NHÀ CUNG CẤP</span>
                        <span className="text-2xl font-black text-rose-600 block font-mono">{fmt(totalPayables)}đ</span>
                        <p className="text-slate-455 text-[10px] font-semibold">Công nợ tích lũy cần thanh toán cho các nhà cung cấp vật tư</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                        <TrendDown size={24} weight="bold" />
                      </div>
                    </div>
                  </div>

                  {/* Top 5 side by side */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none">
                    {/* Top 5 Customers */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                      <h3 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2">
                        <Users size={16} className="text-emerald-600" />
                        Top 5 Khách Hàng Nợ Nhiều Nhất
                      </h3>
                      <div className="space-y-3">
                        {topDebtors.length === 0 ? (
                          <p className="text-slate-400 italic py-4 text-center">Không có công nợ khách hàng.</p>
                        ) : (
                          topDebtors.map(d => {
                            const pct = Math.round((Number(d.totalDebt) / (totalReceivables || 1)) * 100);
                            return (
                              <div key={d.id} className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-semibold text-slate-855">{d.name} ({d.code})</span>
                                  <span className="font-bold font-mono text-slate-900">{fmt(d.totalDebt || 0)}đ</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Top 5 Suppliers */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                      <h3 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2">
                        <Users size={16} className="text-rose-600" />
                        Top 5 Nhà Cung Cấp Mình Nợ Nhiều Nhất
                      </h3>
                      <div className="space-y-3">
                        {topCreditors.length === 0 ? (
                          <p className="text-slate-400 italic py-4 text-center">Không có công nợ nhà cung cấp.</p>
                        ) : (
                          topCreditors.map(c => {
                            const pct = Math.round((Number(c.totalDebt) / (totalPayables || 1)) * 100);
                            return (
                              <div key={c.id} className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-semibold text-slate-855">{c.name} ({c.code})</span>
                                  <span className="font-bold font-mono text-slate-900">{fmt(c.totalDebt || 0)}đ</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  {/* All Partners Master Table */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="p-4 border-b border-slate-200 flex flex-wrap justify-between items-center gap-3 bg-slate-50/50">
                      <span className="text-slate-800 font-extrabold text-xs uppercase tracking-wider select-none">Danh sách công nợ tất cả đối tác</span>
                      <div className="relative w-64 max-w-xs select-none">
                        <input
                          type="text"
                          placeholder="Tìm đối tác (tên, mã)..."
                          value={partnerSearchQuery}
                          onChange={(e) => setPartnerSearchQuery(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-8 pr-3 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
                        />
                        <MagnifyingGlass size={14} className="text-slate-400 absolute left-2.5 top-2.5" />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] select-none">
                            <th className="py-3 px-5">Mã đối tác</th>
                            <th className="py-3 px-5">Tên đối tác</th>
                            <th className="py-3 px-5">Phân loại</th>
                            <th className="py-3 px-5">Số điện thoại</th>
                            <th className="py-3 px-5 text-right">Công nợ hiện tại</th>
                            <th className="py-3 px-5 text-center">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {filteredPartnersList.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-10 text-center text-slate-400 italic">
                                Không tìm thấy đối tác nào phù hợp.
                              </td>
                            </tr>
                          ) : (
                            filteredPartnersList.map(p => (
                              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-2.5 px-5 font-mono font-bold text-slate-800">{p.code}</td>
                                <td className="py-2.5 px-5 font-bold text-slate-900">{p.name}</td>
                                <td className="py-2.5 px-5">
                                  {p.type === "CUSTOMER" ? (
                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-[9px] font-bold">Khách hàng</span>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100 text-[9px] font-bold">Nhà cung cấp</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-5 text-slate-550 font-medium">{p.phone || "—"}</td>
                                <td className={`py-2.5 px-5 text-right font-black font-mono ${Number(p.totalDebt || 0) > 0 ? (p.type === 'CUSTOMER' ? 'text-emerald-600' : 'text-rose-600') : 'text-slate-500'}`}>
                                  {fmt(p.totalDebt || 0)}đ
                                </td>
                                <td className="py-2.5 px-5 text-center">
                                  <button
                                    onClick={() => setSelectedPartnerId(p.id)}
                                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer transition-all duration-150 text-[10px]"
                                  >
                                    Xem đối soát
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FINANCE CASH FLOW REPORT */}
          {activeTab === "FINANCE" && (
            <div className="space-y-6">
              
              {/* Date Filters */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3 no-print select-none">
                <Calendar size={15} className="text-slate-400" />
                <span className="font-bold text-slate-700">Thời gian báo cáo:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-200 bg-slate-50 font-bold rounded-lg text-[11px] outline-none focus:border-[#2563eb]"
                />
                <span className="text-slate-450 select-none">đến</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-200 bg-slate-50 font-bold rounded-lg text-[11px] outline-none focus:border-[#2563eb]"
                />
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
                {/* Receipts Card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 shadow-2xs space-y-2">
                  <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">TỔNG THU SỔ QUỸ</div>
                  <div className="text-2xl font-black text-emerald-600 font-mono">
                    +{fmt(financialReport.receiptsTotal)}đ
                  </div>
                  <p className="text-slate-450 text-[10px]">Tổng số tiền thu từ khách hàng qua phiếu thu</p>
                </div>

                {/* Payments Card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-rose-500 shadow-2xs space-y-2">
                  <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">TỔNG CHI SỔ QUỸ</div>
                  <div className="text-2xl font-black text-rose-600 font-mono">
                    -{fmt(financialReport.paymentsTotal)}đ
                  </div>
                  <p className="text-slate-450 text-[10px]">Tổng số tiền thanh toán cho nhà cung cấp qua phiếu chi</p>
                </div>

                {/* Net Flow Card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-slate-900 shadow-2xs space-y-2">
                  <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">DÒNG TIỀN THUẦN (NET CASH FLOW)</div>
                  <div className={`text-2xl font-black font-mono ${financialReport.netFlow >= 0 ? "text-slate-900" : "text-rose-700"}`}>
                    {financialReport.netFlow >= 0 ? "+" : ""} {fmt(financialReport.netFlow)}đ
                  </div>
                  <p className="text-slate-450 text-[10px]">Hiệu số Thu nhập trừ Chi phí thực tế trong kỳ báo cáo</p>
                </div>
              </div>

              {/* Monthly Cash Flow Chart using Pure CSS/Tailwind */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-6">
                <div className="flex justify-between items-center select-none">
                  <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                    <ChartBar size={18} className="text-[#2563eb]" />
                    Xu hướng thu chi quỹ két (6 tháng gần đây)
                  </h3>
                </div>

                {monthlyFlows.length === 0 ? (
                  <p className="text-slate-400 italic py-10 text-center">Chưa có giao dịch phát sinh để vẽ biểu đồ.</p>
                ) : (
                  <div className="space-y-4">
                    {/* Chart columns container */}
                    <div className="h-64 flex items-end justify-around border-b border-slate-200 pb-2 pt-6">
                      {monthlyFlows.map((flow, idx) => {
                        const recHeight = (flow.receipts / maxMonthValue) * 100;
                        const payHeight = (flow.payments / maxMonthValue) * 100;
                        return (
                          <div key={idx} className="flex flex-col items-center gap-1 w-1/6 group">
                            {/* Combined bars */}
                            <div className="flex items-end gap-1.5 h-48 w-full justify-center">
                              {/* Receipts Bar */}
                              <div 
                                className="bg-emerald-500 hover:bg-emerald-600 rounded-t-sm w-4 sm:w-6 transition-all duration-500 relative cursor-pointer"
                                style={{ height: `${Math.max(4, recHeight)}%` }}
                                title={`Thu: ${fmt(flow.receipts)}đ`}
                              >
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-slate-900 text-white font-mono font-bold text-[9px] py-0.5 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none mb-1 whitespace-nowrap z-10 shadow-sm">
                                  +{fmt(flow.receipts)}
                                </div>
                              </div>
                              {/* Payments Bar */}
                              <div 
                                className="bg-rose-500 hover:bg-rose-600 rounded-t-sm w-4 sm:w-6 transition-all duration-500 relative cursor-pointer"
                                style={{ height: `${Math.max(4, payHeight)}%` }}
                                title={`Chi: ${fmt(flow.payments)}đ`}
                              >
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-slate-900 text-white font-mono font-bold text-[9px] py-0.5 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none mb-1 whitespace-nowrap z-10 shadow-sm">
                                  -{fmt(flow.payments)}
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 mt-2 select-none">{flow.month}</span>
                          </div>
                        );
                      })}
                    </div>
                    {/* Legend */}
                    <div className="flex gap-4 text-[10px] font-bold uppercase text-slate-500 justify-center select-none pt-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span>
                        <span>Tổng tiền thu (+)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm"></span>
                        <span>Tổng tiền chi (-)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Methods breakdown */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 select-none">
                <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Coins size={16} className="text-[#2563eb]" />
                  Thống kê theo phương thức thanh toán sổ quỹ
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-800 text-xs">Chuyển khoản (BANK_TRANSFER)</div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Giá trị giao dịch qua tài khoản ngân hàng</div>
                    </div>
                    <div className={`text-sm font-extrabold font-mono ${financialReport.bankTransferTotal >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {financialReport.bankTransferTotal >= 0 ? "+" : ""}{fmt(financialReport.bankTransferTotal)}đ
                    </div>
                  </div>

                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-800 text-xs">Tiền mặt (CASH)</div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Giá trị giao dịch thanh toán bằng tiền mặt tại két</div>
                    </div>
                    <div className={`text-sm font-extrabold font-mono ${financialReport.cashTotal >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {financialReport.cashTotal >= 0 ? "+" : ""}{fmt(financialReport.cashTotal)}đ
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: CURRENT INVENTORY STOCK REPORT */}
          {activeTab === "STOCK" && (
            <div className="space-y-6">
              {/* Stock Dashboard metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
                {/* Total Stock Capital */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div className="space-y-1.5">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">TỔNG GIÁ TRỊ VỐN TỒN KHO</span>
                    <span className="text-2xl font-black text-slate-900 block font-mono">{fmt(totalStockValue)}đ</span>
                    <p className="text-slate-450 text-[10px] font-semibold">Ước tính theo đơn giá định mức của sản phẩm</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0">
                    <Package size={24} weight="bold" />
                  </div>
                </div>

                {/* Total Qty (Standard vs Faulty) */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div className="space-y-1.5">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">TỔNG SỐ LƯỢNG TỒN KHO</span>
                    <span className="text-2xl font-black text-slate-900 block font-mono">{stockStats.total.toLocaleString()}</span>
                    <div className="text-[10px] font-bold text-slate-500 flex gap-2">
                      <span className="text-emerald-600">Đạt chuẩn: {stockStats.standard.toLocaleString()}</span>
                      <span className="text-rose-600">Lỗi/Hỏng: {stockStats.faulty.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-650 flex items-center justify-center shrink-0">
                    <List size={24} weight="bold" />
                  </div>
                </div>

                {/* Faulty Quality Audit Rate */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div className="space-y-1.5">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">TỶ LỆ LỖI/HỎNG (FAULTY RATE)</span>
                    <span className="text-2xl font-black text-rose-600 block font-mono">{stockStats.rate}%</span>
                    <p className="text-slate-450 text-[10px] font-semibold">Tỷ lệ hao hụt lỗi hỏng trên tổng số hàng hiện tại</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <WarningCircle size={24} weight="bold" />
                  </div>
                </div>
              </div>

              {/* Warnings and Alerts Panels */}
              {lowStockProducts.length > 0 && (
                <div className="bg-amber-50/30 border border-amber-100 p-4 rounded-xl space-y-2.5 select-none">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                    <WarningCircle size={14} weight="bold" />
                    Cảnh Báo Tồn Kho Sắp Hết Hạn Mức An Toàn
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {lowStockProducts.map(p => (
                      <div key={p.id} className="bg-white border border-amber-100 p-2.5 rounded-lg flex items-center justify-between text-xs shadow-3xs">
                        <div>
                          <div className="font-bold text-slate-800">{p.name}</div>
                          <div className="font-mono text-[10px] text-slate-400 font-bold mt-0.5">{p.sku}</div>
                        </div>
                        <span className="px-2 py-1 bg-amber-50 border border-amber-200 text-amber-800 font-black font-mono rounded-lg text-[10px]">
                          Tồn: {p.stock} {p.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Main inventory table */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 select-none">
                  <Package size={16} className="text-[#2563eb]" />
                  Báo cáo lượng tồn kho hiện tại chi tiết
                </h3>

                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] select-none">
                        <th className="py-3 px-4">Mã SKU</th>
                        <th className="py-3 px-4">Tên sản phẩm</th>
                        <th className="py-3 px-4">Đơn vị tính</th>
                        <th className="py-3 px-4 text-right">Tồn kho chuẩn (Đạt chuẩn)</th>
                        <th className="py-3 px-4 text-right">Tồn hàng hỏng (Lỗi/Hỏng)</th>
                        <th className="py-3 px-4">Trạng thái tồn kho</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {products.map((prod) => (
                        <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-2.5 px-4 font-mono font-bold text-slate-800">{prod.sku}</td>
                          <td className="py-2.5 px-4 font-bold text-slate-900">{prod.name}</td>
                          <td className="py-2.5 px-4 text-slate-500 font-medium">{prod.unit}</td>
                          <td className="py-2.5 px-4 text-right font-black font-mono text-slate-900">
                            {Number(prod.stock).toLocaleString("vi-VN")}
                          </td>
                          <td className="py-2.5 px-4 text-right font-bold font-mono text-rose-600">
                            {Number(prod.faultyQty || 0).toLocaleString("vi-VN")}
                          </td>
                          <td className="py-2.5 px-4">
                            {prod.stock <= 5 ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200/50 text-[9px] uppercase tracking-wider select-none">
                                Tồn kho thấp
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/50 text-[9px] uppercase tracking-wider select-none">
                                Đảm bảo an toàn
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
