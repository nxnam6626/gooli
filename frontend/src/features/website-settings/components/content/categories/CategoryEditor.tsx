import React from 'react';
import { Category } from '../../../constants/contentConstants';
import CategoryForm from './CategoryForm';
import SubmenuForm from './SubmenuForm';

interface InternalCategory {
  id: number;
  name: string;
}

interface CategoryEditorProps {
  categories: Category[];
  setCategories: (cats: Category[]) => void;
  resolvedSel: {
    type: 'category' | 'submenu';
    catIdx: number;
    subIdx?: number;
  };
  setModalSel: (
    sel: {
      type: 'category' | 'submenu';
      catIdx: number;
      subIdx?: number;
    } | null,
  ) => void;
  internalCategories: InternalCategory[];
}

export default function CategoryEditor({
  categories,
  setCategories,
  resolvedSel,
  setModalSel,
  internalCategories,
}: CategoryEditorProps) {
  const cIdx = resolvedSel.catIdx;
  const cat = categories[cIdx];

  if (!cat) return null;

  return (
    <div className="w-full">
      {resolvedSel.type === 'category' ? (
        <CategoryForm
          categories={categories}
          cIdx={cIdx}
          setCategories={setCategories}
          setModalSel={setModalSel}
          internalCategories={internalCategories}
        />
      ) : (
        resolvedSel.type === 'submenu' &&
        resolvedSel.subIdx !== undefined && (
          <SubmenuForm
            categories={categories}
            cIdx={cIdx}
            sIdx={resolvedSel.subIdx}
            setCategories={setCategories}
            setModalSel={setModalSel}
            internalCategories={internalCategories}
          />
        )
      )}
    </div>
  );
}
