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
  House,
  Tree,
  Cube,
  Columns,
  Stack,
  Rows,
  Ruler,
  GridFour,
  Wrench,
  FloppyDisk
} from "@phosphor-icons/react";

interface HeroSlide {
  id: number;
  image: string;
  title: string;
  alt: string;
  objectPosition?: string;
}

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
  const [dragState, setDragState] = useState<{
    target: "slide" | "bannerTop" | "bannerBottom";
    startX: number;
    startY: number;
    startPercentX: number;
    startPercentY: number;
  } | null>(null);

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

    if (file.size > 2 * 1024 * 1024) {
      alert("Kích thước file ảnh quá lớn (vui lòng chọn file dưới 2MB) để tránh vượt quá dung lượng lưu trữ.");
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
    target: "slide" | "bannerTop" | "bannerBottom",
    currentPosStr?: string
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
      startPercentY: startYPercent
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
    }
  };

  const handleTouchStart = (
    e: React.TouchEvent<HTMLDivElement>,
    target: "slide" | "bannerTop" | "bannerBottom",
    currentPosStr?: string
  ) => {
    const touch = e.touches[0];
    if (!touch) return;

    const [startXPercent, startYPercent] = parsePosition(currentPosStr);

    setDragState({
      target,
      startX: touch.clientX,
      startY: touch.clientY,
      startPercentX: startXPercent,
      startPercentY: startYPercent
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
            <div className="hidden lg:flex flex-col bg-white border border-slate-200 rounded-xl p-3 relative min-h-[400px]">
              <div className="font-bold text-slate-800 text-[10px] uppercase tracking-wider pb-1.5 border-b border-slate-100 mb-2 select-none flex items-center justify-between">
                <span>Danh mục sản phẩm</span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[9px] font-semibold">
                  {categories.length} mục
                </span>
              </div>
              <div className="flex flex-col gap-1 flex-1 overflow-y-auto pr-1 scrollbar-thin">
                {categories.map((cat, idx) => {
                  const IconComponent = cat.icon ? getIcon(cat.icon) : Stack;



                  return (
                    <div 
                      key={idx} 
                      onClick={() => setEditingIndex(idx)}
                      className="flex items-center justify-between py-1.5 px-1 border-b border-slate-100 text-slate-700 font-semibold text-[10px] hover:bg-slate-50 rounded cursor-pointer transition-colors group/item"
                    >
                      <div className="flex items-center gap-2">
                        <IconComponent size={14} className="text-slate-400 group-hover/item:text-[#B06518] transition-colors" />
                        <span className="uppercase tracking-wider group-hover/item:text-slate-900">{cat?.label || `DANH MỤC ${idx + 1}`}</span>
                      </div>
                      <div className="flex items-center gap-1 select-none">
                        <span className="text-[8px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded opacity-0 group-hover/item:opacity-100 transition-opacity">Sửa</span>
                        <CaretRight size={10} className="text-slate-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => {
                  const newCats = [...categories];
                  newCats.push({ label: "Danh mục mới", href: "/san-pham/moi", icon: "Stack", subMenu: [] });
                  setCategories(newCats);
                  setEditingIndex(newCats.length - 1);
                }}
                className="w-full flex items-center justify-between py-2 px-1 text-slate-700 font-bold text-[9px] border-t border-slate-100 mt-1.5 hover:bg-slate-50 rounded cursor-pointer transition-colors border-none bg-transparent outline-none uppercase tracking-wider"
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#B06518] flex items-center justify-center text-white text-[9px] font-bold">+</div>
                  <span className="text-[#B06518]">Thêm danh mục</span>
                </div>
                <span className="text-[#B06518]">+</span>
              </button>
            </div>

            {/* Cột 2: Trình chỉnh sửa Slideshow (ở giữa) */}
            <div className="lg:col-span-2 flex flex-col justify-between bg-white border border-slate-200 rounded-xl p-4 shadow-3xs">
              <div className="space-y-3">
                <div className="font-bold text-slate-800 text-[10px] uppercase tracking-wider pb-1.5 border-b border-slate-100 flex items-center justify-between select-none">
                  <span>Trình Slideshow bên trái (Hero Slider)</span>
                  {heroSlides.length > 0 && (
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[9px]">
                      Slide {activeSlideIndex + 1} / {heroSlides.length}
                    </span>
                  )}
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

              {/* Nút thêm slide */}
              <div className="pt-3 border-t border-slate-100 mt-3 flex justify-center">
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
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-[9px] cursor-pointer outline-none border-none select-none flex items-center gap-1 shadow-3xs transition-colors"
                >
                  <Plus size={11} />
                  Thêm slide mới
                </button>
              </div>
            </div>

            {/* Cột 3: Trình chỉnh sửa Banners (bên phải) */}
            <div className="flex flex-col gap-4">
              
              {/* Banner Phía Trên */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-3xs flex flex-col justify-between">
                <div>
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
                    className="relative aspect-[21/9] w-full overflow-hidden rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center mt-2.5 shadow-3xs select-none group"
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
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-3xs flex flex-col justify-between">
                <div>
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
                    className="relative aspect-[21/9] w-full overflow-hidden rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center mt-2.5 shadow-3xs select-none group"
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

          </div>
        </div>

      </div>

      {/* ── Modal chỉnh sửa nhanh danh mục ── */}
      {editingIndex !== null && editingIndex < categories.length && (() => {
        const cat = categories[editingIndex];
        const linkType = detectLinkType(cat.href, cat.label);
        const modalInputCls = "w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all";
        const modalLabelCls = "font-bold text-slate-600 text-[10px] uppercase tracking-wider mb-1 block";
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setEditingIndex(null)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 space-y-4 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-800 text-sm">Chỉnh sửa nhanh danh mục</h4>
                <button
                  type="button"
                  onClick={() => setEditingIndex(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-lg bg-transparent border-none cursor-pointer outline-none leading-none"
                >
                  &times;
                </button>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={modalLabelCls}>Tên danh mục</label>
                  <input
                    type="text"
                    value={cat.label}
                    onChange={(e) => {
                      const newLabel = e.target.value;
                      const newCats = [...categories];
                      const currentType = detectLinkType(cat.href, cat.label);
                      newCats[editingIndex] = {
                        ...newCats[editingIndex],
                        label: newLabel,
                        href: currentType === "auto" ? `/san-pham/${toSlug(newLabel)}` : cat.href
                      };
                      setCategories(newCats);
                    }}
                    className={modalInputCls}
                  />
                </div>
                <div>
                  <label className={modalLabelCls}>Biểu tượng</label>
                  <select
                    value={cat.icon}
                    onChange={(e) => {
                      const newCats = [...categories];
                      newCats[editingIndex] = { ...newCats[editingIndex], icon: e.target.value };
                      setCategories(newCats);
                    }}
                    className={modalInputCls}
                  >
                    <option value="House">Ngôi nhà</option>
                    <option value="Tree">Cái cây</option>
                    <option value="Cube">Khối</option>
                    <option value="Columns">Cột</option>
                    <option value="Stack">Lớp</option>
                    <option value="Rows">Hàng</option>
                    <option value="Ruler">Thước</option>
                    <option value="GridFour">Lưới</option>
                    <option value="Wrench">Cờ lê</option>
                  </select>
                </div>
                <div>
                  <label className={modalLabelCls}>Loại liên kết</label>
                  <select
                    value={linkType}
                    onChange={(e) => {
                      const type = e.target.value;
                      const newCats = [...categories];
                      let newHref = cat.href;
                      if (type === "auto") newHref = `/san-pham/${toSlug(cat.label)}`;
                      else if (type === "system") newHref = "/san-pham";
                      else if (type === "custom") newHref = "/";
                      newCats[editingIndex] = { ...newCats[editingIndex], href: newHref };
                      setCategories(newCats);
                    }}
                    className={modalInputCls}
                  >
                    <option value="auto">Tự động (Danh mục SP)</option>
                    <option value="system">Trang hệ thống</option>
                    <option value="custom">Đường dẫn tự nhập</option>
                  </select>
                </div>
                <div>
                  <label className={modalLabelCls}>Chi tiết liên kết (href)</label>
                  {linkType === "auto" && (
                    <input type="text" disabled value={cat.href} className="w-full bg-slate-100 border border-slate-200 rounded-lg py-2 px-3 text-slate-500 font-semibold text-xs cursor-not-allowed" />
                  )}
                  {linkType === "system" && (
                    <select
                      value={cat.href}
                      onChange={(e) => {
                        const newCats = [...categories];
                        newCats[editingIndex] = { ...newCats[editingIndex], href: e.target.value };
                        setCategories(newCats);
                      }}
                      className={modalInputCls}
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
                        newCats[editingIndex] = { ...newCats[editingIndex], href: e.target.value };
                        setCategories(newCats);
                      }}
                      className={modalInputCls}
                    />
                  )}
                </div>
              </div>

              {/* Link to CategoriesTab */}
              <div className="border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingIndex(null);
                    onSwitchTab?.("categories");
                  }}
                  className="text-[#2563eb] hover:text-blue-800 font-semibold text-[11px] bg-transparent border-none cursor-pointer outline-none transition-colors"
                >
                  👉 Cấu hình danh mục con tại Tab &ldquo;Danh mục sản phẩm&rdquo;
                </button>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Xác nhận xóa danh mục "${cat.label}"?`)) {
                      setCategories(categories.filter((_, i) => i !== editingIndex));
                      setEditingIndex(null);
                    }
                  }}
                  className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-[10px] font-bold cursor-pointer border-none transition-colors"
                >
                  Xóa danh mục
                </button>
                <button
                  type="button"
                  onClick={() => setEditingIndex(null)}
                  className="px-4 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-[10px] font-bold cursor-pointer border-none transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

