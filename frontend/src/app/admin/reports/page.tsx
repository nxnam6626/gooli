"use client";

import React, { useState, useEffect } from "react";
import { 
  getPartners, 
  getSlips, 
  getReceipts, 
  getExports, 
  getCustomerReturns, 
  getSupplierReturns,
  getProducts
} from "../../../services/api";
import { ChartBar, Coins, Printer, Calendar, List, Package } from "@phosphor-icons/react";

interface Partner {
  id: number;
  code: string;
  name: string;
  type: "CUSTOMER" | "SUPPLIER";
  totalDebt: number;
  phone?: string;
  address?: string;
}

interface Product {
  id: number;
  sku: string;
  name: string;
  unit: string;
  stock: number;
  faultyQty: number;
}

interface LedgerEntry {
  id: number;
  code: string;
  date: Date;
  type: "RECEIPT_BILL" | "EXPORT_BILL" | "SLIP" | "RETURN_DOC";
  description: string;
  debit: number;  // increases debt (+ for supplier, + for customer)
  credit: number; // decreases debt (- for supplier, - for customer)
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"DEBT" | "FINANCE" | "STOCK">("DEBT");
  
  // Data lists
  const [partners, setPartners] = useState<any[]>([]);
  const [slips, setSlips] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [exports, setExports] = useState<any[]>([]);
  const [customerReturns, setCustomerReturns] = useState<any[]>([]);
  const [supplierReturns, setSupplierReturns] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Debt Detailed Ledger filters
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("gooli_token") || "" : "";

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        partnersData,
        slipsData,
        receiptsData,
        exportsData,
        custReturnsData,
        suppReturnsData,
        productsData
      ] = await Promise.all([
        getPartners(token, { limit: 100 }),
        getSlips(token),
        getReceipts(token),
        getExports(token),
        getCustomerReturns(token),
        getSupplierReturns(token),
        getProducts({ limit: 100 })
      ]);
      setPartners(partnersData.items || []);
      setSlips(slipsData || []);
      setReceipts(receiptsData || []);
      setExports(exportsData || []);
      setCustomerReturns(custReturnsData || []);
      setSupplierReturns(suppReturnsData || []);
      setProducts(productsData.items || []);
    } catch (error) {
      console.error("Lỗi tải báo cáo:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const selectedPartnerObj = partners.find(p => p.id === selectedPartnerId);

  // Generate detailed ledger statements for a partner
  const ledgerReport = React.useMemo(() => {
    if (!selectedPartnerId || !selectedPartnerObj) return { entries: [], openingBalance: 0, totalDebit: 0, totalCredit: 0, closingBalance: 0 };

    const isCustomer = selectedPartnerObj.type === "CUSTOMER";
    const allEntries: LedgerEntry[] = [];

    // Filter items belonging to the selected partner
    const partnerSlips = slips.filter(s => s.partnerId === selectedPartnerId);
    const partnerReceipts = receipts.filter(r => r.partnerId === selectedPartnerId);
    const partnerExports = exports.filter(e => e.partnerId === selectedPartnerId);
    const partnerCustomerReturns = customerReturns.filter(cr => cr.partnerId === selectedPartnerId);
    const partnerSupplierReturns = supplierReturns.filter(sr => sr.partnerId === selectedPartnerId);

    // 1. Process Slips
    // Slips decrease debt for both (PAYMENT decreases supplier debt, RECEIPT decreases customer debt)
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
      // Export bills increase customer debt
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

      // Customer Returns decrease customer debt
      partnerCustomerReturns.forEach(cr => {
        allEntries.push({
          id: cr.id,
          code: cr.code,
          date: new Date(cr.createdAt),
          type: "RETURN_DOC",
          description: cr.note || `Nhận hàng trả lại ${cr.code}`,
          debit: 0,
          credit: Number(cr.postTaxTotal)
        });
      });
    } else {
      // Receipt bills increase supplier debt
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

      // Supplier Returns decrease supplier debt
      partnerSupplierReturns.forEach(sr => {
        allEntries.push({
          id: sr.id,
          code: sr.code,
          date: new Date(sr.createdAt),
          type: "RETURN_DOC",
          description: sr.note || `Xuất trả hàng lỗi ${sr.code}`,
          debit: 0,
          credit: Number(sr.postTaxTotal)
        });
      });
    }

    // Sort entries chronologically
    allEntries.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Filter by date range if provided
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    let openingBalance = 0;
    const filteredEntries: LedgerEntry[] = [];
    let rangeDebit = 0;
    let rangeCredit = 0;

    // Calculate opening balance before startDate and filter entries inside date range
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
  }, [selectedPartnerId, selectedPartnerObj, slips, receipts, exports, customerReturns, supplierReturns, startDate, endDate]);

  // Financial cash flow calculation
  const financialReport = React.useMemo(() => {
    let receiptsTotal = 0;
    let paymentsTotal = 0;
    let bankTransferTotal = 0;
    let cashTotal = 0;

    // Filter by date range if provided
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 font-sans text-xs">
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
      <div className="flex justify-between items-center pb-2 border-b border-gray-200 no-print">
        <div>
          <h1 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <ChartBar size={20} className="text-slate-700 font-bold" />
            Trung tâm Báo cáo & Đối soát
          </h1>
          <p className="text-gray-500 mt-0.5 text-[11px]">Báo cáo công nợ khách hàng/NCC, doanh thu sổ quỹ và tồn kho sản phẩm</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-200 bg-white p-1 rounded-t-lg shadow-sm no-print">
        <button
          onClick={() => setActiveTab("DEBT")}
          className={`flex-1 py-2 text-center font-bold text-xs transition-colors rounded flex items-center justify-center gap-1.5 ${activeTab === "DEBT" ? "bg-slate-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}
        >
          <Coins size={16} />
          Báo cáo công nợ chi tiết
        </button>
        <button
          onClick={() => setActiveTab("FINANCE")}
          className={`flex-1 py-2 text-center font-bold text-xs transition-colors rounded flex items-center justify-center gap-1.5 ${activeTab === "FINANCE" ? "bg-slate-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}
        >
          <ChartBar size={16} />
          Báo cáo tài chính & Dòng tiền
        </button>
        <button
          onClick={() => setActiveTab("STOCK")}
          className={`flex-1 py-2 text-center font-bold text-xs transition-colors rounded flex items-center justify-center gap-1.5 ${activeTab === "STOCK" ? "bg-slate-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}
        >
          <Package size={16} />
          Báo cáo tồn kho hiện tại
        </button>
      </div>

      {/* Main Tab Contents */}
      {loading ? (
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center font-semibold text-gray-500 no-print">
          Đang tổng hợp dữ liệu báo cáo...
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* TAB 1: DEBT REPORT */}
          {activeTab === "DEBT" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              
              {/* Left Filters Sidebar */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4 no-print col-span-1">
                <h3 className="font-bold text-gray-800 text-xs flex items-center gap-1">
                  <Calendar size={14} />
                  Bộ lọc đối soát
                </h3>
                
                {/* Select Partner */}
                <div>
                  <label className="block text-gray-500 font-bold mb-1">Đối tác cần lập đối soát</label>
                  <select
                    value={selectedPartnerId}
                    onChange={(e) => setSelectedPartnerId(e.target.value ? Number(e.target.value) : "")}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 text-[11px]"
                  >
                    <option value="">-- Chọn đối tác --</option>
                    {partners.map(p => (
                      <option key={p.id} value={p.id}>
                        [{p.type === "CUSTOMER" ? "Khách" : "NCC"}] {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date range */}
                <div className="space-y-2">
                  <div>
                    <label className="block text-gray-500 font-bold mb-1">Từ ngày</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-1.5 border border-gray-300 rounded text-[11px] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 font-bold mb-1">Đến ngày</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-1.5 border border-gray-300 rounded text-[11px] focus:outline-none"
                    />
                  </div>
                </div>

                {selectedPartnerId && (
                  <button
                    onClick={handlePrint}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                  >
                    <Printer size={16} />
                    In Sổ Chi Tiết Công Nợ
                  </button>
                )}
              </div>

              {/* Right Ledger View */}
              <div className="col-span-1 md:col-span-3">
                {!selectedPartnerId ? (
                  <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-400 no-print">
                    Vui lòng chọn đối tác bên cột bộ lọc để hiển thị Sổ chi tiết đối soát công nợ.
                  </div>
                ) : (
                  <div id="print-area" className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
                    {/* Header printed style */}
                    <div className="text-center space-y-1 pb-4 border-b border-gray-200">
                      <h2 className="text-base font-extrabold text-gray-900 tracking-wider">
                        SỔ CHI TIẾT CÔNG NỢ ĐỐI TÁC
                      </h2>
                      <p className="text-gray-500 text-[10px]">
                        {startDate ? `Từ ngày: ${new Date(startDate).toLocaleDateString("vi-VN")}` : ""} 
                        {endDate ? ` Đến ngày: ${new Date(endDate).toLocaleDateString("vi-VN")}` : ""}
                        {!startDate && !endDate ? "Tất cả thời gian" : ""}
                      </p>
                    </div>

                    {/* Partner Details */}
                    <div className="grid grid-cols-2 gap-4 text-[11px] text-gray-700">
                      <div>
                        <div className="font-bold text-slate-800 uppercase">Thông tin đối tác:</div>
                        <div className="mt-1 font-semibold text-gray-900 text-xs">{selectedPartnerObj?.name}</div>
                        <div>Mã đối tác: <span className="font-mono font-semibold">{selectedPartnerObj?.code}</span></div>
                        <div>Phân loại: <span className="font-semibold">{selectedPartnerObj?.type === "CUSTOMER" ? "Khách hàng" : "Nhà cung cấp"}</span></div>
                      </div>
                      <div className="text-right">
                        <div>Điện thoại: {selectedPartnerObj?.phone || "N/A"}</div>
                        <div>Địa chỉ: {selectedPartnerObj?.address || "N/A"}</div>
                        <div className="font-bold mt-1 text-slate-900 text-xs">
                          Nợ hiện tại trên hệ thống: {Number(selectedPartnerObj?.totalDebt || 0).toLocaleString("vi-VN")} đ
                        </div>
                      </div>
                    </div>

                    {/* Table Statement */}
                    <table className="w-full text-left border-collapse text-[11px] border border-gray-300">
                      <thead>
                        <tr className="bg-slate-100 border-b border-gray-300 text-gray-700 font-bold">
                          <th className="py-2 px-3 border-r border-gray-300">Ngày ghi sổ</th>
                          <th className="py-2 px-3 border-r border-gray-300">Số chứng từ</th>
                          <th className="py-2 px-3 border-r border-gray-300">Diễn giải / Ghi chú</th>
                          <th className="py-2 px-3 text-right border-r border-gray-300">Phát sinh Tăng (+)</th>
                          <th className="py-2 px-3 text-right border-r border-gray-300">Phát sinh Giảm (-)</th>
                          <th className="py-2 px-3 text-right">Dư nợ lũy kế</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-300 text-gray-700">
                        {/* Opening Balance Row */}
                        <tr className="bg-slate-50/50 font-semibold italic">
                          <td className="py-2 px-3 border-r border-gray-300 text-gray-400">Đầu kỳ</td>
                          <td className="py-2 px-3 border-r border-gray-300 text-gray-400">-</td>
                          <td className="py-2 px-3 border-r border-gray-300">Dư nợ đầu kỳ báo cáo</td>
                          <td className="py-2 px-3 text-right border-r border-gray-300">-</td>
                          <td className="py-2 px-3 text-right border-r border-gray-300">-</td>
                          <td className="py-2 px-3 text-right font-extrabold text-slate-900">
                            {ledgerReport.openingBalance.toLocaleString("vi-VN")} đ
                          </td>
                        </tr>

                        {/* List entries */}
                        {ledgerReport.entries.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-gray-400 italic">
                              Không có giao dịch phát sinh trong kỳ báo cáo này.
                            </td>
                          </tr>
                        ) : (
                          (() => {
                            let currentRunning = ledgerReport.openingBalance;
                            return ledgerReport.entries.map((entry, idx) => {
                              currentRunning += entry.debit - entry.credit;
                              return (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="py-2 px-3 border-r border-gray-300 text-gray-500">
                                    {entry.date.toLocaleDateString("vi-VN")}
                                  </td>
                                  <td className="py-2 px-3 border-r border-gray-300 font-mono font-bold text-slate-800">
                                    {entry.code}
                                  </td>
                                  <td className="py-2 px-3 border-r border-gray-300 text-gray-600 max-w-[200px] truncate" title={entry.description}>
                                    {entry.description}
                                  </td>
                                  <td className="py-2 px-3 text-right border-r border-gray-300 font-semibold text-emerald-600">
                                    {entry.debit > 0 ? `+${entry.debit.toLocaleString("vi-VN")} đ` : "-"}
                                  </td>
                                  <td className="py-2 px-3 text-right border-r border-gray-300 font-semibold text-rose-600">
                                    {entry.credit > 0 ? `-${entry.credit.toLocaleString("vi-VN")} đ` : "-"}
                                  </td>
                                  <td className="py-2 px-3 text-right font-extrabold text-slate-950">
                                    {currentRunning.toLocaleString("vi-VN")} đ
                                  </td>
                                </tr>
                              );
                            });
                          })()
                        )}

                        {/* Totals Summary Row */}
                        <tr className="bg-slate-100 font-extrabold text-slate-900">
                          <td className="py-2.5 px-3 border-r border-gray-300">Tổng cộng</td>
                          <td className="py-2.5 px-3 border-r border-gray-300">-</td>
                          <td className="py-2.5 px-3 border-r border-gray-300">Số dư nợ cuối kỳ báo cáo</td>
                          <td className="py-2.5 px-3 text-right border-r border-gray-300 text-emerald-700">
                            +{ledgerReport.totalDebit.toLocaleString("vi-VN")} đ
                          </td>
                          <td className="py-2.5 px-3 text-right border-r border-gray-300 text-rose-700">
                            -{ledgerReport.totalCredit.toLocaleString("vi-VN")} đ
                          </td>
                          <td className="py-2.5 px-3 text-right bg-slate-200">
                            {ledgerReport.closingBalance.toLocaleString("vi-VN")} đ
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Signature block for Printing */}
                    <div className="pt-10 hidden print:grid grid-cols-2 text-center text-xs">
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
                )}
              </div>

            </div>
          )}

          {/* TAB 2: FINANCE CASH FLOW REPORT */}
          {activeTab === "FINANCE" && (
            <div className="space-y-4">
              
              {/* Date Filters */}
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3 no-print">
                <Calendar size={14} className="text-gray-400" />
                <span className="font-semibold text-gray-600">Thời gian báo cáo:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-[11px]"
                />
                <span className="text-gray-400">đến</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-[11px]"
                />
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Receipts Card */}
                <div className="bg-white p-4 rounded-lg border-l-4 border-emerald-500 border-t border-r border-b border-gray-200 shadow-sm space-y-1.5">
                  <div className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">TỔNG THU SỔ QUỸ</div>
                  <div className="text-xl font-extrabold text-emerald-600">
                    +{financialReport.receiptsTotal.toLocaleString("vi-VN")} đ
                  </div>
                  <p className="text-gray-400 text-[10px]">Tổng số tiền thu từ khách hàng qua phiếu thu</p>
                </div>

                {/* Payments Card */}
                <div className="bg-white p-4 rounded-lg border-l-4 border-rose-500 border-t border-r border-b border-gray-200 shadow-sm space-y-1.5">
                  <div className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">TỔNG CHI SỔ QUỸ</div>
                  <div className="text-xl font-extrabold text-rose-600">
                    -{financialReport.paymentsTotal.toLocaleString("vi-VN")} đ
                  </div>
                  <p className="text-gray-400 text-[10px]">Tổng số tiền thanh toán cho nhà cung cấp qua phiếu chi</p>
                </div>

                {/* Net Flow Card */}
                <div className="bg-white p-4 rounded-lg border-l-4 border-slate-900 border-t border-r border-b border-gray-200 shadow-sm space-y-1.5">
                  <div className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">DÒNG TIỀN THUẦN (NET CASH FLOW)</div>
                  <div className={`text-xl font-extrabold ${financialReport.netFlow >= 0 ? "text-slate-900" : "text-rose-700"}`}>
                    {financialReport.netFlow >= 0 ? "+" : ""} {financialReport.netFlow.toLocaleString("vi-VN")} đ
                  </div>
                  <p className="text-gray-400 text-[10px]">Hiệu số Thu nhập trừ Chi phí trong kỳ báo cáo</p>
                </div>

              </div>

              {/* Payment Methods breakdown */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-3">
                <h3 className="font-bold text-gray-800 text-xs flex items-center gap-1">
                  <Coins size={14} />
                  Thống kê theo phương thức thanh toán
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded border border-gray-200 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-gray-700">Chuyển khoản (BANK_TRANSFER)</div>
                      <div className="text-[10px] text-gray-400">Tiền trong tài khoản ngân hàng tăng/giảm</div>
                    </div>
                    <div className={`text-sm font-extrabold ${financialReport.bankTransferTotal >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {financialReport.bankTransferTotal.toLocaleString("vi-VN")} đ
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded border border-gray-200 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-gray-700">Tiền mặt (CASH)</div>
                      <div className="text-[10px] text-gray-400">Lượng tiền mặt tồn tại quỹ két</div>
                    </div>
                    <div className={`text-sm font-extrabold ${financialReport.cashTotal >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {financialReport.cashTotal.toLocaleString("vi-VN")} đ
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: CURRENT INVENTORY STOCK REPORT */}
          {activeTab === "STOCK" && (
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                  <Package size={16} />
                  Báo cáo lượng tồn kho hiện tại
                </h3>
              </div>

              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-gray-200 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      <th className="py-2 px-3">Mã SKU</th>
                      <th className="py-2 px-3">Tên sản phẩm</th>
                      <th className="py-2 px-3">Đơn vị tính</th>
                      <th className="py-2 px-3 text-right">Tồn kho chuẩn (Đạt chuẩn)</th>
                      <th className="py-2 px-3 text-right">Tồn hàng hỏng (Lỗi/Hỏng)</th>
                      <th className="py-2 px-3">Trạng thái tồn kho</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-[11px] text-gray-700">
                    {products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-2 px-3 font-mono font-bold text-slate-800">{prod.sku}</td>
                        <td className="py-2 px-3 font-semibold text-gray-900">{prod.name}</td>
                        <td className="py-2 px-3 text-gray-500">{prod.unit}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">
                          {Number(prod.stock).toLocaleString("vi-VN")}
                        </td>
                        <td className="py-2 px-3 text-right font-semibold text-rose-600">
                          {Number(prod.faultyQty).toLocaleString("vi-VN")}
                        </td>
                        <td className="py-2 px-3">
                          {prod.stock <= 5 ? (
                            <span className="px-1.5 py-0.5 rounded bg-yellow-50 text-yellow-800 font-bold border border-yellow-200 text-[9px]">
                              Tồn kho thấp
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[9px]">
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
          )}

        </div>
      )}
    </div>
  );
}
