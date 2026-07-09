import React from 'react';
import Link from 'next/link';
import {
  SquaresFour,
  Warehouse,
  Users,
  ArrowsLeftRight,
  ClipboardText,
  CreditCard,
  ChartBar,
  Gear,
  ShoppingCart,
  Folder,
  Package,
  SignOut,
} from '@phosphor-icons/react';
import { User } from './useAdminAuth';

// Sidebar Sections and Items grouped by subsystems
const SECTIONS = [
  {
    title: '',
    items: [
      {
        href: '/admin',
        label: 'Dashboard',
        icon: <SquaresFour size={20} weight="bold" />,
      },
    ],
  },
  {
    title: 'QUẢN LÝ KHO',
    items: [
      {
        href: '/admin/receipts',
        label: 'Quản lý nhập hàng',
        icon: <ClipboardText size={20} />,
      },
      {
        href: '/admin/exports',
        label: 'Bán hàng (Xuất kho)',
        icon: <ShoppingCart size={20} />,
      },
      {
        href: '/admin/stock',
        label: 'Quản lý tồn kho',
        icon: <Warehouse size={20} />,
      },
    ],
  },
  {
    title: 'QUẢN LÝ DANH MỤC',
    items: [
      {
        href: '/admin/products',
        label: 'Hàng hóa (Sản phẩm)',
        icon: <Package size={20} />,
      },
      {
        href: '/admin/categories',
        label: 'Danh mục sản phẩm',
        icon: <Folder size={20} />,
      },
      { href: '/admin/partners', label: 'Đối tác', icon: <Users size={20} /> },
    ],
  },
  {
    title: 'QUẢN LÝ TÀI CHÍNH',
    items: [
      {
        href: '/admin/slips',
        label: 'Phiếu thu / Phiếu chi',
        icon: <ArrowsLeftRight size={20} />,
      },
      {
        href: '/admin/finance/cashbook',
        label: 'Sổ quỹ dòng tiền',
        icon: <CreditCard size={20} />,
      },
      {
        href: '/admin/reports/pnl',
        label: 'Báo cáo Lãi / Lỗ',
        icon: <ChartBar size={20} />,
      },
    ],
  },
  {
    title: 'CÀI ĐẶT & HỆ THỐNG',
    items: [
      {
        href: '/admin/accounts',
        label: 'Tài khoản & Phân quyền',
        icon: <Gear size={20} />,
      },
    ],
  },
];

interface Props {
  pathname: string;
  perms: Record<string, boolean> | null;
  user: User | null;
  handleLogout: () => void;
}

export default function Sidebar({ pathname, perms, user, handleLogout }: Props) {
  const filteredSections = React.useMemo(() => {
    if (!perms) return SECTIONS;
    return SECTIONS.map((section) => {
      const items = section.items.filter((item) => {
        if (item.href === '/admin/slips' && !perms.view_finance) return false;
        if (item.href === '/admin/accounts' && !perms.manage_settings) return false;
        return true;
      });
      return { ...section, items };
    }).filter((section) => section.items.length > 0);
  }, [perms]);

  return (
    <aside className="w-64 bg-white border-r border-[#e2e8f0] flex flex-col fixed top-0 bottom-0 left-0 z-30">
      {/* LOGO SECTION */}
      <div className="px-6 py-6 border-b border-[#f1f5f9] flex flex-col">
        <Link href="/admin" className="no-underline group">
          <span className="text-[#1e3a8a] text-xl font-extrabold tracking-tight block group-hover:text-blue-700 transition-colors">
            WMS Global
          </span>
          <span className="text-[11px] text-[#94a3b8] font-bold tracking-wider uppercase block mt-0.5">
            Warehouse Management
          </span>
        </Link>
      </div>

      {/* NAVIGATION ITEMS */}
      <nav className="flex-1 px-4 py-5 space-y-4 overflow-y-auto select-none">
        {filteredSections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="space-y-1.5">
            {section.title && (
              <div className="px-4 pt-2 pb-1">
                <span className="text-[9px] font-extrabold text-[#94a3b8] tracking-wider uppercase block">
                  {section.title}
                </span>
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                let isActive =
                  pathname === item.href ||
                  (item.href !== '/admin' && pathname.startsWith(item.href));
                if (item.href === '/admin/accounts' && pathname.startsWith('/admin/settings/units')) {
                  isActive = true;
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 no-underline cursor-pointer ${
                      isActive
                        ? 'bg-[#2563eb] text-white shadow-md shadow-blue-500/10'
                        : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#1e293b]'
                    }`}
                  >
                    <span className={isActive ? 'text-white' : 'text-[#94a3b8]'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* USER PROFILE INFO SECTION */}
      <div className="p-4 border-t border-[#f1f5f9] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-sm ring-2 ring-slate-100">
            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#1e293b] leading-tight">
              {user?.name || 'Quản trị viên'}
            </span>
            <span className="text-[10px] text-[#94a3b8] font-medium mt-0.5 max-w-[130px] truncate">
              {user?.email || 'admin@gooli.vn'}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-[#94a3b8] hover:text-[#ef4444] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          title="Đăng xuất"
        >
          <SignOut size={20} />
        </button>
      </div>
    </aside>
  );
}
