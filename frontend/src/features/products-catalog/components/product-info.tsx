import React from 'react';

import { Product } from '@/types';

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  return (
    <div className="custom-col-mid flex flex-col">
      <h1
        className="text-3xl font-bold text-neutral-900 leading-tight tracking-tight"
        style={{ marginBottom: '16px' }}
      >
        {product.name}
      </h1>

      <div
        className="text-sm text-neutral-600 flex items-center"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '24px',
        }}
      >
        SKU:{' '}
        <span className="text-neutral-900 font-bold tracking-wide">
          {product.sku || 'N/A'}
        </span>
      </div>

      {/* Specs List */}
      <div className="border border-neutral-200 rounded-md overflow-hidden bg-white shadow-sm">
        <ul
          className="text-sm text-neutral-800"
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <li
            style={{
              display: 'flex',
              padding: '12px 16px',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <span className="font-bold w-1/3" style={{ color: '#1a1a1a' }}>
              Kích thước:
            </span>
            <span className="w-2/3">
              {product.width} x {product.length} x {product.thickness}mm
            </span>
          </li>
          <li
            style={{
              display: 'flex',
              padding: '12px 16px',
              backgroundColor: '#fafafa',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <span className="font-bold w-1/3" style={{ color: '#1a1a1a' }}>
              Nhập khẩu:
            </span>
            <span className="w-2/3">Đài Loan</span>
          </li>
          <li style={{ display: 'flex', padding: '12px 16px' }}>
            <span className="font-bold w-1/3" style={{ color: '#1a1a1a' }}>
              Khuyến nghị:
            </span>
            <span className="w-2/3">Sử dụng trên 10 năm</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
