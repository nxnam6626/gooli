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

export async function deleteSlip(id: number, token: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}/slips/${id}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Xóa phiếu thu/chi thất bại.');
  }
  return res.json();
}

export async function getDebtSummary(token: string): Promise<{ totalReceivable: number; totalPayable: number }> {
  const res = await fetch(`${API_BASE}/finance/debt-summary`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error('Không thể tải tổng hợp công nợ.');
  return res.json();
}

export interface LedgerEntry {
  id: string;
  date: string;
  type: 'RECEIPT_BILL' | 'EXPORT_BILL' | 'SLIP';
  code: string;
  description: string;
  increase: number;
  decrease: number;
  balance: number;
}

export interface PartnerLedgerRes {
  partner: Partner;
  ledger: LedgerEntry[];
}

export async function getPartnerLedger(token: string, partnerId: number): Promise<PartnerLedgerRes> {
  const res = await fetch(`${API_BASE}/finance/ledger/${partnerId}`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error('Không thể tải sổ chi tiết công nợ đối tác.');
  return res.json();
}

export interface CashbookItem {
  id: number;
  code: string;
  type: 'RECEIPT' | 'PAYMENT';
  amount: number;
  paymentMethod: string;
  createdAt: string;
  note: string | null;
  partner: { id: number; name: string; code: string } | null;
  balance: number;
}

export interface CashbookRes {
  openingBalance: number;
  closingBalance: number;
  items: CashbookItem[];
}

export async function getCashbook(
  token: string,
  query: { from?: string; to?: string; method?: string },
): Promise<CashbookRes> {
  const params = new URLSearchParams();
  if (query.from) params.append('from', query.from);
  if (query.to) params.append('to', query.to);
  if (query.method) params.append('method', query.method);

  const res = await fetch(`${API_BASE}/finance/cashbook?${params.toString()}`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error('Không thể tải sổ quỹ.');
  return res.json();
}

export interface PnlSummary {
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}

export interface PnlCategory {
  id: number;
  name: string;
  revenue: number;
  cost: number;
  profit: number;
}

export interface PnlRes {
  summary: PnlSummary;
  categories: PnlCategory[];
}

export async function getProfitAndLoss(
  token: string,
  query: { from?: string; to?: string },
): Promise<PnlRes> {
  const params = new URLSearchParams();
  if (query.from) params.append('from', query.from);
  if (query.to) params.append('to', query.to);

  const res = await fetch(`${API_BASE}/finance/pnl?${params.toString()}`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error('Không thể tải báo cáo lãi/lỗ.');
  return res.json();
}
