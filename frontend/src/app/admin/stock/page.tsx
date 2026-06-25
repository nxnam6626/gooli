'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProducts, getCategories } from '../../../services/api';
import { Product, Category } from '../../../types';
import {
  Truck,
  Warning,
  PaperPlaneTilt,
  Tag,
  Sliders,
  CaretDown
} from '@phosphor-icons/react';

function StockContent() {
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
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Load products and categories
  const loadData = React.useCallback(async () => {
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
      
      setLoading(false);
    } catch (error) {
      console.error('Lỗi tải dữ liệu tồn kho:', error);
      setLoading(false);
    }
  }, [page, selectedCategory, urlSearch]);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadData();
    });
  }, [loadData]);

  // Local/client status filters
  const filteredProducts = React.useMemo(() => {
    return products.filter(p => {
      if (statusFilter === 'IN_STOCK') return (p.stock || 0) > 5;
      if (statusFilter === 'LOW_STOCK') return (p.stock || 0) > 0 && (p.stock || 0) <= 5;
      if (statusFilter === 'OUT_OF_STOCK') return (p.stock || 0) === 0;
      return true;
    });
  }, [products, statusFilter]);

  // Compute stats
  const lowStockCount = React.useMemo(() => {
    return products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length;
  }, [products]);

  return (
    <div className="space-y-6 font-sans text-xs pb-10">
      
      {/* 1. Header (Title + Buttons) */}
      <div className="flex justify-between items-center select-none">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Quản lý Tồn kho</h1>
          <p className="text-slate-500 mt-1 text-[11px]">Cập nhật và theo dõi số lượng tồn kho theo thời gian thực.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold rounded-lg flex items-center gap-2 cursor-pointer transition-all text-xs"
          >
            Làm mới
          </button>
        </div>
      </div>



      {/* 3. Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Vận chuyển đang đến */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#2563eb] shrink-0">
            <Truck size={24} weight="fill" />
          </div>
          <div>
            <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Vận chuyển đang đến</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">14 Đơn</div>
          </div>
        </div>

        {/* Card 2: Tổng số SKU */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-center">
          <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Tổng số SKU</div>
          <div className="text-lg font-black text-slate-900 mt-0.5">{total.toLocaleString()}</div>
        </div>

        {/* Card 3: Giá trị (VND) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-center">
          <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Giá trị (VND)</div>
          <div className="text-lg font-black text-slate-900 mt-0.5">4.2B</div>
        </div>

        {/* Card 4: Đơn chờ xuất */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <PaperPlaneTilt size={24} weight="fill" />
          </div>
          <div>
            <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Đơn chờ xuất</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">28 Đơn</div>
          </div>
        </div>
      </div>

      {/* Row 2: Secondary Cards (3 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent POs */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
          <div className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>Giao dịch gần đây</span>
            <span className="text-[#2563eb] text-[9px] lowercase tracking-normal font-semibold hover:underline cursor-pointer">Nhập kho</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-extrabold text-slate-800 text-[11px]">PO-2023-104</div>
                <div className="text-slate-500 text-[10px] mt-0.5">Nike Air Max x50</div>
              </div>
              <div className="text-slate-400 font-semibold text-[10px]">10:45 AM</div>
            </div>
            <div className="flex justify-between items-start border-t border-slate-100 pt-2.5">
              <div>
                <div className="font-extrabold text-slate-800 text-[11px]">PO-2023-105</div>
                <div className="text-slate-500 text-[10px] mt-0.5">Smart Watch x20</div>
              </div>
              <div className="text-slate-400 font-semibold text-[10px]">09:12 AM</div>
            </div>
          </div>
        </div>

        {/* Inventory Warning Alert */}
        <div className="bg-[#fef2f2] border border-red-100 rounded-xl p-4 shadow-2xs flex flex-col justify-center space-y-2">
          <div className="flex items-center gap-2 text-red-800">
            <Warning size={18} weight="fill" className="text-red-600" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Cảnh báo tồn kho</span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-red-600 leading-none">{lowStockCount || 12}</span>
            <span className="text-red-800 font-extrabold text-[11px]">SKU sắp hết</span>
          </div>
        </div>

        {/* Recent SOs */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
          <div className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>Giao dịch gần đây</span>
            <span className="text-emerald-600 text-[9px] lowercase tracking-normal font-semibold hover:underline cursor-pointer">Xuất kho</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-extrabold text-slate-800 text-[11px]">SO-2023-892</div>
                <div className="text-slate-500 text-[10px] mt-0.5">Camera Retro x2</div>
              </div>
              <div className="text-slate-400 font-semibold text-[10px]">11:30 AM</div>
            </div>
            <div className="flex justify-between items-start border-t border-slate-100 pt-2.5">
              <div>
                <div className="font-extrabold text-slate-800 text-[11px]">SO-2023-891</div>
                <div className="text-slate-500 text-[10px] mt-0.5">Headphone x5</div>
              </div>
              <div className="text-slate-400 font-semibold text-[10px]">10:15 AM</div>
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

          {/* Status select */}
          <div className="relative flex items-center bg-[#f1f5f9] rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-200/70 transition-colors">
            <Sliders size={15} className="text-slate-500 mr-1.5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none outline-none cursor-pointer pr-4 appearance-none text-[11px] font-bold"
            >
              <option value="ALL">Trạng thái: Tất cả</option>
              <option value="IN_STOCK">Còn hàng</option>
              <option value="LOW_STOCK">Sắp hết</option>
              <option value="OUT_OF_STOCK">Hết hàng</option>
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
        <h2 className="text-sm font-black text-slate-900 tracking-tight">Chi tiết Tồn kho</h2>
        
        {loading ? (
          <div className="bg-white border border-slate-200 p-24 text-center text-slate-400 font-bold rounded-xl shadow-2xs">
            Đang tải dữ liệu hàng tồn kho...
          </div>
        ) : filteredProducts.length === 0 ? (
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
                    <th className="py-3 px-4 text-right">Tồn kho chuẩn</th>
                    <th className="py-3 px-4 text-right">Hàng lỗi/hỏng</th>
                    <th className="py-3 px-4 text-center">Đơn vị</th>
                    <th className="py-3 px-4 text-center">Trạng thái</th>
                    <th className="py-3 px-4 text-center">Cập nhật</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const isLow = (p.stock || 0) > 0 && (p.stock || 0) <= 5;
                    const isOut = (p.stock || 0) === 0;
                    
                    let statusLabel = 'Còn hàng';
                    let statusStyle = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                    if (isLow) {
                      statusLabel = 'Sắp hết';
                      statusStyle = 'bg-amber-50 text-amber-700 border-amber-100';
                    } else if (isOut) {
                      statusLabel = 'Hết hàng';
                      statusStyle = 'bg-rose-50 text-rose-700 border-rose-100';
                    }

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

                        <td className={`py-3.5 px-4 text-right font-black font-mono ${isLow ? 'text-rose-600' : isOut ? 'text-slate-400' : 'text-slate-800'}`}>
                          {p.stock || 0}
                        </td>

                        <td className="py-3.5 px-4 text-right font-bold font-mono text-slate-500">
                          {p.faultyQty || 0}
                        </td>

                        <td className="py-3.5 px-4 text-center text-slate-500 font-semibold uppercase">{p.unit}</td>

                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${statusStyle}`}>
                            {statusLabel}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center text-slate-400 font-semibold">
                          {p.updatedAt ? new Date(p.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ', Hôm nay' : 'Hôm nay'}
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

    </div>
  );
}

export default function AdminStockPage() {
  return (
    <React.Suspense fallback={<div className="text-xs text-slate-500 font-bold p-8">Đang tải thông tin hàng tồn kho...</div>}>
      <StockContent />
    </React.Suspense>
  );
}
