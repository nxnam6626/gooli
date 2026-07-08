import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CaretDown, Check, MagnifyingGlass } from '@phosphor-icons/react';
import { Category } from '@/types';

interface CategoryComboboxProps {
  value: number;
  onChange: (val: number) => void;
  categories: Category[];
}

export default function CategoryCombobox({
  value,
  onChange,
  categories,
}: CategoryComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Mở/Đóng dropdown
  const toggleDropdown = () => setIsOpen((prev) => !prev);

  // Đóng khi click ngoài
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Tự động focus ô tìm kiếm khi mở
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!isOpen) {
      setSearch(''); // Reset tìm kiếm khi đóng
    }
  }, [isOpen]);

  // Tự động cuộn đến phần tử đang chọn
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.querySelector('.active-category-item');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [isOpen]);

  // Lấy label hiển thị đầy đủ trên ô hiển thị chính
  const getSelectedLabel = useCallback(() => {
    if (value === 0) return '-- Chọn nhóm hàng --';
    const current = categories.find((cat) => cat.id === value);
    if (!current) return '-- Chọn nhóm hàng --';

    if (current.parentId) {
      const parent = categories.find((cat) => cat.id === current.parentId);
      if (parent) {
        return `${parent.name} ▸ ${current.name}`;
      }
    } else {
      const hasChildren = categories.some((cat) => cat.parentId === current.id);
      if (hasChildren) {
        return `${current.name} ▸ Mặc định (chưa phân loại)`;
      }
    }
    return current.name;
  }, [value, categories]);

  // Lọc cây danh mục
  const rootCategories = categories.filter((cat) => !cat.parentId);

  const filteredRoots = rootCategories.filter((root) => {
    const children = categories.filter((cat) => cat.parentId === root.id);
    const matchesRoot = root.name.toLowerCase().includes(search.toLowerCase());
    const matchesChild = children.some((child) =>
      child.name.toLowerCase().includes(search.toLowerCase()),
    );
    return matchesRoot || matchesChild;
  });

  const getSubcategoriesForRoot = (rootId: number) => {
    const allSubs = categories.filter((cat) => cat.parentId === rootId);
    if (!search) return allSubs;
    return allSubs.filter((sub) =>
      sub.name.toLowerCase().includes(search.toLowerCase()),
    );
  };

  const showDefaultOption = (rootName: string) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      rootName.toLowerCase().includes(query) ||
      'mặc định'.includes(query) ||
      'chưa phân loại'.includes(query)
    );
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      {/* Ô hiển thị giá trị hiện tại (Trigger) */}
      <button
        type="button"
        onClick={toggleDropdown}
        className="w-full flex items-center justify-between bg-white border border-slate-350 hover:border-slate-400 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-left font-semibold text-slate-800 transition-all shadow-3xs"
      >
        <span className="truncate">{getSelectedLabel()}</span>
        <CaretDown
          size={12}
          className={`text-slate-400 ml-2 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Panel Dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[300px] min-w-full w-[280px] sm:w-[360px]">
          {/* Ô tìm kiếm */}
          <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-1.5 shrink-0 bg-slate-50/50">
            <MagnifyingGlass size={12} className="text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Gõ tìm kiếm nhóm hàng..."
              className="w-full bg-transparent border-none text-[11px] text-slate-700 placeholder-slate-400 focus:outline-none py-0.5"
            />
          </div>

          {/* Danh sách cuộn riêng biệt */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent text-[11px]"
            style={{ maxHeight: '250px' }}
          >
            {filteredRoots.length === 0 ? (
              <div className="px-4 py-6 text-center text-slate-400 font-bold">
                Không tìm thấy danh mục phù hợp
              </div>
            ) : (
              filteredRoots.map((root) => {
                const subs = getSubcategoriesForRoot(root.id);
                const hasSubs = categories.some((cat) => cat.parentId === root.id);

                if (hasSubs) {
                  const isDefaultSelected = value === root.id;
                  const showDefault = showDefaultOption(root.name);

                  return (
                    <div key={root.id} className="border-b last:border-b-0 border-slate-50 pb-1">
                      {/* Tiêu đề nhóm cha (Mờ, không thể click) */}
                      <div className="px-3 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-wider select-none bg-slate-50/20">
                        {root.name}
                      </div>

                      {/* Tùy chọn Mặc định (parentId = null) */}
                      {showDefault && (
                        <button
                          type="button"
                          onClick={() => {
                            onChange(root.id);
                            setIsOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-6 py-2 text-left hover:bg-slate-50 transition-colors cursor-pointer ${
                            isDefaultSelected
                              ? 'bg-blue-50/45 text-blue-600 font-extrabold active-category-item'
                              : 'text-slate-600 font-semibold'
                          }`}
                        >
                          <span className="truncate">
                            Mặc định (chưa phân loại kích thước/vân)
                          </span>
                          {isDefaultSelected && <Check size={12} weight="bold" />}
                        </button>
                      )}

                      {/* Các danh mục con */}
                      {subs.map((sub) => {
                        const isSelected = value === sub.id;
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => {
                              onChange(sub.id);
                              setIsOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-6 py-2 text-left hover:bg-slate-50 transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50/45 text-blue-600 font-extrabold active-category-item'
                                : 'text-slate-700 font-semibold'
                            }`}
                          >
                            <span className="truncate">{sub.name}</span>
                            {isSelected && <Check size={12} weight="bold" />}
                          </button>
                        );
                      })}
                    </div>
                  );
                }

                // Nếu là danh mục chính độc lập (không có danh mục con)
                const isSelected = value === root.id;
                return (
                  <button
                    key={root.id}
                    type="button"
                    onClick={() => {
                      onChange(root.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-slate-50 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/45 text-blue-600 font-extrabold active-category-item'
                        : 'text-slate-700 font-bold border-b border-slate-50 last:border-b-0'
                    }`}
                  >
                    <span className="truncate">{root.name}</span>
                    {isSelected && <Check size={12} weight="bold" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
