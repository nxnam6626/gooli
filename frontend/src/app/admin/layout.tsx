/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [time, setTime] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Real-time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const hh = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      const sec = String(now.getSeconds()).padStart(2, '0');
      setTime(`${yyyy}-${mm}-${dd} ${hh}:${min}:${sec}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Authentication check
  useEffect(() => {
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('gooli_token');
    const userData = localStorage.getItem('gooli_user');

    if (!token || !userData) {
      router.push('/admin/login');
      return;
    }

    try {
      setUser(JSON.parse(userData));
      setLoading(false);
    } catch (e) {
      localStorage.removeItem('gooli_token');
      localStorage.removeItem('gooli_user');
      router.push('/admin/login');
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('gooli_token');
    localStorage.removeItem('gooli_user');
    document.cookie = 'gooli_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'gooli_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eef1f5] text-gray-500 flex flex-col items-center justify-center font-sans">
        <div className="text-sm tracking-widest uppercase mb-4 animate-pulse">
          Đang kết nối hệ thống WMS...
        </div>
        <div className="w-48 h-[3px] bg-gray-200 relative overflow-hidden rounded-full">
          <div className="absolute top-0 left-0 h-full w-1/3 bg-[#008b44]" 
               style={{
                 animation: 'loader-bar 1.5s infinite linear'
               }}
          />
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes loader-bar {
            0% { left: -33%; }
            100% { left: 100%; }
          }
        `}} />
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen w-full bg-[#eef1f5] text-gray-800 font-sans flex flex-col text-xs">
      
      {/* 1. TOP WHITE HEADER BAR */}
      <header className="h-12 w-full bg-white border-b border-gray-200 flex items-center justify-between px-6 select-none z-40 shrink-0">
        {/* Left Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2">
            {/* Styled Logo Sphere (Blue/Emerald Green blend) */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#008b44] to-[#2f63d4] flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-black">G</span>
            </div>
            <span className="text-base font-extrabold tracking-tight text-gray-900">
              Gooli <span className="text-[#008b44]">WMS</span>
            </span>
          </Link>
        </div>

        {/* Middle Shortcuts & Utilities */}
        <div className="hidden lg:flex items-center gap-6 text-gray-500 font-medium">
          <div className="flex items-center gap-1 cursor-pointer hover:text-[#2f63d4] transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Bán online</span>
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:text-[#2f63d4] transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <span>Giao hàng</span>
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:text-[#2f63d4] transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16V5" />
            </svg>
            <span>Vay vốn</span>
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:text-[#2f63d4] transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <span>Chủ đề</span>
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:text-[#2f63d4] transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Hỗ trợ</span>
          </div>
        </div>

        {/* Right Info, Branch Selector, Admin User */}
        <div className="flex items-center gap-4 text-[11px] text-gray-600 font-medium">
          {/* Branch */}
          <div className="hidden md:flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded cursor-pointer hover:bg-gray-200 transition-colors">
            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="font-bold text-gray-800">Chi nhánh trung tâm</span>
            <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Clock */}
          <div className="hidden sm:block font-mono text-gray-400 tracking-wider">
            {time}
          </div>

          <div className="h-4 w-[1px] bg-gray-200" />

          {/* User Profile Dropdown */}
          <div className="relative group flex items-center gap-1.5 cursor-pointer py-2 text-gray-800 hover:text-gray-900">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700 select-none">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <span className="font-bold hover:underline max-w-[100px] truncate">
              {user?.name || 'Admin'}
            </span>
            <svg className="w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>

            {/* User drop down list */}
            <div className="absolute right-0 top-full hidden group-hover:block bg-white border border-gray-200 shadow-lg rounded-md mt-0 w-36 py-1 text-gray-700 z-50">
              <div className="px-3 py-1.5 border-b border-gray-100 text-[10px] text-gray-400 select-none">
                Vai trò: {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'}
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. SECONDARY BLUE NAVBAR */}
      <nav className="h-10 w-full bg-[#2f63d4] text-white flex items-center justify-between px-6 select-none shadow-md z-30 shrink-0">
        <div className="flex items-center h-full gap-1">
          {/* Overview Tab */}
          <Link
            href="/admin"
            className={`flex items-center gap-1.5 px-4 h-10 font-bold uppercase transition-colors tracking-wide ${
              pathname === '/admin'
                ? 'bg-[#1b4cb3] text-white border-b-2 border-white'
                : 'text-blue-100 hover:bg-[#1b4cb3] hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span>Tổng quan</span>
          </Link>

          {/* Goods Dropdown Tab */}
          <div className="relative group h-full">
            <button
              className={`flex items-center gap-1.5 px-4 h-10 font-bold uppercase transition-colors tracking-wide cursor-pointer focus:outline-none ${
                pathname.startsWith('/admin/products')
                  ? 'bg-[#1b4cb3] text-white border-b-2 border-white'
                  : 'text-blue-100 hover:bg-[#1b4cb3] hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Hàng hóa</span>
              <svg className="w-3 h-3 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu overlay */}
            <div className="absolute left-0 top-full hidden group-hover:block bg-white border border-gray-200 shadow-lg rounded-b-md w-40 py-1 text-gray-800 z-50">
              <Link href="/admin/products" className="block px-4 py-2 hover:bg-gray-100 hover:text-[#2f63d4] font-bold">
                Danh mục
              </Link>
              <div className="block px-4 py-2 text-gray-300 font-bold cursor-not-allowed select-none">
                Thiết lập giá
              </div>
              <div className="block px-4 py-2 text-gray-300 font-bold cursor-not-allowed select-none">
                Phiếu bảo hành
              </div>
              <div className="block px-4 py-2 text-gray-300 font-bold cursor-not-allowed select-none">
                Kiểm kho
              </div>
            </div>
          </div>

          {/* Sơ đồ kho Tab */}
          <Link
            href="/admin/locations"
            className={`flex items-center gap-1.5 px-4 h-10 font-bold uppercase transition-colors tracking-wide ${
              pathname.startsWith('/admin/locations')
                ? 'bg-[#1b4cb3] text-white border-b-2 border-white'
                : 'text-blue-100 hover:bg-[#1b4cb3] hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Sơ đồ kho</span>
          </Link>

          {/* Partners Dropdown Tab */}
          <div className="relative group h-full">
            <button
              className={`flex items-center gap-1.5 px-4 h-10 font-bold uppercase transition-colors tracking-wide cursor-pointer focus:outline-none ${
                pathname.startsWith('/admin/partners')
                  ? 'bg-[#1b4cb3] text-white border-b-2 border-white'
                  : 'text-blue-100 hover:bg-[#1b4cb3] hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Đối tác</span>
              <svg className="w-3 h-3 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu overlay */}
            <div className="absolute left-0 top-full hidden group-hover:block bg-white border border-gray-200 shadow-lg rounded-b-md w-40 py-1 text-gray-800 z-50">
              <Link href="/admin/partners?type=CUSTOMER" className="block px-4 py-2 hover:bg-gray-100 hover:text-[#2f63d4] font-bold">
                Khách hàng
              </Link>
              <Link href="/admin/partners?type=SUPPLIER" className="block px-4 py-2 hover:bg-gray-100 hover:text-[#2f63d4] font-bold">
                Nhà cung cấp
              </Link>
            </div>
          </div>

          {/* Employees / Fund / Reports (Disabled) */}
          <span className="hidden md:flex items-center gap-1.5 px-4 h-10 font-bold uppercase text-blue-300 cursor-not-allowed select-none opacity-60">
            Nhân viên
          </span>
          <span className="hidden md:flex items-center gap-1.5 px-4 h-10 font-bold uppercase text-blue-300 cursor-not-allowed select-none opacity-60">
            Sổ quỹ
          </span>
          <span className="hidden lg:flex items-center gap-1.5 px-4 h-10 font-bold uppercase text-blue-300 cursor-not-allowed select-none opacity-60">
            Báo cáo
          </span>
        </div>

        {/* Right Green Bán Hàng Button */}
        <div>
          <button
            onClick={() => alert('Chuyển hướng màn hình bán hàng...')}
            className="flex items-center gap-1.5 bg-[#008b44] hover:bg-[#007036] active:scale-95 text-white font-extrabold uppercase px-4 h-8 rounded text-[11px] tracking-wide transition-all shadow cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Bán hàng</span>
          </button>
        </div>
      </nav>

      {/* 3. MAIN CONTAINER VIEWPORT */}
      <main className="flex-1 p-5 w-full max-w-7xl mx-auto overflow-y-auto">
        {children}
      </main>

      {/* 4. BLUE FOOTER BAR */}
      <footer className="w-full bg-[#1b2c4f] border-t border-slate-700 text-slate-400 py-3.5 px-6 shrink-0 z-20 text-[11px]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 font-medium select-none">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-xs">Gooli WMS</span>
            <span>- Phần mềm Quản lý Kho vật liệu xây dựng chuyên nghiệp</span>
          </div>
          <div className="flex items-center gap-5">
            <div>
              Tổng đài hỗ trợ: <span className="font-bold text-white">1800 6162</span>
            </div>
            <div>
              Website: <a href="https://gooli.vn" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">www.gooli.vn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
