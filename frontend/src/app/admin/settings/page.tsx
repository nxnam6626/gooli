"use client";

import React, { useState, useEffect } from "react";
import { 
  Storefront, 
  Sliders, 
  Users, 
  FloppyDisk, 
  CheckCircle, 
  WarningCircle, 
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
  const [activeTab, setActiveTab] = useState<"warehouse" | "parameters" | "users">("warehouse");

  // Form states - Tab 1: Warehouse Info
  const [warehouseName, setWarehouseName] = useState("WMS Global - Kho miền Bắc");
  const [phone, setPhone] = useState("024.3388.9999");
  const [email, setEmail] = useState("khomb@wmsglobal.vn");
  const [address, setAddress] = useState("Lô CN3, Cụm công nghiệp vừa và nhỏ Từ Liêm, Hà Nội");
  const [taxCode, setTaxCode] = useState("0102938475");

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

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("gooli_wms_settings");
    if (savedSettings) {
      try {
        const config = JSON.parse(savedSettings);
        if (config.warehouse) {
          setWarehouseName(config.warehouse.name || "");
          setPhone(config.warehouse.phone || "");
          setEmail(config.warehouse.email || "");
          setAddress(config.warehouse.address || "");
          setTaxCode(config.warehouse.taxCode || "");
        }
        if (config.parameters) {
          setReorderThreshold(Number(config.parameters.reorderThreshold) || 5);
          setDefaultVatRate(Number(config.parameters.defaultVatRate) || 10);
          setCurrencySymbol(config.parameters.currencySymbol || "VNĐ");
        }
      } catch (err) {
        console.error("Failed to parse settings:", err);
      }
    }
  }, []);

  // Save settings to localStorage
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const config = {
      warehouse: { name: warehouseName, phone, email, address, taxCode },
      parameters: { reorderThreshold, defaultVatRate, currencySymbol }
    };
    localStorage.setItem("gooli_wms_settings", JSON.stringify(config));
    
    // Display Toast notification
    setToastMessage("Đã lưu các cấu hình cài đặt hệ thống thành công!");
    setShowToast(true);
  };

  // Close toast automatically after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <div className="space-y-6 font-sans text-xs pb-10">
      {/* Header */}
      <div className="flex justify-between items-center pb-1 border-b border-slate-200 select-none">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Cài đặt hệ thống
          </h1>
          <p className="text-slate-500 mt-1 text-[11px]">
            Cấu hình thông tin kho vận, thiết lập tham số hoạt động và quản lý tài khoản phân quyền.
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border border-slate-200 bg-white p-1 rounded-xl shadow-2xs select-none">
        <button
          onClick={() => setActiveTab("warehouse")}
          className={`flex-1 py-2.5 text-center font-bold text-xs transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer outline-none border-none ${
            activeTab === "warehouse" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Storefront size={16} />
          Thông tin Kho hàng
        </button>
        <button
          onClick={() => setActiveTab("parameters")}
          className={`flex-1 py-2.5 text-center font-bold text-xs transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer outline-none border-none ${
            activeTab === "parameters" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Sliders size={16} />
          Tham số Hệ thống
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex-1 py-2.5 text-center font-bold text-xs transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer outline-none border-none ${
            activeTab === "users" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Users size={16} />
          Tài khoản & Phân quyền
        </button>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <form onSubmit={handleSave} className="p-6">
          {/* TAB 1: Warehouse Config */}
          {activeTab === "warehouse" && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3 select-none">
                <h3 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  Thông tin đại diện kho vận
                </h3>
                <p className="text-slate-400 mt-0.5 text-[10px]">Các thông tin này sẽ được in lên tiêu đề các mẫu Phiếu nhập kho, Phiếu xuất kho.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700">Tên kho hàng / Cửa hàng</label>
                  <input
                    type="text"
                    required
                    value={warehouseName}
                    onChange={(e) => setWarehouseName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700">Mã số thuế</label>
                  <input
                    type="text"
                    required
                    value={taxCode}
                    onChange={(e) => setTaxCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700">Số điện thoại Hotline</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700">Địa chỉ Email liên hệ</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="font-bold text-slate-700">Địa chỉ kho hàng thực tế</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
                  />
                </div>
              </div>
            </div>
          )}

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
              <div className="border-b border-slate-100 pb-3 select-none flex justify-between items-center">
                <div>
                  <h3 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    Tài khoản & Phân quyền truy cập
                  </h3>
                  <p className="text-slate-400 mt-0.5 text-[10px]">Danh sách nhân viên vận hành và phân quyền truy cập hệ thống WMS.</p>
                </div>
              </div>

              {/* Accounts Table */}
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
                <p>Để thêm nhân viên mới hoặc chỉnh sửa mật khẩu và quyền hạn chi tiết, vui lòng chuyển sang phân hệ Quản lý Phân quyền hoặc liên hệ với Bộ phận kỹ thuật để thao tác trên Cơ sở dữ liệu chính.</p>
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
                Lưu cài đặt thay đổi
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Premium Toast Success Notification */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl shadow-lg transition-all duration-300 animate-slide-in select-none">
          <CheckCircle size={18} className="text-emerald-500" />
          <span className="font-bold text-xs">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
