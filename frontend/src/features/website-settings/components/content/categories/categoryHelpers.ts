import {
  Category,
  detectLinkType,
  toSlug,
} from '../../../constants/contentConstants';

export function deleteCategory(
  categories: Category[],
  cIdx: number,
): Category[] {
  return categories.filter((_, i) => i !== cIdx);
}

export function updateCategoryImage(
  categories: Category[],
  cIdx: number,
  image: string,
  imagePosition = '50% 50%',
): Category[] {
  const newCats = [...categories];
  if (newCats[cIdx]) {
    newCats[cIdx] = { ...newCats[cIdx], image, imagePosition };
  }
  return newCats;
}

export function updateCategoryLabel(
  categories: Category[],
  cIdx: number,
  label: string,
): Category[] {
  const newCats = [...categories];
  const cat = newCats[cIdx];
  if (cat) {
    const curType = detectLinkType(cat.href, cat.label);
    const href = curType === 'auto' ? `/san-pham/${toSlug(label)}` : cat.href;
    newCats[cIdx] = { ...cat, label, href };
  }
  return newCats;
}

export function updateCategoryIcon(
  categories: Category[],
  cIdx: number,
  icon: string,
): Category[] {
  const newCats = [...categories];
  if (newCats[cIdx]) {
    newCats[cIdx] = { ...newCats[cIdx], icon };
  }
  return newCats;
}

export function updateCategoryLinkType(
  categories: Category[],
  cIdx: number,
  type: string,
): Category[] {
  const newCats = [...categories];
  const cat = newCats[cIdx];
  if (cat) {
    let newHref = cat.href;
    if (type === 'auto') newHref = `/san-pham/${toSlug(cat.label)}`;
    else if (type === 'system') newHref = '/san-pham';
    else if (type === 'custom') newHref = '/';
    newCats[cIdx] = { ...cat, href: newHref };
  }
  return newCats;
}

export function updateCategoryHref(
  categories: Category[],
  cIdx: number,
  href: string,
): Category[] {
  const newCats = [...categories];
  if (newCats[cIdx]) {
    newCats[cIdx] = { ...newCats[cIdx], href };
  }
  return newCats;
}

export function addSubmenu(
  categories: Category[],
  cIdx: number,
): { newCategories: Category[]; newSubIdx: number } {
  const newCats = [...categories];
  const cat = newCats[cIdx];
  if (!cat) return { newCategories: categories, newSubIdx: -1 };
  const currentSub = [...(cat.subMenu || [])];
  const newItem = { label: 'Mục con mới', href: '/san-pham/moi' };
  currentSub.push(newItem);
  newCats[cIdx] = { ...cat, subMenu: currentSub };
  return { newCategories: newCats, newSubIdx: currentSub.length - 1 };
}

export function deleteSubmenu(
  categories: Category[],
  cIdx: number,
  sIdx: number,
): Category[] {
  const newCats = [...categories];
  const cat = newCats[cIdx];
  if (!cat) return categories;
  const currentSub = [...(cat.subMenu || [])];
  currentSub.splice(sIdx, 1);
  newCats[cIdx] = { ...cat, subMenu: currentSub };
  return newCats;
}

export function updateSubmenuLabel(
  categories: Category[],
  cIdx: number,
  sIdx: number,
  label: string,
): Category[] {
  const newCats = [...categories];
  const cat = newCats[cIdx];
  if (!cat) return categories;
  const currentSub = [...(cat.subMenu || [])];
  const sub = currentSub[sIdx];
  if (sub) {
    const curType = detectLinkType(sub.href, sub.label);
    const href = curType === 'auto' ? `/san-pham/${toSlug(label)}` : sub.href;
    currentSub[sIdx] = { ...sub, label, href };
    newCats[cIdx] = { ...cat, subMenu: currentSub };
  }
  return newCats;
}

export function updateSubmenuLinkType(
  categories: Category[],
  cIdx: number,
  sIdx: number,
  type: string,
): Category[] {
  const newCats = [...categories];
  const cat = newCats[cIdx];
  if (!cat) return categories;
  const currentSub = [...(cat.subMenu || [])];
  const sub = currentSub[sIdx];
  if (sub) {
    let newHref = sub.href;
    if (type === 'auto') newHref = `/san-pham/${toSlug(sub.label)}`;
    else if (type === 'system') newHref = '/san-pham';
    else if (type === 'custom') newHref = '/';
    currentSub[sIdx] = { ...sub, href: newHref };
    newCats[cIdx] = { ...cat, subMenu: currentSub };
  }
  return newCats;
}

export function updateSubmenuHref(
  categories: Category[],
  cIdx: number,
  sIdx: number,
  href: string,
): Category[] {
  const newCats = [...categories];
  const cat = newCats[cIdx];
  if (!cat) return categories;
  const currentSub = [...(cat.subMenu || [])];
  const sub = currentSub[sIdx];
  if (sub) {
    currentSub[sIdx] = { ...sub, href };
    newCats[cIdx] = { ...cat, subMenu: currentSub };
  }
  return newCats;
}

export type ModalSelection = {
  type: 'category' | 'submenu';
  catIdx: number;
  subIdx?: number;
} | null;

export function moveCategory(
  categories: Category[],
  dragCatIdx: number,
  dropCatIdx: number,
  modalSel: ModalSelection,
): { newCategories: Category[]; newModalSel: ModalSelection } {
  if (dragCatIdx === dropCatIdx)
    return { newCategories: categories, newModalSel: modalSel };

  const newCats = [...categories];
  const [moved] = newCats.splice(dragCatIdx, 1);
  newCats.splice(dropCatIdx, 0, moved);

  let newModalSel = modalSel;
  if (modalSel) {
    if (modalSel.type === 'category') {
      const newIdx =
        modalSel.catIdx === dragCatIdx
          ? dropCatIdx
          : modalSel.catIdx === dropCatIdx
            ? dragCatIdx
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
  modalSel: ModalSelection,
): { newCategories: Category[]; newModalSel: ModalSelection } {
  const newCats = [...categories];
  const srcSub = [...(newCats[fromCatIdx].subMenu || [])];

  if (fromCatIdx === toCatIdx) {
    if (fromSubIdx === toSubIdx)
      return { newCategories: categories, newModalSel: modalSel };
    const [moved] = srcSub.splice(fromSubIdx, 1);
    const insertIdx = toSubIdx !== undefined ? toSubIdx : srcSub.length;
    srcSub.splice(insertIdx, 0, moved);
    newCats[fromCatIdx] = { ...newCats[fromCatIdx], subMenu: srcSub };

    let newModalSel = modalSel;
    if (modalSel?.type === 'submenu' && modalSel.catIdx === fromCatIdx) {
      const newSubIdx =
        modalSel.subIdx === fromSubIdx
          ? insertIdx
          : modalSel.subIdx === insertIdx
            ? fromSubIdx
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
      newModalSel: { type: 'submenu', catIdx: toCatIdx, subIdx: insertIdx },
    };
  }
}


