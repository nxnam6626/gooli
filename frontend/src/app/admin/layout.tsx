/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  SquaresFour,
  Warehouse,
  Users,
  ArrowsLeftRight,
  ClipboardText,
  CreditCard,
  ChartBar,
  Gear,
  ShoppingCart,
  Bell,
  ClockCounterClockwise,
  SignOut,
  Globe,
  Package,
  Folder,
  Buildings,
  Ruler,
  Warning,
} from "@phosphor-icons/react";

function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const q = searchParams.get("search") || "";
    setSearchQuery(q);
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/admin/products?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <form onSubmit={handleSearchSubmit} className="relative w-80 max-w-md">
      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94a3b8]">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </span>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Tìm kiếm sản phẩm, SKU hoặc vị trí..."
        className="w-full bg-[#f1f5f9] border-none rounded-lg py-2 pl-9 pr-4 text-xs font-semibold text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
      />
    </form>
  );
}

// Sidebar Sections and Items grouped by subsystems
const SECTIONS = [
  {
    title: "",
    items: [
      { href: "/admin", label: "Dashboard", icon: <SquaresFour size={20} weight="bold" /> }
    ]
  },
  {
    title: "QUẢN LÝ KHO",
    items: [
      { href: "/admin/receipts", label: "Quản lý nhập hàng", icon: <ClipboardText size={20} /> },
      { href: "/admin/exports", label: "Bán hàng (Xuất kho)", icon: <ShoppingCart size={20} /> },
      { href: "/admin/stock", label: "Quản lý tồn kho", icon: <Warehouse size={20} /> }
    ]
  },
  {
    title: "QUẢN LÝ DANH MỤC",
    items: [
      { href: "/admin/products", label: "Hàng hóa (Sản phẩm)", icon: <Package size={20} /> },
      { href: "/admin/partners", label: "Đối tác", icon: <Users size={20} /> }
    ]
  },
  {
    title: "CÀI ĐẶT & HỆ THỐNG",
    items: [
      { href: "/admin/slips", label: "Quản lý Tài chính", icon: <CreditCard size={20} /> },
      { href: "/admin/settings", label: "Cấu hình & Website", icon: <Gear size={20} /> }
    ]
  }
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [perms, setPerms] = useState<Record<string, boolean> | null>(null);

  const filteredSections = React.useMemo(() => {
    if (!perms) return SECTIONS;
    return SECTIONS.map(section => {
      const items = section.items.filter(item => {
        if (item.href === "/admin/slips" && !perms.view_finance) return false;
        if (item.href === "/admin/settings" && !perms.manage_settings) return false;
        return true;
      });
      return { ...section, items };
    }).filter(section => section.items.length > 0);
  }, [perms]);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("gooli_token");
    const userData = localStorage.getItem("gooli_user");

    if (!token || !userData) {
      router.push("/admin/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Load permissions
      const DEFAULT_ROLE_PERMISSIONS: Record<string, Record<string, boolean>> = {
        ADMIN: { view_finance: true, manage_settings: true, approve_bills: true, create_bills: true, manage_catalog: true },
        ACCOUNTANT: { view_finance: true, manage_settings: false, approve_bills: false, create_bills: true, manage_catalog: true },
        WAREHOUSE_STAFF: { view_finance: false, manage_settings: false, approve_bills: false, create_bills: true, manage_catalog: true }
      };

      const savedPerms = localStorage.getItem("gooli_wms_role_permissions");
      let activePerms = DEFAULT_ROLE_PERMISSIONS;
      if (savedPerms) {
        try {
          activePerms = JSON.parse(savedPerms);
        } catch (err) {
          console.error("Failed to parse role permissions:", err);
        }
      }

      const role = parsedUser.role || "WAREHOUSE_STAFF";
      setPerms(activePerms[role] || DEFAULT_ROLE_PERMISSIONS.WAREHOUSE_STAFF);
      setLoading(false);
    } catch (e) {
      localStorage.removeItem("gooli_token");
      localStorage.removeItem("gooli_user");
      router.push("/admin/login");
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("gooli_token");
    localStorage.removeItem("gooli_user");
    document.cookie = "gooli_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie = "gooli_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-base text-gray-500 font-bold flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Đang kết nối hệ thống...
        </div>
      </div>
    );
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const isSlips = pathname === "/admin/slips" || pathname.startsWith("/admin/slips/");
  const isSettings = pathname === "/admin/settings" || pathname.startsWith("/admin/settings/");
  
  const userRole = user?.role || "WAREHOUSE_STAFF";
  
  let hasAccess = true;
  if (isSlips && perms && !perms.view_finance) hasAccess = false;
  if (isSettings && perms && !perms.manage_settings) hasAccess = false;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans antialiased text-[#1e293b]">
      {/* SIDEBAR */}
      <aside className="w-[260px] bg-white border-r border-[#e2e8f0] flex flex-col fixed top-0 bottom-0 left-0 z-30">
        {/* LOGO SECTION */}
        <div className="px-6 py-6 border-b border-[#f1f5f9] flex flex-col">
          <Link href="/admin" className="no-underline group">
            <span className="text-[#1e3a8a] text-xl font-extrabold tracking-tight block group-hover:text-blue-700 transition-colors">
              WMS Global
            </span>
            <span className="text-[11px] text-[#94a3b8] font-bold tracking-wider uppercase block mt-0.5">
              Warehouse Management
            </span>
          </Link>
        </div>

        {/* NAVIGATION ITEMS */}
        <nav className="flex-1 px-4 py-5 space-y-4 overflow-y-auto select-none">
          {filteredSections.map((section, sectionIdx) => (
            <div key={sectionIdx} className="space-y-1.5">
              {section.title && (
                <div className="px-4 pt-2 pb-1">
                  <span className="text-[9px] font-extrabold text-[#94a3b8] tracking-wider uppercase block">
                    {section.title}
                  </span>
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                  
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 no-underline cursor-pointer ${
                        isActive
                          ? "bg-[#2563eb] text-white shadow-md shadow-blue-500/10"
                          : "text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#1e293b]"
                      }`}
                    >
                      <span className={isActive ? "text-white" : "text-[#94a3b8] transition-colors group-hover:text-[#1e293b]"}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* USER PROFILE INFO SECTION */}
        <div className="p-4 border-t border-[#f1f5f9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-sm ring-2 ring-slate-100">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : "AD"}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#1e293b] leading-tight">
                {user?.name || "Quản trị viên"}
              </span>
              <span className="text-[10px] text-[#94a3b8] font-medium mt-0.5 max-w-[130px] truncate">
                {user?.email || "admin@gooli.vn"}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-[#94a3b8] hover:text-[#ef4444] hover:bg-red-50 rounded-lg transition-colors"
            title="Đăng xuất"
          >
            <SignOut size={20} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 pl-[260px] flex flex-col min-h-screen">
        {/* HEADER NAVBAR */}
        <header className="h-[70px] bg-white border-b border-[#e2e8f0] flex items-center justify-between px-8 sticky top-0 z-20">
          {/* Header Title */}
          <div className="flex items-center">
            <span className="text-xl font-extrabold text-[#1e3a8a] tracking-tight">
              WMS Logistics
            </span>
          </div>

          {/* Search Box */}
          <React.Suspense fallback={<div className="w-80 h-8 bg-[#f1f5f9] rounded-lg animate-pulse" />}>
            <SearchBox />
          </React.Suspense>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-6">
            {/* POS Button */}
            <button
              onClick={() => router.push("/admin/products")}
              className="bg-[#2563eb] text-white hover:bg-blue-700 font-bold px-5 py-2.5 rounded-lg text-xs tracking-wide transition-colors cursor-pointer shadow-sm shadow-blue-500/10"
            >
              Bán hàng (POS)
            </button>

            {/* Notification Bell */}
            <button className="relative text-[#64748b] hover:text-[#1e293b] transition-colors p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
              <Bell size={22} weight="bold" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>

            {/* History Link */}
            <button className="text-[#64748b] hover:text-[#1e293b] transition-colors p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer" title="Lịch sử hoạt động">
              <ClockCounterClockwise size={22} weight="bold" />
            </button>

            {/* Profile Summary */}
            <div className="flex items-center gap-3 pl-4 border-l border-[#e2e8f0]">
              <div className="flex flex-col text-right">
                <span className="text-xs font-extrabold text-[#1e293b] leading-tight">
                  Gooli Admin
                </span>
              </div>
              <div className="w-9 h-9 rounded-full overflow-hidden border border-[#cbd5e1] shadow-inner bg-[#f1f5f9] flex items-center justify-center text-xs font-bold text-slate-700">
                GA
              </div>
            </div>
          </div>
        </header>

        {/* CONTAINER FOR CHILDREN */}
        <main className="flex-1 p-8 bg-[#f8fafc] overflow-y-auto">
          {hasAccess ? children : (
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-12 text-center shadow-sm max-w-xl mx-auto mt-20 space-y-6">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto ring-4 ring-rose-100">
                <Warning size={32} weight="bold" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-black text-slate-900">Không có quyền truy cập</h2>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                  Tài khoản của bạn (vai trò <span className="font-bold text-slate-800">{userRole}</span>) không có quyền hạn truy cập phân hệ này. Vui lòng liên hệ Quản trị viên để biết thêm chi tiết.
                </p>
              </div>
              <div>
                <button
                  onClick={() => router.push("/admin")}
                  className="bg-[#1e293b] hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Quay lại Dashboard
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
