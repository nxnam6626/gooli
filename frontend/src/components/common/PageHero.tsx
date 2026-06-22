"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PageHeroProps {
  title: string;
  breadcrumbText: string;
  imageSrc?: string;
}

export default function PageHero({ 
  title, 
  breadcrumbText, 
  imageSrc 
}: PageHeroProps) {
  const [bgSrc, setBgSrc] = useState(imageSrc || "/projects/banner_top_marble.png");

  useEffect(() => {
    if (imageSrc) {
      setBgSrc(imageSrc);
      return;
    }

    const loadSettings = () => {
      const saved = localStorage.getItem("gooli_public_website_settings");
      if (saved) {
        try {
          const config = JSON.parse(saved);
          if (config.heroBanner) {
            setBgSrc(config.heroBanner);
          } else {
            setBgSrc("/projects/banner_top_marble.png");
          }
        } catch (err) {
          console.error("Failed to parse website settings in PageHero:", err);
        }
      }
    };

    loadSettings();
    window.addEventListener("website-settings-updated", loadSettings);
    return () => window.removeEventListener("website-settings-updated", loadSettings);
  }, [imageSrc]);

  return (
    <section className="relative h-[30dvh] min-h-[240px] flex items-center justify-center pt-20">
      <div className="absolute inset-0">
        <img
          src={bgSrc}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="container-gooli relative z-10 w-full text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-wide select-none mb-4">
          {title}
        </h1>
        <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-neutral-300 font-medium select-none">
          <Link href="/" className="hover:text-white transition-colors duration-200">
            Trang chủ
          </Link>
          <span className="text-neutral-500">/</span>
          <span className="text-neutral-400">{breadcrumbText}</span>
        </div>
      </div>
    </section>
  );
}
