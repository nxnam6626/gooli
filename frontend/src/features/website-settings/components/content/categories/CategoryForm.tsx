import React from 'react';
import { Image as ImageIcon, UploadSimple } from '@phosphor-icons/react';
import {
  Category,
  detectLinkType,
  ICON_OPTIONS,
  SYSTEM_PAGES,
  handleImageUpload,
} from '../../../constants/contentConstants';
import { useImageDrag } from '../../../hooks/useImageDrag';
import {
  deleteCategory,
  updateCategoryImage,
  updateCategoryLabel,
  updateCategoryIcon,
  updateCategoryLinkType,
  updateCategoryHref,
  addSubmenu,
  updateCategoryInternalId,
} from './categoryHelpers';

interface InternalCategory {
  id: number;
  name: string;
}

interface CategoryFormProps {
  categories: Category[];
  cIdx: number;
  setCategories: (cats: Category[]) => void;
  setModalSel: (
    sel: {
      type: 'category' | 'submenu';
      catIdx: number;
      subIdx?: number;
    } | null,
  ) => void;
  internalCategories: InternalCategory[];
}

export default function CategoryForm({
  categories,
  cIdx,
  setCategories,
  setModalSel,
  internalCategories,
}: CategoryFormProps) {
  const cat = categories[cIdx];

  const {
    dragState,
    handleMouseDown,
    handleMouseMove,
    handleTouchStart,
    handleTouchMove,
    handleDragEnd,
  } = useImageDrag((target, posStr, targetIdx) => {
    if (target === 'categoryImage' && targetIdx !== undefined) {
      setCategories(
        updateCategoryImage(
          categories,
          targetIdx,
          categories[targetIdx]?.image || '',
          posStr,
        ),
      );
    }
  });

  if (!cat) return null;

  const inputCls =
    'w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-sm transition-all';
  const labelCls =
    'font-bold text-slate-500 text-[10px] uppercase tracking-wider mb-1.5 block';
  const disabledInputCls =
    'w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-slate-400 font-semibold text-sm cursor-not-allowed';

  const linkType = detectLinkType(cat.href, cat.label);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <h4 className="font-extrabold text-slate-800 text-xl leading-tight">
          Chỉnh sửa danh mục
        </h4>
        <button
          type="button"
          onClick={() => {
            if (confirm(`Xác nhận xóa danh mục "${cat.label}"?`)) {
              const newCats = deleteCategory(categories, cIdx);
              setCategories(newCats);
              setModalSel(
                newCats.length > 0 ? { type: 'category', catIdx: 0 } : null,
              );
            }
          }}
          className="text-red-500 hover:text-red-700 font-bold text-xs bg-transparent border-none cursor-pointer outline-none transition-colors shrink-0"
        >
          Xóa danh mục
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Image Upload */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <label className={labelCls}>Ảnh đại diện danh mục</label>

          <div
            onMouseDown={(e) =>
              handleMouseDown(e, 'categoryImage', cat.imagePosition, cIdx)
            }
            onMouseMove={handleMouseMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={(e) =>
              handleTouchStart(e, 'categoryImage', cat.imagePosition, cIdx)
            }
            onTouchMove={handleTouchMove}
            onTouchEnd={handleDragEnd}
            style={{
              cursor:
                dragState &&
                dragState.target === 'categoryImage' &&
                dragState.catIdx === cIdx
                  ? 'grabbing'
                  : cat.image
                    ? 'grab'
                    : 'default',
            }}
            className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center select-none shadow-3xs group"
          >
            {cat.image ? (
              <>
                <img
                  src={cat.image}
                  alt={cat.label}
                  style={{ objectPosition: cat.imagePosition || '50% 50%' }}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none"
                  onError={(e) => {
                    e.currentTarget.src =
                      "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%2364748b'%3EẢnh lỗi hoặc chưa có%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div className="absolute top-2 right-2 z-10 bg-black/70 text-white font-bold text-[8px] uppercase px-2 py-0.8 rounded-md tracking-wider pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-md border border-white/10">
                  <span>Kéo để chỉnh vị trí</span>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 text-slate-400 gap-1.5 border border-dashed border-slate-200">
                <ImageIcon
                  size={26}
                  className="text-slate-300 group-hover:text-slate-400 transition-colors"
                />
                <span className="text-[10px] font-bold text-slate-500">
                  Chưa có ảnh danh mục
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5 mt-1">
            <div className="flex gap-2 items-center">
              {cat.image?.startsWith('data:image/') ? (
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-slate-600 font-semibold text-xs flex justify-between items-center select-none">
                  <span className="truncate max-w-[150px] text-emerald-600 font-bold">
                    ✓ Đã tải ảnh lên
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCategories(
                        updateCategoryImage(categories, cIdx, '', '50% 50%'),
                      );
                    }}
                    className="text-red-500 hover:text-red-750 font-bold text-[10px] bg-transparent border-none cursor-pointer outline-none"
                  >
                    Xóa ảnh
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  value={cat.image || ''}
                  onChange={(e) => {
                    setCategories(
                      updateCategoryImage(
                        categories,
                        cIdx,
                        e.target.value,
                        cat.imagePosition,
                      ),
                    );
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
                  onChange={(e) =>
                    handleImageUpload(e, (base64) => {
                      setCategories(
                        updateCategoryImage(
                          categories,
                          cIdx,
                          base64,
                          '50% 50%',
                        ),
                      );
                    })
                  }
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="lg:col-span-7 space-y-5">
          <div>
            <label className={labelCls}>Tên danh mục</label>
            <input
              type="text"
              value={cat.label}
              onChange={(e) => {
                setCategories(
                  updateCategoryLabel(categories, cIdx, e.target.value),
                );
              }}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Biểu tượng (Icon)</label>
            <select
              value={cat.icon}
              onChange={(e) => {
                setCategories(
                  updateCategoryIcon(categories, cIdx, e.target.value),
                );
              }}
              className={inputCls}
            >
              {ICON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>
              Liên kết Danh mục kho nội bộ (Option B)
            </label>
            <select
              value={cat.internalCategoryId ?? ''}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : null;
                setCategories(updateCategoryInternalId(categories, cIdx, val));
              }}
              className={inputCls}
            >
              <option value="">-- Không liên kết (Tùy chỉnh) --</option>
              {internalCategories.map((intCat) => (
                <option key={intCat.id} value={intCat.id}>
                  {intCat.name} (ID: {intCat.id})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-450 mt-1">
              Liên kết danh mục hiển thị này với danh mục kho nội bộ để sản phẩm
              thuộc danh mục kho đó tự động xuất hiện.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelCls}>Loại liên kết</label>
              <select
                value={linkType}
                onChange={(e) => {
                  setCategories(
                    updateCategoryLinkType(categories, cIdx, e.target.value),
                  );
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
              {linkType === 'auto' && (
                <input
                  type="text"
                  disabled
                  value={cat.href}
                  className={disabledInputCls}
                />
              )}
              {linkType === 'system' && (
                <select
                  value={cat.href}
                  onChange={(e) => {
                    setCategories(
                      updateCategoryHref(categories, cIdx, e.target.value),
                    );
                  }}
                  className={inputCls}
                >
                  {SYSTEM_PAGES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label} ({p.value})
                    </option>
                  ))}
                </select>
              )}
              {linkType === 'custom' && (
                <input
                  type="text"
                  value={cat.href}
                  onChange={(e) => {
                    setCategories(
                      updateCategoryHref(categories, cIdx, e.target.value),
                    );
                  }}
                  className={inputCls}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submenu section */}
      <div className="pt-2 border-t border-slate-100 mt-6">
        <div className="flex items-center justify-between mb-3">
          <label className="font-bold text-slate-800 text-sm">
            Danh sách mục con
          </label>
          <button
            type="button"
            onClick={() => {
              const { newCategories, newSubIdx } = addSubmenu(categories, cIdx);
              setCategories(newCategories);
              if (newSubIdx !== -1) {
                setModalSel({
                  type: 'submenu',
                  catIdx: cIdx,
                  subIdx: newSubIdx,
                });
              }
            }}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#2563eb] font-bold text-xs rounded-md transition-colors border-none outline-none cursor-pointer"
          >
            + Thêm mục con
          </button>
        </div>

        {!cat.subMenu || cat.subMenu.length === 0 ? (
          <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <span className="text-slate-400 text-xs font-semibold">
              Chưa có mục con nào
            </span>
          </div>
        ) : (
          <div className="space-y-1">
            {cat.subMenu.map((sub, sIdx) => (
              <button
                key={sIdx}
                type="button"
                onClick={() =>
                  setModalSel({ type: 'submenu', catIdx: cIdx, subIdx: sIdx })
                }
                className="w-full flex items-center gap-2 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left transition-colors border-none outline-none cursor-pointer group"
              >
                <span className="text-[10px] font-bold text-slate-400 shrink-0 w-5">
                  #{sIdx + 1}
                </span>
                <span className="text-sm font-semibold text-slate-700 flex-1 truncate">
                  {sub.label}
                </span>
                <span className="text-[11px] text-slate-400 truncate max-w-[160px] hidden sm:block">
                  {sub.href}
                </span>
                <span className="text-[10px] text-[#2563eb] font-bold opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  Sửa →
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
