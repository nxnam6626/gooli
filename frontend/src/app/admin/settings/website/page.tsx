"use client";
// <label> accessibility check

import React from "react";
import {
  FloppyDisk,
  CheckCircle
} from "@phosphor-icons/react";

import GeneralTab from "@/features/website-settings/components/general/GeneralTab";
import { useWebsiteSettings } from "@/features/website-settings/hooks/useWebsiteSettings";

export default function WebsiteSettingsPage() {
  const {
    generalSettings,
    setGeneralSettings,
    toast,
    handleSave
  } = useWebsiteSettings();

  return (
    <div className="space-y-6 font-sans text-xs pb-10">
      <div className="flex justify-between items-center pb-1 border-b border-slate-200 select-none">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Quản lý Website Public
          </h1>
          <p className="text-slate-500 mt-1 text-[11px]">
            Cấu hình giao diện và thông tin hiển thị cho trang web công khai của doanh nghiệp.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <form onSubmit={handleSave} className="p-6">
          <GeneralTab
            config={generalSettings}
            onChange={(updates) => setGeneralSettings(prev => ({ ...prev, ...updates }))}
          />

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3 select-none">
            <button
              type="button"
              onClick={() => {
                if (confirm("Xác nhận hủy bỏ mọi chỉnh sửa chưa lưu?")) {
                  window.location.reload();
                }
              }}
              className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl font-bold cursor-pointer text-xs transition-colors shadow-3xs"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors border-none outline-none"
            >
              <FloppyDisk size={16} />
              Lưu cấu hình
            </button>
          </div>
        </form>
      </div>

      {toast.visible && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl shadow-lg transition-all duration-300 animate-slide-in select-none">
          <CheckCircle size={18} className="text-emerald-500" />
          <span className="font-bold text-xs">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
