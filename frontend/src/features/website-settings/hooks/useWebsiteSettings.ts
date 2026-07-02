import { useState, useEffect } from "react";
import { CONTACT_INFO } from "@/constants/contact";
import { getSystemSettings, updateSystemSettings } from "../services/settingsApi";
import { useToast } from "@/hooks/useToast";

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

  const [seoSettings, setSeoSettings] = useState<SeoSettings>({
    metaTitle: "Gooli WMS - Hệ thống Quản lý Kho thông minh",
    metaKeywords: "quản lý kho, wms, tồn kho, phần mềm kho, sổ quỹ, logistics",
    metaDescription: "Giải pháp tối ưu hóa vận hành kho bãi, theo dõi hàng xuất nhập, cảnh báo tồn kho và đối soát công nợ chuyên sâu."
  });

  const [isSaving, setIsSaving] = useState(false);
  const { toast, showToast } = useToast();

  useEffect(() => {
    getSystemSettings()
      .then((apiConfig) => {
        if (apiConfig && Object.keys(apiConfig).length > 0) {
          setGeneralSettings(prev => ({ ...prev, ...apiConfig }));
          setSeoSettings(prev => ({ ...prev, ...apiConfig }));
        }
      })
      .catch(err => console.error("Failed to load settings:", err));
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("gooli_token") || "" : "";

      const fullConfig = {
        ...generalSettings,
        ...seoSettings
      };

      await updateSystemSettings(fullConfig, token);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("website-settings-updated"));
      }

      showToast("Lưu cấu hình giao diện website public thành công!");
    } catch (err: unknown) {
      console.error("Failed to update system settings:", err);
      const errorMsg = err instanceof Error ? err.message : "Cập nhật cấu hình website thất bại.";
      alert(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    generalSettings,
    setGeneralSettings,
    seoSettings,
    setSeoSettings,
    isSaving,
    toast,
    handleSave
  };
}
