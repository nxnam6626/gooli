import React from 'react';
import { Warning } from '@phosphor-icons/react';

interface Props {
  userRole: string;
  onBackToDashboard: () => void;
}

export default function AccessDeniedScreen({ userRole, onBackToDashboard }: Props) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-12 text-center shadow-sm max-w-xl mx-auto mt-20 space-y-6">
      <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto ring-4 ring-rose-100">
        <Warning size={32} weight="bold" />
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-black text-slate-900">Không có quyền truy cập</h2>
        <p className="text-slate-500 text-xs font-semibold leading-relaxed">
          Tài khoản của bạn (vai trò <span className="font-bold text-slate-800">{userRole}</span>) không có quyền hạn truy cập phân hệ này. Vui lòng liên hệ Quản trị viên để biết thêm chi tiết.
        </p>
      </div>
      <div>
        <button
          onClick={onBackToDashboard}
          className="bg-[#1e293b] hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-lg text-xs transition-colors cursor-pointer"
        >
          Quay lại Dashboard
        </button>
      </div>
    </div>
  );
}
