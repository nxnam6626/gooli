"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Plus, 
  Trash, 
  SpinnerGap, 
  ClipboardText, 
  QrCode, 
  CaretDown, 
  CloudArrowUp, 
  ListDashes 
} from "@phosphor-icons/react";

const receiptSchema = z.object({
  partnerId: z.coerce.number().optional().nullable(),
  note: z.string().optional(),
  expectedDeliveryDate: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.coerce.number().min(1, "Vui lòng chọn sản phẩm"),
        isFaulty: z.boolean().default(false),
        quantity: z.coerce.number().min(1, "Số lượng phải > 0"),
        price: z.coerce.number().min(0, "Giá không hợp lệ"),
      })
    )
    .min(1, "Phải có ít nhất 1 sản phẩm để nhập kho"),
});

type ReceiptFormValues = z.infer<typeof receiptSchema>;

interface Product {
  id: number;
  sku: string;
  name: string;
  unit: string;
  pricePerM2?: number;
}

interface Partner {
  id: number;
  code: string;
  name: string;
  type: string;
}

const fmt = (n: number | string) =>
  Number(n).toLocaleString("vi-VN");

export default function ReceiptForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const [partners, setPartners] = useState<Partner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptSchema) as any,
    defaultValues: {
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("gooli_token");
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [resPartners, resProds] = await Promise.all([
          fetch("http://localhost:3001/api/v1/partners?limit=100&type=SUPPLIER", { headers }),
          fetch("http://localhost:3001/api/v1/products?limit=1000", { headers }),
        ]);

        if (resPartners.ok) {
          const data = await resPartners.json();
          setPartners(Array.isArray(data) ? data : data.items || []);
        }
        if (resProds.ok) {
          const data = await resProds.json();
          setProducts(data.items || []);
        }
      } catch (err) {
        console.error("Failed to load master data", err);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data: ReceiptFormValues) => {
    setLoading(true);
    setGlobalError("");
    try {
      const token = localStorage.getItem("gooli_token");
      const payload = {
        partnerId: data.partnerId || null,
        note: data.note || null,
        expectedDeliveryDate: data.expectedDeliveryDate || null,
        items: data.items.map((item) => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          price: Number(item.price),
          vatRate: 10,
          isFaulty: !!item.isFaulty,
        })),
      };

      const res = await fetch("http://localhost:3001/api/v1/receipts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Lỗi khi tạo phiếu nhập");
      }

      router.push("/admin/receipts");
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  const incrementQty = (index: number) => {
    const val = Number(getValues(`items.${index}.quantity`) || 0);
    setValue(`items.${index}.quantity`, val + 1, { shouldValidate: true });
  };

  const decrementQty = (index: number) => {
    const val = Number(getValues(`items.${index}.quantity`) || 0);
    if (val > 1) {
      setValue(`items.${index}.quantity`, val - 1, { shouldValidate: true });
    }
  };

  const watchedItems = watch("items") || [];

  const totals = React.useMemo(() => {
    const uniqueProductsCount = watchedItems.length;
    const totalQty = watchedItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const subtotal = watchedItems.reduce((sum, item) => {
      const price = Number(item.price || 0);
      return sum + (Number(item.quantity || 0) * price);
    }, 0);
    const vat = subtotal * 0.1;
    const total = subtotal + vat;

    return {
      uniqueProductsCount,
      totalQty,
      vat,
      total
    };
  }, [watchedItems]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectProduct = (product: Product) => {
    const existsIndex = watchedItems.findIndex(item => Number(item.productId) === product.id);
    if (existsIndex > -1) {
      const currentQty = Number(watchedItems[existsIndex].quantity || 0);
      setValue(`items.${existsIndex}.quantity`, currentQty + 1, { shouldValidate: true });
    } else {
      append({ 
        productId: product.id, 
        isFaulty: false, 
        quantity: 1, 
        price: product.pricePerM2 || 0 
      });
    }
    setSearchQuery("");
    setShowDropdown(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {globalError && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-xl text-xs border border-rose-200/50 font-bold">
          [Lỗi]: {globalError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: Receipt Info Form */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-2">
            <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ClipboardText size={18} className="text-[#2563eb]" />
              <span>Thông tin Phiếu nhập</span>
            </h2>
            <span className="bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
              Draft
            </span>
          </div>

          {/* Chọn nhà cung cấp */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Chọn nhà cung cấp *
            </label>
            <div className="relative">
              <select
                {...register("partnerId")}
                className="w-full border border-slate-300 bg-white rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]/20 cursor-pointer appearance-none"
              >
                <option value="">Tìm kiếm hoặc chọn mới...</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
              <CaretDown size={12} className="text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
            {errors.partnerId && (
              <p className="text-rose-600 text-[10px] font-bold">{errors.partnerId.message}</p>
            )}
          </div>

          {/* Ngày dự kiến nhận + Mã phiếu */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Ngày dự kiến nhận
              </label>
              <input
                type="date"
                {...register("expectedDeliveryDate")}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-800 focus:border-[#2563eb] focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Mã phiếu
              </label>
              <input
                type="text"
                disabled
                value="PN-20260614-001"
                className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-400 text-center"
              />
            </div>
          </div>

          {/* Ghi chú */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Ghi chú
            </label>
            <textarea
              {...register("note")}
              rows={3}
              placeholder="Nhập ghi chú chi tiết cho đơn hàng này..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none placeholder-slate-400"
            />
          </div>

          {/* Metadata info */}
          <div className="border-t border-slate-100 pt-3.5 space-y-2 text-xs font-semibold text-slate-600">
            <div className="flex justify-between items-center">
              <span>Người tạo:</span>
              <strong className="text-slate-800">Hoàng Trần (WMS_001)</strong>
            </div>
            <div className="flex justify-between items-center">
              <span>Kho đích:</span>
              <strong className="text-slate-800">Tổng kho Miền Bắc</strong>
            </div>
          </div>

          {/* Upload Attachments Area */}
          <div className="border border-slate-200 border-dashed rounded-xl p-4 text-center cursor-pointer bg-slate-50/50 hover:bg-slate-100/30 transition-colors">
            <div className="flex flex-col items-center gap-1.5 text-slate-500">
              <CloudArrowUp size={24} className="text-[#2563eb]" />
              <span className="text-[11px] font-bold text-slate-700">Tải lên chứng từ đính kèm</span>
              <span className="text-[9px] text-slate-400">Hỗ trợ PDF, JPG, PNG tối đa 5MB</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Product List Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            {/* Header bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-5 py-4 bg-slate-50 border-b border-slate-200 gap-3">
              <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                <ListDashes size={18} className="text-[#2563eb]" />
                <span>Danh sách Sản phẩm</span>
              </h3>
              
              {/* Product search box */}
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Quét mã vạch hoặc nhập tên SP, mã SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full bg-white border border-slate-300 rounded-lg py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none"
                />
                <QrCode size={16} className="text-slate-400 absolute right-3 top-2 pointer-events-none" />

                {/* Click backdrop to close dropdown */}
                {showDropdown && (
                  <div className="fixed inset-0 z-40 bg-transparent cursor-default" onClick={() => setShowDropdown(false)} />
                )}

                {/* Dropdown list */}
                {showDropdown && (
                  <div className="absolute right-0 top-full mt-1.5 w-full sm:w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-100">
                    {filteredProducts.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 italic">Không tìm thấy sản phẩm nào</div>
                    ) : (
                      filteredProducts.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleSelectProduct(p)}
                          className="p-3 hover:bg-blue-50/10 cursor-pointer flex justify-between items-center text-left"
                        >
                          <div>
                            <div className="font-bold text-slate-800 text-xs">{p.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {p.sku}</div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{p.unit}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {errors.items?.message && (
              <div className="px-5 py-2.5 bg-rose-50 text-rose-700 text-xs border-b border-rose-100 font-bold">
                [Lỗi]: {errors.items.message}
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse text-slate-700">
                <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-400">
                  <tr>
                    <th className="px-5 py-3 font-bold text-[10px] uppercase tracking-wider w-12 text-center">STT</th>
                    <th className="px-5 py-3 font-bold text-[10px] uppercase tracking-wider">Tên sản phẩm</th>
                    <th className="px-5 py-3 font-bold text-[10px] uppercase tracking-wider w-32 text-center">Số lượng</th>
                    <th className="px-5 py-3 font-bold text-[10px] uppercase tracking-wider w-36 text-right">Đơn giá</th>
                    <th className="px-5 py-3 font-bold text-[10px] uppercase tracking-wider w-36 text-right">Thành tiền</th>
                    <th className="px-5 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fields.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center text-slate-400 font-bold">
                        Chưa có sản phẩm nào. Hãy quét mã hoặc tìm sản phẩm ở góc trên để thêm vào phiếu.
                      </td>
                    </tr>
                  ) : (
                    fields.map((field, index) => {
                      const prod = products.find(p => p.id === Number(field.productId));
                      return (
                        <tr key={field.id} className="hover:bg-slate-50/10">
                          {/* STT */}
                          <td className="px-5 py-3.5 text-center text-slate-400 font-bold font-mono">
                            {String(index + 1).padStart(2, '0')}
                          </td>

                          {/* Product details */}
                          <td className="px-5 py-3.5 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0 text-slate-400">
                              📸
                            </div>
                            <div className="flex flex-col">
                              <span className="font-extrabold text-slate-900 leading-snug">{prod?.name || "Sản phẩm"}</span>
                              <span className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {prod?.sku || "—"}</span>
                            </div>
                          </td>

                          {/* Quantity selector pill */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center border border-slate-200 rounded-full bg-white px-2 py-1 justify-between gap-1 w-28 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => decrementQty(index)}
                                className="w-6 h-6 flex items-center justify-center font-bold text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                {...register(`items.${index}.quantity`)}
                                className="w-10 text-center border-none bg-transparent outline-none focus:ring-0 font-mono font-bold text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => incrementQty(index)}
                                className="w-6 h-6 flex items-center justify-center font-bold text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Unit price */}
                          <td className="px-5 py-3.5">
                            <div className="relative flex items-center justify-end">
                              <input
                                type="number"
                                {...register(`items.${index}.price`)}
                                className="w-28 border border-slate-200 bg-white rounded-lg p-1.5 text-xs font-mono font-bold text-slate-800 text-right focus:border-[#2563eb] focus:outline-none"
                              />
                            </div>
                          </td>

                          {/* Subtotal */}
                          <td className="px-5 py-3.5 text-right font-mono font-extrabold text-slate-900">
                            {fmt(Number(watchedItems[index]?.quantity || 0) * Number(watchedItems[index]?.price || 0))}đ
                          </td>

                          {/* Action remove */}
                          <td className="px-5 py-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="p-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                            >
                              <Trash size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Totals summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
            {/* Card 1 */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider block mb-1">Tổng sản phẩm</span>
              <span className="text-sm font-black text-slate-900"><span className="text-blue-600">{totals.uniqueProductsCount}</span> mặt hàng</span>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider block mb-1">Tổng số lượng</span>
              <span className="text-sm font-black text-slate-900"><span className="text-blue-600">{totals.totalQty}</span> kiện</span>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider block mb-1">VAT (10%)</span>
              <span className="text-sm font-extrabold text-blue-600">{fmt(totals.vat)}đ</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold rounded-lg transition-colors text-xs cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading || fields.length === 0}
              className="px-6 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-xs cursor-pointer shadow-sm shadow-blue-500/10 flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <SpinnerGap size={14} className="animate-spin" />}
              <span>Lưu Phiếu Nhập</span>
            </button>
          </div>
        </div>

      </div>
    </form>
  );
}
