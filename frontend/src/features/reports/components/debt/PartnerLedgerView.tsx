import React from 'react';
import { ArrowLeft, Calendar, Printer } from '@phosphor-icons/react';
import { fmt, fmtDateRange } from '../../utils';
import type { Partner, LedgerReport } from '../../types';

interface Props {
  partner: Partner;
  ledgerReport: LedgerReport;
  startDate: string;
  endDate: string;
  setStartDate: (v: string) => void;
  setEndDate: (v: string) => void;
  onBack: () => void;
  onPrint: () => void;
}

export default function PartnerLedgerView({
  partner, ledgerReport, startDate, endDate, setStartDate, setEndDate, onBack, onPrint,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
      {/* Sidebar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4 no-print col-span-1">
        <button
          onClick={onBack}
          className="w-full py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-3xs"
        >
          <ArrowLeft size={14} weight="bold" />
          Trở lại danh sách
        </button>

        <h3 className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider flex items-center gap-1.5 border-t border-slate-100 pt-3 select-none">
          <Calendar size={14} />
          Bộ lọc đối soát
        </h3>

        <div className="space-y-2">
          {[
            { label: 'Từ ngày', value: startDate, onChange: setStartDate },
            { label: 'Đến ngày', value: endDate, onChange: setEndDate },
          ].map((field) => (
            <div key={field.label} className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold">{field.label}</label>
              <input
                type="date"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-[11px] font-bold focus:outline-none focus:border-[#2563eb] bg-slate-50"
              />
            </div>
          ))}
        </div>

        <button
          onClick={onPrint}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
        >
          <Printer size={16} />
          In sổ đối soát công nợ
        </button>
      </div>

      {/* Ledger */}
      <div className="col-span-1 md:col-span-3">
        <div id="print-area" className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
          {/* Print header */}
          <div className="text-center space-y-1 pb-4 border-b border-slate-100">
            <h2 className="text-sm font-black text-slate-900 tracking-wider">
              SỔ CHI TIẾT ĐỐI SOÁT CÔNG NỢ ĐỐI TÁC
            </h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">
              {startDate ? `Từ ngày: ${fmtDateRange(startDate)}` : ''}
              {endDate ? ` Đến ngày: ${fmtDateRange(endDate)}` : ''}
              {!startDate && !endDate ? 'Tất cả thời gian' : ''}
            </p>
          </div>

          {/* Partner info */}
          <div className="grid grid-cols-2 gap-4 text-[11px] text-slate-600">
            <div>
              <div className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">Thông tin đối tác:</div>
              <div className="mt-1.5 font-bold text-slate-900 text-xs">{partner.name}</div>
              <div className="mt-0.5">
                Mã đối tác: <span className="font-mono font-bold text-slate-800">{partner.code}</span>
              </div>
              <div>
                Phân loại:{' '}
                <span className="font-bold text-slate-800">
                  {partner.type === 'CUSTOMER' ? 'Khách hàng' : 'Nhà cung cấp'}
                </span>
              </div>
            </div>
            <div className="text-right flex flex-col justify-end">
              <div>Điện thoại: <span className="font-bold text-slate-800">{partner.phone || 'N/A'}</span></div>
              <div>Địa chỉ: <span className="font-bold text-slate-800">{partner.address || 'N/A'}</span></div>
              <div className="font-extrabold mt-1.5 text-slate-900 text-xs">
                Nợ hiện tại: {fmt(partner.totalDebt || 0)}đ
              </div>
            </div>
          </div>

          {/* Ledger table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  {['Ngày ghi sổ', 'Số chứng từ', 'Diễn giải / Ghi chú', 'Phát sinh Tăng (+)', 'Phát sinh Giảm (-)', 'Dư nợ lũy kế'].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`py-2.5 px-3 ${i < 5 ? 'border-r border-slate-200' : ''} ${i >= 3 ? 'text-right' : ''}`}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {/* Opening balance */}
                <tr className="bg-slate-50/35 font-bold italic">
                  <td className="py-2 px-3 border-r border-slate-100 text-slate-400">Đầu kỳ</td>
                  <td className="py-2 px-3 border-r border-slate-100 text-slate-400">—</td>
                  <td className="py-2 px-3 border-r border-slate-100">Dư nợ đầu kỳ báo cáo</td>
                  <td className="py-2 px-3 text-right border-r border-slate-100">—</td>
                  <td className="py-2 px-3 text-right border-r border-slate-100">—</td>
                  <td className="py-2 px-3 text-right font-extrabold text-slate-900">{fmt(ledgerReport.openingBalance)}đ</td>
                </tr>

                {/* Entries */}
                {ledgerReport.entries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 italic font-semibold">
                      Không có giao dịch phát sinh trong kỳ báo cáo này.
                    </td>
                  </tr>
                ) : (
                  (() => {
                    let running = ledgerReport.openingBalance;
                    return ledgerReport.entries.map((entry, idx) => {
                      running += entry.debit - entry.credit;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-2 px-3 border-r border-slate-100 text-slate-500">
                            {entry.date.toLocaleDateString('vi-VN')}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-100 font-mono font-bold text-slate-800">{entry.code}</td>
                          <td className="py-2 px-3 border-r border-slate-100 text-slate-600 max-w-[200px] truncate" title={entry.description}>
                            {entry.description}
                          </td>
                          <td className="py-2 px-3 text-right border-r border-slate-100 font-bold text-emerald-600">
                            {entry.debit > 0 ? `+${fmt(entry.debit)}đ` : '—'}
                          </td>
                          <td className="py-2 px-3 text-right border-r border-slate-100 font-bold text-rose-600">
                            {entry.credit > 0 ? `-${fmt(entry.credit)}đ` : '—'}
                          </td>
                          <td className="py-2 px-3 text-right font-extrabold text-slate-950">{fmt(running)}đ</td>
                        </tr>
                      );
                    });
                  })()
                )}

                {/* Totals */}
                <tr className="bg-slate-50 border-t border-slate-200 font-extrabold text-slate-900 text-[12px]">
                  <td className="py-3 px-3 border-r border-slate-200">Tổng cộng</td>
                  <td className="py-3 px-3 border-r border-slate-200">—</td>
                  <td className="py-3 px-3 border-r border-slate-200">Số dư nợ cuối kỳ báo cáo</td>
                  <td className="py-3 px-3 text-right border-r border-slate-200 text-emerald-700">+{fmt(ledgerReport.totalDebit)}đ</td>
                  <td className="py-3 px-3 text-right border-r border-slate-200 text-rose-700">-{fmt(ledgerReport.totalCredit)}đ</td>
                  <td className="py-3 px-3 text-right bg-slate-100 font-black">{fmt(ledgerReport.closingBalance)}đ</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Print signature */}
          <div className="pt-12 hidden print:grid grid-cols-2 text-center text-xs">
            {['ĐẠI DIỆN ĐỐI TÁC', 'KẾ TOÁN CÔNG NỢ'].map((role) => (
              <div key={role}>
                <div className="font-bold text-gray-800">{role}</div>
                <div className="text-[10px] text-gray-400 mt-1 italic">(Ký, ghi rõ họ tên)</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
