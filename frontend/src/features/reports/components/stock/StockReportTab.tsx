import React from 'react';
import StockReportMetrics from './StockReportMetrics';
import StockLowWarning from './StockLowWarning';
import StockReportTable from './StockReportTable';
import type { ReportProduct, StockStats } from '../../types';

interface Props {
  products: ReportProduct[];
  totalStockValue: number;
  lowStockProducts: ReportProduct[];
  stockStats: StockStats;
}

export default function StockReportTab({ products, totalStockValue, lowStockProducts, stockStats }: Props) {
  return (
    <div className="space-y-6">
      <StockReportMetrics totalStockValue={totalStockValue} stockStats={stockStats} />
      <StockLowWarning products={lowStockProducts} />
      <StockReportTable products={products} />
    </div>
  );
}
