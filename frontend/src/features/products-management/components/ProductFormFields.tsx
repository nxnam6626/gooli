import React from 'react';
import { Gear, CaretDown } from '@phosphor-icons/react';
import { Category } from '@/types';
import CategoryCombobox from './CategoryCombobox';

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

interface Props {
  editId: number | null;
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  categories: Category[];
  handleAddCategoryInline: () => void;
  refreshSku: (categoryId: number, name: string) => Promise<void>;
  refreshCategories: () => Promise<void>;
}

const COMMON_UNITS = ['Đôi', 'Cái', 'Bộ', 'tấm', 'cây', 'Mét', 'Hộp', 'Thanh'];

const LABEL_CLS = 'block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide';
const INPUT_CLS =
  'w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all';

export default function ProductFormFields({
  editId,
  formData,
  setFormData,
  categories,
  handleAddCategoryInline,
  refreshSku,
  refreshCategories,
}: Props) {
  const [showUnitDropdown, setShowUnitDropdown] = React.useState(false);
  const unitRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (unitRef.current && !unitRef.current.contains(e.target as Node)) {
        setShowUnitDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredUnits = COMMON_UNITS.filter((u) =>
    u.toLowerCase().includes((formData.unit || '').toLowerCase()),
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* SKU */}
      <div>
        <label htmlFor="modal_sku" className={LABEL_CLS}>
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
              setFormData((prev) => ({ ...prev, sku: e.target.value.toUpperCase() }))
            }
            placeholder="VD: TN-BASIU50-001"
            className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:bg-slate-50 font-mono"
          />
          {!editId && (
            <button
              type="button"
              onClick={() => refreshSku(formData.categoryId, formData.name)}
              title="Sinh lại mã SKU"
              className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-600 rounded-lg text-sm transition-colors cursor-pointer"
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
        <label htmlFor="modal_name" className={LABEL_CLS}>
          Tên sản phẩm
        </label>
        <input
          id="modal_name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="VD: Tấm trần nhôm 600×600"
          className={INPUT_CLS}
        />
      </div>

      {/* Category */}
      <div>
        <label htmlFor="modal_category" className={LABEL_CLS}>
          Nhóm hàng
        </label>
        <div className="flex gap-2">
          <CategoryCombobox
            value={formData.categoryId}
            onChange={(val) => setFormData((prev) => ({ ...prev, categoryId: val }))}
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
            className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-600 rounded-lg text-xs transition-colors cursor-pointer"
            title="Làm mới danh sách nhóm hàng"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Unit */}
      <div ref={unitRef} className="relative">
        <label htmlFor="modal_unit" className={LABEL_CLS}>
          Đơn vị tính (ĐVT)
        </label>
        <div className="relative flex items-center">
          <input
            id="modal_unit"
            type="text"
            required
            value={formData.unit}
            onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
            onFocus={() => setShowUnitDropdown(true)}
            placeholder="Chọn hoặc tự nhập..."
            className="w-full bg-white border border-slate-300 rounded-lg pl-3 pr-8 py-2 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-semibold text-slate-800"
          />
          <button
            type="button"
            onClick={() => setShowUnitDropdown((v) => !v)}
            className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
          >
            <CaretDown
              size={12}
              className={`transition-transform duration-200 ${showUnitDropdown ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {showUnitDropdown && (
          <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto py-1 divide-y divide-slate-50">
            {filteredUnits.length === 0 ? (
              <div className="px-3 py-2 text-center text-slate-400 italic text-[11px] font-bold">
                Tự nhập: &quot;{formData.unit}&quot;
              </div>
            ) : (
              filteredUnits.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, unit: u }));
                    setShowUnitDropdown(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-left hover:bg-slate-50 transition-colors text-[11px] cursor-pointer ${
                    formData.unit === u
                      ? 'bg-blue-50/45 text-blue-600 font-extrabold'
                      : 'text-slate-700 font-semibold'
                  }`}
                >
                  {u}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Estimated cost */}
      <div>
        <label htmlFor="modal_estimated_cost" className={LABEL_CLS}>
          Giá vốn dự kiến (đ)
        </label>
        <input
          id="modal_estimated_cost"
          type="number"
          min="0"
          value={formData.estimatedCostPrice}
          onChange={(e) => {
            const cost = Number(e.target.value);
            const price = Math.round((cost * (1 + formData.markupPercent / 100)) / 1000) * 1000;
            setFormData((prev) => ({ ...prev, estimatedCostPrice: cost, pricePerM2: price }));
          }}
          className={INPUT_CLS}
        />
      </div>

      {/* Markup */}
      <div>
        <label htmlFor="modal_markup" className={LABEL_CLS}>
          Tỉ lệ Markup (%)
        </label>
        <input
          id="modal_markup"
          type="number"
          min="0"
          value={formData.markupPercent}
          onChange={(e) => {
            const markup = Number(e.target.value);
            const price =
              Math.round((formData.estimatedCostPrice * (1 + markup / 100)) / 1000) * 1000;
            setFormData((prev) => ({ ...prev, markupPercent: markup, pricePerM2: price }));
          }}
          className={INPUT_CLS}
        />
      </div>

      {/* Selling price */}
      <div>
        <label htmlFor="modal_price" className={LABEL_CLS}>
          Giá bán (đ)
        </label>
        <input
          id="modal_price"
          type="number"
          min="0"
          required
          value={formData.pricePerM2}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, pricePerM2: Number(e.target.value) }))
          }
          className={`${INPUT_CLS} font-semibold`}
        />
      </div>

      {/* Image URL */}
      <div>
        <label htmlFor="modal_image" className={LABEL_CLS}>
          Ảnh sản phẩm (URL)
        </label>
        <input
          id="modal_image"
          type="text"
          required
          value={formData.imageUrl}
          onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
          className={INPUT_CLS}
        />
      </div>
    </div>
  );
}
