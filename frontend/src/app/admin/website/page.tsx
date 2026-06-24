"use client";

import React, { useState } from "react";
import {
  Globe,
  FileText,
  MagnifyingGlass,
  FloppyDisk,
  CheckCircle
} from "@phosphor-icons/react";

import GeneralTab from "./components/GeneralTab";
import ContentTab from "./components/ContentTab";
import SeoTab from "./components/SeoTab";

import { useWebsiteSettings } from "./hooks/useWebsiteSettings";

export default function WebsiteSettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "content" | "seo">("general");

  const {
    config,
    setConfig,
    categories,
    setCategories,
    isSaving,
    toastMessage,
    showToast,
    handleSave
  } = useWebsiteSettings();

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
              isWebsiteOnline={config.online}
              setIsWebsiteOnline={(v) => setConfig(prev => ({ ...prev, online: v }))}
              supportEmail={config.email}
              setSupportEmail={(v) => setConfig(prev => ({ ...prev, email: v }))}
              hotline={config.phone}
              setHotline={(v) => setConfig(prev => ({ ...prev, phone: v }))}
              officeAddress={config.address}
              setOfficeAddress={(v) => setConfig(prev => ({ ...prev, address: v }))}
              facebookUrl={config.facebook}
              setFacebookUrl={(v) => setConfig(prev => ({ ...prev, facebook: v }))}
              linkedinUrl={config.linkedin}
              setLinkedinUrl={(v) => setConfig(prev => ({ ...prev, linkedin: v }))}
              zaloOaId={config.zalo}
              setZaloOaId={(v) => setConfig(prev => ({ ...prev, zalo: v }))}
              logo={config.logo}
              setLogo={(v) => setConfig(prev => ({ ...prev, logo: v }))}
              heroBanner={config.heroBanner}
              setHeroBanner={(v) => setConfig(prev => ({ ...prev, heroBanner: v }))}
            />
          )}

          {activeTab === "content" && (
            <ContentTab
              categories={categories}
              setCategories={setCategories}
              heroSlides={config.heroSlides as any}
              setHeroSlides={(v) => setConfig(prev => ({ ...prev, heroSlides: typeof v === "function" ? v(prev.heroSlides as any) : v }))}
              bannerTopImage={config.bannerTopImage}
              setBannerTopImage={(v) => setConfig(prev => ({ ...prev, bannerTopImage: v }))}
              bannerTopAlt={config.bannerTopAlt}
              bannerTopPosition={config.bannerTopPosition}
              setBannerTopPosition={(v) => setConfig(prev => ({ ...prev, bannerTopPosition: v }))}
              bannerBottomImage={config.bannerBottomImage}
              setBannerBottomImage={(v) => setConfig(prev => ({ ...prev, bannerBottomImage: v }))}
              bannerBottomAlt={config.bannerBottomAlt}
              bannerBottomPosition={config.bannerBottomPosition}
              setBannerBottomPosition={(v) => setConfig(prev => ({ ...prev, bannerBottomPosition: v }))}
              onSave={handleSave}
            />
          )}

          {activeTab === "seo" && (
            <SeoTab
              metaTitle={config.metaTitle}
              setMetaTitle={(v) => setConfig(prev => ({ ...prev, metaTitle: v }))}
              metaKeywords={config.metaKeywords}
              setMetaKeywords={(v) => setConfig(prev => ({ ...prev, metaKeywords: v }))}
              metaDescription={config.metaDescription}
              setMetaDescription={(v) => setConfig(prev => ({ ...prev, metaDescription: v }))}
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
