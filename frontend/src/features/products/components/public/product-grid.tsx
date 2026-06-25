import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { Product } from '@/types';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-20 text-center border border-dashed border-neutral-300 text-neutral-500 rounded-sm">
        Không tìm thấy sản phẩm nào trong danh mục này.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: "32px" }}>
      {products.map((prod) => {
        const tag = prod.category?.name || "Vật tư";
        
        return (
          <Link
            key={prod.id}
            href={`/san-pham/${prod.slug}`}
            className="group flex flex-col cursor-pointer transition-all duration-300"
          >
            {/* Image Wrapper */}
            <div className="relative aspect-square bg-neutral-100 overflow-hidden rounded-sm" style={{ marginBottom: "16px" }}>
              <Image
                src={prod.imageUrl}
                alt={prod.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              
              {/* Top Right Tag */}
              <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm text-[#333] text-[11px] font-bold px-3 py-1 rounded-full shadow-sm text-center leading-tight">
                <span className="block">Ngoài trời</span>
                <span className="block">{tag}</span>
              </div>

              {/* Bottom Left Logo Watermark */}
              <div className="absolute bottom-3 left-3 w-10 h-10 bg-[#E46C0A] rounded flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
                  <path d="M12 3L2 12h3v8h14v-8h3L12 3zm-1 15h-2v-4h2v4zm4 0h-2v-4h2v4z"/>
                </svg>
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col px-1" style={{ gap: "8px" }}>
              <h3 className="text-[15px] font-bold text-neutral-900 group-hover:text-[#E46C0A] transition-colors leading-snug line-clamp-2">
                {prod.name}
              </h3>
              <div className="flex items-center justify-between" style={{ marginTop: "4px" }}>
                <span className="text-xs text-neutral-500 font-medium tracking-wide">Quy cách: {prod.length || 3000}mm</span>
                <span className="text-xs font-bold text-[#E46C0A] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1 -translate-x-2 group-hover:translate-x-0">
                  Nhận báo giá
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
