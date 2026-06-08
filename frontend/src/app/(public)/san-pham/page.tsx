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
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const parsedCategoryId = params?.categoryId ? Number(params.categoryId) : undefined;

  const [categories, productsData] = await Promise.all([
    getCategories(),
    getProducts({
      categoryId: parsedCategoryId,
      limit: 100,
    }),
  ]);

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
              <Link href="#" style={{ color: "#E46C0A", position: "relative" }}>
                Mới nhất
                <span style={{ position: "absolute", bottom: "-17px", left: 0, width: "100%", height: "2px", backgroundColor: "#E46C0A" }}></span>
              </Link>
              <Link href="#" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                Bán chạy
              </Link>
              <Link href="#" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                Nổi bật
              </Link>
              <Link href="#" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                Giá thấp
              </Link>
              <Link href="#" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                Giá cao
              </Link>
            </div>
          </div>

          {/* Right Side: Categories Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ color: "#737373", fontWeight: 500 }}>Danh mục:</span>
            <div className="relative group z-20">
              <button className="flex items-center gap-2 font-semibold text-neutral-900 py-1 hover:text-[#E46C0A] transition-colors cursor-pointer">
                {parsedCategoryId ? categories.find(c => c.id === parsedCategoryId)?.name : "Tất cả sản phẩm"}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-neutral-100 shadow-xl rounded-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="flex flex-col py-2">
                  <Link 
                    href="/san-pham" 
                    className={`px-5 py-2.5 transition-colors ${!parsedCategoryId ? 'bg-neutral-50 text-[#E46C0A] font-bold' : 'text-neutral-700 hover:bg-neutral-50 hover:text-[#E46C0A]'}`}
                  >
                    Tất cả sản phẩm
                  </Link>
                  {categories.map(cat => (
                    <Link 
                      key={cat.id} 
                      href={`/san-pham?categoryId=${cat.id}`} 
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: "32px" }}>
          {Array.from({ length: Math.max(8, productsData.items.length) }).map((_, index) => {
            const prod = productsData.items[index % productsData.items.length] || {
              id: `mock-${index}`,
              slug: '#',
              name: `Sản phẩm mẫu ${index + 1}`,
              imageUrl: '/luxury_interior.png',
              category: { name: 'Mẫu' }
            };
            const uniqueId = `${prod.id}-${index}`;
            const tag = prod.category?.name || "Vật tư";
            
            return (
              <Link
                key={uniqueId}
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
                    <span className="text-xs text-neutral-500 font-medium tracking-wide">Quy cách: 3000mm</span>
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
      </div>
    </main>
  );
}
