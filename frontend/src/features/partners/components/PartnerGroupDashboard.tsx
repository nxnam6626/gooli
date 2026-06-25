"use client";

import React from "react";
import {
  UsersThree,
  Storefront,
  Tag,
  Plus,
  PencilSimple,
  Trash,
  Buildings,
  User,
  CaretLeft,
  CaretRight,
  ClipboardText,
  Funnel
} from "@phosphor-icons/react";
import { usePartnerGroupAdmin } from "../hooks/usePartnerGroupAdmin";

export default function PartnerGroupDashboard() {
  const {
    items,
    loading,
    search,
    setSearch,
    totalActivePartners,
    showModal,
    setShowModal,
    editId,
    formData,
    setFormData,
    submitting,
    errorMsg,
    handleOpenCreate,
    handleOpenEdit,
    handleSubmit,
    handleDelete,
    filteredItems,
    calculateAverageDiscount,
  } = usePartnerGroupAdmin();

  const renderPolicyBadges = (policyStr: string | null | undefined) => {
    if (!policyStr) return "-";
    const policies = policyStr.split(",").map((p) => p.trim());
    return (
      <div className="flex flex-wrap gap-1.5">
        {policies.map((p, idx) => {
          const isDiscount = p.toLowerCase().includes("ck") || p.toLowerCase().includes("%");
          return (
            <span
              key={idx}
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                isDiscount
                  ? "bg-emerald-50 border-emerald-150 text-emerald-700"
                  : "bg-slate-100 border-slate-200 text-slate-600"
              }`}
            >
              {p}
            </span>
          );
        })}
      </div>
    );
  };

  const getGroupIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("đại lý")) {
      if (n.includes("2")) return <Storefront size={16} weight="bold" />;
      return <Buildings size={16} weight="bold" />;
    }
    if (n.includes("lẻ")) {
      return <User size={16} weight="bold" />;
    }
    if (n.includes("cung cấp") || n.includes("vật tư")) {
      return <ClipboardText size={16} weight="bold" />;
    }
    return <UsersThree size={16} weight="bold" />;
  };

  const getGroupIconBg = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("đại lý")) {
      return "text-[#2563eb] bg-[#eff6ff]";
    }
    if (n.includes("lẻ")) return "text-slate-550 bg-slate-100";
    if (n.includes("cung cấp") || n.includes("vật tư")) return "text-amber-600 bg-amber-50";
    return "text-blue-600 bg-blue-50";
  };

  return (
    <div className="space-y-6 font-sans antialiased text-slate-800">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý Nhóm Đối tác</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Phân loại và cấu hình chính sách cho các tệp đối tác.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert("Đang mở bộ lọc nâng cao...")}
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
          >
            <Funnel size={16} className="text-slate-600" />
            <span>Bộ lọc</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <Plus size={16} weight="bold" />
            <span>Thêm nhóm mới</span>
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Groups */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <UsersThree size={24} weight="bold" />
          </div>
          <div>
            <div className="text-[10px] font-extrabold text-slate-455 uppercase tracking-wider">
              TỔNG SỐ NHÓM
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1 select-all font-mono">
              {loading ? "..." : items.length}
            </div>
          </div>
        </div>

        {/* Active Partners */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <Storefront size={24} weight="bold" />
          </div>
          <div>
            <div className="text-[10px] font-extrabold text-slate-455 uppercase tracking-wider">
              ĐỐI TÁC ĐANG HĐ
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1 select-all font-mono">
              {loading ? "..." : totalActivePartners.toLocaleString("vi-VN")}
            </div>
          </div>
        </div>

        {/* Average Discount */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
            <Tag size={24} weight="bold" />
          </div>
          <div>
            <div className="text-[10px] font-extrabold text-slate-455 uppercase tracking-wider">
              CHIẾT KHẤU TB
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1 select-all font-mono">
              {loading ? "..." : calculateAverageDiscount()}
            </div>
          </div>
        </div>
      </div>

      {/* FILTER SEARCH */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm nhóm đối tác theo mã, tên hoặc mô tả..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-md p-3 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-[#2563eb] transition-all shadow-2xs font-semibold placeholder-slate-400 text-slate-800"
        />
      </div>

      {/* GROUPS TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="text-center py-24 text-slate-400 font-semibold italic">
            Đang tải danh sách nhóm đối tác...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-16 text-center text-slate-400 font-bold italic">
            Chưa có nhóm đối tác nào được tìm thấy.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-semibold text-slate-700">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-450 uppercase tracking-wider text-[10px] font-extrabold select-none">
                    <th className="py-3.5 px-5">TÊN NHÓM</th>
                    <th className="py-3.5 px-5">THÀNH VIÊN</th>
                    <th className="py-3.5 px-5">MÔ TẢ</th>
                    <th className="py-3.5 px-5">CHÍNH SÁCH / ƯU ĐÃI</th>
                    <th className="py-3.5 px-5 text-center w-28">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${getGroupIconBg(
                              item.name
                            )}`}
                          >
                            {getGroupIcon(item.name)}
                          </div>
                          <div>
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="font-bold text-slate-900 hover:text-[#2563eb] hover:underline cursor-pointer border-none bg-transparent outline-none"
                            >
                              {item.name}
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-bold font-mono text-slate-800">
                        {item._count?.partners ?? 0}
                      </td>
                      <td
                        className="py-3.5 px-5 text-slate-500 font-medium max-w-xs truncate"
                        title={item.description || ""}
                      >
                        {item.description || "-"}
                      </td>
                      <td className="py-3.5 px-5">{renderPolicyBadges(item.policy)}</td>
                      <td className="py-3.5 px-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-[#2563eb] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                            title="Sửa"
                          >
                            <PencilSimple size={15} weight="bold" />
                          </button>
                          <button
                            onClick={() => item.id && handleDelete(item.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                            title="Xóa"
                          >
                            <Trash size={15} weight="bold" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION FOOTER */}
            {!loading && filteredItems.length > 0 && (
              <div className="px-5 py-4 bg-white border-t border-slate-100 flex justify-between items-center text-slate-500 select-none text-xs font-semibold">
                <span>Hiển thị 1-4 của {filteredItems.length} nhóm</span>
                <div className="flex items-center gap-4 text-slate-400">
                  <button
                    disabled
                    className="p-1 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <CaretLeft size={16} weight="bold" />
                  </button>
                  <button
                    disabled
                    className="p-1 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <CaretRight size={16} weight="bold" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* CREATE & EDIT PARTNER GROUP MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl relative text-xs font-semibold text-slate-700 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{editId ? "✏️ Chỉnh sửa nhóm đối tác" : "➕ Thêm nhóm đối tác mới"}</span>
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-6 h-6 rounded-full hover:bg-slate-200/50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors font-bold cursor-pointer border-none bg-transparent"
              >
                ✕
              </button>
            </div>

            {/* Error alerts */}
            {errorMsg && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl font-bold flex gap-2">
                <span>Lỗi: {errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-4">
                {/* Code */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="grp_code"
                    className="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                  >
                    Mã nhóm *
                  </label>
                  <input
                    id="grp_code"
                    type="text"
                    required
                    disabled={!!editId}
                    placeholder="VD: DLY-1, KH-LE, NCC-VT"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="grp_name"
                    className="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                  >
                    Tên nhóm *
                  </label>
                  <input
                    id="grp_name"
                    type="text"
                    required
                    placeholder="VD: Đại lý cấp 1, Khách hàng lẻ..."
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="grp_desc"
                    className="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                  >
                    Mô tả
                  </label>
                  <input
                    id="grp_desc"
                    type="text"
                    placeholder="Nhập mô tả tóm tắt cho nhóm này..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none"
                  />
                </div>

                {/* Policies */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="grp_policy"
                    className="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                  >
                    Chính sách / Ưu đãi
                  </label>
                  <input
                    id="grp_policy"
                    type="text"
                    placeholder="Nhập chính sách, cách nhau bởi dấu phẩy (VD: CK 15%, Freeship >50M)"
                    value={formData.policy}
                    onChange={(e) => setFormData((prev) => ({ ...prev, policy: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none placeholder-slate-450"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4 bg-slate-50/20 -mx-6 -mb-6 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl font-bold cursor-pointer text-xs transition-colors shadow-2xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer disabled:opacity-50 text-xs shadow-sm transition-colors"
                >
                  {submitting ? "Đang lưu..." : "Lưu lại"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
