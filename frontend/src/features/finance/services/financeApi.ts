import type { Slip, Partner, Receipt, Export } from '../hooks/useFinanceAdmin';

const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api/v1';

const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export async function getSlips(token: string): Promise<Slip[]> {
  const res = await fetch(`${API_BASE}/slips`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error('Không thể tải danh sách phiếu thu/chi.');
  return res.json();
}

export async function createSlip(
  data: unknown,
  token: string,
): Promise<unknown> {
  const res = await fetch(`${API_BASE}/slips`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Tạo phiếu thu/chi thất bại.');
  }
  return res.json();
}

export async function getPartners(token: string): Promise<Partner[]> {
  const res = await fetch(`${API_BASE}/partners?limit=100`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error('Không thể tải danh sách đối tác.');
  const data = await res.json();
  return data.items || [];
}

export async function getReceipts(token: string): Promise<Receipt[]> {
  const res = await fetch(`${API_BASE}/receipts`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error('Không thể tải danh sách phiếu nhập kho.');
  return res.json();
}

export async function getExports(token: string): Promise<Export[]> {
  const res = await fetch(`${API_BASE}/exports`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error('Không thể tải danh sách phiếu xuất kho.');
  return res.json();
}
