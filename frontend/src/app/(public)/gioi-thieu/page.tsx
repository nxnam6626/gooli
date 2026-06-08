import type { Metadata } from "next";
import AboutHero from "@/components/about/AboutHero";
import AboutOverview from "@/components/about/AboutOverview";
import AboutCoreValues from "@/components/about/AboutCoreValues";
import AboutLeaders from "@/components/about/AboutLeaders";
import AboutProducts from "@/components/about/AboutProducts";
import AboutContact from "@/components/about/AboutContact";

export const metadata: Metadata = {
  title: "Giới thiệu | GOOLI Việt Nam — Vật liệu xây dựng cao cấp",
  description:
    "GOOLI Việt Nam là đơn vị cung cấp giải pháp trần nhôm, lam sóng ngoài trời và tấm ốp cao cấp thế hệ mới. Tiên phong về thiết kế đồng bộ và kiểm định chất lượng nghiêm ngặt.",
};

export default function AboutPage() {
  return (
    <main className="flex-1 bg-white">
      <AboutHero />
      <AboutOverview />
      <AboutCoreValues />
      <AboutLeaders />
      <AboutProducts />
      <AboutContact />
    </main>
  );
}
