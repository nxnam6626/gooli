"use client";

import React, { useState, useEffect } from "react";

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
import { 
  Plus, 
  ArrowLeft, 
  ArrowRight, 
  Trash, 
  UploadSimple, 
  Image as ImageIcon,
  CaretLeft,
  CaretRight,
  CaretDown,
  House,
  Tree,
  Cube,
  Columns,
  Stack,
  Rows,
  Ruler,
  GridFour,
  Wrench,
  FloppyDisk,
  DotsSixVertical
} from "@phosphor-icons/react";

interface HeroSlide {
  id: number;
  image: string;
  title: string;
  alt: string;
  objectPosition?: string;
}

const COLOR_THEMES = [
  {
    overlayBg: "bg-[#D8A4B8]/75",
    textColor: "text-[#2D0618]"
  },
  {
    overlayBg: "bg-[#FBE49F]/80",
    textColor: "text-[#2D1F00]"
  },
  {
    overlayBg: "bg-[#ADCBEB]/80",
    textColor: "text-[#03142B]"
  },
  {
    overlayBg: "bg-[#F3CFCB]/80",
    textColor: "text-[#2D0D09]"
  },
  {
    overlayBg: "bg-[#E6C29E]/80",
    textColor: "text-[#2E1502]"
  },
  {
    overlayBg: "bg-[#A9DFBF]/80",
    textColor: "text-[#0A2411]"
  }
];

interface CategorySubMenu {
  label: string;
  href: string;
}

interface Category {
  label: string;
  href: string;
  icon: string;
  image?: string;
  imagePosition?: string;
  description?: string;
  subMenu?: CategorySubMenu[];
}

interface ContentTabProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  heroSlides: HeroSlide[];
  setHeroSlides: React.Dispatch<React.SetStateAction<HeroSlide[]>>;
  bannerTopImage: string;
  setBannerTopImage: (val: string) => void;
  bannerTopAlt: string;
  bannerTopPosition: string;
  setBannerTopPosition: (val: string) => void;
  bannerBottomImage: string;
  setBannerBottomImage: (val: string) => void;
  bannerBottomAlt: string;
  bannerBottomPosition: string;
  setBannerBottomPosition: (val: string) => void;
  onSave?: () => void;
  onSwitchTab?: (tab: "general" | "categories" | "content" | "seo") => void;
}

const iconMap: Record<string, React.ElementType> = {
  House,
  Tree,
  Cube,
  Columns,
  Stack,
  Rows,
  Ruler,
  GridFour,
  Wrench
};

const getIcon = (iconName: string) => {
  return iconMap[iconName] || Stack;
};

const ICON_OPTIONS = [
  { label: "Mặc định (Ngăn xếp)", value: "Stack" },
  { label: "Ngôi nhà (Trang chủ/Chung)", value: "House" },
  { label: "Cây xanh (Cảnh quan)", value: "Tree" },
  { label: "Khối 3D (Vật liệu)", value: "Cube" },
  { label: "Cột dọc (Kiến trúc)", value: "Columns" },
  { label: "Hàng ngang", value: "Rows" },
  { label: "Thước đo (Thiết kế)", value: "Ruler" },
  { label: "Lưới (Bố cục)", value: "GridFour" },
  { label: "Cờ lê (Công cụ/Thi công)", value: "Wrench" }
];

export default function ContentTab({
  categories,
  setCategories,
  heroSlides,
  setHeroSlides,
  bannerTopImage,
  setBannerTopImage,
  bannerTopAlt,
  bannerTopPosition,
  setBannerTopPosition,
  bannerBottomImage,
  setBannerBottomImage,
  bannerBottomAlt,
  bannerBottomPosition,
  setBannerBottomPosition,
  onSave,
  onSwitchTab
}: ContentTabProps) {
  
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [modalSel, setModalSel] = useState<{ type: "category" | "submenu"; catIdx: number; subIdx?: number } | null>(null);
  const [dragCatIdx, setDragCatIdx] = useState<number | null>(null);
  const [dragSubState, setDragSubState] = useState<{ catIdx: number; subIdx: number } | null>(null);
  const [expandedCats, setExpandedCats] = useState<Record<number, boolean>>({});
  const [dragState, setDragState] = useState<{
    target: "slide" | "bannerTop" | "bannerBottom" | "categoryImage";
    startX: number;
    startY: number;
    startPercentX: number;
    startPercentY: number;
    catIdx?: number;
  } | null>(null);

  const resolvedSel = (() => {
    if (editingIndex === null) return null;
    if (!modalSel) return { type: "category" as const, catIdx: editingIndex };
    if (modalSel.type === "submenu") {
      const c = categories[modalSel.catIdx];
      if (!c || !c.subMenu || modalSel.subIdx === undefined || modalSel.subIdx >= c.subMenu.length)
        return { type: "category" as const, catIdx: editingIndex };
    } else {
      if (modalSel.catIdx >= categories.length) return { type: "category" as const, catIdx: editingIndex };
    }
    return modalSel;
  })();

  // Make sure activeSlideIndex is within bounds if slides change
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (heroSlides.length === 0) {
      setActiveSlideIndex(0);
    } else if (activeSlideIndex >= heroSlides.length) {
      setActiveSlideIndex(heroSlides.length - 1);
    }
  }, [heroSlides.length, activeSlideIndex]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Image upload helper converting to Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước file ảnh quá lớn (vui lòng chọn file dưới 5MB) để tránh vượt quá dung lượng lưu trữ.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        callback(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Helper to parse "X% Y%" string to percentage number
  const parsePosition = (posStr?: string): [number, number] => {
    if (!posStr) return [50, 50];
    const parts = posStr.split(" ");
    if (parts.length !== 2) return [50, 50];
    const x = parseFloat(parts[0]);
    const y = parseFloat(parts[1]);
    return [isNaN(x) ? 50 : x, isNaN(y) ? 50 : y];
  };

  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    target: "slide" | "bannerTop" | "bannerBottom" | "categoryImage",
    currentPosStr?: string,
    catIdx?: number
  ) => {
    // Only drag with left click
    if (e.button !== 0) return;
    e.preventDefault();

    const [startXPercent, startYPercent] = parsePosition(currentPosStr);

    setDragState({
      target,
      startX: e.clientX,
      startY: e.clientY,
      startPercentX: startXPercent,
      startPercentY: startYPercent,
      catIdx
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragState) return;

    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Calculate mouse delta
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;

    // Convert pixels to percentage: Dragging left shifts object-position right (increasing X%)
    const changeX = (dx / rect.width) * 100;
    const changeY = (dy / rect.height) * 100;

    const newX = Math.max(0, Math.min(100, dragState.startPercentX - changeX));
    const newY = Math.max(0, Math.min(100, dragState.startPercentY - changeY));

    const posStr = `${newX.toFixed(1)}% ${newY.toFixed(1)}%`;

    if (dragState.target === "slide") {
      const newSlides = [...heroSlides];
      if (newSlides[activeSlideIndex]) {
        newSlides[activeSlideIndex] = {
          ...newSlides[activeSlideIndex],
          objectPosition: posStr
        };
        setHeroSlides(newSlides);
      }
    } else if (dragState.target === "bannerTop") {
      setBannerTopPosition(posStr);
    } else if (dragState.target === "bannerBottom") {
      setBannerBottomPosition(posStr);
    } else if (dragState.target === "categoryImage" && dragState.catIdx !== undefined) {
      const newCats = [...categories];
      if (newCats[dragState.catIdx]) {
        newCats[dragState.catIdx] = {
          ...newCats[dragState.catIdx],
          imagePosition: posStr
        };
        setCategories(newCats);
      }
    }
  };

  const handleTouchStart = (
    e: React.TouchEvent<HTMLDivElement>,
    target: "slide" | "bannerTop" | "bannerBottom" | "categoryImage",
    currentPosStr?: string,
    catIdx?: number
  ) => {
    const touch = e.touches[0];
    if (!touch) return;

    const [startXPercent, startYPercent] = parsePosition(currentPosStr);

    setDragState({
      target,
      startX: touch.clientX,
      startY: touch.clientY,
      startPercentX: startXPercent,
      startPercentY: startYPercent,
      catIdx
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!dragState) return;
    const touch = e.touches[0];
    if (!touch) return;

    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dx = touch.clientX - dragState.startX;
    const dy = touch.clientY - dragState.startY;

    const changeX = (dx / rect.width) * 100;
    const changeY = (dy / rect.height) * 100;

    const newX = Math.max(0, Math.min(100, dragState.startPercentX - changeX));
    const newY = Math.max(0, Math.min(100, dragState.startPercentY - changeY));

    const posStr = `${newX.toFixed(1)}% ${newY.toFixed(1)}%`;

    if (dragState.target === "slide") {
      const newSlides = [...heroSlides];
      if (newSlides[activeSlideIndex]) {
        newSlides[activeSlideIndex] = {
          ...newSlides[activeSlideIndex],
          objectPosition: posStr
        };
        setHeroSlides(newSlides);
      }
    } else if (dragState.target === "bannerTop") {
      setBannerTopPosition(posStr);
    } else if (dragState.target === "bannerBottom") {
      setBannerBottomPosition(posStr);
    } else if (dragState.target === "categoryImage" && dragState.catIdx !== undefined) {
      const newCats = [...categories];
      if (newCats[dragState.catIdx]) {
        newCats[dragState.catIdx] = {
          ...newCats[dragState.catIdx],
          imagePosition: posStr
        };
        setCategories(newCats);
      }
    }
  };

  const handleMouseUpOrLeave = () => {
    if (dragState) {
      setDragState(null);
    }
  };

  const currentSlide = heroSlides[activeSlideIndex];

  return (
    <div className="space-y-5 font-sans">
      <div className="border-b border-slate-100 pb-3 select-none">
        <h3 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider block">Quản lý nội dung trang chủ</h3>
        <p className="text-slate-400 mt-0.5 text-[10px]">Tùy biến các khối tiêu đề, bài viết giới thiệu ở trang chủ public.</p>
      </div>

      <div className="space-y-4">


        {/* Bố cục mô phỏng Trang chủ Hero Section */}
        <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/20 space-y-4 mt-6">
          <div className="border-b border-slate-100 pb-2 select-none">
            <h3 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider block">
              Bố cục trực quan phần Hero Trang chủ
            </h3>
            <p className="text-slate-400 mt-0.5 text-[10px]">
              Nhấn giữ và kéo chuột trái trực tiếp trên các ảnh xem trước (Preview) để điều chỉnh vùng ảnh muốn hiển thị (Object Position).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Cột 1: Cấu hình danh mục (bên trái) */}
            <div className="hidden lg:flex flex-col h-full bg-white border border-slate-200 rounded-xl relative min-h-[400px] overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between select-none">
                <span className="font-bold text-slate-700 text-[11px] uppercase tracking-widest">Cấu trúc danh mục</span>
                <span className="bg-slate-200/70 text-slate-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                  {categories.length}
                </span>
              </div>
              <div className="flex flex-col flex-1 overflow-y-auto scrollbar-thin">
                {categories.map((cat, idx) => {
                  const IconComponent = cat.icon ? getIcon(cat.icon) : Stack;
                  const hasSub = (cat.subMenu?.length || 0) > 0;
                  const isExpanded = expandedCats[idx] || (editingIndex === idx);
                  const isActive = editingIndex === idx && resolvedSel?.type === "category";
                  
                  return (
                    <div 
                      key={idx} 
                      className={`flex flex-col border-b border-slate-100/50 last:border-b-0 ${isActive ? 'bg-blue-50/40' : ''} transition-opacity ${dragCatIdx === idx ? "opacity-40" : "opacity-100"}`}
                      draggable
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
                          const newCats = [...categories];
                          const srcSub = [...(newCats[dragSubState.catIdx].subMenu || [])];
                          const [moved] = srcSub.splice(dragSubState.subIdx, 1);
                          newCats[dragSubState.catIdx] = { ...newCats[dragSubState.catIdx], subMenu: srcSub };
                          const dstSub = [...(newCats[idx].subMenu || []), moved];
                          newCats[idx] = { ...newCats[idx], subMenu: dstSub };
                          setCategories(newCats);
                          setModalSel({ type: "submenu", catIdx: idx, subIdx: dstSub.length - 1 });
                          setDragSubState(null);
                          return;
                        }

                        if (dragCatIdx === null || dragCatIdx === idx) return;
                        const newCats = [...categories];
                        const [moved] = newCats.splice(dragCatIdx, 1);
                        newCats.splice(idx, 0, moved);
                        setCategories(newCats);
                        if (modalSel) {
                          if (modalSel.type === "category") {
                            const newIdx = modalSel.catIdx === dragCatIdx ? idx
                              : modalSel.catIdx === idx ? dragCatIdx
                              : modalSel.catIdx;
                            setModalSel({ ...modalSel, catIdx: newIdx });
                          } else if (modalSel.catIdx === dragCatIdx) {
                            setModalSel({ ...modalSel, catIdx: idx });
                          } else if (modalSel.catIdx === idx) {
                            setModalSel({ ...modalSel, catIdx: dragCatIdx });
                          }
                        }
                        setDragCatIdx(null);
                      }}
                      onDragEnd={() => { setDragCatIdx(null); setDragSubState(null); }}
                    >
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
                            {cat.subMenu!.length}
                          </span>
                        )}
                      </div>
                      
                      {/* Expanded subcategories */}
                      {isExpanded && hasSub && (
                        <div className="flex flex-col gap-0.5 pl-3 pb-3 border-l border-slate-200 ml-[23px]">
                          {cat.subMenu!.map((sub, sIdx) => {
                            const isSubActive = editingIndex === idx && resolvedSel?.type === "submenu" && resolvedSel?.subIdx === sIdx;
                            return (
                              <div 
                                key={sIdx} 
                                draggable
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

                                  const newCats = [...categories];
                                  if (dragSubState.catIdx === idx) {
                                    const currentSub = [...(newCats[idx].subMenu || [])];
                                    const [moved] = currentSub.splice(dragSubState.subIdx, 1);
                                    currentSub.splice(sIdx, 0, moved);
                                    newCats[idx] = { ...newCats[idx], subMenu: currentSub };
                                    setCategories(newCats);
                                    if (modalSel?.type === "submenu" && modalSel.catIdx === idx) {
                                      const newSubIdx = modalSel.subIdx === dragSubState.subIdx ? sIdx
                                        : modalSel.subIdx === sIdx ? dragSubState.subIdx
                                        : modalSel.subIdx;
                                      setModalSel({ ...modalSel, subIdx: newSubIdx });
                                    }
                                  } else {
                                    const srcSub = [...(newCats[dragSubState.catIdx].subMenu || [])];
                                    const [moved] = srcSub.splice(dragSubState.subIdx, 1);
                                    newCats[dragSubState.catIdx] = { ...newCats[dragSubState.catIdx], subMenu: srcSub };
                                    const dstSub = [...(newCats[idx].subMenu || [])];
                                    dstSub.splice(sIdx, 0, moved);
                                    newCats[idx] = { ...newCats[idx], subMenu: dstSub };
                                    setCategories(newCats);
                                    setModalSel({ type: "submenu", catIdx: idx, subIdx: sIdx });
                                  }
                                  setDragSubState(null);
                                }}
                                onDragEnd={(e) => { e.stopPropagation(); setDragSubState(null); }}
                                className={`flex items-center py-2 px-3 text-slate-600 text-[11px] font-medium cursor-pointer transition-all duration-200 group/sub relative ${isSubActive ? 'text-[#2563eb] bg-blue-50/50 rounded-r-lg' : 'hover:bg-slate-50 hover:text-[#2563eb] rounded-r-lg'} ${dragSubState?.catIdx === idx && dragSubState?.subIdx === sIdx ? "opacity-40" : "opacity-100"}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setModalSel({ type: "submenu", catIdx: idx, subIdx: sIdx });
                                  setEditingIndex(idx);
                                }}
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
              
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 mt-auto shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const newCats = [...categories];
                    newCats.push({ label: "Danh mục mới", href: "/san-pham/moi", icon: "Stack", subMenu: [] });
                    setCategories(newCats);
                    setModalSel({ type: "category", catIdx: newCats.length - 1 });
                    setEditingIndex(newCats.length - 1);
                  }}
                  className="flex items-center gap-2.5 py-2 px-2 text-[#2563eb] font-bold text-[11px] hover:bg-blue-50 rounded-lg cursor-pointer transition-colors border-none bg-transparent outline-none uppercase tracking-wider group"
                >
                  <div className="w-5 h-5 rounded-full bg-[#2563eb] group-hover:bg-blue-700 flex items-center justify-center text-white transition-colors shrink-0">
                    <Plus size={10} weight="bold" />
                  </div>
                  Thêm danh mục
                </button>
              </div>
            </div>

            {/* Cột 2 & 3: Inline Editor or Default Content */}
            {editingIndex !== null && resolvedSel !== null ? (
              <div className="lg:col-span-3 flex flex-col bg-white border border-slate-200 rounded-xl shadow-3xs overflow-hidden min-h-[600px]">
                <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-thin">
                  {/* CATEGORY EDIT VIEW */}
                  {resolvedSel.type === "category" && (() => {
                    const cIdx = resolvedSel.catIdx;
                    const cat = categories[cIdx];
                    if (!cat) return null;
                    const linkType = detectLinkType(cat.href, cat.label);
                    const inputCls = "w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-sm transition-all";
                    const labelCls = "font-bold text-slate-500 text-[10px] uppercase tracking-wider mb-1.5 block";
                    const disabledInputCls = "w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-slate-400 font-semibold text-sm cursor-not-allowed";

                    return (
                      <div className="space-y-6">
                        <div className="flex items-start justify-between">
                          <h4 className="font-extrabold text-slate-800 text-xl leading-tight">Chỉnh sửa danh mục</h4>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Xác nhận xóa danh mục "${cat.label}"?`)) {
                                const newCats = categories.filter((_, i) => i !== cIdx);
                                setCategories(newCats);
                                setModalSel(newCats.length > 0 ? { type: "category", catIdx: 0 } : null);
                              }
                            }}
                            className="text-red-500 hover:text-red-700 font-bold text-xs bg-transparent border-none cursor-pointer outline-none transition-colors shrink-0"
                          >
                            Xóa danh mục
                          </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                          {/* Cột trái: Tải ảnh (lg:col-span-5) */}
                          <div className="lg:col-span-5 flex flex-col gap-3">
                            <label className={labelCls}>Ảnh đại diện danh mục</label>
                            
                            <div 
                              onMouseDown={(e) => handleMouseDown(e, "categoryImage", cat.imagePosition, cIdx)}
                              onMouseMove={handleMouseMove}
                              onMouseUp={handleMouseUpOrLeave}
                              onMouseLeave={handleMouseUpOrLeave}
                              onTouchStart={(e) => handleTouchStart(e, "categoryImage", cat.imagePosition, cIdx)}
                              onTouchMove={handleTouchMove}
                              onTouchEnd={handleMouseUpOrLeave}
                              style={{ cursor: dragState && dragState.target === "categoryImage" && dragState.catIdx === cIdx ? "grabbing" : (cat.image ? "grab" : "default") }}
                              className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center select-none shadow-3xs group"
                            >
                              {cat.image ? (
                                <>
                                  <img
                                    src={cat.image}
                                    alt={cat.label}
                                    style={{ objectPosition: cat.imagePosition || "50% 50%" }}
                                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none"
                                    onError={(e) => {
                                      e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%2364748b'%3EẢnh lỗi hoặc chưa có%3C/text%3E%3C/svg%3E";
                                    }}
                                  />
                                  {/* Drag Tooltip Hint */}
                                  <div className="absolute top-2 right-2 z-10 bg-black/70 text-white font-bold text-[8px] uppercase px-2 py-0.8 rounded-md tracking-wider pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-md border border-white/10">
                                    <span>Kéo để chỉnh vị trí</span>
                                  </div>
                                </>
                              ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 text-slate-400 gap-1.5 border border-dashed border-slate-200">
                                  <ImageIcon size={26} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
                                  <span className="text-[10px] font-bold text-slate-500">Chưa có ảnh danh mục</span>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col gap-1.5 mt-1">
                              <div className="flex gap-2 items-center">
                                {cat.image?.startsWith("data:image/") ? (
                                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-slate-600 font-semibold text-xs flex justify-between items-center select-none">
                                    <span className="truncate max-w-[150px] text-emerald-600 font-bold">✓ Đã tải ảnh lên</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newCats = [...categories];
                                        newCats[cIdx] = { ...newCats[cIdx], image: "", imagePosition: "50% 50%" };
                                        setCategories(newCats);
                                      }}
                                      className="text-red-500 hover:text-red-750 font-bold text-[10px] bg-transparent border-none cursor-pointer outline-none"
                                    >
                                      Xóa ảnh
                                    </button>
                                  </div>
                                ) : (
                                  <input
                                    type="text"
                                    value={cat.image || ""}
                                    onChange={(e) => {
                                      const newCats = [...categories];
                                      newCats[cIdx] = { ...newCats[cIdx], image: e.target.value };
                                      setCategories(newCats);
                                    }}
                                    placeholder="Hoặc dán URL ảnh"
                                    className="flex-1 bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all"
                                  />
                                )}
                                <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg font-bold text-xs cursor-pointer text-slate-700 flex items-center gap-1.5 select-none shrink-0 transition-colors">
                                  <UploadSimple size={14} />
                                  Tải lên
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, (base64) => {
                                      const newCats = [...categories];
                                      newCats[cIdx] = { ...newCats[cIdx], image: base64, imagePosition: "50% 50%" };
                                      setCategories(newCats);
                                    })}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* Cột phải: Các trường nhập liệu (lg:col-span-7) */}
                          <div className="lg:col-span-7 space-y-5">
                            <div>
                              <label className={labelCls}>Tên danh mục</label>
                            <input
                              type="text"
                              value={cat.label}
                              onChange={(e) => {
                                const newLabel = e.target.value;
                                const newCats = [...categories];
                                const curType = detectLinkType(cat.href, cat.label);
                                newCats[cIdx] = { ...newCats[cIdx], label: newLabel, href: curType === "auto" ? `/san-pham/${toSlug(newLabel)}` : cat.href };
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
                                newCats[cIdx] = { ...newCats[cIdx], icon: e.target.value };
                                setCategories(newCats);
                              }}
                              className={inputCls}
                            >
                              {ICON_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
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
                                  newCats[cIdx] = { ...newCats[cIdx], href: newHref };
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
                              {linkType === "auto" && (
                                <input type="text" disabled value={cat.href} className={disabledInputCls} />
                              )}
                              {linkType === "system" && (
                                <select
                                  value={cat.href}
                                  onChange={(e) => {
                                    const newCats = [...categories];
                                    newCats[cIdx] = { ...newCats[cIdx], href: e.target.value };
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
                                  value={cat.href}
                                  onChange={(e) => {
                                    const newCats = [...categories];
                                    newCats[cIdx] = { ...newCats[cIdx], href: e.target.value };
                                    setCategories(newCats);
                                  }}
                                  className={inputCls}
                                />
                              )}
                            </div>
                          </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 mt-6">
                            <div className="flex items-center justify-between mb-3">
                              <label className="font-bold text-slate-800 text-sm">Danh sách mục con</label>
                              <button
                                type="button"
                                onClick={() => {
                                  const newCats = [...categories];
                                  const currentSub = [...(newCats[cIdx].subMenu || [])];
                                  currentSub.push({ label: "Mục con mới", href: "/san-pham/moi" });
                                  newCats[cIdx] = { ...newCats[cIdx], subMenu: currentSub };
                                  setCategories(newCats);
                                  setModalSel({ type: "submenu", catIdx: cIdx, subIdx: currentSub.length - 1 });
                                }}
                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#2563eb] font-bold text-xs rounded-md transition-colors border-none outline-none cursor-pointer"
                              >
                                + Thêm mục con
                              </button>
                            </div>

                            {!cat.subMenu || cat.subMenu.length === 0 ? (
                              <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                <span className="text-slate-400 text-xs font-semibold">Chưa có mục con nào</span>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                {cat.subMenu.map((sub, sIdx) => (
                                  <button
                                    key={sIdx}
                                    type="button"
                                    onClick={() => setModalSel({ type: "submenu", catIdx: cIdx, subIdx: sIdx })}
                                    className="w-full flex items-center gap-2 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left transition-colors border-none outline-none cursor-pointer group"
                                  >
                                    <span className="text-[10px] font-bold text-slate-400 shrink-0 w-5">#{sIdx + 1}</span>
                                    <span className="text-sm font-semibold text-slate-700 flex-1 truncate">{sub.label}</span>
                                    <span className="text-[11px] text-slate-400 truncate max-w-[160px] hidden sm:block">{sub.href}</span>
                                    <span className="text-[10px] text-[#2563eb] font-bold opacity-0 group-hover:opacity-100 transition-opacity shrink-0">Sửa →</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                    );
                  })()}

                  {/* SUBMENU EDIT VIEW */}
                  {resolvedSel.type === "submenu" && resolvedSel.subIdx !== undefined && (() => {
                    const cIdx = resolvedSel.catIdx;
                    const sIdx = resolvedSel.subIdx!;
                    const cat = categories[cIdx];
                    const sub = cat?.subMenu?.[sIdx];
                    if (!cat || !sub) return null;
                    const subLinkType = detectLinkType(sub.href, sub.label);
                    const inputCls = "w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-sm transition-all";
                    const labelCls = "font-bold text-slate-500 text-[10px] uppercase tracking-wider mb-1.5 block";
                    const disabledInputCls = "w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-slate-400 font-semibold text-sm cursor-not-allowed";

                    return (
                      <div className="space-y-6">
                        <button
                          type="button"
                          onClick={() => setModalSel({ type: "category", catIdx: cIdx })}
                          className="flex items-center gap-1.5 text-[#2563eb] hover:text-blue-800 font-semibold text-sm bg-transparent border-none cursor-pointer outline-none transition-colors"
                        >
                          ← Quay lại: {cat.label}
                        </button>

                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-extrabold text-slate-800 text-xl leading-tight">Chỉnh sửa mục con</h4>
                            <p className="text-slate-400 text-xs mt-0.5">Thuộc danh mục: <span className="font-semibold text-slate-500">{cat.label}</span></p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newCats = [...categories];
                              const currentSub = [...(newCats[cIdx].subMenu || [])];
                              currentSub.splice(sIdx, 1);
                              newCats[cIdx] = { ...newCats[cIdx], subMenu: currentSub };
                              setCategories(newCats);
                              setModalSel({ type: "category", catIdx: cIdx });
                            }}
                            className="text-red-500 hover:text-red-700 font-bold text-xs bg-transparent border-none cursor-pointer outline-none transition-colors shrink-0"
                          >
                            Xóa mục con
                          </button>
                        </div>

                        <div className="space-y-5">
                          <div>
                            <label className={labelCls}>Tên mục con</label>
                            <input
                              type="text"
                              value={sub.label}
                              onChange={(e) => {
                                const newLabel = e.target.value;
                                const newCats = [...categories];
                                const currentSub = [...(newCats[cIdx].subMenu || [])];
                                const curType = detectLinkType(sub.href, sub.label);
                                currentSub[sIdx] = { ...currentSub[sIdx], label: newLabel, href: curType === "auto" ? `/san-pham/${toSlug(newLabel)}` : sub.href };
                                newCats[cIdx] = { ...newCats[cIdx], subMenu: currentSub };
                                setCategories(newCats);
                              }}
                              className={inputCls}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className={labelCls}>Loại liên kết</label>
                              <select
                                value={subLinkType}
                                onChange={(e) => {
                                  const type = e.target.value;
                                  const newCats = [...categories];
                                  const currentSub = [...(newCats[cIdx].subMenu || [])];
                                  let newHref = sub.href;
                                  if (type === "auto") newHref = `/san-pham/${toSlug(sub.label)}`;
                                  else if (type === "system") newHref = "/san-pham";
                                  else if (type === "custom") newHref = "/";
                                  currentSub[sIdx] = { ...currentSub[sIdx], href: newHref };
                                  newCats[cIdx] = { ...newCats[cIdx], subMenu: currentSub };
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
                              {subLinkType === "auto" && <input type="text" disabled value={sub.href} className={disabledInputCls} />}
                              {subLinkType === "system" && (
                                <select value={sub.href} onChange={(e) => { const nc = [...categories]; const cs = [...(nc[cIdx].subMenu || [])]; cs[sIdx] = { ...cs[sIdx], href: e.target.value }; nc[cIdx] = { ...nc[cIdx], subMenu: cs }; setCategories(nc); }} className={inputCls}>
                                  {SYSTEM_PAGES.map((p) => <option key={p.value} value={p.value}>{p.label} ({p.value})</option>)}
                                </select>
                              )}
                              {subLinkType === "custom" && (
                                <input type="text" value={sub.href} onChange={(e) => { const nc = [...categories]; const cs = [...(nc[cIdx].subMenu || [])]; cs[sIdx] = { ...cs[sIdx], href: e.target.value }; nc[cIdx] = { ...nc[cIdx], subMenu: cs }; setCategories(nc); }} className={inputCls} />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* FOOTER */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-white rounded-b-2xl shrink-0">
                  <button
                    type="button"
                    onClick={() => { setEditingIndex(null); setModalSel(null); }}
                    className="px-5 py-2 text-slate-700 font-semibold text-sm bg-white hover:bg-slate-50 border border-slate-200 rounded-lg cursor-pointer outline-none transition-colors"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    onClick={() => { onSave?.(); setEditingIndex(null); setModalSel(null); }}
                    className="px-5 py-2 bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-sm rounded-lg cursor-pointer border-none outline-none flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <span>💾</span>
                    Lưu cấu hình
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Cột 2: Trình chỉnh sửa Slideshow (ở giữa) */}
                <div className="lg:col-span-2 flex flex-col justify-between bg-white border border-slate-200 rounded-xl p-4 shadow-3xs">
                  <div className="space-y-3">
                <div className="font-bold text-slate-800 text-[10px] uppercase tracking-wider pb-1.5 border-b border-slate-100 flex items-center justify-between select-none">
                  <div className="flex items-center gap-2">
                    <span>Trình Slideshow bên trái (Hero Slider)</span>
                    {heroSlides.length > 0 && (
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[9px]">
                        Slide {activeSlideIndex + 1} / {heroSlides.length}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newId = heroSlides.length > 0 ? Math.max(...heroSlides.map(s => s.id)) + 1 : 1;
                      const newSlides = [
                        ...heroSlides,
                        { id: newId, image: "", title: "Slide mới", alt: "Ảnh slide mới" }
                      ];
                      setHeroSlides(newSlides);
                      setActiveSlideIndex(newSlides.length - 1);
                    }}
                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded flex items-center gap-1 shadow-3xs transition-colors cursor-pointer outline-none border-none"
                  >
                    <Plus size={10} weight="bold" />
                    Thêm slide mới
                  </button>
                </div>

                {/* Khung mô phỏng Slider Preview (Hỗ trợ kéo thả Object Position) */}
                <div 
                  onMouseDown={(e) => handleMouseDown(e, "slide", currentSlide?.objectPosition)}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUpOrLeave}
                  onMouseLeave={handleMouseUpOrLeave}
                  onTouchStart={(e) => handleTouchStart(e, "slide", currentSlide?.objectPosition)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUpOrLeave}
                  style={{ cursor: dragState && dragState.target === "slide" ? "grabbing" : (currentSlide?.image ? "grab" : "default") }}
                  className="relative aspect-[16/9.5] w-full overflow-hidden rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center select-none shadow-3xs group"
                >
                  {currentSlide ? (
                    <>
                      {/* Image Preview */}
                      {currentSlide.image ? (
                        <>
                          <img
                            src={currentSlide.image}
                            alt={currentSlide.alt}
                            style={{ objectPosition: currentSlide.objectPosition || "50% 50%" }}
                            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none"
                            onError={(e) => {
                              e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%2364748b'%3EẢnh lỗi hoặc chưa có%3C/text%3E%3C/svg%3E";
                            }}
                          />
                          {/* Drag Tooltip Hint */}
                          <div className="absolute top-2 right-2 z-10 bg-black/70 text-white font-bold text-[8px] uppercase px-2 py-0.8 rounded-md tracking-wider pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-md border border-white/10">
                            <span>Kéo để chỉnh vị trí</span>
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 text-slate-400 gap-1.5 border border-dashed border-slate-200">
                          <ImageIcon size={26} className="text-slate-300 animate-pulse" />
                          <span className="text-[10px] font-bold text-slate-500">Chưa có hình ảnh (Hãy tải lên hoặc dán URL ở dưới)</span>
                        </div>
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/35 pointer-events-none" />
                      
                      {/* Slide Title */}
                      <div className="absolute bottom-4 left-4 right-4 z-10 text-white text-left pointer-events-none">
                        <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-wide drop-shadow-md line-clamp-2">
                          {currentSlide.title || "Slide chưa đặt tên"}
                        </h2>
                      </div>

                      {/* Chevrons điều hướng slide */}
                      {heroSlides.length > 1 && (
                        <>
                          <button
                            key="prev-btn"
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setActiveSlideIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 text-white/80 hover:text-white transition-all hover:scale-110 active:scale-95 bg-black/25 hover:bg-black/45 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer border-none outline-none"
                            title="Slide trước"
                          >
                            <CaretLeft size={16} weight="bold" />
                          </button>
                          <button
                            key="next-btn"
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setActiveSlideIndex((prev) => (prev + 1) % heroSlides.length);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 text-white/80 hover:text-white transition-all hover:scale-110 active:scale-95 bg-black/25 hover:bg-black/45 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer border-none outline-none"
                            title="Slide sau"
                          >
                            <CaretRight size={16} weight="bold" />
                          </button>
                        </>
                      )}

                      {/* Dots chỉ báo đáy slide */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 pointer-events-auto">
                        {heroSlides.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveSlideIndex(idx);
                            }}
                            className={`w-4 h-[2px] transition-all cursor-pointer border-none outline-none ${
                              idx === activeSlideIndex ? "bg-white" : "bg-white/40 hover:bg-white/70"
                            }`}
                            title={`Chuyển đến slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-[10px] text-slate-400 font-semibold text-center p-6 flex flex-col items-center gap-2 select-none">
                      <ImageIcon size={28} className="text-slate-300" />
                      <span>Chưa có slide nào trong slideshow</span>
                    </div>
                  )}
                </div>

                {/* Phần nhập chi tiết cho Slide đang chọn */}
                {currentSlide ? (
                  <div className="mt-3 bg-slate-50 border border-slate-150 rounded-xl p-3 space-y-2.5">
                    <div className="flex justify-between items-center border-b border-slate-200/50 pb-1.5">
                      <span className="font-extrabold text-slate-700 text-[9px] uppercase tracking-wider flex items-center gap-2">
                        <span>Thông tin Slide {activeSlideIndex + 1}</span>
                        {currentSlide.objectPosition && (
                          <span className="text-[8px] font-bold text-slate-400 lowercase">
                            Vị trí: {currentSlide.objectPosition}
                          </span>
                        )}
                      </span>
                      <div className="flex gap-1.5 items-center">
                        {/* Reordering */}
                        <button
                          type="button"
                          disabled={activeSlideIndex === 0}
                          onClick={() => {
                            if (activeSlideIndex === 0) return;
                            const newSlides = [...heroSlides];
                            const temp = newSlides[activeSlideIndex];
                            newSlides[activeSlideIndex] = newSlides[activeSlideIndex - 1];
                            newSlides[activeSlideIndex - 1] = temp;
                            setHeroSlides(newSlides);
                            setActiveSlideIndex(activeSlideIndex - 1);
                          }}
                          className="p-1 rounded bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 shadow-3xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Di chuyển về trước"
                        >
                          <ArrowLeft size={10} />
                        </button>
                        <button
                          type="button"
                          disabled={activeSlideIndex === heroSlides.length - 1}
                          onClick={() => {
                            if (activeSlideIndex === heroSlides.length - 1) return;
                            const newSlides = [...heroSlides];
                            const temp = newSlides[activeSlideIndex];
                            newSlides[activeSlideIndex] = newSlides[activeSlideIndex + 1];
                            newSlides[activeSlideIndex + 1] = temp;
                            setHeroSlides(newSlides);
                            setActiveSlideIndex(activeSlideIndex + 1);
                          }}
                          className="p-1 rounded bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 shadow-3xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Di chuyển về sau"
                        >
                          <ArrowRight size={10} />
                        </button>
                        
                        {/* Delete slide */}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Xác nhận xóa slide "${currentSlide.title || 'này'}"?`)) {
                              const newSlides = heroSlides.filter((_, idx) => idx !== activeSlideIndex);
                              setHeroSlides(newSlides);
                              setActiveSlideIndex(Math.max(0, activeSlideIndex - 1));
                            }
                          }}
                          className="text-red-500 hover:text-red-700 font-bold text-[9px] bg-transparent border-none cursor-pointer outline-none flex items-center gap-0.5 ml-1.5"
                          title="Xóa slide này"
                        >
                          <Trash size={11} />
                          Xóa
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-slate-600 text-[9px]">Tiêu đề slide</label>
                        <input
                          type="text"
                          required
                          value={currentSlide.title}
                          onChange={(e) => {
                            const newSlides = [...heroSlides];
                            newSlides[activeSlideIndex] = { ...newSlides[activeSlideIndex], title: e.target.value };
                            setHeroSlides(newSlides);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg py-1 px-2 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-[11px] transition-all"
                        />
                      </div>

                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-600 text-[9px]">Đường dẫn ảnh (URL hoặc /path)</label>
                      <div className="flex gap-2 items-center">
                        {currentSlide.image.startsWith("data:image/") ? (
                          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-slate-600 font-semibold text-[11px] flex justify-between items-center select-none">
                            <span className="truncate max-w-[150px] text-emerald-600 font-bold">✓ Đã tải ảnh lên</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newSlides = [...heroSlides];
                                newSlides[activeSlideIndex] = { ...newSlides[activeSlideIndex], image: "" };
                                setHeroSlides(newSlides);
                              }}
                              className="text-red-500 hover:text-red-750 font-bold text-[9px] bg-transparent border-none cursor-pointer outline-none"
                            >
                              Xóa ảnh
                            </button>
                          </div>
                        ) : (
                          <input
                            type="text"
                            required
                            value={currentSlide.image}
                            onChange={(e) => {
                              const newSlides = [...heroSlides];
                              newSlides[activeSlideIndex] = { ...newSlides[activeSlideIndex], image: e.target.value };
                              setHeroSlides(newSlides);
                            }}
                            className="flex-1 bg-white border border-slate-200 rounded-lg py-1 px-2 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-[11px] transition-all"
                          />
                        )}
                        <label className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg font-bold text-[9px] cursor-pointer text-slate-700 flex items-center gap-1 select-none shrink-0 transition-colors">
                          <UploadSimple size={12} />
                          Tải lên
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, (base64) => {
                              const newSlides = [...heroSlides];
                              newSlides[activeSlideIndex] = { ...newSlides[activeSlideIndex], image: base64 };
                              setHeroSlides(newSlides);
                            })}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => onSave?.()}
                        className="px-3 py-1.5 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-lg text-[9px] cursor-pointer outline-none border-none flex items-center gap-1 shadow-3xs transition-colors"
                      >
                        <FloppyDisk size={12} />
                        Lưu slide
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

            </div>

            {/* Cột 3: Trình chỉnh sửa Banners (bên phải) */}
            <div className="flex flex-col gap-4 h-full">
              
              {/* Banner Phía Trên */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-3xs flex flex-col justify-between flex-1">
                <div className="flex flex-col h-full">
                  <div className="font-bold text-slate-800 text-[10px] uppercase tracking-wider pb-1.5 border-b border-slate-100 flex items-center justify-between select-none">
                    <span>Banner Phía Trên</span>
                    {bannerTopPosition && (
                      <span className="text-[8px] font-bold text-slate-400 lowercase">
                        Vị trí: {bannerTopPosition}
                      </span>
                    )}
                  </div>

                  {/* Top Banner visual preview (Hỗ trợ kéo thả) */}
                  <div 
                    onMouseDown={(e) => handleMouseDown(e, "bannerTop", bannerTopPosition)}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUpOrLeave}
                    onMouseLeave={handleMouseUpOrLeave}
                    onTouchStart={(e) => handleTouchStart(e, "bannerTop", bannerTopPosition)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleMouseUpOrLeave}
                    style={{ cursor: dragState && dragState.target === "bannerTop" ? "grabbing" : (bannerTopImage ? "grab" : "default") }}
                    className="relative flex-1 min-h-[120px] w-full overflow-hidden rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center mt-2.5 mb-3 shadow-3xs select-none group"
                  >
                    {bannerTopImage ? (
                      <>
                        <img
                          src={bannerTopImage}
                          alt={bannerTopAlt}
                          style={{ objectPosition: bannerTopPosition || "50% 50%" }}
                          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none"
                          onError={(e) => {
                            e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='9' fill='%2364748b'%3EẢnh lỗi hoặc chưa có%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        {/* Drag Tooltip Hint */}
                        <div className="absolute top-1.5 right-1.5 z-10 bg-black/70 text-white font-bold text-[7px] uppercase px-1.5 py-0.5 rounded tracking-wider pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-white/10">
                          Kéo để chỉnh vị trí
                        </div>
                      </>
                    ) : (
                      <ImageIcon size={18} className="text-slate-400" />
                    )}
                  </div>
                </div>

                <div className="space-y-2 mt-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-1.5 items-center">
                      {bannerTopImage.startsWith("data:image/") ? (
                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-slate-600 font-semibold text-[10px] flex justify-between items-center select-none">
                          <span className="truncate max-w-[130px] text-emerald-600 font-bold">✓ Đã tải ảnh lên</span>
                          <button
                            type="button"
                            onClick={() => setBannerTopImage("")}
                            className="text-red-500 hover:text-red-750 font-bold text-[9px] bg-transparent border-none cursor-pointer outline-none"
                          >
                            Xóa ảnh
                          </button>
                        </div>
                      ) : (
                        <input
                          type="text"
                          required
                          value={bannerTopImage}
                          onChange={(e) => setBannerTopImage(e.target.value)}
                          placeholder="Đường dẫn ảnh banner trên"
                          className="flex-1 bg-white border border-slate-200 rounded-lg py-1 px-2 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-[10px] transition-all"
                        />
                      )}
                      <label className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg font-bold text-[9px] cursor-pointer text-slate-700 flex items-center gap-0.5 select-none shrink-0 transition-colors">
                        <UploadSimple size={11} />
                        Tải
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, (base64) => setBannerTopImage(base64))}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                </div>
              </div>

              {/* Banner Phía Dưới */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-3xs flex flex-col justify-between flex-1">
                <div className="flex flex-col h-full">
                  <div className="font-bold text-slate-800 text-[10px] uppercase tracking-wider pb-1.5 border-b border-slate-100 flex items-center justify-between select-none">
                    <span>Banner Phía Dưới</span>
                    {bannerBottomPosition && (
                      <span className="text-[8px] font-bold text-slate-400 lowercase">
                        Vị trí: {bannerBottomPosition}
                      </span>
                    )}
                  </div>

                  {/* Bottom Banner visual preview (Hỗ trợ kéo thả) */}
                  <div 
                    onMouseDown={(e) => handleMouseDown(e, "bannerBottom", bannerBottomPosition)}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUpOrLeave}
                    onMouseLeave={handleMouseUpOrLeave}
                    onTouchStart={(e) => handleTouchStart(e, "bannerBottom", bannerBottomPosition)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleMouseUpOrLeave}
                    style={{ cursor: dragState && dragState.target === "bannerBottom" ? "grabbing" : (bannerBottomImage ? "grab" : "default") }}
                    className="relative flex-1 min-h-[120px] w-full overflow-hidden rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center mt-2.5 mb-3 shadow-3xs select-none group"
                  >
                    {bannerBottomImage ? (
                      <>
                        <img
                          src={bannerBottomImage}
                          alt={bannerBottomAlt}
                          style={{ objectPosition: bannerBottomPosition || "50% 50%" }}
                          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none"
                          onError={(e) => {
                            e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='9' fill='%2364748b'%3EẢnh lỗi hoặc chưa có%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        {/* Drag Tooltip Hint */}
                        <div className="absolute top-1.5 right-1.5 z-10 bg-black/70 text-white font-bold text-[7px] uppercase px-1.5 py-0.5 rounded tracking-wider pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-white/10">
                          Kéo để chỉnh vị trí
                        </div>
                      </>
                    ) : (
                      <ImageIcon size={18} className="text-slate-400" />
                    )}
                  </div>
                </div>

                <div className="space-y-2 mt-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-1.5 items-center">
                      {bannerBottomImage.startsWith("data:image/") ? (
                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-slate-600 font-semibold text-[10px] flex justify-between items-center select-none">
                          <span className="truncate max-w-[130px] text-emerald-600 font-bold">✓ Đã tải ảnh lên</span>
                          <button
                            type="button"
                            onClick={() => setBannerBottomImage("")}
                            className="text-red-500 hover:text-red-750 font-bold text-[9px] bg-transparent border-none cursor-pointer outline-none"
                          >
                            Xóa ảnh
                          </button>
                        </div>
                      ) : (
                        <input
                          type="text"
                          required
                          value={bannerBottomImage}
                          onChange={(e) => setBannerBottomImage(e.target.value)}
                          placeholder="Đường dẫn ảnh banner dưới"
                          className="flex-1 bg-white border border-slate-200 rounded-lg py-1 px-2 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-[10px] transition-all"
                        />
                      )}
                      <label className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg font-bold text-[9px] cursor-pointer text-slate-700 flex items-center gap-0.5 select-none shrink-0 transition-colors">
                        <UploadSimple size={11} />
                        Tải
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, (base64) => setBannerBottomImage(base64))}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                </div>
              </div>

            </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
