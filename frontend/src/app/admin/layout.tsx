'use client';

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useAdminAuth } from './_components/useAdminAuth';
import LoadingScreen from './_components/LoadingScreen';
import Sidebar from './_components/Sidebar';
import Header from './_components/Header';
import AccessDeniedScreen from './_components/AccessDeniedScreen';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    user,
    loading,
    perms,
    pathname,
    router,
    hasAccess,
    userRole,
    handleLogout,
  } = useAdminAuth();

  if (loading) {
    return <LoadingScreen message="Đang kết nối hệ thống..." />;
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen bg-[#f8fafc] flex font-sans antialiased text-[#1e293b] overflow-hidden">
        {/* SIDEBAR */}
        <Sidebar
          pathname={pathname}
          perms={perms}
          user={user}
          handleLogout={handleLogout}
        />

        {/* MAIN CONTENT WRAPPER */}
        <div className="flex-1 pl-64 flex flex-col h-screen overflow-hidden">
          {/* HEADER NAVBAR */}
          <Header />

          {/* CONTAINER FOR CHILDREN */}
          <main className="flex-1 p-8 bg-[#f8fafc] overflow-y-auto">
            {hasAccess ? (
              children
            ) : (
              <AccessDeniedScreen
                userRole={userRole}
                onBackToDashboard={() => router.push('/admin')}
              />
            )}
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
}
