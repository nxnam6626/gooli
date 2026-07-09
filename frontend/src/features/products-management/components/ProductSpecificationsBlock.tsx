import React from 'react';

interface Spec {
  key: string;
  value: string;
}

interface Props {
  specifications: Spec[];
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const SUGGESTED_TAGS = ['Chiều cao', 'Khe hở', 'Màu sắc', 'Vật liệu', 'Phụ kiện', 'Bản rộng'];

export default function ProductSpecificationsBlock({ specifications, setFormData }: Props) {
  const addSpec = (key = '', value = '') =>
    setFormData((prev: any) => ({
      ...prev,
      specifications: [...prev.specifications, { key, value }],
    }));

  const updateSpec = (index: number, field: 'key' | 'value', val: string) =>
    setFormData((prev: any) => {
      const updated = [...prev.specifications];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, specifications: updated };
    });

  const removeSpec = (index: number) =>
    setFormData((prev: any) => ({
      ...prev,
      specifications: prev.specifications.filter((_: any, i: number) => i !== index),
    }));

  const addTag = (tag: string) => {
    const exists = specifications.some((s) => s.key.toLowerCase() === tag.toLowerCase());
    if (!exists) addSpec(tag, '');
  };

  return (
    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
      <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
        <span className="text-[10px] text-blue-600 uppercase tracking-wider font-extrabold">
          Thông số kỹ thuật bổ sung
        </span>
        <button
          type="button"
          onClick={() => addSpec()}
          className="text-[10px] text-blue-600 hover:text-blue-800 font-extrabold cursor-pointer transition-colors"
        >
          + Thêm thông số
        </button>
      </div>

      {/* Quick tags */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mr-1">
          Gợi ý nhanh:
        </span>
        {SUGGESTED_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => addTag(tag)}
            className="px-2 py-0.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-500 hover:text-blue-600 rounded-md text-[9px] font-bold transition-all cursor-pointer"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Spec rows */}
      {specifications.length === 0 ? (
        <div className="text-center py-2 text-slate-400 italic text-[11px]">
          Chưa có thông số nào. Click &quot;+ Thêm thông số&quot; hoặc tag gợi ý để khai báo.
        </div>
      ) : (
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
          {specifications.map((spec, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={spec.key}
                onChange={(e) => updateSpec(i, 'key', e.target.value)}
                placeholder="Tên thông số (VD: Màu sắc)"
                className="w-5/12 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-bold text-slate-700"
              />
              <input
                type="text"
                value={spec.value}
                onChange={(e) => updateSpec(i, 'value', e.target.value)}
                placeholder="Giá trị (VD: Vân gỗ)"
                className="w-6/12 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-semibold text-slate-600"
              />
              <button
                type="button"
                onClick={() => removeSpec(i)}
                title="Xóa thông số này"
                className="w-1/12 text-slate-400 hover:text-red-500 flex justify-center items-center cursor-pointer transition-colors p-1"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
