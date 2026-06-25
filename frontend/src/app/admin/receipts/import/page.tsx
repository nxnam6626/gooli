"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  UploadSimple, 
  DownloadSimple, 
  Warning, 
  CheckCircle, 
  FileText,
  SpinnerGap 
} from "@phosphor-icons/react";
import { importReceiptsExcel } from "../../../../services/api";

export default function ExcelImportReceiptsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [importCount, setImportCount] = useState(0);
  const [errors, setErrors] = useState<{ row: number; item: string; error: string }[]>([]);
  const [generalError, setGeneralError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith(".xlsx") || droppedFile.name.endsWith(".xls")) {
        setFile(droppedFile);
        clearMessages();
      } else {
        setGeneralError("Chỉ chấp nhận định dạng file Excel (.xlsx, .xls)");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      clearMessages();
    }
  };

  const clearMessages = () => {
    setErrors([]);
    setGeneralError("");
    setSuccess(false);
  };

  const triggerSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setGeneralError("Vui lòng chọn hoặc kéo thả file Excel trước.");
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const token = localStorage.getItem("gooli_token") || "";
      const result = await importReceiptsExcel(file, token);

      if (result.success) {
        setSuccess(true);
        setImportCount(result.count);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else if (result.errors) {
        setErrors(result.errors);
      } else {
        setGeneralError("Đã có lỗi xảy ra trong quá trình xử lý file.");
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Không thể kết nối đến máy chủ.";
      setGeneralError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-sm pb-10">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link 
            href="/admin/receipts" 
            className="p-2 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Nhập hàng hàng loạt qua Excel</h1>
            <p className="text-slate-500 mt-1">Hỗ trợ lập nhiều phiếu nhập kho, tự động cộng kho đạt chuẩn và ghi nhận dư nợ nhà cung cấp gối đầu.</p>
          </div>
        </div>

        <a 
          href="/template_nhap_kho.xlsx" 
          download="template_nhap_kho.xlsx"
          className="flex items-center gap-2 px-4 py-2 border border-[#B06518] text-[#B06518] hover:bg-amber-50 rounded-md font-bold transition-all"
        >
          <DownloadSimple size={18} weight="bold" />
          Tải file Excel mẫu
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hướng dẫn và Drag/Drop */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleUpload} className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-slate-800">Tải lên tài liệu chứng từ</h2>

            {/* Drag drop zone */}
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={triggerSelectFile}
              className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all ${
                file 
                  ? "border-[#B06518] bg-amber-50/20" 
                  : "border-slate-300 hover:border-[#B06518] bg-slate-50/50"
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".xlsx, .xls"
                className="hidden"
                aria-label="Chọn file Excel nhập kho"
              />
              <div className="flex flex-col items-center gap-3">
                <UploadSimple size={48} className={file ? "text-[#B06518]" : "text-slate-400"} />
                {file ? (
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB - Nhấp vào đây để đổi file khác</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="font-bold text-slate-700">Kéo thả file Excel nhập kho vào đây</p>
                    <p className="text-slate-400 text-xs">hoặc click để duyệt file từ máy tính của bạn (.xlsx, .xls)</p>
                  </div>
                )}
              </div>
            </div>

            {/* General Error message */}
            {generalError && (
              <div className="flex gap-2 items-start bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
                <Warning size={20} className="flex-shrink-0 mt-0.5" />
                <p className="font-semibold">{generalError}</p>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="flex gap-3 items-center bg-emerald-50 text-emerald-800 p-4 rounded-md border border-emerald-200">
                <CheckCircle size={24} className="text-emerald-500 flex-shrink-0" weight="fill" />
                <div>
                  <p className="font-bold">Nhập kho thành công!</p>
                  <p className="text-xs text-emerald-600 mt-0.5">Đã lập thành công {importCount} phiếu nhập kho tự động, cộng kho và ghi nợ gối đầu NCC khớp 100%.</p>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Link 
                href="/admin/receipts" 
                className="px-6 py-2 border border-slate-300 rounded-md font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Quay lại
              </Link>
              <button
                type="submit"
                disabled={loading || !file}
                className="px-6 py-2 bg-[#B06518] hover:bg-[#905212] disabled:opacity-50 text-white rounded-md font-bold transition-colors flex items-center gap-2"
              >
                {loading && <SpinnerGap size={18} className="animate-spin" />}
                Thực hiện nhập kho
              </button>
            </div>
          </form>

          {/* Error Details Board */}
          {errors.length > 0 && (
            <div className="bg-white border border-red-200 rounded-lg shadow-sm overflow-hidden">
              <div className="bg-red-50 border-b border-red-150 px-6 py-3.5 flex items-center gap-2 text-red-700 font-bold">
                <Warning size={18} />
                <span>Phát hiện dữ liệu không hợp lệ ({errors.length} lỗi) - Đã hủy bỏ toàn bộ giao dịch để bảo toàn số liệu</span>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-xs uppercase">
                      <th className="px-6 py-3 w-24">Dòng Excel</th>
                      <th className="px-6 py-3 w-44">Tên cột / Mặt hàng</th>
                      <th className="px-6 py-3">Chi tiết lỗi sai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {errors.map((err, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3.5 font-bold font-mono text-red-600">Dòng {err.row}</td>
                        <td className="px-6 py-3.5 font-semibold text-slate-800">{err.item}</td>
                        <td className="px-6 py-3.5 text-slate-500 font-medium">{err.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Cột hướng dẫn định dạng file */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileText size={22} className="text-[#B06518]" />
              Quy cách file mẫu
            </h2>
            <p className="text-slate-500 leading-relaxed text-xs">
              Mọi lô hàng nhập kho đều phải điền đúng định dạng cột tiêu đề mẫu. Hệ thống kiểm soát tính toàn vẹn và từ chối lưu nếu phát hiện sai lệch.
            </p>

            <hr className="border-slate-100" />

            <div className="space-y-3.5 text-xs">
              <div className="flex gap-2">
                <span className="w-4 h-4 bg-amber-100 text-[#B06518] rounded-full flex items-center justify-center font-bold flex-shrink-0">1</span>
                <div>
                  <p className="font-bold text-slate-800">Mã đối tác (Bắt buộc)</p>
                  <p className="text-slate-500 mt-0.5">Phải là Mã nhà cung cấp trong hệ thống (Ví dụ: `NCC-ALU-FRANCE`).</p>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="w-4 h-4 bg-amber-100 text-[#B06518] rounded-full flex items-center justify-center font-bold flex-shrink-0">2</span>
                <div>
                  <p className="font-bold text-slate-800">Số hóa đơn (Bắt buộc)</p>
                  <p className="text-slate-500 mt-0.5">Dùng để đối chiếu công nợ & VAT đầu vào. Các hàng cùng số hóa đơn sẽ gộp thành 1 phiếu.</p>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="w-4 h-4 bg-amber-100 text-[#B06518] rounded-full flex items-center justify-center font-bold flex-shrink-0">3</span>
                <div>
                  <p className="font-bold text-slate-800">Mã SKU (Bắt buộc)</p>
                  <p className="text-slate-500 mt-0.5">Mã sản phẩm đã khai báo trước trên Web (Ví dụ: `ALU-U-SHAPED`).</p>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="w-4 h-4 bg-amber-100 text-[#B06518] rounded-full flex items-center justify-center font-bold flex-shrink-0">4</span>
                <div>
                  <p className="font-bold text-slate-800">Tài chính (Bắt buộc)</p>
                  <p className="text-slate-500 mt-0.5">`Số lượng` phải là số nguyên &gt; 0. `Đơn giá nhập` là giá gốc trước thuế. `Thuế suất VAT` điền số từ 0 - 100.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
