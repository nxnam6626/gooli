"use client";

import Link from "next/link";
import Image from "next/image";
import { useWebsiteSettings } from "@/context/WebsiteSettingsContext";

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
  const { heroBanner } = useWebsiteSettings();

  const bgSrc = imageSrc || heroBanner || "/projects/banner_top_marble.png";
  const isSafeBg = !!(
    bgSrc &&
    (bgSrc.startsWith("data:image/") ||
      bgSrc.startsWith("/") ||
      bgSrc.startsWith("http://") ||
      bgSrc.startsWith("https://"))
  );

  return (
    <section className="relative h-[30dvh] min-h-[240px] flex items-center justify-center pt-20">
      <div className="absolute inset-0">
        {isSafeBg ? (
          <Image
            src={bgSrc}
            alt={title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <Image
            src="/projects/banner_top_marble.png"
            alt={title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
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
