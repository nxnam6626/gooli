import { getSystemSettings, getPublicCategories } from "@/services/api";
import DEFAULT_CATEGORIES from "@/constants/categories.json";
import type { GeneralSettings, ContentSettings, SeoSettings } from "../hooks/useWebsiteSettings";

const LS_KEY_SETTINGS = "gooli_public_website_settings";
const LS_KEY_CATEGORIES = "gooli_public_categories_settings";

export interface LoadResult {
  general: Partial<GeneralSettings>;
  content: Partial<ContentSettings>;
  seo: Partial<SeoSettings>;
}

/**
 * Tải cấu hình từ API (nguồn chính).
 * Trả về dữ liệu đã phân loại theo 3 nhóm settings.
 */
export async function loadSettingsFromAPI(): Promise<LoadResult> {
  const [apiConfig, dbCategories] = await Promise.all([
    getSystemSettings(),
    getPublicCategories()
  ]);

  const result: LoadResult = { general: {}, content: {}, seo: {} };

  if (apiConfig && Object.keys(apiConfig).length > 0) {
    result.general = { ...apiConfig };
    result.content = { ...apiConfig };
    result.seo = { ...apiConfig };
  }

  if (dbCategories && dbCategories.length > 0) {
    result.content.categories = dbCategories;
  } else {
    result.content.categories = loadCategoriesFromLocalStorage();
  }

  return result;
}

/**
 * Tải cấu hình từ localStorage (nguồn dự phòng khi API lỗi).
 */
export function loadSettingsFromLocalStorage(): LoadResult {
  const result: LoadResult = { general: {}, content: {}, seo: {} };

  const saved = localStorage.getItem(LS_KEY_SETTINGS);
  if (saved) {
    try {
      const localConfig = JSON.parse(saved);
      result.general = { ...localConfig };
      result.content = { ...localConfig };
      result.seo = { ...localConfig };
    } catch (err) {
      console.error("Failed to parse website settings:", err);
    }
  }

  result.content.categories = loadCategoriesFromLocalStorage();
  return result;
}

function loadCategoriesFromLocalStorage() {
  const savedCats = localStorage.getItem(LS_KEY_CATEGORIES);
  if (savedCats) {
    try {
      return JSON.parse(savedCats);
    } catch (err) {
      console.error("Failed to load category settings:", err);
    }
  }
  return DEFAULT_CATEGORIES;
}
