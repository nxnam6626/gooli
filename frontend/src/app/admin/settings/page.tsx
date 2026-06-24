"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/useToast";
import { 
  Sliders, 
  Users, 
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
  const [activeTab, setActiveTab] = useState<"parameters" | "users">("parameters");

  // Form states - Tab 2: System Parameters
  const [reorderThreshold, setReorderThreshold] = useState(5);
  const [defaultVatRate, setDefaultVatRate] = useState(10);
  const [currencySymbol, setCurrencySymbol] = useState("VNĐ");

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
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({
    ADMIN: { view_finance: true, manage_settings: true, approve_bills: true, create_bills: true, manage_catalog: true },
    ACCOUNTANT: { view_finance: true, manage_settings: false, approve_bills: false, create_bills: true, manage_catalog: true },
    WAREHOUSE_STAFF: { view_finance: false, manage_settings: false, approve_bills: false, create_bills: true, manage_catalog: true }
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    // WMS Config
    const savedSettings = localStorage.getItem("gooli_wms_settings");
    if (savedSettings) {
      try {
        const config = JSON.parse(savedSettings);
        if (config.parameters) {
          setReorderThreshold(Number(config.parameters.reorderThreshold) || 5);
          setDefaultVatRate(Number(config.parameters.defaultVatRate) || 10);
          setCurrencySymbol(config.parameters.currencySymbol || "VNĐ");
        }
      } catch (err) {
        console.error("Failed to parse WMS settings:", err);
      }
    }

    // Role permissions
    const savedPerms = localStorage.getItem("gooli_wms_role_permissions");
    if (savedPerms) {
      try {
        setPermissions(JSON.parse(savedPerms));
      } catch (err) {
        console.error("Failed to parse role permissions:", err);
      }
    }
  }, []);

  // Save settings to localStorage
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save WMS Config
    const wmsConfig = {
      parameters: { reorderThreshold, defaultVatRate, currencySymbol }
    };
    localStorage.setItem("gooli_wms_settings", JSON.stringify(wmsConfig));
    localStorage.setItem("gooli_wms_role_permissions", JSON.stringify(permissions));
    
    showToast("Đã lưu cấu hình hệ thống thành công!");
  };



  return (
    <div className="space-y-6 font-sans text-xs pb-10">
      {/* Header */}
      <div className="flex justify-between items-center pb-1 border-b border-slate-200 select-none">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Cấu hình & Website
          </h1>
          <p className="text-slate-500 mt-1 text-[11px]">
            Quản trị thiết lập kho vận WMS, phân quyền tài khoản, và tùy biến toàn bộ nội dung Website công khai.
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap gap-1 border border-slate-200 bg-white p-1 rounded-xl shadow-2xs select-none">
        <button
          type="button"
          onClick={() => setActiveTab("parameters")}
          className={`flex-1 min-w-[120px] py-2 text-center font-bold text-xs transition-all rounded-lg flex items-center justify-center gap-1.5 cursor-pointer outline-none border-none ${
            activeTab === "parameters" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Sliders size={15} />
          Tham số WMS
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`flex-1 min-w-[120px] py-2 text-center font-bold text-xs transition-all rounded-lg flex items-center justify-center gap-1.5 cursor-pointer outline-none border-none ${
            activeTab === "users" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Users size={15} />
          Tài khoản
        </button>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <form onSubmit={handleSave} className="p-6">



          {/* TAB 2: System Parameters */}
          {activeTab === "parameters" && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3 select-none">
                <h3 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  Tham số cấu hình nghiệp vụ
                </h3>
                <p className="text-slate-400 mt-0.5 text-[10px]">Cài đặt các hằng số tính toán và ngưỡng cảnh báo an toàn trên toàn hệ thống.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-700">Ngưỡng báo tồn kho thấp</label>
                    <span className="text-[10px] text-slate-400 font-semibold italic">Mặc định: 5 đơn vị</span>
                  </div>
                  <input
                    type="number"
                    min={1}
                    required
                    value={reorderThreshold}
                    onChange={(e) => setReorderThreshold(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700">Đơn vị tiền tệ hiển thị</label>
                  <select
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
                  >
                    <option value="VNĐ">Việt Nam Đồng (VNĐ)</option>
                    <option value="USD">Đô la Mỹ (USD)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700">Thuế suất VAT mặc định (%)</label>
                  <select
                    value={defaultVatRate}
                    onChange={(e) => setDefaultVatRate(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
                  >
                    <option value={0}>0% (Không chịu thuế)</option>
                    <option value={5}>5%</option>
                    <option value={8}>8% (Nghị định giảm thuế)</option>
                    <option value={10}>10%</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Accounts List */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3 select-none">
                <h3 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  Tài khoản & Phân quyền truy cập
                </h3>
                <p className="text-slate-400 mt-0.5 text-[10px]">Danh sách nhân viên vận hành và phân quyền truy cập hệ thống WMS.</p>
              </div>

              <div className="rounded-lg border border-slate-200 overflow-hidden select-none">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-4">Tên nhân viên</th>
                      <th className="py-2.5 px-4">Email đăng nhập</th>
                      <th className="py-2.5 px-4">Quyền truy cập</th>
                      <th className="py-2.5 px-4 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {accounts.map(acc => (
                      <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 px-4 font-bold text-slate-900">{acc.name}</td>
                        <td className="py-2.5 px-4 font-mono font-medium text-slate-500">{acc.email}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-750">
                          {acc.role === "ADMIN" ? (
                            <span className="px-2 py-0.5 bg-blue-50 text-[#2563eb] rounded-full border border-blue-100 text-[9px]">Quản trị viên (ADMIN)</span>
                          ) : acc.role === "WAREHOUSE_STAFF" ? (
                            <span className="px-2 py-0.5 bg-slate-50 text-slate-700 rounded-full border border-slate-200 text-[9px]">Thủ kho (WAREHOUSE_STAFF)</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-[9px]">Kế toán (ACCOUNTANT)</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          {acc.status === "ACTIVE" ? (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-[9px] font-bold">Hoạt động</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full border border-rose-100 text-[9px] font-bold">Tạm khóa</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60 flex gap-2 text-[10px] text-slate-500 items-start leading-relaxed select-none">
                <Info size={14} className="text-slate-400 shrink-0 mt-0.5" />
                <p>Để thêm nhân viên mới hoặc chỉnh sửa mật khẩu và quyền hạn chi tiết, vui lòng chuyển đổi quyền của tài khoản trong bảng danh sách ở trên hoặc thiết lập các quyền hạn chi tiết theo vai trò ở bảng bên dưới.</p>
              </div>

              {/* Bảng phân quyền theo vai trò */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 select-none mt-4">
                <div className="border-b border-slate-100 pb-2.5">
                  <h3 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider block">
                    Bảng phân quyền chi tiết theo vai trò
                  </h3>
                  <p className="text-slate-400 mt-0.5 text-[10px]">Tùy chỉnh các quyền truy cập và thao tác nghiệp vụ của từng vai trò hệ thống. Nhấp Lưu cấu hình bên dưới để áp dụng.</p>
                </div>
                
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-4">Quyền truy cập & thao tác</th>
                        <th className="py-2.5 px-4 text-center">ADMIN</th>
                        <th className="py-2.5 px-4 text-center">ACCOUNTANT</th>
                        <th className="py-2.5 px-4 text-center">WAREHOUSE_STAFF</th>
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
                        <tr key={item.key} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-2.5 px-4">
                            <div className="font-bold text-slate-900">{item.name}</div>
                            <div className="text-[10px] text-slate-400 font-semibold">{item.desc}</div>
                          </td>
                          {["ADMIN", "ACCOUNTANT", "WAREHOUSE_STAFF"].map((role) => (
                            <td key={role} className="py-2.5 px-4 text-center">
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
                                className="h-4 w-4 rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb] cursor-pointer disabled:cursor-not-allowed mx-auto"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Footer Save Button */}
          {activeTab !== "users" && (
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors border-none outline-none"
              >
                <FloppyDisk size={16} />
                Lưu cấu hình hệ thống
              </button>
            </div>
          )}
        </form>
      </div>

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
