import React from 'react';

interface ProductFormData {
  unit: string;
  thickness: string;
  width: string;
  length: string;
}

interface Props {
  formData: Pick<ProductFormData, 'unit' | 'thickness' | 'width' | 'length'>;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  showThickness: boolean;
  showWidth: boolean;
  showLength: boolean;
}

const INPUT_CLS =
  'w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all';
const LABEL_CLS = 'block text-[9px] text-slate-500 mb-1 font-semibold uppercase tracking-wide';

export default function ProductDimensionsBlock({
  formData,
  setFormData,
  showThickness,
  showWidth,
  showLength,
}: Props) {
  if (!showThickness && !showWidth && !showLength) return null;

  return (
    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
      <div className="text-[10px] text-blue-600 uppercase tracking-wider font-extrabold border-b border-slate-200 pb-1.5">
        Cấu hình Quy cách sản phẩm (Theo ĐVT: {formData.unit.toUpperCase()})
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {showThickness && (
          <div>
            <label htmlFor="modal_thickness" className={LABEL_CLS}>
              Độ dày (mm)
            </label>
            <input
              id="modal_thickness"
              type="number"
              step="0.01"
              min="0"
              value={formData.thickness}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, thickness: e.target.value }))}
              placeholder="VD: 0.8"
              className={INPUT_CLS}
            />
          </div>
        )}
        {showWidth && (
          <div>
            <label htmlFor="modal_width" className={LABEL_CLS}>
              Chiều rộng (mm)
            </label>
            <input
              id="modal_width"
              type="number"
              min="0"
              value={formData.width}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, width: e.target.value }))}
              placeholder="VD: 600"
              className={INPUT_CLS}
            />
          </div>
        )}
        {showLength && (
          <div>
            <label htmlFor="modal_length" className={LABEL_CLS}>
              Chiều dài (mm)
            </label>
            <input
              id="modal_length"
              type="number"
              min="0"
              value={formData.length}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, length: e.target.value }))}
              placeholder="VD: 600"
              className={INPUT_CLS}
            />
          </div>
        )}
      </div>
    </div>
  );
}
