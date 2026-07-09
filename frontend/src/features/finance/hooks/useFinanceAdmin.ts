import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getSlips,
  createSlip,
  getPartners,
  getReceipts,
  getExports,
  deleteSlip,
} from '../services/financeApi';

export interface Partner {
  id: number;
  code: string;
  name: string;
  type: 'CUSTOMER' | 'SUPPLIER';
  totalDebt: number;
}

export interface Receipt {
  id: number;
  code: string;
  invoiceNumber: string;
  postTaxTotal: number;
  paidAmount: number;
  paymentStatus: string;
  partnerId: number;
  createdAt: string;
}

export interface Export {
  id: number;
  code: string;
  postTaxTotal: number;
  paidAmount: number;
  paymentStatus: string;
  partnerId: number;
  createdAt: string;
}

export interface Slip {
  id: number;
  code: string;
  type: 'RECEIPT' | 'PAYMENT';
  amount: number;
  paymentMethod: string;
  note?: string;
  createdAt: string;
  partner: Partner;
  receipt?: Receipt;
  export?: Export;
  createdByUser?: {
    name: string;
    email: string;
  };
}

export function useFinanceAdmin() {
  const [slips, setSlips] = useState<Slip[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [exports, setExports] = useState<Export[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string>('STAFF');

  // Delete slip modal states
  const [deleteSlipInfo, setDeleteSlipInfo] = useState<{ id: number; code: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingSlip, setDeletingSlip] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchPartner, setSearchPartner] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [formType, setFormType] = useState<'RECEIPT' | 'PAYMENT'>('RECEIPT');
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | ''>('');
  const [linkType, setLinkType] = useState<'FIFO' | 'DIRECT'>('FIFO');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | ''>('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [note, setNote] = useState('');

  const [token] = useState(() =>
    typeof window !== 'undefined'
      ? localStorage.getItem('gooli_token') || ''
      : '',
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const u = localStorage.getItem('gooli_user');
        if (u) {
          const userObj = JSON.parse(u);
          setCurrentUserRole(userObj.role || 'STAFF');
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [slipsData, partnersData, receiptsData, exportsData] =
        await Promise.all([
          getSlips(token),
          getPartners(token),
          getReceipts(token),
          getExports(token),
        ]);
      setSlips(slipsData);
      setPartners(partnersData || []);
      setReceipts(receiptsData || []);
      setExports(exportsData || []);
    } catch (error) {
      console.error('Lỗi tải dữ liệu thu/chi:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      Promise.resolve().then(() => {
        loadData();
      });
    }
  }, [token, loadData]);

  // Filter partners by type depending on slip type chosen in form
  const filteredPartnersForForm = useMemo(() => {
    return partners.filter((p) =>
      formType === 'RECEIPT' ? p.type === 'CUSTOMER' : p.type === 'SUPPLIER',
    );
  }, [partners, formType]);

  // Filter invoices for direct linking
  const availableInvoices = useMemo(() => {
    if (!selectedPartnerId) return [];
    if (formType === 'RECEIPT') {
      return exports.filter(
        (e) => e.partnerId === selectedPartnerId && e.paymentStatus !== 'PAID',
      );
    } else {
      return receipts.filter(
        (r) => r.partnerId === selectedPartnerId && r.paymentStatus !== 'PAID',
      );
    }
  }, [selectedPartnerId, formType, receipts, exports]);

  // Compute remaining debt of selected invoice
  const selectedInvoiceDebt = useMemo(() => {
    if (!selectedInvoiceId) return 0;
    if (formType === 'RECEIPT') {
      const exp = exports.find((e) => e.id === selectedInvoiceId);
      return exp ? Number(exp.postTaxTotal) - Number(exp.paidAmount) : 0;
    } else {
      const rec = receipts.find((r) => r.id === selectedInvoiceId);
      return rec ? Number(rec.postTaxTotal) - Number(rec.paidAmount) : 0;
    }
  }, [selectedInvoiceId, formType, receipts, exports]);

  // Handle invoice selection change
  useEffect(() => {
    Promise.resolve().then(() => {
      setSelectedInvoiceId('');
      setAmount('');
    });
  }, [selectedPartnerId, formType, linkType]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setErrorMsg('');
    setSubmitting(true);

    if (!selectedPartnerId) {
      setErrorMsg('Vui lòng chọn đối tác.');
      setSubmitting(false);
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setErrorMsg('Số tiền phải lớn hơn 0.');
      setSubmitting(false);
      return;
    }

    if (linkType === 'DIRECT' && !selectedInvoiceId) {
      setErrorMsg('Vui lòng chọn hóa đơn cần cấn trừ.');
      setSubmitting(false);
      return;
    }

    if (linkType === 'DIRECT' && Number(amount) > selectedInvoiceDebt) {
      setErrorMsg(
        `Số tiền cấn trừ vượt quá dư nợ còn lại của hóa đơn (${selectedInvoiceDebt.toLocaleString(
          'vi-VN',
        )} đ).`,
      );
      setSubmitting(false);
      return;
    }

    const payload: {
      type: 'RECEIPT' | 'PAYMENT';
      partnerId: number;
      amount: number;
      paymentMethod: string;
      note?: string;
      exportId?: number;
      receiptId?: number;
    } = {
      type: formType,
      partnerId: Number(selectedPartnerId),
      amount: Number(amount),
      paymentMethod,
      note: note.trim() || undefined,
    };

    if (linkType === 'DIRECT') {
      if (formType === 'RECEIPT') {
        payload.exportId = Number(selectedInvoiceId);
      } else {
        payload.receiptId = Number(selectedInvoiceId);
      }
    }

    try {
      await createSlip(payload, token);
      setShowModal(false);
      // Reset form
      setSelectedPartnerId('');
      setSelectedInvoiceId('');
      setAmount('');
      setNote('');
      // Refresh list
      await loadData();
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : 'Tạo phiếu thu/chi thất bại.';
      setErrorMsg(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSlips = useMemo(() => {
    return slips.filter((slip) => {
      const typeMatch = typeFilter === 'ALL' || slip.type === typeFilter;
      const partnerMatch =
        !searchPartner ||
        (slip.partner?.name || '')
          .toLowerCase()
          .includes(searchPartner.toLowerCase()) ||
        (slip.partner?.code || '')
          .toLowerCase()
          .includes(searchPartner.toLowerCase());
      return typeMatch && partnerMatch;
    });
  }, [slips, typeFilter, searchPartner]);

  const handleDeleteClick = (id: number, code: string) => {
    setDeleteSlipInfo({ id, code });
    setDeleteError(null);
  };

  const confirmDeleteSlip = async () => {
    if (!deleteSlipInfo || !token) return;
    setDeletingSlip(true);
    setDeleteError(null);
    try {
      await deleteSlip(deleteSlipInfo.id, token);
      setDeleteSlipInfo(null);
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Xóa phiếu thu/chi thất bại.';
      setDeleteError(message);
    } finally {
      setDeletingSlip(false);
    }
  };

  return {
    slips,
    partners,
    receipts,
    exports,
    loading,
    currentUserRole,
    typeFilter,
    setTypeFilter,
    searchPartner,
    setSearchPartner,
    showModal,
    setShowModal,
    submitting,
    errorMsg,
    setErrorMsg,
    formType,
    setFormType,
    selectedPartnerId,
    setSelectedPartnerId,
    linkType,
    setLinkType,
    selectedInvoiceId,
    setSelectedInvoiceId,
    amount,
    setAmount,
    paymentMethod,
    setPaymentMethod,
    note,
    setNote,
    filteredPartnersForForm,
    availableInvoices,
    selectedInvoiceDebt,
    filteredSlips,
    handleSubmit,
    loadData,
    deleteSlipInfo,
    setDeleteSlipInfo,
    deleteError,
    deletingSlip,
    handleDeleteClick,
    confirmDeleteSlip,
  };
}
