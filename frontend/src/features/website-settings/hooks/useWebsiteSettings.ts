import { useState, useEffect } from "react";
import { CONTACT_INFO } from "@/constants/contact";
import { updateSystemSettings, savePublicCategories } from "@/services/api";
import { DEFAULT_SLIDES, DEFAULT_BANNER_TOP, DEFAULT_BANNER_BOTTOM } from "../constants/defaultSettings";
import { loadSettingsFromAPI, loadSettingsFromLocalStorage } from "../utils/loadSettings";
import { useToast } from "@/hooks/useToast";

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

  const [isSaving, setIsSaving] = useState(false);
  const { toast, showToast } = useToast();

  // Load settings: API first, localStorage as fallback
  useEffect(() => {
    const applyResult = (result: Awaited<ReturnType<typeof loadSettingsFromAPI>>) => {
      setGeneralSettings(prev => ({ ...prev, ...result.general }));
      setContentSettings(prev => ({ ...prev, ...result.content }));
      setSeoSettings(prev => ({ ...prev, ...result.seo }));
    };

    loadSettingsFromAPI()
      .then(applyResult)
      .catch((err) => {
        console.error("API failed, falling back to localStorage:", err);
        applyResult(loadSettingsFromLocalStorage());
      });
  }, []);

  // Save configuration
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("gooli_token") || "" : "";

      const fullConfig = {
        ...generalSettings,
        ...contentSettings,
        ...seoSettings
      };

      await Promise.all([
        updateSystemSettings(fullConfig, token),
        savePublicCategories(contentSettings.categories, token)
      ]);

      // Save local fallback cache
      try {
        localStorage.setItem("gooli_public_website_settings", JSON.stringify(fullConfig));
        localStorage.setItem("gooli_public_categories_settings", JSON.stringify(contentSettings.categories));
      } catch {
        console.warn("Could not save to localStorage due to quota exceeded, skipping local cache.");
      }

      // Trigger event to notify other open tabs/components
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("website-settings-updated"));
      }

      showToast("Lưu cấu hình giao diện website public thành công!");
    } catch (err: unknown) {
      console.error("Failed to update system settings/categories:", err);
      const errorMsg = err instanceof Error ? err.message : "Cập nhật cấu hình website thất bại. Vui lòng kiểm tra lại quyền truy cập.";
      alert(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    generalSettings,
    setGeneralSettings,
    contentSettings,
    setContentSettings,
    seoSettings,
    setSeoSettings,
    isSaving,
    toast,
    handleSave
  };
}
