import React from 'react';
import { Pencil, Trash } from '@phosphor-icons/react';
import { Product } from '@/types';

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  handleEditOpen: (product: Product) => void;
  handleDelete: (id: number, name: string) => void;
}

export default function ProductTable({
  products,
  loading,
  page,
  totalPages,
  setPage,
  handleEditOpen,
  handleDelete,
}: ProductTableProps) {
  const fmt = (n: number | string) => Number(n).toLocaleString("vi-VN");

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 p-24 text-center text-slate-400 font-bold rounded-xl shadow-2xs">
        Đang tải dữ liệu hàng hóa...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white border border-slate-200 p-20 text-center text-slate-400 font-bold rounded-xl shadow-2xs">
        Không tìm thấy sản phẩm nào khớp bộ lọc.
      </div>
    );
  }

  return (
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
              onClick={() => setPage(page - 1)}
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
              onClick={() => setPage(page + 1)}
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
  );
}
