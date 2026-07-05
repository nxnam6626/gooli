import { useState, useEffect, useCallback } from "react";
import { getExports, approveExport, rejectExport } from "../services/exportApi";

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
  const [exports, setExports] = useState<Export[]>([]);
  const [loading, setLoading] = useState(true);
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

  const fetchExports = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("gooli_token") || "";
      const data = await getExports(token);
      setExports(data);
    } catch (err) {
      console.error("Error fetching exports:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchExports();
    });
  }, [fetchExports]);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    if (!confirm(action === "approve" ? "Xác nhận DUYỆT phiếu xuất này? Tồn kho sẽ bị trừ." : "Xác nhận TỪ CHỐI phiếu xuất?")) return;
    setActionId(id);
    try {
      const token = localStorage.getItem("gooli_token") || "";
      if (action === "approve") {
        await approveExport(id, token);
      } else {
        await rejectExport(id, token);
      }
      await fetchExports();
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
