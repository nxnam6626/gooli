import React, { useState } from "react";
import { Plus, DotsSixVertical, Stack, Pencil, ArrowElbowDownRight } from "@phosphor-icons/react";
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
  const [activeIdx, setActiveIdx] = useState<number>(0);

  const safeActiveIdx = activeIdx >= categories.length ? Math.max(0, categories.length - 1) : activeIdx;
  const activeCat = categories[safeActiveIdx];
  const subMenu = activeCat?.subMenu || [];

  const handleAddCategory = () => {
    const newCats = [...categories];
    newCats.push({ label: "Danh mục mới", href: "/san-pham/moi", icon: "Stack", subMenu: [] });
    setCategories(newCats);
    setModalSel({ type: "category", catIdx: newCats.length - 1 });
    setEditingIndex(newCats.length - 1);
    setActiveIdx(newCats.length - 1);
  };

  const handleAddSubmenu = (catIdx: number) => {
    const newCats = [...categories];
    const cat = newCats[catIdx];
    if (!cat) return;
    const sub = cat.subMenu || [];
    sub.push({ label: "Mục con mới", href: `${cat.href}/moi` });
    cat.subMenu = sub;
    setCategories(newCats);
    setModalSel({ type: "submenu", catIdx, subIdx: sub.length - 1 });
    setEditingIndex(catIdx);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 min-h-[450px] w-full select-none divide-y md:divide-y-0 md:divide-x divide-slate-100">
      <div className="flex flex-col h-full">
        <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="font-extrabold text-slate-700 text-[11px] uppercase tracking-wider">Danh mục chính</span>
          <span className="bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
            {categories.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-none divide-y divide-slate-100/50">
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 font-bold gap-1">
              <span className="text-[10px]">Chưa có danh mục nào.</span>
            </div>
          ) : (
            categories.map((cat, idx) => {
              const IconComponent = cat.icon ? getIcon(cat.icon) : Stack;
              const hasSub = (cat.subMenu || []).length > 0;
              const isActive = editingIndex === idx && modalSel?.type === "category";
              const isFocused = safeActiveIdx === idx;
              const isDragging = dragCatIdx === idx;

              return (
                <div
                  key={idx}
                  draggable
                  className={`flex items-center py-3.5 px-5 text-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-50/50 transition-all duration-200 group relative border-none outline-none
                    ${isFocused ? "bg-blue-50/20 text-[#2563eb]" : ""}
                    ${isActive ? "bg-blue-50/40" : ""}
                    ${isDragging ? "opacity-30" : "opacity-100"}`}
                  onClick={() => {
                    setModalSel({ type: "category", catIdx: idx });
                    setEditingIndex(idx);
                    setActiveIdx(idx);
                  }}
                  onMouseEnter={() => {
                    setActiveIdx(idx);
                  }}
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

                    if (dragType === "submenu" && dragSubState) {
                      e.stopPropagation();
                      if (dragSubState.catIdx === idx) return;
                      const { newCategories, newModalSel } = moveSubmenu(categories, dragSubState.catIdx, dragSubState.subIdx, idx, undefined, modalSel);
                      setCategories(newCategories);
                      setModalSel(newModalSel);
                      setDragSubState(null);
                      return;
                    }

                    if (dragCatIdx === null || dragCatIdx === idx) return;
                    const { newCategories, newModalSel } = moveCategory(categories, dragCatIdx, idx, modalSel);
                    setCategories(newCategories);
                    setModalSel(newModalSel);
                    setDragCatIdx(null);
                  }}
                  onDragEnd={() => {
                    setDragCatIdx(null);
                    setDragSubState(null);
                  }}
                >
                  <DotsSixVertical size={14} className="absolute left-1.5 text-slate-300 hover:text-slate-400 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity duration-200" weight="bold" />
                  <IconComponent size={16} className={`mr-3 shrink-0 ${isFocused || isActive ? "text-[#2563eb]" : "text-slate-400 group-hover:text-[#2563eb]"} transition-colors`} />
                  <span className={`uppercase tracking-wider truncate flex-1 ${isFocused || isActive ? "text-[#2563eb]" : "text-slate-700"} group-hover:text-slate-900 transition-colors`}>
                    {cat?.label || `DANH MỤC ${idx + 1}`}
                  </span>

                  {hasSub && (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold shrink-0 ml-2 group-hover:hidden transition-all ${isFocused ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                      {cat.subMenu?.length}
                    </span>
                  )}
                  <div className="hidden group-hover:flex items-center gap-1 text-[#2563eb] shrink-0 ml-2 animate-fade-in">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider">Chỉnh sửa</span>
                    <Pencil size={11} weight="bold" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 mt-auto shrink-0">
          <button
            type="button"
            onClick={handleAddCategory}
            className="flex items-center gap-2 py-1.5 px-2 text-[#2563eb] font-bold text-[11px] hover:bg-blue-50 rounded-lg cursor-pointer transition-colors border-none bg-transparent outline-none uppercase tracking-wider group"
          >
            <div className="w-4.5 h-4.5 rounded-full bg-[#2563eb] group-hover:bg-blue-700 flex items-center justify-center text-white transition-colors shrink-0">
              <Plus size={9} weight="bold" />
            </div>
            Thêm danh mục
          </button>
        </div>
      </div>

      <div className="flex flex-col h-full bg-slate-50/10">
        <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="font-extrabold text-slate-700 text-[11px] uppercase tracking-wider truncate max-w-[200px]">
            Danh mục con: {activeCat?.label || "Không có"}
          </span>
          {activeCat && (
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[9px] font-extrabold">
              {subMenu.length}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-none p-4 space-y-2">
          {!activeCat ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 font-bold gap-1 text-center select-none">
              <span className="text-[10px]">Chọn danh mục chính để xem danh mục con</span>
            </div>
          ) : subMenu.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 font-bold gap-1 text-center select-none">
              <span className="text-[10px]">Chưa có danh mục con</span>
              <span className="text-[9px] font-semibold text-slate-350 mt-1">Bấm nút bên dưới để tạo mới</span>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {subMenu.map((sub, sIdx) => {
                const isSubActive = editingIndex === safeActiveIdx && modalSel?.type === "submenu" && modalSel?.subIdx === sIdx;
                const isSubDragging = dragSubState?.catIdx === safeActiveIdx && dragSubState?.subIdx === sIdx;

                return (
                  <div
                    key={sIdx}
                    draggable
                    className={`flex items-center py-2.5 px-4 bg-white border border-slate-200/70 text-slate-600 text-xs font-bold cursor-pointer transition-all duration-200 group/sub relative rounded-lg shadow-3xs hover:border-slate-300 hover:text-slate-800
                      ${isSubActive ? "text-[#2563eb] border-[#2563eb]/50 bg-blue-50/30" : ""}
                      ${isSubDragging ? "opacity-30" : "opacity-100"}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalSel({ type: "submenu", catIdx: safeActiveIdx, subIdx: sIdx });
                      setEditingIndex(safeActiveIdx);
                    }}
                    onDragStart={(e) => {
                      e.stopPropagation();
                      setDragSubState({ catIdx: safeActiveIdx, subIdx: sIdx });
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
                      if (!dragSubState || (dragSubState.catIdx === safeActiveIdx && dragSubState.subIdx === sIdx)) return;

                      const { newCategories, newModalSel } = moveSubmenu(categories, dragSubState.catIdx, dragSubState.subIdx, safeActiveIdx, sIdx, modalSel);
                      setCategories(newCategories);
                      setModalSel(newModalSel);
                      setDragSubState(null);
                    }}
                    onDragEnd={(e) => {
                      e.stopPropagation();
                      setDragSubState(null);
                    }}
                  >
                    <DotsSixVertical size={12} className="absolute left-1.5 text-slate-300 hover:text-slate-400 cursor-grab opacity-0 group-hover/sub:opacity-100 transition-opacity duration-200" weight="bold" />
                    <ArrowElbowDownRight size={12} className="text-slate-350 mr-2 shrink-0" />
                    <span className="truncate flex-1">{sub.label}</span>
                    <div className="hidden group-hover/sub:flex items-center gap-1 text-[#2563eb] shrink-0 ml-2 select-none">
                      <span className="text-[8px] font-extrabold uppercase tracking-wider">Sửa</span>
                      <Pencil size={10} weight="bold" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {activeCat && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 mt-auto shrink-0">
            <button
              type="button"
              onClick={() => handleAddSubmenu(safeActiveIdx)}
              className="flex items-center gap-2 py-1.5 px-2 text-[#2563eb] font-bold text-[11px] hover:bg-blue-50 rounded-lg cursor-pointer transition-colors border-none bg-transparent outline-none uppercase tracking-wider group"
            >
              <div className="w-4.5 h-4.5 rounded-full bg-[#2563eb] group-hover:bg-blue-700 flex items-center justify-center text-white transition-colors shrink-0">
                <Plus size={8} weight="bold" />
              </div>
              Thêm danh mục con
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
