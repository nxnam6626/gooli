/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect } from 'react';
import { 
  getProducts, 
  getCategories, 
  createProduct, 
  updateProduct, 
  deleteProduct
} from '../../../services/api';
import { Product, Category } from '../../../types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [categorySearch, setCategorySearch] = useState('');
  const [selectedProductType, setSelectedProductType] = useState('NORMAL'); // NORMAL, SERIAL, etc.

  // Modal forms state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    categoryId: 0,
    sku: '',
    name: '',
    pricePerM2: 0,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    description: '',
    unit: 'tấm',
    thickness: '',
    width: '',
    length: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('gooli_token') || '' : '';

  // Load products and categories
  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        getProducts({
          page,
          limit: 15,
          search: search || undefined,
          categoryId: selectedCategory,
        }),
        getCategories(),
      ]);

      setProducts(prodRes.items);
      setTotal(prodRes.total);
      setTotalPages(prodRes.totalPages);
      setCategories(catRes);
      
      if (catRes.length > 0 && formData.categoryId === 0) {
        setFormData(prev => ({ ...prev, categoryId: catRes[0].id }));
      }

      setLoading(false);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, selectedCategory, selectedProductType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleCreateOpen = () => {
    setEditId(null);
    setFormData({
      categoryId: categories.length > 0 ? categories[0].id : 0,
      sku: '',
      name: '',
      pricePerM2: 0,
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
      description: '',
      unit: 'tấm',
      thickness: '',
      width: '',
      length: '',
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleEditOpen = (product: Product) => {
    setEditId(product.id);
    setFormData({
      categoryId: product.categoryId,
      sku: product.sku,
      name: product.name,
      pricePerM2: product.pricePerM2,
      imageUrl: product.imageUrl,
      description: product.description || '',
      unit: product.unit,
      thickness: product.thickness?.toString() || '',
      width: product.width?.toString() || '',
      length: product.length?.toString() || '',
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    if (formData.categoryId === 0) {
      setFormError('Vui lòng chọn danh mục sản phẩm.');
      setSubmitting(false);
      return;
    }

    if (!formData.sku.trim()) {
      setFormError('Vui lòng nhập mã SKU.');
      setSubmitting(false);
      return;
    }

    const dataToSend = {
      categoryId: Number(formData.categoryId),
      sku: formData.sku.trim(),
      name: formData.name.trim(),
      pricePerM2: Number(formData.pricePerM2),
      imageUrl: formData.imageUrl.trim(),
      description: formData.description.trim() || null,
      unit: formData.unit,
      thickness: formData.thickness ? Number(formData.thickness) : null,
      width: formData.width ? Number(formData.width) : null,
      length: formData.length ? Number(formData.length) : null,
    };

    try {
      if (editId) {
        await updateProduct(editId, dataToSend, token);
      } else {
        await createProduct(dataToSend, token);
      }
      setShowModal(false);
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lưu sản phẩm thất bại.';
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) {
      return;
    }

    try {
      await deleteProduct(id, token);
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Xóa sản phẩm thất bại.';
      alert(message);
    }
  };

  const showThickness = ['tấm', 'm²', 'cây'].includes(formData.unit);
  const showWidth = ['tấm'].includes(formData.unit);
  const showLength = ['tấm', 'cây'].includes(formData.unit);

  // Filter categories by search input
  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Calculate table totals for summary row
  const pageTotalStock = products.reduce((acc, curr) => acc + (curr.stock || 0), 0);
  const pageTotalCost = products.reduce((acc, curr) => acc + (curr.pricePerM2 * 0.8 * (curr.stock || 0)), 0);

  return (
    <div className="space-y-4 font-sans text-xs">
      
      {/* Page Header (Title + Action Buttons) */}
      <div className="flex justify-between items-center pb-2 select-none border-b border-gray-200">
        <h1 className="text-base font-extrabold text-gray-900 tracking-tight">Hàng hóa</h1>
        <div className="flex items-center gap-2">
          {/* Green Add Product Dropdown styled button */}
          <div className="relative group">
            <button
              onClick={handleCreateOpen}
              className="px-3.5 py-1.5 bg-[#008b44] hover:bg-[#007036] text-white font-bold rounded flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Thêm mới</span>
              <svg className="w-3 h-3 border-l border-emerald-600 pl-1 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

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
          
          {/* Loai Hang Card */}
          <div className="bg-white border border-gray-200 rounded shadow-sm p-4 space-y-3">
            <h2 className="font-extrabold text-gray-800 border-b border-gray-100 pb-1.5 tracking-tight uppercase select-none">
              Loại hàng
            </h2>
            <div className="space-y-2 select-none">
              <label className="flex items-center gap-2 font-medium cursor-pointer text-gray-700 hover:text-gray-900">
                <input
                  type="checkbox"
                  checked={selectedProductType === 'NORMAL'}
                  onChange={() => setSelectedProductType('NORMAL')}
                  className="rounded text-[#2f63d4] border-gray-300 focus:ring-[#2f63d4] w-3.5 h-3.5 cursor-pointer"
                />
                <span>Hàng hóa thường</span>
              </label>
              <label className="flex items-center gap-2 font-medium cursor-pointer text-gray-400">
                <input
                  type="checkbox"
                  disabled
                  checked={false}
                  className="rounded text-gray-300 border-gray-200 w-3.5 h-3.5 cursor-not-allowed"
                />
                <span>Hàng - Serial/IMEI</span>
              </label>
              <label className="flex items-center gap-2 font-medium cursor-pointer text-gray-400">
                <input
                  type="checkbox"
                  disabled
                  checked={false}
                  className="rounded text-gray-300 border-gray-200 w-3.5 h-3.5 cursor-not-allowed"
                />
                <span>Hàng sản xuất</span>
              </label>
              <label className="flex items-center gap-2 font-medium cursor-pointer text-gray-400">
                <input
                  type="checkbox"
                  disabled
                  checked={false}
                  className="rounded text-gray-300 border-gray-200 w-3.5 h-3.5 cursor-not-allowed"
                />
                <span>Dịch vụ</span>
              </label>
            </div>
          </div>

          {/* Nhom Hang Card */}
          <div className="bg-white border border-gray-200 rounded shadow-sm p-4 space-y-3">
            <h2 className="font-extrabold text-gray-800 border-b border-gray-100 pb-1.5 tracking-tight uppercase select-none">
              Nhóm hàng
            </h2>
            
            {/* Quick search categories */}
            <div className="relative">
              <input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Tìm kiếm nhóm hàng"
                className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 pl-7 text-[11px] placeholder:text-gray-400 focus:outline-none focus:border-[#2f63d4] transition-colors"
              />
              <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Categories Tree List */}
            <div className="space-y-1 max-h-60 overflow-y-auto pr-1 select-none font-medium text-gray-600">
              <button
                onClick={() => {
                  setSelectedCategory(undefined);
                  setPage(1);
                }}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left transition-colors ${
                  selectedCategory === undefined
                    ? 'bg-blue-50 text-[#2f63d4] font-bold'
                    : 'hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span>Tất cả</span>
              </button>
              
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setPage(1);
                  }}
                  className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-left transition-colors truncate ${
                    selectedCategory === cat.id
                      ? 'bg-blue-50 text-[#2f63d4] font-bold'
                      : 'hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={cat.name}
                >
                  <svg className="w-3.5 h-3.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
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
                placeholder="Theo mã hàng, tên hàng hóa..."
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

          {/* Products Data Table */}
          {loading ? (
            <div className="text-center py-24 text-gray-400 font-semibold bg-white border border-gray-200 rounded shadow-sm">
              Đang tải danh sách hàng hóa...
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white border border-gray-200 p-16 text-center text-gray-400 font-bold rounded shadow-sm">
              Không tìm thấy sản phẩm nào khớp bộ lọc.
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
                      <th className="p-3 w-6"></th>
                      <th className="p-3 w-12 text-center">Ảnh</th>
                      <th className="p-3">Mã hàng</th>
                      <th className="p-3">Tên hàng</th>
                      <th className="p-3">Nhóm hàng</th>
                      <th className="p-3 text-center">ĐVT</th>
                      <th className="p-3 text-right">Giá bán</th>
                      <th className="p-3 text-right">Giá vốn</th>
                      <th className="p-3 text-right">Tồn kho</th>
                      <th className="p-3 text-right">Khách đặt</th>
                      <th className="p-3 text-center">Dự kiến hết</th>
                      <th className="p-3 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150">
                    {/* SUMMARY ROW (Dòng tổng cộng KiotViet style) */}
                    <tr className="bg-amber-50/60 font-black text-gray-900 border-b border-gray-200 text-[11px]">
                      <td className="p-3 text-center"></td>
                      <td className="p-3"></td>
                      <td className="p-3 text-center"></td>
                      <td className="p-3 text-emerald-800">Tổng cộng</td>
                      <td className="p-3"></td>
                      <td className="p-3 text-gray-500"></td>
                      <td className="p-3 text-center"></td>
                      <td className="p-3 text-right"></td>
                      <td className="p-3 text-right text-gray-600 font-mono">
                        {pageTotalCost.toLocaleString()}đ
                      </td>
                      <td className="p-3 text-right text-blue-700 font-mono">
                        {pageTotalStock.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-mono">0</td>
                      <td className="p-3 text-center">-</td>
                      <td className="p-3 text-center"></td>
                    </tr>

                    {/* DATA ROWS */}
                    {products.map((p) => {
                      let specStr = '';
                      if (p.unit === 'tấm' && p.thickness && p.width && p.length) {
                        specStr = ` (${p.thickness}mm | ${p.width}x${p.length}mm)`;
                      } else if (p.unit === 'cây' && p.thickness && p.length) {
                        specStr = ` (${p.thickness}mm | L-${p.length}mm)`;
                      } else if (p.unit === 'm²' && p.thickness) {
                        specStr = ` (${p.thickness}mm)`;
                      }

                      return (
                        <tr key={p.id} className="hover:bg-blue-50/10 transition-colors text-[11px]">
                          <td className="p-3 text-center">
                            <input type="checkbox" className="rounded border-gray-300 w-3 h-3 cursor-pointer" readOnly />
                          </td>
                          <td className="p-3 text-center">
                            <button className="text-gray-300 hover:text-amber-400 cursor-pointer">
                              ★
                            </button>
                          </td>
                          <td className="p-3 text-center">
                            <img
                              src={p.imageUrl || 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'}
                              alt={p.name}
                              className="w-8 h-8 rounded border border-gray-200 object-cover mx-auto bg-gray-50"
                            />
                          </td>
                          <td className="p-3 font-bold text-[#008b44] select-all cursor-text">{p.sku}</td>
                          <td className="p-3 font-bold text-gray-900 leading-tight">
                            {p.name}
                            {specStr && <span className="text-gray-500 font-normal font-mono">{specStr}</span>}
                          </td>
                          <td className="p-3 text-gray-500 font-medium">{p.category?.name || '-'}</td>
                          <td className="p-3 text-center uppercase font-bold text-gray-500">{p.unit}</td>
                          <td className="p-3 text-right font-bold text-gray-800 font-mono">{p.pricePerM2.toLocaleString()}đ</td>
                          <td className="p-3 text-right text-gray-500 font-mono">{(p.pricePerM2 * 0.8).toLocaleString()}đ</td>
                          <td className="p-3 text-right text-blue-700 font-extrabold font-mono">{p.stock || 0}</td>
                          <td className="p-3 text-right font-mono">0</td>
                          <td className="p-3 text-center text-gray-400 font-medium">-</td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditOpen(p)}
                                className="text-blue-600 hover:underline font-bold cursor-pointer"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDelete(p.id, p.name)}
                                className="text-red-500 hover:underline font-bold cursor-pointer"
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination footer bar */}
              <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-gray-500 select-none font-bold text-[10px]">
                <span>Tổng số mặt hàng: {total}</span>
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
          <div className="w-full max-w-xl bg-white border border-gray-200 p-5 rounded shadow-xl relative text-gray-700">
            <div className="flex justify-between items-center mb-4 border-b border-gray-150 pb-2">
              <h2 className="text-xs font-black text-gray-900 uppercase tracking-wide">
                {editId ? `Cập nhật sản phẩm: ${formData.sku}` : 'Thêm sản phẩm mới'}
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
                
                {/* SKU Code */}
                <div>
                  <label htmlFor="modal_sku" className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">
                    Mã hàng hóa (SKU - duy nhất)
                  </label>
                  <input
                    id="modal_sku"
                    type="text"
                    required
                    disabled={!!editId}
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))}
                    placeholder="VD: ALU-CLIPIN-600"
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#2f63d4] disabled:bg-gray-100"
                  />
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="modal_name" className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">
                    Tên sản phẩm
                  </label>
                  <input
                    id="modal_name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="VD: Trần nhôm Clip-in Gooli 600x600"
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#2f63d4]"
                  />
                </div>

                {/* Category selection */}
                <div>
                  <label htmlFor="modal_category" className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">
                    Nhóm hàng
                  </label>
                  <select
                    id="modal_category"
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: Number(e.target.value) }))}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Unit of measure */}
                <div>
                  <label htmlFor="modal_unit" className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">
                    Đơn vị tính (ĐVT)
                  </label>
                  <select
                    id="modal_unit"
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="tấm">Tấm</option>
                    <option value="cây">Cây</option>
                    <option value="m²">Mét vuông (m²)</option>
                    <option value="bộ">Bộ</option>
                    <option value="cái">Cái</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label htmlFor="modal_price" className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">
                    Giá bán mặc định (đ)
                  </label>
                  <input
                    id="modal_price"
                    type="number"
                    min="0"
                    required
                    value={formData.pricePerM2}
                    onChange={(e) => setFormData(prev => ({ ...prev, pricePerM2: Number(e.target.value) }))}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label htmlFor="modal_image" className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">
                    Ảnh sản phẩm
                  </label>
                  <input
                    id="modal_image"
                    type="text"
                    required
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                </div>

              </div>

              {/* Dynamic Dimensions Block */}
              {(showThickness || showWidth || showLength) && (
                <div className="bg-gray-50 border border-gray-200 p-3.5 rounded space-y-2.5">
                  <div className="text-[10px] text-[#008b44] uppercase tracking-wider font-extrabold border-b border-gray-200 pb-1">
                    Cấu hình Quy cách sản phẩm (Theo ĐVT: {formData.unit.toUpperCase()})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {showThickness && (
                      <div>
                        <label htmlFor="modal_thickness" className="block text-[9px] text-gray-500 mb-1 font-semibold uppercase">
                          Độ dày (mm)
                        </label>
                        <input
                          id="modal_thickness"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.thickness}
                          onChange={(e) => setFormData(prev => ({ ...prev, thickness: e.target.value }))}
                          placeholder="VD: 0.8"
                          className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-xs focus:outline-none"
                        />
                      </div>
                    )}

                    {showWidth && (
                      <div>
                        <label htmlFor="modal_width" className="block text-[9px] text-gray-500 mb-1 font-semibold uppercase">
                          Chiều rộng (mm)
                        </label>
                        <input
                          id="modal_width"
                          type="number"
                          min="0"
                          value={formData.width}
                          onChange={(e) => setFormData(prev => ({ ...prev, width: e.target.value }))}
                          placeholder="VD: 600"
                          className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-xs focus:outline-none"
                        />
                      </div>
                    )}

                    {showLength && (
                      <div>
                        <label htmlFor="modal_length" className="block text-[9px] text-gray-500 mb-1 font-semibold uppercase">
                          Chiều dài (mm)
                        </label>
                        <input
                          id="modal_length"
                          type="number"
                          min="0"
                          value={formData.length}
                          onChange={(e) => setFormData(prev => ({ ...prev, length: e.target.value }))}
                          placeholder="VD: 600"
                          className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-xs focus:outline-none"
                        />
                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label htmlFor="modal_desc" className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">
                  Mô tả sản phẩm
                </label>
                <textarea
                  id="modal_desc"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả thông tin chi tiết..."
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
