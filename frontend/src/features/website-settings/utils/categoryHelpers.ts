import { Category, detectLinkType, toSlug } from "../constants/contentConstants";

export function deleteCategory(categories: Category[], cIdx: number): Category[] {
  return categories.filter((_, i) => i !== cIdx);
}

export function updateCategoryImage(
  categories: Category[],
  cIdx: number,
  image: string,
  imagePosition = "50% 50%"
): Category[] {
  const newCats = [...categories];
  if (newCats[cIdx]) {
    newCats[cIdx] = { ...newCats[cIdx], image, imagePosition };
  }
  return newCats;
}

export function updateCategoryLabel(categories: Category[], cIdx: number, label: string): Category[] {
  const newCats = [...categories];
  const cat = newCats[cIdx];
  if (cat) {
    const curType = detectLinkType(cat.href, cat.label);
    const href = curType === "auto" ? `/san-pham/${toSlug(label)}` : cat.href;
    newCats[cIdx] = { ...cat, label, href };
  }
  return newCats;
}

export function updateCategoryIcon(categories: Category[], cIdx: number, icon: string): Category[] {
  const newCats = [...categories];
  if (newCats[cIdx]) {
    newCats[cIdx] = { ...newCats[cIdx], icon };
  }
  return newCats;
}

export function updateCategoryLinkType(categories: Category[], cIdx: number, type: string): Category[] {
  const newCats = [...categories];
  const cat = newCats[cIdx];
  if (cat) {
    let newHref = cat.href;
    if (type === "auto") newHref = `/san-pham/${toSlug(cat.label)}`;
    else if (type === "system") newHref = "/san-pham";
    else if (type === "custom") newHref = "/";
    newCats[cIdx] = { ...cat, href: newHref };
  }
  return newCats;
}

export function updateCategoryHref(categories: Category[], cIdx: number, href: string): Category[] {
  const newCats = [...categories];
  if (newCats[cIdx]) {
    newCats[cIdx] = { ...newCats[cIdx], href };
  }
  return newCats;
}

export function addSubmenu(categories: Category[], cIdx: number): { newCategories: Category[]; newSubIdx: number } {
  const newCats = [...categories];
  const cat = newCats[cIdx];
  if (!cat) return { newCategories: categories, newSubIdx: -1 };
  const currentSub = [...(cat.subMenu || [])];
  const newItem = { label: "Mục con mới", href: "/san-pham/moi" };
  currentSub.push(newItem);
  newCats[cIdx] = { ...cat, subMenu: currentSub };
  return { newCategories: newCats, newSubIdx: currentSub.length - 1 };
}

export function deleteSubmenu(categories: Category[], cIdx: number, sIdx: number): Category[] {
  const newCats = [...categories];
  const cat = newCats[cIdx];
  if (!cat) return categories;
  const currentSub = [...(cat.subMenu || [])];
  currentSub.splice(sIdx, 1);
  newCats[cIdx] = { ...cat, subMenu: currentSub };
  return newCats;
}

export function updateSubmenuLabel(categories: Category[], cIdx: number, sIdx: number, label: string): Category[] {
  const newCats = [...categories];
  const cat = newCats[cIdx];
  if (!cat) return categories;
  const currentSub = [...(cat.subMenu || [])];
  const sub = currentSub[sIdx];
  if (sub) {
    const curType = detectLinkType(sub.href, sub.label);
    const href = curType === "auto" ? `/san-pham/${toSlug(label)}` : sub.href;
    currentSub[sIdx] = { ...sub, label, href };
    newCats[cIdx] = { ...cat, subMenu: currentSub };
  }
  return newCats;
}

export function updateSubmenuLinkType(categories: Category[], cIdx: number, sIdx: number, type: string): Category[] {
  const newCats = [...categories];
  const cat = newCats[cIdx];
  if (!cat) return categories;
  const currentSub = [...(cat.subMenu || [])];
  const sub = currentSub[sIdx];
  if (sub) {
    let newHref = sub.href;
    if (type === "auto") newHref = `/san-pham/${toSlug(sub.label)}`;
    else if (type === "system") newHref = "/san-pham";
    else if (type === "custom") newHref = "/";
    currentSub[sIdx] = { ...sub, href: newHref };
    newCats[cIdx] = { ...cat, subMenu: currentSub };
  }
  return newCats;
}

export function updateSubmenuHref(categories: Category[], cIdx: number, sIdx: number, href: string): Category[] {
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
