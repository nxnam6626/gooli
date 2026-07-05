'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { TabId } from './data';

const TAB_CONTENT: Record<
  TabId,
  { label: string; heading: string; body: string }
> = {
  import: {
    label: 'NHẬP KHẨU & PHÂN PHỐI',
    heading: 'NHÀ NHẬP KHẨU VÀ CUNG CẤP VẬT LIỆU XÂY DỰNG',
    body: 'GOOLI tập trung vào việc tìm kiếm các nguồn cung ứng vật tư chất lượng từ các đối tác sản xuất quốc tế uy tín. Chúng tôi đảm nhận vai trò nhập khẩu, lưu trữ và phân phối số lượng lớn các dòng sản phẩm trần nhôm, tấm ốp, lam sóng thế hệ mới trực tiếp từ các nhà máy sản xuất hàng đầu, tối ưu hóa chi phí trung gian cho các nhà thầu và đại lý.',
  },
  quality: {
    label: 'TIÊU CHUẨN CHẤT LƯỢNG',
    heading: 'KIỂM SOÁT CHẤT LƯỢNG NGUỒN HÀNG ĐẦU VÀO',
    body: 'Mặc dù là doanh nghiệp thương mại mới thành lập, GOOLI cam kết chỉ hợp tác với các nhà sản xuất đạt tiêu chuẩn quốc tế. Từng lô hàng phôi nhôm, nước sơn tĩnh điện đều được kiểm định đầy đủ CO/CQ trước khi xuất xưởng, đảm bảo sản phẩm bàn giao tới công trình luôn đồng nhất và bền bỉ.',
  },
  supply: {
    label: 'TỐI ƯU CUNG ỨNG',
    heading: 'GIẢI PHÁP GIAO HÀNG NHANH & GIÁ CẢ CẠNH TRANH',
    body: 'Chúng tôi tối ưu hóa quy trình lưu kho và vận tải để đảm bảo tiến độ cấp hàng nhanh nhất cho dự án. GOOLI hỗ trợ bóc tách khối lượng vật tư từ bản vẽ để tối ưu hóa đơn hàng nhập khẩu, giảm thiểu hao hụt và cung cấp chính sách giá tốt nhất cho các nhà thầu thi công.',
  },
};

const TAB_ACTIVE_CLASS =
  'bg-white text-[#B06518] shadow-[0_2px_8px_rgba(0,0,0,0.06)] font-extrabold border border-[#B06518]';
const TAB_IDLE_CLASS =
  'text-neutral-500 hover:text-neutral-800 hover:bg-white/40';

export default function AboutOverview() {
  const [activeTab, setActiveTab] = useState<TabId>('import');
  const tab = TAB_CONTENT[activeTab];

  return (
    <section
      id="ve-chung-toi"
      className="bg-[#FAFAFA]"
      style={{ padding: 'clamp(40px, 5vw, 64px) 0' }}
    >
      <div className="container-gooli">
        <h2
          className="text-2xl sm:text-3xl font-extrabold text-neutral-900 uppercase tracking-widest text-center"
          style={{ marginBottom: '48px' }}
        >
          VỀ CHÚNG TÔI
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto">
          <div className="lg:col-span-4 relative min-h-[240px] lg:min-h-[360px] bg-neutral-100 border border-neutral-200 rounded-lg overflow-hidden">
            <Image
              src="/luxury_interior.png"
              alt="Giải pháp trần tường nhôm Gooli"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
          </div>

          <div
            className="lg:col-span-8 border border-neutral-200 bg-white flex flex-col justify-between lg:min-h-[360px] rounded-lg"
            style={{ padding: 'clamp(24px, 4vw, 40px)' }}
          >
            <div
              className="flex p-1.5 gap-2 bg-neutral-100/80 select-none text-[9px] sm:text-xs lg:text-[13px] font-bold uppercase tracking-wider border border-neutral-200/30"
              style={{ borderRadius: '8px' }}
            >
              {(Object.keys(TAB_CONTENT) as TabId[]).map((id) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 py-3 px-3 text-center transition-all duration-300 outline-none cursor-pointer ${activeTab === id ? TAB_ACTIVE_CLASS : TAB_IDLE_CLASS}`}
                  style={{ borderRadius: '6px' }}
                >
                  {TAB_CONTENT[id].label}
                </button>
              ))}
            </div>

            <div
              className="flex-1 flex flex-col justify-between"
              style={{ marginTop: '32px' }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                }}
              >
                <h3 className="text-lg sm:text-xl font-bold text-neutral-900 leading-snug tracking-tight uppercase">
                  {tab.heading}
                </h3>
                <p className="text-neutral-500 text-sm sm:text-base leading-relaxed font-light">
                  {tab.body}
                </p>
              </div>

              <div style={{ marginTop: '40px' }}>
                <Link
                  href="/san-pham"
                  className="inline-block hover:bg-[#8C4E10] text-white font-bold text-xs uppercase tracking-widest active:scale-[0.98] transition-all duration-200 rounded-[2px]"
                  style={{ padding: '12px 32px', backgroundColor: '#B06518' }}
                >
                  Xem thêm sản phẩm
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
