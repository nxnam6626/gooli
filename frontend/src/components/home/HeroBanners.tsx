/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";

export default function HeroBanners() {
  const [bannerTopImage, setBannerTopImage] = useState("/projects/banner_top_marble.png");
  const [bannerTopAlt, setBannerTopAlt] = useState("Lam gỗ và vách đá trang trí cao cấp");
  const [bannerBottomImage, setBannerBottomImage] = useState("/projects/banner_bottom_girl.png");
  const [bannerBottomAlt, setBannerBottomAlt] = useState("Ốp tường gỗ nhựa phòng khách sang trọng");

  useEffect(() => {
    const saved = localStorage.getItem("gooli_public_website_settings");
    if (saved) {
      try {
        const config = JSON.parse(saved);
        if (config.bannerTopImage) setBannerTopImage(config.bannerTopImage);
        if (config.bannerTopAlt) setBannerTopAlt(config.bannerTopAlt);
        if (config.bannerBottomImage) setBannerBottomImage(config.bannerBottomImage);
        if (config.bannerBottomAlt) setBannerBottomAlt(config.bannerBottomAlt);
      } catch (err) {
        console.error("Failed to load hero banners from localStorage:", err);
      }
    }
  }, []);

  return (
    <aside className="w-full lg:w-[320px] shrink-0 flex flex-col justify-between gap-4 lg:h-full">
      {/* Top Banner */}
      <div className="flex-1 min-h-[160px] relative overflow-hidden rounded-lg group shadow-sm border border-neutral-200/50 dark:border-neutral-800">
        <img
          src={bannerTopImage}
          alt={bannerTopAlt}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
      </div>

      {/* Bottom Banner */}
      <div className="flex-1 min-h-[160px] relative overflow-hidden rounded-lg group shadow-sm border border-neutral-200/50 dark:border-neutral-800">
        <img
          src={bannerBottomImage}
          alt={bannerBottomAlt}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
      </div>
    </aside>
  );
}
