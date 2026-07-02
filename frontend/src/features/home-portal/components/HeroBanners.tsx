"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getPopularCategories, incrementCategoryView } from "@/services/api";

interface BannerData {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  href: string;
  alt: string;
}

const DEFAULT_BANNERS: BannerData[] = [
  {
    id: 1,
    image: "/projects/banner_top_marble.png",
    title: "Tấm ốp PVC vân đá",
    subtitle: "Đẳng cấp, chống ẩm mốc & tăng chiều sâu",
    href: "/san-pham/pvc-van-da",
    alt: "Tấm ốp PVC vân đá cẩm thạch sang trọng"
  },
  {
    id: 2,
    image: "/projects/banner_bottom_girl.png",
    title: "Lam gỗ nhựa trang trí",
    subtitle: "Kiến tạo không gian nội thất sang trọng",
    href: "/san-pham/lam-trong-nha",
    alt: "Lam gỗ nhựa phòng khách cao cấp"
  }
];

export default function HeroBanners() {
  const [banners, setBanners] = useState<BannerData[]>(DEFAULT_BANNERS);

  useEffect(() => {
    async function fetchPopular() {
      try {
        const popularCats = await getPopularCategories();
        if (popularCats && Array.isArray(popularCats) && popularCats.length >= 2) {
          const mappedBanners: BannerData[] = popularCats.slice(0, 2).map((cat, idx) => ({
            id: cat.id || idx + 1,
            image: cat.image || (idx === 0 ? DEFAULT_BANNERS[0].image : DEFAULT_BANNERS[1].image),
            title: cat.label,
            subtitle: cat.description || (idx === 0 ? DEFAULT_BANNERS[0].subtitle : DEFAULT_BANNERS[1].subtitle),
            href: cat.href,
            alt: cat.label
          }));
          setBanners(mappedBanners);
        }
      } catch (err) {
        console.error("Failed to load popular categories for banners:", err);
      }
    }
    fetchPopular();
  }, []);

  return (
    <aside className="hidden lg:flex w-[320px] shrink-0 flex-col gap-4 h-full">
      {banners.map((banner) => (
        <Link
          key={banner.id}
          href={banner.href}
          onClick={() => incrementCategoryView(banner.href)}
          className="relative aspect-[21/9] lg:aspect-auto lg:flex-1 min-h-[120px] sm:min-h-[160px] overflow-hidden rounded-lg group shadow-sm border border-neutral-200/50 dark:border-neutral-800 cursor-pointer block"
        >
          <Image
            src={banner.image}
            alt={banner.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 320px"
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
            style={{ objectPosition: "50% 50%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/15 group-hover:from-black/65 group-hover:via-black/25 transition-colors duration-300" />
          
          <div className="absolute inset-0 p-5 flex flex-col justify-end text-white z-10 select-none">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#B8902A] mb-1">
              {banner.title}
            </h3>
            <p className="text-[10px] text-slate-200 font-medium leading-tight mb-2">
              {banner.subtitle}
            </p>
            <span className="text-[9px] font-bold uppercase tracking-wider text-white inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
              Khám phá ngay →
            </span>
          </div>
        </Link>
      ))}
    </aside>
  );
}
