import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface User {
  name: string;
  email: string;
  role: string;
}

export const DEFAULT_ROLE_PERMISSIONS: Record<string, Record<string, boolean>> = {
  ADMIN: { view_finance: true, manage_settings: true, approve_bills: true, create_bills: true, manage_catalog: true },
  ACCOUNTANT: { view_finance: true, manage_settings: false, approve_bills: false, create_bills: true, manage_catalog: true },
  WAREHOUSE_STAFF: { view_finance: false, manage_settings: false, approve_bills: false, create_bills: true, manage_catalog: true },
};

export function useAdminAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [perms, setPerms] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('gooli_token');
    const userData = localStorage.getItem('gooli_user');

    if (!token || !userData) {
      router.push('/admin/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

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
      setLoading(false);
    } catch (e) {
      localStorage.removeItem('gooli_token');
      localStorage.removeItem('gooli_user');
      router.push('/admin/login');
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('gooli_token');
    localStorage.removeItem('gooli_user');
    document.cookie = 'gooli_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'gooli_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/admin/login');
  };

  const isSlips = pathname === '/admin/slips' || pathname.startsWith('/admin/slips/');
  const isSettings = pathname === '/admin/settings' || pathname.startsWith('/admin/settings/');
  const userRole = user?.role || 'WAREHOUSE_STAFF';

  let hasAccess = true;
  if (isSlips && perms && !perms.view_finance) hasAccess = false;
  if (isSettings && perms && !perms.manage_settings) hasAccess = false;

  return {
    user,
    loading,
    perms,
    pathname,
    router,
    hasAccess,
    userRole,
    handleLogout,
  };
}
