/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  getProducts, 
  getCategories, 
  createProduct, 
  updateProduct, 
  deleteProduct
} from '../../../services/api';
import { Product, Category } from '../../../types';
import {
  Plus,
  Warehouse,
  Tag,
  Pencil,
  Trash,
  SignIn,
  SignOut,
  ListDashes,
  CurrencyDollar,
  CheckCircle,
  Hash,
  CaretDown
} from '@phosphor-icons/react';

const fmt = (n: number | string) =>
  Number(n).toLocaleString("vi-VN");

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);

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
    unit: 'Cái',
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
          limit: 10,
          search: urlSearch || undefined,
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
      console.error('Lỗi tải dữ liệu hàng hóa:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, selectedCategory, urlSearch]);

  const handleCreateOpen = () => {
    setEditId(null);
    setFormData({
      categoryId: categories.length > 0 ? categories[0].id : 0,
      sku: '',
      name: '',
      pricePerM2: 0,
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
      description: '',
      unit: 'Cái',
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

  const showThickness = ['tấm', 'm²', 'cây'].includes(formData.unit.toLowerCase());
  const showWidth = ['tấm'].includes(formData.unit.toLowerCase());
  const showLength = ['tấm', 'cây'].includes(formData.unit.toLowerCase());

  return (
    <div className="space-y-6 font-sans text-xs pb-10">
      
      {/* 1. Header (Title + Buttons) */}
      <div className="flex justify-between items-center select-none">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Danh mục Hàng hóa</h1>
          <p className="text-slate-500 mt-1 text-[11px]">Quản lý danh sách sản phẩm, quy cách kỹ thuật và thông tin giá bán.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateOpen}
            className="px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-2 cursor-pointer transition-all text-xs shadow-sm shadow-blue-500/10"
          >
            <Plus size={16} weight="bold" />
            <span>Thêm sản phẩm</span>
          </button>
        </div>
      </div>


      {/* 3. Catalog Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#2563eb] shrink-0">
            <Hash size={24} weight="bold" />
          </div>
          <div>
            <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Tổng số SKU</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">{total.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle size={24} weight="bold" />
          </div>
          <div>
            <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">SKU Hoạt động</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">{products.filter(p => p.isActive !== false).length}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <ListDashes size={24} weight="bold" />
          </div>
          <div>
            <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Số nhóm hàng</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">{categories.length}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
            <CurrencyDollar size={24} weight="bold" />
          </div>
          <div>
            <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Đơn giá TB (đ)</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">
              {fmt(Math.round(products.reduce((acc, p) => acc + Number(p.pricePerM2 || 0), 0) / (products.length || 1)))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Filter bar */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* Categories select */}
          <div className="relative flex items-center bg-[#f1f5f9] rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-200/70 transition-colors">
            <Tag size={15} className="text-slate-500 mr-1.5" />
            <select
              value={selectedCategory || ''}
              onChange={(e) => {
                setSelectedCategory(e.target.value ? Number(e.target.value) : undefined);
                setPage(1);
              }}
              className="bg-transparent border-none outline-none cursor-pointer pr-4 appearance-none text-[11px] font-bold"
            >
              <option value="">Tất cả Ngành hàng</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <CaretDown size={10} className="text-slate-500 absolute right-1.5 pointer-events-none" />
          </div>
        </div>

        <div className="text-slate-500 italic font-semibold text-[11px] select-none">
          Hiển thị {total.toLocaleString()} sản phẩm
        </div>
      </div>

      {/* 5. Goods Information Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-black text-slate-900 tracking-tight">Thông tin hàng hóa</h2>
        
        {loading ? (
          <div className="bg-white border border-slate-200 p-24 text-center text-slate-400 font-bold rounded-xl shadow-2xs">
            Đang tải dữ liệu hàng hóa...
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white border border-slate-200 p-20 text-center text-slate-400 font-bold rounded-xl shadow-2xs">
            Không tìm thấy sản phẩm nào khớp bộ lọc.
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs relative">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-slate-700">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                    <th className="py-3 px-4">Sản phẩm</th>
                    <th className="py-3 px-4">Danh mục</th>
                    <th className="py-3 px-4 text-right">Đơn giá bán</th>
                    <th className="py-3 px-4 text-center">Đơn vị</th>
                    <th className="py-3 px-4 text-center">Quy cách</th>
                    <th className="py-3 px-4 text-center">Trạng thái</th>
                    <th className="py-3 px-4 text-center">Cập nhật</th>
                    <th className="py-3 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => {
                    const specs = [];
                    if (p.thickness) specs.push(`Dày ${p.thickness}mm`);
                    if (p.width && p.length) specs.push(`${p.width}x${p.length}mm`);
                    const specsStr = specs.length > 0 ? specs.join(' · ') : '—';

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors text-[11px]">
                        <td className="py-3.5 px-4 flex items-center gap-3">
                          <img
                            src={p.imageUrl || 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg border border-slate-200 object-cover bg-slate-50"
                          />
                          <div className="flex flex-col">
                            <span className="font-extrabold text-slate-900 text-xs leading-snug">{p.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {p.sku}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            {p.category?.name || 'Chưa phân loại'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right font-black font-mono text-slate-800">
                          {fmt(Number(p.pricePerM2))}đ
                        </td>

                        <td className="py-3.5 px-4 text-center text-slate-500 font-semibold uppercase">{p.unit}</td>

                        <td className="py-3.5 px-4 text-center text-slate-600 font-semibold">{specsStr}</td>

                        <td className="py-3.5 px-4 text-center">
                          {p.isActive !== false ? (
                            <span className="px-2 py-0.5 rounded-full border text-[9px] font-bold bg-emerald-50 text-emerald-700 border-emerald-100">
                              Hoạt động
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full border text-[9px] font-bold bg-slate-50 text-slate-500 border-slate-100">
                              Ngừng bán
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center text-slate-400 font-semibold">
                          {p.updatedAt ? new Date(p.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ', Hôm nay' : 'Hôm nay'}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleEditOpen(p)}
                              className="p-1.5 border border-slate-200 text-slate-500 hover:text-[#2563eb] hover:bg-blue-50 bg-white rounded-lg transition-all cursor-pointer"
                              title="Sửa sản phẩm"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              className="p-1.5 border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 bg-white rounded-lg transition-all cursor-pointer"
                              title="Xóa sản phẩm"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex justify-between items-center text-slate-500 select-none font-bold text-[10px]">
              <span>Trang {page} / {totalPages || 1}</span>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(prev => prev - 1)}
                    className={`px-2.5 py-1 border rounded-md transition-all font-extrabold ${
                      page === 1
                        ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-white'
                        : 'border-slate-300 text-slate-700 hover:border-blue-600 bg-white hover:text-blue-600 cursor-pointer'
                    }`}
                  >
                    &lt;
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`px-2.5 py-1 border rounded-md transition-all font-extrabold ${
                        page === i + 1
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white border-slate-300 text-slate-600 hover:text-blue-600 hover:border-blue-600 cursor-pointer'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(prev => prev + 1)}
                    className={`px-2.5 py-1 border rounded-md transition-all font-extrabold ${
                      page === totalPages
                        ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-white'
                        : 'border-slate-300 text-slate-700 hover:border-blue-600 bg-white hover:text-blue-600 cursor-pointer'
                    }`}
                  >
                    &gt;
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Creation & Editing Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs px-4">
          <div className="w-full max-w-xl bg-white border border-slate-200 p-6 rounded-2xl shadow-2xl relative text-slate-700">
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                {editId ? `Cập nhật sản phẩm: ${formData.sku}` : 'Thêm sản phẩm mới'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer text-xs"
              >
                [Đóng]
              </button>
            </div>

            {formError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 text-xs rounded-lg">
                [Lỗi]: {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* SKU Code */}
                <div>
                  <label htmlFor="modal_sku" className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide">
                    Mã hàng hóa (SKU)
                  </label>
                  <input
                    id="modal_sku"
                    type="text"
                    required
                    disabled={!!editId}
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))}
                    placeholder="VD: NK-270-RD-42"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:bg-slate-50"
                  />
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="modal_name" className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide">
                    Tên sản phẩm
                  </label>
                  <input
                    id="modal_name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="VD: Nike Air Max 270"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                {/* Category selection */}
                <div>
                  <label htmlFor="modal_category" className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide">
                    Nhóm hàng
                  </label>
                  <select
                    id="modal_category"
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: Number(e.target.value) }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Unit of measure */}
                <div>
                  <label htmlFor="modal_unit" className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide">
                    Đơn vị tính (ĐVT)
                  </label>
                  <select
                    id="modal_unit"
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Đôi">Đôi</option>
                    <option value="Cái">Cái</option>
                    <option value="Bộ">Bộ</option>
                    <option value="tấm">Tấm</option>
                    <option value="cây">Cây</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label htmlFor="modal_price" className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide">
                    Giá bán (đ)
                  </label>
                  <input
                    id="modal_price"
                    type="number"
                    min="0"
                    required
                    value={formData.pricePerM2}
                    onChange={(e) => setFormData(prev => ({ ...prev, pricePerM2: Number(e.target.value) }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label htmlFor="modal_image" className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide">
                    Ảnh sản phẩm (URL)
                  </label>
                  <input
                    id="modal_image"
                    type="text"
                    required
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

              </div>

              {/* Dynamic Dimensions Block */}
              {(showThickness || showWidth || showLength) && (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                  <div className="text-[10px] text-blue-600 uppercase tracking-wider font-extrabold border-b border-slate-200 pb-1.5">
                    Cấu hình Quy cách sản phẩm (Theo ĐVT: {formData.unit.toUpperCase()})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {showThickness && (
                      <div>
                        <label htmlFor="modal_thickness" className="block text-[9px] text-slate-500 mb-1 font-semibold uppercase tracking-wide">
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
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>
                    )}

                    {showWidth && (
                      <div>
                        <label htmlFor="modal_width" className="block text-[9px] text-slate-500 mb-1 font-semibold uppercase tracking-wide">
                          Chiều rộng (mm)
                        </label>
                        <input
                          id="modal_width"
                          type="number"
                          min="0"
                          value={formData.width}
                          onChange={(e) => setFormData(prev => ({ ...prev, width: e.target.value }))}
                          placeholder="VD: 600"
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>
                    )}

                    {showLength && (
                      <div>
                        <label htmlFor="modal_length" className="block text-[9px] text-slate-500 mb-1 font-semibold uppercase tracking-wide">
                          Chiều dài (mm)
                        </label>
                        <input
                          id="modal_length"
                          type="number"
                          min="0"
                          value={formData.length}
                          onChange={(e) => setFormData(prev => ({ ...prev, length: e.target.value }))}
                          placeholder="VD: 600"
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label htmlFor="modal_desc" className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide">
                  Mô tả sản phẩm
                </label>
                <textarea
                  id="modal_desc"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả thông tin chi tiết..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 mt-5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold cursor-pointer text-xs transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-lg font-bold cursor-pointer disabled:opacity-50 text-xs shadow-sm transition-colors"
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

export default function AdminProductsPage() {
  return (
    <React.Suspense fallback={<div className="text-xs text-slate-500 font-bold p-8">Đang tải danh mục hàng hóa...</div>}>
      <ProductsContent />
    </React.Suspense>
  );
}
