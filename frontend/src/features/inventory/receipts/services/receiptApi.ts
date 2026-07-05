/* eslint-disable @typescript-eslint/no-explicit-any */
import { Receipt } from '../hooks/useReceiptAdmin';

const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api/v1';

const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export async function getReceipts(token: string): Promise<Receipt[]> {
  const res = await fetch(`${API_BASE}/receipts`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error('Không thể tải danh sách phiếu nhập kho');
  return res.json();
}

export async function getPartners(token: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/partners?limit=100&type=SUPPLIER`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error('Không thể tải danh sách nhà cung cấp');
  const data = await res.json();
  return Array.isArray(data) ? data : data.items || [];
}

export async function getProducts(token: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/products?limit=1000`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error('Không thể tải danh sách sản phẩm');
  const data = await res.json();
  return data.items || [];
}

export async function createReceipt(payload: any, token: string): Promise<any> {
  const res = await fetch(`${API_BASE}/receipts`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Lỗi khi tạo phiếu nhập');
  }
  return res.json();
}

export async function approveReceipt(id: number, token: string): Promise<any> {
  const res = await fetch(`${API_BASE}/receipts/${id}/approve`, {
    method: 'POST',
    headers: getHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Duyệt phiếu nhập thất bại');
  }
  return res.json();
}

export async function rejectReceipt(id: number, token: string): Promise<any> {
  const res = await fetch(`${API_BASE}/receipts/${id}/reject`, {
    method: 'POST',
    headers: getHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Từ chối phiếu nhập thất bại');
  }
  return res.json();
}
