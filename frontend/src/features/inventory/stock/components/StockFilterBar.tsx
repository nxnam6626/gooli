import React from 'react';
import { Tag, Sliders, CaretDown, MagnifyingGlass } from '@phosphor-icons/react';

interface Category {
  id: number;
  name: string;
}

interface Props {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  selectedCategory: number | undefined;
  setSelectedCategory: (v: number | undefined) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  setPage: (v: number) => void;
  total: number;
  categories: Category[];
  handleSearchSubmit: (e: React.FormEvent) => void;
}

export default function StockFilterBar({
  searchQuery, setSearchQuery,
  selectedCategory, setSelectedCategory,
  statusFilter, setStatusFilter,
  setPage, total, categories,
  handleSearchSubmit,
}: Props) {
  const selectCls = 'bg-transparent border-none outline-none cursor-pointer pr-4 appearance-none text-[11px] font-bold';
  const wrapCls = 'relative flex items-center bg-[#f1f5f9] rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-200/70 transition-colors';

  return (
    <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-2xs flex flex-wrap gap-4 items-center justify-between">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-60">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <MagnifyingGlass size={15} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm sản phẩm, SKU..."
            className="w-full bg-[#f1f5f9] border border-transparent rounded-lg py-1.5 pl-9 pr-4 text-[11px] font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-200 transition-colors"
          />
        </form>

        {/* Category */}
        <div className={wrapCls}>
          <Tag size={15} className="text-slate-500 mr-1.5" />
          <select
            value={selectedCategory || ''}
            onChange={(e) => { setSelectedCategory(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
            aria-label="Chọn ngành hàng"
            className={selectCls}
          >
            <option value="">Tất cả Ngành hàng</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <CaretDown size={10} className="text-slate-500 absolute right-1.5 pointer-events-none" />
        </div>

        {/* Status */}
        <div className={wrapCls}>
          <Sliders size={15} className="text-slate-500 mr-1.5" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Chọn trạng thái" className={selectCls}>
            <option value="ALL">Trạng thái: Tất cả</option>
            <option value="IN_STOCK">Còn hàng</option>
            <option value="LOW_STOCK">Sắp hết</option>
            <option value="OUT_OF_STOCK">Hết hàng</option>
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
