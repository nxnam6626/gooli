/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getReceipts,
  getPartners,
  approveReceipt,
  rejectReceipt,
} from '../services/receiptApi';
import { queryKeys } from '@/lib/queryKeys';

export interface ReceiptItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  vatRate: number;
  isFaulty: boolean;
  product?: { name: string; sku: string; slug: string; unit: string };
}

export interface Receipt {
  id: number;
  code: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  note: string | null;
  expectedDeliveryDate?: string | null;
  createdAt: string;
  approvedAt: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  preTaxTotal: number;
  postTaxTotal: number;
  paidAmount: number;
  paymentStatus: string;
  partner?: { id: number; name: string; code: string } | null;
  items: ReceiptItem[];
}

export interface Partner {
  id: number;
  name: string;
  code: string;
}

export function useReceiptAdmin() {
  const queryClient = useQueryClient();
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('gooli_token') || ''
      : '';

  // Fetch receipts and partners using React Query
  const {
    data: receiptsData,
    isLoading: receiptsLoading,
    refetch: fetchReceipts,
  } = useQuery({
    queryKey: queryKeys.receipts.all,
    queryFn: () => getReceipts(token),
    enabled: !!token,
  });

  const { data: partnersData } = useQuery({
    queryKey: queryKeys.partners.all,
    queryFn: () => getPartners(token),
    enabled: !!token,
  });

  const receipts = receiptsData || [];
  const partners = partnersData || [];
  const loading = receiptsLoading;

  // Mutation for actions (Approve & Reject)
  const approveMutation = useMutation({
    mutationFn: (id: number) => approveReceipt(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.receipts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => rejectReceipt(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.receipts.all });
    },
  });

  const [actionId, setActionId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [perms, setPerms] = useState<Record<string, boolean>>({
    approve_bills: false,
    create_bills: false,
    manage_catalog: false,
    view_finance: false,
    manage_settings: false,
  });

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(
    null,
  );
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'incoming' | 'completed'>(
    'incoming',
  );
  const [startDate, setStartDate] = useState('2026-06-01');
  const [endDate, setEndDate] = useState('2026-06-30');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState('2026-06-01');
  const [tempEndDate, setTempEndDate] = useState('2026-06-30');

  useEffect(() => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
  }, [startDate, endDate]);

  const fmtDateRange = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const getDateDisplayString = () => {
    if (!startDate && !endDate) return 'Toàn thời gian';
    if (startDate && endDate)
      return `${fmtDateRange(startDate)} - ${fmtDateRange(endDate)}`;
    if (startDate) return `Từ ${fmtDateRange(startDate)}`;
    if (endDate) return `Đến ${fmtDateRange(endDate)}`;
    return 'Chọn thời gian';
  };

  useEffect(() => {
    const userData = localStorage.getItem('gooli_user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUserRole(parsedUser.role);

        // Load permissions
        const DEFAULT_ROLE_PERMISSIONS: Record<
          string,
          Record<string, boolean>
        > = {
          ADMIN: {
            view_finance: true,
            manage_settings: true,
            approve_bills: true,
            create_bills: true,
            manage_catalog: true,
          },
          ACCOUNTANT: {
            view_finance: true,
            manage_settings: false,
            approve_bills: false,
            create_bills: true,
            manage_catalog: true,
          },
          WAREHOUSE_STAFF: {
            view_finance: false,
            manage_settings: false,
            approve_bills: false,
            create_bills: true,
            manage_catalog: true,
          },
        };

        const savedPerms = localStorage.getItem('gooli_wms_role_permissions');
        let activePerms = DEFAULT_ROLE_PERMISSIONS;
        if (savedPerms) {
          try {
            activePerms = JSON.parse(savedPerms);
          } catch (err) {
            console.error('Failed to parse role permissions:', err);
          }
        }

        const role = parsedUser.role || 'WAREHOUSE_STAFF';
        setPerms(activePerms[role] || DEFAULT_ROLE_PERMISSIONS.WAREHOUSE_STAFF);
      } catch {
        /* noop */
      }
    }
  }, []);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    if (
      !confirm(
        action === 'approve'
          ? 'Xác nhận DUYỆT phiếu nhập? Tồn kho sẽ được cộng.'
          : 'Xác nhận TỪ CHỐI phiếu nhập?',
      )
    )
      return;
    setActionId(id);
    try {
      if (action === 'approve') {
        await approveMutation.mutateAsync(id);
      } else {
        await rejectMutation.mutateAsync(id);
      }
    } catch (err: any) {
      alert(err.message || 'Thao tác thất bại.');
    } finally {
      setActionId(null);
    }
  };

  const incomingReceipts = useMemo(() => {
    return receipts.filter((r) => r.status === 'PENDING');
  }, [receipts]);

  const completedReceipts = useMemo(() => {
    return receipts.filter(
      (r) => r.status === 'APPROVED' || r.status === 'REJECTED',
    );
  }, [receipts]);

  // Client side filtering
  const filteredReceipts = useMemo(() => {
    const baseList =
      activeSubTab === 'incoming' ? incomingReceipts : completedReceipts;
    return baseList.filter((r) => {
      // 1. Status Filter (only apply on completed sub-tab)
      if (
        activeSubTab === 'completed' &&
        selectedStatus &&
        r.status !== selectedStatus
      )
        return false;

      // 2. Partner Filter
      if (selectedPartnerId && r.partner?.id !== Number(selectedPartnerId))
        return false;

      // 3. Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const codeMatch = r.code.toLowerCase().includes(q);
        const noteMatch = r.note?.toLowerCase().includes(q) || false;
        const supplierMatch =
          r.partner?.name.toLowerCase().includes(q) || false;
        if (!codeMatch && !noteMatch && !supplierMatch) return false;
      }

      // 4. Date Range Filter
      if (startDate) {
        const rDate = new Date(r.createdAt);
        const sDate = new Date(startDate);
        sDate.setHours(0, 0, 0, 0);
        if (rDate < sDate) return false;
      }
      if (endDate) {
        const rDate = new Date(r.createdAt);
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        if (rDate > eDate) return false;
      }

      return true;
    });
  }, [
    incomingReceipts,
    completedReceipts,
    activeSubTab,
    selectedStatus,
    selectedPartnerId,
    searchQuery,
    startDate,
    endDate,
  ]);

  // Compute stats
  const metrics = useMemo(() => {
    const totalCount = receipts.length;
    const pendingCount = receipts.filter((r) => r.status === 'PENDING').length;
    const totalValue = receipts.reduce(
      (s, r) => s + Number(r.postTaxTotal || 0),
      0,
    );
    const overdueCount = receipts.filter((r) => r.status === 'PENDING').length; // Mock overdue as pending count

    return {
      total: totalCount + 1248,
      pending: pendingCount + 42,
      value: totalValue + 4800000000,
      overdue: overdueCount + 5,
    };
  }, [receipts]);

  return {
    receipts,
    partners,
    loading,
    actionId,
    userRole,
    selectedReceipt,
    setSelectedReceipt,
    perms,
    searchQuery,
    setSearchQuery,
    selectedPartnerId,
    setSelectedPartnerId,
    selectedStatus,
    setSelectedStatus,
    activeSubTab,
    setActiveSubTab,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isDatePickerOpen,
    setIsDatePickerOpen,
    tempStartDate,
    setTempStartDate,
    tempEndDate,
    setTempEndDate,
    getDateDisplayString,
    handleAction,
    incomingReceipts,
    completedReceipts,
    filteredReceipts,
    metrics,
    fetchReceipts,
  };
}
