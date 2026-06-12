"use client";

import Link from "next/link";
import React from "react";

const FUNCTIONS = [
  {
    key: "receipts",
    label: "Nhập hàng",
    description: "Tạo phiếu nhập hàng từ nhà cung cấp. Tồn kho tự động cộng sau khi duyệt.",
    href: "/admin/receipts",
    icon: "📦",
    color: "#1d4ed8",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
  {
    key: "exports",
    label: "Bán hàng",
    description: "Tạo phiếu xuất hàng cho khách hàng. Tồn kho tự động trừ sau khi duyệt.",
    href: "/admin/exports",
    icon: "🛒",
    color: "#15803d",
    bg: "#f0fdf4",
    border: "#bbf7d0",
  },
  {
    key: "customer-returns",
    label: "Nhập hàng hoàn trả",
    description: "Ghi nhận hàng khách trả lại. Tồn kho được cộng trở lại.",
    href: "/admin/returns?tab=customer",
    icon: "↩️",
    color: "#b45309",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  {
    key: "supplier-returns",
    label: "Xuất trả hàng",
    description: "Trả hàng lại nhà cung cấp. Tồn kho giảm sau khi xuất trả.",
    href: "/admin/returns?tab=supplier",
    icon: "↪️",
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
  },
  {
    key: "receipts-slip",
    label: "Phiếu thu",
    description: "Ghi nhận thu tiền từ khách hàng. Theo dõi công nợ và thanh toán.",
    href: "/admin/slips?type=RECEIPT",
    icon: "💰",
    color: "#065f46",
    bg: "#ecfdf5",
    border: "#a7f3d0",
  },
  {
    key: "payment-slip",
    label: "Phiếu chi",
    description: "Ghi nhận chi trả tiền cho nhà cung cấp. Quản lý công nợ đầu ra.",
    href: "/admin/slips?type=PAYMENT",
    icon: "💸",
    color: "#9f1239",
    bg: "#fff1f2",
    border: "#fecdd3",
  },
];

export default function FunctionsPage() {
  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>
          Quản lý Chức năng
        </h1>
        <p style={{ fontSize: 15, color: "#64748b", margin: "6px 0 0" }}>
          Các nghiệp vụ nhập – xuất kho, trả hàng, và thanh toán
        </p>
      </div>

      {/* Function Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 20,
      }}>
        {FUNCTIONS.map(fn => (
          <Link key={fn.key} href={fn.href} style={{ textDecoration: "none" }}>
            <div
              style={{
                background: fn.bg,
                border: `1.5px solid ${fn.border}`,
                borderRadius: 14,
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                transition: "all .2s",
                cursor: "pointer",
                height: "100%",
                boxSizing: "border-box",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 24px rgba(0,0,0,0.1)`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              {/* Icon */}
              <div style={{ fontSize: 40, lineHeight: 1 }}>{fn.icon}</div>

              {/* Label */}
              <div style={{ fontSize: 18, fontWeight: 800, color: fn.color }}>
                {fn.label}
              </div>

              {/* Description */}
              <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
                {fn.description}
              </div>

              {/* Arrow */}
              <div style={{ fontSize: 13, fontWeight: 700, color: fn.color, marginTop: "auto" }}>
                Mở →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
