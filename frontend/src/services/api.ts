import { 
  Category, 
  Product, 
  ProductsResponse, 
  Receipt, 
  Export, 
  LocationsResponse, 
  WarehouseLocation, 
  PartnersResponse, 
  Partner, 
  Project 
} from '../types';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api/v1';

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE}/categories`, {
      next: { revalidate: 3600, tags: ['categories'] }
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
    if (query.categoryId) params.append('categoryId', query.categoryId.toString());
    if (query.search) params.append('search', query.search);
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());

    const url = `${API_BASE}/products?${params.toString()}`;
    const res = await fetch(url, {
      next: { revalidate: 3600, tags: ['products'] }
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
      next: { revalidate: 3600, tags: [`product-${slug}`] }
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

export async function adminLogin(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json() as { message?: string };
    throw new Error(err.message || 'Đăng nhập thất bại.');
  }
  return res.json();
}

export async function getReceipts(token: string): Promise<Receipt[]> {
  const res = await fetch(`${API_BASE}/receipts`, {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Không thể tải danh sách phiếu nhập.');
  return res.json();
}

export async function getReceiptById(id: number, token: string): Promise<Receipt> {
  const res = await fetch(`${API_BASE}/receipts/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Không thể tải chi tiết phiếu nhập.');
  return res.json();
}

export async function createReceipt(data: { note?: string; items: { productId: number; quantity: number; price: number }[] }, token: string) {
  const res = await fetch(`${API_BASE}/receipts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json() as { message?: string };
    throw new Error(err.message || 'Tạo phiếu nhập thất bại.');
  }
  return res.json();
}

export async function approveReceipt(id: number, token: string) {
  const res = await fetch(`${API_BASE}/receipts/${id}/approve`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const err = await res.json() as { message?: string };
    throw new Error(err.message || 'Duyệt phiếu nhập thất bại.');
  }
  return res.json();
}

export async function rejectReceipt(id: number, token: string) {
  const res = await fetch(`${API_BASE}/receipts/${id}/reject`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const err = await res.json() as { message?: string };
    throw new Error(err.message || 'Từ chối phiếu nhập thất bại.');
  }
  return res.json();
}

export async function getExports(token: string): Promise<Export[]> {
  const res = await fetch(`${API_BASE}/exports`, {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Không thể tải danh sách phiếu xuất.');
  return res.json();
}

export async function getExportById(id: number, token: string): Promise<Export> {
  const res = await fetch(`${API_BASE}/exports/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Không thể tải chi tiết phiếu xuất.');
  return res.json();
}

export async function createExport(data: { note?: string; items: { productId: number; quantity: number }[] }, token: string) {
  const res = await fetch(`${API_BASE}/exports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json() as { message?: string };
    throw new Error(err.message || 'Tạo phiếu xuất thất bại.');
  }
  return res.json();
}

export async function approveExport(id: number, token: string) {
  const res = await fetch(`${API_BASE}/exports/${id}/approve`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const err = await res.json() as { message?: string };
    throw new Error(err.message || 'Duyệt phiếu xuất thất bại.');
  }
  return res.json();
}

export async function rejectExport(id: number, token: string) {
  const res = await fetch(`${API_BASE}/exports/${id}/reject`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const err = await res.json() as { message?: string };
    throw new Error(err.message || 'Từ chối phiếu xuất thất bại.');
  }
  return res.json();
}

export async function getLocations(
  token: string,
  query?: { search?: string; zone?: string; page?: number; limit?: number }
): Promise<LocationsResponse> {
  try {
    const params = new URLSearchParams();
    if (query?.search) params.append('search', query.search);
    if (query?.zone) params.append('zone', query.zone);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());

    const res = await fetch(`${API_BASE}/locations?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Không thể tải danh sách vị trí kho.');
    return res.json();
  } catch (error) {
    console.error('getLocations error:', error);
    return { total: 0, page: 1, limit: 20, totalPages: 0, items: [] };
  }
}

export async function createLocation(data: Omit<WarehouseLocation, 'id' | 'createdAt' | 'isActive'>, token: string) {
  const res = await fetch(`${API_BASE}/locations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json() as { message?: string };
    throw new Error(err.message || 'Thêm vị trí kho thất bại.');
  }
  return res.json();
}

export async function updateLocation(id: number, data: Partial<WarehouseLocation>, token: string) {
  const res = await fetch(`${API_BASE}/locations/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json() as { message?: string };
    throw new Error(err.message || 'Cập nhật vị trí kho thất bại.');
  }
  return res.json();
}

export async function deleteLocation(id: number, token: string) {
  const res = await fetch(`${API_BASE}/locations/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const err = await res.json() as { message?: string };
    throw new Error(err.message || 'Xóa vị trí kho thất bại.');
  }
  return res.json();
}

export async function getPartners(
  token: string,
  query?: { search?: string; type?: 'SUPPLIER' | 'CUSTOMER'; page?: number; limit?: number }
): Promise<PartnersResponse> {
  try {
    const params = new URLSearchParams();
    if (query?.search) params.append('search', query.search);
    if (query?.type) params.append('type', query.type);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());

    const res = await fetch(`${API_BASE}/partners?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Không thể tải danh sách đối tác.');
    return res.json();
  } catch (error) {
    console.error('getPartners error:', error);
    return { total: 0, page: 1, limit: 10, totalPages: 0, items: [] };
  }
}

export async function createPartner(data: Omit<Partner, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>, token: string) {
  const res = await fetch(`${API_BASE}/partners`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json() as { message?: string };
    throw new Error(err.message || 'Thêm đối tác thất bại.');
  }
  return res.json();
}

export async function updatePartner(id: number, data: Partial<Partner>, token: string) {
  const res = await fetch(`${API_BASE}/partners/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json() as { message?: string };
    throw new Error(err.message || 'Cập nhật đối tác thất bại.');
  }
  return res.json();
}

export async function deletePartner(id: number, token: string) {
  const res = await fetch(`${API_BASE}/partners/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const err = await res.json() as { message?: string };
    throw new Error(err.message || 'Xóa đối tác thất bại.');
  }
  return res.json();
}

export async function createProduct(data: Omit<Product, 'id' | 'slug' | 'createdAt' | 'updatedAt' | 'isActive' | 'stock'>, token: string) {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json() as { message?: string };
    throw new Error(err.message || 'Thêm sản phẩm thất bại.');
  }
  return res.json();
}

export async function updateProduct(id: number, data: Partial<Product>, token: string) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json() as { message?: string };
    throw new Error(err.message || 'Cập nhật sản phẩm thất bại.');
  }
  return res.json();
}

export async function deleteProduct(id: number, token: string) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const err = await res.json() as { message?: string };
    throw new Error(err.message || 'Xóa sản phẩm thất bại.');
  }
  return res.json();
}

export async function getProjects(): Promise<Project[]> {
  try {
    const res = await fetch(`${API_BASE}/projects`, {
      next: { revalidate: 3600, tags: ['projects'] }
    });
    if (!res.ok) throw new Error('Không thể tải danh sách dự án.');
    return res.json();
  } catch (error) {
    console.error('getProjects error:', error);
    return [];
  }
}

export async function createConsultation(data: { email?: string; phone: string; note?: string }): Promise<unknown> {
  const res = await fetch(`${API_BASE}/consultations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json() as { message?: string };
    throw new Error(err.message || 'Gửi yêu cầu tư vấn thất bại.');
  }
  return res.json();
}
