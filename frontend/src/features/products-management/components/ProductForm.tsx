import React from 'react';
import { Category } from '@/types';
import ProductFormFields from './ProductFormFields';
import ProductDimensionsBlock from './ProductDimensionsBlock';
import ProductSpecificationsBlock from './ProductSpecificationsBlock';

interface ProductFormData {
  categoryId: number;
  sku: string;
  name: string;
  pricePerM2: number;
  imageUrl: string;
  description: string;
  unit: string;
  thickness: string;
  width: string;
  length: string;
  estimatedCostPrice: number;
  markupPercent: number;
  specifications: { key: string; value: string }[];
}

interface ProductFormProps {
  showModal: boolean;
  setShowModal: (val: boolean) => void;
  editId: number | null;
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  formError: string | null;
  submitting: boolean;
  categories: Category[];
  handleAddCategoryInline: () => void;
  handleFormSubmit: (e: React.FormEvent) => void;
  showThickness: boolean;
  showWidth: boolean;
  showLength: boolean;
  refreshSku: (categoryId: number, name: string) => Promise<void>;
  refreshCategories: () => Promise<void>;
}

export default function ProductForm({
  showModal,
  setShowModal,
  editId,
  formData,
  setFormData,
  formError,
  submitting,
  categories,
  handleAddCategoryInline,
  handleFormSubmit,
  showThickness,
  showWidth,
  showLength,
  refreshSku,
  refreshCategories,
}: ProductFormProps) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs px-4">
      <div className="w-full max-w-xl bg-white border border-slate-200 p-6 rounded-2xl shadow-2xl relative text-slate-700">
        {/* Header */}
        <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-wide">
            {editId ? `Cập nhật sản phẩm: ${formData.sku}` : 'Thêm sản phẩm mới'}
          </h2>
          <button
            onClick={() => setShowModal(false)}
            className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer text-xs"
          >
            [Đóng]
          </button>
        </div>

        {/* Error banner */}
        {formError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 text-xs rounded-lg">
            [Lỗi]: {formError}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Basic fields */}
          <ProductFormFields
            editId={editId}
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            handleAddCategoryInline={handleAddCategoryInline}
            refreshSku={refreshSku}
            refreshCategories={refreshCategories}
          />

          {/* Dimensions (conditional) */}
          <ProductDimensionsBlock
            formData={formData}
            setFormData={setFormData}
            showThickness={showThickness}
            showWidth={showWidth}
            showLength={showLength}
          />

          {/* Specifications */}
          <ProductSpecificationsBlock
            specifications={formData.specifications}
            setFormData={setFormData}
          />

          {/* Description */}
          <div>
            <label
              htmlFor="modal_desc"
              className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide"
            >
              Mô tả sản phẩm
            </label>
            <textarea
              id="modal_desc"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Mô tả thông tin chi tiết..."
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 mt-5">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold cursor-pointer text-xs transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-lg font-bold cursor-pointer disabled:opacity-50 text-xs shadow-sm transition-colors"
            >
              {submitting ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
