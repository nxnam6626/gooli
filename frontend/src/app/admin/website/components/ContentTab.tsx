"use client";

import React from "react";
import { Plus, ArrowUp, ArrowDown, Trash, UploadSimple, Image as ImageIcon } from "@phosphor-icons/react";

interface HeroSlide {
  id: number;
  image: string;
  title: string;
  alt: string;
}

interface ContentTabProps {
  heroTitle: string;
  setHeroTitle: (val: string) => void;
  heroSubtitle: string;
  setHeroSubtitle: (val: string) => void;
  aboutUsText: string;
  setAboutUsText: (val: string) => void;
  heroSlides: HeroSlide[];
  setHeroSlides: React.Dispatch<React.SetStateAction<HeroSlide[]>>;
  bannerTopImage: string;
  setBannerTopImage: (val: string) => void;
  bannerTopAlt: string;
  setBannerTopAlt: (val: string) => void;
  bannerBottomImage: string;
  setBannerBottomImage: (val: string) => void;
  bannerBottomAlt: string;
  setBannerBottomAlt: (val: string) => void;
}

export default function ContentTab({
  heroTitle,
  setHeroTitle,
  heroSubtitle,
  setHeroSubtitle,
  aboutUsText,
  setAboutUsText,
  heroSlides,
  setHeroSlides,
  bannerTopImage,
  setBannerTopImage,
  bannerTopAlt,
  setBannerTopAlt,
  bannerBottomImage,
  setBannerBottomImage,
  bannerBottomAlt,
  setBannerBottomAlt
}: ContentTabProps) {
  
  // Image upload helper converting to Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Kích thước file ảnh quá lớn (vui lòng chọn file dưới 2MB) để tránh vượt quá dung lượng lưu trữ.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        callback(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      <div className="border-b border-slate-100 pb-3 select-none">
        <h3 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider block">Quản lý nội dung trang chủ</h3>
        <p className="text-slate-400 mt-0.5 text-[10px]">Tùy biến các khối tiêu đề, bài viết giới thiệu ở trang chủ public.</p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-slate-700">Tiêu đề chính Hero Section (H1)</label>
          <input
            type="text"
            required
            value={heroTitle}
            onChange={(e) => setHeroTitle(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-slate-700">Mô tả ngắn Hero Section (Subtitle)</label>
          <textarea
            required
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all h-20 leading-relaxed"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-slate-700">Nội dung khối &quot;Về chúng tôi&quot; (About Us)</label>
          <textarea
            required
            value={aboutUsText}
            onChange={(e) => setAboutUsText(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all h-24 leading-relaxed"
          />
        </div>

        {/* Cấu hình Hero Slideshow (Slider bên trái) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 mt-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2.5 select-none">
            <div>
              <h3 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider block">
                Cấu hình Slideshow (Hero Slider)
              </h3>
              <p className="text-slate-400 mt-0.5 text-[10px]">
                Quản lý các slide chạy tự động ở bên trái phần Hero của trang chủ.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const newId = heroSlides.length > 0 ? Math.max(...heroSlides.map(s => s.id)) + 1 : 1;
                setHeroSlides([
                  ...heroSlides,
                  { id: newId, image: "/hero_ceiling.png", title: "Slide mới", alt: "Ảnh slide mới" }
                ]);
              }}
              className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-850 font-bold rounded-lg text-[10px] cursor-pointer outline-none border-none select-none flex items-center gap-1"
            >
              <Plus size={12} />
              Thêm slide mới
            </button>
          </div>

          {heroSlides.length === 0 ? (
            <div className="text-[10px] text-slate-400 font-semibold text-center py-6 select-none bg-slate-50 rounded-xl border border-dashed border-slate-200">
              Chưa có slide nào. Vui lòng bấm &quot;Thêm slide mới&quot;.
            </div>
          ) : (
            <div className="space-y-4">
              {heroSlides.map((slide, idx) => (
                <div key={slide.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/20 space-y-3 shadow-2xs relative">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                        {idx + 1}
                      </span>
                      <span>{slide.title || "Slide chưa đặt tên"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Reordering */}
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          if (idx === 0) return;
                          const newSlides = [...heroSlides];
                          const temp = newSlides[idx];
                          newSlides[idx] = newSlides[idx - 1];
                          newSlides[idx - 1] = temp;
                          setHeroSlides(newSlides);
                        }}
                        className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-3xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Di chuyển lên"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === heroSlides.length - 1}
                        onClick={() => {
                          if (idx === heroSlides.length - 1) return;
                          const newSlides = [...heroSlides];
                          const temp = newSlides[idx];
                          newSlides[idx] = newSlides[idx + 1];
                          newSlides[idx + 1] = temp;
                          setHeroSlides(newSlides);
                        }}
                        className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-3xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Di chuyển xuống"
                      >
                        <ArrowDown size={12} />
                      </button>
                      
                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Xác nhận xóa slide "${slide.title || 'này'}"?`)) {
                            setHeroSlides(heroSlides.filter((s) => s.id !== slide.id));
                          }
                        }}
                        className="text-red-500 hover:text-red-700 font-bold text-[10px] bg-transparent border-none cursor-pointer outline-none flex items-center gap-0.5 ml-2"
                      >
                        <Trash size={12} />
                        Xóa slide
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-600 text-[10px]">Tiêu đề slide</label>
                      <input
                        type="text"
                        required
                        value={slide.title}
                        onChange={(e) => {
                          const newSlides = [...heroSlides];
                          newSlides[idx] = { ...newSlides[idx], title: e.target.value };
                          setHeroSlides(newSlides);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-600 text-[10px]">Đường dẫn ảnh (URL hoặc /path)</label>
                      <div className="flex gap-2 items-center">
                        {slide.image && (
                          <img src={slide.image} className="w-10 h-10 object-cover rounded-lg border border-slate-200" alt="Preview" />
                        )}
                        <input
                          type="text"
                          required
                          value={slide.image}
                          onChange={(e) => {
                            const newSlides = [...heroSlides];
                            newSlides[idx] = { ...newSlides[idx], image: e.target.value };
                            setHeroSlides(newSlides);
                          }}
                          className="flex-1 bg-white border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
                        />
                        <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg font-bold text-[10px] cursor-pointer text-slate-700 flex items-center gap-1 select-none">
                          <UploadSimple size={14} />
                          Tải lên
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, (base64) => {
                              const newSlides = [...heroSlides];
                              newSlides[idx] = { ...newSlides[idx], image: base64 };
                              setHeroSlides(newSlides);
                            })}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-600 text-[10px]">Mô tả ảnh (Alt text)</label>
                      <input
                        type="text"
                        required
                        value={slide.alt}
                        onChange={(e) => {
                          const newSlides = [...heroSlides];
                          newSlides[idx] = { ...newSlides[idx], alt: e.target.value };
                          setHeroSlides(newSlides);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cấu hình Banners bên phải */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 mt-6">
          <div className="border-b border-slate-100 pb-2.5 select-none">
            <h3 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider block">
              Cấu hình Banners (2 ô bên phải)
            </h3>
            <p className="text-slate-400 mt-0.5 text-[10px]">
              Tùy chỉnh ảnh và mô tả cho Banner trên và Banner dưới ở góc bên phải phần Hero.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Banner Trên */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/20 space-y-3">
              <div className="font-bold text-slate-800 text-[10px] uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5 select-none">
                <ImageIcon size={14} className="text-slate-500" />
                <span>Banner phía trên</span>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-600 text-[10px]">Đường dẫn ảnh</label>
                <div className="flex gap-2 items-center">
                  {bannerTopImage && (
                    <img src={bannerTopImage} className="w-10 h-10 object-cover rounded-lg border border-slate-200" alt="Preview" />
                  )}
                  <input
                    type="text"
                    required
                    value={bannerTopImage}
                    onChange={(e) => setBannerTopImage(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
                  />
                  <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg font-bold text-[10px] cursor-pointer text-slate-700 flex items-center gap-1 select-none">
                    <UploadSimple size={14} />
                    Tải lên
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, (base64) => setBannerTopImage(base64))}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-600 text-[10px]">Mô tả ảnh (Alt text)</label>
                <input
                  type="text"
                  required
                  value={bannerTopAlt}
                  onChange={(e) => setBannerTopAlt(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
                />
              </div>
            </div>

            {/* Banner Dưới */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/20 space-y-3">
              <div className="font-bold text-slate-800 text-[10px] uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5 select-none">
                <ImageIcon size={14} className="text-slate-500" />
                <span>Banner phía dưới</span>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-600 text-[10px]">Đường dẫn ảnh</label>
                <div className="flex gap-2 items-center">
                  {bannerBottomImage && (
                    <img src={bannerBottomImage} className="w-10 h-10 object-cover rounded-lg border border-slate-200" alt="Preview" />
                  )}
                  <input
                    type="text"
                    required
                    value={bannerBottomImage}
                    onChange={(e) => setBannerBottomImage(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
                  />
                  <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg font-bold text-[10px] cursor-pointer text-slate-700 flex items-center gap-1 select-none">
                    <UploadSimple size={14} />
                    Tải lên
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, (base64) => setBannerBottomImage(base64))}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-600 text-[10px]">Mô tả ảnh (Alt text)</label>
                <input
                  type="text"
                  required
                  value={bannerBottomAlt}
                  onChange={(e) => setBannerBottomAlt(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
