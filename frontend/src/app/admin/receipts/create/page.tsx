import ReceiptForm from "@/components/admin/ReceiptForm";

export const metadata = {
  title: "Tạo Phiếu Nhập Kho | Gooli Admin",
};

export default function CreateReceiptPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
          Tạo Phiếu Nhập Kho
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          Nhập hàng hóa từ nhà cung cấp vào kho. Tồn kho sẽ tự động được cộng dồn sau khi lưu.
        </p>
      </div>
      
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm p-6 shadow-sm">
        <ReceiptForm />
      </div>
    </div>
  );
}
