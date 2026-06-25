"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useWebsiteSettings } from "@/context/WebsiteSettingsContext";

interface CategoryItem {
  title: string;
  desc: string;
  image: string;
  href: string;
  colorTheme: {
    overlayBg: string;      // Translucent background color for the text overlay
    btnBg: string;          // Background color for the "Xem tất cả" button
    textColor: string;      // Text color for title & description
    badgeDotBg: string;     // Color for bullet points or decorative elements
  };
}

const COLOR_THEMES = [
  {
    overlayBg: "bg-[#D8A4B8]/75 dark:bg-[#D8A4B8]/25",
    btnBg: "bg-[#D8A4B8] hover:bg-[#C892A6] text-[#2D0618] dark:text-[#2D0618]",
    textColor: "text-[#2D0618] dark:text-[#E8C2D2]",
    badgeDotBg: "bg-[#2D0618]"
  },
  {
    overlayBg: "bg-[#FBE49F]/80 dark:bg-[#FBE49F]/20",
    btnBg: "bg-[#FBE49F] hover:bg-[#ECC344] text-[#2D1F00] dark:text-[#2D1F00]",
    textColor: "text-[#2D1F00] dark:text-[#FBE49F]",
    badgeDotBg: "bg-[#2D1F00]"
  },
  {
    overlayBg: "bg-[#ADCBEB]/80 dark:bg-[#ADCBEB]/20",
    btnBg: "bg-[#ADCBEB] hover:bg-[#8CBBE5] text-[#03142B] dark:text-[#03142B]",
    textColor: "text-[#03142B] dark:text-[#ADCBEB]",
    badgeDotBg: "bg-[#03142B]"
  },
  {
    overlayBg: "bg-[#F3CFCB]/80 dark:bg-[#F3CFCB]/20",
    btnBg: "bg-[#F3CFCB] hover:bg-[#E6ABA4] text-[#2D0D09] dark:text-[#2D0D09]",
    textColor: "text-[#2D0D09] dark:text-[#F3CFCB]",
    badgeDotBg: "bg-[#2D0D09]"
  },
  {
    overlayBg: "bg-[#E6C29E]/80 dark:bg-[#E6C29E]/20",
    btnBg: "bg-[#E6C29E] hover:bg-[#D5B08D] text-[#2E1502] dark:text-[#2E1502]",
    textColor: "text-[#2E1502] dark:text-[#E6C29E]",
    badgeDotBg: "bg-[#2E1502]"
  },
  {
    overlayBg: "bg-[#A9DFBF]/80 dark:bg-[#A9DFBF]/20",
    btnBg: "bg-[#A9DFBF] hover:bg-[#8CD0A4] text-[#0A2411] dark:text-[#0A2411]",
    textColor: "text-[#0A2411] dark:text-[#A9DFBF]",
    badgeDotBg: "bg-[#0A2411]"
  }
];

export default function FeaturedCategories() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const settings = useWebsiteSettings();

  const categories: CategoryItem[] = settings.categories.map((cat, idx) => ({
    title: cat.label,
    desc: cat.description || "Khám phá danh mục sản phẩm của chúng tôi",
    image: cat.image || "/placeholder.jpg",
    href: cat.href,
    colorTheme: COLOR_THEMES[idx % COLOR_THEMES.length]
  }));

  // Auto sliding logic
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      const container = scrollRef.current;
      if (container) {
        const { scrollLeft, clientWidth, scrollWidth } = container;
        // Scroll amount is 1 card width (clientWidth / 4 on desktop, clientWidth for single view)
        const scrollStep = window.innerWidth >= 1024 ? clientWidth / 4 : clientWidth;
        const isEnd = scrollLeft + clientWidth >= scrollWidth - 10;

        if (isEnd) {
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          container.scrollTo({ left: scrollLeft + scrollStep, behavior: "smooth" });
        }
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Manual scroll trigger
  const handleScroll = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (container) {
      const { scrollLeft, clientWidth } = container;
      const scrollStep = window.innerWidth >= 1024 ? clientWidth / 4 : clientWidth;
      const scrollTo = direction === "left"
        ? scrollLeft - scrollStep
        : scrollLeft + scrollStep;

      container.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section
      className="w-full select-none"
      onMouseEnter={() => {
        setIsHovered(true);
        setIsPaused(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPaused(false);
      }}
    >
      {/* Heading with bullet point and horizontal divider */}
      <div className="flex items-center gap-4" style={{ marginBottom: "32px" }}>
        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-neutral-800 dark:text-white flex items-center gap-2 shrink-0">
          Danh mục sản phẩm
          <span className="w-2.5 h-2.5 rounded-full bg-[#A8051E]" aria-hidden="true"></span>
        </h2>
        <div className="flex-1 h-[1.5px] bg-neutral-200 dark:bg-neutral-800"></div>
      </div>

      {/* Carousel Wrapper */}
      <div className="relative group/carousel">
        {/* Navigation Buttons (fades in on hover, overlapping slightly) */}
        <button
          onClick={() => handleScroll("left")}
          className={`absolute left-[-16px] top-[40%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white dark:bg-neutral-800 shadow-lg border border-neutral-100 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 transition-all duration-300 cursor-pointer ${isHovered
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-2 pointer-events-none"
            } hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:scale-105 active:scale-95`}
          aria-label="Scroll left"
        >
          <CaretLeft size={20} weight="bold" />
        </button>

        <button
          onClick={() => handleScroll("right")}
          className={`absolute right-[-16px] top-[40%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white dark:bg-neutral-800 shadow-lg border border-neutral-100 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 transition-all duration-300 cursor-pointer ${isHovered
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-2 pointer-events-none"
            } hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:scale-105 active:scale-95`}
          aria-label="Scroll right"
        >
          <CaretRight size={20} weight="bold" />
        </button>

        {/* Categories Track */}
        <div
          ref={scrollRef}
          className="w-full overflow-x-auto flex gap-5 pb-4 snap-x snap-mandatory scrollbar-none"
          style={{ scrollBehavior: "smooth" }}
        >
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              href={cat.href}
              className="w-[85%] sm:w-[48%] lg:w-[calc(25%-15px)] shrink-0 snap-start flex flex-col justify-end relative aspect-[4/3] rounded-lg overflow-hidden border border-neutral-200/50 dark:border-neutral-800/80 shadow-sm bg-neutral-100 dark:bg-neutral-900 cursor-pointer group/card"
            >
              {/* Background Image */}
              <img
                src={cat.image}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-[1.03] transition-transform duration-500"
              />

              {/* Translucent Color Overlay bottom half */}
              <div 
                className={`w-full z-10 transition-colors duration-300 flex flex-col justify-center items-start min-h-[38%] ${cat.colorTheme.overlayBg}`}
                style={{ paddingLeft: "20px", paddingRight: "20px", paddingTop: "12px", paddingBottom: "12px" }}
              >
                <div className="flex items-center justify-between w-full">
                  <h3 className={`text-sm md:text-base font-extrabold uppercase tracking-wide text-left mb-1 line-clamp-1 ${cat.colorTheme.textColor}`}>
                    {cat.title}
                  </h3>
                  <span className={`text-xs font-bold transition-transform duration-300 group-hover/card:translate-x-1 ${cat.colorTheme.textColor}`}>
                    →
                  </span>
                </div>
                <p className={`text-xs md:text-sm text-left leading-relaxed line-clamp-1 font-medium opacity-85 ${cat.colorTheme.textColor}`}>
                  {cat.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
