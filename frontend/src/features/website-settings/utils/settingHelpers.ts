import { Category } from "../hooks/useWebsiteSettings";

/**
 * Loại bỏ các danh mục trùng lặp dựa trên nhãn (label).
 * Được sử dụng để ngăn lỗi lưu đúp danh mục khi người dùng double-click nhanh.
 * @param categories Mảng danh mục chưa được lọc.
 * @returns Mảng danh mục đã lọc.
 */
export function deduplicateCategories(categories: Category[]): Category[] {
  const uniqueCats: Category[] = [];
  const seenLabels = new Set();
  for (const cat of categories) {
    if (!seenLabels.has(cat.label)) {
      seenLabels.add(cat.label);
      uniqueCats.push(cat);
    }
  }
  return uniqueCats;
}
