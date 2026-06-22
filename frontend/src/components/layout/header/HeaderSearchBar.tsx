"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react";

interface HeaderSearchBarProps {
  isMobile?: boolean;
}

export default function HeaderSearchBar({ isMobile = false }: HeaderSearchBarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/san-pham?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push(`/san-pham`);
    }
  };

  return (
    <div className={isMobile ? "w-full" : "hidden md:flex flex-1 max-w-xs lg:max-w-md mx-6 lg:mx-8"}>
      <form onSubmit={handleSearchSubmit} className="w-full relative">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm, vật liệu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:border-[#B06518] focus:ring-1 focus:ring-[#B06518] rounded-full py-2 pl-4 pr-10 text-xs font-semibold text-neutral-800 dark:text-neutral-100 focus:outline-none placeholder-neutral-400 dark:placeholder-neutral-500 transition-all shadow-3xs min-w-0"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#B06518] bg-transparent border-none outline-none cursor-pointer p-0"
        >
          <MagnifyingGlass size={18} weight="bold" />
        </button>
      </form>
    </div>
  );
}
