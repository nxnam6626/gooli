import React from 'react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
}

interface ProductFiltersProps {
  sortBy: string;
  parsedCategoryId?: number;
  displayCategories: Category[];
}

export default function ProductFilters({ sortBy, parsedCategoryId, displayCategories }: ProductFiltersProps) {
  const getSortUrl = (sortValue: string) => {
    if (parsedCategoryId) return `/san-pham?categoryId=${parsedCategoryId}&sortBy=${sortValue}`;
    return `/san-pham?sortBy=${sortValue}`;
  };

  const getCategoryUrl = (catId?: number) => {
    if (catId) {
      return sortBy !== 'newest' ? `/san-pham?categoryId=${catId}&sortBy=${sortBy}` : `/san-pham?categoryId=${catId}`;
    }
    return sortBy !== 'newest' ? `/san-pham?sortBy=${sortBy}` : `/san-pham`;
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "24px", borderBottom: "1px solid #e5e5e5", paddingBottom: "16px", marginBottom: "40px", fontSize: "14px" }}>
      
      {/* Left Side: Sorting */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <span style={{ color: "#737373", fontWeight: 500 }}>Sắp xếp theo</span>
        <div style={{ display: "flex", gap: "24px", fontWeight: 600, overflowX: "auto", whiteSpace: "nowrap" }}>
          <Link href={getSortUrl('newest')} style={{ color: sortBy === 'newest' ? "#E46C0A" : "inherit", position: "relative" }} className={sortBy === 'newest' ? '' : 'text-neutral-600 hover:text-neutral-900 transition-colors'}>
            Mới nhất
            {sortBy === 'newest' && <span style={{ position: "absolute", bottom: "-17px", left: 0, width: "100%", height: "2px", backgroundColor: "#E46C0A" }}></span>}
          </Link>
          <Link href={getSortUrl('bestseller')} style={{ color: sortBy === 'bestseller' ? "#E46C0A" : "inherit", position: "relative" }} className={sortBy === 'bestseller' ? '' : 'text-neutral-600 hover:text-neutral-900 transition-colors'}>
            Bán chạy
            {sortBy === 'bestseller' && <span style={{ position: "absolute", bottom: "-17px", left: 0, width: "100%", height: "2px", backgroundColor: "#E46C0A" }}></span>}
          </Link>
          <Link href={getSortUrl('featured')} style={{ color: sortBy === 'featured' ? "#E46C0A" : "inherit", position: "relative" }} className={sortBy === 'featured' ? '' : 'text-neutral-600 hover:text-neutral-900 transition-colors'}>
            Nổi bật
            {sortBy === 'featured' && <span style={{ position: "absolute", bottom: "-17px", left: 0, width: "100%", height: "2px", backgroundColor: "#E46C0A" }}></span>}
          </Link>
          <Link href={getSortUrl('price_asc')} style={{ color: sortBy === 'price_asc' ? "#E46C0A" : "inherit", position: "relative" }} className={sortBy === 'price_asc' ? '' : 'text-neutral-600 hover:text-neutral-900 transition-colors'}>
            Giá thấp
            {sortBy === 'price_asc' && <span style={{ position: "absolute", bottom: "-17px", left: 0, width: "100%", height: "2px", backgroundColor: "#E46C0A" }}></span>}
          </Link>
          <Link href={getSortUrl('price_desc')} style={{ color: sortBy === 'price_desc' ? "#E46C0A" : "inherit", position: "relative" }} className={sortBy === 'price_desc' ? 'flex items-center gap-1' : 'text-neutral-600 hover:text-neutral-900 transition-colors flex items-center gap-1'}>
            Giá cao
            <svg className="w-3.5 h-3.5 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/></svg>
            {sortBy === 'price_desc' && <span style={{ position: "absolute", bottom: "-17px", left: 0, width: "100%", height: "2px", backgroundColor: "#E46C0A" }}></span>}
          </Link>
        </div>
      </div>

      {/* Right Side: Categories Filter */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ color: "#737373", fontWeight: 500 }}>Danh mục:</span>
        <div className="relative group z-20">
          <button className="flex items-center gap-2 font-semibold text-neutral-900 py-1 hover:text-[#E46C0A] transition-colors cursor-pointer">
            {parsedCategoryId ? displayCategories.find(c => c.id === parsedCategoryId)?.name : "Tất cả sản phẩm"}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
          </button>
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-neutral-100 shadow-xl rounded-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <div className="flex flex-col py-2">
              <Link 
                href={getCategoryUrl()} 
                className={`px-5 py-2.5 transition-colors ${!parsedCategoryId ? 'bg-neutral-50 text-[#E46C0A] font-bold' : 'text-neutral-700 hover:bg-neutral-50 hover:text-[#E46C0A]'}`}
              >
                Tất cả sản phẩm
              </Link>
              {displayCategories.map(cat => (
                <Link 
                  key={cat.id} 
                  href={getCategoryUrl(cat.id)} 
                  className={`px-5 py-2.5 transition-colors ${parsedCategoryId === cat.id ? 'bg-neutral-50 text-[#E46C0A] font-bold' : 'text-neutral-700 hover:bg-neutral-50 hover:text-[#E46C0A]'}`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
