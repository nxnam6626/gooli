import { useState, useEffect, useCallback } from 'react';
import type { Partner, PartnerGroup } from '../../../types';
import {
  getPartners,
  createPartner,
  updatePartner,
  deletePartner,
  getPartnerGroups,
  createPartnerGroup,
} from '../services/partnerApi';

export function usePartnerAdmin() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [groups, setGroups] = useState<PartnerGroup[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ACTIVE');

  // Modal forms state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'CUSTOMER' as 'SUPPLIER' | 'CUSTOMER',
    phone: '',
    email: '',
    address: '',
    taxCode: '',
    partnerGroupId: '' as string | number,
    discountRate: '' as string | number,
    note: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [token] = useState(() =>
    typeof window !== 'undefined'
      ? localStorage.getItem('gooli_token') || ''
      : '',
  );

  const loadGroups = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getPartnerGroups(token);
      setGroups(data);
    } catch (error) {
      console.error('Lỗi tải nhóm đối tác:', error);
    }
  }, [token]);

  const loadPartners = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getPartners(token, {
        page,
        limit: 10,
        search: search || undefined,
        partnerGroupId: selectedGroupId ? Number(selectedGroupId) : undefined,
        status: selectedStatus || undefined,
      });

      setPartners(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (error) {
      console.error('Lỗi tải đối tác:', error);
    } finally {
      setLoading(false);
    }
  }, [token, page, search, selectedGroupId, selectedStatus]);

  useEffect(() => {
    if (token) {
      Promise.resolve().then(() => {
        loadGroups();
      });
    }
  }, [token, loadGroups]);

  useEffect(() => {
    if (token) {
      Promise.resolve().then(() => {
        loadPartners();
      });
    }
  }, [token, page, selectedGroupId, selectedStatus, loadPartners]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadPartners();
  };

  const handleCreateOpen = () => {
    setEditId(null);
    setFormData({
      code: '',
      name: '',
      type: 'CUSTOMER',
      phone: '',
      email: '',
      address: '',
      taxCode: '',
      partnerGroupId: '',
      discountRate: '',
      note: '',
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleEditOpen = (partner: Partner) => {
    setEditId(partner.id);
    setFormData({
      code: partner.code,
      name: partner.name,
      type: partner.type,
      phone: partner.phone || '',
      email: partner.email || '',
      address: partner.address || '',
      taxCode: partner.taxCode || '',
      partnerGroupId: partner.partnerGroupId || '',
      discountRate: partner.discountRate || '',
      note: partner.note || '',
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleAddGroupInline = async () => {
    if (!token) return;
    const name = window.prompt('Nhập tên hãng sản xuất / nhóm đối tác mới:');
    if (!name || !name.trim()) return;

    const code = window.prompt(
      'Nhập mã nhóm đối tác (ID viết hoa):',
      'NCC-' + name.trim().substring(0, 3).toUpperCase(),
    );
    if (!code || !code.trim()) return;

    try {
      setSubmitting(true);
      const res = await createPartnerGroup(token, {
        code: code.trim().toUpperCase(),
        name: name.trim(),
      });
      const data = await getPartnerGroups(token);
      setGroups(data);
      setFormData((prev) => ({ ...prev, partnerGroupId: res.id }));
      alert(`Đã thêm nhóm đối tác "${name}" thành công!`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Thêm nhóm đối tác thất bại.';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setFormError(null);
    setSubmitting(true);

    if (!formData.code.trim()) {
      setFormError('Vui lòng nhập mã đối tác.');
      setSubmitting(false);
      return;
    }

    if (!formData.name.trim()) {
      setFormError('Vui lòng nhập tên đối tác/doanh nghiệp.');
      setSubmitting(false);
      return;
    }

    let inferredType = formData.type;
    if (formData.partnerGroupId) {
      const selectedGrp = groups.find(
        (g) => g.id === Number(formData.partnerGroupId),
      );
      if (selectedGrp) {
        if (
          selectedGrp.code.toUpperCase().includes('NCC') ||
          selectedGrp.name.toLowerCase().includes('cung cấp')
        ) {
          inferredType = 'SUPPLIER';
        } else {
          inferredType = 'CUSTOMER';
        }
      }
    }

    const dataToSend = {
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      type: inferredType,
      phone: formData.phone.trim() || null,
      email: formData.email.trim() || null,
      address: formData.address.trim() || null,
      taxCode: formData.taxCode.trim() || null,
      partnerGroupId: formData.partnerGroupId
        ? Number(formData.partnerGroupId)
        : null,
      discountRate: formData.discountRate
        ? Number(formData.discountRate)
        : null,
      note: formData.note.trim() || null,
    };

    try {
      if (editId) {
        await updatePartner(editId, dataToSend, token);
      } else {
        await createPartner(dataToSend, token);
      }
      setShowModal(false);
      loadPartners();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Lưu đối tác thất bại.';
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!token) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa đối tác "${name}"?`)) {
      return;
    }

    try {
      await deletePartner(id, token);
      loadPartners();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Xóa đối tác thất bại.';
      alert(message);
    }
  };

  const formatCurrency = (val: number | undefined) => {
    if (val === undefined || val === null) return '0 đ';
    return new Intl.NumberFormat('vi-VN').format(val) + ' đ';
  };

  return {
    partners,
    groups,
    total,
    page,
    setPage,
    totalPages,
    loading,
    search,
    setSearch,
    selectedGroupId,
    setSelectedGroupId,
    selectedStatus,
    setSelectedStatus,
    showModal,
    setShowModal,
    editId,
    formData,
    setFormData,
    formError,
    submitting,
    handleSearchSubmit,
    handleCreateOpen,
    handleEditOpen,
    handleAddGroupInline,
    handleFormSubmit,
    handleDelete,
    formatCurrency,
    loadPartners,
  };
}
