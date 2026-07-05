"use client";

import React, { useState } from "react";
import { useToast } from "@/hooks/useToast";
import { 
  FloppyDisk, 
  CheckCircle, 
  Info 
} from "@phosphor-icons/react";

interface UserAccount {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "ACTIVE" | "INACTIVE";
}

export default function SettingsPage() {
  // Accounts List - Tab 3: Users
  const [accounts] = useState<UserAccount[]>([
    { id: 1, name: "Xuan Nam", email: "admin@gooli.vn", role: "ADMIN", status: "ACTIVE" },
    { id: 2, name: "Nguyễn Văn A", email: "thukho@gooli.vn", role: "WAREHOUSE_STAFF", status: "ACTIVE" },
    { id: 3, name: "Trần Thị B", email: "ketoan@gooli.vn", role: "ACCOUNTANT", status: "ACTIVE" },
    { id: 4, name: "Phạm Văn C", email: "staff@gooli.vn", role: "WAREHOUSE_STAFF", status: "INACTIVE" }
  ]);

  // Toast Notification
  const { toast, showToast } = useToast();

  // Dynamic Role permissions state
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>(() => {
    const defaultPerms = {
      ADMIN: { view_finance: true, manage_settings: true, approve_bills: true, create_bills: true, manage_catalog: true },
      ACCOUNTANT: { view_finance: true, manage_settings: false, approve_bills: false, create_bills: true, manage_catalog: true },
      WAREHOUSE_STAFF: { view_finance: false, manage_settings: false, approve_bills: false, create_bills: true, manage_catalog: true }
    };
    if (typeof window === "undefined") return defaultPerms;
    const savedPerms = localStorage.getItem("gooli_wms_role_permissions");
    if (savedPerms) {
      try {
        return JSON.parse(savedPerms);
      } catch {}
    }
    return defaultPerms;
  });

  // Save settings to localStorage
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("gooli_wms_role_permissions", JSON.stringify(permissions));
    showToast("Đã lưu cấu hình phân quyền thành công!");
  };



  return (
    <div className="space-y-6 font-sans text-xs pb-10">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-200 select-none">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Tài khoản & Phân quyền
          </h1>
          <p className="text-slate-500 mt-1 text-[11px]">
            Quản lý tài khoản nhân viên và phân quyền chi tiết các vai trò trên hệ thống WMS.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Accounts List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 select-none">
            <h3 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
              Tài khoản & Phân quyền truy cập
            </h3>
            <p className="text-slate-400 mt-0.5 text-[10px]">Danh sách nhân viên vận hành và phân quyền truy cập hệ thống WMS.</p>
          </div>

          <div className="rounded-xl border border-slate-200/80 overflow-hidden select-none bg-white">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-bold text-slate-500">Tên nhân viên</th>
                  <th className="py-3 px-4 font-bold text-slate-500">Email đăng nhập</th>
                  <th className="py-3 px-4 font-bold text-slate-500">Quyền truy cập</th>
                  <th className="py-3 px-4 text-center font-bold text-slate-500">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {accounts.map(acc => (
                  <tr key={acc.id} className="hover:bg-slate-50/40 transition-colors duration-150">
                    <td className="py-3 px-4 font-bold text-slate-900">{acc.name}</td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-500">{acc.email}</td>
                    <td className="py-3 px-4">
                      {acc.role === "ADMIN" ? (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md border border-blue-100/50 text-[10px] font-semibold">Quản trị viên (ADMIN)</span>
                      ) : acc.role === "WAREHOUSE_STAFF" ? (
                        <span className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded-md border border-slate-200/50 text-[10px] font-semibold">Thủ kho (WAREHOUSE_STAFF)</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100/50 text-[10px] font-semibold">Kế toán (ACCOUNTANT)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {acc.status === "ACTIVE" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50/70 text-emerald-700 rounded-md border border-emerald-100/60 text-[10px] font-semibold">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-50/70 text-rose-700 rounded-md border border-rose-100/60 text-[10px] font-semibold">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
                          Tạm khóa
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50/40 border border-blue-100/60 p-4 rounded-xl flex gap-3 text-[11px] text-slate-600 items-start leading-relaxed shadow-3xs">
            <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="font-medium">
              Để thêm nhân viên mới hoặc chỉnh sửa mật khẩu và quyền hạn chi tiết, vui lòng chuyển đổi quyền của tài khoản trong bảng danh sách ở trên hoặc thiết lập các quyền hạn chi tiết theo vai trò ở bảng bên dưới.
            </p>
          </div>
        </div>

        {/* Card 2: Permissions Matrix */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4 select-none">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider block">
              Bảng phân quyền chi tiết theo vai trò
            </h3>
            <p className="text-slate-400 mt-0.5 text-[10px]">Tùy chỉnh các quyền truy cập và thao tác nghiệp vụ của từng vai trò hệ thống. Nhấp Lưu cấu hình bên dưới để áp dụng.</p>
          </div>
          
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-bold text-slate-500">Quyền truy cập & thao tác</th>
                  <th className="py-3 px-4 text-center font-bold text-slate-500">ADMIN</th>
                  <th className="py-3 px-4 text-center font-bold text-slate-500">ACCOUNTANT</th>
                  <th className="py-3 px-4 text-center font-bold text-slate-500">WAREHOUSE_STAFF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {[
                  { key: "view_finance", name: "Xem Báo cáo tài chính & Sổ quỹ", desc: "Xem dòng tiền, phiếu thu/chi và báo cáo công nợ trên Dashboard" },
                  { key: "manage_settings", name: "Cấu hình hệ thống & Website", desc: "Quản lý cài đặt kho hàng và trang giới thiệu public" },
                  { key: "approve_bills", name: "Duyệt / Từ chối phiếu nhập & xuất", desc: "Duyệt các chứng từ nhập kho hoặc xuất kho bán hàng" },
                  { key: "create_bills", name: "Tạo mới phiếu nhập & xuất kho", desc: "Tạo phiếu nhập hoặc phiếu xuất kho ở trạng thái Chờ duyệt" },
                  { key: "manage_catalog", name: "Xem & Quản lý Sản phẩm / Đối tác", desc: "Quản lý danh sách hàng hóa và thông tin khách hàng, nhà cung cấp" }
                ].map((item) => (
                  <tr key={item.key} className="hover:bg-slate-50/40 transition-colors duration-150">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-xs">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{item.desc}</div>
                    </td>
                    {["ADMIN", "ACCOUNTANT", "WAREHOUSE_STAFF"].map((role) => (
                      <td key={role} className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={permissions[role]?.[item.key] || false}
                          disabled={role === "ADMIN"} // Admin always has all permissions
                          onChange={(e) => {
                            setPermissions((prev) => ({
                              ...prev,
                              [role]: {
                                ...prev[role],
                                [item.key]: e.target.checked
                              }
                            }));
                          }}
                          aria-label={`Quyền ${item.name} cho vai trò ${role}`}
                          className="h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Save Button */}
        <div className="flex justify-end pt-2 select-none">
          <button
            type="submit"
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md transition-all active:scale-[0.98] border-none outline-none"
          >
            <FloppyDisk size={16} />
            Lưu cấu hình hệ thống
          </button>
        </div>
      </form>

      {/* Premium Toast Success Notification */}
      {toast.visible && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl shadow-lg transition-all duration-300 animate-slide-in select-none">
          <CheckCircle size={18} className="text-emerald-500" />
          <span className="font-bold text-xs">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
