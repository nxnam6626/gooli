"use client";

import React from "react";
import { Coins, Plus, Funnel } from "@phosphor-icons/react";
import { useFinanceAdmin } from "../hooks/useFinanceAdmin";
import SlipTable from "./SlipTable";
import SlipForm from "./SlipForm";

export default function FinanceDashboard() {
  const {
    loading,
    typeFilter,
    setTypeFilter,
    searchPartner,
    setSearchPartner,
    showModal,
    setShowModal,
    submitting,
    errorMsg,
    setErrorMsg,
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
    filteredSlips,
    handleSubmit,
  } = useFinanceAdmin();

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Coins size={20} className="text-slate-700" />
            Quản lý Sổ quỹ & Phiếu thu/chi
          </h1>
          <p className="text-gray-500 mt-0.5 text-[11px]">
            Theo dõi dòng tiền thu chi trực tiếp hoặc gối đầu FIFO
          </p>
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
            className={`px-3 py-1 font-semibold cursor-pointer ${
              typeFilter === "ALL"
                ? "bg-slate-100 text-slate-800"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setTypeFilter("RECEIPT")}
            className={`px-3 py-1 font-semibold border-l border-gray-300 cursor-pointer ${
              typeFilter === "RECEIPT"
                ? "bg-emerald-50 text-emerald-800"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Phiếu thu (Thu tiền)
          </button>
          <button
            onClick={() => setTypeFilter("PAYMENT")}
            className={`px-3 py-1 font-semibold border-l border-gray-300 cursor-pointer ${
              typeFilter === "PAYMENT"
                ? "bg-rose-50 text-rose-800"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Phiếu chi (Chi tiền)
          </button>
        </div>

        <input
          type="text"
          placeholder="Tìm đối tác (tên, mã)..."
          value={searchPartner}
          onChange={(e) => setSearchPartner(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 w-64 bg-gray-50 text-slate-800"
        />
      </div>

      {/* List Table */}
      <SlipTable filteredSlips={filteredSlips} loading={loading} />

      {/* Creation Modal */}
      <SlipForm
        showModal={showModal}
        setShowModal={setShowModal}
        errorMsg={errorMsg}
        submitting={submitting}
        formType={formType}
        setFormType={setFormType}
        selectedPartnerId={selectedPartnerId}
        setSelectedPartnerId={setSelectedPartnerId}
        linkType={linkType}
        setLinkType={setLinkType}
        selectedInvoiceId={selectedInvoiceId}
        setSelectedInvoiceId={setSelectedInvoiceId}
        amount={amount}
        setAmount={setAmount}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        note={note}
        setNote={setNote}
        filteredPartnersForForm={filteredPartnersForForm}
        availableInvoices={availableInvoices}
        selectedInvoiceDebt={selectedInvoiceDebt}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
