/* eslint-disable @typescript-eslint/no-explicit-any */
import { Product, Category, ProductsResponse } from '@/types';

const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api/v1';

const getHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE}/categories`, {
      next: { revalidate: 3600, tags: ['categories'] },
    });
    if (!res.ok) throw new Error('Không thể tải danh mục.');
    return res.json();
  } catch (error) {
    console.error('getCategories error:', error);
    return [];
  }
}

export async function getProducts(query: {
  categoryId?: number;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ProductsResponse> {
  try {
    const params = new URLSearchParams();
    if (query.categoryId)
      params.append('categoryId', query.categoryId.toString());
    if (query.search) params.append('search', query.search);
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());

    const url = `${API_BASE}/products?${params.toString()}`;
    const res = await fetch(url, {
      next: { revalidate: 3600, tags: ['products'] },
    });
    if (!res.ok) throw new Error('Không thể tải danh sách sản phẩm.');
    return res.json();
  } catch (error) {
    console.error('getProducts error:', error);
    return { total: 0, page: 1, limit: 10, totalPages: 0, items: [] };
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE}/products/slug/${slug}`, {
      next: { revalidate: 3600, tags: [`product-${slug}`] },
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Không thể tải chi tiết sản phẩm.');
    }
    return res.json();
  } catch (error) {
    console.error(`getProductBySlug (${slug}) error:`, error);
    return null;
  }
}

export async function createProduct(
  data: Omit<
    Product,
    'id' | 'slug' | 'createdAt' | 'updatedAt' | 'isActive' | 'stock'
  >,
  token: string,
): Promise<Product> {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Thêm sản phẩm thất bại.');
  }
  return res.json();
}

export async function updateProduct(
  id: number,
  data: Partial<Product>,
  token: string,
): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PATCH',
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Cập nhật sản phẩm thất bại.');
  }
  return res.json();
}

export async function deleteProduct(id: number, token: string): Promise<any> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Xóa sản phẩm thất bại.');
  }
  return res.json();
}

export async function createCategory(
  name: string,
  token: string,
): Promise<Category> {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Thêm nhóm hàng thất bại.');
  }
  return res.json();
}
