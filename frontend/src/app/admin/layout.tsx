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
      setUser(JSON.parse(userData));
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

  // Sidebar Menu Items
  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: <SquaresFour size={22} weight="bold" /> },
    { href: "/admin/products", label: "Kho hàng", icon: <Warehouse size={22} /> },
    { href: "/admin/partners", label: "Đối tác", icon: <Users size={22} /> },
    { href: "/admin/slips", label: "Tài chính", icon: <CreditCard size={22} /> },
    { href: "/admin/reports", label: "Báo cáo", icon: <ChartBar size={22} /> },
    { href: "/admin/functions", label: "Cài đặt", icon: <Gear size={22} /> },
  ];

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
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isWarehouseMenu = item.label === "Kho hàng";
            const isWarehouseActive = isWarehouseMenu && (
              pathname === "/admin/products" ||
              pathname === "/admin/stock" ||
              pathname.startsWith("/admin/receipts") ||
              pathname.startsWith("/admin/exports") ||
              pathname.startsWith("/admin/categories")
            );
            const isPartnersMenu = item.label === "Đối tác";
            const isPartnersActive = isPartnersMenu && (
              pathname.startsWith("/admin/partners") ||
              pathname.startsWith("/admin/partner-groups")
            );
            const isActive = isWarehouseMenu ? isWarehouseActive : (
              isPartnersMenu ? isPartnersActive : (
                pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
              )
            );

            return (
              <div key={item.label} className="space-y-1">
                <Link
                  href={isWarehouseMenu ? "/admin/receipts" : (isPartnersMenu ? "/admin/partners" : item.href)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 no-underline ${
                    isActive
                      ? "bg-[#2563eb] text-white shadow-md shadow-blue-500/10"
                      : "text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#1e293b]"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-[#94a3b8]"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>

                {/* Submenu for Kho hàng */}
                {isWarehouseMenu && isActive && (
                  <div className="border-l-2 border-slate-200 ml-6 pl-4 space-y-1 mt-1 transition-all">
                    <Link
                      href="/admin/receipts"
                      className={`block px-4 py-2 rounded-lg text-xs font-bold no-underline transition-all ${
                        pathname.startsWith("/admin/receipts")
                          ? "bg-slate-100 text-[#2563eb]"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      Nhập hàng
                    </Link>
                    <Link
                      href="/admin/exports"
                      className={`block px-4 py-2 rounded-lg text-xs font-bold no-underline transition-all ${
                        pathname.startsWith("/admin/exports")
                          ? "bg-slate-100 text-[#2563eb]"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      Xuất hàng
                    </Link>
                    <Link
                      href="/admin/stock"
                      className={`block px-4 py-2 rounded-lg text-xs font-bold no-underline transition-all ${
                        pathname === "/admin/stock"
                          ? "bg-slate-100 text-[#2563eb]"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      Tồn kho
                    </Link>
                    <Link
                      href="/admin/products"
                      className={`block px-4 py-2 rounded-lg text-xs font-bold no-underline transition-all ${
                        pathname === "/admin/products"
                          ? "bg-slate-100 text-[#2563eb]"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      Hàng hóa
                    </Link>
                    <Link
                      href="/admin/categories"
                      className={`block px-4 py-2 rounded-lg text-xs font-bold no-underline transition-all ${
                        pathname.startsWith("/admin/categories")
                          ? "bg-slate-100 text-[#2563eb]"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      Nhóm hàng
                    </Link>
                  </div>
                )}

                {/* Submenu for Đối tác */}
                {isPartnersMenu && isActive && (
                  <div className="border-l-2 border-slate-200 ml-6 pl-4 space-y-1 mt-1 transition-all">
                    <Link
                      href="/admin/partners"
                      className={`block px-4 py-2 rounded-lg text-xs font-bold no-underline transition-all ${
                        pathname === "/admin/partners"
                          ? "bg-slate-100 text-[#2563eb]"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      Đối tác
                    </Link>
                    <Link
                      href="/admin/partner-groups"
                      className={`block px-4 py-2 rounded-lg text-xs font-bold no-underline transition-all ${
                        pathname === "/admin/partner-groups"
                          ? "bg-slate-100 text-[#2563eb]"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      Nhóm đối tác
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
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
          {children}
        </main>
      </div>
    </div>
  );
}
