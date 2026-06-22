/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import GooliLogo from "@/components/common/GooliLogo";
import { CONTACT_INFO } from "@/constants/contact";

const quickLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/gioi-thieu", label: "Giới thiệu doanh nghiệp" }
];

const serviceLinks = [
  { href: "/san-pham/lam-trong-nha", label: "Lam gỗ nhựa trong nhà" },
  { href: "/san-pham/lam-ngoai-troi", label: "Lam gỗ nhựa ngoài trời" },
  { href: "/san-pham/tam-nano", label: "Tấm ốp nhựa phẳng Nano" },
  { href: "/san-pham/la-phong", label: "Hệ thống trần nhôm caro" }
];

const contactItems = [
  { href: `tel:${CONTACT_INFO.hotline.replace(/\.|\s/g, '')}`, label: `HOTLINE: ${CONTACT_INFO.hotline}`, icon: "phone" },
  { href: CONTACT_INFO.facebook, label: "FACEBOOK FANPAGE", icon: "fb" },
  { href: "/lien-he", label: "VĂN PHÒNG ĐẠI DIỆN", icon: "loc" }
];

const socialLinks = [
  { href: CONTACT_INFO.facebook, label: "f", aria: "Facebook Gooli" },
  { href: "https://twitter.com", label: "X", aria: "Twitter X Gooli" },
  { href: "https://instagram.com", label: "ig", aria: "Instagram Gooli" },
  { href: CONTACT_INFO.linkedin, label: "in", aria: "LinkedIn Gooli" }
];

const legalLinks = [
  { href: "/tuyen-dung", label: "TUYỂN DỤNG" },
  { href: "/chinh-sach", label: "BẢO MẬT" }
];

const renderContactIcon = (icon: string) => {
  switch (icon) {
    case "phone":
      return (
        <svg aria-hidden="true" className="w-4 h-4 text-[#B06518]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      );
    case "fb":
      return (
        <svg aria-hidden="true" className="w-4 h-4 text-[#B06518]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
        </svg>
      );
    case "yt":
      return (
        <svg aria-hidden="true" className="w-4 h-4 text-[#B06518]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l-6 4v-8l6 4z" />
          <rect x="2" y="4" width="20" height="16" rx="5" strokeWidth={2} />
        </svg>
      );
    case "loc":
      return (
        <svg aria-hidden="true" className="w-4 h-4 text-[#B06518]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    default:
      return null;
  }
};

export default function Footer() {
  const [dynamicContactItems, setDynamicContactItems] = useState(contactItems);
  const [dynamicSocialLinks, setDynamicSocialLinks] = useState(socialLinks);
  const [dynamicServiceLinks, setDynamicServiceLinks] = useState(serviceLinks);

  useEffect(() => {
    const loadSettings = () => {
      const saved = localStorage.getItem("gooli_public_website_settings");
      if (saved) {
        try {
          const config = JSON.parse(saved);

          // Update contact items dynamically
          const updatedContact = [...contactItems];
          if (config.phone) {
            updatedContact[0] = {
              href: `tel:${config.phone.replace(/\s+/g, '')}`,
              label: `HOTLINE: ${config.phone}`,
              icon: "phone"
            };
          }
          if (config.facebook) {
            updatedContact[1] = {
              href: config.facebook,
              label: "FACEBOOK FANPAGE",
              icon: "fb"
            };
          }
          if (config.zalo) {
            // Point the 3rd icon (yt in default list) to Zalo chat
            updatedContact[2] = {
              href: `https://zalo.me/${config.zalo}`,
              label: "ZALO HỖ TRỢ",
              icon: "yt"
            };
          }
          setDynamicContactItems(updatedContact);

          // Update social links dynamically
          const updatedSocials = [...socialLinks];
          if (config.facebook) {
            updatedSocials[0] = { ...updatedSocials[0], href: config.facebook };
          }
          if (config.linkedin) {
            updatedSocials[3] = { ...updatedSocials[3], href: config.linkedin };
          }
          setDynamicSocialLinks(updatedSocials);

        } catch (err) {
          console.error("Failed to parse website settings in footer:", err);
        }
      }
    };

    loadSettings();
    window.addEventListener("website-settings-updated", loadSettings);

    const savedCats = localStorage.getItem("gooli_public_categories_settings");
    if (savedCats) {
      try {
        const parsedCats = JSON.parse(savedCats);
        if (Array.isArray(parsedCats) && parsedCats.length > 0) {
          setDynamicServiceLinks(parsedCats.slice(0, 4).map((cat: { label: string; href: string }) => ({
            href: cat.href,
            label: cat.label
          })));
        }
      } catch (err) {
        console.error("Failed to parse website categories in footer:", err);
      }
    }

    return () => {
      window.removeEventListener("website-settings-updated", loadSettings);
    };
  }, []);

  return (
    <footer
      className="w-full bg-[#FAF8F5] dark:bg-neutral-950 border-t border-[#E6DED4] dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 select-none"
      style={{ paddingTop: "56px", paddingBottom: "12px" }}
    >
      {/* Inline styles for hover link and input styling overrides */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .footer-link {
          font-size: 13px !important;
          font-weight: 500 !important;
          color: #555555 !important;
          transition: color 0.2s ease, transform 0.2s ease !important;
          display: inline-flex !important;
          align-items: center !important;
        }
        .dark .footer-link {
          color: #a3a3a3 !important;
        }
        .footer-link:hover {
          color: #B06518 !important;
          transform: translateX(4px) !important;
        }
        .footer-contact-box {
          border: 1px solid #E6DED4 !important;
          border-radius: 2px !important;
          padding: 8px 12px !important;
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          color: #4A453E !important;
          transition: border-color 0.2s ease, color 0.2s ease, background-color 0.2s ease !important;
          background-color: #ffffff !important;
          text-decoration: none !important;
        }
        .dark .footer-contact-box {
          border-color: #262626 !important;
          color: #d4d4d4 !important;
          background-color: #171717 !important;
        }
        .footer-contact-box:hover {
          border-color: #B06518 !important;
          color: #B06518 !important;
          background-color: #FAF8F5 !important;
        }
        .dark .footer-contact-box:hover {
          background-color: #262626 !important;
        }
        .footer-social-icon {
          width: 32px !important;
          height: 32px !important;
          border: 1px solid #E6DED4 !important;
          border-radius: 2px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          color: #4A453E !important;
          transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease !important;
        }
        .dark .footer-social-icon {
          border-color: #262626 !important;
          color: #d4d4d4 !important;
        }
        .footer-social-icon:hover {
          background-color: #B06518 !important;
          color: #ffffff !important;
          border-color: #B06518 !important;
        }
      `}} />

      <div className="container-gooli px-4 md:px-6">

        {/* Row 1: 4-Column Grid layout */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"
          style={{ marginBottom: "40px" }}
        >

          {/* Column 1: Brand Logo & Newsletter */}
          <div className="flex flex-col gap-5">
            {/* Branding Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 rounded-sm focus-visible:ring-2 focus-visible:ring-[#B06518] focus-visible:outline-none"
            >
              <GooliLogo
                width={36}
                height={36}
              />
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight uppercase leading-none text-neutral-800 dark:text-white">
                  GOO<span className="text-[#B06518]">LI</span>
                </span>
                <span className="text-[8px] font-extrabold tracking-widest uppercase text-[#B06518] leading-none mt-1">
                  Vật Liệu Xây Dựng
                </span>
              </div>
            </Link>

            {/* Description */}
            <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              Gooli Việt Nam là đơn vị hàng đầu chuyên cung cấp giải pháp trần nhôm chuyên nghiệp,
              tấm ốp lam sóng nhựa và phụ kiện trần vách ván lợp treo đồng bộ chính hãng.
            </p>

            {/* Newsletter form */}
            <div className="flex flex-col gap-2 mt-2">
              <label
                htmlFor="footer-email-input"
                className="text-[10px] font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200"
              >
                ĐĂNG KÝ BẢN TIN
              </label>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex gap-2 w-full"
              >
                <input
                  type="email"
                  name="email"
                  id="footer-email-input"
                  placeholder="Địa chỉ Email… ví dụ: contact@gooli.vn"
                  autoComplete="email"
                  spellCheck={false}
                  className="h-[38px] bg-white dark:bg-neutral-900 border border-[#E6DED4] dark:border-neutral-800 rounded-sm text-xs text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-[#B06518] focus-visible:ring-2 focus-visible:ring-[#B06518] focus-visible:outline-none flex-1"
                  style={{ paddingLeft: "12px", paddingRight: "12px" }}
                  required
                />
                <button
                  type="submit"
                  className="h-[38px] bg-[#B06518] hover:bg-[#905212] focus-visible:ring-2 focus-visible:ring-[#B06518] focus-visible:outline-none text-white text-[10px] font-bold uppercase tracking-wider rounded-sm flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                  style={{ paddingLeft: "24px", paddingRight: "24px" }}
                >
                  ĐĂNG KÝ
                </button>
              </form>
            </div>
          </div>

          {/* Column 2: Useful Links */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#B06518]">
              LIÊN KẾT NỔI BẬT
            </span>
            <div className="flex flex-col gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="footer-link rounded-sm focus-visible:ring-2 focus-visible:ring-[#B06518] focus-visible:outline-none"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3: Our Services */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#B06518]">
              DỊCH VỤ CỦA GOOLI
            </span>
            <div className="flex flex-col gap-3">
              {dynamicServiceLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="footer-link rounded-sm focus-visible:ring-2 focus-visible:ring-[#B06518] focus-visible:outline-none"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 4: Contact Us */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#B06518]">
              LIÊN HỆ VỚI GOOLI
            </span>
            <div className="flex flex-col gap-3">
              {dynamicContactItems.map((item) => {
                const isExternal = item.href.startsWith("http") || item.href.startsWith("tel");
                if (isExternal) {
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="footer-contact-box rounded-sm focus-visible:ring-2 focus-visible:ring-[#B06518] focus-visible:outline-none"
                    >
                      {renderContactIcon(item.icon)}
                      {item.label}
                    </a>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="footer-contact-box rounded-sm focus-visible:ring-2 focus-visible:ring-[#B06518] focus-visible:outline-none"
                  >
                    {renderContactIcon(item.icon)}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

        </div>

        {/* Row 2: Bottom Copyright & Social Row */}
        <div
          className="border-t border-[#E6DED4] dark:border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ paddingTop: "12px" }}
        >

          {/* Copyright */}
          <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            © 2026 GOOLI VIỆT NAM. BẢO LƯU MỌI QUYỀN.
          </span>

          {/* Social Row icons */}
          <div className="flex items-center border border-[#E6DED4] dark:border-neutral-800 rounded-sm divide-x divide-[#E6DED4] dark:divide-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
            {dynamicSocialLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.aria}
                className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-neutral-700 dark:text-neutral-300 hover:bg-[#B06518] hover:text-white focus-visible:bg-[#B06518] focus-visible:text-white focus-visible:outline-none transition-colors duration-200"
              >
                {link.label === "ig" ? (
                  <svg aria-hidden="true" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="2" y="5" width="20" height="14" rx="3" />
                    <circle cx="12" cy="12" r="3" />
                    <circle cx="17.5" cy="8.5" r="0.8" fill="currentColor" />
                  </svg>
                ) : (
                  link.label
                )}
              </a>
            ))}
          </div>

          {/* Legal / Policy links */}
          <div className="flex items-center gap-3 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
            {legalLinks.map((link, idx) => (
              <span key={link.href} className="flex items-center gap-3">
                {idx > 0 && <span>|</span>}
                <Link
                  href={link.href}
                  className="hover:text-[#B06518] focus-visible:text-[#B06518] focus-visible:outline-none transition-colors duration-150"
                >
                  {link.label}
                </Link>
              </span>
            ))}
          </div>

        </div>

      </div>
    </footer>
  );
}
