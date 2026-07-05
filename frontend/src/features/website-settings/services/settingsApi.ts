/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api/v1';

export class UnauthorizedError extends Error {
  constructor() {
    super('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    this.name = 'UnauthorizedError';
  }
}

export async function getSystemSettings(): Promise<Record<string, any>> {
  const res = await fetch(`${API_BASE}/system-settings`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Không thể tải cấu hình hệ thống.');
  return res.json();
}

export async function updateSystemSettings(
  data: Record<string, any>,
  token: string,
): Promise<Record<string, any>> {
  const res = await fetch(`${API_BASE}/system-settings`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (res.status === 401) throw new UnauthorizedError();
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Cập nhật cấu hình hệ thống thất bại.');
  }
  return res.json();
}

export async function getPublicCategories(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/public-categories`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Không thể tải danh sách danh mục public.');
  return res.json();
}

export async function savePublicCategories(
  categories: any[],
  token: string,
): Promise<any> {
  const res = await fetch(`${API_BASE}/public-categories/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(categories),
  });
  if (res.status === 401) throw new UnauthorizedError();
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Lưu danh sách danh mục thất bại.');
  }
  return res.json();
}
