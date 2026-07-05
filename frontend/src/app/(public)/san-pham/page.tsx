import { getProducts, getCategories } from '@/services/api';
import PageHero from '@/components/common/PageHero';
import { ProductFilters, ProductGrid } from '@/features/products-catalog';
import { Product } from '@/types';

export const metadata = {
  title: 'Sản phẩm',
};

interface PageProps {
  searchParams: Promise<{
    categoryId?: string;
    sortBy?: string;
    search?: string;
  }>;
}

interface DisplayProduct {
  id: number;
  slug: string;
  name: string;
  category?: { id?: number; name: string; slug?: string };
  imageUrl: string;
  length?: number | null;
  price?: number;
  pricePerM2?: number;
  sold?: number;
  featured?: boolean;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const parsedCategoryId = params?.categoryId
    ? Number(params.categoryId)
    : undefined;
  const sortBy = params?.sortBy || 'newest';
  const searchQuery = params?.search || '';

  const [categories, productsData] = await Promise.all([
    getCategories(),
    getProducts({
      categoryId: parsedCategoryId,
      search: searchQuery,
      limit: 100,
    }),
  ]);

  const displayCategories =
    categories.length > 0
      ? categories
      : [
          { id: 1, name: 'Trần nhôm' },
          { id: 2, name: 'Lam sóng' },
          { id: 3, name: 'Vật tư phụ' },
        ];

  const mockProducts: DisplayProduct[] = [
    {
      id: 1,
      slug: 'sp-1',
      name: 'Trần nhôm U-Shaped 100x30',
      category: { id: 1, name: 'Trần nhôm' },
      imageUrl: '/luxury_interior.png',
      length: 3000,
      price: 350000,
      sold: 120,
      featured: true,
    },
    {
      id: 2,
      slug: 'sp-2',
      name: 'Trần nhôm Clip-in 600x600',
      category: { id: 1, name: 'Trần nhôm' },
      imageUrl: '/luxury_interior.png',
      length: 600,
      price: 280000,
      sold: 450,
      featured: false,
    },
    {
      id: 3,
      slug: 'sp-3',
      name: 'Lam sóng ngoài trời HH-Wood',
      category: { id: 2, name: 'Lam sóng' },
      imageUrl: '/luxury_interior.png',
      length: 2900,
      price: 450000,
      sold: 200,
      featured: true,
    },
    {
      id: 4,
      slug: 'sp-4',
      name: 'Lam sóng ngoài trời HH-Brown',
      category: { id: 2, name: 'Lam sóng' },
      imageUrl: '/luxury_interior.png',
      length: 2900,
      price: 430000,
      sold: 150,
      featured: false,
    },
    {
      id: 5,
      slug: 'sp-5',
      name: 'Xương cá lắp trần nhôm',
      category: { id: 3, name: 'Vật tư phụ' },
      imageUrl: '/luxury_interior.png',
      length: 1000,
      price: 45000,
      sold: 1200,
      featured: false,
    },
    {
      id: 6,
      slug: 'sp-6',
      name: 'Ty ren M6',
      category: { id: 3, name: 'Vật tư phụ' },
      imageUrl: '/luxury_interior.png',
      length: 2000,
      price: 15000,
      sold: 2500,
      featured: false,
    },
    {
      id: 7,
      slug: 'sp-7',
      name: 'Trần nhôm Caro Cell',
      category: { id: 1, name: 'Trần nhôm' },
      imageUrl: '/luxury_interior.png',
      length: 2000,
      price: 320000,
      sold: 80,
      featured: true,
    },
    {
      id: 8,
      slug: 'sp-8',
      name: 'Nẹp nhôm V25',
      category: { id: 3, name: 'Vật tư phụ' },
      imageUrl: '/luxury_interior.png',
      length: 3000,
      price: 80000,
      sold: 500,
      featured: false,
    },
  ];

  let displayProducts: DisplayProduct[] =
    productsData.items.length > 0
      ? (productsData.items as DisplayProduct[])
      : mockProducts;

  // Apply local mock filter if needed
  if (productsData.items.length === 0) {
    if (parsedCategoryId) {
      displayProducts = mockProducts.filter(
        (p) => p.category?.id === parsedCategoryId,
      );
    }
    if (searchQuery) {
      displayProducts = displayProducts.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
  }

  // Apply sorting
  displayProducts = [...displayProducts].sort(
    (a: DisplayProduct, b: DisplayProduct) => {
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
    },
  );

  return (
    <main className="flex-1 bg-white min-h-screen">
      <PageHero title="Sản phẩm" breadcrumbText="Sản phẩm" />

      <div
        style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' }}
      >
        <ProductFilters
          sortBy={sortBy}
          parsedCategoryId={parsedCategoryId}
          displayCategories={displayCategories}
        />

        <ProductGrid products={displayProducts as Product[]} />
      </div>
    </main>
  );
}
