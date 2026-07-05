import React from 'react';
import { Calendar, CaretDown, Truck, Sliders } from '@phosphor-icons/react';

interface Partner {
  id: number;
  name: string;
  code: string;
}

interface ReceiptFiltersProps {
  activeSubTab: 'incoming' | 'completed';
  selectedPartnerId: string | null;
  setSelectedPartnerId: (val: string | null) => void;
  selectedStatus: string | null;
  setSelectedStatus: (val: string | null) => void;
  partners: Partner[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  isDatePickerOpen: boolean;
  setIsDatePickerOpen: (val: boolean) => void;
  tempStartDate: string;
  setTempStartDate: (val: string) => void;
  tempEndDate: string;
  setTempEndDate: (val: string) => void;
  getDateDisplayString: () => string;
}

export default function ReceiptFilters({
  activeSubTab,
  selectedPartnerId,
  setSelectedPartnerId,
  selectedStatus,
  setSelectedStatus,
  partners,
  searchQuery,
  setSearchQuery,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  isDatePickerOpen,
  setIsDatePickerOpen,
  tempStartDate,
  setTempStartDate,
  tempEndDate,
  setTempEndDate,
  getDateDisplayString,
}: ReceiptFiltersProps) {
  return (
    <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-2xs flex flex-wrap gap-4 items-center justify-between">
      <div className="flex flex-wrap items-center gap-3">
        {/* Date range picker */}
        <div className="relative">
          <button
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            className="flex items-center bg-[#f1f5f9] hover:bg-slate-200/70 transition-colors rounded-lg px-3 py-1.5 gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none border-none outline-none"
          >
            <Calendar size={14} className="text-slate-500" />
            <span className="text-[11px]">{getDateDisplayString()}</span>
            <CaretDown
              size={10}
              className="text-slate-500 transition-transform duration-200"
              style={{
                transform: isDatePickerOpen ? 'rotate(180deg)' : 'none',
              }}
            />
          </button>

          {isDatePickerOpen && (
            <>
              {/* Backdrop to close on click outside */}
              <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => setIsDatePickerOpen(false)}
              />
              <div className="absolute top-full left-0 z-50 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg p-4 w-72 space-y-4 text-xs">
                {/* Presets */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1 select-none">
                    Chọn nhanh
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      {
                        label: 'Hôm nay',
                        getValue: () => {
                          const today = new Date().toISOString().split('T')[0];
                          return [today, today];
                        },
                      },
                      {
                        label: 'Hôm qua',
                        getValue: () => {
                          const yesterday = new Date();
                          yesterday.setDate(yesterday.getDate() - 1);
                          const yStr = yesterday.toISOString().split('T')[0];
                          return [yStr, yStr];
                        },
                      },
                      {
                        label: '7 ngày qua',
                        getValue: () => {
                          const end = new Date();
                          const start = new Date();
                          start.setDate(end.getDate() - 7);
                          return [
                            start.toISOString().split('T')[0],
                            end.toISOString().split('T')[0],
                          ];
                        },
                      },
                      {
                        label: 'Tháng này',
                        getValue: () => {
                          return ['2026-06-01', '2026-06-30'];
                        },
                      },
                      {
                        label: 'Tháng trước',
                        getValue: () => {
                          return ['2026-05-01', '2026-05-31'];
                        },
                      },
                      {
                        label: 'Toàn thời gian',
                        getValue: () => {
                          return ['', ''];
                        },
                      },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => {
                          const [s, e] = preset.getValue();
                          setStartDate(s);
                          setEndDate(e);
                          setIsDatePickerOpen(false);
                        }}
                        className="py-1.5 px-2 bg-slate-50 hover:bg-blue-50 hover:text-[#2563eb] text-slate-700 font-bold rounded-lg transition-all text-left cursor-pointer border border-transparent hover:border-blue-200/50 text-[11px]"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Range */}
                <div className="border-t border-slate-100 pt-3 space-y-3">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block select-none">
                    Khoảng ngày tùy chỉnh
                  </span>
                  <div className="space-y-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-500 font-bold">
                        Từ ngày
                      </label>
                      <input
                        type="date"
                        value={tempStartDate}
                        onChange={(e) => setTempStartDate(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 font-bold text-[11px] text-slate-800 focus:outline-none focus:border-[#2563eb] w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-500 font-bold">
                        Đến ngày
                      </label>
                      <input
                        type="date"
                        value={tempEndDate}
                        onChange={(e) => setTempEndDate(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 font-bold text-[11px] text-slate-800 focus:outline-none focus:border-[#2563eb] w-full"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => {
                        setStartDate(tempStartDate);
                        setEndDate(tempEndDate);
                        setIsDatePickerOpen(false);
                      }}
                      className="flex-1 py-1.5 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-center text-xs shadow-2xs shadow-blue-500/10 border-none outline-none"
                    >
                      Áp dụng
                    </button>
                    <button
                      onClick={() => {
                        setTempStartDate(startDate);
                        setTempEndDate(endDate);
                        setIsDatePickerOpen(false);
                      }}
                      className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-lg transition-colors cursor-pointer text-center text-xs shadow-3xs"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Supplier select */}
        <div className="relative flex items-center bg-[#f1f5f9] rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-200/70 transition-colors">
          <Truck size={15} className="text-slate-500 mr-1.5" />
          <select
            value={selectedPartnerId || ''}
            onChange={(e) => {
              setSelectedPartnerId(e.target.value || null);
            }}
            className="bg-transparent border-none outline-none cursor-pointer pr-4 appearance-none text-[11px] font-bold"
          >
            <option value="">Tất cả nhà cung cấp</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <CaretDown
            size={10}
            className="text-slate-500 absolute right-1.5 pointer-events-none"
          />
        </div>

        {/* Status select */}
        {activeSubTab === 'completed' && (
          <div className="relative flex items-center bg-[#f1f5f9] rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-200/70 transition-colors">
            <Sliders size={15} className="text-slate-500 mr-1.5" />
            <select
              value={selectedStatus || ''}
              onChange={(e) => {
                setSelectedStatus(e.target.value || null);
              }}
              className="bg-transparent border-none outline-none cursor-pointer pr-4 appearance-none text-[11px] font-bold"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="APPROVED">Hoàn thành</option>
              <option value="REJECTED">Đã hủy</option>
            </select>
            <CaretDown
              size={10}
              className="text-slate-500 absolute right-1.5 pointer-events-none"
            />
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className="relative w-64 max-w-xs flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm phiếu nhập..."
          className="w-full bg-[#f1f5f9] border-none rounded-lg py-1.5 px-3 text-xs font-semibold text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
        />
      </div>
    </div>
  );
}
