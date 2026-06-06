"use client";

import { useState } from "react";
import CategorySidebar from "@/components/home/CategorySidebar";
import HeroSlider from "@/components/home/HeroSlider";
import HeroBanners from "@/components/home/HeroBanners";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import ProjectShowcase from "@/components/home/ProjectShowcase";
import FloatingContacts from "@/components/home/FloatingContacts";

const OUTDOOR_PRODUCTS = [
  { name: "LAM HỘP NGOÀI TRỜI - HH-RED", price: "399.000đ", image: "/projects/project_g100_wood_tn.png", href: "/san-pham/lam-ngoai-troi" },
  { name: "LAM HỘP NGOÀI TRỜI - HH-COFFEE", price: "880.000đ", image: "/projects/project_sunshade_ams.png", href: "/san-pham/lam-ngoai-troi" },
  { name: "LAM HỘP NGOÀI TRỜI - HH-BROWN", price: "630.000đ", image: "/projects/project_g100_wood_tn.png", href: "/san-pham/lam-ngoai-troi" },
  { name: "LAM HỘP NGOÀI TRỜI - HH-TEAK", price: "740.000đ", image: "/projects/project_sunshade_ams.png", href: "/san-pham/lam-ngoai-troi" },
  { name: "LAM SÓNG NGOÀI TRỜI - HH-LN001", price: "749.000đ", image: "/projects/project_caro_sunshade.png", href: "/san-pham/lam-ngoai-troi" },
  { name: "LAM SÓNG NGOÀI TRỜI - HH-LN002", price: "490.000đ", originalPrice: "539.000đ", image: "/projects/project_caro_sunshade.png", href: "/san-pham/lam-ngoai-troi" },
  { name: "LAM SÓNG NGOÀI TRỜI - HH-LN003", price: "3.200.000đ", originalPrice: "3.500.000đ", image: "/projects/project_g100_wood_tn.png", href: "/san-pham/lam-ngoai-troi" },
];

export default function Home() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <main className="flex-1 bg-[#FAFAFA] dark:bg-neutral-950 pb-16">
      <div className="container-gooli pb-6 lg:pb-8" style={{ paddingTop: "20px" }}>
        <div className={`flex flex-col lg:flex-row gap-5 items-stretch transition-all duration-300 ${isExpanded ? "lg:h-[600px]" : "lg:h-[450px]"}`}>
          <CategorySidebar isExpanded={isExpanded} onToggleExpand={() => setIsExpanded(!isExpanded)} />
          <HeroSlider />
          <HeroBanners />
        </div>
      </div>

      <div
        className="container-gooli home-section-spacing-categories"
        style={{ "--section-mt-desktop": "80px" } as React.CSSProperties}
      >
        <FeaturedCategories />
      </div>

      <div
        className="container-gooli home-section-spacing-products"
        style={{ "--section-mt-desktop": "128px" } as React.CSSProperties}
      >
        <FeaturedProducts />
      </div>

      <div
        className="container-gooli home-section-spacing-products"
        style={{ "--section-mt-desktop": "72px" } as React.CSSProperties}
      >
        <CategoryShowcase
          title="Lam gỗ nhựa ngoài trời"
          bannerTitle="Lam Gỗ"
          bannerHref="/san-pham/lam-ngoai-troi"
          bannerGradient="linear-gradient(135deg, #D99E6C, #8C522B)"
          products={OUTDOOR_PRODUCTS}
        />
      </div>

      <div
        className="container-gooli home-section-spacing-products"
        style={{ "--section-mt-desktop": "128px", paddingBottom: "96px" } as React.CSSProperties}
      >
        <ProjectShowcase />
      </div>

      <FloatingContacts />
    </main>
  );
}
