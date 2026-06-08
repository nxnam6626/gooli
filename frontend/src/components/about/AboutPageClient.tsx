"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type TabId = "import" | "quality" | "supply";

export default function AboutPageClient() {
  const [activeTab, setActiveTab] = useState<TabId>("import");

  // Core values data
  const coreValues = [
    {
      title: "UY TÍN",
      desc: "Cam kết minh bạch về xuất xứ hàng hóa, đầy đủ CO/CQ từ nhà sản xuất. Nói đúng, làm đúng, giao đúng hạn.",
      icon: (
        <svg className="w-8 h-8 text-[#B06518]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110.5 21a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0113.5 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      ),
    },
    {
      title: "CHẤT LƯỢNG",
      desc: "Chỉ hợp tác với nhà sản xuất đạt tiêu chuẩn quốc tế. Mỗi lô hàng đều được kiểm định kỹ trước khi giao đến công trình.",
      icon: (
        <svg className="w-8 h-8 text-[#B06518]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ),
    },
    {
      title: "TẬN TÂM",
      desc: "Hỗ trợ tư vấn lựa chọn sản phẩm, bóc tách khối lượng từ bản vẽ và đồng hành cùng khách hàng đến khi hoàn thiện công trình.",
      icon: (
        <svg className="w-8 h-8 text-[#B06518]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      ),
    },
    {
      title: "HỢP TÁC",
      desc: "Xây dựng mối quan hệ dài hạn cùng có lợi với các nhà thầu, kiến trúc sư và đại lý phân phối trên cả nước.",
      icon: (
        <svg className="w-8 h-8 text-[#B06518]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.771m.002 0a5.971 5.971 0 00-.94 3.197m.94-3.197a5.971 5.971 0 00-.94-3.197M6 14.25a3 3 0 00-3 3v.31m14-10.5c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm-9 0c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z" />
        </svg>
      ),
    },
  ];

  // Leader list
  const leaders = [
    {
      name: "Nguyễn Xuân Nam",
      role: "Giám đốc",
      desc: "Nhà sáng lập GOOLI với nhiều năm kinh nghiệm trong lĩnh vực vật liệu xây dựng. Trực tiếp xây dựng hệ thống nhập khẩu và phân phối vật tư nhôm cao cấp, hướng tới mục tiêu cung cấp giải pháp vật liệu đồng bộ và minh bạch cho thị trường xây dựng Việt Nam.",
    },
  ];

  // Projects list
  const featuredProjects = [
    {
      title: "Trần nhôm hộp & lam sóng",
      desc: "Hệ trần nhôm hộp và lam sóng ứng dụng cho văn phòng, trung tâm thương mại và không gian công cộng.",
      image: "/projects/project_vna_sanh.png",
    },
    {
      title: "Trần Caro Cell nghệ thuật",
      desc: "Trần Caro Cell kết hợp đèn LED âm trần, tạo hiệu ứng thị giác độc đáo cho không gian nội thất cao cấp.",
      image: "/projects/project_caro_cell_bg.png",
    },
    {
      title: "Tấm ốp & lam ngoài trời",
      desc: "Tấm ốp mặt dựng và hệ lam che nắng ngoài trời chịu thời tiết, phủ sơn tĩnh điện bền màu lâu dài.",
      image: "/projects/project_sunshade_ams.png",
    },
  ];

  return (
    <main className="flex-1 bg-white">
      {/* ── HERO SECTION ───────────────────────────────────────── */}
      <section className="relative h-[30dvh] min-h-[240px] flex items-center justify-center pt-20">
        <div className="absolute inset-0">
          <Image
            src="/projects/banner_top_marble.png"
            alt="Giới thiệu công ty GOOLI"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="container-gooli relative z-10 w-full text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-wide select-none mb-4">
            Giới thiệu
          </h1>
          <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-neutral-300 font-medium select-none">
            <Link href="/" className="hover:text-white transition-colors duration-200">
              Trang chủ
            </Link>
            <span className="text-neutral-500">/</span>
            <span className="text-neutral-400">Giới thiệu</span>
          </div>
        </div>
      </section>

      {/* ── VỀ CHÚNG TÔI SECTION ───────────────────────────────── */}
      <section
        id="ve-chung-toi"
        className="bg-[#FAFAFA]"
        style={{ padding: "clamp(40px, 5vw, 64px) 0" }}
      >
        <div className="container-gooli">
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-neutral-900 uppercase tracking-widest text-center"
            style={{ marginBottom: '48px' }}
          >
            VỀ CHÚNG TÔI
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto">
            {/* Left Box: Image */}
            <div className="lg:col-span-4 relative min-h-[240px] lg:min-h-[360px] bg-neutral-100 border border-neutral-200 rounded-lg overflow-hidden">
              <Image
                src="/luxury_interior.png"
                alt="Giải pháp trần tường nhôm Gooli"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            </div>

            {/* Right Box: Custom Tabs Container */}
            <div
              className="lg:col-span-8 border border-neutral-200 bg-white flex flex-col justify-between lg:min-h-[360px] rounded-lg"
              style={{ padding: "clamp(24px, 4vw, 40px)" }}
            >
              {/* Tab Headers (Segmented Control style - Refined Spacing & Gaps) */}
              <div
                className="flex p-1.5 gap-2 bg-neutral-100/80 dark:bg-neutral-800/80 select-none text-[9px] sm:text-xs lg:text-[13px] font-bold uppercase tracking-wider border border-neutral-200/30 dark:border-neutral-700/30"
                style={{ borderRadius: '8px' }}
              >
                <button
                  onClick={() => setActiveTab("import")}
                  className={`flex-1 py-3 px-3 text-center transition-all duration-300 relative outline-none cursor-pointer ${activeTab === "import"
                    ? "bg-white text-[#B06518] shadow-[0_2px_8px_rgba(0,0,0,0.06)] font-extrabold border border-[#B06518]"
                    : "text-neutral-500 hover:text-neutral-800 hover:bg-white/40"
                    }`}
                  style={{ borderRadius: '6px' }}
                >
                  NHẬP KHẨU & PHÂN PHỐI
                </button>
                <button
                  onClick={() => setActiveTab("quality")}
                  className={`flex-1 py-3 px-3 text-center transition-all duration-300 relative outline-none cursor-pointer ${activeTab === "quality"
                    ? "bg-white text-[#B06518] shadow-[0_2px_8px_rgba(0,0,0,0.06)] font-extrabold border border-[#B06518]"
                    : "text-neutral-500 hover:text-neutral-800 hover:bg-white/40"
                    }`}
                  style={{ borderRadius: '6px' }}
                >
                  TIÊU CHUẨN CHẤT LƯỢNG
                </button>
                <button
                  onClick={() => setActiveTab("supply")}
                  className={`flex-1 py-3 px-3 text-center transition-all duration-300 relative outline-none cursor-pointer ${activeTab === "supply"
                    ? "bg-white text-[#B06518] shadow-[0_2px_8px_rgba(0,0,0,0.06)] font-extrabold border border-[#B06518]"
                    : "text-neutral-500 hover:text-neutral-800 hover:bg-white/40"
                    }`}
                  style={{ borderRadius: '6px' }}
                >
                  TỐI ƯU CUNG ỨNG
                </button>
              </div>

              {/* Tab Content Body */}
              <div
                className="flex-1 flex flex-col justify-between"
                style={{ marginTop: "32px" }}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: "24px" }}
                >
                  <h3 className="text-lg sm:text-xl font-bold text-neutral-900 leading-snug tracking-tight uppercase">
                    {activeTab === "import" && "NHÀ NHẬP KHẨU VÀ CUNG CẤP VẬT LIỆU XÂY DỰNG"}
                    {activeTab === "quality" && "KIỂM SOÁT CHẤT LƯỢNG NGUỒN HÀNG ĐẦU VÀO"}
                    {activeTab === "supply" && "GIẢI PHÁP GIAO HÀNG NHANH & GIÁ CẢ CẠNH TRANH"}
                  </h3>
                  <p className="text-neutral-500 text-sm sm:text-base leading-relaxed font-light">
                    {activeTab === "import" &&
                      "GOOLI tập trung vào việc tìm kiếm các nguồn cung ứng vật tư chất lượng từ các đối tác sản xuất quốc tế uy tín. Chúng tôi đảm nhận vai trò nhập khẩu, lưu trữ và phân phối số lượng lớn các dòng sản phẩm trần nhôm, tấm ốp, lam sóng thế hệ mới trực tiếp từ các nhà máy sản xuất hàng đầu, tối ưu hóa chi phí trung gian cho các nhà thầu và đại lý."}
                    {activeTab === "quality" &&
                      "Mặc dù là doanh nghiệp thương mại mới thành lập, GOOLI cam kết chỉ hợp tác với các nhà sản xuất đạt tiêu chuẩn quốc tế. Từng lô hàng phôi nhôm, nước sơn tĩnh điện đều được kiểm định đầy đủ CO/CQ trước khi xuất xưởng, đảm bảo sản phẩm bàn giao tới công trình luôn đồng nhất và bền bỉ."}
                    {activeTab === "supply" &&
                      "Chúng tôi tối ưu hóa quy trình lưu kho và vận tải để đảm bảo tiến độ cấp hàng nhanh nhất cho dự án. GOOLI hỗ trợ bóc tách khối lượng vật tư từ bản vẽ để tối ưu hóa đơn hàng nhập khẩu, giảm thiểu hao hụt và cung cấp chính sách giá tốt nhất cho các nhà thầu thi công."}
                  </p>
                </div>
 
                <div style={{ marginTop: "40px" }}>
                  <Link
                    href="/san-pham"
                    className="inline-block hover:bg-[#8C4E10] text-white font-bold text-xs uppercase tracking-widest active:scale-[0.98] transition-all duration-200 rounded-[2px]"
                    style={{ padding: "12px 32px", backgroundColor: "#B06518" }}
                  >
                    Xem thêm sản phẩm
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GIÁ TRỊ CỐT LÕI SECTION ────────────────────────────── */}
      <section
        className="bg-white border-t border-neutral-100"
        style={{ padding: "clamp(40px, 5vw, 64px) 0" }}
      >
        <div className="container-gooli">
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-neutral-900 uppercase tracking-widest text-center"
            style={{ marginBottom: "48px" }}
          >
            GIÁ TRỊ CỐT LÕI
          </h2>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto"
            style={{ gap: "32px" }}
          >
            {coreValues.map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center p-4 transition-all duration-300 hover:-translate-y-1">
                {/* Circular Icon Accent wrapper */}
                <div
                  className="w-16 h-16 rounded-full border border-[#B06518]/25 flex items-center justify-center bg-white shadow-sm"
                  style={{ marginBottom: "24px" }}
                >
                  {item.icon}
                </div>
                <h3
                  className="font-bold text-neutral-900 tracking-wider text-sm"
                  style={{ marginBottom: "12px" }}
                >
                  {item.title}
                </h3>
                <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed font-light max-w-[240px]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BAN LÃNH ĐẠO SECTION ────────────────────────────────── */}
      <section
        className="bg-[#FAFAFA] border-t border-neutral-200/60"
        style={{ padding: "clamp(40px, 5vw, 64px) 0" }}
      >
        <div className="container-gooli">
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-neutral-900 uppercase tracking-widest text-center"
            style={{ marginBottom: "48px" }}
          >
            BAN ĐIỀU HÀNH
          </h2>

          <div
            className="grid grid-cols-1 lg:grid-cols-2 max-w-5xl mx-auto"
            style={{ gap: "32px" }}
          >
            {leaders.map((leader, i) => (
              <div
                key={leader.name}
                className="flex flex-col sm:flex-row border border-neutral-200 bg-white items-start sm:items-center rounded-lg"
                style={{ padding: "24px", gap: "24px" }}
              >
                {/* Profile Silhouette Illustration Box */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-neutral-100 border border-neutral-200 rounded-full flex items-center justify-center relative overflow-hidden select-none">
                  <svg className="w-14 h-14 text-neutral-400 mt-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>

                {/* Biography text */}
                <div className="flex-1">
                  <h4
                    className="text-[11px] font-bold text-[#B06518] uppercase tracking-widest"
                    style={{ marginBottom: "4px" }}
                  >
                    {i === 0 ? "CEO BIOGRAPHY" : "CTO BIOGRAPHY"}
                  </h4>
                  <h3
                    className="text-lg font-bold text-neutral-900 tracking-tight"
                    style={{ marginBottom: "8px" }}
                  >
                    {leader.name} — <span className="text-neutral-500 text-sm font-medium">{leader.role}</span>
                  </h3>
                  <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed font-light">
                    {leader.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DỰ ÁN TIÊU BIỂU SECTION ──────────────────────────────── */}
      <section
        className="bg-[#FAFAFA] border-t border-neutral-200/60"
        style={{ padding: "clamp(40px, 5vw, 64px) 0" }}
      >
        <div className="container-gooli">
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-neutral-900 uppercase tracking-widest text-center"
            style={{ marginBottom: "48px" }}
          >
            SẢN PHẨM NỔI BẬT
          </h2>

          <div
            className="grid grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto"
            style={{ gap: "32px" }}
          >
            {featuredProjects.map((project) => (
              <div key={project.title} className="flex flex-col border border-neutral-200 bg-white group rounded-lg overflow-hidden">
                {/* Bounded image frame */}
                <div className="relative h-56 w-full overflow-hidden bg-neutral-100">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>

                {/* Content details */}
                <div
                  className="flex-1 flex flex-col"
                  style={{ padding: "24px" }}
                >
                  <h3
                    className="font-bold text-neutral-900 tracking-tight text-base group-hover:text-[#B06518] transition-colors duration-200"
                    style={{ marginBottom: "8px" }}
                  >
                    {project.title}
                  </h3>
                  <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed font-light">
                    {project.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THÔNG TIN LIÊN HỆ SECTION ──────────────────────────────── */}
      <section
        className="bg-white border-t border-neutral-100"
        style={{ padding: "clamp(20px, 3vw, 32px) 0" }}
      >
        <div className="container-gooli">
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-neutral-900 uppercase tracking-widest text-center"
            style={{ marginBottom: "20px" }}
          >
            THÔNG TIN LIÊN HỆ
          </h2>

          <div
            className="grid grid-cols-1 lg:grid-cols-3 max-w-6xl mx-auto items-stretch"
            style={{ gap: "20px" }}
          >
            {/* Left: Contact Info — chiếm 2/3, layout ngang */}
            <div
              className="lg:col-span-2 flex border border-neutral-200 bg-[#FAF8F5] rounded-lg"
              style={{ padding: "clamp(16px, 2vw, 24px)" }}
            >
              <div className="flex flex-col sm:flex-row sm:items-stretch w-full" style={{ gap: "24px" }}>
                {/* Sub-left: company name + CTA */}
                <div className="flex-shrink-0 sm:w-52 flex flex-col" style={{ gap: "12px" }}>
                  <span
                    className="text-[10px] font-bold text-[#B06518] uppercase tracking-widest"
                    style={{ display: "block", marginBottom: "4px" }}
                  >
                    Liên hệ với chúng tôi
                  </span>
                  <h3
                    className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight leading-snug"
                    style={{ marginBottom: "0" }}
                  >
                    CÔNG TY TNHH<br />
                    THƯƠNG MẠI<br />
                    SẢN XUẤT GOOLI
                  </h3>
                  <a
                    href="mailto:vatlieuhunghung@gmail.com"
                    className="inline-block hover:bg-[#8C4E10] text-white font-bold text-xs uppercase tracking-widest transition-all duration-200"
                    style={{ padding: "8px 20px", backgroundColor: "#B06518" }}
                  >
                    Gửi Email Ngay
                  </a>
                </div>

                {/* Sub-right: 4 contact items in 2x2 grid */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2" style={{ gap: "16px" }}>
                  {/* Address */}
                  <div className="flex items-start" style={{ gap: "10px" }}>
                    <div className="flex-shrink-0 w-7 h-7 bg-white border border-neutral-200 rounded flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-[#B06518]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest" style={{ marginBottom: "3px" }}>Địa chỉ</p>
                      <p className="text-sm text-neutral-700 font-medium leading-relaxed">
                        Ô đất số 37, Lô đất 3-4 khu tái định cư 3,6ha,<br />
                        Phường Xuân Phương, Hà Nội
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start" style={{ gap: "10px" }}>
                    <div className="flex-shrink-0 w-7 h-7 bg-white border border-neutral-200 rounded flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-[#B06518]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest" style={{ marginBottom: "3px" }}>Hotline</p>
                      <a href="tel:0934119376" className="text-sm text-neutral-700 font-medium hover:text-[#B06518] transition-colors duration-200">
                        0934 119 376
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start" style={{ gap: "10px" }}>
                    <div className="flex-shrink-0 w-7 h-7 bg-white border border-neutral-200 rounded flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-[#B06518]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest" style={{ marginBottom: "3px" }}>Email</p>
                      <a href="mailto:vatlieuhunghung@gmail.com" className="text-sm text-neutral-700 font-medium hover:text-[#B06518] transition-colors duration-200">
                        vatlieuhunghung@gmail.com
                      </a>
                    </div>
                  </div>

                  {/* Tax code */}
                  <div className="flex items-start" style={{ gap: "10px" }}>
                    <div className="flex-shrink-0 w-7 h-7 bg-white border border-neutral-200 rounded flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-[#B06518]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest" style={{ marginBottom: "3px" }}>Mã số thuế</p>
                      <p className="text-sm text-neutral-700 font-medium">0111469615</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Google Maps */}
            <div className="border border-neutral-200 overflow-hidden rounded-lg min-h-[280px] lg:min-h-0">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.4!2d105.742!3d21.052!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDAzJzA3LjIiTiAxMDXCsDQ0JzMxLjIiRQ!5e0!3m2!1svi!2svn!4v1686000000000!5m2!1svi!2svn&q=Ô+đất+số+37,+Lô+3-4+khu+tái+định+cư+3.6ha,+Phường+Xuân+Phương,+Hà+Nội"
                width="100%"
                height="100%"
                style={{ border: 0, display: "block", minHeight: "280px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bản đồ GOOLI Việt Nam - Phường Xuân Phương, Hà Nội"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
