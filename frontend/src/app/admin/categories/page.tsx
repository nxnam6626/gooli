"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  getPartnerGroups, createPartnerGroup, updatePartnerGroup, deletePartnerGroup,
  getUnits, createUnit, updateUnit, deleteUnit,
  getCategories, createCategory, updateCategory, deleteCategory
} from "../../../services/api";
import { SignIn, SignOut, Warehouse, Tag, Pencil, Trash, CircleNotch } from "@phosphor-icons/react";

// ─── Types ────────────────────────────────────────────────────────────────────
type SimpleItem = { id: number; code: string; name: string; createdAt?: string };
type Category = { id: number; name: string; slug: string; createdAt?: string };

const TABS = [
  { key: "itemClasses", label: "Nhóm hàng" },
  { key: "units", label: "Đơn vị tính" },
  { key: "partnerGroups", label: "Nhóm đối tác" },
  { key: "partners", label: "Đối tác" },
  { key: "products", label: "Hàng hóa" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

// ─── Simple CRUD Panel (for Partner Groups & Units) ───────────────────────────
function SimpleCrudPanel({
  title, items, onAdd, onUpdate, onDelete, loading,
}: {
  title: string;
  items: SimpleItem[];
  onAdd: (code: string, name: string) => Promise<void>;
  onUpdate: (id: number, code: string, name: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  loading: boolean;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showMsg = (type: "success" | "error", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      showMsg("error", "Vui lòng nhập đầy đủ Mã và Tên.");
      return;
    }
    setSaving(true);
    try {
      if (editId !== null) {
        await onUpdate(editId, code.trim(), name.trim());
        showMsg("success", "Cập nhật thành công!");
      } else {
        await onAdd(code.trim(), name.trim());
        showMsg("success", "Thêm mới thành công!");
      }
      setCode("");
      setName("");
      setEditId(null);
    } catch (e: unknown) {
      showMsg("error", e instanceof Error ? e.message : "Đã xảy ra lỗi.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: SimpleItem) => {
    setEditId(item.id);
    setCode(item.code);
    setName(item.name);
  };

  const handleCancel = () => {
    setEditId(null);
    setCode("");
    setName("");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa mục này?")) return;
    try {
      await onDelete(id);
      showMsg("success", "Đã xóa thành công.");
    } catch (e: unknown) {
      showMsg("error", e instanceof Error ? e.message : "Xóa thất bại.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-black text-slate-900 tracking-tight">{title}</h2>
      </div>

      {msg && (
        <div className={`p-3.5 rounded-lg border text-xs font-semibold ${
          msg.type === "success" 
            ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
            : "bg-rose-50 text-rose-700 border-rose-100"
        }`}>
          {msg.text}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider">
          {editId !== null ? "✏️ Chỉnh sửa thông tin" : "➕ Thêm mới"}
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Mã *"
            className="flex-1 min-w-[120px] bg-white border border-slate-300 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên *"
            className="flex-1 min-w-[160px] bg-white border border-slate-300 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-lg transition-all text-xs cursor-pointer shadow-sm shadow-blue-500/10 flex items-center gap-1.5"
          >
            {saving && <CircleNotch size={14} className="animate-spin" />}
            <span>{editId !== null ? "Cập nhật" : "Thêm mới"}</span>
          </button>
          {editId !== null && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-lg transition-all text-xs cursor-pointer bg-white"
            >
              Huỷ
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-slate-700">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4 w-1/4">Mã</th>
                <th className="py-3 px-4">Tên</th>
                <th className="py-3 px-4 w-28 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 font-bold">
                    <div className="flex justify-center items-center gap-2">
                      <CircleNotch size={16} className="animate-spin text-[#2563eb]" />
                      <span>Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 font-bold">
                    Chưa có dữ liệu.
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={item.id} className={`hover:bg-slate-50/50 transition-colors text-[11px] ${editId === item.id ? "bg-blue-50/20" : ""}`}>
                    <td className="py-3 px-4 text-center text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{item.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{item.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 border border-slate-200 text-slate-500 hover:text-[#2563eb] hover:bg-blue-50 bg-white rounded-lg transition-all cursor-pointer"
                          title="Sửa"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 bg-white rounded-lg transition-all cursor-pointer"
                          title="Xóa"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Category CRUD Panel ──────────────────────────────────────────────────────
function CategoryCrudPanel({
  items, onAdd, onUpdate, onDelete, loading,
}: {
  items: Category[];
  onAdd: (name: string) => Promise<void>;
  onUpdate: (id: number, name: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  loading: boolean;
}) {
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showMsg = (type: "success" | "error", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showMsg("error", "Vui lòng nhập tên nhóm hàng.");
      return;
    }
    setSaving(true);
    try {
      if (editId !== null) {
        await onUpdate(editId, name.trim());
        showMsg("success", "Cập nhật nhóm hàng thành công!");
      } else {
        await onAdd(name.trim());
        showMsg("success", "Thêm nhóm hàng thành công!");
      }
      setName("");
      setEditId(null);
    } catch (e: unknown) {
      showMsg("error", e instanceof Error ? e.message : "Đã xảy ra lỗi.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat: Category) => {
    setEditId(cat.id);
    setName(cat.name);
  };

  const handleCancel = () => {
    setEditId(null);
    setName("");
  };

  const handleDelete = async (id: number, catName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa nhóm hàng "${catName}"?`)) return;
    try {
      await onDelete(id);
      showMsg("success", "Đã xóa nhóm hàng.");
    } catch (e: unknown) {
      showMsg("error", e instanceof Error ? e.message : "Xóa thất bại.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-black text-slate-900 tracking-tight">Danh sách Nhóm hàng</h2>
      </div>

      {msg && (
        <div className={`p-3.5 rounded-lg border text-xs font-semibold ${
          msg.type === "success" 
            ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
            : "bg-rose-50 text-rose-700 border-rose-100"
        }`}>
          {msg.text}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider">
          {editId !== null ? "✏️ Sửa tên nhóm hàng" : "➕ Thêm nhóm hàng mới"}
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên nhóm hàng *"
            className="flex-1 min-w-[200px] bg-white border border-slate-300 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-lg transition-all text-xs cursor-pointer shadow-sm shadow-blue-500/10 flex items-center gap-1.5"
          >
            {saving && <CircleNotch size={14} className="animate-spin" />}
            <span>{editId !== null ? "Cập nhật" : "Thêm mới"}</span>
          </button>
          {editId !== null && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-lg transition-all text-xs cursor-pointer bg-white"
            >
              Huỷ
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-slate-700">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4">Tên nhóm hàng</th>
                <th className="py-3 px-4 w-1/3">Slug</th>
                <th className="py-3 px-4 w-28 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 font-bold">
                    <div className="flex justify-center items-center gap-2">
                      <CircleNotch size={16} className="animate-spin text-[#2563eb]" />
                      <span>Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 font-bold">
                    Chưa có nhóm hàng.
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={item.id} className={`hover:bg-slate-50/50 transition-colors text-[11px] ${editId === item.id ? "bg-blue-50/20" : ""}`}>
                    <td className="py-3 px-4 text-center text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{item.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{item.slug}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 border border-slate-200 text-slate-500 hover:text-[#2563eb] hover:bg-blue-50 bg-white rounded-lg transition-all cursor-pointer"
                          title="Sửa"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="p-1.5 border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 bg-white rounded-lg transition-all cursor-pointer"
                          title="Xóa"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Redirect Panel (for Partners & Products) ────────────────────────────────
function RedirectPanel({ label, href, description }: { label: string; href: string; description: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-black text-slate-900 tracking-tight">{label}</h2>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center bg-slate-50 rounded-xl border border-slate-200 border-dashed">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-[#2563eb] flex items-center justify-center text-2xl font-bold">
          📋
        </div>
        <div className="max-w-xs space-y-1">
          <div className="text-sm font-extrabold text-slate-900">{label}</div>
          <div className="text-slate-500 text-xs font-semibold leading-relaxed">{description}</div>
        </div>
        <Link 
          href={href}
          className="px-6 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-lg transition-all text-xs cursor-pointer shadow-sm shadow-blue-500/10 no-underline"
        >
          Đi đến trang quản lý →
        </Link>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("itemClasses");
  const [token] = useState(() => 
    typeof window !== "undefined" ? localStorage.getItem("gooli_token") || "" : ""
  );

  const [partnerGroups, setPartnerGroups] = useState<SimpleItem[]>([]);
  const [units, setUnits] = useState<SimpleItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (tab: TabKey) => {
    setLoading(true);
    try {
      if (tab === "partnerGroups" && token) setPartnerGroups(await getPartnerGroups(token));
      if (tab === "units" && token) setUnits(await getUnits(token));
      if (tab === "itemClasses") setCategories(await getCategories());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token || activeTab === "itemClasses") {
      Promise.resolve().then(() => {
        load(activeTab);
      });
    }
  }, [activeTab, load, token]);

  const switchTab = (key: TabKey) => setActiveTab(key);

  const renderPanel = () => {
    switch (activeTab) {
      case "partnerGroups":
        return (
          <SimpleCrudPanel
            title="Nhóm đối tác"
            items={partnerGroups}
            loading={loading}
            onAdd={async (code, name) => { await createPartnerGroup(token, { code, name }); await load("partnerGroups"); }}
            onUpdate={async (id, code, name) => { await updatePartnerGroup(token, id, { code, name }); await load("partnerGroups"); }}
            onDelete={async (id) => { await deletePartnerGroup(token, id); await load("partnerGroups"); }}
          />
        );

      case "units":
        return (
          <SimpleCrudPanel
            title="Đơn vị tính"
            items={units}
            loading={loading}
            onAdd={async (code, name) => { await createUnit(token, { code, name }); await load("units"); }}
            onUpdate={async (id, code, name) => { await updateUnit(token, id, { code, name }); await load("units"); }}
            onDelete={async (id) => { await deleteUnit(token, id); await load("units"); }}
          />
        );

      case "itemClasses":
        return (
          <CategoryCrudPanel
            items={categories}
            loading={loading}
            onAdd={async (name) => { await createCategory(name, token); await load("itemClasses"); }}
            onUpdate={async (id, name) => { await updateCategory(id, name, token); await load("itemClasses"); }}
            onDelete={async (id) => { await deleteCategory(id, token); await load("itemClasses"); }}
          />
        );

      case "partners":
        return (
          <RedirectPanel
            label="Đối tác"
            href="/admin/partners"
            description="Quản lý nhà cung cấp và khách hàng tại trang chuyên biệt."
          />
        );

      case "products":
        return (
          <RedirectPanel
            label="Hàng hóa"
            href="/admin/products"
            description="Quản lý danh mục sản phẩm, tồn kho tại trang chuyên biệt."
          />
        );
    }
  };

  return (
    <div className="space-y-6 font-sans text-xs pb-10">
      
      {/* 1. Header (Title + Buttons) */}
      <div className="flex justify-between items-center select-none">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Quản lý Kho hàng</h1>
          <p className="text-slate-500 mt-1 text-[11px]">Cập nhật và theo dõi tồn kho theo thời gian thực.</p>
        </div>
      </div>



      {/* 3. Grid container */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Left sidebar: Nav options */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs p-3 space-y-1">
          {TABS.map(tab => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => switchTab(tab.key)}
                className={`w-full text-left px-4 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-between cursor-pointer ${
                  active 
                    ? "bg-blue-50 text-[#2563eb]" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                {active && <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb]"></span>}
              </button>
            );
          })}
        </div>

        {/* Right side: Content Panel */}
        <div className="md:col-span-3 bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
          {renderPanel()}
        </div>
      </div>

    </div>
  );
}
