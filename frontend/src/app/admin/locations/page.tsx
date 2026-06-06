/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect } from 'react';
import { 
  getLocations, 
  createLocation, 
  updateLocation, 
  deleteLocation 
} from '../../../services/api';
import { WarehouseLocation } from '../../../types';

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<WarehouseLocation[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('');

  // Modal forms state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    zone: 'GENERAL',
    row: '',
    shelf: '',
    position: '',
    description: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('gooli_token') || '' : '';

  // Load locations
  const loadLocations = async () => {
    setLoading(true);
    try {
      const res = await getLocations(token, {
        page,
        limit: 15,
        search: search || undefined,
        zone: selectedZone || undefined,
      });

      setLocations(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi tải vị trí kho:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadLocations();
    }
  }, [page, selectedZone]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadLocations();
  };

  const handleCreateOpen = () => {
    setEditId(null);
    setFormData({
      code: '',
      name: '',
      zone: 'GENERAL',
      row: '',
      shelf: '',
      position: '',
      description: '',
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleEditOpen = (location: WarehouseLocation) => {
    setEditId(location.id);
    setFormData({
      code: location.code,
      name: location.name,
      zone: location.zone,
      row: location.row || '',
      shelf: location.shelf || '',
      position: location.position || '',
      description: location.description || '',
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    if (!formData.code.trim()) {
      setFormError('Vui lòng nhập mã vị trí kho.');
      setSubmitting(false);
      return;
    }

    if (!formData.name.trim()) {
      setFormError('Vui lòng nhập tên hiển thị gợi nhớ.');
      setSubmitting(false);
      return;
    }

    const dataToSend = {
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      zone: formData.zone,
      row: formData.row.trim() || null,
      shelf: formData.shelf.trim() || null,
      position: formData.position.trim() || null,
      description: formData.description.trim() || null,
    };

    try {
      if (editId) {
        await updateLocation(editId, dataToSend, token);
      } else {
        await createLocation(dataToSend, token);
      }
      setShowModal(false);
      loadLocations();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lưu vị trí kho thất bại.';
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vị trí kho "${name}"?`)) {
      return;
    }

    try {
      await deleteLocation(id, token);
      loadLocations();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Xóa vị trí kho thất bại. Lưu ý không thể xóa vị trí còn hàng.';
      alert(message);
    }
  };

  // Group locations for the visual grid board
  const visualLocations = {
    GENERAL: locations.filter(l => l.zone === 'GENERAL'),
    ERROR: locations.filter(l => l.zone === 'ERROR'),
    SHIPPING_WAITING: locations.filter(l => l.zone === 'SHIPPING_WAITING'),
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      
      {/* Page Header (Title + Action Buttons) */}
      <div className="flex justify-between items-center pb-2 select-none border-b border-gray-200">
        <h1 className="text-base font-extrabold text-gray-900 tracking-tight">Sơ đồ kho kệ</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateOpen}
            className="px-3.5 py-1.5 bg-[#008b44] hover:bg-[#007036] text-white font-bold rounded flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Khai báo vị trí</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="flex flex-col md:flex-row gap-4 items-start">
        
        {/* Left Column: Sidebar Filters */}
        <aside className="w-full md:w-60 shrink-0 space-y-4">
          
          {/* Khu Vuc Kho Card */}
          <div className="bg-white border border-gray-200 rounded shadow-sm p-4 space-y-3">
            <h2 className="font-extrabold text-gray-800 border-b border-gray-100 pb-1.5 tracking-tight uppercase select-none">
              Phân khu vực kho
            </h2>
            <div className="space-y-2.5 select-none font-medium text-gray-700">
              <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                <input
                  type="radio"
                  name="zone_filter"
                  checked={selectedZone === ''}
                  onChange={() => { setSelectedZone(''); setPage(1); }}
                  className="text-[#2f63d4] border-gray-300 focus:ring-[#2f63d4] w-3.5 h-3.5 cursor-pointer"
                />
                <span>Tất cả khu vực</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                <input
                  type="radio"
                  name="zone_filter"
                  checked={selectedZone === 'GENERAL'}
                  onChange={() => { setSelectedZone('GENERAL'); setPage(1); }}
                  className="text-[#2f63d4] border-gray-300 focus:ring-[#2f63d4] w-3.5 h-3.5 cursor-pointer"
                />
                <span>Kho tổng (GENERAL)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                <input
                  type="radio"
                  name="zone_filter"
                  checked={selectedZone === 'ERROR'}
                  onChange={() => { setSelectedZone('ERROR'); setPage(1); }}
                  className="text-[#2f63d4] border-gray-300 focus:ring-[#2f63d4] w-3.5 h-3.5 cursor-pointer"
                />
                <span>Kho hàng lỗi (ERROR)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                <input
                  type="radio"
                  name="zone_filter"
                  checked={selectedZone === 'SHIPPING_WAITING'}
                  onChange={() => { setSelectedZone('SHIPPING_WAITING'); setPage(1); }}
                  className="text-[#2f63d4] border-gray-300 focus:ring-[#2f63d4] w-3.5 h-3.5 cursor-pointer"
                />
                <span>Chờ xuất (WAITING)</span>
              </label>
            </div>
          </div>

        </aside>

        {/* Right Column: Visual Shelf Map & Table grid */}
        <div className="flex-1 w-full space-y-4">
          
          {/* Visual Shelf Grid Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 select-none">
            
            {/* General Zone Grid */}
            <div className="bg-white border border-gray-200 p-4 rounded shadow-sm">
              <div className="text-xs text-blue-600 uppercase tracking-wider font-extrabold border-b border-gray-100 pb-1.5 mb-2.5 flex justify-between">
                <span>Kho tổng</span>
                <span className="text-[10px] text-gray-400 font-bold">{visualLocations.GENERAL.length} Vị trí</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 max-h-[110px] overflow-y-auto pr-1">
                {visualLocations.GENERAL.map(l => (
                  <div
                    key={l.id}
                    title={`${l.name} (${l.code})`}
                    className="bg-blue-50/50 border border-blue-100 hover:border-blue-300 hover:bg-blue-100 text-[10px] text-center p-1.5 font-bold text-blue-600 rounded transition-all cursor-help"
                  >
                    {l.row && l.shelf ? `${l.row}-${l.shelf.replace('Kệ ', '')}` : l.code.split('-').pop()}
                  </div>
                ))}
                {visualLocations.GENERAL.length === 0 && (
                  <span className="col-span-4 text-center py-4 text-gray-300 text-[10px]">Trống</span>
                )}
              </div>
            </div>

            {/* Error Zone Grid */}
            <div className="bg-white border border-gray-200 p-4 rounded shadow-sm">
              <div className="text-xs text-red-600 uppercase tracking-wider font-extrabold border-b border-gray-100 pb-1.5 mb-2.5 flex justify-between">
                <span>Hàng lỗi</span>
                <span className="text-[10px] text-gray-400 font-bold">{visualLocations.ERROR.length} Vị trí</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 max-h-[110px] overflow-y-auto pr-1">
                {visualLocations.ERROR.map(l => (
                  <div
                    key={l.id}
                    title={`${l.name} (${l.code})`}
                    className="bg-red-50/50 border border-red-100 hover:border-red-300 hover:bg-red-100 text-[10px] text-center p-1.5 font-bold text-red-600 rounded transition-all cursor-help"
                  >
                    {l.code.replace('WH-ERR-', '')}
                  </div>
                ))}
                {visualLocations.ERROR.length === 0 && (
                  <span className="col-span-4 text-center py-4 text-gray-300 text-[10px]">Trống</span>
                )}
              </div>
            </div>

            {/* Waiting Zone Grid */}
            <div className="bg-white border border-gray-200 p-4 rounded shadow-sm">
              <div className="text-xs text-amber-600 uppercase tracking-wider font-extrabold border-b border-gray-100 pb-1.5 mb-2.5 flex justify-between">
                <span>Khu chờ xuất</span>
                <span className="text-[10px] text-gray-400 font-bold">{visualLocations.SHIPPING_WAITING.length} Vị trí</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 max-h-[110px] overflow-y-auto pr-1">
                {visualLocations.SHIPPING_WAITING.map(l => (
                  <div
                    key={l.id}
                    title={`${l.name} (${l.code})`}
                    className="bg-amber-50/50 border border-amber-100 hover:border-amber-300 hover:bg-amber-100 text-[10px] text-center p-1.5 font-bold text-amber-600 rounded transition-all cursor-help"
                  >
                    {l.code.replace('WH-WAIT-', '')}
                  </div>
                ))}
                {visualLocations.SHIPPING_WAITING.length === 0 && (
                  <span className="col-span-4 text-center py-4 text-gray-300 text-[10px]">Trống</span>
                )}
              </div>
            </div>

          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="bg-white border border-gray-200 p-3 rounded shadow-sm flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Theo mã vị trí kho, tên hiển thị..."
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

          {/* Locations Table */}
          {loading ? (
            <div className="text-center py-24 text-gray-400 font-semibold bg-white border border-gray-200 rounded shadow-sm">
              Đang tải danh sách vị trí kho...
            </div>
          ) : locations.length === 0 ? (
            <div className="bg-white border border-gray-200 p-16 text-center text-gray-400 font-bold rounded shadow-sm">
              Không tìm thấy vị trí kho nào khớp bộ lọc.
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-gray-700">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-extrabold text-[10px]">
                      <th className="p-3 w-8 text-center">
                        <input type="checkbox" className="rounded border-gray-300 w-3 h-3 cursor-pointer" readOnly />
                      </th>
                      <th className="p-3">Mã vị trí (Code)</th>
                      <th className="p-3">Tên vị trí gợi nhớ</th>
                      <th className="p-3 text-center">Khu vực (Zone)</th>
                      <th className="p-3">Thông tin hàng kệ</th>
                      <th className="p-3">Mô tả chi tiết</th>
                      <th className="p-3 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150">
                    {/* SUMMARY ROW */}
                    <tr className="bg-amber-50/60 font-black text-gray-900 border-b border-gray-200 text-[11px]">
                      <td className="p-3 text-center"></td>
                      <td className="p-3 text-emerald-800">Tổng cộng</td>
                      <td className="p-3 font-bold text-blue-700 font-mono">
                        {total} vị trí
                      </td>
                      <td className="p-3 text-center"></td>
                      <td className="p-3"></td>
                      <td className="p-3"></td>
                      <td className="p-3 text-center"></td>
                    </tr>

                    {/* DATA ROWS */}
                    {locations.map((loc) => (
                      <tr key={loc.id} className="hover:bg-blue-50/10 transition-colors text-[11px]">
                        <td className="p-3 text-center">
                          <input type="checkbox" className="rounded border-gray-300 w-3 h-3 cursor-pointer" readOnly />
                        </td>
                        <td className="p-3 font-bold text-[#008b44] select-all cursor-text">{loc.code}</td>
                        <td className="p-3 font-bold text-gray-900">{loc.name}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${
                            loc.zone === 'GENERAL'
                              ? 'bg-blue-50 border-blue-100 text-blue-600'
                              : loc.zone === 'ERROR'
                              ? 'bg-red-50 border-red-100 text-red-600'
                              : 'bg-amber-50 border-amber-100 text-amber-600'
                          }`}>
                            {loc.zone}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500 font-mono">
                          {loc.row || loc.shelf || loc.position
                            ? `Dãy: ${loc.row || '-'} | Kệ: ${loc.shelf || '-'} | Ô: ${loc.position || '-'}`
                            : '-'
                          }
                        </td>
                        <td className="p-3 text-gray-400 max-w-xs truncate" title={loc.description || ''}>
                          {loc.description || '-'}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditOpen(loc)}
                              className="text-blue-600 hover:underline font-bold cursor-pointer"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(loc.id, loc.name)}
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
                <span>Tổng số vị trí: {total}</span>
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
                {editId ? `Cập nhật vị trí: ${formData.code}` : 'Khai báo vị trí kho mới'}
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
                    Mã Vị trí (Code - duy nhất)
                  </label>
                  <input
                    id="modal_code"
                    type="text"
                    required
                    disabled={!!editId}
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="VD: WH-GEN-A1-H1"
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#2f63d4] disabled:bg-gray-100"
                  />
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="modal_name" className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">
                    Tên hiển thị gợi nhớ
                  </label>
                  <input
                    id="modal_name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="VD: Kho Tổng - Kệ A1 - Hàng 1"
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                </div>

                {/* Zone Area */}
                <div>
                  <label htmlFor="modal_zone" className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">
                    Khu vực Kho (Zone)
                  </label>
                  <select
                    id="modal_zone"
                    value={formData.zone}
                    onChange={(e) => setFormData(prev => ({ ...prev, zone: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer font-semibold"
                  >
                    <option value="GENERAL">KHO TỔNG (GENERAL)</option>
                    <option value="ERROR">KHO HÀNG LỖI (ERROR)</option>
                    <option value="SHIPPING_WAITING">KHU CHỜ XUẤT (SHIPPING WAIT)</option>
                  </select>
                </div>

                {/* Row */}
                <div>
                  <label htmlFor="modal_row" className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">
                    Dãy (Aisle/Row)
                  </label>
                  <input
                    id="modal_row"
                    type="text"
                    value={formData.row}
                    onChange={(e) => setFormData(prev => ({ ...prev, row: e.target.value }))}
                    placeholder="VD: A1, B2 (Không bắt buộc)"
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#2f63d4]"
                  />
                </div>

                {/* Shelf */}
                <div>
                  <label htmlFor="modal_shelf" className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">
                    Kệ hàng (Rack/Shelf)
                  </label>
                  <input
                    id="modal_shelf"
                    type="text"
                    value={formData.shelf}
                    onChange={(e) => setFormData(prev => ({ ...prev, shelf: e.target.value }))}
                    placeholder="VD: Kệ 1, Kệ 2 (Không bắt buộc)"
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#2f63d4]"
                  />
                </div>

                {/* Position */}
                <div>
                  <label htmlFor="modal_position" className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">
                    Vị trí tầng / hàng (Bin/Position)
                  </label>
                  <input
                    id="modal_position"
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="VD: Tầng 1, Ô 2 (Không bắt buộc)"
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#2f63d4]"
                  />
                </div>

              </div>

              {/* Description */}
              <div>
                <label htmlFor="modal_desc" className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">
                  Mô tả vị trí lưu trữ
                </label>
                <textarea
                  id="modal_desc"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả hướng dẫn xếp hàng..."
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
