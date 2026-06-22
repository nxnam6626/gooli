"use client";

import React, { useState } from "react";
import { DotsSixVertical } from "@phosphor-icons/react";

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
  // Drag and Drop states
  const [activeDragCategory, setActiveDragCategory] = useState<number | null>(null);
  const [activeDragSubmenu, setActiveDragSubmenu] = useState<string | null>(null);

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

    const newMainCat = {
      label: submenuItem.label,
      href: submenuItem.href,
      icon: "Stack",
      subMenu: []
    };

    newCats.splice(destIdx, 0, newMainCat);
    setCategories(newCats);
  };

  const demoteCategoryToSubmenu = (srcCatIdx: number, destCatIdx: number) => {
    if (srcCatIdx === destCatIdx) return;
    const newCats = [...categories];
    const mainCatToDemote = newCats[srcCatIdx];

    const subItemsToAdd = [{ label: mainCatToDemote.label, href: mainCatToDemote.href }];
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

    const subItemsToAdd = [{ label: mainCatToDemote.label, href: mainCatToDemote.href }];
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

  // DropZone Components
  const CategoryDropZone = ({ index }: { index: number }) => {
    const [isOver, setIsOver] = useState(false);
    return (
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsOver(true);
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(e) => {
          setIsOver(false);
          const data = e.dataTransfer.getData("application/json");
          if (data) {
            try {
              handleCategoryDrop(JSON.parse(data), index);
            } catch (err) {
              console.error(err);
            }
          }
        }}
        className={`h-2 transition-all duration-150 rounded-lg flex items-center justify-center ${
          isOver ? "bg-blue-50 border-2 border-dashed border-[#2563eb] h-12 my-2" : "bg-transparent h-2"
        }`}
      >
        {isOver && (
          <span className="text-[10px] text-[#2563eb] font-bold uppercase tracking-wider">
            Thả vào đây để xếp vị trí {index + 1}
          </span>
        )}
      </div>
    );
  };

  const SubmenuItemDropZone = ({ catIdx, subIdx }: { catIdx: number; subIdx: number }) => {
    const [isOver, setIsOver] = useState(false);
    return (
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsOver(true);
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(e) => {
          setIsOver(false);
          const data = e.dataTransfer.getData("application/json");
          if (data) {
            try {
              handleSubmenuDrop(JSON.parse(data), catIdx, subIdx);
            } catch (err) {
              console.error(err);
            }
          }
        }}
        className={`h-1.5 transition-all duration-150 rounded flex items-center justify-center ${
          isOver ? "bg-blue-50 border border-dashed border-[#2563eb] h-8 my-1" : "bg-transparent h-1.5"
        }`}
      >
        {isOver && (
          <span className="text-[9px] text-[#2563eb] font-bold uppercase tracking-wider">
            Thả vào đây để chèn vào vị trí {subIdx + 1}
          </span>
        )}
      </div>
    );
  };

  const DemoteDropZone = ({ catIdx }: { catIdx: number }) => {
    const [isOver, setIsOver] = useState(false);
    return (
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsOver(true);
        }}
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
            } catch (err) {
              console.error(err);
            }
          }
        }}
        className={`border border-dashed rounded-lg p-2.5 text-center transition-all duration-150 ${
          isOver
            ? "border-[#2563eb] bg-blue-50/50 text-[#2563eb]"
            : "border-slate-200 bg-slate-50/20 text-slate-400 hover:border-slate-350"
        }`}
      >
        <span className="text-[10px] font-bold uppercase tracking-wider block">
          {isOver ? "Thả để chuyển thành mục con!" : "Thả danh mục khác vào đây để chuyển thành danh mục con"}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-3 flex justify-between items-center select-none">
        <div>
          <h3 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider block">Quản lý Danh mục Sản phẩm</h3>
          <p className="text-slate-400 mt-0.5 text-[10px]">Chỉnh sửa tên danh mục, đường dẫn, biểu tượng và các menu con hiển thị ngoài trang chủ.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCategories([
              ...categories,
              { label: "Danh mục mới", href: "/san-pham/moi", icon: "Stack", subMenu: [] }
            ]);
          }}
          className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-850 font-bold rounded-lg text-[10px] cursor-pointer outline-none border-none select-none"
        >
          + Thêm danh mục chính
        </button>
      </div>

      <div className="space-y-1">
        {categories.map((cat, catIdx) => (
          <React.Fragment key={catIdx}>
            {catIdx === 0 && <CategoryDropZone index={0} />}
            <div
              draggable={activeDragCategory === catIdx}
              onDragStart={(e) => handleDragStart(e, catIdx)}
              onDragEnd={() => setActiveDragCategory(null)}
              className={`border border-slate-200 rounded-xl p-4 bg-slate-50/30 space-y-3 relative group transition-all ${
                activeDragCategory === catIdx ? "opacity-40 border-[#2563eb] shadow-md scale-[0.99]" : ""
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                  <button
                    type="button"
                    onMouseDown={() => setActiveDragCategory(catIdx)}
                    onMouseLeave={() => setActiveDragCategory(null)}
                    className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-1 flex items-center justify-center border-none bg-transparent outline-none select-none"
                    title="Nhấp giữ kéo để di chuyển vị trí hoặc kéo vào ô Thả bên dưới của danh mục khác để chuyển thành danh mục con"
                  >
                    <DotsSixVertical size={16} />
                  </button>
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">{catIdx + 1}</span>
                  <span>{cat.label || "Danh mục chưa đặt tên"}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Xác nhận xóa danh mục "${cat.label}"?`)) {
                      setCategories(categories.filter((_, idx) => idx !== catIdx));
                    }
                  }}
                  className="text-red-500 hover:text-red-700 font-bold text-[10px] bg-transparent border-none cursor-pointer outline-none"
                >
                  Xóa danh mục
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600 text-[10px]">Tên danh mục</label>
                  <input
                    type="text"
                    required
                    value={cat.label}
                    onChange={(e) => {
                      const newCats = [...categories];
                      newCats[catIdx] = { ...newCats[catIdx], label: e.target.value };
                      setCategories(newCats);
                    }}
                    className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600 text-[10px]">Đường dẫn (href)</label>
                  <input
                    type="text"
                    required
                    value={cat.href}
                    onChange={(e) => {
                      const newCats = [...categories];
                      newCats[catIdx] = { ...newCats[catIdx], href: e.target.value };
                      setCategories(newCats);
                    }}
                    className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600 text-[10px]">Biểu tượng (Icon)</label>
                  <select
                    value={cat.icon}
                    onChange={(e) => {
                      const newCats = [...categories];
                      newCats[catIdx] = { ...newCats[catIdx], icon: e.target.value };
                      setCategories(newCats);
                    }}
                    className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-[#1e293b] font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
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
              </div>

              {/* Submenu section */}
              <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-3 mt-2">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-700 text-[10px] uppercase tracking-wider">Danh mục con (Submenu)</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newCats = [...categories];
                      const currentSub = newCats[catIdx].subMenu ? [...(newCats[catIdx].subMenu || [])] : [];
                      currentSub.push({ label: "Menu con mới", href: `${cat.href}/moi` });
                      newCats[catIdx] = { ...newCats[catIdx], subMenu: currentSub };
                      setCategories(newCats);
                    }}
                    className="px-2 py-1 bg-blue-50 text-[#2563eb] hover:bg-blue-100 font-bold rounded text-[9px] cursor-pointer outline-none border-none"
                  >
                    + Thêm menu con
                  </button>
                </div>

                {(!cat.subMenu || cat.subMenu.length === 0) ? (
                  <div className="space-y-2">
                    <div className="text-[10px] text-slate-400 font-semibold text-center py-2 select-none">
                      Không có danh mục con.
                    </div>
                    <DemoteDropZone catIdx={catIdx} />
                  </div>
                ) : (
                  <div className="space-y-1">
                    {cat.subMenu.map((sub, subIdx) => (
                      <React.Fragment key={subIdx}>
                        {subIdx === 0 && <SubmenuItemDropZone catIdx={catIdx} subIdx={0} />}
                        <div
                          draggable={activeDragSubmenu === `${catIdx}-${subIdx}`}
                          onDragStart={(e) => handleDragStart(e, catIdx, subIdx)}
                          onDragEnd={() => setActiveDragSubmenu(null)}
                          className={`flex gap-2 items-center transition-all ${
                            activeDragSubmenu === `${catIdx}-${subIdx}` ? "opacity-40" : ""
                          }`}
                        >
                          <button
                            type="button"
                            onMouseDown={() => setActiveDragSubmenu(`${catIdx}-${subIdx}`)}
                            onMouseLeave={() => setActiveDragSubmenu(null)}
                            className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-1 flex items-center justify-center border-none bg-transparent outline-none select-none"
                          >
                            <DotsSixVertical size={14} />
                          </button>
                          <input
                            type="text"
                            required
                            value={sub.label}
                            placeholder="Tên menu con"
                            onChange={(e) => {
                              const newCats = [...categories];
                              const currentSub = newCats[catIdx].subMenu ? [...(newCats[catIdx].subMenu || [])] : [];
                              currentSub[subIdx] = { ...currentSub[subIdx], label: e.target.value };
                              newCats[catIdx] = { ...newCats[catIdx], subMenu: currentSub };
                              setCategories(newCats);
                            }}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 text-slate-800 font-semibold text-xs focus:outline-none focus:border-[#2563eb]"
                          />
                          <input
                            type="text"
                            required
                            value={sub.href}
                            placeholder="Đường dẫn"
                            onChange={(e) => {
                              const newCats = [...categories];
                              const currentSub = newCats[catIdx].subMenu ? [...(newCats[catIdx].subMenu || [])] : [];
                              currentSub[subIdx] = { ...currentSub[subIdx], href: e.target.value };
                              newCats[catIdx] = { ...newCats[catIdx], subMenu: currentSub };
                              setCategories(newCats);
                            }}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 text-slate-800 font-semibold text-xs focus:outline-none focus:border-[#2563eb]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newCats = [...categories];
                              const currentSub = newCats[catIdx].subMenu ? [...(newCats[catIdx].subMenu || [])] : [];
                              const filteredSub = currentSub.filter((_, idx) => idx !== subIdx);
                              newCats[catIdx] = { ...newCats[catIdx], subMenu: filteredSub };
                              setCategories(newCats);
                            }}
                            className="text-rose-500 hover:text-rose-700 font-bold text-xs bg-transparent border-none cursor-pointer outline-none p-1.5"
                          >
                            Xóa
                          </button>
                        </div>
                        <SubmenuItemDropZone catIdx={catIdx} subIdx={subIdx + 1} />
                      </React.Fragment>
                    ))}
                    <div className="mt-2">
                      <DemoteDropZone catIdx={catIdx} />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <CategoryDropZone index={catIdx + 1} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
