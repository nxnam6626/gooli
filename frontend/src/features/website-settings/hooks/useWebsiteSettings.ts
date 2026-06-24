import { useState, useEffect } from "react";
import { CONTACT_INFO } from "@/constants/contact";
import { getSystemSettings, updateSystemSettings, getPublicCategories, savePublicCategories } from "@/services/api";
import DEFAULT_CATEGORIES from "@/constants/categories.json";
import { DEFAULT_SLIDES, DEFAULT_BANNER_TOP, DEFAULT_BANNER_BOTTOM } from "../constants/defaultSettings";
import { deduplicateCategories } from "../utils/settingHelpers";

export interface Category {
  label: string;
  href: string;
  icon: string;
  image?: string;
  imagePosition?: string;
  description?: string;
  subMenu?: { label: string; href: string; }[];
}

export interface GeneralSettings {
  online: boolean;
  email: string;
  phone: string;
  address: string;
  facebook: string;
  linkedin: string;
  zalo: string;
  logo: string;
  heroBanner: string;
}

export interface ContentSettings {
  categories: Category[];
  heroSlides: any[];
  bannerTopImage: string;
  bannerTopAlt: string;
  bannerTopPosition: string;
  bannerBottomImage: string;
  bannerBottomAlt: string;
  bannerBottomPosition: string;
}

export interface SeoSettings {
  metaTitle: string;
  metaKeywords: string;
  metaDescription: string;
}

export function useWebsiteSettings() {
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    online: true,
    email: CONTACT_INFO.email,
    phone: CONTACT_INFO.hotline,
    address: CONTACT_INFO.address,
    facebook: CONTACT_INFO.facebook,
    linkedin: CONTACT_INFO.linkedin,
    zalo: CONTACT_INFO.zalo,
    logo: "",
    heroBanner: "",
  });

  const [contentSettings, setContentSettings] = useState<ContentSettings>({
    categories: [],
    heroSlides: DEFAULT_SLIDES,
    bannerTopImage: DEFAULT_BANNER_TOP.image,
    bannerTopAlt: DEFAULT_BANNER_TOP.alt,
    bannerTopPosition: "50% 50%",
    bannerBottomImage: DEFAULT_BANNER_BOTTOM.image,
    bannerBottomAlt: DEFAULT_BANNER_BOTTOM.alt,
    bannerBottomPosition: "50% 50%",
  });

  const [seoSettings, setSeoSettings] = useState<SeoSettings>({
    metaTitle: "Gooli WMS - Hệ thống Quản lý Kho thông minh",
    metaKeywords: "quản lý kho, wms, tồn kho, phần mềm kho, sổ quỹ, logistics",
    metaDescription: "Giải pháp tối ưu hóa vận hành kho bãi, theo dõi hàng xuất nhập, cảnh báo tồn kho và đối soát công nợ chuyên sâu."
  });

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load configuration and categories from APIs, with localStorage as fallback
  useEffect(() => {
    const loadData = async () => {
      try {
        const [apiConfig, dbCategories] = await Promise.all([
          getSystemSettings(),
          getPublicCategories()
        ]);

        if (apiConfig && Object.keys(apiConfig).length > 0) {
          setGeneralSettings(prev => ({ ...prev, ...apiConfig }));
          setContentSettings(prev => ({ ...prev, ...apiConfig }));
          setSeoSettings(prev => ({ ...prev, ...apiConfig }));
        }

        if (dbCategories && dbCategories.length > 0) {
          setContentSettings(prev => ({ ...prev, categories: dbCategories }));
        } else {
          const savedCats = localStorage.getItem("gooli_public_categories_settings");
          if (savedCats) {
            setContentSettings(prev => ({ ...prev, categories: JSON.parse(savedCats) }));
          } else {
            setContentSettings(prev => ({ ...prev, categories: DEFAULT_CATEGORIES }));
          }
        }
        return;
      } catch (err) {
        console.error("Failed to fetch settings/categories from API, trying localStorage fallback:", err);
      }

      // LocalStorage Fallback
      const saved = localStorage.getItem("gooli_public_website_settings");
      if (saved) {
        try {
          const localConfig = JSON.parse(saved);
          setGeneralSettings(prev => ({ ...prev, ...localConfig }));
          setContentSettings(prev => ({ ...prev, ...localConfig }));
          setSeoSettings(prev => ({ ...prev, ...localConfig }));
        } catch (err) {
          console.error("Failed to parse website settings:", err);
        }
      }

      const savedCats = localStorage.getItem("gooli_public_categories_settings");
      if (savedCats) {
        try {
          setContentSettings(prev => ({ ...prev, categories: JSON.parse(savedCats) }));
        } catch (err) {
          console.error("Failed to load category settings:", err);
          setContentSettings(prev => ({ ...prev, categories: DEFAULT_CATEGORIES }));
        }
      } else {
        setContentSettings(prev => ({ ...prev, categories: DEFAULT_CATEGORIES }));
      }
    };

    loadData();
  }, []);

  // Save configuration
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("gooli_token") || "" : "";

      // Deduplicate categories by label (hotfix for double click save bug)
      const uniqueCats = deduplicateCategories(contentSettings.categories);
      setContentSettings(prev => ({ ...prev, categories: uniqueCats }));

      const fullConfig = {
        ...generalSettings,
        ...contentSettings,
        ...seoSettings
      };

      // Parallel API updates for general config and public categories tree
      await Promise.all([
        updateSystemSettings(fullConfig, token),
        savePublicCategories(uniqueCats, token)
      ]);

      // Save local fallback cache
      try {
        localStorage.setItem("gooli_public_website_settings", JSON.stringify(fullConfig));
        localStorage.setItem("gooli_public_categories_settings", JSON.stringify(uniqueCats));
      } catch (e) {
        console.warn("Could not save to localStorage due to quota exceeded, skipping local cache.");
      }

      // Trigger event to notify other open tabs/components
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("website-settings-updated"));
      }

      setToastMessage("Lưu cấu hình giao diện website public thành công!");
      setShowToast(true);
    } catch (err: unknown) {
      console.error("Failed to update system settings/categories:", err);
      const errorMsg = err instanceof Error ? err.message : "Cập nhật cấu hình website thất bại. Vui lòng kiểm tra lại quyền truy cập.";
      alert(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Close toast automatically after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return {
    generalSettings,
    setGeneralSettings,
    contentSettings,
    setContentSettings,
    seoSettings,
    setSeoSettings,
    isSaving,
    toastMessage,
    showToast,
    handleSave
  };
}
