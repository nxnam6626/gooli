"use client";

import Link from "next/link";
import Image from "next/image";

export interface ShowcaseProduct {
  name: string;
  image: string;
  href: string;
  price?: string;         // e.g. "Liên hệ" or "399.000đ"
  originalPrice?: string; // e.g. "539.000đ" (optional strikethrough)
}

interface CategoryShowcaseProps {
  title: string;
  bannerTitle: string;
  bannerHref: string;
  bannerGradient: string; // e.g. "linear-gradient(135deg, #A76E43, #5E3A1A)"
  products: ShowcaseProduct[];
}

export default function CategoryShowcase({
  title,
  bannerTitle,
  bannerHref,
  bannerGradient,
  products
}: CategoryShowcaseProps) {
  return (
    <section className="w-full select-none">
      {/* Inject custom CSS overrides for banner styling */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .showcase-banner-card {
          position: relative;
          color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .showcase-banner-inner-border {
          position: absolute;
          inset: 12px;
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-radius: 4px;
          pointer-events: none;
        }
        .showcase-banner-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 26px;
          font-weight: 700;
          font-style: italic;
          color: #ffffff;
          margin-bottom: 6px;
          text-align: center;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
        }
        .showcase-banner-btn {
          margin-top: 14px;
          background-color: #ffffff !important;
          color: #5E3A1A !important;
          border: 1px solid #ffffff !important;
          padding: 6px 18px !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          border-radius: 2px !important;
          transition: all 0.2s ease !important;
          text-decoration: none !important;
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
          z-index: 10;
        }
        .showcase-banner-btn:hover {
          background-color: transparent !important;
          color: #ffffff !important;
          border-color: #ffffff !important;
          box-shadow: none !important;
        }
        .category-showcase-view-all {
          padding: 8px 20px !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          border-radius: 4px !important;
          background-color: #B06518 !important;
          color: #ffffff !important;
          border: none !important;
          transition: all 0.2s ease !important;
          text-decoration: none !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
        }
        .category-showcase-view-all:hover {
          background-color: #905212 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(176, 101, 24, 0.2) !important;
        }
      `}} />

      {/* Title Row */}
      <div className="flex items-center gap-4" style={{ marginBottom: "28px" }}>
        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-neutral-800 dark:text-white flex items-center gap-2 shrink-0">
          {title}
          <span className="w-2.5 h-2.5 rounded-full bg-[#A8051E]" aria-hidden="true"></span>
        </h2>
        <div className="flex-1 h-[1.5px] bg-neutral-200 dark:bg-neutral-800"></div>
        <Link href={bannerHref} className="category-showcase-view-all cursor-pointer shrink-0">
          Xem tất cả
        </Link>
      </div>

      {/* Grid Track: Banner at pos 1, products at pos 2-8 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        
        {/* Banner Card */}
        <div className="showcase-banner-card min-h-[280px]" style={{ background: bannerGradient }}>
          <div className="showcase-banner-inner-border"></div>
          <h3 className="showcase-banner-title">{bannerTitle}</h3>
          <div className="w-8 h-[1px] bg-white/40 my-1"></div>
          <Link href={bannerHref} className="showcase-banner-btn cursor-pointer">
            Xem toàn bộ &rarr;
          </Link>
        </div>

        {/* Product Cards */}
        {products.slice(0, 7).map((prod, idx) => (
          <Link
            key={idx}
            href={prod.href}
            className="group/card relative bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/80 rounded-lg flex flex-col justify-start shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-pointer overflow-hidden"
          >
            {/* Card Top: Image Aspect Square container */}
            <div className="relative aspect-square w-full bg-neutral-50 dark:bg-neutral-950 overflow-hidden">
              <Image
                src={prod.image}
                alt={prod.name}
                fill
                className="object-cover group-hover/card:scale-[1.03] transition-transform duration-500"
                sizes="(max-w-768px) 45vw, (max-w-1024px) 30vw, 20vw"
              />
            </div>

            {/* Card Bottom: Product details */}
            <div className="p-4 flex flex-col items-center justify-center flex-1 min-h-[90px]">
              <h4 className="text-xs md:text-sm font-medium text-neutral-600 dark:text-neutral-300 text-center line-clamp-2 leading-relaxed mb-1.5 group-hover/card:text-[#B06518] transition-colors">
                {prod.name}
              </h4>
              
              <div className="flex items-center justify-center gap-2 mt-0.5">
                <span className="text-xs sm:text-sm md:text-[14px] font-extrabold text-[#A8051E]">
                  {prod.price || "Liên hệ"}
                </span>
                {prod.originalPrice && (
                  <span className="text-[10px] md:text-xs text-neutral-400 line-through">
                    {prod.originalPrice}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}

      </div>
    </section>
  );
}
