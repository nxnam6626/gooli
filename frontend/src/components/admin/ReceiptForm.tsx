"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash, SpinnerGap } from "@phosphor-icons/react";

const receiptSchema = z.object({
  partnerId: z.coerce.number().optional().nullable(),
  note: z.string().optional(),
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
}

interface Partner {
  id: number;
  code: string;
  name: string;
  type: string;
}

export default function ReceiptForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const [partners, setPartners] = useState<Partner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ReceiptFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(receiptSchema) as any,
    defaultValues: {
      items: [{ productId: 0, isFaulty: false, quantity: 1, price: 0 }],
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
          fetch("http://localhost:3001/api/v1/partners", { headers }),
          fetch("http://localhost:3001/api/v1/products?limit=1000", { headers }),
        ]);

        if (resPartners.ok) {
          const data = await resPartners.json();
          setPartners(data.filter((p: Partner) => p.type === "SUPPLIER"));
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
        ...data,
        partnerId: data.partnerId || null,
        items: data.items.map((item) => ({
          ...item,
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {globalError && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-none text-sm border border-rose-200/50 font-bold">
          {globalError}
        </div>
      )}

      {/* Thông tin chung */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 border border-slate-200 rounded-xl">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Nhà cung cấp
          </label>
          <select
            {...register("partnerId")}
            className="w-full border border-slate-200 bg-white rounded-lg p-2.5 text-sm font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]/20 transition-colors cursor-pointer"
          >
            <option value="">-- Chọn Nhà cung cấp --</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Ghi chú
          </label>
          <input
            {...register("note")}
            placeholder="Nhập ghi chú cho phiếu nhập..."
            className="w-full border border-slate-200 bg-white rounded-lg p-2.5 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]/20 transition-colors"
          />
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="bg-white shadow-[0_4px_20px_rgba(15,23,42,0.02)] border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chi tiết Hàng hóa</h3>
          <button
            type="button"
            onClick={() => append({ productId: 0, isFaulty: false, quantity: 1, price: 0 })}
            className="flex items-center gap-1.5 text-xs font-bold text-[#2563eb] hover:text-blue-700 transition-colors cursor-pointer"
          >
            <Plus size={14} weight="bold" /> Thêm dòng
          </button>
        </div>

        {errors.items?.message && (
          <div className="px-6 py-3 bg-rose-50 text-rose-700 text-xs border-b border-rose-100 font-bold">
            {errors.items.message}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-400">
              <tr>
                <th className="px-6 py-3 font-bold text-[10px] uppercase tracking-wider">Sản phẩm *</th>
                <th className="px-6 py-3 font-bold text-[10px] uppercase tracking-wider w-32">Số lượng *</th>
                <th className="px-6 py-3 font-bold text-[10px] uppercase tracking-wider w-40">Giá nhập *</th>
                <th className="px-6 py-3 font-bold text-[10px] uppercase tracking-wider w-36 text-center">Phân loại</th>
                <th className="px-6 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fields.map((field, index) => (
                <tr key={field.id} className="hover:bg-slate-50/20">
                  <td className="px-6 py-2.5">
                    <select
                      {...register(`items.${index}.productId`)}
                      className="w-full border border-slate-200 bg-white rounded-lg p-2 text-sm font-semibold text-slate-800 focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]/20 transition-colors cursor-pointer"
                    >
                      <option value="0">-- Chọn sản phẩm --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.sku ? `[${p.sku}] ` : ""} {p.name}
                        </option>
                      ))}
                    </select>
                    {errors.items?.[index]?.productId && (
                      <p className="text-rose-600 text-[10px] font-bold mt-1">
                        {errors.items[index]?.productId?.message}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-2.5">
                    <input
                      type="number"
                      {...register(`items.${index}.quantity`)}
                      className="w-full border border-slate-200 bg-white rounded-lg p-2 text-sm font-mono font-semibold text-slate-800 text-right focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]/20 transition-colors"
                    />
                    {errors.items?.[index]?.quantity && (
                      <p className="text-rose-600 text-[10px] font-bold mt-1">
                        {errors.items[index]?.quantity?.message}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-2.5">
                    <input
                      type="number"
                      {...register(`items.${index}.price`)}
                      className="w-full border border-slate-200 bg-white rounded-lg p-2 text-sm font-mono font-semibold text-slate-800 text-right focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]/20 transition-colors"
                    />
                    {errors.items?.[index]?.price && (
                      <p className="text-rose-600 text-[10px] font-bold mt-1">
                        {errors.items[index]?.price?.message}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-2.5 text-center">
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        {...register(`items.${index}.isFaulty`)}
                        className="rounded border-slate-300 text-[#2563eb] focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-[11px] text-slate-600 font-bold uppercase tracking-wider">Lỗi/Hỏng</span>
                    </label>
                  </td>
                  <td className="px-6 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      disabled={fields.length === 1}
                    >
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors text-sm font-bold rounded-lg shadow-sm cursor-pointer"
        >
          Hủy bỏ
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm shadow-blue-500/10 transition-colors disabled:opacity-75 flex items-center gap-2 cursor-pointer"
        >
          {loading && <SpinnerGap size={18} className="animate-spin" />}
          Lưu Phiếu Nhập
        </button>
      </div>
    </form>
  );
}
