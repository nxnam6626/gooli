import React, { useState } from "react";
import { ContentSettings } from "../../hooks/useWebsiteSettings";
import { CategorySidebar, CategoryEditor } from "./categories";

interface ContentTabProps {
  config: ContentSettings;
  onChange: (newConfig: Partial<ContentSettings>) => void;
}

export default function ContentTab({ config, onChange }: ContentTabProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [modalSel, setModalSel] = useState<{ type: "category" | "submenu"; catIdx: number; subIdx?: number } | null>(null);

  const setCategories = (newCategories: ContentSettings["categories"]) => {
    onChange({ categories: newCategories });
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="w-full">
        <CategorySidebar
          categories={config.categories}
          setCategories={setCategories}
          editingIndex={editingIndex}
          setEditingIndex={setEditingIndex}
          modalSel={modalSel}
          setModalSel={setModalSel}
        />
      </div>

      {editingIndex !== null && modalSel !== null && (
        <div className="fixed inset-0 z-50 overflow-hidden select-none">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => {
              setEditingIndex(null);
              setModalSel(null);
            }}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen sm:max-w-lg bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-slide-in-right h-full">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                <span className="font-extrabold text-slate-800 text-[11px] uppercase tracking-widest">
                  {modalSel.type === "category" ? "Chỉnh sửa danh mục chính" : "Chỉnh sửa danh mục con"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingIndex(null);
                    setModalSel(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors text-base font-bold border-none bg-transparent cursor-pointer outline-none"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin select-text">
                <CategoryEditor
                  categories={config.categories}
                  setCategories={setCategories}
                  resolvedSel={modalSel}
                  setModalSel={setModalSel}
                />
              </div>

              <div className="flex items-center justify-end px-6 py-3 border-t border-slate-100 bg-slate-50/50 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingIndex(null);
                    setModalSel(null);
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl font-bold cursor-pointer text-[10px] uppercase tracking-wider transition-colors shadow-3xs"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
