import React from 'react';
import { Plus } from '@phosphor-icons/react';
import { useProductAdmin } from '../../hooks/useProductAdmin';
import ProductMetrics from './ProductMetrics';
import ProductFilters from './ProductFilters';
import ProductTable from './ProductTable';
import ProductForm from './ProductForm';

export default function ProductAdminDashboard() {
  const {
    products,
    categories,
    total,
    page,
    setPage,
    totalPages,
    loading,
    showModal,
    setShowModal,
    editId,
    formData,
    setFormData,
    formError,
    submitting,
    handleCreateOpen,
    handleEditOpen,
    handleAddCategoryInline,
    handleFormSubmit,
    handleDelete,
    showThickness,
    showWidth,
    showLength,
    selectedCategory,
    setSelectedCategory
  } = useProductAdmin();

  const activeCount = products.filter(p => p.isActive !== false).length;
  const averagePrice = Math.round(products.reduce((acc, p) => acc + Number(p.pricePerM2 || 0), 0) / (products.length || 1));

  return (
    <div className="space-y-6 font-sans text-xs pb-10">
      
      {/* 1. Header (Title + Buttons) */}
      <div className="flex justify-between items-center select-none">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Danh mục Hàng hóa</h1>
          <p className="text-slate-500 mt-1 text-[11px]">Quản lý danh sách sản phẩm, quy cách kỹ thuật và thông tin giá bán.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateOpen}
            className="px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-2 cursor-pointer transition-all text-xs shadow-sm shadow-blue-500/10"
          >
            <Plus size={16} weight="bold" />
            <span>Thêm sản phẩm</span>
          </button>
        </div>
      </div>

      {/* 3. Catalog Metrics grid */}
      <ProductMetrics
        total={total}
        activeCount={activeCount}
        categoryCount={categories.length}
        averagePrice={averagePrice}
      />

      {/* 4. Filter bar */}
      <ProductFilters
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        setPage={setPage}
        total={total}
      />

      {/* 5. Goods Information Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-black text-slate-900 tracking-tight">Thông tin hàng hóa</h2>
        <ProductTable
          products={products}
          loading={loading}
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          handleEditOpen={handleEditOpen}
          handleDelete={handleDelete}
        />
      </div>

      {/* Creation & Editing Modal Dialog */}
      <ProductForm
        showModal={showModal}
        setShowModal={setShowModal}
        editId={editId}
        formData={formData}
        setFormData={setFormData}
        formError={formError}
        submitting={submitting}
        categories={categories}
        handleAddCategoryInline={handleAddCategoryInline}
        handleFormSubmit={handleFormSubmit}
        showThickness={showThickness}
        showWidth={showWidth}
        showLength={showLength}
      />

    </div>
  );
}
