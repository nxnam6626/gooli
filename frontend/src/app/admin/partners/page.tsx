/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  getPartners, 
  createPartner, 
  updatePartner, 
  deletePartner 
} from '../../../services/api';
import { Partner } from '../../../types';

function PartnersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Read initial type from URL parameter (?type=CUSTOMER or ?type=SUPPLIER)
  const urlType = searchParams.get('type') || ''; 

  const [partners, setPartners] = useState<Partner[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>(urlType);

  // Synchronize component state with URL changes
  useEffect(() => {
    const currentUrlType = searchParams.get('type') || '';
    setSelectedType(currentUrlType);
    setPage(1);
  }, [searchParams]);

  // Modal forms state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'SUPPLIER' as 'SUPPLIER' | 'CUSTOMER',
    phone: '',
    email: '',
    address: '',
    taxCode: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('gooli_token') || '' : '';

  // Load partners
  const loadPartners = async () => {
    setLoading(true);
    try {
      const res = await getPartners(token, {
        page,
        limit: 15,
        search: search || undefined,
        type: selectedType ? (selectedType as 'SUPPLIER' | 'CUSTOMER') : undefined,
      });

      setPartners(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi tải đối tác:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadPartners();
    }
  }, [page, selectedType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadPartners();
  };

  const handleCreateOpen = () => {
    setEditId(null);
    setFormData({
      code: '',
      name: '',
      type: selectedType === 'CUSTOMER' ? 'CUSTOMER' : 'SUPPLIER',
      phone: '',
      email: '',
      address: '',
      taxCode: '',
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleEditOpen = (partner: Partner) => {
    setEditId(partner.id);
    setFormData({
      code: partner.code,
      name: partner.name,
      type: partner.type,
      phone: partner.phone || '',
      email: partner.email || '',
      address: partner.address || '',
      taxCode: partner.taxCode || '',
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    if (!formData.code.trim()) {
      setFormError('Vui lòng nhập mã đối tác.');
      setSubmitting(false);
      return;
    }

    if (!formData.name.trim()) {
      setFormError('Vui lòng nhập tên đối tác/doanh nghiệp.');
      setSubmitting(false);
      return;
    }

    const dataToSend = {
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      type: formData.type,
      phone: formData.phone.trim() || null,
      email: formData.email.trim() || null,
      address: formData.address.trim() || null,
      taxCode: formData.taxCode.trim() || null,
    };

    try {
      if (editId) {
        await updatePartner(editId, dataToSend, token);
      } else {
        await createPartner(dataToSend, token);
      }
      setShowModal(false);
      loadPartners();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lưu đối tác thất bại.';
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa đối tác "${name}"?`)) {
      return;
    }

    try {
      await deletePartner(id, token);
      loadPartners();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Xóa đối tác thất bại.';
      alert(message);
    }
  };

  const handleFilterTypeChange = (type: string) => {
    setSelectedType(type);
    setPage(1);
    
    // Sync URL parameters without full page reload
    const params = new URLSearchParams(window.location.search);
    if (type) {
      params.set('type', type);
    } else {
      params.delete('type');
    }
    router.push(`/admin/partners?${params.toString()}`);
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      
      {/* Page Header (Title + Action Buttons) */}
      <div className="flex justify-between items-center pb-2 select-none border-b border-gray-200">
        <h1 className="text-base font-extrabold text-gray-900 tracking-tight">Đối tác</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateOpen}
            className="px-3.5 py-1.5 bg-[#008b44] hover:bg-[#007036] text-white font-bold rounded flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Thêm mới</span>
          </button>
          
          <button
            onClick={() => alert('Đang mở chức năng Import Excel...')}
            className="px-3.5 py-1.5 bg-[#008b44] hover:bg-[#007036] text-white font-bold rounded flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Import</span>
          </button>

          <button
            onClick={() => alert('Đang xuất danh sách file Excel...')}
            className="px-3.5 py-1.5 bg-[#008b44] hover:bg-[#007036] text-white font-bold rounded flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Xuất file</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="flex flex-col md:flex-row gap-4 items-start">
        
        {/* Left Column: Sidebar Filters */}
        <aside className="w-full md:w-60 shrink-0 space-y-4">
          
          {/* Loai Doi Tac Card */}
          <div className="bg-white border border-gray-200 rounded shadow-sm p-4 space-y-3">
            <h2 className="font-extrabold text-gray-800 border-b border-gray-100 pb-1.5 tracking-tight uppercase select-none">
              Phân loại đối tác
            </h2>
            <div className="space-y-2.5 select-none font-medium text-gray-700">
              <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                <input
                  type="radio"
                  name="partner_filter_type"
                  checked={selectedType === ''}
                  onChange={() => handleFilterTypeChange('')}
                  className="text-[#2f63d4] border-gray-300 focus:ring-[#2f63d4] w-3.5 h-3.5 cursor-pointer"
                />
                <span>Tất cả đối tác</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                <input
                  type="radio"
                  name="partner_filter_type"
                  checked={selectedType === 'CUSTOMER'}
                  onChange={() => handleFilterTypeChange('CUSTOMER')}
                  className="text-[#2f63d4] border-gray-300 focus:ring-[#2f63d4] w-3.5 h-3.5 cursor-pointer"
                />
                <span>Khách hàng</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                <input
                  type="radio"
                  name="partner_filter_type"
                  checked={selectedType === 'SUPPLIER'}
                  onChange={() => handleFilterTypeChange('SUPPLIER')}
                  className="text-[#2f63d4] border-gray-300 focus:ring-[#2f63d4] w-3.5 h-3.5 cursor-pointer"
                />
                <span>Nhà cung cấp</span>
              </label>
            </div>
          </div>

        </aside>

        {/* Right Column: Search bar and Table grid */}
        <div className="flex-1 w-full space-y-3">
          
          {/* Main search bar */}
          <form onSubmit={handleSearchSubmit} className="bg-white border border-gray-200 p-3 rounded shadow-sm flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Theo mã đối tác, tên hoặc số điện thoại..."
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 pl-9 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#2f63d4] transition-colors"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-[#2f63d4] hover:bg-[#1b4cb3] text-white font-bold rounded cursor-pointer transition-colors shadow-sm text-xs"
            >
              Tìm kiếm
            </button>
          </form>

          {/* Partners Table */}
          {loading ? (
            <div className="text-center py-24 text-gray-400 font-semibold bg-white border border-gray-200 rounded shadow-sm">
              Đang tải danh sách đối tác...
            </div>
          ) : partners.length === 0 ? (
            <div className="bg-white border border-gray-200 p-16 text-center text-gray-400 font-bold rounded shadow-sm">
              Không tìm thấy đối tác nào khớp bộ lọc.
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-gray-700">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-extrabold text-[10px]">
                      <th className="p-3 text-center" style={{ width: "40px", minWidth: "40px" }}>
                        <input type="checkbox" className="rounded border-gray-300 w-3 h-3 cursor-pointer" readOnly />
                      </th>
                      <th className="p-3" style={{ width: "120px", minWidth: "120px" }}>Mã đối tác</th>
                      <th className="p-3" style={{ width: "240px", minWidth: "240px" }}>Tên doanh nghiệp / Đối tác</th>
                      <th className="p-3 text-center" style={{ width: "120px", minWidth: "120px" }}>Phân loại</th>
                      <th className="p-3" style={{ width: "130px", minWidth: "130px" }}>Số điện thoại</th>
                      <th className="p-3" style={{ width: "180px", minWidth: "180px" }}>Email liên hệ</th>
                      <th className="p-3" style={{ width: "130px", minWidth: "130px" }}>Mã số thuế</th>
                      <th className="p-3" style={{ minWidth: "220px" }}>Địa chỉ</th>
                      <th className="p-3 text-center" style={{ width: "120px", minWidth: "120px" }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150">
                    {/* SUMMARY ROW */}
                    <tr className="bg-amber-50/60 font-black text-gray-900 border-b border-gray-200 text-[11px]">
                      <td className="p-3 text-center" style={{ width: "40px", minWidth: "40px" }}></td>
                      <td className="p-3 text-emerald-800" style={{ width: "120px", minWidth: "120px" }}>Tổng cộng</td>
                      <td className="p-3 font-bold text-blue-700 font-mono" style={{ width: "240px", minWidth: "240px" }}>
                        {total} đối tác
                      </td>
                      <td className="p-3 text-center" style={{ width: "120px", minWidth: "120px" }}></td>
                      <td className="p-3" style={{ width: "130px", minWidth: "130px" }}></td>
                      <td className="p-3" style={{ width: "180px", minWidth: "180px" }}></td>
                      <td className="p-3" style={{ width: "130px", minWidth: "130px" }}></td>
                      <td className="p-3" style={{ minWidth: "220px" }}></td>
                      <td className="p-3 text-center" style={{ width: "120px", minWidth: "120px" }}></td>
                    </tr>

                    {/* DATA ROWS */}
                    {partners.map((partner) => (
                      <tr key={partner.id} className="hover:bg-blue-50/10 transition-colors text-[11px]">
                        <td className="p-3 text-center" style={{ width: "40px", minWidth: "40px" }}>
                          <input type="checkbox" className="rounded border-gray-300 w-3 h-3 cursor-pointer" readOnly />
                        </td>
                        <td className="p-3 font-bold text-[#008b44] select-all cursor-text" style={{ width: "120px", minWidth: "120px" }}>{partner.code}</td>
                        <td className="p-3 font-bold text-gray-900" style={{ width: "240px", minWidth: "240px" }}>{partner.name}</td>
                        <td className="p-3 text-center" style={{ width: "120px", minWidth: "120px" }}>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${
                            partner.type === 'SUPPLIER'
                              ? 'bg-amber-50 border-amber-200 text-amber-700'
                              : 'bg-blue-50 border-blue-200 text-blue-700'
                          }`}>
                            {partner.type === 'SUPPLIER' ? 'NCC' : 'KHÁCH HÀNG'}
                          </span>
                        </td>
                        <td className="p-3 text-gray-700 font-bold font-mono" style={{ width: "130px", minWidth: "130px" }}>{partner.phone || '-'}</td>
                        <td className="p-3 text-gray-500 font-medium" style={{ width: "180px", minWidth: "180px" }}>{partner.email || '-'}</td>
                        <td className="p-3 text-gray-700 font-bold font-mono" style={{ width: "130px", minWidth: "130px" }}>{partner.taxCode || '-'}</td>
                        <td className="p-3 text-gray-400 max-w-xs truncate" title={partner.address || ''} style={{ minWidth: "220px" }}>
                          {partner.address || '-'}
                        </td>
                        <td className="p-3 text-center" style={{ width: "120px", minWidth: "120px" }}>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditOpen(partner)}
                              className="text-blue-600 hover:underline font-bold cursor-pointer"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(partner.id, partner.name)}
                              className="text-red-500 hover:underline font-bold cursor-pointer"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination footer bar */}
              <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-gray-500 select-none font-bold text-[10px]">
                <span>Tổng số đối tác: {total}</span>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2.5">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(prev => prev - 1)}
                      className={`px-2 py-1 border rounded text-[9px] transition-all font-extrabold ${
                        page === 1
                          ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white'
                          : 'border-gray-300 text-gray-700 hover:border-[#2f63d4] bg-white hover:text-[#2f63d4] cursor-pointer'
                      }`}
                    >
                      PREV
                    </button>
                    <span className="text-gray-700 font-extrabold">Trang {page} / {totalPages}</span>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(prev => prev + 1)}
                      className={`px-2 py-1 border rounded text-[9px] transition-all font-extrabold ${
                        page === totalPages
                          ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white'
                          : 'border-gray-300 text-gray-700 hover:border-[#2f63d4] bg-white hover:text-[#2f63d4] cursor-pointer'
                      }`}
                    >
                      NEXT
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Creation & Editing Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="w-full max-w-lg bg-white border border-gray-200 p-5 rounded shadow-xl relative text-gray-700">
            <div className="flex justify-between items-center mb-4 border-b border-gray-150 pb-2">
              <h2 className="text-xs font-black text-gray-900 uppercase tracking-wide">
                {editId ? `Cập nhật đối tác: ${formData.code}` : `Thêm đối tác ${formData.type === 'SUPPLIER' ? 'NCC' : 'Khách hàng'} mới`}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
              >
                [Đóng]
              </button>
            </div>

            {formError && (
              <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3.5 py-2 text-[11px] rounded">
                [Lỗi]: {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Code */}
                <div>
                  <label htmlFor="modal_code" className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">
                    Mã đối tác (Code - duy nhất)
                  </label>
                  <input
                    id="modal_code"
                    type="text"
                    required
                    disabled={!!editId}
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder={formData.type === 'SUPPLIER' ? 'VD: NCC-GOOLI' : 'VD: KH-ANPHU'}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#2f63d4] disabled:bg-gray-100"
                  />
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="modal_name" className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">
                    Tên đối tác / Doanh nghiệp
                  </label>
                  <input
                    id="modal_name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nhập tên doanh nghiệp..."
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#2f63d4]"
                  />
                </div>

                {/* Partner Type */}
                <div>
                  <label htmlFor="modal_type" className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">
                    Loại đối tác
                  </label>
                  <select
                    id="modal_type"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'SUPPLIER' | 'CUSTOMER' }))}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer font-semibold"
                  >
                    <option value="SUPPLIER">NHÀ CUNG CẤP (SUPPLIER)</option>
                    <option value="CUSTOMER">KHÁCH HÀNG & ĐẠI LÝ (CUSTOMER)</option>
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="modal_phone" className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">
                    Số điện thoại
                  </label>
                  <input
                    id="modal_phone"
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="VD: 0243123456"
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="modal_email" className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">
                    Email liên hệ
                  </label>
                  <input
                    id="modal_email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contact@company.com"
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                </div>

                {/* Tax Code */}
                <div>
                  <label htmlFor="modal_taxcode" className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">
                    Mã số thuế (MST)
                  </label>
                  <input
                    id="modal_taxcode"
                    type="text"
                    value={formData.taxCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, taxCode: e.target.value }))}
                    placeholder="Nhập mã số thuế..."
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none font-semibold"
                  />
                </div>

              </div>

              {/* Address */}
              <div>
                <label htmlFor="modal_address" className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">
                  Địa chỉ doanh nghiệp
                </label>
                <textarea
                  id="modal_address"
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Nhập địa chỉ chi tiết số nhà, phố, tỉnh thành..."
                  className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs focus:outline-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-150 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded font-semibold cursor-pointer text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#2f63d4] hover:bg-[#1b4cb3] text-white rounded font-bold cursor-pointer disabled:opacity-50 text-xs shadow-sm"
                >
                  {submitting ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AdminPartnersPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-24 text-gray-400 font-semibold bg-white border border-gray-200 rounded shadow-sm">
        Đang đồng bộ danh mục đối tác...
      </div>
    }>
      <PartnersContent />
    </Suspense>
  );
}
