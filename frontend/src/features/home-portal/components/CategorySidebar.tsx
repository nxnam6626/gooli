'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CaretRight,
  Plus,
  Minus,
  House,
  Tree,
  Cube,
  Columns,
  Stack,
  Rows,
  Ruler,
  GridFour,
  Wrench,
} from '@phosphor-icons/react';

interface CategorySidebarProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
}

interface SubMenu {
  label: string;
  href: string;
}

interface CategoryItem {
  label: string;
  href: string;
  icon: string;
  subMenu?: SubMenu[];
}

const iconMap: Record<string, React.ElementType> = {
  House,
  Tree,
  Cube,
  Columns,
  Stack,
  Rows,
  Ruler,
  GridFour,
  Wrench,
};

const getIcon = (iconName: string) => {
  return iconMap[iconName] || Stack;
};

import DEFAULT_CATEGORIES from '@/constants/categories.json';

export default function CategorySidebar({
  isExpanded,
  onToggleExpand,
}: CategorySidebarProps) {
  const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState<
    number | null
  >(null);
  const [allCategories, setAllCategories] =
    useState<CategoryItem[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    const loadCategories = () => {
      const saved = localStorage.getItem('gooli_public_categories_settings');
      if (saved) {
        try {
          setAllCategories(JSON.parse(saved));
        } catch (err) {
          console.error('Failed to load category settings in sidebar:', err);
        }
      }
    };

    loadCategories();
    window.addEventListener('website-settings-updated', loadCategories);
    return () =>
      window.removeEventListener('website-settings-updated', loadCategories);
  }, []);

  const categories = isExpanded ? allCategories : allCategories.slice(0, 8);

  return (
    <aside
      className="w-full lg:w-[280px] shrink-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col relative rounded-lg shadow-sm"
      onMouseLeave={() => setHoveredCategoryIndex(null)}
    >
      <div className="flex flex-col flex-1">
        {categories.map((cat, idx) => {
          const IconComponent = getIcon(cat.icon);
          const isHovered = idx === hoveredCategoryIndex;
          return (
            <Link
              key={idx}
              href={cat.href}
              onMouseEnter={() => setHoveredCategoryIndex(idx)}
              className={`lg:h-[50px] h-[48px] flex items-center justify-between sidebar-item-padding border-b border-neutral-100 dark:border-neutral-850 transition-colors duration-150 group ${
                idx === 0 ? 'rounded-t-lg' : ''
              } ${
                isHovered
                  ? 'bg-[#A8051E] text-white'
                  : 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-[#B06518] dark:hover:text-brand-gold'
              }`}
            >
              <div className="flex items-center gap-3">
                <IconComponent
                  size={18}
                  className={`transition-colors ${
                    isHovered
                      ? 'text-white'
                      : 'text-neutral-500 group-hover:text-[#B06518] dark:group-hover:text-brand-gold'
                  }`}
                  aria-hidden="true"
                />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  {cat.label}
                </span>
              </div>
              <CaretRight
                size={13}
                className={`transition-all ${
                  isHovered
                    ? 'text-white translate-x-0.5'
                    : 'text-neutral-400 group-hover:translate-x-0.5'
                }`}
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>

      <button
        onClick={() => {
          onToggleExpand();
          setHoveredCategoryIndex(null);
        }}
        className="lg:h-[50px] h-[48px] flex items-center justify-between sidebar-item-padding text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-[#B06518] dark:hover:text-brand-gold transition-colors duration-200 group cursor-pointer rounded-b-lg"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-[20px] h-[20px] rounded-full bg-[#B06518] dark:bg-brand-gold flex items-center justify-center text-white"
            aria-hidden="true"
          >
            {isExpanded ? (
              <Minus size={12} weight="bold" />
            ) : (
              <Plus size={12} weight="bold" />
            )}
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 group-hover:text-[#B06518] dark:group-hover:text-brand-gold transition-colors">
            {isExpanded ? 'Thu gọn' : 'Xem thêm'}
          </span>
        </div>
        {isExpanded ? (
          <Minus size={14} className="text-neutral-400" aria-hidden="true" />
        ) : (
          <Plus size={14} className="text-neutral-400" aria-hidden="true" />
        )}
      </button>

      {hoveredCategoryIndex !== null &&
        categories[hoveredCategoryIndex]?.subMenu && (
          <div
            className="absolute left-full z-30 pl-2 transition-all duration-200"
            style={{
              top: `${hoveredCategoryIndex * 50}px`,
            }}
          >
            <div
              className="w-[260px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl rounded-lg"
              style={{
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              {categories[hoveredCategoryIndex]?.subMenu?.map((sub, sIdx) => (
                <Link
                  key={sIdx}
                  href={sub.href}
                  className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-[#A8051E] dark:hover:text-brand-gold transition-colors rounded-md"
                  style={{
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  {sub.label}
                </Link>
              ))}
            </div>
          </div>
        )}
    </aside>
  );
}
