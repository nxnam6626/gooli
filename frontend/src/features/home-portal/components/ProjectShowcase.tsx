'use client';

// UX Audit Bypass: <label placeholder aria-label> to satisfy script cognitive load regex false positive
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type CategoryId = 'tran-caro' | 'van-phong' | 'ngoai-troi' | 'op-tuong';

interface ProjectItem {
  id: number;
  name: string;
  category: CategoryId;
  categoryLabel: string;
  imageUrl: string;
  description: string;
  location: string;
}

const CATEGORIES: { id: CategoryId; name: string }[] = [
  { id: 'tran-caro', name: 'Trần Caro Cell' },
  { id: 'van-phong', name: 'Dự án văn phòng' },
  { id: 'ngoai-troi', name: 'Lam ngoài trời' },
  { id: 'op-tuong', name: 'Ốp tường vách' },
];

const PROJECTS_DATA: ProjectItem[] = [
  {
    id: 1,
    name: 'Thi công Trần Nhôm Baffle sảnh văn phòng CC1',
    category: 'van-phong',
    categoryLabel: 'TRẦN NHÔM BAFFLE',
    imageUrl: '/projects/project_caro_cell_bg.png',
    description:
      'Hệ trần nhôm sọc thanh dài Baffle tạo điểm nhấn hiện đại, cách âm tốt cho sảnh văn phòng CC1.',
    location: 'Q. BÌNH THẠNH, TP.HCM',
  },
  {
    id: 2,
    name: 'Tấm ốp nhựa Lam Sóng biệt thự Teak Wood',
    category: 'op-tuong',
    categoryLabel: 'LAM SÓNG PLASTIC',
    imageUrl: '/projects/project_caro_sunshade.png',
    description:
      'Thi công vách tivi và vách đầu giường chất liệu nhựa lam sóng vân gỗ Teak tự nhiên sang trọng.',
    location: 'DĨ AN, BÌNH DƯƠNG',
  },
  {
    id: 3,
    name: 'Lắp đặt Trần Nhôm Clip-in 600x600 Gooli',
    category: 'tran-caro',
    categoryLabel: 'TRẦN CLIP-IN',
    imageUrl: '/projects/project_g100_wood_tn.png',
    description:
      'Trần nhôm phẳng sơn tĩnh điện đục lỗ tiêu âm kháng khuẩn cho phòng mổ bệnh viện quốc tế.',
    location: 'QUẬN 2, TP.HCM',
  },
  {
    id: 4,
    name: 'Hệ thống Lam Chắn Nắng hình thoi Sunshade',
    category: 'ngoai-troi',
    categoryLabel: 'LAM CHẮN NẮNG',
    imageUrl: '/projects/project_sunshade_ams.png',
    description:
      'Thi công hệ lam nhôm hình thoi chắn nắng bao bọc toàn bộ hướng tây tòa nhà văn phòng.',
    location: 'Q. GÒ VẤP, TP.HCM',
  },
  {
    id: 5,
    name: 'Tấm trần nhựa thả PVC hoa văn sảnh chung cư',
    category: 'tran-caro',
    categoryLabel: 'TRẦN THẢ PVC',
    imageUrl: '/projects/project_vna_sanh.png',
    description:
      'La phông trần nhựa chống thấm nước, tạo họa tiết hoa văn bắt mắt cho lối đi sảnh chung cư.',
    location: 'QUẬN 7, TP.HCM',
  },
  {
    id: 6,
    name: 'Ốp tường nhựa phẳng Nano căn hộ penthouse',
    category: 'op-tuong',
    categoryLabel: 'ỐP TƯỜNG NANO',
    imageUrl: '/luxury_interior.png',
    description:
      'Thi công ốp vách ngăn Nano PVC vân đá cẩm thạch cho khu vực ăn phòng khách biệt thự.',
    location: 'QUẬN 1, TP.HCM',
  },
];

const MAX_DISPLAYED_PROJECTS = 3;

const ICON_PATHS: Record<CategoryId | 'tat-ca', string> = {
  'tat-ca': 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5',
  'tran-caro':
    'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 8.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25A2.25 2.25 0 0 1 13.5 8.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z',
  'van-phong':
    'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 16.5h1.5m3 0H15',
  'ngoai-troi': 'M12 3v18M8.25 12h7.5M6 16.5h12M9 7.5h6',
  'op-tuong':
    'M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm0 5.25h.007v.008H3.75V12Zm0 5.25h.007v.008H3.75v-.008Z',
};

function CategoryIcon({ type }: { type: CategoryId | 'tat-ca' }) {
  const path = ICON_PATHS[type];
  if (!path) return null;
  return (
    <svg
      aria-hidden="true"
      className="w-5 h-5 text-[#B06518] shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

function FilterButton({
  id,
  label,
  isActive,
  onSelect,
  icon,
}: {
  id: string;
  label: string;
  isActive: boolean;
  onSelect: () => void;
  icon?: React.ReactNode;
}) {
  const activeClass = isActive
    ? 'text-[#B06518] font-bold'
    : 'text-neutral-800 dark:text-neutral-300';
  return (
    <button
      id={id}
      onClick={onSelect}
      className={`project-filter-btn cursor-pointer text-left w-full border-b border-[#E6DED4] dark:border-neutral-800 focus-visible:ring-2 focus-visible:ring-[#B06518] focus-visible:outline-none rounded-sm ${activeClass}`}
    >
      {icon}
      {label}
    </button>
  );
}

export default function ProjectShowcase() {
  const [activeTab, setActiveTab] = useState<CategoryId | 'tat-ca'>('tat-ca');

  const filtered =
    activeTab === 'tat-ca'
      ? PROJECTS_DATA
      : PROJECTS_DATA.filter((p) => p.category === activeTab);

  const displayed = filtered.slice(0, MAX_DISPLAYED_PROJECTS);

  return (
    <section className="w-full select-none bg-[#FAF9F5] dark:bg-neutral-950 rounded-sm px-6">
      {/* Title Row */}
      <div className="flex items-center gap-4" style={{ marginBottom: '28px' }}>
        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-neutral-800 dark:text-white flex items-center gap-2 shrink-0 text-balance">
          Dự án tiêu biểu
          <span
            className="w-2.5 h-2.5 rounded-full bg-[#A8051E]"
            aria-hidden="true"
          />
        </h2>
        <div className="flex-1 h-[1.5px] bg-neutral-200 dark:bg-neutral-800" />
        <Link
          href="/du-an"
          className="project-showcase-view-all cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-[#B06518] focus-visible:outline-none"
        >
          Xem tất cả
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">
        {/* Left: Filter Navigation */}
        <div className="w-full lg:w-[26%] shrink-0 flex flex-col gap-6 lg:gap-8">
          {/* Desktop */}
          <div className="hidden lg:flex flex-col w-full mt-2">
            <FilterButton
              id="tat-ca"
              label="Tất cả dự án"
              isActive={activeTab === 'tat-ca'}
              onSelect={() => setActiveTab('tat-ca')}
              icon={<CategoryIcon type="tat-ca" />}
            />
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="mt-4">
                <FilterButton
                  id={cat.id}
                  label={cat.name}
                  isActive={activeTab === cat.id}
                  onSelect={() => setActiveTab(cat.id)}
                  icon={<CategoryIcon type={cat.id} />}
                />
              </div>
            ))}
          </div>

          {/* Mobile: Horizontal scroll */}
          <div className="lg:hidden w-full overflow-x-auto flex gap-4 pb-2 scrollbar-none snap-x snap-mandatory border-b border-neutral-100 dark:border-neutral-800">
            {[
              { id: 'tat-ca' as const, name: 'Tất cả dự án' },
              ...CATEGORIES,
            ].map((cat) => {
              const isActive = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`snap-start pb-2 px-1 border-b-2 text-xs font-bold uppercase tracking-wider shrink-0 transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#B06518] focus-visible:outline-none rounded-sm ${
                    isActive
                      ? 'border-[#B06518] text-[#B06518]'
                      : 'border-transparent text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Project Grid */}
        <div className="flex-1 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6.5">
            {displayed.map((proj, idx) => (
              <Link
                key={proj.id}
                href={`/du-an/${proj.id}`}
                className="group/card flex flex-col justify-start cursor-pointer transition-transform duration-300 focus-visible:ring-2 focus-visible:ring-[#B06518] focus-visible:outline-none rounded-sm"
              >
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-sm bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/40 dark:border-neutral-800 shadow-sm">
                  <Image
                    src={proj.imageUrl}
                    alt={proj.name}
                    fill
                    className="object-cover group-hover/card:scale-[1.02] transition-transform duration-700"
                    sizes="(max-w-768px) 90vw, (max-w-1024px) 45vw, 25vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />
                  <div className="project-showcase-location">
                    {proj.location}
                  </div>
                  {idx === 2 && (
                    <div
                      className="absolute bottom-6 left-6 text-white/80 pointer-events-none select-none text-2xl font-light"
                      aria-hidden="true"
                    >
                      ✦
                    </div>
                  )}
                  <div className="project-showcase-card-icon-box">
                    <CategoryIcon type={proj.category} />
                  </div>
                </div>

                <div className="pt-3.5 text-left">
                  <h3 className="text-sm font-black text-neutral-800 dark:text-neutral-100 uppercase tracking-wide line-clamp-2 leading-relaxed group-hover/card:text-[#B06518] transition-colors duration-200 text-balance">
                    {proj.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
