"use client";

import React, { useRef } from "react";
import { 
  UploadSimple, 
  FacebookLogo, 
  LinkedinLogo, 
  Chat, 
  Image as ImageIcon,
  Trash
} from "@phosphor-icons/react";

interface GeneralTabProps {
  isWebsiteOnline: boolean;
  setIsWebsiteOnline: (val: boolean) => void;
  supportEmail: string;
  setSupportEmail: (val: string) => void;
  hotline: string;
  setHotline: (val: string) => void;
  officeAddress: string;
  setOfficeAddress: (val: string) => void;
  facebookUrl: string;
  setFacebookUrl: (val: string) => void;
  linkedinUrl: string;
  setLinkedinUrl: (val: string) => void;
  zaloOaId: string;
  setZaloOaId: (val: string) => void;
  logo: string;
  setLogo: (val: string) => void;
  heroBanner: string;
  setHeroBanner: (val: string) => void;
}

export default function GeneralTab({
  isWebsiteOnline,
  setIsWebsiteOnline,
  supportEmail,
  setSupportEmail,
  hotline,
  setHotline,
  officeAddress,
  setOfficeAddress,
  facebookUrl,
  setFacebookUrl,
  linkedinUrl,
  setLinkedinUrl,
  zaloOaId,
  setZaloOaId,
  logo,
  setLogo,
  heroBanner,
  setHeroBanner
}: GeneralTabProps) {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File, allowedTypes: string[], callback: (base64: string) => void) => {
    if (!allowedTypes.includes(file.type)) {
      alert("Định dạng file không hợp lệ! Vui lòng chọn định dạng được hỗ trợ.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Kích thước file vượt quá 2MB! Vui lòng chọn file dung lượng nhỏ hơn.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        callback(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file, ["image/png", "image/svg+xml", "image/jpeg"], setLogo);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file, ["image/jpeg", "image/png", "image/webp"], setHeroBanner);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Online status switch */}
      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 flex justify-between items-center select-none">
        <div>
          <span className="font-bold text-slate-800 text-xs block">Trạng thái Website</span>
          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Bật hoặc tắt khả năng truy cập trang web công khai.</span>
        </div>
        <button
          type="button"
          onClick={() => setIsWebsiteOnline(!isWebsiteOnline)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
            isWebsiteOnline ? "bg-[#2563eb]" : "bg-slate-200"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isWebsiteOnline ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Contact Info Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <h3 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider block border-b border-slate-100 pb-2.5 select-none">
          Thông tin liên hệ
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-slate-700">Email hỗ trợ</label>
            <input
              type="email"
              required
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-slate-700">Hotline</label>
            <input
              type="text"
              required
              value={hotline}
              onChange={(e) => setHotline(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="font-bold text-slate-700">Địa chỉ văn phòng</label>
            <input
              type="text"
              required
              value={officeAddress}
              onChange={(e) => setOfficeAddress(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
            />
          </div>
        </div>
      </div>

      {/* Logo & Banner Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <h3 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider block border-b border-slate-100 pb-2.5 select-none">
          Logo & Banner
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none">
          {/* Logo block */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700">Logo chính (200×50px)</label>
            <input 
              type="file" 
              ref={logoInputRef}
              onChange={handleLogoChange}
              accept="image/png, image/svg+xml, image/jpeg"
              className="hidden"
            />
            {logo ? (
              <div className="relative border-2 border-slate-200 bg-slate-50/50 rounded-xl p-4 flex items-center justify-between h-[100px] group shadow-3xs">
                <div className="flex-1 flex justify-center items-center h-full">
                  <img src={logo} alt="Logo preview" className="max-h-[60px] max-w-[200px] object-contain" />
                </div>
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="p-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:text-[#2563eb] shadow-3xs cursor-pointer"
                    title="Thay đổi"
                  >
                    <UploadSimple size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogo("")}
                    className="p-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:text-red-500 shadow-3xs cursor-pointer"
                    title="Xóa"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => logoInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-[#2563eb] bg-slate-50/50 hover:bg-blue-50/10 transition-colors rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer group h-[100px]"
              >
                <UploadSimple size={24} className="text-slate-400 group-hover:text-[#2563eb] transition-colors" />
                <span className="font-bold text-slate-700 text-xs">Tải lên Logo</span>
                <span className="text-[10px] text-slate-400 font-semibold">PNG, SVG, JPG tối đa 2MB</span>
              </div>
            )}
          </div>

          {/* Banner block */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700">Hero Banner (1920×600px)</label>
            <input 
              type="file" 
              ref={bannerInputRef}
              onChange={handleBannerChange}
              accept="image/jpeg, image/png, image/webp"
              className="hidden"
            />
            <div className="relative border border-slate-200 rounded-xl overflow-hidden h-[100px] flex items-center justify-center group shadow-3xs">
              <img 
                src={heroBanner || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80"} 
                alt="Warehouse banner" 
                className="absolute inset-0 w-full h-full object-cover brightness-[0.4] group-hover:scale-105 transition-transform duration-300"
              />
              <div className="relative z-10 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  className="flex items-center justify-center gap-1.5 text-white bg-slate-900/50 hover:bg-slate-900/75 border border-white/20 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer select-none"
                >
                  <ImageIcon size={14} />
                  Thay đổi Banner
                </button>
                {heroBanner && (
                  <button
                    type="button"
                    onClick={() => setHeroBanner("")}
                    className="flex items-center justify-center gap-1.5 text-white bg-red-600/60 hover:bg-red-600/80 border border-white/20 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer select-none"
                  >
                    <Trash size={14} />
                    Xóa custom banner
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <h3 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider block border-b border-slate-100 pb-2.5 select-none">
          Social Media
        </h3>

        <div className="space-y-3">
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-slate-700">Facebook URL</label>
            <div className="flex rounded-lg overflow-hidden border border-slate-200 focus-within:border-[#2563eb] transition-colors bg-slate-50 select-none">
              <span className="px-3 bg-slate-100 border-r border-slate-200 text-slate-500 flex items-center">
                <FacebookLogo size={16} />
              </span>
              <input
                type="url"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/yourpage"
                className="w-full bg-white border-none py-2 px-3 text-slate-800 font-semibold focus:outline-none text-xs"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-slate-700">LinkedIn URL</label>
            <div className="flex rounded-lg overflow-hidden border border-slate-200 focus-within:border-[#2563eb] transition-colors bg-slate-50 select-none">
              <span className="px-3 bg-slate-100 border-r border-slate-200 text-slate-500 flex items-center">
                <LinkedinLogo size={16} />
              </span>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/company/yourcompany"
                className="w-full bg-white border-none py-2 px-3 text-slate-800 font-semibold focus:outline-none text-xs"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-slate-700">Zalo OA ID</label>
            <div className="flex rounded-lg overflow-hidden border border-slate-200 focus-within:border-[#2563eb] transition-colors bg-slate-50 select-none">
              <span className="px-3 bg-slate-100 border-r border-slate-200 text-slate-500 flex items-center">
                <Chat size={16} />
              </span>
              <input
                type="text"
                value={zaloOaId}
                onChange={(e) => setZaloOaId(e.target.value)}
                placeholder="Mã ID OA Zalo hoặc Số điện thoại"
                className="w-full bg-white border-none py-2 px-3 text-slate-800 font-semibold focus:outline-none text-xs"
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
