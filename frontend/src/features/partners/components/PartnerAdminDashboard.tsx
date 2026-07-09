'use client';

import React, { useState } from 'react';
import { UserPlus, FileArrowDown, Coins } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { getDebtSummary } from '@/features/finance/services/financeApi';
import { usePartnerAdmin } from '../hooks/usePartnerAdmin';
import PartnerFilters from './PartnerFilters';
import PartnerTable from './PartnerTable';
import PartnerForm from './PartnerForm';

export default function PartnerAdminDashboard() {
  const {
    partners,
    groups,
    total,
    page,
    setPage,
    totalPages,
    loading,
    search,
    setSearch,
    selectedGroupId,
    setSelectedGroupId,
    selectedStatus,
    setSelectedStatus,
    showModal,
    setShowModal,
    editId,
    formData,
    setFormData,
    formError,
    submitting,
    handleSearchSubmit,
    handleCreateOpen,
    handleEditOpen,
    handleAddGroupInline,
    handleFormSubmit,
    handleDelete,
    formatCurrency,
  } = usePartnerAdmin();

  const [token] = useState(() =>
    typeof window !== 'undefined'
      ? localStorage.getItem('gooli_token') || ''
      : '',
  );

  const { data: debtSummary } = useQuery({
    queryKey: ['debt-summary'],
    queryFn: () => getDebtSummary(token),
    enabled: !!token,
  });

  return (
    <div className="space-y-6 font-sans antialiased text-slate-800">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Quản lý Đối tác
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Quản lý thông tin khách hàng, nhà cung cấp và đại lý.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert('Đang mở chức năng Import Excel...')}
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
          >
            <FileArrowDown size={16} className="text-slate-600" />
            <span>Nhập từ Excel</span>
          </button>

          <button
            onClick={handleCreateOpen}
            className="px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <UserPlus size={16} weight="bold" />
            <span>Thêm đối tác mới</span>
          </button>
        </div>
      </div>

      {/* DEBT SUMMARY CARDS */}
      {debtSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 select-none">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <Coins size={24} weight="fill" />
            </div>
            <div>
              <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                Tổng phải thu khách hàng (Receivables)
              </div>
              <div className="text-lg font-black text-emerald-600 mt-0.5">
                {formatCurrency(debtSummary.totalReceivable)}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center gap-4 font-sans">
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
              <Coins size={24} weight="fill" />
            </div>
            <div>
              <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                Tổng phải trả nhà cung cấp (Payables)
              </div>
              <div className="text-lg font-black text-rose-600 mt-0.5">
                {formatCurrency(debtSummary.totalPayable)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FILTER PANEL */}
      <PartnerFilters
        search={search}
        setSearch={setSearch}
        selectedGroupId={selectedGroupId}
        setSelectedGroupId={setSelectedGroupId}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        setPage={setPage}
        groups={groups}
        handleSearchSubmit={handleSearchSubmit}
      />

      {/* PARTNERS TABLE */}
      <PartnerTable
        partners={partners}
        loading={loading}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        total={total}
        formatCurrency={formatCurrency}
        handleEditOpen={handleEditOpen}
        handleDelete={handleDelete}
      />

      {/* UPDATE / CREATE PARTNER MODAL DIALOG */}
      <PartnerForm
        showModal={showModal}
        setShowModal={setShowModal}
        editId={editId}
        formData={formData}
        setFormData={setFormData}
        formError={formError}
        submitting={submitting}
        groups={groups}
        handleAddGroupInline={handleAddGroupInline}
        handleFormSubmit={handleFormSubmit}
      />
    </div>
  );
}
