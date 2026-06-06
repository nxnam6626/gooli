'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getProjects } from '@/services/api';
import { Project } from '@/types';

const MOCK_PROJECTS: Project[] = [
  {
    id: 401,
    name: 'Thi công Trần Nhôm Baffle sảnh văn phòng CC1',
    slug: 'thi-cong-tran-nhom-baffle-cc1',
    imageUrl: '/projects/project_caro_cell_bg.png',
    description: 'Hệ trần nhôm sọc thanh dài Baffle tạo điểm nhấn hiện đại, cách âm tốt cho sảnh văn phòng CC1.',
    location: 'Quận Bình Thạnh, TP.HCM',
    isActive: true,
    createdAt: '',
    updatedAt: ''
  },
  {
    id: 402,
    name: 'Tấm ốp nhựa Lam Sóng biệt thự Teak Wood',
    slug: 'tam-op-nhua-lam-song-biet-thu-teak-wood',
    imageUrl: '/projects/project_caro_sunshade.png',
    description: 'Thi công vách tivi và vách đầu giường chất liệu nhựa lam sóng vân gỗ Teak tự nhiên sang trọng.',
    location: 'Dĩ An, Bình Dương',
    isActive: true,
    createdAt: '',
    updatedAt: ''
  },
  {
    id: 403,
    name: 'Lắp đặt Trần Nhôm Clip-in 600x600 Gooli',
    slug: 'lap-dat-tran-nhom-clip-in-600x600',
    imageUrl: '/projects/project_g100_wood_tn.png',
    description: 'Trần nhôm phẳng sơn tĩnh điện đục lỗ tiêu âm kháng khuẩn cho phòng mổ bệnh viện quốc tế.',
    location: 'Quận 2, TP.HCM',
    isActive: true,
    createdAt: '',
    updatedAt: ''
  },
  {
    id: 404,
    name: 'Hệ thống Lam Chắn Nắng hình thoi Sunshade',
    slug: 'he-thong-lam-chan-nang-hinh-thoi-sunshade',
    imageUrl: '/projects/project_sunshade_ams.png',
    description: 'Thi công hệ lam nhôm hình thoi chắn nắng bao bọc toàn bộ hướng tây tòa nhà văn phòng.',
    location: 'Quận Gò Vấp, TP.HCM',
    isActive: true,
    createdAt: '',
    updatedAt: ''
  },
  {
    id: 405,
    name: 'Tấm trần nhựa thả PVC hoa văn sảnh chung cư',
    slug: 'tam-tran-nhua-tha-pvc-sanh-chung-cu',
    imageUrl: '/projects/project_vna_sanh.png',
    description: 'La phông trần nhựa chống thấm nước, tạo họa tiết hoa văn bắt mắt cho lối đi sảnh chung cư.',
    location: 'Quận 7, TP.HCM',
    isActive: true,
    createdAt: '',
    updatedAt: ''
  },
  {
    id: 406,
    name: 'Ốp tường nhựa phẳng Nano căn hộ penthouse',
    slug: 'op-tuong-nhua-phang-nano-penthouse',
    imageUrl: '/luxury_interior.png',
    description: 'Thi công ốp vách ngăn Nano PVC vân đá cẩm thạch cho khu vực ăn phòng khách biệt thự.',
    location: 'Quận 1, TP.HCM',
    isActive: true,
    createdAt: '',
    updatedAt: ''
  }
];

export default function ProjectGallery() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjectsData() {
      try {
        const apiProjects = await getProjects();
        if (apiProjects && apiProjects.length > 0) {
          setProjects(apiProjects);
        } else {
          setProjects(MOCK_PROJECTS);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setProjects(MOCK_PROJECTS);
      } finally {
        setLoading(false);
      }
    }
    fetchProjectsData();
  }, []);

  return (
    <section className="project-gallery-section py-12 bg-neutral-50 dark:bg-neutral-950">
      <div className="container-gooli">
        {/* Title */}
        <div className="flex flex-col items-center text-center mb-10">
          <span className="text-[10px] font-black tracking-widest text-brand-gold uppercase">Thực tế thi công</span>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-neutral-900 dark:text-white uppercase mt-1">
            DỰ ÁN & HÌNH ẢNH THỰC TẾ
          </h2>
          <div className="w-12 h-1 bg-brand-gold mt-3" />
        </div>

        {/* Grid Container */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="group relative h-[280px] overflow-hidden border border-neutral-200 dark:border-neutral-800 rounded-sm bg-neutral-900 shadow-sm"
              >
                {/* Photo */}
                <Image
                  src={proj.imageUrl}
                  alt={proj.name}
                  fill
                  className="object-cover opacity-75 group-hover:opacity-45 transition-all duration-500 group-hover:scale-105"
                />
                
                {/* Color overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 group-hover:from-black/95 group-hover:via-black/75 group-hover:to-black/35 transition-all duration-300" />
                
                {/* Info Text */}
                <div className="absolute inset-0 p-5 flex flex-col justify-end text-white gap-2 transition-transform duration-300">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black tracking-widest text-brand-gold uppercase bg-black/45 px-2 py-0.5 border border-brand-gold/30 self-start">
                      📍 {proj.location || 'Việt Nam'}
                    </span>
                    <h3 className="text-xs md:text-sm font-black tracking-tight text-white uppercase leading-snug mt-1 group-hover:text-brand-gold transition-colors duration-200">
                      {proj.name}
                    </h3>
                  </div>

                  {/* Description appearing on hover */}
                  <p className="text-[10px] text-neutral-300 font-medium leading-relaxed max-h-0 group-hover:max-h-[80px] opacity-0 group-hover:opacity-100 overflow-hidden transition-all duration-500 ease-in-out">
                    {proj.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
