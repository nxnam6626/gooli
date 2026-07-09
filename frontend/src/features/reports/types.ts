// Shared types for all report tabs

export interface Partner {
  id: number;
  code: string;
  name: string;
  type: 'CUSTOMER' | 'SUPPLIER';
  totalDebt?: number;
  phone?: string | null;
  address?: string | null;
}

export interface ReportProduct {
  id: number;
  sku: string;
  name: string;
  unit: string;
  stock: number;
  faultyQty?: number;
  pricePerM2?: number;
}

export interface LedgerEntry {
  id: number;
  code: string;
  date: Date;
  type: 'RECEIPT_BILL' | 'EXPORT_BILL' | 'SLIP' | 'RETURN_DOC';
  description: string;
  debit: number;
  credit: number;
}

export interface ReportSlip {
  id: number;
  code: string;
  createdAt: string;
  type: 'RECEIPT' | 'PAYMENT';
  note: string | null;
  amount: number | string;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | string;
  partnerId?: number | null;
}

export interface ReportReceipt {
  id: number;
  code: string;
  invoiceNumber: string | null;
  createdAt: string;
  postTaxTotal: number | string;
  partnerId?: number | null;
}

export interface ReportExport {
  id: number;
  code: string;
  createdAt: string;
  postTaxTotal: number | string;
  partnerId?: number | null;
}

export interface LedgerReport {
  entries: LedgerEntry[];
  openingBalance: number;
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
}

export interface FinancialReport {
  receiptsTotal: number;
  paymentsTotal: number;
  netFlow: number;
  bankTransferTotal: number;
  cashTotal: number;
}

export interface MonthlyFlow {
  month: string;
  receipts: number;
  payments: number;
}

export interface StockStats {
  standard: number;
  faulty: number;
  total: number;
  rate: string;
}
