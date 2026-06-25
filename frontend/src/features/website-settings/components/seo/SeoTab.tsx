"use client";

import React from "react";
import { SeoSettings } from "../../hooks/useWebsiteSettings";
import SettingInput from "@/components/ui/SettingInput";

interface SeoTabProps {
  config: SeoSettings;
  onChange: (updates: Partial<SeoSettings>) => void;
}

export default function SeoTab({
  config,
  onChange
}: SeoTabProps) {
  return (
    <div className="space-y-5">
      <div className="border-b border-slate-100 pb-3 select-none">
        <h3 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider block">Cấu hình SEO & Google Meta</h3>
        <p className="text-slate-400 mt-0.5 text-[10px]">Quản lý thẻ Title và Meta description giúp tối ưu hóa công cụ tìm kiếm Google.</p>
      </div>

      <div className="space-y-4">
        <SettingInput
          label="Thẻ Meta Title chính"
          type="text"
          required
          value={config.metaTitle}
          onChange={(e) => onChange({ metaTitle: e.target.value })}
        />

        <SettingInput
          label="Từ khóa Meta Keywords"
          type="text"
          required
          value={config.metaKeywords}
          onChange={(e) => onChange({ metaKeywords: e.target.value })}
          placeholder="Ngăn cách bằng dấu phẩy"
        />

        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-slate-700">Thẻ Meta Description</label>
          <textarea
            required
            value={config.metaDescription}
            onChange={(e) => onChange({ metaDescription: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all h-24 leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
