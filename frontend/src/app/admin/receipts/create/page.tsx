import ReceiptForm from "@/components/admin/ReceiptForm";

export const metadata = {
  title: "Tạo Phiếu Nhập Kho | Gooli Admin",
};

export default function CreateReceiptPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      <div>
        <h1 className="text-xl font-extrabold text-[#1e3a8a] tracking-tight">
          Tạo Phiếu Nhập Kho
        </h1>
        <p className="text-slate-500 text-[11px] mt-1">
          Nhập hàng hóa từ nhà cung cấp vào kho. Tồn kho sẽ tự động được cộng dồn sau khi lưu.
        </p>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
        <ReceiptForm />
      </div>
    </div>
  );
}
