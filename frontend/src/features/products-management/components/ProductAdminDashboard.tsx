import React from 'react';
import { Plus } from '@phosphor-icons/react';
import { useProductAdmin } from '../hooks/useProductAdmin';
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
    setSelectedCategory,
    refreshSku,
    refreshCategories,
    deleteProductInfo,
    setDeleteProductInfo,
    deleteError,
    deleting,
    confirmDelete,
  } = useProductAdmin();

  const activeCount = products.filter((p) => p.isActive !== false).length;
  const averagePrice = Math.round(
    products.reduce((acc, p) => acc + Number(p.pricePerM2 || 0), 0) /
      (products.length || 1),
  );

  return (
    <div className="space-y-6 font-sans text-xs pb-10">
      {/* 1. Header (Title + Buttons) */}
      <div className="flex justify-between items-center select-none">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Danh mục Hàng hóa
          </h1>
          <p className="text-slate-500 mt-1 text-[11px]">
            Quản lý danh sách sản phẩm, quy cách kỹ thuật và thông tin giá bán.
          </p>
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
        <h2 className="text-sm font-black text-slate-900 tracking-tight">
          Thông tin hàng hóa
        </h2>
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
        refreshSku={refreshSku}
        refreshCategories={refreshCategories}
      />

      {/* Custom Delete Confirmation Modal */}
      {deleteProductInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs px-4">
          <div className="w-full max-w-sm bg-white border border-slate-200 p-6 rounded-2xl shadow-2xl relative text-slate-700">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-4">
              Xác nhận xóa mặt hàng
            </h3>
            
            <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
              Bạn có chắc chắn muốn xóa mặt hàng <span className="text-slate-950 font-black">"{deleteProductInfo.name}"</span>? Hành động này không thể hoàn tác.
            </p>

            {deleteError && (
              <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-[10px] font-bold">
                ⚠️ {deleteError}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 pt-4">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteProductInfo(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50 shadow-sm shadow-rose-500/10 flex items-center gap-1.5"
              >
                {deleting ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
