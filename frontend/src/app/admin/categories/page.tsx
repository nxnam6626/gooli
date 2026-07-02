"use client";

import React, { useState, useEffect } from "react";
import { getPublicCategories, savePublicCategories } from "@/services/api";
import { CategorySidebar, CategoryEditor } from "@/features/website-settings/components/content/categories";
import { Category } from "@/features/website-settings/constants/contentConstants";
import { FloppyDisk, CheckCircle, CircleNotch } from "@phosphor-icons/react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [initialCategories, setInitialCategories] = useState<Category[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [modalSel, setModalSel] = useState<{ type: "category" | "submenu"; catIdx: number; subIdx?: number } | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: "" });

  const token = typeof window !== "undefined" ? localStorage.getItem("gooli_token") || "" : "";

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 3000);
  };

  useEffect(() => {
    let active = true;
    getPublicCategories()
      .then((data) => {
        if (active) {
          setCategories(data || []);
        }
      })
      .catch((err) => {
        console.error("Failed to load categories:", err);
        if (active) {
          showToast("Không thể tải danh sách danh mục.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const startEditingSession = (idx: number | null) => {
    setEditingIndex(idx);
    if (idx !== null) {
      setInitialCategories(JSON.parse(JSON.stringify(categories)));
    } else {
      setInitialCategories(null);
    }
  };

  const handleSave = async (customCats?: Category[]) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const catsToSave = customCats || categories;
      await savePublicCategories(catsToSave, token);
      showToast("Lưu cấu trúc danh mục thành công!");
      startEditingSession(null);
      setModalSel(null);
    } catch (err) {
      console.error("Failed to save categories:", err);
      showToast(err instanceof Error ? err.message : "Lưu thất bại.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateCategories = async (newCats: Category[]) => {
    setCategories(newCats);
    if (editingIndex === null) {
      try {
        await savePublicCategories(newCats, token);
        showToast("Đã tự động cập nhật thứ tự danh mục!");
      } catch (err) {
        console.error("Auto-save drag-and-drop order failed:", err);
      }
    }
  };

  return (
    <div className="space-y-6 font-sans text-xs pb-10">
      <div className="flex justify-between items-center pb-1 border-b border-slate-200 select-none">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Cấu trúc danh mục sản phẩm
          </h1>
          <p className="text-slate-500 mt-1 text-[11px]">
            Quản lý sơ đồ danh mục, mô tả và liên kết hiển thị cho khách hàng trên public website.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 text-slate-400 font-bold gap-2">
            <CircleNotch size={24} className="animate-spin text-[#2563eb]" />
            <span className="text-[11px]">Đang tải cấu trúc danh mục...</span>
          </div>
        ) : (
          <CategorySidebar
            categories={categories}
            setCategories={handleUpdateCategories}
            editingIndex={editingIndex}
            setEditingIndex={startEditingSession}
            modalSel={modalSel}
            setModalSel={setModalSel}
          />
        )}
      </div>

      {editingIndex !== null && modalSel !== null && (
        <div className="fixed inset-0 z-50 overflow-hidden select-none">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => {
              if (initialCategories) setCategories(initialCategories);
              startEditingSession(null);
              setModalSel(null);
            }}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen sm:max-w-lg bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-slide-in-right h-full">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                <span className="font-extrabold text-slate-800 text-[11px] uppercase tracking-widest">
                  {modalSel.type === "category" ? "Chỉnh sửa danh mục chính" : "Chỉnh sửa danh mục con"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (initialCategories) setCategories(initialCategories);
                    startEditingSession(null);
                    setModalSel(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors text-base font-bold border-none bg-transparent cursor-pointer outline-none"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin select-text">
                <CategoryEditor
                  categories={categories}
                  setCategories={handleUpdateCategories}
                  resolvedSel={modalSel}
                  setModalSel={setModalSel}
                />
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0 select-none">
                <button
                  type="button"
                  onClick={() => {
                    if (initialCategories) setCategories(initialCategories);
                    startEditingSession(null);
                    setModalSel(null);
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl font-bold cursor-pointer text-[10px] uppercase tracking-wider transition-colors shadow-3xs"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer text-[10px] uppercase tracking-wider transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving ? (
                    <CircleNotch size={14} className="animate-spin" />
                  ) : (
                    <FloppyDisk size={14} />
                  )}
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast.visible && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl shadow-lg transition-all duration-300 animate-slide-in select-none">
          <CheckCircle size={18} className="text-emerald-500" />
          <span className="font-bold text-xs">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
