export interface ParsedReceiptItem {
  partnerCode: string;
  invoiceNumber: string;
  invoiceDate: Date | null;
  sku: string;
  supplierProductName: string;
  quantity: number;
  price: number;
  vatRate: number;
  note: string;
  rowIndex: number;
  productId?: number;
  partnerId?: number;
}

export interface RowError {
  row: number;
  item: string;
  error: string;
}

export interface ExcelColumnIndex {
  partnerCode: number;
  invoiceNo: number;
  invoiceDate: number;
  sku: number;
  supplierProdName: number;
  qty: number;
  price: number;
  vat: number;
  note: number;
}
