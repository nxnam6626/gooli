import Image from "next/image";

export default function HeroBanners() {
  return (
    <aside className="w-full lg:w-[320px] shrink-0 flex flex-col justify-between gap-4 lg:h-full">
      {/* Top Banner */}
      <div className="flex-1 min-h-[160px] relative overflow-hidden rounded-lg group shadow-sm border border-neutral-200/50 dark:border-neutral-800">
        <Image
          src="/projects/banner_top_marble.png"
          alt="Lam gỗ và vách đá trang trí cao cấp"
          fill
          className="object-cover group-hover:scale-103 transition-transform duration-500"
          sizes="(max-w-1024px) 100vw, 25vw"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
      </div>

      {/* Bottom Banner */}
      <div className="flex-1 min-h-[160px] relative overflow-hidden rounded-lg group shadow-sm border border-neutral-200/50 dark:border-neutral-800">
        <Image
          src="/projects/banner_bottom_girl.png"
          alt="Ốp tường gỗ nhựa phòng khách sang trọng"
          fill
          className="object-cover group-hover:scale-103 transition-transform duration-500"
          sizes="(max-w-1024px) 100vw, 25vw"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
      </div>
    </aside>
  );
}
