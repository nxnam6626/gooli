/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCart,
  MapPin,
  Users,
  ChartBar,
  List,
  SignOut,
  House,
  Package,
  CreditCard,
  ArrowCounterClockwise,
  FolderOpen,
  Gear,
} from "@phosphor-icons/react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("gooli_token");
    const userData = localStorage.getItem("gooli_user");

    if (!token || !userData) {
      router.push("/admin/login");
      return;
    }

    try {
      setUser(JSON.parse(userData));
      setLoading(false);
    } catch (e) {
      localStorage.removeItem("gooli_token");
      localStorage.removeItem("gooli_user");
      router.push("/admin/login");
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("gooli_token");
    localStorage.removeItem("gooli_user");
    document.cookie = "gooli_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie = "gooli_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f5f7fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: "16px", color: "#666", fontWeight: "bold" }}>
          Đang kết nối hệ thống...
        </div>
      </div>
    );
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div style={{ minHeight: "100vh", width: "100%", backgroundColor: "#f3f4f6", display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif" }}>
      {/* HEADER TẮT CSS, DÙNG INLINE HOẶC MÀU CHẮC CHẮN ĂN */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, width: "100%", backgroundColor: "#ffffff", borderBottom: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ width: "100%", maxWidth: "1400px", margin: "0 auto", padding: "0 24px", height: "70px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          
          {/* Brand & Nav */}
          <div style={{ display: "flex", gap: "40px", height: "100%", alignItems: "center" }}>
            <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <div style={{ width: "36px", height: "36px", backgroundColor: "#0f172a", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "20px" }}>
                G
              </div>
              <span style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.5px" }}>
                Gooli WMS
              </span>
            </Link>

            <nav style={{ display: "flex", height: "100%", gap: "8px" }} className="hidden md:flex">
              <NavLink href="/admin" active={pathname === "/admin"} icon={<House size={22} />} label="Tổng quan" />
              <NavLink href="/admin/categories" active={pathname.startsWith("/admin/categories")} icon={<FolderOpen size={22} />} label="Danh mục" />
              <NavLink href="/admin/functions" active={pathname.startsWith("/admin/functions")} icon={<Gear size={22} />} label="Chức năng" />
              <NavLink href="/admin/products" active={pathname.startsWith("/admin/products")} icon={<Package size={22} />} label="Hàng hóa" />
              <NavLink href="/admin/receipts" active={pathname.startsWith("/admin/receipts")} icon={<List size={22} />} label="Phiếu nhập" />
              <NavLink href="/admin/partners" active={pathname.startsWith("/admin/partners")} icon={<Users size={22} />} label="Đối tác" />
              <NavLink href="/admin/slips" active={pathname.startsWith("/admin/slips")} icon={<CreditCard size={22} />} label="Thu/Chi" />
              <NavLink href="/admin/returns" active={pathname.startsWith("/admin/returns")} icon={<ArrowCounterClockwise size={22} />} label="Trả hàng" />
              <NavLink href="/admin/reports" active={pathname.startsWith("/admin/reports")} icon={<ChartBar size={22} />} label="Báo cáo" />
            </nav>
          </div>

          {/* Right Profile */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <button
              onClick={() => alert("Luồng bán hàng")}
              style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#10b981", color: "#ffffff", border: "none", padding: "10px 20px", borderRadius: "6px", fontSize: "15px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)" }}
            >
              <ShoppingCart size={20} weight="bold" />
              Bán hàng
            </button>

            <div style={{ width: "1px", height: "24px", backgroundColor: "#e5e7eb" }} />

            <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={handleLogout} title="Bấm để đăng xuất">
              <div style={{ width: "36px", height: "36px", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "bold", color: "#334155" }}>
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>{user?.name || "Admin"}</span>
                <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "500" }}>Thoát</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main style={{ flex: 1, width: "100%", maxWidth: "1400px", margin: "0 auto", padding: "32px 24px" }}>
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, active, icon, label }: { href: string; active: boolean; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "0 16px",
        height: "100%",
        fontSize: "15px",
        fontWeight: active ? "700" : "600",
        color: active ? "#0f172a" : "#64748b",
        textDecoration: "none",
        borderBottom: active ? "3px solid #0f172a" : "3px solid transparent",
        transition: "all 0.2s"
      }}
    >
      {icon}
      {label}
    </Link>
  );
}
