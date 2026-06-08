import Link from 'next/link';
import Image from 'next/image';
import { getProducts, getCategories } from '@/services/api';
import PageHero from '@/components/common/PageHero';

export const metadata = {
  title: 'Sản phẩm',
};

interface PageProps {
  searchParams: Promise<{
    categoryId?: string;
    sortBy?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const parsedCategoryId = params?.categoryId ? Number(params.categoryId) : undefined;
  const sortBy = params?.sortBy || 'newest';

  const [categories, productsData] = await Promise.all([
    getCategories(),
    getProducts({
      categoryId: parsedCategoryId,
      limit: 100,
    }),
  ]);

  const displayCategories = categories.length > 0 ? categories : [
    { id: 1, name: 'Trần nhôm' },
    { id: 2, name: 'Lam sóng' },
    { id: 3, name: 'Vật tư phụ' },
  ];

  const mockProducts = [
    { id: 1, slug: 'sp-1', name: 'Trần nhôm U-Shaped 100x30', category: { id: 1, name: 'Trần nhôm' }, imageUrl: '/luxury_interior.png', length: 3000, price: 350000, sold: 120, featured: true },
    { id: 2, slug: 'sp-2', name: 'Trần nhôm Clip-in 600x600', category: { id: 1, name: 'Trần nhôm' }, imageUrl: '/luxury_interior.png', length: 600, price: 280000, sold: 450, featured: false },
    { id: 3, slug: 'sp-3', name: 'Lam sóng ngoài trời HH-Wood', category: { id: 2, name: 'Lam sóng' }, imageUrl: '/luxury_interior.png', length: 2900, price: 450000, sold: 200, featured: true },
    { id: 4, slug: 'sp-4', name: 'Lam sóng ngoài trời HH-Brown', category: { id: 2, name: 'Lam sóng' }, imageUrl: '/luxury_interior.png', length: 2900, price: 430000, sold: 150, featured: false },
    { id: 5, slug: 'sp-5', name: 'Xương cá lắp trần nhôm', category: { id: 3, name: 'Vật tư phụ' }, imageUrl: '/luxury_interior.png', length: 1000, price: 45000, sold: 1200, featured: false },
    { id: 6, slug: 'sp-6', name: 'Ty ren M6', category: { id: 3, name: 'Vật tư phụ' }, imageUrl: '/luxury_interior.png', length: 2000, price: 15000, sold: 2500, featured: false },
    { id: 7, slug: 'sp-7', name: 'Trần nhôm Caro Cell', category: { id: 1, name: 'Trần nhôm' }, imageUrl: '/luxury_interior.png', length: 2000, price: 320000, sold: 80, featured: true },
    { id: 8, slug: 'sp-8', name: 'Nẹp nhôm V25', category: { id: 3, name: 'Vật tư phụ' }, imageUrl: '/luxury_interior.png', length: 3000, price: 80000, sold: 500, featured: false },
  ];

  let displayProducts: any[] = productsData.items.length > 0 ? productsData.items : mockProducts;
  
  // Apply local mock filter if needed
  if (productsData.items.length === 0 && parsedCategoryId) {
    displayProducts = mockProducts.filter(p => p.category.id === parsedCategoryId);
  }

  // Apply sorting
  displayProducts = [...displayProducts].sort((a: any, b: any) => {
    if (sortBy === 'price_asc') {
      return (a.pricePerM2 || a.price || 0) - (b.pricePerM2 || b.price || 0);
    } else if (sortBy === 'price_desc') {
      return (b.pricePerM2 || b.price || 0) - (a.pricePerM2 || a.price || 0);
    } else if (sortBy === 'bestseller') {
      return (b.sold || 0) - (a.sold || 0);
    } else if (sortBy === 'featured') {
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    } else {
      // newest
      return (b.id || 0) - (a.id || 0);
    }
  });

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
    <main className="flex-1 bg-white min-h-screen">
      <PageHero title="Sản phẩm" breadcrumbText="Sản phẩm" />

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 24px" }}>
        {/* Sorting Bar */}
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

        {/* Product Grid */}
        {displayProducts.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-neutral-300 text-neutral-500 rounded-sm">
            Không tìm thấy sản phẩm nào trong danh mục này.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: "32px" }}>
            {displayProducts.map((prod) => {
              const tag = prod.category?.name || "Vật tư";
              
              return (
                <Link
                  key={prod.id}
                  href={`/san-pham/${prod.slug}`}
                  className="group flex flex-col cursor-pointer transition-all duration-300"
                >
                  {/* Image Wrapper */}
                  <div className="relative aspect-square bg-neutral-100 overflow-hidden rounded-sm" style={{ marginBottom: "16px" }}>
                    <Image
                      src={prod.imageUrl}
                      alt={prod.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    
                    {/* Top Right Tag */}
                    <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm text-[#333] text-[11px] font-bold px-3 py-1 rounded-full shadow-sm text-center leading-tight">
                      <span className="block">Ngoài trời</span>
                      <span className="block">{tag}</span>
                    </div>

                    {/* Bottom Left Logo Watermark */}
                    <div className="absolute bottom-3 left-3 w-10 h-10 bg-[#E46C0A] rounded flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
                        <path d="M12 3L2 12h3v8h14v-8h3L12 3zm-1 15h-2v-4h2v4zm4 0h-2v-4h2v4z"/>
                      </svg>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col px-1" style={{ gap: "8px" }}>
                    <h3 className="text-[15px] font-bold text-neutral-900 group-hover:text-[#E46C0A] transition-colors leading-snug line-clamp-2">
                      {prod.name}
                    </h3>
                    <div className="flex items-center justify-between" style={{ marginTop: "4px" }}>
                      <span className="text-xs text-neutral-500 font-medium tracking-wide">Quy cách: {prod.length || 3000}mm</span>
                      <span className="text-xs font-bold text-[#E46C0A] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1 -translate-x-2 group-hover:translate-x-0">
                        Nhận báo giá
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
