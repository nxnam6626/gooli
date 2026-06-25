import React, { useState } from "react";
import { ContentSettings } from "../../hooks/useWebsiteSettings";
import { CategorySidebar, CategoryEditor } from "./categories";
import HeroSlideEditor from "./HeroSlideEditor";
import BannerEditor from "./BannerEditor";

interface ContentTabProps {
  config: ContentSettings;
  onChange: (newConfig: Partial<ContentSettings>) => void;
  onSave?: () => void;
}

export default function ContentTab({ config, onChange, onSave }: ContentTabProps) {
  // State quản lý UI nội bộ
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [modalSel, setModalSel] = useState<{ type: "category" | "submenu"; catIdx: number; subIdx?: number } | null>(null);

  // Helper cho update categories
  const setCategories = (newCategories: ContentSettings["categories"]) => {
    onChange({ categories: newCategories });
  };

  // Helper cho update slides
  const setHeroSlides = (newSlides: ContentSettings["heroSlides"]) => {
    onChange({ heroSlides: newSlides });
  };

  return (
    <div className="space-y-5 font-sans">

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Cột 1: Cấu hình danh mục (bên trái) */}
        <CategorySidebar
          categories={config.categories}
          setCategories={setCategories}
          editingIndex={editingIndex}
          setEditingIndex={setEditingIndex}
          modalSel={modalSel}
          setModalSel={setModalSel}
        />

        {/* Cột 2 & 3: Nội dung ở giữa (Inline Editor or Slideshow) */}
        {editingIndex !== null && modalSel !== null ? (
          <CategoryEditor
            categories={config.categories}
            setCategories={setCategories}
            resolvedSel={modalSel}
            setModalSel={setModalSel}
            setEditingIndex={setEditingIndex}
          />
        ) : (
          <HeroSlideEditor
            heroSlides={config.heroSlides}
            setHeroSlides={setHeroSlides}
            onSave={onSave}
          />
        )}

        {/* Cột 4: Trình chỉnh sửa Banners (bên phải) */}
        {(editingIndex === null || modalSel === null) && (
          <BannerEditor
            bannerTopImage={config.bannerTopImage}
            setBannerTopImage={(img) => onChange({ bannerTopImage: img })}
            bannerTopAlt={config.bannerTopAlt}
            bannerTopPosition={config.bannerTopPosition}
            setBannerTopPosition={(pos) => onChange({ bannerTopPosition: pos })}
            bannerBottomImage={config.bannerBottomImage}
            setBannerBottomImage={(img) => onChange({ bannerBottomImage: img })}
            bannerBottomAlt={config.bannerBottomAlt}
            bannerBottomPosition={config.bannerBottomPosition}
            setBannerBottomPosition={(pos) => onChange({ bannerBottomPosition: pos })}
          />
        )}
      </div>
    </div>
  );
}
