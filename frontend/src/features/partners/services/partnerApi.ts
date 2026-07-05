import type { Partner, PartnerGroup, PartnersResponse } from '../../../types';

const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api/v1';

const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export async function getPartners(
  token: string,
  query?: {
    search?: string;
    type?: 'SUPPLIER' | 'CUSTOMER';
    page?: number;
    limit?: number;
    partnerGroupId?: number;
    status?: string;
  },
): Promise<PartnersResponse> {
  const params = new URLSearchParams();
  if (query?.search) params.append('search', query.search);
  if (query?.type) params.append('type', query.type);
  if (query?.page) params.append('page', query.page.toString());
  if (query?.limit) params.append('limit', query.limit.toString());
  if (query?.partnerGroupId)
    params.append('partnerGroupId', query.partnerGroupId.toString());
  if (query?.status) params.append('status', query.status);

  const res = await fetch(`${API_BASE}/partners?${params.toString()}`, {
    headers: getHeaders(token),
  });

  if (!res.ok) throw new Error('Không thể tải danh sách đối tác.');
  return res.json();
}

export async function createPartner(
  data: Omit<Partner, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>,
  token: string,
): Promise<Partner> {
  const res = await fetch(`${API_BASE}/partners`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Thêm đối tác thất bại.');
  }
  return res.json();
}

export async function updatePartner(
  id: number,
  data: Partial<Partner>,
  token: string,
): Promise<Partner> {
  const res = await fetch(`${API_BASE}/partners/${id}`, {
    method: 'PATCH',
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Cập nhật đối tác thất bại.');
  }
  return res.json();
}

export async function deletePartner(
  id: number,
  token: string,
): Promise<unknown> {
  const res = await fetch(`${API_BASE}/partners/${id}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Xóa đối tác thất bại.');
  }
  return res.json();
}

export async function getPartnerGroups(token: string): Promise<PartnerGroup[]> {
  const res = await fetch(`${API_BASE}/partner-groups`, {
    headers: getHeaders(token),
  });
  if (!res.ok) return [];
  return res.json();
}

export async function createPartnerGroup(
  token: string,
  data: { code: string; name: string },
): Promise<PartnerGroup> {
  const res = await fetch(`${API_BASE}/partner-groups`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const e = await res.json();
    throw new Error(e.message || 'Thêm nhóm đối tác thất bại.');
  }
  return res.json();
}

export async function updatePartnerGroup(
  token: string,
  id: number,
  data: { code?: string; name?: string },
): Promise<PartnerGroup> {
  const res = await fetch(`${API_BASE}/partner-groups/${id}`, {
    method: 'PATCH',
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const e = await res.json();
    throw new Error(e.message || 'Cập nhật nhóm đối tác thất bại.');
  }
  return res.json();
}

export async function deletePartnerGroup(
  token: string,
  id: number,
): Promise<unknown> {
  const res = await fetch(`${API_BASE}/partner-groups/${id}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
  if (!res.ok) {
    const e = await res.json();
    throw new Error(e.message || 'Xóa nhóm đối tác thất bại.');
  }
  return res.json();
}
