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
  const pageTotalFaulty = products.reduce((acc, curr) => acc + (curr.faultyQty || 0), 0);

  return (
    <div className="space-y-6 font-sans text-sm pb-10">
      
      {/* Page Header (Title + Action Buttons) */}
      <div className="flex justify-between items-center pb-4 select-none border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hàng hóa</h1>
        <div className="flex items-center gap-3">
          {/* Green Add Product Dropdown styled button */}
          <div className="relative group">
            <button
              onClick={handleCreateOpen}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-md flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Thêm mới</span>
              <svg className="w-3.5 h-3.5 border-l border-emerald-500 pl-1.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <button
            onClick={() => alert('Đang mở chức năng Import Excel...')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-md flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Import</span>
          </button>

          <button
            onClick={() => alert('Đang xuất danh sách file Excel...')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-md flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Xuất file</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left Column: Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0 space-y-5">
          
          {/* Loai Hang Card */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 space-y-4">
            <h2 className="font-extrabold text-slate-800 border-b border-slate-100 pb-2 tracking-wider uppercase select-none text-[11px]">
              Loại hàng
            </h2>
            <div className="space-y-3 select-none">
              <label className="flex items-center gap-2.5 font-semibold cursor-pointer text-slate-700 hover:text-slate-900 text-sm">
                <input
                  type="checkbox"
                  checked={selectedProductType === 'NORMAL'}
                  onChange={() => setSelectedProductType('NORMAL')}
                  className="rounded text-[#B06518] border-slate-300 focus:ring-[#B06518] w-4 h-4 cursor-pointer accent-[#B06518]"
                />
                <span>Hàng hóa thường</span>
              </label>
              <label className="flex items-center gap-2.5 font-medium cursor-pointer text-slate-400 text-sm">
                <input
                  type="checkbox"
                  disabled
                  checked={false}
                  className="rounded text-slate-200 border-slate-200 w-4 h-4 cursor-not-allowed"
                />
                <span>Hàng - Serial/IMEI</span>
              </label>
              <label className="flex items-center gap-2.5 font-medium cursor-pointer text-slate-400 text-sm">
                <input
                  type="checkbox"
                  disabled
                  checked={false}
                  className="rounded text-slate-200 border-slate-200 w-4 h-4 cursor-not-allowed"
                />
                <span>Hàng sản xuất</span>
              </label>
              <label className="flex items-center gap-2.5 font-medium cursor-pointer text-slate-400 text-sm">
                <input
                  type="checkbox"
                  disabled
                  checked={false}
                  className="rounded text-slate-200 border-slate-200 w-4 h-4 cursor-not-allowed"
                />
                <span>Dịch vụ</span>
              </label>
            </div>
          </div>

          {/* Nhom Hang Card */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 space-y-4">
            <h2 className="font-extrabold text-slate-800 border-b border-slate-100 pb-2 tracking-wider uppercase select-none text-[11px]">
              Nhóm hàng
            </h2>
            
            {/* Quick search categories */}
            <div style={{ position: "relative", width: "100%", marginBottom: "12px" }}>
              <input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Tìm kiếm nhóm hàng..."
                className="w-full bg-white border border-slate-300 rounded-md transition-colors"
                style={{ width: "100%", height: "36px", paddingLeft: "32px", paddingRight: "12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", outline: "none", backgroundColor: "#ffffff" }}
              />
              <svg style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94a3b8" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Categories Tree List */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 select-none font-semibold text-slate-600">
              <button
                onClick={() => {
                  setSelectedCategory(undefined);
                  setPage(1);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition-colors text-sm ${
                  selectedCategory === undefined
                    ? 'bg-amber-50 text-[#B06518] font-bold border-l-2 border-[#B06518]'
                    : 'hover:bg-slate-50 hover:text-slate-900'
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
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors text-sm truncate ${
                    selectedCategory === cat.id
                      ? 'bg-amber-50 text-[#B06518] font-bold border-l-2 border-[#B06518]'
                      : 'hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  title={cat.name}
                >
                  <svg className="w-4 h-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

        </aside>

        {/* Right Column: Search bar and Table grid */}
        <div className="flex-1 w-full min-w-0 space-y-4" style={{ minWidth: 0 }}>
          
          {/* Main search bar */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: "flex",
              gap: "12px",
              backgroundColor: "#ffffff",
              border: "1px solid #cbd5e1",
              padding: "16px",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              marginBottom: "24px"
            }}
          >
            <div style={{ position: "relative", flex: 1 }}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo mã SKU, tên hàng hóa..."
                className="w-full bg-white border border-slate-300 rounded-md transition-colors"
                style={{
                  width: "100%",
                  height: "44px",
                  paddingLeft: "40px",
                  paddingRight: "16px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  fontSize: "14px",
                  color: "#1e293b",
                  outline: "none"
                }}
              />
              <svg
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "20px",
                  height: "20px",
                  color: "#94a3b8"
                }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              type="submit"
              className="hover:bg-[#905212] transition-colors shadow-sm"
              style={{
                padding: "0 24px",
                height: "44px",
                backgroundColor: "#B06518",
                color: "#ffffff",
                fontWeight: "800",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                whiteSpace: "nowrap"
              }}
            >
              Tìm kiếm
            </button>
          </form>

          {/* Products Data Table */}
          {loading ? (
            <div className="text-center py-24 text-slate-400 font-bold bg-white border border-slate-200 rounded-lg shadow-sm">
              Đang tải danh sách hàng hóa...
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white border border-slate-200 p-20 text-center text-slate-400 font-bold rounded-lg shadow-sm">
              Không tìm thấy sản phẩm nào khớp bộ lọc.
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-slate-700">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[11px]">
                      <th className="py-3.5 px-4 text-center" style={{ width: "48px", minWidth: "48px" }}>
                        <input type="checkbox" className="rounded border-slate-300 w-3.5 h-3.5 cursor-pointer" readOnly />
                      </th>
                      <th className="py-3.5 px-2 text-center" style={{ width: "36px", minWidth: "36px" }}>&nbsp;</th>
                      <th className="py-3.5 px-4 text-center" style={{ width: "72px", minWidth: "72px" }}>Ảnh</th>
                      <th className="py-3.5 px-4 whitespace-nowrap" style={{ width: "160px", minWidth: "160px" }}>Mã hàng</th>
                      <th className="py-3.5 px-4" style={{ minWidth: "240px" }}>Tên hàng</th>
                      <th className="py-3.5 px-4 whitespace-nowrap" style={{ width: "160px", minWidth: "160px" }}>Nhóm hàng</th>
                      <th className="py-3.5 px-4 text-center whitespace-nowrap" style={{ width: "72px", minWidth: "72px" }}>ĐVT</th>
                      <th className="py-3.5 px-4 text-right whitespace-nowrap" style={{ width: "120px", minWidth: "120px" }}>Giá bán</th>
                      <th className="py-3.5 px-4 text-right whitespace-nowrap" style={{ width: "120px", minWidth: "120px" }}>Giá vốn</th>
                      <th className="py-3.5 px-4 text-right whitespace-nowrap" style={{ width: "100px", minWidth: "100px" }}>Tồn kho</th>
                      <th className="py-3.5 px-4 text-right whitespace-nowrap" style={{ width: "100px", minWidth: "100px" }}>Hàng hỏng</th>
                      <th className="py-3.5 px-4 text-center whitespace-nowrap" style={{ width: "110px", minWidth: "110px" }}>Dự kiến hết</th>
                      <th className="py-3.5 px-4 text-center whitespace-nowrap" style={{ width: "140px", minWidth: "140px" }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {/* SUMMARY ROW (Dòng tổng cộng KiotViet style) */}
                    <tr className="bg-amber-50/50 font-black text-slate-900 border-b border-slate-200 text-xs">
                      <td className="py-3.5 px-4 text-center" style={{ width: "48px", minWidth: "48px" }}></td>
                      <td className="py-3.5 px-2 text-center" style={{ width: "36px", minWidth: "36px" }}></td>
                      <td className="py-3.5 px-4 text-center" style={{ width: "72px", minWidth: "72px" }}></td>
                      <td className="py-3.5 px-4 text-[#B06518] uppercase tracking-wider font-extrabold" style={{ width: "160px", minWidth: "160px" }}>Tổng cộng</td>
                      <td className="py-3.5 px-4" style={{ minWidth: "240px" }}></td>
                      <td className="py-3.5 px-4" style={{ width: "160px", minWidth: "160px" }}></td>
                      <td className="py-3.5 px-4" style={{ width: "72px", minWidth: "72px" }}></td>
                      <td className="py-3.5 px-4" style={{ width: "120px", minWidth: "120px" }}></td>
                      <td className="py-3.5 px-4 text-right text-slate-600 font-mono font-bold" style={{ width: "120px", minWidth: "120px" }}>
                        {pageTotalCost.toLocaleString()}đ
                      </td>
                      <td className="py-3.5 px-4 text-right text-blue-800 font-mono font-extrabold" style={{ width: "100px", minWidth: "100px" }}>
                        {pageTotalStock.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right text-red-600 font-mono font-extrabold" style={{ width: "100px", minWidth: "100px" }}>
                        {pageTotalFaulty.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-400 font-medium" style={{ width: "110px", minWidth: "110px" }}>-</td>
                      <td className="py-3.5 px-4 text-center" style={{ width: "140px", minWidth: "140px" }}></td>
                    </tr>

                    {/* DATA ROWS */}
                    {products.map((p) => {
                      let specStr = '';
                      if (p.unit === 'tấm' && p.thickness && p.width && p.length) {
                        specStr = `${p.thickness}mm | ${p.width}x${p.length}mm`;
                      } else if (p.unit === 'cây' && p.thickness && p.length) {
                        specStr = `${p.thickness}mm | L-${p.length}mm`;
                      } else if (p.unit === 'm²' && p.thickness) {
                        specStr = `${p.thickness}mm`;
                      }

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/60 transition-colors text-sm">
                          <td className="py-3.5 px-4 text-center" style={{ width: "48px", minWidth: "48px" }}>
                            <input type="checkbox" className="rounded border-slate-300 w-3.5 h-3.5 cursor-pointer" readOnly />
                          </td>
                          <td className="py-3.5 px-2 text-center" style={{ width: "36px", minWidth: "36px" }}>
                            <button className="text-slate-300 hover:text-amber-500 transition-colors cursor-pointer text-sm">
                              ★
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-center" style={{ width: "72px", minWidth: "72px" }}>
                            <img
                              src={p.imageUrl || 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'}
                              alt={p.name}
                              className="w-10 h-10 rounded border border-slate-200 object-cover mx-auto bg-slate-50 shadow-2xs"
                            />
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#B06518] hover:underline select-all cursor-text whitespace-nowrap" style={{ width: "160px", minWidth: "160px" }}>{p.sku}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 leading-snug" style={{ minWidth: "240px" }}>
                            <div>{p.name}</div>
                            {specStr && (
                              <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded mt-1.5 inline-block font-mono">
                                {specStr}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-semibold whitespace-nowrap" style={{ width: "160px", minWidth: "160px" }}>{p.category?.name || '-'}</td>
                          <td className="py-3.5 px-4 text-center uppercase font-bold text-slate-400 text-xs" style={{ width: "72px", minWidth: "72px" }}>{p.unit}</td>
                          <td className="py-3.5 px-4 text-right font-bold text-slate-800 font-mono" style={{ width: "120px", minWidth: "120px" }}>{p.pricePerM2.toLocaleString()}đ</td>
                          <td className="py-3.5 px-4 text-right text-slate-500 font-mono" style={{ width: "120px", minWidth: "120px" }}>{(p.pricePerM2 * 0.8).toLocaleString()}đ</td>
                          <td className="py-3.5 px-4 text-right text-blue-800 font-extrabold font-mono" style={{ width: "100px", minWidth: "100px" }}>{p.stock || 0}</td>
                          <td className="py-3.5 px-4 text-right text-red-600 font-extrabold font-mono" style={{ width: "100px", minWidth: "100px" }}>{p.faultyQty || 0}</td>
                          <td className="py-3.5 px-4 text-center text-slate-400 font-medium" style={{ width: "110px", minWidth: "110px" }}>-</td>
                          <td className="py-3.5 px-4 text-center" style={{ width: "140px", minWidth: "140px" }}>
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditOpen(p)}
                                className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 border border-amber-200 rounded-md font-semibold text-xs transition-all duration-150 cursor-pointer"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDelete(p.id, p.name)}
                                className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border border-red-200 rounded-md font-semibold text-xs transition-all duration-150 cursor-pointer"
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
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-slate-500 select-none font-bold text-[11px]">
                <span>Tổng số mặt hàng: {total}</span>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2.5">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(prev => prev - 1)}
                      className={`px-3 py-1.5 border rounded-md text-[10px] transition-all font-extrabold ${
                        page === 1
                          ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-white'
                          : 'border-slate-300 text-slate-700 hover:border-[#B06518] bg-white hover:text-[#B06518] cursor-pointer'
                      }`}
                    >
                      PREV
                    </button>
                    <span className="text-slate-700 font-extrabold">Trang {page} / {totalPages}</span>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(prev => prev + 1)}
                      className={`px-3 py-1.5 border rounded-md text-[10px] transition-all font-extrabold ${
                        page === totalPages
                          ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-white'
                          : 'border-slate-300 text-slate-700 hover:border-[#B06518] bg-white hover:text-[#B06518] cursor-pointer'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs px-4">
          <div className="w-full max-w-xl bg-white border border-slate-200 p-6 rounded-lg shadow-2xl relative text-slate-700">
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                {editId ? `Cập nhật sản phẩm: ${formData.sku}` : 'Thêm sản phẩm mới'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                [Đóng]
              </button>
            </div>

            {formError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 text-xs rounded-md">
                [Lỗi]: {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* SKU Code */}
                <div>
                  <label htmlFor="modal_sku" className="block text-xs text-slate-500 font-bold mb-1 uppercase tracking-wide">
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
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#B06518] focus:ring-1 focus:ring-[#B06518] transition-all duration-150 disabled:bg-slate-50"
                  />
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="modal_name" className="block text-xs text-slate-500 font-bold mb-1 uppercase tracking-wide">
                    Tên sản phẩm
                  </label>
                  <input
                    id="modal_name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="VD: Trần nhôm Clip-in Gooli 600x600"
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#B06518] focus:ring-1 focus:ring-[#B06518] transition-all duration-150"
                  />
                </div>

                {/* Category selection */}
                <div>
                  <label htmlFor="modal_category" className="block text-xs text-slate-500 font-bold mb-1 uppercase tracking-wide">
                    Nhóm hàng
                  </label>
                  <select
                    id="modal_category"
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: Number(e.target.value) }))}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#B06518] focus:ring-1 focus:ring-[#B06518] cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Unit of measure */}
                <div>
                  <label htmlFor="modal_unit" className="block text-xs text-slate-500 font-bold mb-1 uppercase tracking-wide">
                    Đơn vị tính (ĐVT)
                  </label>
                  <select
                    id="modal_unit"
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#B06518] focus:ring-1 focus:ring-[#B06518] cursor-pointer"
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
                  <label htmlFor="modal_price" className="block text-xs text-slate-500 font-bold mb-1 uppercase tracking-wide">
                    Giá bán mặc định (đ)
                  </label>
                  <input
                    id="modal_price"
                    type="number"
                    min="0"
                    required
                    value={formData.pricePerM2}
                    onChange={(e) => setFormData(prev => ({ ...prev, pricePerM2: Number(e.target.value) }))}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#B06518] focus:ring-1 focus:ring-[#B06518] transition-all duration-150"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label htmlFor="modal_image" className="block text-xs text-slate-500 font-bold mb-1 uppercase tracking-wide">
                    Ảnh sản phẩm
                  </label>
                  <input
                    id="modal_image"
                    type="text"
                    required
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#B06518] focus:ring-1 focus:ring-[#B06518] transition-all duration-150"
                  />
                </div>

              </div>

              {/* Dynamic Dimensions Block */}
              {(showThickness || showWidth || showLength) && (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-3">
                  <div className="text-xs text-[#B06518] uppercase tracking-wider font-extrabold border-b border-slate-200 pb-1.5">
                    Cấu hình Quy cách sản phẩm (Theo ĐVT: {formData.unit.toUpperCase()})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {showThickness && (
                      <div>
                        <label htmlFor="modal_thickness" className="block text-[10px] text-slate-500 mb-1 font-semibold uppercase tracking-wide">
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
                          className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-[#B06518] focus:ring-1 focus:ring-[#B06518] transition-all duration-150"
                        />
                      </div>
                    )}

                    {showWidth && (
                      <div>
                        <label htmlFor="modal_width" className="block text-[10px] text-slate-500 mb-1 font-semibold uppercase tracking-wide">
                          Chiều rộng (mm)
                        </label>
                        <input
                          id="modal_width"
                          type="number"
                          min="0"
                          value={formData.width}
                          onChange={(e) => setFormData(prev => ({ ...prev, width: e.target.value }))}
                          placeholder="VD: 600"
                          className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-[#B06518] focus:ring-1 focus:ring-[#B06518] transition-all duration-150"
                        />
                      </div>
                    )}

                    {showLength && (
                      <div>
                        <label htmlFor="modal_length" className="block text-[10px] text-slate-500 mb-1 font-semibold uppercase tracking-wide">
                          Chiều dài (mm)
                        </label>
                        <input
                          id="modal_length"
                          type="number"
                          min="0"
                          value={formData.length}
                          onChange={(e) => setFormData(prev => ({ ...prev, length: e.target.value }))}
                          placeholder="VD: 600"
                          className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-[#B06518] focus:ring-1 focus:ring-[#B06518] transition-all duration-150"
                        />
                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label htmlFor="modal_desc" className="block text-xs text-slate-500 font-bold mb-1 uppercase tracking-wide">
                  Mô tả sản phẩm
                </label>
                <textarea
                  id="modal_desc"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả thông tin chi tiết..."
                  className="w-full bg-white border border-slate-300 rounded-md px-3.5 py-2 text-sm focus:outline-none focus:border-[#B06518] focus:ring-1 focus:ring-[#B06518] transition-all duration-150"
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 mt-5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md font-semibold cursor-pointer text-sm transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#B06518] hover:bg-[#905212] text-white rounded-md font-bold cursor-pointer disabled:opacity-50 text-sm shadow-sm transition-colors"
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
