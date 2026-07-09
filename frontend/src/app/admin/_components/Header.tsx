import React from 'react';
import { useRouter } from 'next/navigation';
import { Bell, ClockCounterClockwise } from '@phosphor-icons/react';

export default function Header() {
  const router = useRouter();

  return (
    <header className="h-[70px] bg-white border-b border-[#e2e8f0] flex items-center justify-between px-8 z-20">
      <div className="flex items-center"></div>

      <div className="flex items-center gap-6">
        {/* POS Button */}
        <button
          onClick={() => router.push('/admin/products')}
          className="bg-[#2563eb] text-white hover:bg-blue-700 font-bold px-5 py-2.5 rounded-lg text-xs tracking-wide transition-colors cursor-pointer shadow-sm shadow-blue-500/10"
        >
          Bán hàng (POS)
        </button>

        {/* Notification Bell */}
        <button className="relative text-[#64748b] hover:text-[#1e293b] transition-colors p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
          <Bell size={22} weight="bold" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* History Link */}
        <button
          className="text-[#64748b] hover:text-[#1e293b] transition-colors p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer"
          title="Lịch sử hoạt động"
        >
          <ClockCounterClockwise size={22} weight="bold" />
        </button>

        {/* Profile Summary */}
        <div className="flex items-center gap-3 pl-4 border-l border-[#e2e8f0]">
          <div className="flex flex-col text-right">
            <span className="text-xs font-extrabold text-[#1e293b] leading-tight">
              Gooli Admin
            </span>
          </div>
          <div className="w-9 h-9 rounded-full overflow-hidden border border-[#cbd5e1] shadow-inner bg-[#f1f5f9] flex items-center justify-center text-xs font-bold text-slate-700">
            GA
          </div>
        </div>
      </div>
    </header>
  );
}
