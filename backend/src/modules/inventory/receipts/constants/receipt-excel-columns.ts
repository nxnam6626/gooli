export const RECEIPT_EXCEL_COLUMNS = {
  PARTNER_CODE: 'Mã đối tác',
  INVOICE_NUMBER: 'Số hóa đơn',
  INVOICE_DATE: 'Ngày hóa đơn',
  SKU: 'Mã SKU',
  SUPPLIER_PRODUCT_NAME: 'Tên sản phẩm NCC',
  QUANTITY: 'Số lượng',
  PRICE: 'Đơn giá nhập',
  VAT_RATE: 'Thuế suất VAT',
  NOTE: 'Ghi chú',
} as const;

export const REQUIRED_EXCEL_COLUMNS = [
  RECEIPT_EXCEL_COLUMNS.PARTNER_CODE,
  RECEIPT_EXCEL_COLUMNS.SKU,
  RECEIPT_EXCEL_COLUMNS.QUANTITY,
];
