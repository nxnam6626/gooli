import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExports, approveExport, rejectExport } from "../services/exportApi";
import { queryKeys } from "@/lib/queryKeys";

export interface ExportItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  vatRate: number;
  product?: { name: string; sku: string; slug: string; unit: string };
}

export interface Export {
  id: number;
  code: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  note: string | null;
  createdAt: string;
  approvedAt: string | null;
  preTaxTotal: number;
  postTaxTotal: number;
  paidAmount: number;
  paymentStatus: string;
  items: ExportItem[];
  partner?: { id: number; name: string; code: string } | null;
}

export function useExportAdmin() {
  const queryClient = useQueryClient();
  const token = typeof window !== "undefined" ? localStorage.getItem("gooli_token") || "" : "";

  // Fetch exports using React Query
  const { data: exportsData, isLoading: exportsLoading, refetch: fetchExports } = useQuery({
    queryKey: queryKeys.exports.all,
    queryFn: () => getExports(token),
    enabled: !!token,
  });

  const exports = exportsData || [];
  const loading = exportsLoading;

  // Mutation for actions (Approve & Reject)
  const approveMutation = useMutation({
    mutationFn: (id: number) => approveExport(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exports.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => rejectExport(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exports.all });
    },
  });

  const [actionId, setActionId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  
  const [userRole] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    const userData = localStorage.getItem("gooli_user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        return parsedUser.role || "";
      } catch { /* noop */ }
    }
    return "";
  });

  const [perms] = useState<Record<string, boolean>>(() => {
    const DEFAULT_ROLE_PERMISSIONS: Record<string, Record<string, boolean>> = {
      ADMIN: { view_finance: true, manage_settings: true, approve_bills: true, create_bills: true, manage_catalog: true },
      ACCOUNTANT: { view_finance: true, manage_settings: false, approve_bills: false, create_bills: true, manage_catalog: true },
      WAREHOUSE_STAFF: { view_finance: false, manage_settings: false, approve_bills: false, create_bills: true, manage_catalog: true }
    };
    if (typeof window === "undefined") return DEFAULT_ROLE_PERMISSIONS.WAREHOUSE_STAFF;
    const userData = localStorage.getItem("gooli_user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        const savedPerms = localStorage.getItem("gooli_wms_role_permissions");
        let activePerms = DEFAULT_ROLE_PERMISSIONS;
        if (savedPerms) {
          try {
            activePerms = JSON.parse(savedPerms);
          } catch (err) {
            console.error("Failed to parse role permissions:", err);
          }
        }
        const role = parsedUser.role || "WAREHOUSE_STAFF";
        return activePerms[role] || DEFAULT_ROLE_PERMISSIONS.WAREHOUSE_STAFF;
      } catch { /* noop */ }
    }
    return DEFAULT_ROLE_PERMISSIONS.WAREHOUSE_STAFF;
  });

  const handleAction = async (id: number, action: "approve" | "reject") => {
    if (!confirm(action === "approve" ? "Xác nhận DUYỆT phiếu xuất này? Tồn kho sẽ bị trừ." : "Xác nhận TỪ CHỐI phiếu xuất?")) return;
    setActionId(id);
    try {
      if (action === "approve") {
        await approveMutation.mutateAsync(id);
      } else {
        await rejectMutation.mutateAsync(id);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Thao tác thất bại.";
      alert(errMsg);
    } finally {
      setActionId(null);
    }
  };

  const totalQty = (items: ExportItem[]) =>
    items.reduce((s, i) => s + i.quantity, 0);

  return {
    exports,
    loading,
    actionId,
    userRole,
    expanded,
    setExpanded,
    perms,
    fetchExports,
    handleAction,
    totalQty
  };
}
