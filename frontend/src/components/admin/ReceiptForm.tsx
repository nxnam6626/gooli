"use client";

import { useState, useEffect } from "react";
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

export default function ReceiptForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const [partners, setPartners] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ReceiptFormValues>({
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
          // Lọc nhà cung cấp
          setPartners(data.filter((p: any) => p.type === "SUPPLIER"));
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
      // Clean up empty optional fields
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
    } catch (err: any) {
      setGlobalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {globalError && (
        <div className="bg-red-50 text-red-600 p-3 rounded-sm text-sm border border-red-200">
          {globalError}
        </div>
      )}

      {/* Thông tin chung */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1">
            Nhà cung cấp
          </label>
          <select
            {...register("partnerId")}
            className="w-full border border-neutral-300 rounded-sm p-2 text-sm focus:border-[#B06518] focus:outline-none"
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
          <label className="block text-sm font-semibold text-neutral-700 mb-1">
            Ghi chú
          </label>
          <input
            {...register("note")}
            placeholder="Nhập ghi chú cho phiếu nhập..."
            className="w-full border border-neutral-300 rounded-sm p-2 text-sm focus:border-[#B06518] focus:outline-none"
          />
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div>
        <div className="flex justify-between items-center mb-4 border-b border-neutral-200 pb-2">
          <h3 className="text-lg font-bold text-neutral-800">Chi tiết Hàng hóa</h3>
          <button
            type="button"
            onClick={() => append({ productId: 0, isFaulty: false, quantity: 1, price: 0 })}
            className="flex items-center gap-1 text-sm font-semibold text-[#B06518] hover:text-[#905212]"
          >
            <Plus size={16} weight="bold" /> Thêm dòng
          </button>
        </div>

        {errors.items?.message && (
          <p className="text-red-500 text-xs mb-2">{errors.items.message}</p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600">
              <tr>
                <th className="px-3 py-2 font-semibold">Sản phẩm *</th>
                <th className="px-3 py-2 font-semibold w-24">Số lượng *</th>
                <th className="px-3 py-2 font-semibold w-32">Giá nhập *</th>
                <th className="px-3 py-2 font-semibold w-28 text-center">Phân loại</th>
                <th className="px-3 py-2 font-semibold w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {fields.map((field, index) => (
                <tr key={field.id}>
                  <td className="px-3 py-2">
                    <select
                      {...register(`items.${index}.productId`)}
                      className="w-full border border-neutral-300 rounded-sm p-2 focus:border-[#B06518] focus:outline-none"
                    >
                      <option value="0">-- Chọn sản phẩm --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.sku ? `[${p.sku}] ` : ""} {p.name}
                        </option>
                      ))}
                    </select>
                    {errors.items?.[index]?.productId && (
                      <p className="text-red-500 text-[10px] mt-1">
                        {errors.items[index]?.productId?.message}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      {...register(`items.${index}.quantity`)}
                      className="w-full border border-neutral-300 rounded-sm p-2 focus:border-[#B06518] focus:outline-none"
                    />
                    {errors.items?.[index]?.quantity && (
                      <p className="text-red-500 text-[10px] mt-1">
                        {errors.items[index]?.quantity?.message}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      {...register(`items.${index}.price`)}
                      className="w-full border border-neutral-300 rounded-sm p-2 focus:border-[#B06518] focus:outline-none"
                    />
                    {errors.items?.[index]?.price && (
                      <p className="text-red-500 text-[10px] mt-1">
                        {errors.items[index]?.price?.message}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        {...register(`items.${index}.isFaulty`)}
                        className="rounded border-neutral-300 text-[#B06518] focus:ring-[#B06518] w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs text-neutral-600 font-semibold">Lỗi/Hỏng</span>
                    </label>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-neutral-400 hover:text-red-500 transition-colors"
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

      {/* Nút Submit */}
      <div className="flex justify-end gap-3 pt-6 border-t border-neutral-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-neutral-300 rounded-sm text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
        >
          Hủy bỏ
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-[#B06518] hover:bg-[#905212] text-white rounded-sm text-sm font-semibold transition-colors disabled:opacity-70 flex items-center gap-2"
        >
          {loading && <SpinnerGap size={18} className="animate-spin" />}
          Lưu Phiếu Nhập
        </button>
      </div>
    </form>
  );
}
