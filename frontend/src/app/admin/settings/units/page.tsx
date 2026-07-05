/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect } from 'react';
import { getUnits, createUnit, updateUnit, deleteUnit } from '@/services/api';

interface Unit {
  id?: number;
  code: string;
  name: string;
  createdAt: string;
}

export default function UnitsPage() {
  const [items, setItems] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('gooli_token') || ''
      : '';

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getUnits(token);
      setItems(data);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const handleOpenCreate = () => {
    setFormData({
      code: '',
      name: '',
    });
    setEditId(null);
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleOpenEdit = (item: Unit) => {
    setFormData({
      code: item.code ?? '',
      name: item.name ?? '',
    });
    setEditId(item.id ?? null);
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      if (editId) {
        await updateUnit(token, editId, formData);
      } else {
        await createUnit(token, formData);
      }
      setShowModal(false);
      loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Có lỗi xảy ra.';
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mục này?')) return;
    try {
      await deleteUnit(token, id);
      loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Xóa thất bại.';
      alert(message);
    }
  };

  const filteredItems = items.filter((item) => {
    const s = search.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(s)) ||
      (item.code && item.code.toLowerCase().includes(s))
    );
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header section with Glassmorphism shadow */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md p-6 rounded-2xl border border-neutral-150/40 dark:border-neutral-800/40 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
            Quản lý Unit
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Thiết lập danh sách và chỉnh sửa thông tin các unit của hệ thống.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-amber-600/10 hover:shadow-amber-600/20 active:scale-95"
        >
          ➕ Thêm Unit
        </button>
      </div>

      {/* Filter and Content section */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã hoặc tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 max-w-md p-3 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600/20 transition-all shadow-sm"
          />
        </div>

        {loading ? (
          <div className="text-center py-20 text-neutral-400 font-semibold bg-white/40 dark:bg-neutral-900/40 border border-neutral-150/40 dark:border-neutral-800/40 rounded-2xl shadow-sm">
            🔄 Đang tải dữ liệu...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 text-neutral-400 font-bold bg-white/40 dark:bg-neutral-900/40 border border-neutral-150/40 dark:border-neutral-800/40 rounded-2xl shadow-sm">
            📭 Chưa có dữ liệu unit nào được tìm thấy.
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-neutral-700 dark:text-neutral-300 text-sm">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-800/40 border-b border-neutral-150 dark:border-neutral-800 text-neutral-500 font-bold uppercase tracking-wider text-xs">
                    <th className="p-3.5">Id</th>
                    <th className="p-3.5">Mã</th>
                    <th className="p-3.5">Tên</th>
                    <th className="p-3.5 text-center w-28">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-150 dark:divide-neutral-800">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors"
                    >
                      <td className="p-3.5">{item.id}</td>
                      <td className="p-3.5 font-mono font-bold text-amber-700 dark:text-amber-500">
                        {item.code}
                      </td>
                      <td className="p-3.5">{item.name}</td>
                      <td className="p-3.5 text-center flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => item.id && handleDelete(item.id)}
                          className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold text-xs rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* CRUD Modal Form (Glassmorphism & Smooth Blur Backdrop) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-2xl shadow-2xl border border-neutral-150 dark:border-neutral-800 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-neutral-150 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-neutral-950 dark:text-neutral-50">
                {editId ? '✏️ Chỉnh sửa' : '➕ Thêm mới'} Unit
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-neutral-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold text-xs border border-red-200 dark:border-red-800 rounded-lg">
                  ⚠️ {errorMsg}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Mã
                  </label>
                  <input
                    type="text"
                    placeholder="Mã"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, code: e.target.value }))
                    }
                    className="w-full p-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none focus:border-amber-600 transition-colors"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Tên
                  </label>
                  <input
                    type="text"
                    placeholder="Tên"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full p-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none focus:border-amber-600 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-150 dark:border-neutral-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold text-xs rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
