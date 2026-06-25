import React, { useState } from "react";
import { Image as ImageIcon, Plus, CaretLeft, CaretRight, ArrowLeft, ArrowRight, Trash, UploadSimple, FloppyDisk } from "@phosphor-icons/react";
import { HeroSlide, handleImageUpload } from "../constants/contentConstants";
import { useImageDrag } from "../hooks/useImageDrag";

interface HeroSlideEditorProps {
  heroSlides: HeroSlide[];
  setHeroSlides: (slides: HeroSlide[]) => void;
  onSave?: () => void;
}

export default function HeroSlideEditor({ heroSlides, setHeroSlides, onSave }: HeroSlideEditorProps) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const {
    dragState,
    handleMouseDown,
    handleMouseMove,
    handleTouchStart,
    handleTouchMove,
    handleDragEnd
  } = useImageDrag((target, posStr) => {
    if (target === "slide") {
      const newSlides = [...heroSlides];
      if (newSlides[activeSlideIndex]) {
        newSlides[activeSlideIndex] = { ...newSlides[activeSlideIndex], objectPosition: posStr };
        setHeroSlides(newSlides);
      }
    }
  });

  const currentSlide = heroSlides[activeSlideIndex];

  return (
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
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={(e) => handleTouchStart(e, "slide", currentSlide?.objectPosition)}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleDragEnd}
          style={{ cursor: dragState && dragState.target === "slide" ? "grabbing" : (currentSlide?.image ? "grab" : "default") }}
          className="relative aspect-[16/9.5] w-full overflow-hidden rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center select-none shadow-3xs group"
        >
          {currentSlide ? (
            <>
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/35 pointer-events-none" />

              <div className="absolute bottom-4 left-4 right-4 z-10 text-white text-left pointer-events-none">
                <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-wide drop-shadow-md line-clamp-2">
                  {currentSlide.title || "Slide chưa đặt tên"}
                </h2>
              </div>

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

        {currentSlide && (
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
        )}
      </div>
    </div>
  );
}
