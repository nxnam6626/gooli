import React from "react";
import Link from "next/link";
import { FileArrowDown, Plus } from "@phosphor-icons/react";
import { useReceiptAdmin } from "../hooks/useReceiptAdmin";
import ReceiptMetrics from "./ReceiptMetrics";
import ReceiptFilters from "./ReceiptFilters";
import ReceiptTable from "./ReceiptTable";
import ReceiptDetails from "./ReceiptDetails";

export default function ReceiptAdminDashboard() {
  const {
    partners,
    loading,
    actionId,
    selectedReceipt,
    setSelectedReceipt,
    perms,
    searchQuery,
    setSearchQuery,
    selectedPartnerId,
    setSelectedPartnerId,
    selectedStatus,
    setSelectedStatus,
    activeSubTab,
    setActiveSubTab,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isDatePickerOpen,
    setIsDatePickerOpen,
    tempStartDate,
    setTempStartDate,
    tempEndDate,
    setTempEndDate,
    getDateDisplayString,
    handleAction,
    incomingReceipts,
    completedReceipts,
    filteredReceipts,
    metrics,
    receipts
  } = useReceiptAdmin();

  const fmt = (n: number | string) => Number(n).toLocaleString("vi-VN");

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
      <div className="flex gap-4 border-b border-slate-200 pb-0.5 select-none bg-transparent">
        <button
          onClick={() => setActiveSubTab("incoming")}
          className={`flex items-center gap-2 py-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer bg-transparent border-none outline-none ${
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
          className={`flex items-center gap-2 py-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer bg-transparent border-none outline-none ${
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
      <ReceiptMetrics metrics={metrics} />

      {/* 4. Filter bar */}
      <ReceiptFilters
        activeSubTab={activeSubTab}
        selectedPartnerId={selectedPartnerId}
        setSelectedPartnerId={setSelectedPartnerId}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        partners={partners}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        isDatePickerOpen={isDatePickerOpen}
        setIsDatePickerOpen={setIsDatePickerOpen}
        tempStartDate={tempStartDate}
        setTempStartDate={setTempStartDate}
        tempEndDate={tempEndDate}
        setTempEndDate={setTempEndDate}
        getDateDisplayString={getDateDisplayString}
      />

      {/* 5. Goods Information Table */}
      <ReceiptTable
        loading={loading}
        filteredReceipts={filteredReceipts}
        selectedReceipt={selectedReceipt}
        setSelectedReceipt={setSelectedReceipt}
        actionId={actionId}
        handleAction={handleAction}
        perms={perms}
      />

      {/* Footer Summary */}
      {!loading && filteredReceipts.length > 0 && (
        <div className="px-4 py-4 bg-slate-50 border border-slate-200 border-t-0 rounded-b-xl flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
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

      {/* RECEIPT DETAIL MODAL */}
      <ReceiptDetails
        selectedReceipt={selectedReceipt}
        setSelectedReceipt={setSelectedReceipt}
        actionId={actionId}
        handleAction={handleAction}
        perms={perms}
      />
    </div>
  );
}
