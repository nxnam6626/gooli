import { useState, useEffect, useCallback } from "react";
import type { PartnerGroup } from "../../../types";
import {
  getPartnerGroups,
  createPartnerGroup,
  updatePartnerGroup,
  deletePartnerGroup,
  getPartners,
} from "../services/partnerApi";

export function usePartnerGroupAdmin() {
  const [items, setItems] = useState<PartnerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [totalActivePartners, setTotalActivePartners] = useState(1245); // Default display fallback

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    policy: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [token] = useState(() => 
    typeof window !== "undefined" ? localStorage.getItem("gooli_token") || "" : ""
  );

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getPartnerGroups(token);
      setItems(data);

      // Load partners to calculate active ones
      const partnersRes = await getPartners(token, { limit: 1000, status: "ACTIVE" });
      if (partnersRes && partnersRes.total) {
        setTotalActivePartners(partnersRes.total);
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu nhóm đối tác:", error);
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

  const handleOpenCreate = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      policy: "",
    });
    setEditId(null);
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleOpenEdit = (item: PartnerGroup) => {
    setFormData({
      code: item.code ?? "",
      name: item.name ?? "",
      description: item.description ?? "",
      policy: item.policy ?? "",
    });
    setEditId(item.id ?? null);
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      if (editId) {
        await updatePartnerGroup(token, editId, formData);
      } else {
        await createPartnerGroup(token, formData);
      }
      setShowModal(false);
      loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Có lỗi xảy ra.";
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!confirm("Bạn có chắc chắn muốn xóa nhóm đối tác này?")) return;
    try {
      await deletePartnerGroup(token, id);
      loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Xóa thất bại.";
      alert(message);
    }
  };

  const filteredItems = items.filter((item) => {
    const s = search.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(s)) ||
      (item.code && item.code.toLowerCase().includes(s)) ||
      (item.description && item.description.toLowerCase().includes(s))
    );
  });

  const calculateAverageDiscount = () => {
    let sum = 0;
    let count = 0;
    items.forEach((item) => {
      if (item.policy) {
        const matches = item.policy.match(/CK\s*(\d+)%/i);
        if (matches && matches[1]) {
          sum += parseFloat(matches[1]);
          count++;
        }
      }
    });
    return count > 0 ? `${(sum / count).toFixed(1)}%` : "12.5%";
  };

  return {
    items,
    loading,
    search,
    setSearch,
    totalActivePartners,
    showModal,
    setShowModal,
    editId,
    formData,
    setFormData,
    submitting,
    errorMsg,
    handleOpenCreate,
    handleOpenEdit,
    handleSubmit,
    handleDelete,
    filteredItems,
    calculateAverageDiscount,
    loadData
  };
}
