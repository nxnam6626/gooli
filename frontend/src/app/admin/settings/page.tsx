"use client";

import React, { useState, useEffect } from "react";
import { 
  Storefront, 
  Sliders, 
  Users, 
  FloppyDisk, 
  CheckCircle, 
  WarningCircle, 
  Info,
  FileText,
  Plus,
  Trash,
  ArrowUp,
  ArrowDown,
  UploadSimple,
  Image as ImageIcon,
  FacebookLogo,
  LinkedinLogo,
  Chat,
  Link as LinkIcon
} from "@phosphor-icons/react";

interface UserAccount {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "ACTIVE" | "INACTIVE";
}

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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"warehouse" | "parameters" | "users">("warehouse");

  // Form states - Tab 1: Warehouse Info
  const [warehouseName, setWarehouseName] = useState("WMS Global - Kho miền Bắc");
  const [phone, setPhone] = useState("024.3388.9999");
  const [email, setEmail] = useState("khomb@wmsglobal.vn");
  const [address, setAddress] = useState("Lô CN3, Cụm công nghiệp vừa và nhỏ Từ Liêm, Hà Nội");
  const [taxCode, setTaxCode] = useState("0102938475");

  // Form states - Tab 2: System Parameters
  const [reorderThreshold, setReorderThreshold] = useState(5);
  const [defaultVatRate, setDefaultVatRate] = useState(10);
  const [currencySymbol, setCurrencySymbol] = useState("VNĐ");

  // Accounts List - Tab 3: Users
  const [accounts] = useState<UserAccount[]>([
    { id: 1, name: "Xuan Nam", email: "admin@gooli.vn", role: "ADMIN", status: "ACTIVE" },
    { id: 2, name: "Nguyễn Văn A", email: "thukho@gooli.vn", role: "WAREHOUSE_STAFF", status: "ACTIVE" },
    { id: 3, name: "Trần Thị B", email: "ketoan@gooli.vn", role: "ACCOUNTANT", status: "ACTIVE" },
    { id: 4, name: "Phạm Văn C", email: "staff@gooli.vn", role: "WAREHOUSE_STAFF", status: "INACTIVE" }
  ]);

  // Form states - Tab 4: Website Settings (General)
  const [isWebsiteOnline, setIsWebsiteOnline] = useState(true);
  const [webEmail, setWebEmail] = useState("contact@gooli-wms.com");
  const [webHotline, setWebHotline] = useState("1900 1234");
  const [webAddress, setWebAddress] = useState("123 Logistic Way, Ho Chi Minh City");
  const [facebookUrl, setFacebookUrl] = useState("https://facebook.com/gooli-wms");
  const [linkedinUrl, setLinkedinUrl] = useState("https://linkedin.com/company/gooli-wms");
  const [zaloOaId, setZaloOaId] = useState("0934119376");

  // Form states - Tab 5: Website Content (Hero, Slides, Banners)
  const [heroTitle, setHeroTitle] = useState("Giải pháp quản lý kho chuyên nghiệp Gooli WMS");
  const [heroSubtitle, setHeroSubtitle] = useState("Số hóa quy trình vận hành kho, kiểm soát tồn kho thực tế chính xác 100%, nâng cao năng suất xếp dỡ.");
  const [aboutUsText, setAboutUsText] = useState("Gooli WMS được thành lập năm 2026 với mục tiêu cung cấp giải pháp quản trị chuỗi cung ứng tối ưu cho các doanh nghiệp vừa và nhỏ.");
  const [metaTitle, setMetaTitle] = useState("Gooli WMS - Hệ thống Quản lý Kho thông minh");
  const [metaKeywords, setMetaKeywords] = useState("quản lý kho, wms, tồn kho, phần mềm kho, sổ quỹ, logistics");
  const [metaDescription, setMetaDescription] = useState("Giải pháp tối ưu hóa vận hành kho bãi, theo dõi hàng xuất nhập, cảnh báo tồn kho và đối soát công nợ chuyên sâu.");

  const [heroSlides, setHeroSlides] = useState<{ id: number; image: string; title: string; alt: string; }[]>([]);
  const [bannerTopImage, setBannerTopImage] = useState("");
  const [bannerTopAlt, setBannerTopAlt] = useState("");
  const [bannerBottomImage, setBannerBottomImage] = useState("");
  const [bannerBottomAlt, setBannerBottomAlt] = useState("");

  // Form states - Tab 6: Website Categories
  const [webCategories, setWebCategories] = useState<{
    label: string;
    href: string;
    icon: string;
    subMenu?: { label: string; href: string; }[];
  }[]>([]);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Dynamic Role permissions state
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({
    ADMIN: { view_finance: true, manage_settings: true, approve_bills: true, create_bills: true, manage_catalog: true },
    ACCOUNTANT: { view_finance: true, manage_settings: false, approve_bills: false, create_bills: true, manage_catalog: true },
    WAREHOUSE_STAFF: { view_finance: false, manage_settings: false, approve_bills: false, create_bills: true, manage_catalog: true }
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    // 1. WMS Config
    const savedSettings = localStorage.getItem("gooli_wms_settings");
    if (savedSettings) {
      try {
        const config = JSON.parse(savedSettings);
        if (config.warehouse) {
          setWarehouseName(config.warehouse.name || "");
          setPhone(config.warehouse.phone || "");
          setEmail(config.warehouse.email || "");
          setAddress(config.warehouse.address || "");
          setTaxCode(config.warehouse.taxCode || "");
        }
        if (config.parameters) {
          setReorderThreshold(Number(config.parameters.reorderThreshold) || 5);
          setDefaultVatRate(Number(config.parameters.defaultVatRate) || 10);
          setCurrencySymbol(config.parameters.currencySymbol || "VNĐ");
        }
      } catch (err) {
        console.error("Failed to parse WMS settings:", err);
      }
    }

    // 2. Website settings
    const savedWeb = localStorage.getItem("gooli_public_website_settings");
    if (savedWeb) {
      try {
        const config = JSON.parse(savedWeb);
        if (config.online !== undefined) setIsWebsiteOnline(config.online);
        if (config.email) setWebEmail(config.email);
        if (config.phone) setWebHotline(config.phone);
        if (config.address) setWebAddress(config.address);
        if (config.facebook) setFacebookUrl(config.facebook);
        if (config.linkedin) setLinkedinUrl(config.linkedin);
        if (config.zalo) setZaloOaId(config.zalo);
        
        if (config.heroTitle) setHeroTitle(config.heroTitle);
        if (config.heroSubtitle) setHeroSubtitle(config.heroSubtitle);
        if (config.aboutUsText) setAboutUsText(config.aboutUsText);
        
        if (config.metaTitle) setMetaTitle(config.metaTitle);
        if (config.metaKeywords) setMetaKeywords(config.metaKeywords);
        if (config.metaDescription) setMetaDescription(config.metaDescription);

        if (config.heroSlides) setHeroSlides(config.heroSlides);
        else setHeroSlides(DEFAULT_SLIDES);
        setBannerTopImage(config.bannerTopImage || DEFAULT_BANNER_TOP.image);
        setBannerTopAlt(config.bannerTopAlt || DEFAULT_BANNER_TOP.alt);
        setBannerBottomImage(config.bannerBottomImage || DEFAULT_BANNER_BOTTOM.image);
        setBannerBottomAlt(config.bannerBottomAlt || DEFAULT_BANNER_BOTTOM.alt);
      } catch (err) {
        console.error("Failed to parse website settings:", err);
      }
    } else {
      setHeroSlides(DEFAULT_SLIDES);
      setBannerTopImage(DEFAULT_BANNER_TOP.image);
      setBannerTopAlt(DEFAULT_BANNER_TOP.alt);
      setBannerBottomImage(DEFAULT_BANNER_BOTTOM.image);
      setBannerBottomAlt(DEFAULT_BANNER_BOTTOM.alt);
    }

    // 3. Website categories
    const savedCats = localStorage.getItem("gooli_public_categories_settings");
    if (savedCats) {
      try {
        setWebCategories(JSON.parse(savedCats));
      } catch (err) {
        console.error("Failed to load website category settings:", err);
        setWebCategories(DEFAULT_CATEGORIES);
      }
    } else {
      setWebCategories(DEFAULT_CATEGORIES);
    }

    // 4. Role permissions
    const savedPerms = localStorage.getItem("gooli_wms_role_permissions");
    if (savedPerms) {
      try {
        setPermissions(JSON.parse(savedPerms));
      } catch (err) {
        console.error("Failed to parse role permissions:", err);
      }
    }
  }, []);

  // Save settings to localStorage
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save WMS Config
    const wmsConfig = {
      warehouse: { name: warehouseName, phone, email, address, taxCode },
      parameters: { reorderThreshold, defaultVatRate, currencySymbol }
    };
    localStorage.setItem("gooli_wms_settings", JSON.stringify(wmsConfig));
    localStorage.setItem("gooli_wms_role_permissions", JSON.stringify(permissions));
    
    setToastMessage("Đã lưu cấu hình hệ thống thành công!");
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
            Cấu hình & Website
          </h1>
          <p className="text-slate-500 mt-1 text-[11px]">
            Quản trị thiết lập kho vận WMS, phân quyền tài khoản, và tùy biến toàn bộ nội dung Website công khai.
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap gap-1 border border-slate-200 bg-white p-1 rounded-xl shadow-2xs select-none">
        <button
          type="button"
          onClick={() => setActiveTab("warehouse")}
          className={`flex-1 min-w-[120px] py-2 text-center font-bold text-xs transition-all rounded-lg flex items-center justify-center gap-1.5 cursor-pointer outline-none border-none ${
            activeTab === "warehouse" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Storefront size={15} />
          Thông tin Kho hàng
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("parameters")}
          className={`flex-1 min-w-[120px] py-2 text-center font-bold text-xs transition-all rounded-lg flex items-center justify-center gap-1.5 cursor-pointer outline-none border-none ${
            activeTab === "parameters" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Sliders size={15} />
          Tham số WMS
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`flex-1 min-w-[120px] py-2 text-center font-bold text-xs transition-all rounded-lg flex items-center justify-center gap-1.5 cursor-pointer outline-none border-none ${
            activeTab === "users" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Users size={15} />
          Tài khoản
        </button>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <form onSubmit={handleSave} className="p-6">


          {/* TAB 2: System Parameters */}
          {activeTab === "parameters" && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3 select-none">
                <h3 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  Tham số cấu hình nghiệp vụ
                </h3>
                <p className="text-slate-400 mt-0.5 text-[10px]">Cài đặt các hằng số tính toán và ngưỡng cảnh báo an toàn trên toàn hệ thống.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-700">Ngưỡng báo tồn kho thấp</label>
                    <span className="text-[10px] text-slate-400 font-semibold italic">Mặc định: 5 đơn vị</span>
                  </div>
                  <input
                    type="number"
                    min={1}
                    required
                    value={reorderThreshold}
                    onChange={(e) => setReorderThreshold(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700">Đơn vị tiền tệ hiển thị</label>
                  <select
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
                  >
                    <option value="VNĐ">Việt Nam Đồng (VNĐ)</option>
                    <option value="USD">Đô la Mỹ (USD)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700">Thuế suất VAT mặc định (%)</label>
                  <select
                    value={defaultVatRate}
                    onChange={(e) => setDefaultVatRate(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
                  >
                    <option value={0}>0% (Không chịu thuế)</option>
                    <option value={5}>5%</option>
                    <option value={8}>8% (Nghị định giảm thuế)</option>
                    <option value={10}>10%</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Accounts List */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3 select-none">
                <h3 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  Tài khoản & Phân quyền truy cập
                </h3>
                <p className="text-slate-400 mt-0.5 text-[10px]">Danh sách nhân viên vận hành và phân quyền truy cập hệ thống WMS.</p>
              </div>

              <div className="rounded-lg border border-slate-200 overflow-hidden select-none">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-4">Tên nhân viên</th>
                      <th className="py-2.5 px-4">Email đăng nhập</th>
                      <th className="py-2.5 px-4">Quyền truy cập</th>
                      <th className="py-2.5 px-4 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {accounts.map(acc => (
                      <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 px-4 font-bold text-slate-900">{acc.name}</td>
                        <td className="py-2.5 px-4 font-mono font-medium text-slate-500">{acc.email}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-750">
                          {acc.role === "ADMIN" ? (
                            <span className="px-2 py-0.5 bg-blue-50 text-[#2563eb] rounded-full border border-blue-100 text-[9px]">Quản trị viên (ADMIN)</span>
                          ) : acc.role === "WAREHOUSE_STAFF" ? (
                            <span className="px-2 py-0.5 bg-slate-50 text-slate-700 rounded-full border border-slate-200 text-[9px]">Thủ kho (WAREHOUSE_STAFF)</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-[9px]">Kế toán (ACCOUNTANT)</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          {acc.status === "ACTIVE" ? (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-[9px] font-bold">Hoạt động</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full border border-rose-100 text-[9px] font-bold">Tạm khóa</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60 flex gap-2 text-[10px] text-slate-500 items-start leading-relaxed select-none">
                <Info size={14} className="text-slate-400 shrink-0 mt-0.5" />
                <p>Để thêm nhân viên mới hoặc chỉnh sửa mật khẩu và quyền hạn chi tiết, vui lòng chuyển đổi quyền của tài khoản trong bảng danh sách ở trên hoặc thiết lập các quyền hạn chi tiết theo vai trò ở bảng bên dưới.</p>
              </div>

              {/* Bảng phân quyền theo vai trò */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 select-none mt-4">
                <div className="border-b border-slate-100 pb-2.5">
                  <h3 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider block">
                    Bảng phân quyền chi tiết theo vai trò
                  </h3>
                  <p className="text-slate-400 mt-0.5 text-[10px]">Tùy chỉnh các quyền truy cập và thao tác nghiệp vụ của từng vai trò hệ thống. Nhấp Lưu cấu hình bên dưới để áp dụng.</p>
                </div>
                
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-4">Quyền truy cập & thao tác</th>
                        <th className="py-2.5 px-4 text-center">ADMIN</th>
                        <th className="py-2.5 px-4 text-center">ACCOUNTANT</th>
                        <th className="py-2.5 px-4 text-center">WAREHOUSE_STAFF</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {[
                        { key: "view_finance", name: "Xem Báo cáo tài chính & Sổ quỹ", desc: "Xem dòng tiền, phiếu thu/chi và báo cáo công nợ trên Dashboard" },
                        { key: "manage_settings", name: "Cấu hình hệ thống & Website", desc: "Quản lý cài đặt kho hàng và trang giới thiệu public" },
                        { key: "approve_bills", name: "Duyệt / Từ chối phiếu nhập & xuất", desc: "Duyệt các chứng từ nhập kho hoặc xuất kho bán hàng" },
                        { key: "create_bills", name: "Tạo mới phiếu nhập & xuất kho", desc: "Tạo phiếu nhập hoặc phiếu xuất kho ở trạng thái Chờ duyệt" },
                        { key: "manage_catalog", name: "Xem & Quản lý Sản phẩm / Đối tác", desc: "Quản lý danh sách hàng hóa và thông tin khách hàng, nhà cung cấp" }
                      ].map((item) => (
                        <tr key={item.key} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-2.5 px-4">
                            <div className="font-bold text-slate-900">{item.name}</div>
                            <div className="text-[10px] text-slate-400 font-semibold">{item.desc}</div>
                          </td>
                          {["ADMIN", "ACCOUNTANT", "WAREHOUSE_STAFF"].map((role) => (
                            <td key={role} className="py-2.5 px-4 text-center">
                              <input
                                type="checkbox"
                                checked={permissions[role]?.[item.key] || false}
                                disabled={role === "ADMIN"} // Admin always has all permissions
                                onChange={(e) => {
                                  setPermissions((prev) => ({
                                    ...prev,
                                    [role]: {
                                      ...prev[role],
                                      [item.key]: e.target.checked
                                    }
                                  }));
                                }}
                                className="h-4 w-4 rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb] cursor-pointer disabled:cursor-not-allowed mx-auto"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Footer Save Button */}
          {activeTab !== "users" && (
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors border-none outline-none"
              >
                <FloppyDisk size={16} />
                Lưu cấu hình hệ thống
              </button>
            </div>
          )}
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
