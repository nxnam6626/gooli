/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  generateSkuSuggestion,
} from '../services/productApi';
import { Product, Category } from '@/types';


export function useProductAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(
    undefined,
  );

  // Modal forms state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    categoryId: 0,
    sku: '',
    name: '',
    pricePerM2: 0,
    imageUrl:
      'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    description: '',
    unit: 'Cái',
    thickness: '',
    width: '',
    length: '',
  });


  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('gooli_token') || ''
      : '';

  // Load products and categories
  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        getProducts({
          page,
          limit: 10,
          search: urlSearch || undefined,
          categoryId: selectedCategory,
        }),
        getCategories(),
      ]);

      setProducts(prodRes.items);
      setTotal(prodRes.total);
      setTotalPages(prodRes.totalPages);
      setCategories(catRes);

      if (catRes.length > 0 && formData.categoryId === 0) {
        setFormData((prev) => ({ ...prev, categoryId: catRes[0].id }));
      }

      setLoading(false);
    } catch (error) {
      console.error('Lỗi tải dữ liệu hàng hóa:', error);
      setLoading(false);
    }
  };


  useEffect(() => {
    loadData();
  }, [page, selectedCategory, urlSearch]);

  /** Sinh và điền SKU tự động dựa theo categoryId + name hiện tại của form */
  const refreshSku = useCallback(
    async (categoryId: number, name: string = '') => {
      if (!categoryId || !token) return;
      try {
        const sku = await generateSkuSuggestion(categoryId, name, token);
        setFormData((prev) => ({ ...prev, sku }));
      } catch {
        // Nếu không lấy được SKU tự động thì để trống, user tự nhập
      }
    },
    [token],
  );

  const handleCreateOpen = async () => {
    const defaultCategoryId = categories.length > 0 ? categories[0].id : 0;
    setEditId(null);
    setFormData({
      categoryId: defaultCategoryId,
      sku: '',
      name: '',
      pricePerM2: 0,
      imageUrl:
        'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
      description: '',
      unit: 'Cái',
      thickness: '',
      width: '',
      length: '',
    });
    setFormError(null);
    setShowModal(true);
    // Tự động sinh SKU ngay khi mở form
    await refreshSku(defaultCategoryId, '');
  };

  const handleEditOpen = (product: Product) => {
    setEditId(product.id);
    setFormData({
      categoryId: product.categoryId,
      sku: product.sku,
      name: product.name,
      pricePerM2: product.pricePerM2,
      imageUrl: product.imageUrl,
      description: product.description || '',
      unit: product.unit,
      thickness: product.thickness?.toString() || '',
      width: product.width?.toString() || '',
      length: product.length?.toString() || '',
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleAddCategoryInline = async () => {
    const name = window.prompt('Nhập tên nhóm hàng mới:');
    if (!name || !name.trim()) return;

    try {
      setSubmitting(true);
      const res = await createCategory(name.trim(), token);
      const catRes = await getCategories();
      setCategories(catRes);
      setFormData((prev) => ({ ...prev, categoryId: res.id }));
      alert(`Đã thêm nhóm hàng "${name}" thành công!`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Thêm nhóm hàng thất bại.';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    if (formData.categoryId === 0) {
      setFormError('Vui lòng chọn danh mục sản phẩm.');
      setSubmitting(false);
      return;
    }

    if (!formData.sku.trim()) {
      setFormError('Vui lòng nhập mã SKU.');
      setSubmitting(false);
      return;
    }

    const dataToSend = {
      categoryId: Number(formData.categoryId),
      sku: formData.sku.trim(),
      name: formData.name.trim(),
      pricePerM2: Number(formData.pricePerM2),
      imageUrl: formData.imageUrl.trim(),
      description: formData.description.trim() || null,
      unit: formData.unit,
      thickness: formData.thickness ? Number(formData.thickness) : null,
      width: formData.width ? Number(formData.width) : null,
      length: formData.length ? Number(formData.length) : null,
    };

    try {
      if (editId) {
        await updateProduct(editId, dataToSend, token);
      } else {
        await createProduct(dataToSend, token);
      }
      setShowModal(false);
      loadData();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Lưu sản phẩm thất bại.';
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) {
      return;
    }

    try {
      await deleteProduct(id, token);
      loadData();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Xóa sản phẩm thất bại.';
      alert(message);
    }
  };

  const showThickness = ['tấm', 'm²', 'cây'].includes(
    formData.unit.toLowerCase(),
  );
  const showWidth = ['tấm'].includes(formData.unit.toLowerCase());
  const showLength = ['tấm', 'cây'].includes(formData.unit.toLowerCase());

  return {
    products,
    categories,
    total,
    page,
    setPage,
    totalPages,
    loading,
    showModal,
    setShowModal,
    editId,
    formData,
    setFormData,
    formError,
    submitting,
    handleCreateOpen,
    handleEditOpen,
    handleAddCategoryInline,
    handleFormSubmit,
    handleDelete,
    showThickness,
    showWidth,
    showLength,
    selectedCategory,
    setSelectedCategory,
    refreshSku,
  };
}
