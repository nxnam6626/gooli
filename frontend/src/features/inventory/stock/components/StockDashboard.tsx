'use client';

import React from 'react';
import { useStockDashboard } from '../hooks/useStockDashboard';
import StockMetricsGrid from './StockMetricsGrid';
import StockRecentActivity from './StockRecentActivity';
import StockFilterBar from './StockFilterBar';
import StockTable from './StockTable';

export default function StockDashboard() {
  const {
    page, setPage, total, totalPages,
    searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    statusFilter, setStatusFilter,
    categories, filteredProducts, loading,
    lowStockCount, totalStockValue,
    pendingReceiptsCount, pendingExportsCount,
    recentReceipts, recentExports,
    handleRefresh, handleSearchSubmit,
  } = useStockDashboard();

  return (
    <div className="space-y-6 font-sans text-xs pb-10">
      {/* Header */}
      <div className="flex justify-between items-center select-none">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Quản lý Tồn kho</h1>
          <p className="text-slate-500 mt-1 text-[11px]">
            Cập nhật và theo dõi số lượng tồn kho theo thời gian thực.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold rounded-lg flex items-center gap-2 cursor-pointer transition-all text-xs"
        >
          Làm mới
        </button>
      </div>

      <StockMetricsGrid
        pendingReceiptsCount={pendingReceiptsCount}
        pendingExportsCount={pendingExportsCount}
        total={total}
        totalStockValue={totalStockValue}
      />

      <StockRecentActivity
        recentReceipts={recentReceipts}
        recentExports={recentExports}
        lowStockCount={lowStockCount}
      />

      <StockFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        setPage={setPage}
        total={total}
        categories={categories}
        handleSearchSubmit={handleSearchSubmit}
      />

      <div className="space-y-3">
        <h2 className="text-sm font-black text-slate-900 tracking-tight">Chi tiết Tồn kho</h2>
        <StockTable
          products={filteredProducts}
          loading={loading}
          page={page}
          totalPages={totalPages}
          setPage={setPage}
        />
      </div>
    </div>
  );
}
