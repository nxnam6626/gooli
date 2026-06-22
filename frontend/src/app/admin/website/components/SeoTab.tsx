"use client";

import React from "react";

interface SeoTabProps {
  metaTitle: string;
  setMetaTitle: (val: string) => void;
  metaKeywords: string;
  setMetaKeywords: (val: string) => void;
  metaDescription: string;
  setMetaDescription: (val: string) => void;
}

export default function SeoTab({
  metaTitle,
  setMetaTitle,
  metaKeywords,
  setMetaKeywords,
  metaDescription,
  setMetaDescription
}: SeoTabProps) {
  return (
    <div className="space-y-5">
      <div className="border-b border-slate-100 pb-3 select-none">
        <h3 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider block">Cấu hình SEO & Google Meta</h3>
        <p className="text-slate-400 mt-0.5 text-[10px]">Quản lý thẻ Title và Meta description giúp tối ưu hóa công cụ tìm kiếm Google.</p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-slate-700">Thẻ Meta Title chính</label>
          <input
            type="text"
            required
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-slate-700">Từ khóa Meta Keywords</label>
          <input
            type="text"
            required
            value={metaKeywords}
            onChange={(e) => setMetaKeywords(e.target.value)}
            placeholder="Ngăn cách bằng dấu phẩy"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-slate-700">Thẻ Meta Description</label>
          <textarea
            required
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all h-24 leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
