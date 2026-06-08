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
      title: "SÁNG TẠO",
      desc: "Tiên phong nghiên cứu và ứng dụng giải pháp vật liệu mới, phá vỡ mọi giới hạn thiết kế truyền thống.",
      icon: (
        <svg className="w-8 h-8 text-[#B06518]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5M12 19.5V21M4.5 12H6m12 0h1.5m-13.5-7.5l1.06 1.06m11.38 11.38l1.06 1.06m0-13.5l-1.06 1.06m-11.38 11.38l-1.06 1.06" />
        </svg>
      ),
    },
    {
      title: "CHẤT LƯỢNG",
      desc: "Đảm bảo chất lượng sản phẩm chuẩn quốc tế, kiểm nghiệm khắt khe từng phôi nhôm, nước sơn tĩnh điện.",
      icon: (
        <svg className="w-8 h-8 text-[#B06518]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110.5 21a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0113.5 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      ),
    },
    {
      title: "TẬN TÂM",
      desc: "Đặt khách hàng làm trọng tâm, tư vấn kỹ thuật thực chiến 24/7 từ bản vẽ đến công trường thực tế.",
      icon: (
        <svg className="w-8 h-8 text-[#B06518]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      ),
    },
    {
      title: "HỢP TÁC",
      desc: "Gắn kết và cùng phát triển lâu dài với các nhà thầu, kiến trúc sư, đại lý và đối tác trên cả nước.",
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
      role: "Tổng Giám đốc",
      desc: "Người đặt nền móng kiến tạo hệ giải pháp vật liệu xây dựng đồng bộ GOOLI. Với hơn 15 năm kinh nghiệm điều hành và am hiểu sâu sắc về thị trường nhôm kiến trúc Việt Nam.",
    },
    {
      name: "Trần Văn A",
      role: "Giám đốc Kỹ thuật",
      desc: "Chuyên gia đầu ngành về kết cấu trần nhôm và tấm ốp mặt dựng. Trực tiếp chỉ đạo tư vấn biện pháp thi công cho hàng loạt dự án trọng điểm trên khắp cả nước.",
    },
  ];

  // Projects list
  const featuredProjects = [
    {
      title: "Trần nhôm cao cấp 1",
      desc: "Dự án sảnh tòa nhà văn phòng hiện đại với trần nhôm vân gỗ sang trọng.",
      image: "/projects/project_vna_sanh.png",
    },
    {
      title: "Trần nhôm cao cấp 2",
      desc: "Hệ trần Caro Cell nghệ thuật kết hợp hệ đèn led chiếu sáng âm trần.",
      image: "/projects/project_caro_cell_bg.png",
    },
    {
      title: "Trần nhôm cao cấp 3",
      desc: "Tấm ốp mặt dựng và hệ lam ngoài trời chịu thời tiết khắc nghiệt.",
      image: "/projects/project_sunshade_ams.png",
    },
  ];

  // Partner logo mockup vector generator
  const partnerLogo = (index: number) => {
    const logos = [
      // Logo shapes
      <path key="1" d="M12 2L2 22h20L12 2zm0 4l7 14H5l7-14z" />,
      <path key="2" d="M4 4h16v16H4V4zm2 2v12h12V6H6z" />,
      <path key="3" d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z" />,
      <path key="4" d="M12 2L3 9v11h18V9l-9-7zm7 16H5v-8l7-5.4 7 5.4v8z" />,
      <path key="5" d="M12 2l10 10-10 10L2 12 12 2z" />,
      <path key="6" d="M12 4v16M4 12h16" />,
    ];
    return (
      <svg className="w-10 h-10 text-[#B06518]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        {logos[(index - 1) % logos.length]}
      </svg>
    );
  };

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
        style={{ paddingTop: '100px', paddingBottom: '100px' }}
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
      <section className="about-section-padding bg-white border-t border-neutral-100">
        <div className="container-gooli">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 uppercase tracking-widest text-center mb-12">
            GIÁ TRỊ CỐT LÕI
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {coreValues.map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center p-4 transition-all duration-300 hover:-translate-y-1">
                {/* Circular Icon Accent wrapper */}
                <div className="w-16 h-16 rounded-full border border-[#B06518]/25 flex items-center justify-center bg-white mb-6 shadow-sm">
                  {item.icon}
                </div>
                <h3 className="font-bold text-neutral-900 tracking-wider mb-3 text-sm">
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
      <section className="about-section-padding bg-[#FAFAFA] border-t border-neutral-200/60">
        <div className="container-gooli">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 uppercase tracking-widest text-center mb-12">
            BAN LÃNH ĐẠO
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {leaders.map((leader, i) => (
              <div key={leader.name} className="flex flex-col sm:flex-row border border-neutral-200 bg-white p-6 gap-6 items-start sm:items-center">
                {/* Profile Silhouette Illustration Box */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-neutral-100 border border-neutral-200 rounded-full flex items-center justify-center relative overflow-hidden select-none">
                  <svg className="w-14 h-14 text-neutral-400 mt-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>

                {/* Biography text */}
                <div className="flex-1">
                  <h4 className="text-[11px] font-bold text-[#B06518] uppercase tracking-widest mb-1">
                    {i === 0 ? "CEO BIOGRAPHY" : "CTO BIOGRAPHY"}
                  </h4>
                  <h3 className="text-lg font-bold text-neutral-900 tracking-tight mb-2">
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

      {/* ── LỊCH SỬ PHÁT TRIỂN SECTION ───────────────────────────── */}
      <section className="about-section-padding bg-white border-t border-neutral-100">
        <div className="container-gooli overflow-hidden">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 uppercase tracking-widest text-center mb-12">
            LỊCH SỬ PHÁT TRIỂN
          </h2>

          <div className="max-w-5xl mx-auto px-4 relative pt-6 pb-6">
            {/* Horizontal timeline center bar line */}
            <div className="absolute top-[50%] left-0 right-0 h-[2px] bg-neutral-200 hidden md:block -translate-y-1/2" />

            {/* Alternating elements timeline flow grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">

              {/* Year 2018 (Top content) */}
              <div className="flex flex-col items-center text-center group">
                <div className="md:h-40 flex flex-col justify-end items-center pb-2">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-1">Milestone</span>
                  <p className="text-neutral-500 text-xs leading-relaxed max-w-[195px] font-light mb-3">
                    Khởi đầu từ tổ kỹ sư thiết kế thi công hệ trần nhôm chuyên nghiệp.
                  </p>
                  <div className="w-10 h-10 rounded-full border border-[#B06518]/30 bg-[#FAF8F5] flex items-center justify-center mb-1 text-[#B06518]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21V9m0 12a9 9 0 000-18 9 9 0 000 18z" />
                    </svg>
                  </div>
                  <div className="w-[1px] h-5 bg-neutral-200 hidden md:block" />
                </div>

                {/* Year Node Badge */}
                <div className="bg-[#B06518] text-white px-5 py-1 font-bold text-xs z-20 shadow-sm rounded-[2px] select-none my-2 md:my-0">
                  2018
                </div>

                {/* Spacer below */}
                <div className="md:h-40 hidden md:block" />
              </div>

              {/* Year 2020 (Bottom content) */}
              <div className="flex flex-col items-center text-center group">
                {/* Spacer above */}
                <div className="md:h-40 hidden md:block" />

                {/* Year Node Badge */}
                <div className="bg-[#B06518] text-white px-5 py-1 font-bold text-xs z-20 shadow-sm rounded-[2px] select-none my-2 md:my-0">
                  2020
                </div>

                {/* Content below */}
                <div className="md:h-40 flex flex-col justify-start items-center pt-2">
                  <div className="w-[1px] h-5 bg-neutral-200 mb-1 hidden md:block" />
                  <div className="w-10 h-10 rounded-full border border-[#B06518]/30 bg-[#FAF8F5] flex items-center justify-center mb-3 text-[#B06518]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-1">Milestone</span>
                  <p className="text-neutral-500 text-xs leading-relaxed max-w-[195px] font-light">
                    Nghiên cứu ứng dụng đồng bộ cấu kiện xương treo phụ kiện đi kèm.
                  </p>
                </div>
              </div>

              {/* Year 2022 (Top content) */}
              <div className="flex flex-col items-center text-center group">
                <div className="md:h-40 flex flex-col justify-end items-center pb-2">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-1">Milestone</span>
                  <p className="text-neutral-500 text-xs leading-relaxed max-w-[195px] font-light mb-3">
                    Mở rộng thị phần đại lý và mạng lưới đối tác nhà thầu miền Bắc.
                  </p>
                  <div className="w-10 h-10 rounded-full border border-[#B06518]/30 bg-[#FAF8F5] flex items-center justify-center mb-1 text-[#B06518]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v16.5M21 19.5H3.75M21 5.75L12 14.5l-3.75-3.75L3.75 16" />
                    </svg>
                  </div>
                  <div className="w-[1px] h-5 bg-neutral-200 hidden md:block" />
                </div>

                {/* Year Node Badge */}
                <div className="bg-[#B06518] text-white px-5 py-1 font-bold text-xs z-20 shadow-sm rounded-[2px] select-none my-2 md:my-0">
                  2022
                </div>

                {/* Spacer below */}
                <div className="md:h-40 hidden md:block" />
              </div>

              {/* Year 2024 (Bottom content) */}
              <div className="flex flex-col items-center text-center group">
                {/* Spacer above */}
                <div className="md:h-40 hidden md:block" />

                {/* Year Node Badge */}
                <div className="bg-[#B06518] text-white px-5 py-1 font-bold text-xs z-20 shadow-sm rounded-[2px] select-none my-2 md:my-0">
                  2024
                </div>

                {/* Content below */}
                <div className="md:h-40 flex flex-col justify-start items-center pt-2">
                  <div className="w-[1px] h-5 bg-neutral-200 mb-1 hidden md:block" />
                  <div className="w-10 h-10 rounded-full border border-[#B06518]/30 bg-[#FAF8F5] flex items-center justify-center mb-3 text-[#B06518]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3a2.25 2.25 0 00-2.25-2.25h-.75" />
                    </svg>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-1">Milestone</span>
                  <p className="text-neutral-500 text-xs leading-relaxed max-w-[195px] font-light">
                    Thành lập pháp nhân GOOLI Việt Nam, định vị vật liệu cao cấp chuẩn ISO.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── DỰ ÁN TIÊU BIỂU SECTION ──────────────────────────────── */}
      <section className="about-section-padding bg-[#FAFAFA] border-t border-neutral-200/60">
        <div className="container-gooli">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 uppercase tracking-widest text-center mb-12">
            DỰ ÁN TIÊU BIỂU
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featuredProjects.map((project) => (
              <div key={project.title} className="flex flex-col border border-neutral-200 bg-white group">
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
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-bold text-neutral-900 tracking-tight text-base mb-2 group-hover:text-[#B06518] transition-colors duration-200">
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

      {/* ── ĐỐI TÁC CHÚNG TÔI SECTION ────────────────────────────── */}
      <section className="about-section-padding bg-white border-t border-neutral-100">
        <div className="container-gooli">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 uppercase tracking-widest text-center mb-12">
            ĐỐI TÁC CHÚNG TÔI
          </h2>

          {/* 6x2 Partner Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
            {Array.from({ length: 12 }).map((_, index) => {
              const partnerIndex = index + 1;
              const isFirstRow = partnerIndex <= 6;
              const displayIndex = isFirstRow ? partnerIndex : partnerIndex - 6;

              return (
                <div
                  key={index}
                  className="border border-neutral-200 p-6 flex flex-col items-center justify-center gap-3 bg-[#FAF8F5] transition-all duration-300 hover:border-[#B06518]/50 hover:bg-white hover:shadow-sm select-none"
                >
                  {partnerLogo(displayIndex)}
                  <span className="text-[10px] text-neutral-500 font-bold tracking-widest uppercase">
                    PARTNER {displayIndex}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
