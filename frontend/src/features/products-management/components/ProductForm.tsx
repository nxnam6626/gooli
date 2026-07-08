import React from 'react';
import { Category } from '@/types';
import CategoryCombobox from './CategoryCombobox';
import { Gear, CaretDown } from '@phosphor-icons/react';

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
    estimatedCostPrice: number;
    markupPercent: number;
    specifications: { key: string; value: string }[];
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
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
    }>
  >;
  formError: string | null;
  submitting: boolean;
  categories: Category[];
  handleAddCategoryInline: () => void;
  handleFormSubmit: (e: React.FormEvent) => void;
  showThickness: boolean;
  showWidth: boolean;
  showLength: boolean;
  /** Hàm sinh lại SKU (gọi API generate-sku). Chỉ hoạt động khi thêm mới (editId = null). */
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
  const [showUnitDropdown, setShowUnitDropdown] = React.useState(false);
  const unitContainerRef = React.useRef<HTMLDivElement>(null);
  const commonUnits = ['Đôi', 'Cái', 'Bộ', 'tấm', 'cây', 'Mét', 'Hộp', 'Thanh'];

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        unitContainerRef.current &&
        !unitContainerRef.current.contains(e.target as Node)
      ) {
        setShowUnitDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs px-4">
      <div className="w-full max-w-xl bg-white border border-slate-200 p-6 rounded-2xl shadow-2xl relative text-slate-700">
        <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-wide">
            {editId
              ? `Cập nhật sản phẩm: ${formData.sku}`
              : 'Thêm sản phẩm mới'}
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
              <label
                htmlFor="modal_sku"
                className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide"
              >
                Mã hàng hóa (SKU)
                {!editId && (
                  <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                    ✨ Tự động
                  </span>
                )}
              </label>
              <div className="flex gap-1.5">
                <input
                  id="modal_sku"
                  type="text"
                  required
                  disabled={!!editId}
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sku: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="VD: TN-BASIU50-001"
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:bg-slate-50 font-mono"
                />
                {!editId && (
                  <button
                    type="button"
                    onClick={() => refreshSku(formData.categoryId, formData.name)}
                    title="Sinh lại mã SKU"
                    className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-600 hover:text-slate-800 rounded-lg text-sm transition-colors cursor-pointer"
                  >
                    🔄
                  </button>
                )}
              </div>
              {!editId && (
                <p className="text-[9px] text-slate-400 mt-0.5">
                  Sinh tự động theo danh mục. Bấm 🔄 để lấy mã khác.
                </p>
              )}
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="modal_name"
                className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide"
              >
                Tên sản phẩm
              </label>
              <input
                id="modal_name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="VD: Nike Air Max 270"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Category selection */}
            <div>
              <label
                htmlFor="modal_category"
                className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide"
              >
                Nhóm hàng
              </label>
              <div className="flex gap-2">
                <CategoryCombobox
                  value={formData.categoryId}
                  onChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      categoryId: val,
                    }))
                  }
                  categories={categories}
                />
                <button
                  type="button"
                  onClick={handleAddCategoryInline}
                  className="px-2.5 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center"
                  title="Mở trang Quản lý danh mục"
                >
                  <Gear size={14} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={refreshCategories}
                  className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-600 hover:text-slate-800 rounded-lg text-xs transition-colors cursor-pointer"
                  title="Làm mới danh sách nhóm hàng"
                >
                  🔄
                </button>
              </div>
            </div>

            {/* Unit of measure */}
            <div ref={unitContainerRef} className="relative">
              <label
                htmlFor="modal_unit"
                className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide"
              >
                Đơn vị tính (ĐVT)
              </label>
              <div className="relative flex items-center">
                <input
                  id="modal_unit"
                  type="text"
                  required
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, unit: e.target.value }))
                  }
                  onFocus={() => setShowUnitDropdown(true)}
                  placeholder="Chọn hoặc tự nhập..."
                  className="w-full bg-white border border-slate-300 rounded-lg pl-3 pr-8 py-2 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-semibold text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowUnitDropdown((prev) => !prev)}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer flex items-center justify-center p-0.5"
                >
                  <CaretDown
                    size={12}
                    className={`transition-transform duration-200 ${
                      showUnitDropdown ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>

              {showUnitDropdown && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto py-1 divide-y divide-slate-50">
                  {(() => {
                    const filtered = commonUnits.filter((u) =>
                      u.toLowerCase().includes((formData.unit || '').toLowerCase())
                    );
                    if (filtered.length === 0) {
                      return (
                        <div className="px-3 py-2 text-center text-slate-400 italic text-[11px] font-bold">
                          Tự nhập: "{formData.unit}"
                        </div>
                      );
                    }
                    return filtered.map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, unit: u }));
                          setShowUnitDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 transition-colors text-[11px] cursor-pointer ${
                          formData.unit === u
                            ? 'bg-blue-50/45 text-blue-600 font-extrabold'
                            : 'text-slate-700 font-semibold'
                        }`}
                      >
                        {u}
                      </button>
                    ));
                  })()}
                </div>
              )}
            </div>

             {/* Price */}
            <div>
              <label
                htmlFor="modal_estimated_cost"
                className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide"
              >
                Giá vốn dự kiến (đ)
              </label>
              <input
                id="modal_estimated_cost"
                type="number"
                min="0"
                value={formData.estimatedCostPrice}
                onChange={(e) => {
                  const cost = Number(e.target.value);
                  const markup = formData.markupPercent;
                  const calculatedPrice = Math.round((cost * (1 + markup / 100)) / 1000) * 1000;
                  setFormData((prev) => ({
                    ...prev,
                    estimatedCostPrice: cost,
                    pricePerM2: calculatedPrice,
                  }));
                }}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="modal_markup"
                className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide"
              >
                Tỉ lệ Markup (%)
              </label>
              <input
                id="modal_markup"
                type="number"
                min="0"
                value={formData.markupPercent}
                onChange={(e) => {
                  const markup = Number(e.target.value);
                  const cost = formData.estimatedCostPrice;
                  const calculatedPrice = Math.round((cost * (1 + markup / 100)) / 1000) * 1000;
                  setFormData((prev) => ({
                    ...prev,
                    markupPercent: markup,
                    pricePerM2: calculatedPrice,
                  }));
                }}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="modal_price"
                className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide"
              >
                Giá bán (đ)
              </label>
              <input
                id="modal_price"
                type="number"
                min="0"
                required
                value={formData.pricePerM2}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pricePerM2: Number(e.target.value),
                  }))
                }
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-semibold"
              />
            </div>

            {/* Image URL */}
            <div>
              <label
                htmlFor="modal_image"
                className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide"
              >
                Ảnh sản phẩm (URL)
              </label>
              <input
                id="modal_image"
                type="text"
                required
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
                }
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>


          {/* Dynamic Dimensions Block */}
          {(showThickness || showWidth || showLength) && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
              <div className="text-[10px] text-blue-600 uppercase tracking-wider font-extrabold border-b border-slate-200 pb-1.5">
                Cấu hình Quy cách sản phẩm (Theo ĐVT:{' '}
                {formData.unit.toUpperCase()})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {showThickness && (
                  <div>
                    <label
                      htmlFor="modal_thickness"
                      className="block text-[9px] text-slate-500 mb-1 font-semibold uppercase tracking-wide"
                    >
                      Độ dày (mm)
                    </label>
                    <input
                      id="modal_thickness"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.thickness}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          thickness: e.target.value,
                        }))
                      }
                      placeholder="VD: 0.8"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                )}

                {showWidth && (
                  <div>
                    <label
                      htmlFor="modal_width"
                      className="block text-[9px] text-slate-500 mb-1 font-semibold uppercase tracking-wide"
                    >
                      Chiều rộng (mm)
                    </label>
                    <input
                      id="modal_width"
                      type="number"
                      min="0"
                      value={formData.width}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          width: e.target.value,
                        }))
                      }
                      placeholder="VD: 600"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                )}

                {showLength && (
                  <div>
                    <label
                      htmlFor="modal_length"
                      className="block text-[9px] text-slate-500 mb-1 font-semibold uppercase tracking-wide"
                    >
                      Chiều dài (mm)
                    </label>
                    <input
                      id="modal_length"
                      type="number"
                      min="0"
                      value={formData.length}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          length: e.target.value,
                        }))
                      }
                      placeholder="VD: 600"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dynamic specifications builder */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
              <span className="text-[10px] text-blue-600 uppercase tracking-wider font-extrabold">
                Thông số kỹ thuật bổ sung
              </span>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    specifications: [...prev.specifications, { key: '', value: '' }],
                  }));
                }}
                className="text-[10px] text-blue-600 hover:text-blue-800 font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
              >
                + Thêm thông số
              </button>
            </div>

            {/* Quick suggested tags */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mr-1">Gợi ý nhanh:</span>
              {['Chiều cao', 'Khe hở', 'Màu sắc', 'Vật liệu', 'Phụ kiện', 'Bản rộng'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const exists = formData.specifications.some((s) => s.key.toLowerCase() === tag.toLowerCase());
                    if (!exists) {
                      setFormData((prev) => ({
                        ...prev,
                        specifications: [...prev.specifications, { key: tag, value: '' }],
                      }));
                    }
                  }}
                  className="px-2 py-0.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-500 hover:text-blue-600 rounded-md text-[9px] font-bold transition-all cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Specification rows */}
            {formData.specifications.length === 0 ? (
              <div className="text-center py-2 text-slate-400 italic text-[11px]">
                Chưa có thông số nào. Click "+ Thêm thông số" hoặc các tag gợi ý ở trên để khai báo.
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {formData.specifications.map((spec, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={spec.key}
                      onChange={(e) => {
                        const newSpecs = [...formData.specifications];
                        newSpecs[index].key = e.target.value;
                        setFormData((prev) => ({ ...prev, specifications: newSpecs }));
                      }}
                      placeholder="Tên thông số (VD: Màu sắc)"
                      className="w-5/12 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-bold text-slate-700"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => {
                        const newSpecs = [...formData.specifications];
                        newSpecs[index].value = e.target.value;
                        setFormData((prev) => ({ ...prev, specifications: newSpecs }));
                      }}
                      placeholder="Giá trị (VD: Vân gỗ)"
                      className="w-6/12 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-semibold text-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newSpecs = formData.specifications.filter((_, i) => i !== index);
                        setFormData((prev) => ({ ...prev, specifications: newSpecs }));
                      }}
                      className="w-1/12 text-slate-400 hover:text-red-500 flex justify-center items-center cursor-pointer transition-colors p-1"
                      title="Xóa thông số này"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
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
