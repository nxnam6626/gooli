"use client";

import React, { useState } from "react";
import {
  DotsSixVertical,
  Plus,
  ArrowLeft,
  House,
  Tree,
  Cube,
  Columns,
  Stack,
  Rows,
  Ruler,
  GridFour,
  Wrench,
  ListDashes,
  PencilSimple,
} from "@phosphor-icons/react";

const toSlug = (str: string): string => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const SYSTEM_PAGES = [
  { label: "Trang chủ", value: "/" },
  { label: "Tất cả sản phẩm", value: "/san-pham" },
  { label: "Giới thiệu", value: "/gioi-thieu" },
  { label: "Công trình & Dự án", value: "/du-an" },
  { label: "Liên hệ", value: "/lien-he" }
];

const detectLinkType = (href: string, label: string): "auto" | "system" | "custom" => {
  const isSystem = SYSTEM_PAGES.some(p => p.value === href);
  if (isSystem) return "system";
  if (href === `/san-pham/${toSlug(label)}`) return "auto";
  return "custom";
};

const iconMap: Record<string, React.ElementType> = {
  House, Tree, Cube, Columns, Stack, Rows, Ruler, GridFour, Wrench
};
const getIcon = (name: string) => iconMap[name] || Stack;

interface CategorySubMenu {
  label: string;
  href: string;
}

interface Category {
  label: string;
  href: string;
  icon: string;
  subMenu?: CategorySubMenu[];
}

interface CategoriesTabProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

export default function CategoriesTab({ categories, setCategories }: CategoriesTabProps) {
  const [activeDragCategory, setActiveDragCategory] = useState<number | null>(null);
  const [activeDragSubmenu, setActiveDragSubmenu] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<{
    type: "category" | "submenu";
    catIdx: number;
    subIdx?: number;
  } | null>(null);

  // ──────── Drag & Drop Handlers ────────

  const handleDragStart = (e: React.DragEvent, catIdx: number, subIdx?: number) => {
    const dragData = { catIdx, subIdx };
    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = "move";
  };

  const reorderCategories = (srcIdx: number, destIdx: number) => {
    if (srcIdx === destIdx || srcIdx === destIdx - 1) return;
    const newCats = [...categories];
    const [removed] = newCats.splice(srcIdx, 1);
    const insertIdx = srcIdx < destIdx ? destIdx - 1 : destIdx;
    newCats.splice(insertIdx, 0, removed);
    setCategories(newCats);
  };

  const promoteSubMenu = (srcCatIdx: number, srcSubIdx: number, destIdx: number) => {
    const newCats = [...categories];
    const submenuItem = newCats[srcCatIdx].subMenu?.[srcSubIdx];
    if (!submenuItem) return;
    newCats[srcCatIdx].subMenu = newCats[srcCatIdx].subMenu?.filter((_, idx) => idx !== srcSubIdx);
    const newMainCat = { label: submenuItem.label, href: submenuItem.href, icon: "Stack", subMenu: [] as CategorySubMenu[] };
    newCats.splice(destIdx, 0, newMainCat);
    setCategories(newCats);
  };

  const demoteCategoryToSubmenu = (srcCatIdx: number, destCatIdx: number) => {
    if (srcCatIdx === destCatIdx) return;
    const newCats = [...categories];
    const mainCatToDemote = newCats[srcCatIdx];
    const subItemsToAdd: CategorySubMenu[] = [{ label: mainCatToDemote.label, href: mainCatToDemote.href }];
    if (mainCatToDemote.subMenu && mainCatToDemote.subMenu.length > 0) {
      subItemsToAdd.push(...mainCatToDemote.subMenu);
    }
    newCats.splice(srcCatIdx, 1);
    const adjustedDestCatIdx = srcCatIdx < destCatIdx ? destCatIdx - 1 : destCatIdx;
    const targetCat = newCats[adjustedDestCatIdx];
    targetCat.subMenu = [...(targetCat.subMenu || []), ...subItemsToAdd];
    setCategories(newCats);
  };

  const demoteCategoryToSubmenuAt = (srcCatIdx: number, destCatIdx: number, destSubIdx: number) => {
    if (srcCatIdx === destCatIdx) return;
    const newCats = [...categories];
    const mainCatToDemote = newCats[srcCatIdx];
    const subItemsToAdd: CategorySubMenu[] = [{ label: mainCatToDemote.label, href: mainCatToDemote.href }];
    if (mainCatToDemote.subMenu && mainCatToDemote.subMenu.length > 0) {
      subItemsToAdd.push(...mainCatToDemote.subMenu);
    }
    newCats.splice(srcCatIdx, 1);
    const adjustedDestCatIdx = srcCatIdx < destCatIdx ? destCatIdx - 1 : destCatIdx;
    const destSubMenu = newCats[adjustedDestCatIdx].subMenu ? [...(newCats[adjustedDestCatIdx].subMenu || [])] : [];
    destSubMenu.splice(destSubIdx, 0, ...subItemsToAdd);
    newCats[adjustedDestCatIdx].subMenu = destSubMenu;
    setCategories(newCats);
  };

  const moveSubmenuItem = (srcCatIdx: number, srcSubIdx: number, destCatIdx: number, destSubIdx: number) => {
    const newCats = [...categories];
    const itemToMove = newCats[srcCatIdx].subMenu?.[srcSubIdx];
    if (!itemToMove) return;
    newCats[srcCatIdx].subMenu = newCats[srcCatIdx].subMenu?.filter((_, idx) => idx !== srcSubIdx);
    let insertIdx = destSubIdx;
    if (srcCatIdx === destCatIdx && srcSubIdx < destSubIdx) {
      insertIdx = destSubIdx - 1;
    }
    const destSubMenu = newCats[destCatIdx].subMenu ? [...(newCats[destCatIdx].subMenu || [])] : [];
    destSubMenu.splice(insertIdx, 0, itemToMove);
    newCats[destCatIdx].subMenu = destSubMenu;
    setCategories(newCats);
  };

  const handleCategoryDrop = (dragged: { catIdx: number; subIdx?: number }, targetIdx: number) => {
    if (dragged.subIdx !== undefined) {
      promoteSubMenu(dragged.catIdx, dragged.subIdx, targetIdx);
    } else {
      reorderCategories(dragged.catIdx, targetIdx);
    }
  };

  const handleSubmenuDrop = (dragged: { catIdx: number; subIdx?: number }, targetCatIdx: number, targetSubIdx: number) => {
    if (dragged.subIdx !== undefined) {
      moveSubmenuItem(dragged.catIdx, dragged.subIdx, targetCatIdx, targetSubIdx);
    } else {
      demoteCategoryToSubmenuAt(dragged.catIdx, targetCatIdx, targetSubIdx);
    }
  };

  // ──────── Selection Validation ────────

  const sel = (() => {
    if (!selectedItem) return null;
    if (selectedItem.catIdx < 0 || selectedItem.catIdx >= categories.length) return null;
    if (selectedItem.type === "submenu") {
      const cat = categories[selectedItem.catIdx];
      if (!cat.subMenu || selectedItem.subIdx === undefined || selectedItem.subIdx < 0 || selectedItem.subIdx >= cat.subMenu.length) return null;
    }
    return selectedItem;
  })();

  // ──────── CRUD Helpers ────────

  const handleAddCategory = () => {
    const newCats = [...categories, { label: "Danh mục mới", href: "/san-pham/moi", icon: "Stack", subMenu: [] as CategorySubMenu[] }];
    setCategories(newCats);
    setSelectedItem({ type: "category", catIdx: newCats.length - 1 });
  };

  const handleDeleteCategory = (catIdx: number) => {
    if (confirm(`Xác nhận xóa danh mục "${categories[catIdx].label}"?`)) {
      setCategories(categories.filter((_, idx) => idx !== catIdx));
      if (selectedItem?.catIdx === catIdx) {
        setSelectedItem(null);
      } else if (selectedItem && selectedItem.catIdx > catIdx) {
        setSelectedItem({ ...selectedItem, catIdx: selectedItem.catIdx - 1 });
      }
    }
  };

  const handleAddSubmenu = (catIdx: number) => {
    const newCats = [...categories];
    const currentSub = [...(newCats[catIdx].subMenu || [])];
    currentSub.push({ label: "Mục con mới", href: "/san-pham/moi" });
    newCats[catIdx] = { ...newCats[catIdx], subMenu: currentSub };
    setCategories(newCats);
    setSelectedItem({ type: "submenu", catIdx, subIdx: currentSub.length - 1 });
  };

  const handleDeleteSubmenu = (catIdx: number, subIdx: number) => {
    const newCats = [...categories];
    const currentSub = newCats[catIdx].subMenu ? [...(newCats[catIdx].subMenu || [])] : [];
    const filteredSub = currentSub.filter((_, idx) => idx !== subIdx);
    newCats[catIdx] = { ...newCats[catIdx], subMenu: filteredSub };
    setCategories(newCats);
    if (selectedItem?.type === "submenu" && selectedItem.catIdx === catIdx && selectedItem.subIdx === subIdx) {
      setSelectedItem({ type: "category", catIdx });
    }
  };

  // ──────── DropZone Components (compact for tree) ────────

  const CategoryDropZone = ({ index }: { index: number }) => {
    const [isOver, setIsOver] = useState(false);
    return (
      <div
        onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(e) => {
          setIsOver(false);
          const data = e.dataTransfer.getData("application/json");
          if (data) {
            try { handleCategoryDrop(JSON.parse(data), index); }
            catch (err) { console.error(err); }
          }
        }}
        className={`transition-all duration-150 rounded flex items-center justify-center ${
          isOver ? "bg-blue-50 border border-dashed border-[#2563eb] h-8 my-1" : "h-0.5"
        }`}
      >
        {isOver && <span className="text-[9px] text-[#2563eb] font-bold uppercase tracking-wider">Vị trí {index + 1}</span>}
      </div>
    );
  };

  const SubmenuItemDropZone = ({ catIdx, subIdx }: { catIdx: number; subIdx: number }) => {
    const [isOver, setIsOver] = useState(false);
    return (
      <div
        onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(e) => {
          setIsOver(false);
          const data = e.dataTransfer.getData("application/json");
          if (data) {
            try { handleSubmenuDrop(JSON.parse(data), catIdx, subIdx); }
            catch (err) { console.error(err); }
          }
        }}
        className={`transition-all duration-150 rounded flex items-center justify-center ${
          isOver ? "bg-blue-50 border border-dashed border-[#2563eb] h-6 my-0.5" : "h-0.5"
        }`}
      >
        {isOver && <span className="text-[8px] text-[#2563eb] font-bold">Chèn vào đây</span>}
      </div>
    );
  };

  const DemoteDropZone = ({ catIdx }: { catIdx: number }) => {
    const [isOver, setIsOver] = useState(false);
    return (
      <div
        onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(e) => {
          setIsOver(false);
          const data = e.dataTransfer.getData("application/json");
          if (data) {
            try {
              const dragged = JSON.parse(data);
              if (dragged.subIdx === undefined) {
                demoteCategoryToSubmenu(dragged.catIdx, catIdx);
              }
            } catch (err) { console.error(err); }
          }
        }}
        className={`transition-all duration-150 rounded text-center ${
          isOver
            ? "border border-dashed border-[#2563eb] bg-blue-50/50 text-[#2563eb] h-7 flex items-center justify-center my-0.5"
            : "h-0.5"
        }`}
      >
        {isOver && <span className="text-[8px] font-bold uppercase tracking-wider">Thả thành mục con</span>}
      </div>
    );
  };

  // ──────── Styling Constants ────────

  const inputCls = "w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all";
  const labelCls = "font-bold text-slate-600 text-[10px] uppercase tracking-wider mb-1 block";
  const disabledInputCls = "w-full bg-slate-100 border border-slate-200 rounded-lg py-2 px-3 text-slate-500 font-semibold text-xs cursor-not-allowed";

  // ──────── Render ────────

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="border-b border-slate-100 pb-3 flex justify-between items-center select-none">
        <div>
          <h3 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider block">Quản lý Danh mục Sản phẩm</h3>
          <p className="text-slate-400 mt-0.5 text-[10px]">Nhấn giữ ⠿ để kéo thả sắp xếp. Chọn danh mục bên trái để chỉnh sửa chi tiết bên phải.</p>
        </div>
        <button
          type="button"
          onClick={handleAddCategory}
          className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 font-bold rounded-lg text-[10px] cursor-pointer outline-none border-none select-none transition-colors"
        >
          + Thêm danh mục chính
        </button>
      </div>

      {/* Master-Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 min-h-[480px]">

        {/* ────── LEFT: Tree Panel ────── */}
        <div className="border border-slate-200 rounded-xl bg-white overflow-hidden flex flex-col">
          <div className="px-3 py-2.5 border-b border-slate-100 flex items-center justify-between select-none bg-slate-50/50">
            <div className="flex items-center gap-1.5">
              <ListDashes size={14} className="text-slate-500" />
              <span className="font-bold text-slate-700 text-[10px] uppercase tracking-wider">Cấu trúc danh mục</span>
            </div>
            <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[9px] font-semibold">{categories.length}</span>
          </div>

          <div className="p-2 flex-1 overflow-y-auto max-h-[520px] scrollbar-thin">
            {categories.length === 0 && (
              <div className="text-center text-slate-400 text-[10px] font-semibold py-8 select-none">
                Chưa có danh mục nào.<br />Nhấn &ldquo;+ Thêm danh mục chính&rdquo; để bắt đầu.
              </div>
            )}

            {categories.map((cat, catIdx) => {
              const IconComp = getIcon(cat.icon);
              const isSelected = sel?.type === "category" && sel.catIdx === catIdx;

              return (
                <React.Fragment key={catIdx}>
                  {catIdx === 0 && <CategoryDropZone index={0} />}

                  {/* Category row */}
                  <div
                    draggable={activeDragCategory === catIdx}
                    onDragStart={(e) => handleDragStart(e, catIdx)}
                    onDragEnd={() => setActiveDragCategory(null)}
                    onClick={() => setSelectedItem({ type: "category", catIdx })}
                    className={`flex items-center gap-1.5 py-2 px-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-slate-50 border border-transparent"
                    } ${activeDragCategory === catIdx ? "opacity-40 scale-[0.98]" : ""}`}
                  >
                    <button
                      type="button"
                      onMouseDown={() => setActiveDragCategory(catIdx)}
                      onMouseLeave={() => setActiveDragCategory(null)}
                      className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-0.5 border-none bg-transparent outline-none select-none shrink-0"
                      title="Kéo để sắp xếp"
                    >
                      <DotsSixVertical size={14} />
                    </button>
                    <IconComp size={14} className={`shrink-0 ${isSelected ? "text-blue-600" : "text-slate-400"}`} />
                    <span className={`font-semibold text-[11px] truncate flex-1 ${isSelected ? "text-blue-800" : "text-slate-700"}`}>
                      {cat.label || "Chưa đặt tên"}
                    </span>
                    {(cat.subMenu?.length || 0) > 0 && (
                      <span className={`px-1.5 py-0 rounded-full text-[9px] font-bold shrink-0 ${
                        isSelected ? "bg-blue-200 text-blue-700" : "bg-slate-200 text-slate-500"
                      }`}>
                        {cat.subMenu!.length}
                      </span>
                    )}
                  </div>

                  {/* Submenu items (indented under parent) */}
                  {cat.subMenu && cat.subMenu.length > 0 && (
                    <div className="ml-[22px] border-l-2 border-slate-200 pl-2 mb-1">
                      {cat.subMenu.map((sub, subIdx) => {
                        const isSubSelected = sel?.type === "submenu" && sel.catIdx === catIdx && sel.subIdx === subIdx;
                        return (
                          <React.Fragment key={subIdx}>
                            {subIdx === 0 && <SubmenuItemDropZone catIdx={catIdx} subIdx={0} />}
                            <div
                              draggable={activeDragSubmenu === `${catIdx}-${subIdx}`}
                              onDragStart={(e) => handleDragStart(e, catIdx, subIdx)}
                              onDragEnd={() => setActiveDragSubmenu(null)}
                              onClick={(e) => { e.stopPropagation(); setSelectedItem({ type: "submenu", catIdx, subIdx }); }}
                              className={`flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer transition-all text-[11px] ${
                                isSubSelected
                                  ? "bg-blue-50 text-blue-700 font-semibold"
                                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                              } ${activeDragSubmenu === `${catIdx}-${subIdx}` ? "opacity-40" : ""}`}
                            >
                              <button
                                type="button"
                                onMouseDown={() => setActiveDragSubmenu(`${catIdx}-${subIdx}`)}
                                onMouseLeave={() => setActiveDragSubmenu(null)}
                                className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 p-0.5 border-none bg-transparent outline-none select-none shrink-0"
                              >
                                <DotsSixVertical size={12} />
                              </button>
                              <span className="truncate flex-1">{sub.label}</span>
                            </div>
                            <SubmenuItemDropZone catIdx={catIdx} subIdx={subIdx + 1} />
                          </React.Fragment>
                        );
                      })}
                    </div>
                  )}

                  <DemoteDropZone catIdx={catIdx} />
                  <CategoryDropZone index={catIdx + 1} />
                </React.Fragment>
              );
            })}

            {categories.length > 0 && (
              <button
                type="button"
                onClick={handleAddCategory}
                className="w-full flex items-center gap-2 py-2 px-2 text-[10px] font-bold text-[#2563eb] hover:bg-blue-50 rounded-lg cursor-pointer border-none bg-transparent outline-none mt-1 transition-colors"
              >
                <Plus size={12} />
                Thêm danh mục
              </button>
            )}
          </div>
        </div>

        {/* ────── RIGHT: Detail Panel ────── */}
        <div className="border border-slate-200 rounded-xl bg-white p-5 overflow-y-auto">

          {/* Empty state */}
          {!sel && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center select-none">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <PencilSimple size={20} className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-semibold text-sm">Chọn một danh mục</p>
              <p className="text-slate-400 text-[11px] mt-1">Nhấp vào danh mục bên trái để xem và chỉnh sửa thông tin chi tiết.</p>
            </div>
          )}

          {/* ── Category Edit Form ── */}
          {sel?.type === "category" && (() => {
            const cat = categories[sel.catIdx];
            const linkType = detectLinkType(cat.href, cat.label);
            return (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0">{sel.catIdx + 1}</span>
                    <h4 className="font-bold text-slate-800 text-sm">Chỉnh sửa danh mục</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(sel.catIdx)}
                    className="text-red-500 hover:text-red-700 font-bold text-[10px] bg-transparent border-none cursor-pointer outline-none transition-colors"
                  >
                    Xóa danh mục
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Tên danh mục</label>
                    <input
                      type="text"
                      required
                      value={cat.label}
                      onChange={(e) => {
                        const newLabel = e.target.value;
                        const newCats = [...categories];
                        const currentType = detectLinkType(cat.href, cat.label);
                        newCats[sel.catIdx] = {
                          ...newCats[sel.catIdx],
                          label: newLabel,
                          href: currentType === "auto" ? `/san-pham/${toSlug(newLabel)}` : cat.href
                        };
                        setCategories(newCats);
                      }}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Biểu tượng (Icon)</label>
                    <select
                      value={cat.icon}
                      onChange={(e) => {
                        const newCats = [...categories];
                        newCats[sel.catIdx] = { ...newCats[sel.catIdx], icon: e.target.value };
                        setCategories(newCats);
                      }}
                      className={inputCls}
                    >
                      <option value="House">Ngôi nhà (House)</option>
                      <option value="Tree">Cái cây (Tree)</option>
                      <option value="Cube">Khối lập phương (Cube)</option>
                      <option value="Columns">Cột (Columns)</option>
                      <option value="Stack">Chồng lớp (Stack)</option>
                      <option value="Rows">Hàng (Rows)</option>
                      <option value="Ruler">Thước kẻ (Ruler)</option>
                      <option value="GridFour">Lưới (GridFour)</option>
                      <option value="Wrench">Cờ lê (Wrench)</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Loại liên kết</label>
                    <select
                      value={linkType}
                      onChange={(e) => {
                        const type = e.target.value;
                        const newCats = [...categories];
                        let newHref = cat.href;
                        if (type === "auto") newHref = `/san-pham/${toSlug(cat.label)}`;
                        else if (type === "system") newHref = "/san-pham";
                        else if (type === "custom") newHref = "/";
                        newCats[sel.catIdx] = { ...newCats[sel.catIdx], href: newHref };
                        setCategories(newCats);
                      }}
                      className={inputCls}
                    >
                      <option value="auto">Tự động (Danh mục SP)</option>
                      <option value="system">Trang hệ thống</option>
                      <option value="custom">Đường dẫn tự nhập</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Chi tiết liên kết (href)</label>
                    {linkType === "auto" && <input type="text" disabled value={cat.href} className={disabledInputCls} />}
                    {linkType === "system" && (
                      <select
                        value={cat.href}
                        onChange={(e) => {
                          const newCats = [...categories];
                          newCats[sel.catIdx] = { ...newCats[sel.catIdx], href: e.target.value };
                          setCategories(newCats);
                        }}
                        className={inputCls}
                      >
                        {SYSTEM_PAGES.map((p) => (
                          <option key={p.value} value={p.value}>{p.label} ({p.value})</option>
                        ))}
                      </select>
                    )}
                    {linkType === "custom" && (
                      <input
                        type="text"
                        required
                        value={cat.href}
                        onChange={(e) => {
                          const newCats = [...categories];
                          newCats[sel.catIdx] = { ...newCats[sel.catIdx], href: e.target.value };
                          setCategories(newCats);
                        }}
                        className={inputCls}
                      />
                    )}
                  </div>
                </div>

                {/* ── Submenu Management ── */}
                <div className="border-t border-slate-100 pt-4 mt-2">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                      Danh mục con ({cat.subMenu?.length || 0})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddSubmenu(sel.catIdx)}
                      className="px-2.5 py-1 bg-blue-50 text-[#2563eb] hover:bg-blue-100 font-bold rounded-lg text-[9px] cursor-pointer outline-none border-none transition-colors"
                    >
                      + Thêm mục con
                    </button>
                  </div>

                  {(!cat.subMenu || cat.subMenu.length === 0) ? (
                    <div className="text-center text-slate-400 text-[10px] font-semibold py-5 bg-slate-50/50 rounded-lg select-none">
                      Chưa có danh mục con. Nhấn &ldquo;+ Thêm mục con&rdquo; hoặc kéo thả danh mục khác vào cây bên trái.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {cat.subMenu.map((sub, subIdx) => (
                        <div
                          key={subIdx}
                          className="flex items-center gap-2 py-2 px-3 bg-slate-50 rounded-lg group hover:bg-slate-100 transition-colors"
                        >
                          <span className="text-[10px] font-bold text-slate-400 shrink-0 w-5">#{subIdx + 1}</span>
                          <span className="text-xs font-semibold text-slate-700 flex-1 truncate">{sub.label}</span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[140px] hidden sm:block">{sub.href}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedItem({ type: "submenu", catIdx: sel.catIdx, subIdx })}
                            className="text-[#2563eb] text-[10px] font-bold bg-transparent border-none cursor-pointer outline-none opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubmenu(sel.catIdx, subIdx)}
                            className="text-red-500 text-[10px] font-bold bg-transparent border-none cursor-pointer outline-none opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Xóa
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── Submenu Edit Form ── */}
          {sel?.type === "submenu" && sel.subIdx !== undefined && (() => {
            const cat = categories[sel.catIdx];
            const sub = cat.subMenu![sel.subIdx];
            const linkType = detectLinkType(sub.href, sub.label);
            return (
              <div className="space-y-5">
                <button
                  type="button"
                  onClick={() => setSelectedItem({ type: "category", catIdx: sel.catIdx })}
                  className="flex items-center gap-1.5 text-[#2563eb] font-semibold text-xs hover:text-blue-800 bg-transparent border-none cursor-pointer outline-none transition-colors"
                >
                  <ArrowLeft size={14} />
                  Quay lại: {cat.label}
                </button>

                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Chỉnh sửa mục con</h4>
                    <p className="text-slate-400 text-[10px] mt-0.5">Thuộc danh mục: <span className="font-semibold text-slate-500">{cat.label}</span></p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubmenu(sel.catIdx, sel.subIdx!)}
                    className="text-red-500 hover:text-red-700 font-bold text-[10px] bg-transparent border-none cursor-pointer outline-none transition-colors"
                  >
                    Xóa mục con
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className={labelCls}>Tên mục con</label>
                    <input
                      type="text"
                      required
                      value={sub.label}
                      onChange={(e) => {
                        const newLabel = e.target.value;
                        const newCats = [...categories];
                        const currentSub = [...(newCats[sel.catIdx].subMenu || [])];
                        const currentType = detectLinkType(sub.href, sub.label);
                        currentSub[sel.subIdx!] = {
                          ...currentSub[sel.subIdx!],
                          label: newLabel,
                          href: currentType === "auto" ? `/san-pham/${toSlug(newLabel)}` : sub.href
                        };
                        newCats[sel.catIdx] = { ...newCats[sel.catIdx], subMenu: currentSub };
                        setCategories(newCats);
                      }}
                      className={inputCls}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Loại liên kết</label>
                      <select
                        value={linkType}
                        onChange={(e) => {
                          const type = e.target.value;
                          const newCats = [...categories];
                          const currentSub = [...(newCats[sel.catIdx].subMenu || [])];
                          let newHref = sub.href;
                          if (type === "auto") newHref = `/san-pham/${toSlug(sub.label)}`;
                          else if (type === "system") newHref = "/san-pham";
                          else if (type === "custom") newHref = "/";
                          currentSub[sel.subIdx!] = { ...currentSub[sel.subIdx!], href: newHref };
                          newCats[sel.catIdx] = { ...newCats[sel.catIdx], subMenu: currentSub };
                          setCategories(newCats);
                        }}
                        className={inputCls}
                      >
                        <option value="auto">Tự động (Danh mục SP)</option>
                        <option value="system">Trang hệ thống</option>
                        <option value="custom">Đường dẫn tự nhập</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>Chi tiết liên kết (href)</label>
                      {linkType === "auto" && <input type="text" disabled value={sub.href} className={disabledInputCls} />}
                      {linkType === "system" && (
                        <select
                          value={sub.href}
                          onChange={(e) => {
                            const newCats = [...categories];
                            const currentSub = [...(newCats[sel.catIdx].subMenu || [])];
                            currentSub[sel.subIdx!] = { ...currentSub[sel.subIdx!], href: e.target.value };
                            newCats[sel.catIdx] = { ...newCats[sel.catIdx], subMenu: currentSub };
                            setCategories(newCats);
                          }}
                          className={inputCls}
                        >
                          {SYSTEM_PAGES.map((p) => (
                            <option key={p.value} value={p.value}>{p.label} ({p.value})</option>
                          ))}
                        </select>
                      )}
                      {linkType === "custom" && (
                        <input
                          type="text"
                          required
                          value={sub.href}
                          onChange={(e) => {
                            const newCats = [...categories];
                            const currentSub = [...(newCats[sel.catIdx].subMenu || [])];
                            currentSub[sel.subIdx!] = { ...currentSub[sel.subIdx!], href: e.target.value };
                            newCats[sel.catIdx] = { ...newCats[sel.catIdx], subMenu: currentSub };
                            setCategories(newCats);
                          }}
                          className={inputCls}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
}
