import React from "react";
import { Category, detectLinkType, SYSTEM_PAGES } from "../constants/contentConstants";
import {
  deleteSubmenu,
  updateSubmenuLabel,
  updateSubmenuLinkType,
  updateSubmenuHref
} from "../utils/categoryHelpers";

interface SubmenuFormProps {
  categories: Category[];
  cIdx: number;
  sIdx: number;
  setCategories: (cats: Category[]) => void;
  setModalSel: (sel: { type: "category" | "submenu"; catIdx: number; subIdx?: number } | null) => void;
}

export default function SubmenuForm({
  categories,
  cIdx,
  sIdx,
  setCategories,
  setModalSel
}: SubmenuFormProps) {
  const cat = categories[cIdx];
  const sub = cat?.subMenu?.[sIdx];

  if (!cat || !sub) return null;

  const inputCls = "w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-sm transition-all";
  const labelCls = "font-bold text-slate-500 text-[10px] uppercase tracking-wider mb-1.5 block";
  const disabledInputCls = "w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-slate-400 font-semibold text-sm cursor-not-allowed";

  const linkType = detectLinkType(sub.href, sub.label);

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => setModalSel({ type: "category", catIdx: cIdx })}
        className="flex items-center gap-1.5 text-[#2563eb] hover:text-blue-800 font-semibold text-sm bg-transparent border-none cursor-pointer outline-none transition-colors"
      >
        ← Quay lại: {cat.label}
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-extrabold text-slate-800 text-xl leading-tight">Chỉnh sửa mục con</h4>
          <p className="text-slate-400 text-xs mt-0.5">
            Thuộc danh mục: <span className="font-semibold text-slate-500">{cat.label}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCategories(deleteSubmenu(categories, cIdx, sIdx));
            setModalSel({ type: "category", catIdx: cIdx });
          }}
          className="text-red-500 hover:text-red-700 font-bold text-xs bg-transparent border-none cursor-pointer outline-none transition-colors shrink-0"
        >
          Xóa mục con
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className={labelCls}>Tên mục con</label>
          <input
            type="text"
            value={sub.label}
            onChange={(e) => {
              setCategories(updateSubmenuLabel(categories, cIdx, sIdx, e.target.value));
            }}
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Loại liên kết</label>
            <select
              value={linkType}
              onChange={(e) => {
                setCategories(updateSubmenuLinkType(categories, cIdx, sIdx, e.target.value));
              }}
              className={inputCls}
            >
              <option value="auto">Tự động (Danh mục SP)</option>
              <option value="system">Trang hệ thống</option>
              <option value="custom">Đường dẫn tự nhập</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Chi tiết liên kết (href)</label>
            {linkType === "auto" && (
              <input type="text" disabled value={sub.href} className={disabledInputCls} />
            )}
            {linkType === "system" && (
              <select
                value={sub.href}
                onChange={(e) => {
                  setCategories(updateSubmenuHref(categories, cIdx, sIdx, e.target.value));
                }}
                className={inputCls}
              >
                {SYSTEM_PAGES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label} ({p.value})</option>
                ))}
              </select>
            )}
            {linkType === "custom" && (
              <input
                type="text"
                value={sub.href}
                onChange={(e) => {
                  setCategories(updateSubmenuHref(categories, cIdx, sIdx, e.target.value));
                }}
                className={inputCls}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
