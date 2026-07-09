import React from 'react';

interface StockProduct {
  id: number;
  name: string;
  sku: string;
  imageUrl?: string | null;
  unit: string;
  stock?: number | null;
  faultyQty?: number | null;
  updatedAt?: string | null;
  category?: { name: string } | null;
}

interface Props {
  products: StockProduct[];
  loading: boolean;
  page: number;
  totalPages: number;
  setPage: (v: number) => void;
}

function stockStatus(qty: number): { label: string; cls: string } {
  if (qty === 0) return { label: 'Hết hàng', cls: 'bg-rose-50 text-rose-700 border-rose-100' };
  if (qty <= 5) return { label: 'Sắp hết', cls: 'bg-amber-50 text-amber-700 border-amber-100' };
  return { label: 'Còn hàng', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
}

const PAGE_BTN = (active: boolean) =>
  `px-2.5 py-1 border rounded-md transition-all font-extrabold ${
    active
      ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-white'
      : 'border-slate-300 text-slate-700 hover:border-blue-600 bg-white hover:text-blue-600 cursor-pointer'
  }`;

export default function StockTable({ products, loading, page, totalPages, setPage }: Props) {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 p-24 text-center text-slate-400 font-bold rounded-xl shadow-2xs">
        Đang tải dữ liệu hàng tồn kho...
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
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
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
            {products.map((p) => {
              const qty = p.stock || 0;
              const { label, cls } = stockStatus(qty);
              const qtyColor = qty === 0 ? 'text-slate-400' : qty <= 5 ? 'text-rose-600' : 'text-slate-800';
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
                  <td className={`py-3.5 px-4 text-right font-black font-mono ${qtyColor}`}>{qty}</td>
                  <td className="py-3.5 px-4 text-right font-bold font-mono text-slate-500">{p.faultyQty || 0}</td>
                  <td className="py-3.5 px-4 text-center text-slate-500 font-semibold uppercase">{p.unit}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${cls}`}>{label}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-400 font-semibold">
                    {p.updatedAt
                      ? new Date(p.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ', Hôm nay'
                      : 'Hôm nay'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex justify-between items-center text-slate-500 select-none font-bold text-[10px]">
        <span>Trang {page} / {totalPages || 1}</span>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className={PAGE_BTN(page === 1)}>&lt;</button>
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
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className={PAGE_BTN(page === totalPages)}>&gt;</button>
          </div>
        )}
      </div>
    </div>
  );
}
