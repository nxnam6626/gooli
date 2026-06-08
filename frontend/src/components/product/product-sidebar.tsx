import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ProductSidebarProps {
  product: any;
}

export default function ProductSidebar({ product }: ProductSidebarProps) {
  return (
    <div className="custom-col-right custom-sticky flex flex-col" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Box: Báo giá & Tư vấn */}
      <div className="border border-[#bc6f21] rounded-md bg-white shadow-sm overflow-hidden sticky" style={{ top: '24px' }}>
        <div className="bg-[#bc6f21] text-white text-center font-bold uppercase text-sm tracking-widest" style={{ padding: '16px 0' }}>
          Liên hệ Báo giá
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button className="bg-[#1a1a1a] hover:bg-black transition-colors text-white rounded-md flex items-center justify-center shadow-sm" style={{ width: '100%', height: '48px' }}>
              <span className="text-sm font-bold uppercase tracking-wide">Yêu Cầu Báo Giá</span>
            </button>
            <button className="bg-transparent hover:bg-neutral-50 transition-colors text-neutral-900 border border-neutral-900 rounded-md flex items-center justify-center shadow-sm" style={{ width: '100%', height: '48px' }}>
              <span className="text-sm font-bold uppercase tracking-wide">Gọi: 0934 119 376</span>
            </button>
          </div>

          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wide text-center" style={{ marginBottom: '16px' }}>Hoặc để lại số điện thoại</h3>
            <div className="relative flex border border-neutral-300 rounded-md bg-white overflow-hidden shadow-sm hover:border-[#bc6f21] transition-colors" style={{ display: 'flex' }}>
              <input type="text" placeholder="Số ĐT của bạn..." className="outline-none text-sm text-neutral-800" style={{ flex: 1, padding: '12px', minWidth: '0' }} />
              <button className="font-bold text-white bg-[#bc6f21] hover:bg-[#a65d1b] transition-colors text-sm uppercase tracking-widest" style={{ padding: '0 16px' }}>
                Gửi
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Box 3: Sản Phẩm Đã Xem */}
      <div className="border border-neutral-200 rounded-md bg-white shadow-sm overflow-hidden">
        <div className="bg-[#1a1a1a] text-white text-center font-bold uppercase text-sm tracking-widest" style={{ padding: '12px 0' }}>
          Sản phẩm đã xem
        </div>
        <div style={{ padding: '16px' }}>
          <Link href="#" className="flex items-center group" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="relative bg-neutral-100 shrink-0 rounded-md overflow-hidden border border-neutral-200" style={{ width: '64px', height: '64px' }}>
              <Image src="/luxury_interior.png" alt="Recent" fill className="object-cover" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-800 group-hover:text-[#bc6f21] transition-colors leading-tight" style={{ marginBottom: '4px' }}>{product.name}</h4>
              <div className="text-sm font-bold text-[#bc6f21]">Liên hệ</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
