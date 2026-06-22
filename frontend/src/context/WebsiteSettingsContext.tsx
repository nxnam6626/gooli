"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import DEFAULT_CATEGORIES from "@/constants/categories.json";
import { CONTACT_INFO } from "@/constants/contact";

export interface WebsiteSettings {
  logo: string;
  heroBanner: string;
  phone: string;
  address: string;
  facebook: string;
  zalo: string;
  linkedin: string;
  categories: Array<{ label: string; href: string }>;
}

const defaultCategories = DEFAULT_CATEGORIES.slice(0, 8).map(cat => ({
  label: cat.label,
  href: cat.href
}));

const defaultSettings: WebsiteSettings = {
  logo: "",
  heroBanner: "",
  phone: CONTACT_INFO.hotline,
  address: CONTACT_INFO.address,
  facebook: CONTACT_INFO.facebook,
  zalo: "",
  linkedin: CONTACT_INFO.linkedin,
  categories: defaultCategories
};

const WebsiteSettingsContext = createContext<WebsiteSettings>(defaultSettings);

export function WebsiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<WebsiteSettings>(defaultSettings);

  useEffect(() => {
    const loadSettings = () => {
      let updatedPhone = CONTACT_INFO.hotline;
      let updatedAddress = CONTACT_INFO.address;
      let updatedFacebook = CONTACT_INFO.facebook;
      let updatedLinkedin = CONTACT_INFO.linkedin;
      let updatedZalo = "";
      let updatedLogo = "";
      let updatedHeroBanner = "";
      let updatedCategories = [...defaultCategories];

      // 1. Load general website settings
      const savedWeb = localStorage.getItem("gooli_public_website_settings");
      if (savedWeb) {
        try {
          const config = JSON.parse(savedWeb);
          if (config.phone) updatedPhone = config.phone;
          if (config.address) updatedAddress = config.address;
          if (config.logo) updatedLogo = config.logo;
          if (config.heroBanner) updatedHeroBanner = config.heroBanner;
          if (config.facebook) updatedFacebook = config.facebook;
          if (config.zalo) updatedZalo = config.zalo;
          if (config.linkedin) updatedLinkedin = config.linkedin;
        } catch (err) {
          console.error("Failed to parse website settings in context:", err);
        }
      }

      // 2. Load category settings
      const savedCats = localStorage.getItem("gooli_public_categories_settings");
      if (savedCats) {
        try {
          const parsed = JSON.parse(savedCats);
          if (Array.isArray(parsed) && parsed.length > 0) {
            updatedCategories = parsed.map((cat: { label: string; href: string }) => ({
              label: cat.label,
              href: cat.href
            }));
          }
        } catch (err) {
          console.error("Failed to parse website categories in context:", err);
        }
      }

      setSettings({
        logo: updatedLogo,
        heroBanner: updatedHeroBanner,
        phone: updatedPhone,
        address: updatedAddress,
        facebook: updatedFacebook,
        zalo: updatedZalo,
        linkedin: updatedLinkedin,
        categories: updatedCategories
      });
    };

    loadSettings();
    window.addEventListener("website-settings-updated", loadSettings);
    return () => window.removeEventListener("website-settings-updated", loadSettings);
  }, []);

  return (
    <WebsiteSettingsContext.Provider value={settings}>
      {children}
    </WebsiteSettingsContext.Provider>
  );
}

export function useWebsiteSettings() {
  return useContext(WebsiteSettingsContext);
}
