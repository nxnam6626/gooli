/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { Tag, CaretDown, MagnifyingGlass } from '@phosphor-icons/react';
import { Category } from '@/types';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || '',
  );

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-2xs flex flex-wrap gap-4 items-center justify-between">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
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

        {/* Categories select */}
        <div className="relative flex items-center bg-[#f1f5f9] rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-200/70 transition-colors">
          <Tag size={15} className="text-slate-500 mr-1.5" />
          <select
            value={selectedCategory || ''}
            onChange={(e) => {
              setSelectedCategory(
                e.target.value ? Number(e.target.value) : undefined,
              );
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
          <CaretDown
            size={10}
            className="text-slate-500 absolute right-1.5 pointer-events-none"
          />
        </div>
      </div>

      <div className="text-slate-500 italic font-semibold text-[11px] select-none">
        Hiển thị {total.toLocaleString()} sản phẩm
      </div>
    </div>
  );
}
