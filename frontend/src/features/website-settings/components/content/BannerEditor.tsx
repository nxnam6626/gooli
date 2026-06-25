import React from "react";
import { Image as ImageIcon, UploadSimple } from "@phosphor-icons/react";
import { handleImageUpload } from "../../constants/contentConstants";
import { useImageDrag } from "../../hooks/useImageDrag";

interface BannerEditorProps {
  bannerTopImage: string;
  setBannerTopImage: (img: string) => void;
  bannerTopAlt: string;
  bannerTopPosition: string;
  setBannerTopPosition: (pos: string) => void;
  bannerBottomImage: string;
  setBannerBottomImage: (img: string) => void;
  bannerBottomAlt: string;
  bannerBottomPosition: string;
  setBannerBottomPosition: (pos: string) => void;
}

export default function BannerEditor({
  bannerTopImage,
  setBannerTopImage,
  bannerTopAlt,
  bannerTopPosition,
  setBannerTopPosition,
  bannerBottomImage,
  setBannerBottomImage,
  bannerBottomAlt,
  bannerBottomPosition,
  setBannerBottomPosition
}: BannerEditorProps) {
  const {
    dragState,
    handleMouseDown,
    handleMouseMove,
    handleTouchStart,
    handleTouchMove,
    handleDragEnd
  } = useImageDrag((target, posStr) => {
    if (target === "bannerTop") setBannerTopPosition(posStr);
    if (target === "bannerBottom") setBannerBottomPosition(posStr);
  });

  return (
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

          <div
            onMouseDown={(e) => handleMouseDown(e, "bannerTop", bannerTopPosition)}
            onMouseMove={handleMouseMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={(e) => handleTouchStart(e, "bannerTop", bannerTopPosition)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleDragEnd}
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

          <div
            onMouseDown={(e) => handleMouseDown(e, "bannerBottom", bannerBottomPosition)}
            onMouseMove={handleMouseMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={(e) => handleTouchStart(e, "bannerBottom", bannerBottomPosition)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleDragEnd}
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
  );
}
