import React from 'react';
import {
  House,
  Tree,
  Cube,
  Columns,
  Stack,
  Rows,
  Ruler,
  GridFour,
  Wrench,
} from '@phosphor-icons/react';

// --- Interfaces ---

export interface HeroSlide {
  id: number;
  image: string;
  title: string;
  alt: string;
  objectPosition?: string;
}

export interface CategorySubMenu {
  id?: number;
  label: string;
  href: string;
}

export interface Category {
  id?: number;
  label: string;
  href: string;
  icon: string;
  image?: string;
  imagePosition?: string;
  description?: string;
  subMenu?: CategorySubMenu[];
}

// --- Pure Functions ---

export const toSlug = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export const SYSTEM_PAGES = [
  { label: 'Trang chủ', value: '/' },
  { label: 'Tất cả sản phẩm', value: '/san-pham' },
  { label: 'Giới thiệu', value: '/gioi-thieu' },
  { label: 'Công trình & Dự án', value: '/du-an' },
  { label: 'Liên hệ', value: '/lien-he' },
];

export const detectLinkType = (
  href: string,
  label: string,
): 'auto' | 'system' | 'custom' => {
  const isSystem = SYSTEM_PAGES.some((p) => p.value === href);
  if (isSystem) return 'system';
  if (href === `/san-pham/${toSlug(label)}`) return 'auto';
  return 'custom';
};

export const COLOR_THEMES = [
  { overlayBg: 'bg-[#D8A4B8]/75', textColor: 'text-[#2D0618]' },
  { overlayBg: 'bg-[#FBE49F]/80', textColor: 'text-[#2D1F00]' },
  { overlayBg: 'bg-[#ADCBEB]/80', textColor: 'text-[#03142B]' },
  { overlayBg: 'bg-[#F3CFCB]/80', textColor: 'text-[#2D0D09]' },
  { overlayBg: 'bg-[#E6C29E]/80', textColor: 'text-[#2E1502]' },
  { overlayBg: 'bg-[#A9DFBF]/80', textColor: 'text-[#0A2411]' },
];

// --- Icon System ---

export const iconMap: Record<string, React.ElementType> = {
  House,
  Tree,
  Cube,
  Columns,
  Stack,
  Rows,
  Ruler,
  GridFour,
  Wrench,
};

export const getIcon = (iconName: string) => {
  return iconMap[iconName] || Stack;
};

export const ICON_OPTIONS = [
  { label: 'Mặc định (Ngăn xếp)', value: 'Stack' },
  { label: 'Ngôi nhà (Trang chủ/Chung)', value: 'House' },
  { label: 'Cây xanh (Cảnh quan)', value: 'Tree' },
  { label: 'Khối 3D (Vật liệu)', value: 'Cube' },
  { label: 'Cột dọc (Kiến trúc)', value: 'Columns' },
  { label: 'Hàng ngang', value: 'Rows' },
  { label: 'Thước đo (Thiết kế)', value: 'Ruler' },
  { label: 'Lưới (Bố cục)', value: 'GridFour' },
  { label: 'Cờ lê (Công cụ/Thi công)', value: 'Wrench' },
];

// --- Shared Utilities ---

export const handleImageUpload = (
  e: React.ChangeEvent<HTMLInputElement>,
  callback: (base64: string) => void,
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert(
      'Kích thước file ảnh quá lớn (vui lòng chọn file dưới 5MB) để tránh vượt quá dung lượng lưu trữ.',
    );
    return;
  }

  const reader = new FileReader();
  reader.onloadend = () => {
    if (typeof reader.result === 'string') {
      callback(reader.result);
    }
  };
  reader.readAsDataURL(file);
};
