export interface SubMenuData {
  id?: number;
  label: string;
  href: string;
  icon?: string | null;
  internalCategoryId?: number | null;
}

export interface TreeCategoryData {
  id?: number;
  label: string;
  href: string;
  icon?: string | null;
  image?: string | null;
  imagePosition?: string | null;
  description?: string | null;
  internalCategoryId?: number | null;
  subMenu?: SubMenuData[];
}
