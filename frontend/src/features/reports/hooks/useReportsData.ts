import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getPartners,
  getSlips,
  getReceipts,
  getExports,
  getProducts,
} from '@/services/api';
import type {
  Partner,
  ReportProduct,
  ReportSlip,
  ReportReceipt,
  ReportExport,
  LedgerEntry,
  LedgerReport,
  FinancialReport,
  MonthlyFlow,
  StockStats,
} from '../types';

export type ActiveTab = 'DEBT' | 'FINANCE' | 'STOCK';

export function useReportsData() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('DEBT');

  const [partners, setPartners] = useState<Partner[]>([]);
  const [slips, setSlips] = useState<ReportSlip[]>([]);
  const [receipts, setReceipts] = useState<ReportReceipt[]>([]);
  const [exports, setExports] = useState<ReportExport[]>([]);
  const [products, setProducts] = useState<ReportProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPartnerId, setSelectedPartnerId] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [partnerSearchQuery, setPartnerSearchQuery] = useState('');

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('gooli_token') || ''
      : '';

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [partnersData, slipsData, receiptsData, exportsData, productsData] =
        await Promise.all([
          getPartners(token, { limit: 100 }),
          getSlips(token),
          getReceipts(token),
          getExports(token),
          getProducts({ limit: 100 }),
        ]);
      setPartners(partnersData.items || []);
      setSlips(slipsData || []);
      setReceipts(receiptsData || []);
      setExports(exportsData || []);
      setProducts(productsData.items || []);
    } catch (error) {
      console.error('Lỗi tải báo cáo:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      Promise.resolve().then(() => loadData());
    }
  }, [token, loadData]);

  const selectedPartnerObj = partners.find((p) => p.id === selectedPartnerId);

  // ─── Debt tab memos ─────────────────────────────────────────────────────────
  const totalReceivables = useMemo(
    () =>
      partners
        .filter((p) => p.type === 'CUSTOMER')
        .reduce((sum, p) => sum + Number(p.totalDebt || 0), 0),
    [partners],
  );

  const totalPayables = useMemo(
    () =>
      partners
        .filter((p) => p.type === 'SUPPLIER')
        .reduce((sum, p) => sum + Number(p.totalDebt || 0), 0),
    [partners],
  );

  const topDebtors = useMemo(
    () =>
      [...partners]
        .filter((p) => p.type === 'CUSTOMER' && Number(p.totalDebt || 0) > 0)
        .sort((a, b) => Number(b.totalDebt || 0) - Number(a.totalDebt || 0))
        .slice(0, 5),
    [partners],
  );

  const topCreditors = useMemo(
    () =>
      [...partners]
        .filter((p) => p.type === 'SUPPLIER' && Number(p.totalDebt || 0) > 0)
        .sort((a, b) => Number(b.totalDebt || 0) - Number(a.totalDebt || 0))
        .slice(0, 5),
    [partners],
  );

  const filteredPartnersList = useMemo(() => {
    const q = partnerSearchQuery.toLowerCase();
    return partners.filter(
      (p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q),
    );
  }, [partners, partnerSearchQuery]);

  const ledgerReport = useMemo((): LedgerReport => {
    if (!selectedPartnerId || !selectedPartnerObj)
      return { entries: [], openingBalance: 0, totalDebit: 0, totalCredit: 0, closingBalance: 0 };

    const isCustomer = selectedPartnerObj.type === 'CUSTOMER';
    const allEntries: LedgerEntry[] = [];

    slips
      .filter((s) => s.partnerId === selectedPartnerId)
      .forEach((s) =>
        allEntries.push({
          id: s.id,
          code: s.code,
          date: new Date(s.createdAt),
          type: 'SLIP',
          description: s.note || (s.type === 'RECEIPT' ? 'Thu tiền công nợ' : 'Chi trả tiền mua hàng'),
          debit: 0,
          credit: Number(s.amount),
        }),
      );

    if (isCustomer) {
      exports
        .filter((e) => e.partnerId === selectedPartnerId)
        .forEach((e) =>
          allEntries.push({
            id: e.id,
            code: e.code,
            date: new Date(e.createdAt),
            type: 'EXPORT_BILL',
            description: `Xuất kho bán hàng ${e.code}`,
            debit: Number(e.postTaxTotal),
            credit: 0,
          }),
        );
    } else {
      receipts
        .filter((r) => r.partnerId === selectedPartnerId)
        .forEach((r) =>
          allEntries.push({
            id: r.id,
            code: r.invoiceNumber || r.code,
            date: new Date(r.createdAt),
            type: 'RECEIPT_BILL',
            description: `Nhập kho từ NCC (Hóa đơn: ${r.invoiceNumber || r.code})`,
            debit: Number(r.postTaxTotal),
            credit: 0,
          }),
        );
    }

    allEntries.sort((a, b) => a.date.getTime() - b.date.getTime());

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    let openingBalance = 0;
    const filteredEntries: LedgerEntry[] = [];
    let rangeDebit = 0;
    let rangeCredit = 0;

    allEntries.forEach((entry) => {
      const t = entry.date.getTime();
      if (start && t < start.getTime()) {
        openingBalance += entry.debit - entry.credit;
      } else if ((!start || t >= start.getTime()) && (!end || t <= end.getTime())) {
        filteredEntries.push(entry);
        rangeDebit += entry.debit;
        rangeCredit += entry.credit;
      }
    });

    return {
      entries: filteredEntries,
      openingBalance,
      totalDebit: rangeDebit,
      totalCredit: rangeCredit,
      closingBalance: openingBalance + rangeDebit - rangeCredit,
    };
  }, [selectedPartnerId, selectedPartnerObj, slips, receipts, exports, startDate, endDate]);

  // ─── Finance tab memos ───────────────────────────────────────────────────────
  const financialReport = useMemo((): FinancialReport => {
    let receiptsTotal = 0, paymentsTotal = 0, bankTransferTotal = 0, cashTotal = 0;
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    slips.forEach((slip) => {
      const t = new Date(slip.createdAt).getTime();
      if (start && t < start.getTime()) return;
      if (end && t > end.getTime()) return;
      const amt = Number(slip.amount);
      if (slip.type === 'RECEIPT') receiptsTotal += amt;
      else paymentsTotal += amt;
      if (slip.paymentMethod === 'BANK_TRANSFER')
        bankTransferTotal += slip.type === 'RECEIPT' ? amt : -amt;
      else if (slip.paymentMethod === 'CASH')
        cashTotal += slip.type === 'RECEIPT' ? amt : -amt;
    });

    return { receiptsTotal, paymentsTotal, netFlow: receiptsTotal - paymentsTotal, bankTransferTotal, cashTotal };
  }, [slips, startDate, endDate]);

  const monthlyFlows = useMemo((): MonthlyFlow[] => {
    const flows: Record<string, MonthlyFlow> = {};
    [...slips]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .forEach((slip) => {
        const date = new Date(slip.createdAt);
        if (isNaN(date.getTime())) return;
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const label = `Tháng ${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
        if (!flows[key]) flows[key] = { month: label, receipts: 0, payments: 0 };
        const amt = Number(slip.amount || 0);
        if (slip.type === 'RECEIPT') flows[key].receipts += amt;
        else flows[key].payments += amt;
      });
    return Object.values(flows).slice(-6);
  }, [slips]);

  const maxMonthValue = useMemo(() => {
    let max = 1_000_000;
    monthlyFlows.forEach((f) => {
      if (f.receipts > max) max = f.receipts;
      if (f.payments > max) max = f.payments;
    });
    return max;
  }, [monthlyFlows]);

  // ─── Stock tab memos ─────────────────────────────────────────────────────────
  const totalStockValue = useMemo(
    () =>
      products.reduce(
        (sum, p) => sum + Number(p.stock || 0) * Number(p.pricePerM2 || 450000),
        0,
      ),
    [products],
  );

  const lowStockProducts = useMemo(
    () => products.filter((p) => Number(p.stock || 0) <= 5),
    [products],
  );

  const stockStats = useMemo((): StockStats => {
    const standard = products.reduce((sum, p) => sum + Number(p.stock || 0), 0);
    const faulty = products.reduce((sum, p) => sum + Number(p.faultyQty || 0), 0);
    const total = standard + faulty || 1;
    return { standard, faulty, total, rate: ((faulty / total) * 100).toFixed(1) };
  }, [products]);

  const handlePrint = () => window.print();

  return {
    // Tab nav
    activeTab, setActiveTab,
    // Loading
    loading,
    // Debt tab
    partners, selectedPartnerId, setSelectedPartnerId,
    selectedPartnerObj,
    startDate, setStartDate, endDate, setEndDate,
    partnerSearchQuery, setPartnerSearchQuery,
    totalReceivables, totalPayables,
    topDebtors, topCreditors,
    filteredPartnersList, ledgerReport,
    handlePrint,
    // Finance tab
    financialReport, monthlyFlows, maxMonthValue,
    // Stock tab
    products, totalStockValue, lowStockProducts, stockStats,
  };
}
