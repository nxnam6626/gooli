import AboutPageClient from "@/components/about/AboutPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giới thiệu | GOOLI Việt Nam — Vật liệu xây dựng cao cấp",
  description:
    "GOOLI Việt Nam là đơn vị cung cấp giải pháp trần nhôm, lam sóng ngoài trời và tấm ốp cao cấp thế hệ mới. Tiên phong về thiết kế đồng bộ và kiểm định chất lượng nghiêm ngặt.",
};

export default function AboutPage() {
  return <AboutPageClient />;
}
