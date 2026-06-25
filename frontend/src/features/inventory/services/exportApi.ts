/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Export } from "../hooks/useExportAdmin";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001") + "/api/v1";

const getHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export async function getExports(token: string): Promise<Export[]> {
  const res = await fetch(`${API_BASE}/exports`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Không thể tải danh sách phiếu xuất kho");
  return res.json();
}

export async function getPartners(token: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/partners?limit=100&type=CUSTOMER`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Không thể tải danh sách khách hàng");
  const data = await res.json();
  return Array.isArray(data) ? data : data.items || [];
}

export async function getProducts(token: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/products?limit=1000`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Không thể tải danh sách sản phẩm");
  const data = await res.json();
  return data.items || [];
}

export async function createExport(payload: any, token: string): Promise<any> {
  const res = await fetch(`${API_BASE}/exports`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Lỗi khi tạo phiếu xuất");
  }
  return res.json();
}

export async function approveExport(id: number, token: string): Promise<any> {
  const res = await fetch(`${API_BASE}/exports/${id}/approve`, {
    method: "POST",
    headers: getHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Duyệt phiếu xuất thất bại");
  }
  return res.json();
}

export async function rejectExport(id: number, token: string): Promise<any> {
  const res = await fetch(`${API_BASE}/exports/${id}/reject`, {
    method: "POST",
    headers: getHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Từ chối phiếu xuất thất bại");
  }
  return res.json();
}
