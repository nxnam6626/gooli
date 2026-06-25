import type { Metadata } from "next";
import PageHero from "@/components/common/PageHero";
import {
  AboutOverview,
  AboutCoreValues,
  AboutLeaders,
  AboutProducts,
  AboutContact,
} from "@/features/about-portal";

export const metadata: Metadata = {
  title: "Giới thiệu | GOOLI Việt Nam — Vật liệu xây dựng cao cấp",
  description:
    "GOOLI Việt Nam là đơn vị cung cấp giải pháp trần nhôm, lam sóng ngoài trời và tấm ốp cao cấp thế hệ mới. Tiên phong về thiết kế đồng bộ và kiểm định chất lượng nghiêm ngặt.",
};

export default function AboutPage() {
  return (
    <main className="flex-1 bg-white">
      <PageHero title="Giới thiệu" breadcrumbText="Giới thiệu" />
      <AboutOverview />
      <AboutCoreValues />
      <AboutLeaders />
      <AboutProducts />
      <AboutContact />
    </main>
  );
}
