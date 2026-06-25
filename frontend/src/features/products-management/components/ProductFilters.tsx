import React from 'react';
import { Tag, CaretDown } from '@phosphor-icons/react';
import { Category } from '@/types';

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory: number | undefined;
  setSelectedCategory: (val: number | undefined) => void;
  setPage: (page: number) => void;
  total: number;
}

export default function ProductFilters({
  categories,
  selectedCategory,
  setSelectedCategory,
  setPage,
  total,
}: ProductFiltersProps) {
  return (
    <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-2xs flex flex-wrap gap-4 items-center justify-between">
      <div className="flex flex-wrap items-center gap-3">
        {/* Categories select */}
        <div className="relative flex items-center bg-[#f1f5f9] rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-200/70 transition-colors">
          <Tag size={15} className="text-slate-500 mr-1.5" />
          <select
            value={selectedCategory || ''}
            onChange={(e) => {
              setSelectedCategory(e.target.value ? Number(e.target.value) : undefined);
              setPage(1);
            }}
            className="bg-transparent border-none outline-none cursor-pointer pr-4 appearance-none text-[11px] font-bold"
          >
            <option value="">Tất cả Ngành hàng</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <CaretDown size={10} className="text-slate-500 absolute right-1.5 pointer-events-none" />
        </div>
      </div>

      <div className="text-slate-500 italic font-semibold text-[11px] select-none">
        Hiển thị {total.toLocaleString()} sản phẩm
      </div>
    </div>
  );
}
