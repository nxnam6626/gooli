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
  const [dragOverCatIdx, setDragOverCatIdx] = useState<number | null>(null);
  const [dragSubState, setDragSubState] = useState<{ catIdx: number; subIdx: number } | null>(null);
  const [dragOverSubIdx, setDragOverSubIdx] = useState<number | null>(null);
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
    <div className="grid grid-cols-1 md:grid-cols-[40%_60%] gap-0 h-[500px] w-full select-none divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-white">
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}} />
      {/* Cột Danh mục chính */}
      <div className="flex flex-col h-full bg-white overflow-hidden">
        <div className="bg-slate-50/50 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-sans text-[11px] font-bold text-slate-500 uppercase tracking-wider">Danh mục chính</span>
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-semibold">
            {categories.length}
          </span>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-1">
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2 border border-dashed border-slate-200 bg-slate-50/40 p-4 rounded-xl">
              <svg className="w-8 h-8 text-slate-350" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-[11px] font-semibold text-slate-550">Chưa có danh mục nào</span>
              <span className="text-[10px] text-slate-400">Bấm nút bên dưới để tạo mới</span>
            </div>
          ) : (
            categories.map((cat, idx) => {
              const IconComponent = cat.icon ? getIcon(cat.icon) : Stack;
              const hasSub = (cat.subMenu || []).length > 0;
              const isActive = editingIndex === idx && modalSel?.type === "category";
              const isFocused = safeActiveIdx === idx;
              const isDragging = dragCatIdx === idx;
              const isDragOver = dragOverCatIdx === idx && dragCatIdx !== idx;

              return (
                <div
                  key={idx}
                  draggable
                  className={`flex items-center py-3 px-4 text-slate-700 font-medium text-xs cursor-pointer transition-all duration-200 group relative rounded-lg border border-transparent outline-none
                    ${isFocused 
                      ? "bg-blue-50/80 text-blue-700 font-semibold shadow-xs" 
                      : "text-slate-600 hover:bg-slate-50/80 hover:text-slate-900"}
                    ${isActive ? "bg-blue-50/40" : ""}
                    ${isDragging ? "opacity-30 bg-slate-100" : "opacity-100"}
                    ${isDragOver ? "border-2 border-dashed border-blue-200 bg-blue-50/30 py-4 my-1" : ""}`}
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
                    if (dragCatIdx !== idx) {
                      setDragOverCatIdx(idx);
                    }
                  }}
                  onDragLeave={() => {
                    setDragOverCatIdx(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverCatIdx(null);
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
                    setDragOverCatIdx(null);
                    setDragSubState(null);
                  }}
                >
                  <div className="absolute left-1.5 flex items-center justify-center w-4 h-full cursor-grab opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <DotsSixVertical size={13} className="text-slate-400 hover:text-slate-600" weight="bold" />
                  </div>
                  
                  <IconComponent size={15} className={`mr-3 shrink-0 ${isFocused || isActive ? "text-blue-600" : "text-slate-400 group-hover:text-blue-600"} transition-colors`} />
                  
                  <span className={`truncate flex-1 ${isFocused || isActive ? "text-blue-700" : "text-slate-650"} group-hover:text-slate-900 transition-colors`}>
                    {cat?.label || `Danh mục ${idx + 1}`}
                  </span>

                  {hasSub && (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ml-2 group-hover:hidden transition-all ${isFocused ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                      {cat.subMenu?.length}
                    </span>
                  )}
                  
                  <div className="hidden group-hover:flex items-center gap-1 text-blue-600 shrink-0 ml-2 animate-fade-in bg-blue-100/50 hover:bg-blue-600 hover:text-white px-2 py-0.5 rounded-md transition-all">
                    <span className="text-[9px] font-bold">Sửa</span>
                    <Pencil size={10} weight="bold" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/30 mt-auto shrink-0">
          <button
            type="button"
            onClick={handleAddCategory}
            className="flex items-center justify-center gap-2 w-full py-2 px-4 text-blue-600 font-semibold text-xs border border-blue-200 hover:border-blue-500 bg-white hover:bg-blue-50/30 rounded-lg cursor-pointer transition-all duration-150 shadow-3xs outline-none active:scale-[0.98]"
          >
            <Plus size={12} weight="bold" />
            Thêm danh mục chính
          </button>
        </div>
      </div>

      {/* Cột Danh mục con */}
      <div className="flex flex-col h-full bg-slate-50/20 overflow-hidden">
        <div className="bg-slate-50/50 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-sans text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate max-w-[220px]">
            Danh mục con: {activeCat?.label || "Không có"}
          </span>
          {activeCat && (
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[9px] font-bold">
              {subMenu.length}
            </span>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-2">
          {!activeCat ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2 border border-dashed border-slate-200/60 bg-white/40 rounded-xl m-2 h-[calc(100%-16px)]">
              <svg className="w-8 h-8 text-slate-350" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <span className="text-[11px] font-medium text-slate-550">Chọn danh mục chính để xem danh mục con</span>
            </div>
          ) : subMenu.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2 border border-dashed border-slate-200/60 bg-white/40 rounded-xl m-2 h-[calc(100%-16px)]">
              <svg className="w-8 h-8 text-blue-400/50 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[11px] font-semibold text-slate-550">Chưa có danh mục con</span>
              <span className="text-[10px] text-slate-400">Bấm nút bên dưới để tạo mới danh mục con</span>
              <button
                type="button"
                onClick={() => handleAddSubmenu(safeActiveIdx)}
                className="mt-3 px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
              >
                Tạo danh mục con đầu tiên
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {subMenu.map((sub, sIdx) => {
                const isSubActive = editingIndex === safeActiveIdx && modalSel?.type === "submenu" && modalSel?.subIdx === sIdx;
                const isSubDragging = dragSubState?.catIdx === safeActiveIdx && dragSubState?.subIdx === sIdx;
                const isSubDragOver = dragOverSubIdx === sIdx && dragSubState?.subIdx !== sIdx;

                return (
                  <div
                    key={sIdx}
                    draggable
                    className={`flex items-center py-2.5 px-4 bg-white border text-slate-600 text-xs font-medium cursor-pointer transition-all duration-200 group/sub relative rounded-lg shadow-3xs
                      ${isSubActive 
                        ? "text-blue-700 border-blue-200 bg-blue-50/50 shadow-xs" 
                        : "border-slate-100 hover:border-blue-250 hover:bg-slate-50/30 hover:text-slate-900 hover:shadow-xs"}
                      ${isSubDragging ? "opacity-30 bg-slate-50 border-dashed" : "opacity-100"}
                      ${isSubDragOver ? "border-2 border-dashed border-blue-200 bg-blue-50/30 py-4 my-1" : ""}`}
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
                      if (dragSubState?.subIdx !== sIdx) {
                        setDragOverSubIdx(sIdx);
                      }
                    }}
                    onDragLeave={(e) => {
                      e.stopPropagation();
                      setDragOverSubIdx(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOverSubIdx(null);
                      if (!dragSubState || (dragSubState.catIdx === safeActiveIdx && dragSubState.subIdx === sIdx)) return;

                      const { newCategories, newModalSel } = moveSubmenu(categories, dragSubState.catIdx, dragSubState.subIdx, safeActiveIdx, sIdx, modalSel);
                      setCategories(newCategories);
                      setModalSel(newModalSel);
                      setDragSubState(null);
                    }}
                    onDragEnd={(e) => {
                      e.stopPropagation();
                      setDragSubState(null);
                      setDragOverSubIdx(null);
                    }}
                  >
                    <div className="absolute left-1.5 flex items-center justify-center w-4 h-full cursor-grab opacity-0 group-hover/sub:opacity-100 transition-opacity duration-200">
                      <DotsSixVertical size={12} className="text-slate-400 hover:text-slate-600" weight="bold" />
                    </div>
                    
                    <ArrowElbowDownRight size={12} className="text-blue-500/80 mr-2.5 shrink-0" />
                    
                    <span className="truncate flex-1 font-sans font-medium">{sub.label}</span>
                    
                    <div className="hidden group-hover/sub:flex items-center gap-1 text-blue-600 shrink-0 ml-2 select-none bg-blue-100/50 hover:bg-blue-600 hover:text-white px-2 py-0.5 rounded-md transition-all">
                      <span className="text-[9px] font-bold">Sửa</span>
                      <Pencil size={9} weight="bold" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {activeCat && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/30 mt-auto shrink-0">
            <button
              type="button"
              onClick={() => handleAddSubmenu(safeActiveIdx)}
              className="flex items-center justify-center gap-2 w-full py-2 px-4 text-blue-600 font-semibold text-xs border border-blue-200 hover:border-blue-500 bg-white hover:bg-blue-50/30 rounded-lg cursor-pointer transition-all duration-150 shadow-3xs outline-none active:scale-[0.98]"
            >
              <Plus size={11} weight="bold" />
              Thêm danh mục con
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
