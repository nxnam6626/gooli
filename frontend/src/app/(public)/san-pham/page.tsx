import Link from 'next/link';
import Image from 'next/image';
import { getCategories, getProducts } from '@/services/api';

interface PageProps {
  searchParams: Promise<{
    categoryId?: string;
    search?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const { categoryId, search } = await searchParams;

  const parsedCategoryId = categoryId ? Number(categoryId) : undefined;

  const [categories, productsData] = await Promise.all([
    getCategories(),
    getProducts({
      categoryId: parsedCategoryId,
      search: search || undefined,
      limit: 100,
    }),
  ]);

  return (
    <main className="flex-1 bg-neutral-50 py-12 dark:bg-neutral-950">
        <div className="container-gooli flex flex-col gap-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">Danh mục</span>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-neutral-900 dark:text-white mt-1">
              Sản phẩm Gooli
            </h1>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800" style={{ borderRadius: 'var(--radius-sm)' }}>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/san-pham"
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${
                  !parsedCategoryId
                    ? 'bg-brand-gold text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                }`}
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                Tất cả
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/san-pham?categoryId=${cat.id}`}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${
                    parsedCategoryId === cat.id
                      ? 'bg-brand-gold text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                  }`}
                  style={{ borderRadius: 'var(--radius-sm)' }}
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            <form action="/san-pham" method="GET" className="flex w-full md:w-auto gap-2">
              {parsedCategoryId && <input type="hidden" name="categoryId" value={parsedCategoryId} />}
              <input
                type="text"
                name="search"
                defaultValue={search || ''}
                placeholder="Tìm kiếm sản phẩm..."
                className="flex-1 md:w-64 h-10 px-3 text-sm bg-neutral-50 border border-neutral-300 focus:outline-none focus:border-brand-gold dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                style={{ borderRadius: 'var(--radius-sm)' }}
              />
              <button
                type="submit"
                className="h-10 px-5 bg-brand-dark text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                Tìm
              </button>
            </form>
          </div>

          {productsData.items.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-neutral-300 text-neutral-500">
              Không tìm thấy sản phẩm nào phù hợp.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {productsData.items.map((prod) => (
                <Link
                  key={prod.id}
                  href={`/san-pham/${prod.slug}`}
                  className="group flex flex-col bg-white border border-neutral-200 hover:border-brand-gold transition-all duration-300 overflow-hidden dark:bg-neutral-900 dark:border-neutral-800"
                  style={{ borderRadius: 'var(--radius-sm)' }}
                >
                  <div className="relative aspect-square bg-neutral-100 overflow-hidden dark:bg-neutral-800">
                    <Image
                      src={prod.imageUrl}
                      alt={prod.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-w-768px) 100vw, (max-w-1024px) 50vw, 25vw"
                    />
                  </div>

                  <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        {prod.category?.name || 'Vật tư'}
                      </span>
                      <h3 className="text-base font-bold uppercase tracking-tight text-neutral-900 dark:text-white group-hover:text-brand-gold transition-colors line-clamp-2">
                        {prod.name}
                      </h3>
                    </div>

                    <div className="flex justify-between items-end">
                      <span className="text-lg font-black text-brand-gold">
                        {Number(prod.pricePerM2).toLocaleString('vi-VN')} đ/m²
                      </span>
                      {prod.stock > 0 ? (
                        <span className="badge-in-stock">Còn hàng</span>
                      ) : (
                        <span className="badge-out-of-stock">Hết hàng</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
  );
}
