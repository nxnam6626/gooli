import { useState, useEffect } from "react";
import { CONTACT_INFO } from "@/constants/contact";
import { getSystemSettings, updateSystemSettings, getPublicCategories, savePublicCategories } from "@/services/api";
import DEFAULT_CATEGORIES from "@/constants/categories.json";

const DEFAULT_SLIDES = [
  {
    id: 1,
    image: "/hero_ceiling.png",
    title: "Thi công trần gỗ nhựa cao cấp",
    alt: "Trần gỗ nhựa ngoài trời thực tế"
  }
];

const DEFAULT_BANNER_TOP = {
  image: "/projects/banner_top_marble.png",
  alt: "Lam gỗ và vách đá trang trí cao cấp"
};

const DEFAULT_BANNER_BOTTOM = {
  image: "/projects/banner_bottom_girl.png",
  alt: "Ốp tường gỗ nhựa phòng khách sang trọng"
};

interface Category {
  label: string;
  href: string;
  icon: string;
  subMenu?: { label: string; href: string; }[];
}

export function useWebsiteSettings() {
  const [config, setConfig] = useState({
    online: true,
    email: CONTACT_INFO.email,
    phone: CONTACT_INFO.hotline,
    address: CONTACT_INFO.address,
    facebook: CONTACT_INFO.facebook,
    linkedin: CONTACT_INFO.linkedin,
    zalo: CONTACT_INFO.zalo,
    logo: "",
    heroBanner: "",
    heroSlides: DEFAULT_SLIDES,
    bannerTopImage: DEFAULT_BANNER_TOP.image,
    bannerTopAlt: DEFAULT_BANNER_TOP.alt,
    bannerTopPosition: "50% 50%",
    bannerBottomImage: DEFAULT_BANNER_BOTTOM.image,
    bannerBottomAlt: DEFAULT_BANNER_BOTTOM.alt,
    bannerBottomPosition: "50% 50%",
    metaTitle: "Gooli WMS - Hệ thống Quản lý Kho thông minh",
    metaKeywords: "quản lý kho, wms, tồn kho, phần mềm kho, sổ quỹ, logistics",
    metaDescription: "Giải pháp tối ưu hóa vận hành kho bãi, theo dõi hàng xuất nhập, cảnh báo tồn kho và đối soát công nợ chuyên sâu."
  });

  const [categories, setCategories] = useState<Category[]>([]);
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
          setConfig(prev => ({ ...prev, ...apiConfig }));
        }

        if (dbCategories && dbCategories.length > 0) {
          setCategories(dbCategories);
        } else {
          const savedCats = localStorage.getItem("gooli_public_categories_settings");
          if (savedCats) setCategories(JSON.parse(savedCats));
          else setCategories(DEFAULT_CATEGORIES);
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
          setConfig(prev => ({ ...prev, ...localConfig }));
        } catch (err) {
          console.error("Failed to parse website settings:", err);
        }
      }

      const savedCats = localStorage.getItem("gooli_public_categories_settings");
      if (savedCats) {
        try {
          setCategories(JSON.parse(savedCats));
        } catch (err) {
          console.error("Failed to load category settings:", err);
          setCategories(DEFAULT_CATEGORIES);
        }
      } else {
        setCategories(DEFAULT_CATEGORIES);
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
      const uniqueCats: Category[] = [];
      const seenLabels = new Set();
      for (const cat of categories) {
        if (!seenLabels.has(cat.label)) {
          seenLabels.add(cat.label);
          uniqueCats.push(cat);
        }
      }
      setCategories(uniqueCats);

      // Parallel API updates for general config and public categories tree
      await Promise.all([
        updateSystemSettings(config, token),
        savePublicCategories(uniqueCats, token)
      ]);

      // Save local fallback cache
      try {
        localStorage.setItem("gooli_public_website_settings", JSON.stringify(config));
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
    config,
    setConfig,
    categories,
    setCategories,
    isSaving,
    toastMessage,
    showToast,
    handleSave
  };
}
