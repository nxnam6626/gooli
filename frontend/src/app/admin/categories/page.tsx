"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  getCompanyInfo, upsertCompanyInfo,
  getPartnerGroups, createPartnerGroup, updatePartnerGroup, deletePartnerGroup,
  getManufacturers, createManufacturer, updateManufacturer, deleteManufacturer,
  getUnits, createUnit, updateUnit, deleteUnit,
  getCategories,
} from "../../../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type SimpleItem = { id: number; code: string; name: string; createdAt?: string };
type Category   = { id: number; name: string; slug: string; createdAt?: string };
type CompanyInfoType = {
  id?: number; code: string; name: string; phone?: string; email?: string;
  address?: string; taxCode?: string; note?: string;
  auditDate?: string; inventoryDate?: string;
};

const TABS = [
  { key: "company",       label: "Thông tin đơn vị" },
  { key: "partnerGroups", label: "Nhóm đối tác" },
  { key: "manufacturers", label: "Hãng sản xuất" },
  { key: "units",         label: "Đơn vị tính" },
  { key: "itemClasses",   label: "Nhóm hàng" },
  { key: "partners",      label: "Đối tác" },
  { key: "products",      label: "Hàng hóa" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const S = {
  page: { display: "flex", minHeight: "calc(100vh - 120px)", fontFamily: "system-ui,sans-serif", gap: 0 } as React.CSSProperties,
  sidebar: {
    width: 200, flexShrink: 0, background: "#f8fafc", borderRight: "1px solid #e2e8f0",
    padding: "16px 0", display: "flex", flexDirection: "column" as const, gap: 2,
  },
  tab: (active: boolean): React.CSSProperties => ({
    padding: "10px 20px", fontSize: 14, fontWeight: active ? 700 : 500,
    cursor: "pointer", border: "none", background: active ? "#fff7ed" : "transparent",
    borderLeft: active ? "3px solid #B06518" : "3px solid transparent",
    color: active ? "#B06518" : "#475569", textAlign: "left", transition: "all .15s",
  }),
  panel: { flex: 1, padding: "28px 32px", background: "#fff", overflow: "auto" } as React.CSSProperties,
  title: { fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 24px 0" } as React.CSSProperties,
  formRow: { display: "flex", gap: 12, flexWrap: "wrap" as const, marginBottom: 16 },
  input: {
    padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: 8,
    fontSize: 14, color: "#1e293b", outline: "none", flex: 1, minWidth: 160,
  } as React.CSSProperties,
  btnPrimary: {
    padding: "9px 20px", background: "#B06518", color: "#fff", border: "none",
    borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer",
  } as React.CSSProperties,
  btnSecondary: {
    padding: "9px 16px", background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1",
    borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer",
  } as React.CSSProperties,
  btnDanger: {
    padding: "6px 12px", background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5",
    borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: "pointer",
  } as React.CSSProperties,
  btnEdit: {
    padding: "6px 12px", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe",
    borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: "pointer", marginRight: 6,
  } as React.CSSProperties,
  table: { width: "100%", borderCollapse: "collapse" as const, marginTop: 16, fontSize: 14 },
  th: {
    padding: "10px 14px", background: "#f8fafc", borderBottom: "2px solid #e2e8f0",
    textAlign: "left" as const, fontWeight: 700, color: "#64748b", fontSize: 13,
  },
  td: { padding: "10px 14px", borderBottom: "1px solid #f1f5f9", color: "#1e293b" },
  alert: (type: "success"|"error"): React.CSSProperties => ({
    padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 14, fontWeight: 600,
    background: type === "success" ? "#f0fdf4" : "#fef2f2",
    color: type === "success" ? "#16a34a" : "#dc2626",
    border: `1px solid ${type === "success" ? "#bbf7d0" : "#fca5a5"}`,
  }),
  redirectCard: {
    display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center",
    gap: 16, padding: "60px 32px", textAlign: "center" as const,
    background: "#f8fafc", borderRadius: 12, border: "2px dashed #cbd5e1",
  },
  redirectBtn: {
    padding: "12px 28px", background: "#B06518", color: "#fff", borderRadius: 8,
    fontWeight: 700, fontSize: 15, textDecoration: "none", display: "inline-block",
  },
};

// ─── Generic CRUD Panel ───────────────────────────────────────────────────────
function CrudPanel({
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

  const showMsg = (type: "success"|"error", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleSubmit = async () => {
    if (!code.trim() || !name.trim()) { showMsg("error", "Vui lòng nhập đầy đủ Mã và Tên."); return; }
    setSaving(true);
    try {
      if (editId !== null) { await onUpdate(editId, code, name); showMsg("success", "Cập nhật thành công!"); }
      else { await onAdd(code, name); showMsg("success", "Thêm thành công!"); }
      setCode(""); setName(""); setEditId(null);
    } catch (e: unknown) { showMsg("error", e instanceof Error ? e.message : "Lỗi không xác định."); }
    finally { setSaving(false); }
  };

  const handleEdit = (item: SimpleItem) => { setEditId(item.id); setCode(item.code); setName(item.name); };
  const handleCancel = () => { setEditId(null); setCode(""); setName(""); };
  const handleDelete = async (id: number) => {
    if (!confirm("Xác nhận xóa?")) return;
    try { await onDelete(id); showMsg("success", "Đã xóa."); }
    catch (e: unknown) { showMsg("error", e instanceof Error ? e.message : "Xóa thất bại."); }
  };

  return (
    <div>
      <h1 style={S.title}>{title}</h1>
      {msg && <div style={S.alert(msg.type)}>{msg.text}</div>}
      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "20px 24px", marginBottom: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#334155", marginBottom: 14 }}>
          {editId !== null ? "✏️ Chỉnh sửa" : "➕ Thêm mới"}
        </div>
        <div style={S.formRow}>
          <input style={S.input} placeholder="Mã *" value={code} onChange={e => setCode(e.target.value)} />
          <input style={S.input} placeholder="Tên *" value={name} onChange={e => setName(e.target.value)} />
          <button style={S.btnPrimary} onClick={handleSubmit} disabled={saving}>
            {saving ? "Đang lưu..." : editId !== null ? "Cập nhật" : "Thêm mới"}
          </button>
          {editId !== null && <button style={S.btnSecondary} onClick={handleCancel}>Huỷ</button>}
        </div>
      </div>

      {loading ? <div style={{ color: "#94a3b8", padding: 24 }}>Đang tải...</div> : (
        <table style={S.table}>
          <thead><tr>
            <th style={S.th}>STT</th>
            <th style={S.th}>Mã</th>
            <th style={S.th}>Tên</th>
            <th style={S.th}>Thao tác</th>
          </tr></thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={4} style={{ ...S.td, textAlign: "center", color: "#94a3b8", padding: 32 }}>Chưa có dữ liệu</td></tr>
            ) : items.map((item, i) => (
              <tr key={item.id} style={{ background: editId === item.id ? "#eff6ff" : undefined }}>
                <td style={S.td}>{i + 1}</td>
                <td style={{ ...S.td, fontFamily: "monospace", fontWeight: 600 }}>{item.code}</td>
                <td style={S.td}>{item.name}</td>
                <td style={S.td}>
                  <button style={S.btnEdit} onClick={() => handleEdit(item)}>Sửa</button>
                  <button style={S.btnDanger} onClick={() => handleDelete(item.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Company Info Panel ───────────────────────────────────────────────────────
function CompanyInfoPanel({ token }: { token: string }) {
  const [form, setForm] = useState<CompanyInfoType>({
    code: "", name: "", phone: "", email: "", address: "", taxCode: "", note: "",
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: "success"|"error"; text: string }|null>(null);

  const showMsg = (type: "success"|"error", text: string) => {
    setMsg({ type, text }); setTimeout(() => setMsg(null), 3000);
  };

  useEffect(() => {
    getCompanyInfo(token).then(data => {
      if (data) setForm(data);
      setLoading(false);
    });
  }, [token]);

  const handleSave = async () => {
    if (!form.code || !form.name) { showMsg("error", "Mã đơn vị và Tên đơn vị là bắt buộc."); return; }
    setSaving(true);
    try {
      await upsertCompanyInfo(token, form);
      showMsg("success", "Đã lưu thông tin đơn vị thành công!");
    } catch (e: unknown) { showMsg("error", e instanceof Error ? e.message : "Lỗi lưu."); }
    finally { setSaving(false); }
  };

  const field = (label: string, key: keyof CompanyInfoType, placeholder?: string, type?: string) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 200 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>{label}</label>
      <input
        style={S.input}
        type={type || "text"}
        placeholder={placeholder || label}
        value={(form[key] as string) || ""}
        onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
      />
    </div>
  );

  if (loading) return <div style={{ color: "#94a3b8", padding: 32 }}>Đang tải...</div>;

  return (
    <div>
      <h1 style={S.title}>Thông tin đơn vị</h1>
      {msg && <div style={S.alert(msg.type)}>{msg.text}</div>}
      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "24px 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }}>
          {field("Tên đơn vị *", "name")}
          {field("Mã đơn vị *", "code")}
          {field("Điện thoại", "phone")}
          {field("Email", "email")}
          {field("Địa chỉ", "address")}
          {field("Mã số thuế", "taxCode")}
          {field("Ngày kiểm kê", "auditDate", "", "date")}
          {field("Ngày tính tồn", "inventoryDate", "", "date")}
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Ghi chú</label>
          <textarea
            style={{ ...S.input, width: "100%", minHeight: 72, resize: "vertical", boxSizing: "border-box" as const }}
            value={form.note || ""}
            onChange={e => setForm(prev => ({ ...prev, note: e.target.value }))}
          />
        </div>
        <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
          <button style={S.btnPrimary} onClick={handleSave} disabled={saving}>
            {saving ? "Đang lưu..." : "💾 Lưu thông tin"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Redirect Panel (for Đối tác, Hàng hóa) ──────────────────────────────────
function RedirectPanel({ label, href, description }: { label: string; href: string; description: string }) {
  return (
    <div>
      <h1 style={S.title}>{label}</h1>
      <div style={S.redirectCard}>
        <div style={{ fontSize: 48 }}>📋</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{label}</div>
          <div style={{ fontSize: 15, color: "#64748b" }}>{description}</div>
        </div>
        <Link href={href} style={S.redirectBtn}>Đi đến trang quản lý →</Link>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("company");
  const [token, setToken] = useState("");

  const [partnerGroups, setPartnerGroups]   = useState<SimpleItem[]>([]);
  const [manufacturers, setManufacturers]   = useState<SimpleItem[]>([]);
  const [units, setUnits]                   = useState<SimpleItem[]>([]);
  const [categories, setCategories]         = useState<Category[]>([]);
  const [loading, setLoading]               = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("gooli_token") || "";
    setToken(t);
  }, []);

  const load = useCallback(async (tab: TabKey) => {
    if (!token) return;
    setLoading(true);
    try {
      if (tab === "partnerGroups") setPartnerGroups(await getPartnerGroups(token));
      if (tab === "manufacturers") setManufacturers(await getManufacturers(token));
      if (tab === "units")         setUnits(await getUnits(token));
      if (tab === "itemClasses")   setCategories(await getCategories());
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(activeTab); }, [activeTab, load]);

  const switchTab = (key: TabKey) => setActiveTab(key);

  // ─ Render panel per tab
  const renderPanel = () => {
    switch (activeTab) {
      case "company":
        return <CompanyInfoPanel token={token} />;

      case "partnerGroups":
        return (
          <CrudPanel
            title="Nhóm đối tác"
            items={partnerGroups}
            loading={loading}
            onAdd={async (code, name) => { await createPartnerGroup(token, { code, name }); await load("partnerGroups"); }}
            onUpdate={async (id, code, name) => { await updatePartnerGroup(token, id, { code, name }); await load("partnerGroups"); }}
            onDelete={async (id) => { await deletePartnerGroup(token, id); await load("partnerGroups"); }}
          />
        );

      case "manufacturers":
        return (
          <CrudPanel
            title="Hãng sản xuất"
            items={manufacturers}
            loading={loading}
            onAdd={async (code, name) => { await createManufacturer(token, { code, name }); await load("manufacturers"); }}
            onUpdate={async (id, code, name) => { await updateManufacturer(token, id, { code, name }); await load("manufacturers"); }}
            onDelete={async (id) => { await deleteManufacturer(token, id); await load("manufacturers"); }}
          />
        );

      case "units":
        return (
          <CrudPanel
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
          <div>
            <h1 style={S.title}>Nhóm hàng (Danh mục sản phẩm)</h1>
            {loading ? <div style={{ color: "#94a3b8" }}>Đang tải...</div> : (
              <table style={S.table}>
                <thead><tr>
                  <th style={S.th}>STT</th>
                  <th style={S.th}>Tên nhóm hàng</th>
                  <th style={S.th}>Slug</th>
                </tr></thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr><td colSpan={3} style={{ ...S.td, textAlign: "center", color: "#94a3b8", padding: 32 }}>Chưa có nhóm hàng</td></tr>
                  ) : categories.map((c, i) => (
                    <tr key={c.id}>
                      <td style={S.td}>{i + 1}</td>
                      <td style={S.td}>{c.name}</td>
                      <td style={{ ...S.td, fontFamily: "monospace", color: "#94a3b8" }}>{c.slug}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p style={{ marginTop: 16, color: "#94a3b8", fontSize: 13 }}>
              * Quản lý nhóm hàng (thêm/sửa/xóa) thực hiện tại trang Thêm sản phẩm.
            </p>
          </div>
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
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>
          Quản lý Danh mục
        </h1>
        <p style={{ fontSize: 15, color: "#64748b", margin: "6px 0 0" }}>
          Thiết lập thông tin hệ thống, nhóm đối tác, hãng sản xuất và danh mục hàng hóa
        </p>
      </div>

      <div style={S.page}>
        {/* Sidebar tabs */}
        <nav style={S.sidebar}>
          {TABS.map(tab => (
            <button key={tab.key} style={S.tab(activeTab === tab.key)} onClick={() => switchTab(tab.key)}>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content panel */}
        <div style={S.panel}>
          {renderPanel()}
        </div>
      </div>
    </div>
  );
}
