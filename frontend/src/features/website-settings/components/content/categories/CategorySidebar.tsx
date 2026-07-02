import React, { useState } from "react";
import { Plus, DotsSixVertical, Stack } from "@phosphor-icons/react";
import { Category, getIcon } from "../../../constants/contentConstants";
import { moveCategory, moveSubmenu } from "./categoryHelpers";

interface CategorySidebarProps {
  categories: Category[];
  setCategories: (cats: Category[]) => void;
  editingIndex: number | null;
  setEditingIndex: (idx: number | null) => void;
  modalSel: { type: "category" | "submenu"; catIdx: number; subIdx?: number } | null;
  setModalSel: (sel: { type: "category" | "submenu"; catIdx: number; subIdx?: number } | null) => void;
}

export default function CategorySidebar({
  categories,
  setCategories,
  editingIndex,
  setEditingIndex,
  modalSel,
  setModalSel
}: CategorySidebarProps) {
  const [dragCatIdx, setDragCatIdx] = useState<number | null>(null);
  const [dragSubState, setDragSubState] = useState<{ catIdx: number; subIdx: number } | null>(null);
  const expandedCats: Record<number, boolean> = {};

  // Hàm thêm nhanh danh mục mới
  const handleAddCategory = () => {
    const newCats = [...categories];
    newCats.push({ label: "Danh mục mới", href: "/san-pham/moi", icon: "Stack", subMenu: [] });
    setCategories(newCats);
    setModalSel({ type: "category", catIdx: newCats.length - 1 });
    setEditingIndex(newCats.length - 1);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl relative min-h-[400px] overflow-hidden w-full">
      {/* HEADER */}
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between select-none">
        <span className="font-bold text-slate-700 text-[11px] uppercase tracking-widest">Cấu trúc danh mục</span>
        <span className="bg-slate-200/70 text-slate-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
          {categories.length}
        </span>
      </div>

      {/* LIST CATEGORIES */}
      <div className="flex flex-col flex-1 overflow-y-auto scrollbar-thin">
        {categories.map((cat, idx) => {
          const IconComponent = cat.icon ? getIcon(cat.icon) : Stack;
          const subMenu = cat.subMenu || [];
          const hasSub = subMenu.length > 0;
          const isExpanded = expandedCats[idx] || editingIndex === idx;
          const isActive = editingIndex === idx && modalSel?.type === "category";
          const isDragging = dragCatIdx === idx;

          return (
            <div
              key={idx}
              draggable
              className={`flex flex-col border-b border-slate-100/50 last:border-b-0 transition-opacity 
                ${isActive ? 'bg-blue-50/40' : ''} 
                ${isDragging ? "opacity-40" : "override-opacity-100"}`}

              // Xử lý kéo thả danh mục CHA
              onDragStart={(e) => {
                setDragCatIdx(idx);
                e.dataTransfer.setData("type", "category");
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }}
              onDrop={(e) => {
                e.preventDefault();
                const dragType = e.dataTransfer.getData("type");

                // Thả danh mục con vào danh mục cha khác
                if (dragType === "submenu" && dragSubState) {
                  e.stopPropagation();
                  if (dragSubState.catIdx === idx) return;
                  const { newCategories, newModalSel } = moveSubmenu(categories, dragSubState.catIdx, dragSubState.subIdx, idx, undefined, modalSel);
                  setCategories(newCategories);
                  setModalSel(newModalSel);
                  setDragSubState(null);
                  return;
                }

                // Thả danh mục cha vào danh mục cha khác
                if (dragCatIdx === null || dragCatIdx === idx) return;
                const { newCategories, newModalSel } = moveCategory(categories, dragCatIdx, idx, modalSel);
                setCategories(newCategories);
                setModalSel(newModalSel);
                setDragCatIdx(null);
              }}
              onDragEnd={() => { setDragCatIdx(null); setDragSubState(null); }}
            >
              {/* Vùng hiển thị DANH MỤC CHA */}
              <div
                className={`flex items-center py-3 px-4 text-slate-700 font-semibold text-[11px] cursor-pointer hover:bg-slate-50 transition-all duration-200 group relative ${isActive ? 'bg-transparent' : ''}`}
                onClick={() => {
                  setModalSel({ type: "category", catIdx: idx });
                  setEditingIndex(idx);
                }}
              >
                <DotsSixVertical size={14} className="absolute left-1 text-slate-300 hover:text-slate-400 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity duration-200" weight="bold" />
                <IconComponent size={16} className={`${isActive ? 'text-[#2563eb]' : 'text-[#2563eb]/80'} group-hover:text-[#2563eb] transition-colors duration-200 shrink-0 mr-3`} />
                <span className={`uppercase tracking-wider truncate flex-1 ${isActive ? 'text-[#0f172a]' : 'text-slate-700'} group-hover:text-[#0f172a] transition-colors duration-200`}>
                  {cat?.label || `DANH MỤC ${idx + 1}`}
                </span>
                {hasSub && (
                  <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-[9px] font-bold shrink-0 ml-2">
                    {subMenu.length}
                  </span>
                )}
              </div>

              {/* Vùng hiển thị DANH MỤC CON */}
              {isExpanded && hasSub && (
                <div className="flex flex-col gap-0.5 pl-3 pb-3 border-l border-slate-200 ml-[23px]">
                  {subMenu.map((sub, sIdx) => {
                    const isSubActive = editingIndex === idx && modalSel?.type === "submenu" && modalSel?.subIdx === sIdx;
                    const isSubDragging = dragSubState?.catIdx === idx && dragSubState?.subIdx === sIdx;

                    return (
                      <div
                        key={sIdx}
                        draggable
                        className={`flex items-center py-2 px-3 text-slate-600 text-[11px] font-medium cursor-pointer transition-all duration-200 group/sub relative rounded-r-lg
                          ${isSubActive ? 'text-[#2563eb] bg-blue-50/50' : 'hover:bg-slate-50 hover:text-[#2563eb]'} 
                          ${isSubDragging ? "opacity-40" : "opacity-100"}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalSel({ type: "submenu", catIdx: idx, subIdx: sIdx });
                          setEditingIndex(idx);
                        }}

                        // Xử lý kéo thả danh mục CON
                        onDragStart={(e) => {
                          e.stopPropagation();
                          setDragSubState({ catIdx: idx, subIdx: sIdx });
                          e.dataTransfer.setData("type", "submenu");
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.dataTransfer.dropEffect = "move";
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!dragSubState || (dragSubState.catIdx === idx && dragSubState.subIdx === sIdx)) return;

                          const { newCategories, newModalSel } = moveSubmenu(categories, dragSubState.catIdx, dragSubState.subIdx, idx, sIdx, modalSel);
                          setCategories(newCategories);
                          setModalSel(newModalSel);
                          setDragSubState(null);
                        }}
                        onDragEnd={(e) => { e.stopPropagation(); setDragSubState(null); }}
                      >
                        <DotsSixVertical size={12} className="absolute left-0 -ml-1.5 text-slate-300 hover:text-slate-400 cursor-grab opacity-0 group-hover/sub:opacity-100 transition-opacity duration-200" weight="bold" />
                        <span className="truncate flex-1 pl-1">{sub.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FOOTER BUTTON */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 mt-auto shrink-0">
        <button
          type="button"
          onClick={handleAddCategory}
          className="flex items-center gap-2.5 py-2 px-2 text-[#2563eb] font-bold text-[11px] hover:bg-blue-50 rounded-lg cursor-pointer transition-colors border-none bg-transparent outline-none uppercase tracking-wider group"
        >
          <div className="w-5 h-5 rounded-full bg-[#2563eb] group-hover:bg-blue-700 flex items-center justify-center text-white transition-colors shrink-0">
            <Plus size={10} weight="bold" />
          </div>
          Thêm danh mục
        </button>
      </div>
    </div>
  );
}
