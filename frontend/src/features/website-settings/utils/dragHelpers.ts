import { Category } from "../constants/contentConstants";

export type ModalSelection = { type: "category" | "submenu"; catIdx: number; subIdx?: number } | null;

export function moveCategory(
  categories: Category[],
  dragCatIdx: number,
  dropCatIdx: number,
  modalSel: ModalSelection
): { newCategories: Category[]; newModalSel: ModalSelection } {
  if (dragCatIdx === dropCatIdx) return { newCategories: categories, newModalSel: modalSel };

  const newCats = [...categories];
  const [moved] = newCats.splice(dragCatIdx, 1);
  newCats.splice(dropCatIdx, 0, moved);

  let newModalSel = modalSel;
  if (modalSel) {
    if (modalSel.type === "category") {
      const newIdx = modalSel.catIdx === dragCatIdx ? dropCatIdx
        : modalSel.catIdx === dropCatIdx ? dragCatIdx
        : modalSel.catIdx;
      newModalSel = { ...modalSel, catIdx: newIdx };
    } else if (modalSel.catIdx === dragCatIdx) {
      newModalSel = { ...modalSel, catIdx: dropCatIdx };
    } else if (modalSel.catIdx === dropCatIdx) {
      newModalSel = { ...modalSel, catIdx: dragCatIdx };
    }
  }

  return { newCategories: newCats, newModalSel };
}

export function moveSubmenu(
  categories: Category[],
  fromCatIdx: number,
  fromSubIdx: number,
  toCatIdx: number,
  toSubIdx: number | undefined,
  modalSel: ModalSelection
): { newCategories: Category[]; newModalSel: ModalSelection } {
  const newCats = [...categories];
  const srcSub = [...(newCats[fromCatIdx].subMenu || [])];

  if (fromCatIdx === toCatIdx) {
    if (fromSubIdx === toSubIdx) return { newCategories: categories, newModalSel: modalSel };
    const [moved] = srcSub.splice(fromSubIdx, 1);
    const insertIdx = toSubIdx !== undefined ? toSubIdx : srcSub.length;
    srcSub.splice(insertIdx, 0, moved);
    newCats[fromCatIdx] = { ...newCats[fromCatIdx], subMenu: srcSub };

    let newModalSel = modalSel;
    if (modalSel?.type === "submenu" && modalSel.catIdx === fromCatIdx) {
      const newSubIdx = modalSel.subIdx === fromSubIdx ? insertIdx
        : modalSel.subIdx === insertIdx ? fromSubIdx
        : modalSel.subIdx;
      newModalSel = { ...modalSel, subIdx: newSubIdx };
    }
    return { newCategories: newCats, newModalSel };
  } else {
    const dstSub = [...(newCats[toCatIdx].subMenu || [])];
    const [moved] = srcSub.splice(fromSubIdx, 1);
    const insertIdx = toSubIdx !== undefined ? toSubIdx : dstSub.length;
    dstSub.splice(insertIdx, 0, moved);

    newCats[fromCatIdx] = { ...newCats[fromCatIdx], subMenu: srcSub };
    newCats[toCatIdx] = { ...newCats[toCatIdx], subMenu: dstSub };

    return {
      newCategories: newCats,
      newModalSel: { type: "submenu", catIdx: toCatIdx, subIdx: insertIdx }
    };
  }
}
