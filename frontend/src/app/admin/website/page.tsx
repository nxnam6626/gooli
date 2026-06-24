"use client";

import React, { useState, useEffect } from "react";
import { CONTACT_INFO } from "@/constants/contact";
import {
  Globe,
  FileText,
  MagnifyingGlass,
  FloppyDisk,
  CheckCircle
} from "@phosphor-icons/react";
import { getSystemSettings, updateSystemSettings, getPublicCategories, savePublicCategories } from "@/services/api";

import GeneralTab from "./components/GeneralTab";

import ContentTab from "./components/ContentTab";
import SeoTab from "./components/SeoTab";

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

export default function WebsiteSettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "content" | "seo">("general");

  const [categories, setCategories] = useState<{
    label: string;
    href: string;
    icon: string;
    subMenu?: { label: string; href: string; }[];
  }[]>([]);

  // Form states - General Config
  const [isWebsiteOnline, setIsWebsiteOnline] = useState(true);
  const [supportEmail, setSupportEmail] = useState(CONTACT_INFO.email);
  const [hotline, setHotline] = useState(CONTACT_INFO.hotline);
  const [officeAddress, setOfficeAddress] = useState(CONTACT_INFO.address);
  const [facebookUrl, setFacebookUrl] = useState(CONTACT_INFO.facebook);
  const [linkedinUrl, setLinkedinUrl] = useState(CONTACT_INFO.linkedin);
  const [zaloOaId, setZaloOaId] = useState(CONTACT_INFO.zalo);
  const [logo, setLogo] = useState("");
  const [heroBanner, setHeroBanner] = useState("");

  // Form states - Content Management

  // Form states - Hero Slides & Banners
  const [heroSlides, setHeroSlides] = useState<{ id: number; image: string; title: string; alt: string; objectPosition?: string; }[]>([]);
  const [bannerTopImage, setBannerTopImage] = useState("");
  const [bannerTopAlt, setBannerTopAlt] = useState("");
  const [bannerTopPosition, setBannerTopPosition] = useState("50% 50%");
  const [bannerBottomImage, setBannerBottomImage] = useState("");
  const [bannerBottomAlt, setBannerBottomAlt] = useState("");
  const [bannerBottomPosition, setBannerBottomPosition] = useState("50% 50%");

  // Form states - SEO & Meta
  const [metaTitle, setMetaTitle] = useState("Gooli WMS - Hệ thống Quản lý Kho thông minh");
  const [metaKeywords, setMetaKeywords] = useState("quản lý kho, wms, tồn kho, phần mềm kho, sổ quỹ, logistics");
  const [metaDescription, setMetaDescription] = useState("Giải pháp tối ưu hóa vận hành kho bãi, theo dõi hàng xuất nhập, cảnh báo tồn kho và đối soát công nợ chuyên sâu.");

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load configuration and categories from APIs, with localStorage as fallback
  useEffect(() => {
    const loadData = async () => {
      try {
        const [config, dbCategories] = await Promise.all([
          getSystemSettings(),
          getPublicCategories()
        ]);

        if (config && Object.keys(config).length > 0) {
          if (config.online !== undefined) setIsWebsiteOnline(config.online);
          if (config.email) setSupportEmail(config.email);
          if (config.phone) setHotline(config.phone);
          if (config.address) setOfficeAddress(config.address);
          if (config.facebook) setFacebookUrl(config.facebook);
          if (config.linkedin) setLinkedinUrl(config.linkedin);
          if (config.zalo) setZaloOaId(config.zalo);
          if (config.logo) setLogo(config.logo);
          else setLogo("");
          if (config.heroBanner) setHeroBanner(config.heroBanner);
          else setHeroBanner("");



          if (config.metaTitle) setMetaTitle(config.metaTitle);
          if (config.metaKeywords) setMetaKeywords(config.metaKeywords);
          if (config.metaDescription) setMetaDescription(config.metaDescription);

          if (config.heroSlides) setHeroSlides(config.heroSlides);
          else setHeroSlides(DEFAULT_SLIDES);

          setBannerTopImage(config.bannerTopImage || DEFAULT_BANNER_TOP.image);
          setBannerTopAlt(config.bannerTopAlt || DEFAULT_BANNER_TOP.alt);
          setBannerTopPosition(config.bannerTopPosition || "50% 50%");
          setBannerBottomImage(config.bannerBottomImage || DEFAULT_BANNER_BOTTOM.image);
          setBannerBottomAlt(config.bannerBottomAlt || DEFAULT_BANNER_BOTTOM.alt);
          setBannerBottomPosition(config.bannerBottomPosition || "50% 50%");
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
          const config = JSON.parse(saved);
          if (config.online !== undefined) setIsWebsiteOnline(config.online);
          if (config.email) setSupportEmail(config.email);
          if (config.phone) setHotline(config.phone);
          if (config.address) setOfficeAddress(config.address);
          if (config.facebook) setFacebookUrl(config.facebook);
          if (config.linkedin) setLinkedinUrl(config.linkedin);
          if (config.zalo) setZaloOaId(config.zalo);
          if (config.logo) setLogo(config.logo);
          else setLogo("");
          if (config.heroBanner) setHeroBanner(config.heroBanner);
          else setHeroBanner("");



          if (config.metaTitle) setMetaTitle(config.metaTitle);
          if (config.metaKeywords) setMetaKeywords(config.metaKeywords);
          if (config.metaDescription) setMetaDescription(config.metaDescription);

          if (config.heroSlides) setHeroSlides(config.heroSlides);
          else setHeroSlides(DEFAULT_SLIDES);

          setBannerTopImage(config.bannerTopImage || DEFAULT_BANNER_TOP.image);
          setBannerTopAlt(config.bannerTopAlt || DEFAULT_BANNER_TOP.alt);
          setBannerTopPosition(config.bannerTopPosition || "50% 50%");
          setBannerBottomImage(config.bannerBottomImage || DEFAULT_BANNER_BOTTOM.image);
          setBannerBottomAlt(config.bannerBottomAlt || DEFAULT_BANNER_BOTTOM.alt);
          setBannerBottomPosition(config.bannerBottomPosition || "50% 50%");
        } catch (err) {
          console.error("Failed to parse website settings:", err);
          setLogo("");
          setHeroBanner("");
          setHeroSlides(DEFAULT_SLIDES);
          setBannerTopImage(DEFAULT_BANNER_TOP.image);
          setBannerTopAlt(DEFAULT_BANNER_TOP.alt);
          setBannerTopPosition("50% 50%");
          setBannerBottomImage(DEFAULT_BANNER_BOTTOM.image);
          setBannerBottomAlt(DEFAULT_BANNER_BOTTOM.alt);
          setBannerBottomPosition("50% 50%");
        }
      } else {
        setLogo("");
        setHeroBanner("");
        setHeroSlides(DEFAULT_SLIDES);
        setBannerTopImage(DEFAULT_BANNER_TOP.image);
        setBannerTopAlt(DEFAULT_BANNER_TOP.alt);
        setBannerTopPosition("50% 50%");
        setBannerBottomImage(DEFAULT_BANNER_BOTTOM.image);
        setBannerBottomAlt(DEFAULT_BANNER_BOTTOM.alt);
        setBannerBottomPosition("50% 50%");
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

    const config = {
      online: isWebsiteOnline,
      email: supportEmail,
      phone: hotline,
      address: officeAddress,
      facebook: facebookUrl,
      linkedin: linkedinUrl,
      zalo: zaloOaId,
      logo,
      heroBanner,

      metaTitle,
      metaKeywords,
      metaDescription,
      heroSlides,
      bannerTopImage,
      bannerTopAlt,
      bannerTopPosition,
      bannerBottomImage,
      bannerBottomAlt,
      bannerBottomPosition
    };

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("gooli_token") || "" : "";

      // Deduplicate categories by label (hotfix for double click save bug)
      const uniqueCats = [];
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

  return (
    <div className="space-y-6 font-sans text-xs pb-10">
      {/* Header */}
      <div className="flex justify-between items-center pb-1 border-b border-slate-200 select-none">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Quản lý Website Public
          </h1>
          <p className="text-slate-500 mt-1 text-[11px]">
            Cấu hình giao diện và thông tin hiển thị cho trang web công khai của doanh nghiệp.
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border border-slate-200 bg-white p-1 rounded-xl shadow-2xs select-none">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`flex-1 py-2.5 text-center font-bold text-xs transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer outline-none border-none ${activeTab === "general" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
            }`}
        >
          <Globe size={16} />
          Cấu hình chung
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("content")}
          className={`flex-1 py-2.5 text-center font-bold text-xs transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer outline-none border-none ${activeTab === "content" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
            }`}
        >
          <FileText size={16} />
          Quản lý Nội dung
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("seo")}
          className={`flex-1 py-2.5 text-center font-bold text-xs transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer outline-none border-none ${activeTab === "seo" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
            }`}
        >
          <MagnifyingGlass size={16} />
          SEO & Meta
        </button>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <form onSubmit={handleSave} className="p-6">

          {activeTab === "general" && (
            <GeneralTab
              isWebsiteOnline={isWebsiteOnline}
              setIsWebsiteOnline={setIsWebsiteOnline}
              supportEmail={supportEmail}
              setSupportEmail={setSupportEmail}
              hotline={hotline}
              setHotline={setHotline}
              officeAddress={officeAddress}
              setOfficeAddress={setOfficeAddress}
              facebookUrl={facebookUrl}
              setFacebookUrl={setFacebookUrl}
              linkedinUrl={linkedinUrl}
              setLinkedinUrl={setLinkedinUrl}
              zaloOaId={zaloOaId}
              setZaloOaId={setZaloOaId}
              logo={logo}
              setLogo={setLogo}
              heroBanner={heroBanner}
              setHeroBanner={setHeroBanner}
            />
          )}



          {activeTab === "content" && (
            <ContentTab
              categories={categories}
              setCategories={setCategories}
              heroSlides={heroSlides}
              setHeroSlides={setHeroSlides}
              bannerTopImage={bannerTopImage}
              setBannerTopImage={setBannerTopImage}
              bannerTopAlt={bannerTopAlt}
              bannerTopPosition={bannerTopPosition}
              setBannerTopPosition={setBannerTopPosition}
              bannerBottomImage={bannerBottomImage}
              setBannerBottomImage={setBannerBottomImage}
              bannerBottomAlt={bannerBottomAlt}
              bannerBottomPosition={bannerBottomPosition}
              setBannerBottomPosition={setBannerBottomPosition}
              onSave={() => handleSave()}
            />
          )}

          {activeTab === "seo" && (
            <SeoTab
              metaTitle={metaTitle}
              setMetaTitle={setMetaTitle}
              metaKeywords={metaKeywords}
              setMetaKeywords={setMetaKeywords}
              metaDescription={metaDescription}
              setMetaDescription={setMetaDescription}
            />
          )}

          {/* Footer Save / Cancel Buttons */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3 select-none">
            <button
              type="button"
              onClick={() => {
                if (confirm("Xác nhận hủy bỏ mọi chỉnh sửa chưa lưu?")) {
                  window.location.reload();
                }
              }}
              className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl font-bold cursor-pointer text-xs transition-colors shadow-3xs"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors border-none outline-none"
            >
              <FloppyDisk size={16} />
              Lưu cấu hình
            </button>
          </div>
        </form>
      </div>

      {/* Premium Toast Success Notification */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl shadow-lg transition-all duration-300 animate-slide-in select-none">
          <CheckCircle size={18} className="text-emerald-500" />
          <span className="font-bold text-xs">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
