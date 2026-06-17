"use client";

import React, { useState, useEffect } from "react";
import { 
  Globe, 
  FileText, 
  MagnifyingGlass, 
  UploadSimple, 
  Link as LinkIcon, 
  FacebookLogo, 
  LinkedinLogo, 
  Chat, 
  FloppyDisk, 
  CheckCircle,
  Image as ImageIcon,
  Plus,
  Trash,
  ArrowUp,
  ArrowDown
} from "@phosphor-icons/react";

const DEFAULT_CATEGORIES = [
  {
    label: "Lam gỗ nhựa trong nhà",
    href: "/san-pham/lam-trong-nha",
    icon: "House",
    subMenu: [
      { label: "Lam sóng PS", href: "/san-pham/lam-trong-nha/song-ps" },
      { label: "Lam sóng bán nguyệt", href: "/san-pham/lam-trong-nha/song-ban-nguyet" },
      { label: "Lam sóng tròn", href: "/san-pham/lam-trong-nha/song-tron" },
      { label: "Lam hộp trong nhà", href: "/san-pham/lam-trong-nha/hop" },
      { label: "Lam 3 sóng thấp", href: "/san-pham/lam-trong-nha/3-song-thap" },
      { label: "Lam 4 sóng thấp", href: "/san-pham/lam-trong-nha/4-song-thap" },
      { label: "Lam 5 sóng thấp", href: "/san-pham/lam-trong-nha/5-song-thap" }
    ]
  },
  {
    label: "Lam gỗ nhựa ngoài trời",
    href: "/san-pham/lam-ngoai-troi",
    icon: "Tree",
    subMenu: [
      { label: "Tấm ốp ngoài trời", href: "/san-pham/lam-ngoai-troi/tam-op" },
      { label: "Lam sóng ngoài trời", href: "/san-pham/lam-ngoai-troi/song" },
      { label: "Lam hộp ngoài trời", href: "/san-pham/lam-ngoai-troi/hop" },
      { label: "Thanh đa năng", href: "/san-pham/lam-ngoai-troi/thanh-da-nang" },
      { label: "Sàn nhựa ngoài trời", href: "/san-pham/lam-ngoai-troi/san-nhua" }
    ]
  },
  {
    label: "Tấm nano nhựa",
    href: "/san-pham/tam-nano",
    icon: "Cube",
    subMenu: [
      { label: "Tấm ốp Nano phẳng", href: "/san-pham/tam-nano/phang" },
      { label: "Tấm ốp Nano vân gỗ", href: "/san-pham/tam-nano/van-go" },
      { label: "Tấm ốp Nano vân đá", href: "/san-pham/tam-nano/van-da" }
    ]
  },
  { 
    label: "Vách ngăn 2 mặt", 
    href: "/san-pham/vach-ngan", 
    icon: "Columns",
    subMenu: [
      { label: "Vách ngăn kích thước 3.5m", href: "/san-pham/vach-ngan/3.5m" },
      { label: "Vách ngăn kích thước 3.0m", href: "/san-pham/vach-ngan/3.0m" },
      { label: "Vách ngăn kích thước 2.9m", href: "/san-pham/vach-ngan/2.9m" }
    ]
  },
  { label: "La phông nhựa", href: "/san-pham/la-phong", icon: "Stack", subMenu: [] },
  { label: "Sàn gỗ nhựa", href: "/san-pham/san-go", icon: "Rows", subMenu: [] },
  { label: "Phào chỉ trang trí", href: "/san-pham/phao-chi", icon: "Ruler", subMenu: [] },
  { label: "Khung trần", href: "/san-pham/khung-tran", icon: "GridFour", subMenu: [] },
  { label: "Lam sóng ốp tường", href: "/san-pham/lam-song-op-tuong", icon: "Stack", subMenu: [] },
  { label: "Tấm PVC vân đá", href: "/san-pham/pvc-van-da", icon: "Cube", subMenu: [] },
  { label: "Phụ kiện thi công", href: "/san-pham/phu-kien", icon: "Wrench", subMenu: [] }
];

const DEFAULT_SLIDES = [
  {
    id: 1,
    image: "/hero_ceiling.png",
    title: "Thi công trần gỗ nhựa cao cấp",
    alt: "Trần gỗ nhựa ngoài trời thực tế"
  },
  {
    id: 2,
    image: "/projects/project_caro_sunshade.png",
    title: "Hệ lam chắn nắng gỗ nhựa ngoài trời",
    alt: "Hệ lam chắn nắng"
  },
  {
    id: 3,
    image: "/projects/project_g100_wood_tn.png",
    title: "Ốp tường gỗ nhựa composite hiện đại",
    alt: "Ốp tường composite"
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
  const [activeTab, setActiveTab] = useState<"general" | "content" | "seo" | "categories">("general");
  
  const [categories, setCategories] = useState<{
    label: string;
    href: string;
    icon: string;
    subMenu?: { label: string; href: string; }[];
  }[]>([]);

  // Form states - General Config
  const [isWebsiteOnline, setIsWebsiteOnline] = useState(true);
  const [supportEmail, setSupportEmail] = useState("contact@gooli-wms.com");
  const [hotline, setHotline] = useState("1900 1234");
  const [officeAddress, setOfficeAddress] = useState("123 Logistic Way, Ho Chi Minh City");
  const [facebookUrl, setFacebookUrl] = useState("https://facebook.com/gooli-wms");
  const [linkedinUrl, setLinkedinUrl] = useState("https://linkedin.com/company/gooli-wms");
  const [zaloOaId, setZaloOaId] = useState("0934119376");

  // Form states - Content Management
  const [heroTitle, setHeroTitle] = useState("Giải pháp quản lý kho chuyên nghiệp Gooli WMS");
  const [heroSubtitle, setHeroSubtitle] = useState("Số hóa quy trình vận hành kho, kiểm soát tồn kho thực tế chính xác 100%, nâng cao năng suất xếp dỡ.");
  const [aboutUsText, setAboutUsText] = useState("Gooli WMS được thành lập năm 2026 với mục tiêu cung cấp giải pháp quản trị chuỗi cung ứng tối ưu cho các doanh nghiệp vừa và nhỏ.");

  // Form states - Hero Slider & Banners
  const [heroSlides, setHeroSlides] = useState<{ id: number; image: string; title: string; alt: string; }[]>([]);
  const [bannerTopImage, setBannerTopImage] = useState("");
  const [bannerTopAlt, setBannerTopAlt] = useState("");
  const [bannerBottomImage, setBannerBottomImage] = useState("");
  const [bannerBottomAlt, setBannerBottomAlt] = useState("");

  // Form states - SEO & Meta
  const [metaTitle, setMetaTitle] = useState("Gooli WMS - Hệ thống Quản lý Kho thông minh");
  const [metaKeywords, setMetaKeywords] = useState("quản lý kho, wms, tồn kho, phần mềm kho, sổ quỹ, logistics");
  const [metaDescription, setMetaDescription] = useState("Giải pháp tối ưu hóa vận hành kho bãi, theo dõi hàng xuất nhập, cảnh báo tồn kho và đối soát công nợ chuyên sâu.");

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Load configuration from localStorage on mount
  useEffect(() => {
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
        
        if (config.heroTitle) setHeroTitle(config.heroTitle);
        if (config.heroSubtitle) setHeroSubtitle(config.heroSubtitle);
        if (config.aboutUsText) setAboutUsText(config.aboutUsText);
        
        if (config.metaTitle) setMetaTitle(config.metaTitle);
        if (config.metaKeywords) setMetaKeywords(config.metaKeywords);
        if (config.metaDescription) setMetaDescription(config.metaDescription);

        // Slider and Banners
        if (config.heroSlides) setHeroSlides(config.heroSlides);
        else setHeroSlides(DEFAULT_SLIDES);
        setBannerTopImage(config.bannerTopImage || DEFAULT_BANNER_TOP.image);
        setBannerTopAlt(config.bannerTopAlt || DEFAULT_BANNER_TOP.alt);
        setBannerBottomImage(config.bannerBottomImage || DEFAULT_BANNER_BOTTOM.image);
        setBannerBottomAlt(config.bannerBottomAlt || DEFAULT_BANNER_BOTTOM.alt);
      } catch (err) {
        console.error("Failed to load website settings:", err);
        setHeroSlides(DEFAULT_SLIDES);
        setBannerTopImage(DEFAULT_BANNER_TOP.image);
        setBannerTopAlt(DEFAULT_BANNER_TOP.alt);
        setBannerBottomImage(DEFAULT_BANNER_BOTTOM.image);
        setBannerBottomAlt(DEFAULT_BANNER_BOTTOM.alt);
      }
    } else {
      setHeroSlides(DEFAULT_SLIDES);
      setBannerTopImage(DEFAULT_BANNER_TOP.image);
      setBannerTopAlt(DEFAULT_BANNER_TOP.alt);
      setBannerBottomImage(DEFAULT_BANNER_BOTTOM.image);
      setBannerBottomAlt(DEFAULT_BANNER_BOTTOM.alt);
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
  }, []);

  // Save configuration
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const config = {
      online: isWebsiteOnline,
      email: supportEmail,
      phone: hotline,
      address: officeAddress,
      facebook: facebookUrl,
      linkedin: linkedinUrl,
      zalo: zaloOaId,
      heroTitle,
      heroSubtitle,
      aboutUsText,
      metaTitle,
      metaKeywords,
      metaDescription,
      heroSlides,
      bannerTopImage,
      bannerTopAlt,
      bannerBottomImage,
      bannerBottomAlt
    };
    localStorage.setItem("gooli_public_website_settings", JSON.stringify(config));
    localStorage.setItem("gooli_public_categories_settings", JSON.stringify(categories));
    
    // Display Toast notification
    setToastMessage("Lưu cấu hình giao diện website public thành công!");
    setShowToast(true);
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
          className={`flex-1 py-2.5 text-center font-bold text-xs transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer outline-none border-none ${
            activeTab === "general" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Globe size={16} />
          Cấu hình chung
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("categories")}
          className={`flex-1 py-2.5 text-center font-bold text-xs transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer outline-none border-none ${
            activeTab === "categories" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Globe size={16} />
          Danh mục sản phẩm
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("content")}
          className={`flex-1 py-2.5 text-center font-bold text-xs transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer outline-none border-none ${
            activeTab === "content" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <FileText size={16} />
          Quản lý Nội dung
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("seo")}
          className={`flex-1 py-2.5 text-center font-bold text-xs transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer outline-none border-none ${
            activeTab === "seo" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <MagnifyingGlass size={16} />
          SEO & Meta
        </button>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <form onSubmit={handleSave} className="p-6">
          
          {/* TAB 1: General Config */}
          {activeTab === "general" && (
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
                    <div className="border-2 border-dashed border-slate-200 hover:border-[#2563eb] bg-slate-50/50 hover:bg-blue-50/10 transition-colors rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer group">
                      <UploadSimple size={24} className="text-slate-400 group-hover:text-[#2563eb] transition-colors" />
                      <span className="font-bold text-slate-700 text-xs">Tải lên Logo</span>
                      <span className="text-[10px] text-slate-400 font-semibold">PNG, SVG tối đa 2MB</span>
                    </div>
                  </div>

                  {/* Banner block */}
                  <div className="space-y-2">
                    <label className="font-bold text-slate-700">Hero Banner (1920×600px)</label>
                    <div className="relative border border-slate-200 rounded-xl overflow-hidden h-[100px] flex items-center justify-center group cursor-pointer shadow-3xs">
                      {/* Warehouse stock image */}
                      <img 
                        src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80" 
                        alt="Warehouse banner mockup" 
                        className="absolute inset-0 w-full h-full object-cover brightness-[0.4] group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="relative z-10 flex flex-col items-center justify-center gap-1.5 text-white">
                        <ImageIcon size={20} />
                        <span className="font-bold text-[11px] uppercase tracking-wider">Thay đổi Banner</span>
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
          )}

          {/* TAB 2: Content Management */}
          {activeTab === "content" && (
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
                  <label className="font-bold text-slate-700">Nội dung khối "Về chúng tôi" (About Us)</label>
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
                      Chưa có slide nào. Vui lòng bấm "Thêm slide mới".
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
                              <input
                                type="text"
                                required
                                value={slide.image}
                                onChange={(e) => {
                                  const newSlides = [...heroSlides];
                                  newSlides[idx] = { ...newSlides[idx], image: e.target.value };
                                  setHeroSlides(newSlides);
                                }}
                                className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
                              />
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
                        <input
                          type="text"
                          required
                          value={bannerTopImage}
                          onChange={(e) => setBannerTopImage(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
                        />
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
                        <input
                          type="text"
                          required
                          value={bannerBottomImage}
                          onChange={(e) => setBannerBottomImage(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
                        />
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
          )}

          {/* TAB 3: SEO & Meta */}
          {activeTab === "seo" && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3 select-none">
                <h3 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider block">Cấu hình SEO & Google Meta</h3>
                <p className="text-slate-400 mt-0.5 text-[10px]">Quản lý thẻ Title và Meta description giúp tối ưu hóa công cụ tìm kiếm Google.</p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700">Thẻ Meta Title chính</label>
                  <input
                    type="text"
                    required
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700">Từ khóa Meta Keywords</label>
                  <input
                    type="text"
                    required
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    placeholder="Ngăn cách bằng dấu phẩy"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700">Thẻ Meta Description</label>
                  <textarea
                    required
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all h-24 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Category Management */}
          {activeTab === "categories" && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center select-none">
                <div>
                  <h3 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider block">Quản lý Danh mục Sản phẩm</h3>
                  <p className="text-slate-400 mt-0.5 text-[10px]">Chỉnh sửa tên danh mục, đường dẫn, biểu tượng và các menu con hiển thị ngoài trang chủ.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCategories([
                      ...categories,
                      { label: "Danh mục mới", href: "/san-pham/moi", icon: "Stack", subMenu: [] }
                    ]);
                  }}
                  className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-850 font-bold rounded-lg text-[10px] cursor-pointer outline-none border-none select-none"
                >
                  + Thêm danh mục chính
                </button>
              </div>

              <div className="space-y-4">
                {categories.map((cat, catIdx) => (
                  <div key={catIdx} className="border border-slate-200 rounded-xl p-4 bg-slate-50/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">{catIdx + 1}</span>
                        <span>{cat.label || "Danh mục chưa đặt tên"}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Xác nhận xóa danh mục "${cat.label}"?`)) {
                            setCategories(categories.filter((_, idx) => idx !== catIdx));
                          }
                        }}
                        className="text-red-500 hover:text-red-700 font-bold text-[10px] bg-transparent border-none cursor-pointer outline-none"
                      >
                        Xóa danh mục
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-slate-600 text-[10px]">Tên danh mục</label>
                        <input
                          type="text"
                          required
                          value={cat.label}
                          onChange={(e) => {
                            const newCats = [...categories];
                            newCats[catIdx] = { ...newCats[catIdx], label: e.target.value };
                            setCategories(newCats);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-slate-600 text-[10px]">Đường dẫn (href)</label>
                        <input
                          type="text"
                          required
                          value={cat.href}
                          onChange={(e) => {
                            const newCats = [...categories];
                            newCats[catIdx] = { ...newCats[catIdx], href: e.target.value };
                            setCategories(newCats);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-slate-600 text-[10px]">Biểu tượng (Icon)</label>
                        <select
                          value={cat.icon}
                          onChange={(e) => {
                            const newCats = [...categories];
                            newCats[catIdx] = { ...newCats[catIdx], icon: e.target.value };
                            setCategories(newCats);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-[#1e293b] font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
                        >
                          <option value="House">Ngôi nhà (House)</option>
                          <option value="Tree">Cái cây (Tree)</option>
                          <option value="Cube">Khối lập phương (Cube)</option>
                          <option value="Columns">Cột (Columns)</option>
                          <option value="Stack">Chồng lớp (Stack)</option>
                          <option value="Rows">Hàng (Rows)</option>
                          <option value="Ruler">Thước kẻ (Ruler)</option>
                          <option value="GridFour">Lưới (GridFour)</option>
                          <option value="Wrench">Cờ lê (Wrench)</option>
                        </select>
                      </div>
                    </div>

                    {/* Submenu section */}
                    <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-3.5 mt-2">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="font-bold text-slate-700 text-[10px] uppercase tracking-wider">Danh mục con (Submenu)</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newCats = [...categories];
                            const currentSub = newCats[catIdx].subMenu ? [...(newCats[catIdx].subMenu || [])] : [];
                            currentSub.push({ label: "Menu con mới", href: `${cat.href}/moi` });
                            newCats[catIdx] = { ...newCats[catIdx], subMenu: currentSub };
                            setCategories(newCats);
                          }}
                          className="px-2 py-1 bg-blue-50 text-[#2563eb] hover:bg-blue-100 font-bold rounded text-[9px] cursor-pointer outline-none border-none"
                        >
                          + Thêm menu con
                        </button>
                      </div>

                      {(!cat.subMenu || cat.subMenu.length === 0) ? (
                        <div className="text-[10px] text-slate-400 font-semibold text-center py-2 select-none">
                          Không có danh mục con.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {cat.subMenu.map((sub, subIdx) => (
                            <div key={subIdx} className="flex gap-2 items-center">
                              <input
                                type="text"
                                required
                                value={sub.label}
                                placeholder="Tên menu con"
                                onChange={(e) => {
                                  const newCats = [...categories];
                                  const currentSub = newCats[catIdx].subMenu ? [...(newCats[catIdx].subMenu || [])] : [];
                                  currentSub[subIdx] = { ...currentSub[subIdx], label: e.target.value };
                                  newCats[catIdx] = { ...newCats[catIdx], subMenu: currentSub };
                                  setCategories(newCats);
                                }}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 text-slate-800 font-semibold text-xs focus:outline-none focus:border-[#2563eb]"
                              />
                              <input
                                type="text"
                                required
                                value={sub.href}
                                placeholder="Đường dẫn"
                                onChange={(e) => {
                                  const newCats = [...categories];
                                  const currentSub = newCats[catIdx].subMenu ? [...(newCats[catIdx].subMenu || [])] : [];
                                  currentSub[subIdx] = { ...currentSub[subIdx], href: e.target.value };
                                  newCats[catIdx] = { ...newCats[catIdx], subMenu: currentSub };
                                  setCategories(newCats);
                                }}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 text-slate-800 font-semibold text-xs focus:outline-none focus:border-[#2563eb]"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newCats = [...categories];
                                  const currentSub = newCats[catIdx].subMenu ? [...(newCats[catIdx].subMenu || [])] : [];
                                  const filteredSub = currentSub.filter((_, idx) => idx !== subIdx);
                                  newCats[catIdx] = { ...newCats[catIdx], subMenu: filteredSub };
                                  setCategories(newCats);
                                }}
                                className="text-rose-500 hover:text-rose-700 font-bold text-xs bg-transparent border-none cursor-pointer outline-none p-1.5"
                              >
                                Xóa
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Save / Cancel Buttons */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3 select-none">
            <button
              type="button"
              onClick={() => {
                if(confirm("Xác nhận hủy bỏ mọi chỉnh sửa chưa lưu?")) {
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
