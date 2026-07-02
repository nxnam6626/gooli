import React from "react";
import { Category } from "../../../constants/contentConstants";
import CategoryForm from "./CategoryForm";
import SubmenuForm from "./SubmenuForm";

interface CategoryEditorProps {
  categories: Category[];
  setCategories: (cats: Category[]) => void;
  resolvedSel: { type: "category" | "submenu"; catIdx: number; subIdx?: number };
  setModalSel: (sel: { type: "category" | "submenu"; catIdx: number; subIdx?: number } | null) => void;
}

export default function CategoryEditor({
  categories,
  setCategories,
  resolvedSel,
  setModalSel
}: CategoryEditorProps) {
  const cIdx = resolvedSel.catIdx;
  const cat = categories[cIdx];

  if (!cat) return null;

  return (
    <div className="w-full">
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
  );
}
