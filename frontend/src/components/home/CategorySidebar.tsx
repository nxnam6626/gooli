/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  Wrench
} from "@phosphor-icons/react";

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
  Wrench
};

const getIcon = (iconName: string) => {
  return iconMap[iconName] || Stack;
};

const DEFAULT_CATEGORIES = [
  {
    label: "Lam gỗ nhựa trong nhà",
    href: "/san-pham/lam-trong-nha",
    icon: "House",
    subMenu: [
      { label: "Lam sóng PS", href: "/san-pham/lam-trong-nha/song-ps" },
      { label: "Lam sóng bán nguyệt", href: "/san-pham/lam-trong-nha/song-ban-nguyet" },
      { label: "Lam sóng tròn", href: "/san-pham/lam-trong-nha/song-tron" },
      { label: "Lam hộp trong nhà", href: "/san-pham/lam-trong-nha/hop" },
      { label: "Lam 3 sóng thấp", href: "/san-pham/lam-trong-nha/3-song-thap" },
      { label: "Lam 4 sóng thấp", href: "/san-pham/lam-trong-nha/4-song-thap" },
      { label: "Lam 5 sóng thấp", href: "/san-pham/lam-trong-nha/5-song-thap" }
    ]
  },
  {
    label: "Lam gỗ nhựa ngoài trời",
    href: "/san-pham/lam-ngoai-troi",
    icon: "Tree",
    subMenu: [
      { label: "Tấm ốp ngoài trời", href: "/san-pham/lam-ngoai-troi/tam-op" },
      { label: "Lam sóng ngoài trời", href: "/san-pham/lam-ngoai-troi/song" },
      { label: "Lam hộp ngoài trời", href: "/san-pham/lam-ngoai-troi/hop" },
      { label: "Thanh đa năng", href: "/san-pham/lam-ngoai-troi/thanh-da-nang" },
      { label: "Sàn nhựa ngoài trời", href: "/san-pham/lam-ngoai-troi/san-nhua" }
    ]
  },
  {
    label: "Tấm nano nhựa",
    href: "/san-pham/tam-nano",
    icon: "Cube",
    subMenu: [
      { label: "Tấm ốp Nano phẳng", href: "/san-pham/tam-nano/phang" },
      { label: "Tấm ốp Nano vân gỗ", href: "/san-pham/tam-nano/van-go" },
      { label: "Tấm ốp Nano vân đá", href: "/san-pham/tam-nano/van-da" }
    ]
  },
  { 
    label: "Vách ngăn 2 mặt", 
    href: "/san-pham/vach-ngan", 
    icon: "Columns",
    subMenu: [
      { label: "Vách ngăn kích thước 3.5m", href: "/san-pham/vach-ngan/3.5m" },
      { label: "Vách ngăn kích thước 3.0m", href: "/san-pham/vach-ngan/3.0m" },
      { label: "Vách ngăn kích thước 2.9m", href: "/san-pham/vach-ngan/2.9m" }
    ]
  },
  { label: "La phông nhựa", href: "/san-pham/la-phong", icon: "Stack" },
  { label: "Sàn gỗ nhựa", href: "/san-pham/san-go", icon: "Rows" },
  { label: "Phào chỉ trang trí", href: "/san-pham/phao-chi", icon: "Ruler" },
  { label: "Khung trần", href: "/san-pham/khung-tran", icon: "GridFour" },
  { label: "Lam sóng ốp tường", href: "/san-pham/lam-song-op-tuong", icon: "Stack" },
  { label: "Tấm PVC vân đá", href: "/san-pham/pvc-van-da", icon: "Cube" },
  { label: "Phụ kiện thi công", href: "/san-pham/phu-kien", icon: "Wrench" }
];

export default function CategorySidebar({ isExpanded, onToggleExpand }: CategorySidebarProps) {
  const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState<number | null>(null);
  const [allCategories, setAllCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    const saved = localStorage.getItem("gooli_public_categories_settings");
    if (saved) {
      try {
        setAllCategories(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to load category settings in sidebar:", err);
      }
    }
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
                idx === 0 ? "rounded-t-lg" : ""
              } ${isHovered
                ? "bg-[#A8051E] text-white"
                : "text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-[#B06518] dark:hover:text-brand-gold"
                }`}
            >
              <div className="flex items-center gap-3">
                <IconComponent
                  size={18}
                  className={`transition-colors ${isHovered
                    ? "text-white"
                    : "text-neutral-500 group-hover:text-[#B06518] dark:group-hover:text-brand-gold"
                    }`}
                  aria-hidden="true"
                />
                <span className="text-xs font-semibold uppercase tracking-wider">{cat.label}</span>
              </div>
              <CaretRight
                size={13}
                className={`transition-all ${isHovered
                  ? "text-white translate-x-0.5"
                  : "text-neutral-400 group-hover:translate-x-0.5"
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
            <div className="w-[20px] h-[20px] rounded-full bg-[#B06518] dark:bg-brand-gold flex items-center justify-center text-white" aria-hidden="true">
              {isExpanded ? <Minus size={12} weight="bold" /> : <Plus size={12} weight="bold" />}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 group-hover:text-[#B06518] dark:group-hover:text-brand-gold transition-colors">
              {isExpanded ? "Thu gọn" : "Xem thêm"}
            </span>
          </div>
          {isExpanded ? (
            <Minus size={14} className="text-neutral-400" aria-hidden="true" />
          ) : (
            <Plus size={14} className="text-neutral-400" aria-hidden="true" />
          )}
        </button>

        {hoveredCategoryIndex !== null && categories[hoveredCategoryIndex]?.subMenu && (
          <div
            className="absolute left-full z-30 pl-2 transition-all duration-200"
            style={{ 
              top: `${hoveredCategoryIndex * 50}px`
            }}
          >
            <div 
              className="w-[260px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl rounded-lg"
              style={{
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "4px"
              }}
            >
              {categories[hoveredCategoryIndex]?.subMenu?.map((sub, sIdx) => (
                <Link
                  key={sIdx}
                  href={sub.href}
                  className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-[#A8051E] dark:hover:text-brand-gold transition-colors rounded-md"
                  style={{
                    paddingLeft: "16px",
                    paddingRight: "16px",
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    width: "100%"
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
