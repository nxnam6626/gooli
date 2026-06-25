import React from "react";
import { Category } from "../../../constants/contentConstants";
import CategoryForm from "./CategoryForm";
import SubmenuForm from "./SubmenuForm";

interface CategoryEditorProps {
  categories: Category[];
  setCategories: (cats: Category[]) => void;
  resolvedSel: { type: "category" | "submenu"; catIdx: number; subIdx?: number };
  setModalSel: (sel: { type: "category" | "submenu"; catIdx: number; subIdx?: number } | null) => void;
  setEditingIndex: (idx: number | null) => void;
}

export default function CategoryEditor({
  categories,
  setCategories,
  resolvedSel,
  setModalSel,
  setEditingIndex
}: CategoryEditorProps) {
  const cIdx = resolvedSel.catIdx;
  const cat = categories[cIdx];

  if (!cat) return null;

  return (
    <div className="lg:col-span-3 flex flex-col bg-white border border-slate-200 rounded-xl shadow-3xs overflow-hidden min-h-[600px]">
      <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-thin">
        {resolvedSel.type === "category" ? (
          <CategoryForm
            categories={categories}
            cIdx={cIdx}
            setCategories={setCategories}
            setModalSel={setModalSel}
          />
        ) : (
          resolvedSel.type === "submenu" && resolvedSel.subIdx !== undefined && (
            <SubmenuForm
              categories={categories}
              cIdx={cIdx}
              sIdx={resolvedSel.subIdx}
              setCategories={setCategories}
              setModalSel={setModalSel}
            />
          )
        )}
      </div>

      <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 bg-white rounded-b-2xl shrink-0">
        <button
          type="button"
          onClick={() => {
            setEditingIndex(null);
            setModalSel(null);
          }}
          className="px-5 py-2 text-slate-700 font-semibold text-sm bg-white hover:bg-slate-50 border border-slate-200 rounded-lg cursor-pointer outline-none transition-colors"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
