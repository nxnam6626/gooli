import React from "react";
import { MagnifyingGlass, CaretDown } from "@phosphor-icons/react";
import type { PartnerGroup } from "../../../types";

interface PartnerFiltersProps {
  search: string;
  setSearch: (s: string) => void;
  selectedGroupId: string;
  setSelectedGroupId: (g: string) => void;
  selectedStatus: string;
  setSelectedStatus: (s: string) => void;
  setPage: (p: number) => void;
  groups: PartnerGroup[];
  handleSearchSubmit: (e: React.FormEvent) => void;
}

export default function PartnerFilters({
  search,
  setSearch,
  selectedGroupId,
  setSelectedGroupId,
  selectedStatus,
  setSelectedStatus,
  setPage,
  groups,
  handleSearchSubmit,
}: PartnerFiltersProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
      <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Search */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Tìm kiếm
          </label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Mã, tên, SĐT đối tác..."
              className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none placeholder-slate-400 transition-colors"
            />
            <MagnifyingGlass size={16} className="text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Group dropdown */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Nhóm đối tác
          </label>
          <div className="relative">
            <select
              value={selectedGroupId}
              onChange={(e) => {
                setSelectedGroupId(e.target.value);
                setPage(1);
              }}
              className="w-full border border-slate-300 bg-white rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none cursor-pointer appearance-none"
            >
              <option value="">Tất cả nhóm</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <CaretDown size={14} className="text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Status dropdown */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Trạng thái
          </label>
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full border border-slate-300 bg-white rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none cursor-pointer appearance-none"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Tạm dừng</option>
            </select>
            <CaretDown size={14} className="text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>
        </div>
      </form>
    </div>
  );
}
