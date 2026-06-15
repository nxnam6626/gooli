export interface Category {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
}

export interface Product {
  id: number;
  categoryId: number;
  sku: string;
  name: string;
  slug: string;
  pricePerM2: number;
  imageUrl: string;
  description: string | null;
  thickness: number | null;
  width: number | null;
  length: number | null;
  unit: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stock: number;
  faultyQty?: number;
  category?: { name: string; slug: string };
}

export interface ProductsResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  items: Product[];
}

export interface ReceiptItem {
  id: number;
  receiptId: number;
  productId: number;
  quantity: number;
  price: number;
  isFaulty?: boolean;
  product?: { name: string; slug: string };
}

export interface Receipt {
  id: number;
  code: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdById: number;
  approvedById: number | null;
  createdAt: string;
  approvedAt: string | null;
  note: string | null;
  expectedDeliveryDate?: string;
  partner?: { id: number; name: string; code: string } | null;
  items: ReceiptItem[];
}

export interface ExportItem {
  id: number;
  exportId: number;
  productId: number;
  quantity: number;
  isFaulty?: boolean;
  product?: { name: string; slug: string };
}

export interface Export {
  id: number;
  code: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdById: number;
  approvedById: number | null;
  createdAt: string;
  approvedAt: string | null;
  note: string | null;
  items: ExportItem[];
}

export interface WarehouseLocation {
  id: number;
  code: string;
  name: string;
  zone: string;
  row?: string | null;
  shelf?: string | null;
  position?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface LocationsResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  items: WarehouseLocation[];
}

export interface PartnerGroup {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  policy?: string | null;
  createdAt: string;
  _count?: {
    partners: number;
  };
}

export interface Partner {
  id: number;
  code: string;
  name: string;
  type: 'SUPPLIER' | 'CUSTOMER';
  partnerGroupId?: number | null;
  totalDebt?: number;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  taxCode?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  partnerGroup?: PartnerGroup | null;
  discountRate?: number | null;
  note?: string | null;
}

export interface PartnersResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  items: Partner[];
}

export interface Project {
  id: number;
  name: string;
  slug: string;
  imageUrl: string;
  description: string | null;
  location: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
