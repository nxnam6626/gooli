import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getProducts, getCategories, getReceipts, getExports } from '@/services/api';
import { queryKeys } from '@/lib/queryKeys';

export function useStockDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const urlSearch = searchParams.get('search') || '';
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    setSearchQuery(urlSearch);
  }, [urlSearch]);

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('gooli_token') || '' : '';

  const { data: productsData, isLoading: productsLoading, refetch: refetchProducts } = useQuery({
    queryKey: queryKeys.products.list({ page, limit: 10, search: urlSearch || undefined, categoryId: selectedCategory }),
    queryFn: () => getProducts({ page, limit: 10, search: urlSearch || undefined, categoryId: selectedCategory }),
    refetchInterval: 10000,
  });

  const { data: categoriesData, isLoading: categoriesLoading, refetch: refetchCategories } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: getCategories,
  });

  const { data: allProductsRes } = useQuery({
    queryKey: ['all-products-for-stats'],
    queryFn: () => getProducts({ limit: 1000 }),
  });

  const { data: receiptsData, refetch: refetchReceipts } = useQuery({
    queryKey: ['all-receipts-for-stats'],
    queryFn: () => getReceipts(token),
    enabled: !!token,
  });

  const { data: exportsData, refetch: refetchExports } = useQuery({
    queryKey: ['all-exports-for-stats'],
    queryFn: () => getExports(token),
    enabled: !!token,
  });

  const products = productsData?.items || [];
  const total = productsData?.total || 0;
  const totalPages = productsData?.totalPages || 1;
  const categories = categoriesData || [];
  const allProducts = allProductsRes?.items || [];
  const receipts = receiptsData || [];
  const exports = exportsData || [];
  const loading = productsLoading || categoriesLoading;

  const handleRefresh = () => {
    refetchProducts();
    refetchCategories();
    refetchReceipts();
    refetchExports();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    else params.delete('search');
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const filteredProducts = useMemo(() =>
    products.filter((p) => {
      if (statusFilter === 'IN_STOCK') return (p.stock || 0) > 5;
      if (statusFilter === 'LOW_STOCK') return (p.stock || 0) > 0 && (p.stock || 0) <= 5;
      if (statusFilter === 'OUT_OF_STOCK') return (p.stock || 0) === 0;
      return true;
    }),
  [products, statusFilter]);

  const lowStockCount = useMemo(
    () => allProducts.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length,
    [allProducts],
  );

  const totalStockValue = useMemo(
    () => allProducts.reduce((sum, p) => sum + Number(p.stock || 0) * Number(p.pricePerM2 || 0), 0),
    [allProducts],
  );

  const pendingReceiptsCount = useMemo(
    () => receipts.filter((r) => r.status === 'PENDING').length,
    [receipts],
  );

  const pendingExportsCount = useMemo(
    () => exports.filter((e) => e.status === 'PENDING').length,
    [exports],
  );

  const recentReceipts = useMemo(
    () => [...receipts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 2),
    [receipts],
  );

  const recentExports = useMemo(
    () => [...exports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 2),
    [exports],
  );

  return {
    // Pagination
    page, setPage, total, totalPages,
    // Filter
    searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, statusFilter, setStatusFilter,
    // Data
    categories, filteredProducts, loading,
    // Stats
    lowStockCount, totalStockValue, pendingReceiptsCount, pendingExportsCount,
    recentReceipts, recentExports,
    // Actions
    handleRefresh, handleSearchSubmit,
  };
}
