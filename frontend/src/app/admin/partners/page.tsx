/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  getPartners, 
  createPartner, 
  updatePartner, 
  deletePartner,
  getPartnerGroups
} from '../../../services/api';
import { Partner, PartnerGroup } from '../../../types';
import {
  MagnifyingGlass,
  CaretDown,
  UserPlus,
  FileArrowDown,
  PencilSimple,
  Trash,
  Plus,
  ArrowRight,
  ArrowLeft
} from '@phosphor-icons/react';

function PartnersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [partners, setPartners] = useState<Partner[]>([]);
  const [groups, setGroups] = useState<PartnerGroup[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ACTIVE');

  // Modal forms state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'CUSTOMER' as 'SUPPLIER' | 'CUSTOMER',
    phone: '',
    email: '',
    address: '',
    taxCode: '',
    partnerGroupId: '' as string | number,
    discountRate: '' as string | number,
    note: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('gooli_token') || '' : '';

  // Load metadata groups
  const loadGroups = async () => {
    try {
      const data = await getPartnerGroups(token);
      setGroups(data);
    } catch (error) {
      console.error('Lỗi tải nhóm đối tác:', error);
    }
  };

  // Load partners list
  const loadPartners = async () => {
    setLoading(true);
    try {
      const res = await getPartners(token, {
        page,
        limit: 10,
        search: search || undefined,
        partnerGroupId: selectedGroupId ? Number(selectedGroupId) : undefined,
        status: selectedStatus || undefined,
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
      loadGroups();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadPartners();
    }
  }, [page, selectedGroupId, selectedStatus]);

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
      type: 'CUSTOMER',
      phone: '',
      email: '',
      address: '',
      taxCode: '',
      partnerGroupId: '',
      discountRate: '',
      note: '',
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
      partnerGroupId: partner.partnerGroupId || '',
      discountRate: partner.discountRate || '',
      note: partner.note || '',
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

    // Auto-resolve partner type from selected group if possible, or default
    let inferredType = formData.type;
    if (formData.partnerGroupId) {
      const selectedGrp = groups.find(g => g.id === Number(formData.partnerGroupId));
      if (selectedGrp) {
        // In Gooli, NCC code prefix is supplier, others are customer
        if (selectedGrp.code.toUpperCase().includes('NCC') || selectedGrp.name.toLowerCase().includes('cung cấp')) {
          inferredType = 'SUPPLIER';
        } else {
          inferredType = 'CUSTOMER';
        }
      }
    }

    const dataToSend = {
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      type: inferredType,
      phone: formData.phone.trim() || null,
      email: formData.email.trim() || null,
      address: formData.address.trim() || null,
      taxCode: formData.taxCode.trim() || null,
      partnerGroupId: formData.partnerGroupId ? Number(formData.partnerGroupId) : null,
      discountRate: formData.discountRate ? Number(formData.discountRate) : null,
      note: formData.note.trim() || null,
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

  const formatCurrency = (val: number | undefined) => {
    if (val === undefined || val === null) return '0 đ';
    return new Intl.NumberFormat('vi-VN').format(val) + ' đ';
  };

  return (
    <div className="space-y-6 font-sans antialiased text-slate-800">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý Đối tác</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Quản lý thông tin khách hàng, nhà cung cấp và đại lý.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert('Đang mở chức năng Import Excel...')}
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
          >
            <FileArrowDown size={16} className="text-slate-600" />
            <span>Nhập từ Excel</span>
          </button>
          
          <button
            onClick={handleCreateOpen}
            className="px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <UserPlus size={16} weight="bold" />
            <span>Thêm đối tác mới</span>
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
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

      {/* PARTNERS TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="text-center py-24 text-slate-400 font-semibold italic">
            Đang tải danh sách đối tác...
          </div>
        ) : partners.length === 0 ? (
          <div className="p-16 text-center text-slate-400 font-bold italic">
            Không tìm thấy đối tác nào khớp bộ lọc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-semibold text-slate-700">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-extrabold select-none">
                  <th className="py-3 px-4 w-10 text-center">
                    <input type="checkbox" className="rounded border-slate-300 w-3.5 h-3.5 cursor-pointer text-[#2563eb] focus:ring-[#2563eb]/20" readOnly />
                  </th>
                  <th className="py-3 px-4">Mã đối tác</th>
                  <th className="py-3 px-4">Tên đối tác</th>
                  <th className="py-3 px-4">Nhóm đối tác</th>
                  <th className="py-3 px-4">Số điện thoại</th>
                  <th className="py-3 px-4">Công nợ hiện tại</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-center w-28">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {partners.map((partner) => {
                  const debt = Number(partner.totalDebt || 0);
                  return (
                    <tr key={partner.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 text-center">
                        <input type="checkbox" className="rounded border-slate-300 w-3.5 h-3.5 cursor-pointer text-[#2563eb] focus:ring-[#2563eb]/20" readOnly />
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleEditOpen(partner)}
                          className="font-bold text-[#2563eb] hover:underline"
                        >
                          {partner.code}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-slate-900 font-bold max-w-xs truncate">
                        {partner.name}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-600">
                        {partner.partnerGroup?.name || (partner.type === 'SUPPLIER' ? 'Nhà cung cấp' : 'Khách hàng')}
                      </td>
                      <td className="py-3.5 px-4 font-bold font-mono text-slate-700">
                        {partner.phone || '-'}
                      </td>
                      <td className={`py-3.5 px-4 font-bold font-mono ${debt > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                        {formatCurrency(debt)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          partner.isActive
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${partner.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          <span>{partner.isActive ? 'Đang hoạt động' : 'Tạm dừng'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditOpen(partner)}
                            className="p-1 text-[#2563eb] hover:bg-blue-50 rounded transition-colors"
                            title="Sửa thông tin"
                          >
                            <PencilSimple size={15} weight="bold" />
                          </button>
                          <button
                            onClick={() => handleDelete(partner.id, partner.name)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                            title="Xóa đối tác"
                          >
                            <Trash size={15} weight="bold" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION FOOTER */}
        {!loading && partners.length > 0 && (
          <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 text-slate-500 select-none text-[11px] font-bold">
            <span>Hiển thị {((page - 1) * 10) + 1} - {Math.min(page * 10, total)} của {total} đối tác</span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(prev => prev - 1)}
                  className={`p-1.5 border border-slate-300 rounded-lg hover:border-[#2563eb] hover:text-[#2563eb] disabled:opacity-30 disabled:border-slate-200 disabled:text-slate-300 bg-white transition-colors cursor-pointer`}
                >
                  <ArrowLeft size={12} weight="bold" />
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-7 h-7 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                        page === pageNum
                          ? 'bg-[#2563eb] text-white'
                          : 'bg-white border border-slate-300 text-slate-700 hover:border-[#2563eb] hover:text-[#2563eb]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(prev => prev + 1)}
                  className={`p-1.5 border border-slate-300 rounded-lg hover:border-[#2563eb] hover:text-[#2563eb] disabled:opacity-30 disabled:border-slate-200 disabled:text-slate-300 bg-white transition-colors cursor-pointer`}
                >
                  <ArrowRight size={12} weight="bold" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* UPDATE / CREATE PARTNER MODAL DIALOG */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl relative text-xs font-semibold text-slate-700 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{editId ? '✏️ Cập nhật thông tin đối tác' : '➕ Thêm đối tác mới'}</span>
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-6 h-6 rounded-full hover:bg-slate-200/50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors font-bold cursor-pointer"
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
                  <label htmlFor="modal_code" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Mã đối tác (ID) *
                  </label>
                  <input
                    id="modal_code"
                    type="text"
                    required
                    disabled={!!editId}
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="VD: NCC-ABC"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="modal_name" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Tên đối tác *
                  </label>
                  <input
                    id="modal_name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nhập tên đối tác..."
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="modal_phone" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Điện thoại
                  </label>
                  <input
                    id="modal_phone"
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Nhập SĐT..."
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="modal_email" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <input
                    id="modal_email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contact@company.com"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none"
                  />
                </div>

                {/* Tax Code */}
                <div>
                  <label htmlFor="modal_taxcode" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Mã số thuế
                  </label>
                  <input
                    id="modal_taxcode"
                    type="text"
                    value={formData.taxCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, taxCode: e.target.value }))}
                    placeholder="Mã số thuế..."
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none"
                  />
                </div>

                {/* Partner Group Selector */}
                <div>
                  <label htmlFor="modal_group" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Nhóm đối tác
                  </label>
                  <div className="relative">
                    <select
                      id="modal_group"
                      value={formData.partnerGroupId}
                      onChange={(e) => setFormData(prev => ({ ...prev, partnerGroupId: e.target.value }))}
                      className="w-full border border-slate-300 bg-white rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none cursor-pointer appearance-none"
                    >
                      <option value="">Chọn nhóm...</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                    <CaretDown size={12} className="text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Discount Rate */}
                <div>
                  <label htmlFor="modal_discount" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Tỷ lệ chiết khấu (%)
                  </label>
                  <input
                    id="modal_discount"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.discountRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountRate: e.target.value }))}
                    placeholder="VD: 12.5"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none"
                  />
                </div>

                {/* Custom Partner Type Selector (Hidden/Automated) */}
                <div>
                  <label htmlFor="modal_type" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Phân loại đối tác
                  </label>
                  <div className="relative">
                    <select
                      id="modal_type"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'SUPPLIER' | 'CUSTOMER' }))}
                      className="w-full border border-slate-300 bg-white rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none cursor-pointer appearance-none"
                    >
                      <option value="CUSTOMER">Khách hàng & Đại lý (CUSTOMER)</option>
                      <option value="SUPPLIER">Nhà cung cấp (SUPPLIER)</option>
                    </select>
                    <CaretDown size={12} className="text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

              </div>

              {/* Address */}
              <div>
                <label htmlFor="modal_address" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Địa chỉ
                </label>
                <textarea
                  id="modal_address"
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Nhập địa chỉ cụ thể..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none placeholder-slate-400"
                />
              </div>

              {/* Ghi chú (Notes) */}
              <div>
                <label htmlFor="modal_note" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Ghi chú
                </label>
                <textarea
                  id="modal_note"
                  rows={2}
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
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
      )}

    </div>
  );
}

export default function AdminPartnersPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-24 text-slate-400 font-semibold italic bg-white border border-slate-200 rounded-xl shadow-2xs">
        Đang tải trang đối tác...
      </div>
    }>
      <PartnersContent />
    </Suspense>
  );
}
