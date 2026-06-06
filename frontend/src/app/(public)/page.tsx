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

const outdoorProducts = [
  {
    name: "LAM HỘP NGOÀI TRỜI - HH-RED",
    price: "399.000đ",
    image: "/projects/project_g100_wood_tn.png",
    href: "/san-pham/lam-ngoai-troi"
  },
  {
    name: "LAM HỘP NGOÀI TRỜI - HH-COFFEE",
    price: "880.000đ",
    image: "/projects/project_sunshade_ams.png",
    href: "/san-pham/lam-ngoai-troi"
  },
  {
    name: "LAM HỘP NGOÀI TRỜI - HH-BROWN",
    price: "630.000đ",
    image: "/projects/project_g100_wood_tn.png",
    href: "/san-pham/lam-ngoai-troi"
  },
  {
    name: "LAM HỘP NGOÀI TRỜI - HH-TEAK",
    price: "740.000đ",
    image: "/projects/project_sunshade_ams.png",
    href: "/san-pham/lam-ngoai-troi"
  },
  {
    name: "LAM SÓNG NGOÀI TRỜI - HH-LN001",
    price: "749.000đ",
    image: "/projects/project_caro_sunshade.png",
    href: "/san-pham/lam-ngoai-troi"
  },
  {
    name: "LAM SÓNG NGOÀI TRỜI - HH-LN002",
    price: "490.000đ",
    originalPrice: "539.000đ",
    image: "/projects/project_caro_sunshade.png",
    href: "/san-pham/lam-ngoai-troi"
  },
  {
    name: "LAM SÓNG NGOÀI TRỜI - HH-LN003",
    price: "3.200.000đ",
    originalPrice: "3.500.000đ",
    image: "/projects/project_g100_wood_tn.png",
    href: "/san-pham/lam-ngoai-troi"
  }
];

export default function Home() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <main className="flex-1 bg-[#FAFAFA] dark:bg-neutral-950 pb-16">
      {/* Explicit style tags to bypass any caching of custom CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .home-section-spacing-categories {
          margin-top: var(--section-mt-mobile, 48px) !important;
        }
        .home-section-spacing-products {
          margin-top: var(--section-mt-mobile, 64px) !important;
        }
        @media (min-width: 1024px) {
          .home-section-spacing-categories {
            margin-top: var(--section-mt-desktop, 80px) !important;
          }
          .home-section-spacing-products {
            margin-top: var(--section-mt-desktop, 128px) !important;
          }
        }
      `}} />

      <div className="container-gooli pb-6 lg:pb-8" style={{ paddingTop: "20px" }}>
        {/* Main Hero Layout: Stretch columns dynamically from 450px to 600px when categories are expanded */}
        <div className={`flex flex-col lg:flex-row gap-5 items-stretch transition-all duration-300 ${isExpanded ? "lg:h-[600px]" : "lg:h-[450px]"}`}>

          {/* Left Column: Category Sidebar */}
          <CategorySidebar
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded(!isExpanded)}
          />

          {/* Middle Column: Interactive Slider */}
          <HeroSlider />

          {/* Right Column: Stacked Banners */}
          <HeroBanners />

        </div>
      </div>

      {/* Featured Categories Carousel Section */}
      <div
        className="container-gooli home-section-spacing-categories"
        style={{ "--section-mt-desktop": "80px", "--section-mt-mobile": "48px" } as React.CSSProperties}
      >
        <FeaturedCategories />
      </div>

      {/* Featured Products Grid Section - Margins increased to 128px on desktop */}
      <div
        className="container-gooli home-section-spacing-products"
        style={{ "--section-mt-desktop": "128px", "--section-mt-mobile": "64px" } as React.CSSProperties}
      >
        <FeaturedProducts />
      </div>

      {/* Outdoor Wood Plastic Composite section */}
      <div
        className="container-gooli home-section-spacing-products"
        style={{ "--section-mt-desktop": "72px", "--section-mt-mobile": "40px" } as React.CSSProperties}
      >
        <CategoryShowcase
          title="Lam gỗ nhựa ngoài trời"
          bannerTitle="Lam Gỗ"
          bannerHref="/san-pham/lam-ngoai-troi"
          bannerGradient="linear-gradient(135deg, #D99E6C, #8C522B)"
          products={outdoorProducts}
        />
      </div>

      {/* Project Showcase Section */}
      <div
        className="container-gooli home-section-spacing-products"
        style={{ 
          "--section-mt-desktop": "128px", 
          "--section-mt-mobile": "64px",
          paddingBottom: "96px"
        } as React.CSSProperties}
      >
        <ProjectShowcase />
      </div>

      {/* Floating Action Buttons widget */}
      <FloatingContacts />
    </main>
  );
}
