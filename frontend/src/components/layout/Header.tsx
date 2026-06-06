"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { List, CaretDown, CaretRight, Phone, MapPin } from "@phosphor-icons/react";

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll position — show sticky header after scrolling 80px
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if we are on the homepage. On homepage, the category sidebar is visible by default.
  // On other pages, we can show it as a hover/click dropdown.
  const isHomepage = pathname === "/";

  const navigationItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Giới thiệu", href: "/gio-thieu" },
    { label: "Sản phẩm", href: "/san-pham" },
    { label: "Hình ảnh", href: "/hinh-anh" },
    { label: "Báo giá", href: "/bao-gia" },
    { label: "Tin tức", href: "/tin-tuc" },
    { label: "Liên hệ", href: "/lien-he" },
  ];

  const categories = [
    { label: "Lam gỗ nhựa trong nhà", href: "/san-pham/lam-trong-nha" },
    { label: "Lam gỗ nhựa ngoài trời", href: "/san-pham/lam-ngoai-troi" },
    { label: "Tấm nano nhựa", href: "/san-pham/tam-nano" },
    { label: "Vách ngăn 2 mặt", href: "/san-pham/vach-ngan" },
    { label: "La phông nhựa", href: "/san-pham/la-phong" },
    { label: "Sàn gỗ nhựa", href: "/san-pham/san-go" },
    { label: "Phào chỉ trang trí", href: "/san-pham/phao-chi" },
    { label: "Khung trần", href: "/san-pham/khung-tran" },
  ];

  return (
    <>
      {/* Static header — always rendered in the document flow */}
      <header className="w-full z-40 flex flex-col bg-white dark:bg-neutral-950">
        {/* Row 1: Logo and Contact Info */}
        <div className="border-b border-neutral-100 dark:border-neutral-800">
          <div className="container-gooli flex h-[76px] items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-gold)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-300 hover:rotate-12"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
                <path d="M12 2v10" />
              </svg>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight uppercase leading-none text-neutral-900 dark:text-white">
                  GOO<span className="text-brand-gold">LI</span>
                </span>
                <span className="text-[9px] font-extrabold tracking-widest uppercase text-brand-gold leading-none mt-1">
                  Vật Liệu Xây Dựng
                </span>
              </div>
            </Link>

            {/* Contact Details (Desktop) */}
            <div className="hidden md:flex items-center gap-8 text-sm text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-brand-gold" aria-hidden="true" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-neutral-400">Văn phòng</p>
                  <p className="font-semibold text-neutral-800 dark:text-neutral-200">Hà Nội, Việt Nam</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={18} className="text-brand-gold" aria-hidden="true" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-neutral-400">Hotline hỗ trợ</p>
                  <p className="font-semibold text-neutral-800 dark:text-neutral-200">0988.777.666</p>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
              aria-label="Toggle menu"
            >
              <List size={24} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Row 2: Brown Wood Navigation Bar */}
        <div className="bg-[#7A4312] shadow-md border-b border-[#5C300B] h-[50px]">
          <div className="container-gooli flex items-stretch h-full">
            {/* Left Block: Danh mục sản phẩm */}
            <div className="relative w-[280px] shrink-0 flex items-stretch h-full">
              <div
                className="w-full h-full flex items-center justify-between sidebar-item-padding bg-[#B06518] hover:bg-[#C07223] transition-colors duration-200 text-white font-bold uppercase tracking-wider text-sm cursor-pointer select-none rounded-t-lg"
                onClick={() => !isHomepage && setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              >
                <div className="flex items-center gap-5">
                  <List size={20} weight="bold" aria-hidden="true" />
                  <span>Danh mục sản phẩm</span>
                </div>
                {!isHomepage && <CaretDown size={14} className={`transition-transform duration-200 ${isCategoryDropdownOpen ? "rotate-180" : ""}`} aria-hidden="true" />}
              </div>

              {/* Dropdown Menu for non-homepage */}
              {!isHomepage && isCategoryDropdownOpen && (
                <div
                  className="absolute top-full left-0 w-full bg-white dark:bg-neutral-900 border-x border-b border-neutral-200 dark:border-neutral-800 shadow-xl z-50"
                  style={{ padding: "8px 0" }}
                >
                  {categories.map((cat, idx) => (
                    <Link
                      key={idx}
                      href={cat.href}
                      onClick={() => setIsCategoryDropdownOpen(false)}
                      className="flex items-center justify-between text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-[#B06518] font-medium transition-colors"
                      style={{ padding: "12px 24px" }}
                    >
                      <span>{cat.label}</span>
                      <CaretRight size={14} aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Right Block: Navigation Menu */}
            <nav className="hidden md:flex flex-1 items-stretch justify-start pl-6 gap-0 h-full">
              {navigationItems.map((item, idx) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    className={`nav-link ${isActive ? "active" : ""}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Drawer Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4 py-4 space-y-3">
            <div className="font-bold text-xs uppercase text-neutral-400 tracking-wider">Menu</div>
            <div className="flex flex-col gap-2">
              {navigationItems.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-sm font-bold text-neutral-800 dark:text-neutral-200 hover:text-brand-gold uppercase tracking-wide"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3">
              <div className="font-bold text-xs uppercase text-neutral-400 tracking-wider mb-2">Danh mục</div>
              <div className="flex flex-col gap-1">
                {categories.map((cat, idx) => (
                  <Link
                    key={idx}
                    href={cat.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-brand-gold"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Sticky nav bar — slides in from top after scroll, identical to static nav row */}
      <div
        className="fixed top-0 left-0 right-0 z-50 bg-[#7A4312] shadow-lg border-b border-[#5C300B] h-[50px]"
        style={{
          transform: isScrolled ? "translateY(0)" : "translateY(-100%)",
          opacity: isScrolled ? 1 : 0,
          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
          pointerEvents: isScrolled ? "auto" : "none",
        }}
        aria-hidden={!isScrolled}
      >
        <div className="container-gooli flex items-stretch h-full">
          {/* Left Block: Danh mục sản phẩm — same as static header */}
          <div className="relative w-[280px] shrink-0 flex items-stretch h-full">
            <div
              className="w-full h-full flex items-center justify-between sidebar-item-padding bg-[#B06518] hover:bg-[#C07223] transition-colors duration-200 text-white font-bold uppercase tracking-wider text-sm cursor-pointer select-none"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            >
              <div className="flex items-center gap-5">
                <List size={20} weight="bold" aria-hidden="true" />
                <span>Danh mục sản phẩm</span>
              </div>
              <CaretDown size={14} className={`transition-transform duration-200 ${isCategoryDropdownOpen ? "rotate-180" : ""}`} aria-hidden="true" />
            </div>

            {/* Dropdown from sticky bar */}
            {isCategoryDropdownOpen && (
              <div
                className="absolute top-full left-0 w-full bg-white dark:bg-neutral-900 border-x border-b border-neutral-200 dark:border-neutral-800 shadow-xl z-50"
                style={{ padding: "8px 0" }}
              >
                {categories.map((cat, idx) => (
                  <Link
                    key={idx}
                    href={cat.href}
                    onClick={() => setIsCategoryDropdownOpen(false)}
                    className="flex items-center justify-between text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-[#B06518] font-medium transition-colors"
                    style={{ padding: "12px 24px" }}
                  >
                    <span>{cat.label}</span>
                    <CaretRight size={14} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Block: Navigation */}
          <nav className="hidden md:flex flex-1 items-stretch justify-start pl-6 gap-0 h-full">
            {navigationItems.map((item, idx) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className={`nav-link ${isActive ? "active" : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
