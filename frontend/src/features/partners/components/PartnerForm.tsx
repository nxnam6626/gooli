import React from 'react';
import { CaretDown } from '@phosphor-icons/react';
import type { PartnerGroup } from '../../../types';

interface PartnerFormProps {
  showModal: boolean;
  setShowModal: (s: boolean) => void;
  editId: number | null;
  formData: {
    code: string;
    name: string;
    type: 'SUPPLIER' | 'CUSTOMER';
    phone: string;
    email: string;
    address: string;
    taxCode: string;
    partnerGroupId: string | number;
    discountRate: string | number;
    note: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      code: string;
      name: string;
      type: 'SUPPLIER' | 'CUSTOMER';
      phone: string;
      email: string;
      address: string;
      taxCode: string;
      partnerGroupId: string | number;
      discountRate: string | number;
      note: string;
    }>
  >;
  formError: string | null;
  submitting: boolean;
  groups: PartnerGroup[];
  handleAddGroupInline: () => Promise<void>;
  handleFormSubmit: (e: React.FormEvent) => Promise<void>;
}

export default function PartnerForm({
  showModal,
  setShowModal,
  editId,
  formData,
  setFormData,
  formError,
  submitting,
  groups,
  handleAddGroupInline,
  handleFormSubmit,
}: PartnerFormProps) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4 animate-fade-in">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl relative text-xs font-semibold text-slate-700 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>
              {editId ? '✏️ Cập nhật thông tin đối tác' : '➕ Thêm đối tác mới'}
            </span>
          </h2>
          <button
            onClick={() => setShowModal(false)}
            className="w-6 h-6 rounded-full hover:bg-slate-200/50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors font-bold cursor-pointer border-none outline-none"
          >
            ✕
          </button>
        </div>

        {/* Error alerts */}
        {formError && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl font-bold flex gap-2">
            <span>Lỗi: {formError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Code (ID) */}
            <div>
              <label
                htmlFor="modal_code"
                className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
              >
                Mã đối tác (ID) *
              </label>
              <input
                id="modal_code"
                type="text"
                required
                disabled={!!editId}
                value={formData.code}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    code: e.target.value.toUpperCase(),
                  }))
                }
                placeholder="VD: NCC-ABC"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="modal_name"
                className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
              >
                Tên đối tác *
              </label>
              <input
                id="modal_name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Nhập tên đối tác..."
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="modal_phone"
                className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
              >
                Điện thoại
              </label>
              <input
                id="modal_phone"
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="Nhập SĐT..."
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="modal_email"
                className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
              >
                Email
              </label>
              <input
                id="modal_email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="contact@company.com"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none"
              />
            </div>

            {/* Tax Code */}
            <div>
              <label
                htmlFor="modal_taxcode"
                className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
              >
                Mã số thuế
              </label>
              <input
                id="modal_taxcode"
                type="text"
                value={formData.taxCode}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, taxCode: e.target.value }))
                }
                placeholder="Mã số thuế..."
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none"
              />
            </div>

            {/* Partner Group Selector */}
            <div>
              <label
                htmlFor="modal_group"
                className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
              >
                Nhóm đối tác / Hãng sản xuất
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select
                    id="modal_group"
                    value={formData.partnerGroupId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        partnerGroupId: e.target.value,
                      }))
                    }
                    className="w-full border border-slate-300 bg-white rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none cursor-pointer appearance-none"
                  >
                    <option value="">Chọn nhóm...</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                  <CaretDown
                    size={12}
                    className="text-slate-400 absolute right-3 top-3 pointer-events-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddGroupInline}
                  className="px-2.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold cursor-pointer border-none outline-none transition-colors"
                  title="Thêm nhóm đối tác nhanh"
                >
                  + Thêm
                </button>
              </div>
            </div>

            {/* Discount Rate */}
            <div>
              <label
                htmlFor="modal_discount"
                className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
              >
                Tỷ lệ chiết khấu (%)
              </label>
              <input
                id="modal_discount"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.discountRate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    discountRate: e.target.value,
                  }))
                }
                placeholder="VD: 12.5"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none"
              />
            </div>

            {/* Custom Partner Type Selector (Hidden/Automated) */}
            <div>
              <label
                htmlFor="modal_type"
                className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
              >
                Phân loại đối tác
              </label>
              <div className="relative">
                <select
                  id="modal_type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      type: e.target.value as 'SUPPLIER' | 'CUSTOMER',
                    }))
                  }
                  className="w-full border border-slate-300 bg-white rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="CUSTOMER">
                    Khách hàng & Đại lý (CUSTOMER)
                  </option>
                  <option value="SUPPLIER">Nhà cung cấp (SUPPLIER)</option>
                </select>
                <CaretDown
                  size={12}
                  className="text-slate-400 absolute right-3 top-3 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label
              htmlFor="modal_address"
              className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
            >
              Địa chỉ
            </label>
            <textarea
              id="modal_address"
              rows={2}
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              placeholder="Nhập địa chỉ cụ thể..."
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none placeholder-slate-400"
            />
          </div>

          {/* Ghi chú (Notes) */}
          <div>
            <label
              htmlFor="modal_note"
              className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
            >
              Ghi chú
            </label>
            <textarea
              id="modal_note"
              rows={2}
              value={formData.note}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, note: e.target.value }))
              }
              placeholder="Nhập ghi chú chi tiết..."
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none placeholder-slate-400"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4 bg-slate-50/20 -mx-6 -mb-6 px-6 py-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl font-bold cursor-pointer text-xs transition-colors shadow-2xs"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer disabled:opacity-50 text-xs shadow-sm transition-colors"
            >
              {submitting ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
