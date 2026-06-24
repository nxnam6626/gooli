"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { WebsiteSettingsProvider } from "@/context/WebsiteSettingsContext";
import Footer from "@/components/layout/Footer";
import { Wrench } from "@phosphor-icons/react";
import { CONTACT_INFO } from "@/constants/contact";
import { getSystemSettings, getPublicCategories } from "@/services/api";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [contactInfo, setContactInfo] = useState({
    email: CONTACT_INFO.email,
    phone: CONTACT_INFO.hotline
  });

  useEffect(() => {
    // 1. Fast load from local cache if available
    const saved = localStorage.getItem("gooli_public_website_settings");
    if (saved) {
      try {
        const config = JSON.parse(saved);
        if (config.online !== undefined) setIsOnline(config.online);
        else setIsOnline(true);
        if (config.email) setContactInfo(prev => ({ ...prev, email: config.email }));
        if (config.phone) setContactInfo(prev => ({ ...prev, phone: config.phone }));
        if (config.metaTitle) document.title = config.metaTitle;
        if (config.metaDescription) {
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) metaDesc.setAttribute("content", config.metaDescription);
        }
      } catch (err) {
        console.error("Failed to parse cached website settings:", err);
      }
    }

    // 2. Fetch fresh settings and categories from backend API in parallel
    Promise.all([getSystemSettings(), getPublicCategories()])
      .then(([settings, categories]) => {
        let hasUpdates = false;

        if (settings && Object.keys(settings).length > 0) {
          localStorage.setItem("gooli_public_website_settings", JSON.stringify(settings));
          if (settings.online !== undefined) setIsOnline(settings.online);
          else setIsOnline(true);
          
          setContactInfo({
            email: settings.email || CONTACT_INFO.email,
            phone: settings.phone || CONTACT_INFO.hotline
          });

          if (settings.metaTitle) document.title = settings.metaTitle;
          if (settings.metaDescription) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.setAttribute("content", settings.metaDescription);
          }
          hasUpdates = true;
        } else {
          if (isOnline === null) setIsOnline(true);
        }

        if (categories && Array.isArray(categories)) {
          try {
            localStorage.setItem("gooli_public_categories_settings", JSON.stringify(categories));
          } catch (e) {
            console.warn("Could not save categories to localStorage (quota exceeded)", e);
          }
          hasUpdates = true;
        }

        if (hasUpdates) {
          window.dispatchEvent(new CustomEvent("website-settings-updated", { detail: { categories } }));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch fresh website settings/categories from backend:", err);
        if (isOnline === null) setIsOnline(true);
      });
  }, []);


  if (isOnline === false) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center select-none font-sans">
        <div className="max-w-md bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-8 rounded-2xl shadow-xl flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
            <Wrench size={32} weight="duotone" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-extrabold text-white tracking-tight">Hệ Thống Đang Bảo Trì</h1>
            <p className="text-slate-400 text-xs leading-relaxed">
              Chúng tôi hiện đang nâng cấp và tối ưu hóa hệ thống để đem lại trải nghiệm tốt nhất. Trang web công khai sẽ hoạt động trở lại trong thời gian sớm nhất.
            </p>
          </div>
          <div className="w-full h-px bg-slate-700/50" />
          <div className="space-y-1.5 text-[11px] text-slate-400 font-semibold">
            <p>Hotline hỗ trợ: <span className="text-white">{contactInfo.phone}</span></p>
            <p>Email: <span className="text-white">{contactInfo.email}</span></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <WebsiteSettingsProvider>
      <div className="min-h-screen flex flex-col justify-between">
        <div className="w-full flex-1 flex flex-col">
          <Header />
          {children}
        </div>
        <Footer />
      </div>
    </WebsiteSettingsProvider>
  );
}
