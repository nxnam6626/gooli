import React from 'react';
import { Category } from '@/types';

export interface PublicSubCategory {
  id: number;
  label: string;
  href: string;
  internalCategoryId?: number | null;
}

export interface PublicCategory {
  id: number;
  label: string;
  href: string;
  icon?: string | null;
  image?: string | null;
  imagePosition?: string | null;
  description?: string | null;
  internalCategoryId?: number | null;
  subMenu?: PublicSubCategory[];
}

interface ProductFormProps {
  showModal: boolean;
  setShowModal: (val: boolean) => void;
  editId: number | null;
  formData: {
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
    publicCategoryIds: number[];
  };
  setFormData: React.Dispatch<React.SetStateAction<{
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
    publicCategoryIds: number[];
  }>>;
  formError: string | null;
  submitting: boolean;
  categories: Category[];
  publicCategories: PublicCategory[];
  handleAddCategoryInline: () => void;
  handleFormSubmit: (e: React.FormEvent) => void;
  showThickness: boolean;
  showWidth: boolean;
  showLength: boolean;
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
  publicCategories,
  handleAddCategoryInline,
  handleFormSubmit,
  showThickness,
  showWidth,
  showLength,
}: ProductFormProps) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs px-4">
      <div className="w-full max-w-xl bg-white border border-slate-200 p-6 rounded-2xl shadow-2xl relative text-slate-700">
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

        {formError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 text-xs rounded-lg">
            [Lỗi]: {formError}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* SKU Code */}
            <div>
              <label htmlFor="modal_sku" className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide">
                Mã hàng hóa (SKU)
              </label>
              <input
                id="modal_sku"
                type="text"
                required
                disabled={!!editId}
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))}
                placeholder="VD: NK-270-RD-42"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:bg-slate-50"
              />
            </div>

            {/* Name */}
            <div>
              <label htmlFor="modal_name" className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide">
                Tên sản phẩm
              </label>
              <input
                id="modal_name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="VD: Nike Air Max 270"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Category selection */}
            <div>
              <label htmlFor="modal_category" className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide">
                Nhóm hàng
              </label>
              <div className="flex gap-2">
                <select
                  id="modal_category"
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: Number(e.target.value) }))}
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddCategoryInline}
                  className="px-2.5 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-[10px] font-bold cursor-pointer border-none outline-none"
                  title="Thêm nhóm hàng nhanh"
                >
                  + Thêm
                </button>
              </div>
            </div>

            {/* Unit of measure */}
            <div>
              <label htmlFor="modal_unit" className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide">
                Đơn vị tính (ĐVT)
              </label>
              <input
                id="modal_unit"
                type="text"
                list="units-list"
                required
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                placeholder="Chọn hoặc tự nhập..."
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <datalist id="units-list">
                <option value="Đôi" />
                <option value="Cái" />
                <option value="Bộ" />
                <option value="tấm" />
                <option value="cây" />
                <option value="Mét" />
                <option value="Hộp" />
                <option value="Thanh" />
              </datalist>
            </div>

            {/* Price */}
            <div>
              <label htmlFor="modal_price" className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide">
                Giá bán (đ)
              </label>
              <input
                id="modal_price"
                type="number"
                min="0"
                required
                value={formData.pricePerM2}
                onChange={(e) => setFormData(prev => ({ ...prev, pricePerM2: Number(e.target.value) }))}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="modal_image" className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide">
                Ảnh sản phẩm (URL)
              </label>
              <input
                id="modal_image"
                type="text"
                required
                value={formData.imageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

          </div>

          {/* Website Public Categories Checkboxes */}
          <div>
            <label className="block text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-wide">
              Danh mục hiển thị trên Website (Nhiều-Nhiều)
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-[160px] overflow-y-auto space-y-3">
              {publicCategories.length === 0 ? (
                <p className="text-[10px] text-slate-400 italic">Chưa có danh mục hiển thị nào được cấu hình trên website.</p>
              ) : (
                publicCategories.map((rootCat) => (
                  <div key={rootCat.id} className="space-y-1.5">
                    {/* Root public category */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`pub_cat_${rootCat.id}`}
                        checked={formData.publicCategoryIds.includes(rootCat.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData(prev => ({
                            ...prev,
                            publicCategoryIds: checked
                              ? [...prev.publicCategoryIds, rootCat.id]
                              : prev.publicCategoryIds.filter(id => id !== rootCat.id)
                          }));
                        }}
                        className="rounded border-slate-350 text-blue-600 focus:ring-blue-500 cursor-pointer h-3.5 w-3.5"
                      />
                      <label htmlFor={`pub_cat_${rootCat.id}`} className="text-[11px] font-bold text-slate-800 cursor-pointer select-none">
                        {rootCat.label}
                      </label>
                    </div>

                    {/* Children subcategories */}
                    {rootCat.subMenu && rootCat.subMenu.length > 0 && (
                      <div className="pl-5 grid grid-cols-2 gap-x-4 gap-y-1">
                        {rootCat.subMenu.map((sub: PublicSubCategory) => (
                          <div key={sub.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`pub_cat_${sub.id}`}
                              checked={formData.publicCategoryIds.includes(sub.id)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setFormData(prev => ({
                                  ...prev,
                                  publicCategoryIds: checked
                                    ? [...prev.publicCategoryIds, sub.id]
                                    : prev.publicCategoryIds.filter(id => id !== sub.id)
                                }));
                              }}
                              className="rounded border-slate-350 text-blue-600 focus:ring-blue-500 cursor-pointer h-3 w-3"
                            />
                            <label htmlFor={`pub_cat_${sub.id}`} className="text-[10px] text-slate-650 hover:text-slate-900 cursor-pointer select-none truncate">
                              {sub.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <p className="text-[9px] text-slate-400 mt-1">
              Chọn danh mục hiển thị trên website. Sản phẩm cũng tự động xuất hiện ở các trang hiển thị có liên kết với Nhóm hàng vật lý tương ứng.
            </p>
          </div>

          {/* Dynamic Dimensions Block */}
          {(showThickness || showWidth || showLength) && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
              <div className="text-[10px] text-blue-600 uppercase tracking-wider font-extrabold border-b border-slate-200 pb-1.5">
                Cấu hình Quy cách sản phẩm (Theo ĐVT: {formData.unit.toUpperCase()})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {showThickness && (
                  <div>
                    <label htmlFor="modal_thickness" className="block text-[9px] text-slate-500 mb-1 font-semibold uppercase tracking-wide">
                      Độ dày (mm)
                    </label>
                    <input
                      id="modal_thickness"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.thickness}
                      onChange={(e) => setFormData(prev => ({ ...prev, thickness: e.target.value }))}
                      placeholder="VD: 0.8"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                )}

                {showWidth && (
                  <div>
                    <label htmlFor="modal_width" className="block text-[9px] text-slate-500 mb-1 font-semibold uppercase tracking-wide">
                      Chiều rộng (mm)
                    </label>
                    <input
                      id="modal_width"
                      type="number"
                      min="0"
                      value={formData.width}
                      onChange={(e) => setFormData(prev => ({ ...prev, width: e.target.value }))}
                      placeholder="VD: 600"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                )}

                {showLength && (
                  <div>
                    <label htmlFor="modal_length" className="block text-[9px] text-slate-500 mb-1 font-semibold uppercase tracking-wide">
                      Chiều dài (mm)
                    </label>
                    <input
                      id="modal_length"
                      type="number"
                      min="0"
                      value={formData.length}
                      onChange={(e) => setFormData(prev => ({ ...prev, length: e.target.value }))}
                      placeholder="VD: 600"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                )}

              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label htmlFor="modal_desc" className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide">
              Mô tả sản phẩm
            </label>
            <textarea
              id="modal_desc"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Mô tả thông tin chi tiết..."
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Action buttons */}
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
