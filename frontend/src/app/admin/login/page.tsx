'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin } from '../../../services/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check login state on load
  useEffect(() => {
    const token = localStorage.getItem('gooli_token');
    if (token) {
      router.push('/admin');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await adminLogin(email, password);

      // Save user session
      localStorage.setItem('gooli_token', data.accessToken);
      localStorage.setItem('gooli_user', JSON.stringify({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role
      }));

      // Sync Cookies
      document.cookie = `gooli_token=${data.accessToken}; path=/; max-age=86400; SameSite=Lax; Secure`;
      document.cookie = `gooli_role=${data.user.role}; path=/; max-age=86400; SameSite=Lax; Secure`;

      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Email hoặc mật khẩu không chính xác.';
      setError(errMsg);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#eef0f3] text-gray-800 px-4 font-sans">
      <div className="w-full max-w-md bg-white border border-gray-200 p-8 rounded-lg shadow-md flex flex-col justify-between">
        
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="text-2xl font-extrabold tracking-wider text-[#008b44] mb-1">
            GOOLI WMS
          </div>
          <div className="text-xs uppercase text-gray-500 tracking-widest font-semibold">
            Hệ thống quản lý kho
          </div>
          <div className="w-16 h-1 bg-[#008b44] mx-auto mt-4 rounded-full" />
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs rounded-md relative select-none">
            <span className="block font-bold mb-0.5 uppercase tracking-wider text-red-800">[LỖI TRUY CẬP]</span>
            <span className="block">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="admin_email" className="block text-xs uppercase tracking-wider text-gray-600 font-bold mb-1.5 select-none">
              Tên đăng nhập / Email
            </label>
            <input
              id="admin_email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@gooli.vn"
              required
              disabled={loading}
              className="w-full bg-white border border-gray-300 rounded-md px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#008b44] focus:ring-1 focus:ring-[#008b44] disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="admin_password" className="block text-xs uppercase tracking-wider text-gray-600 font-bold mb-1.5 select-none">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                id="admin_password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="w-full bg-white border border-gray-300 rounded-md pl-3.5 pr-11 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#008b44] focus:ring-1 focus:ring-[#008b44] disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
              />
              
              {/* Eye Icon button toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer focus:outline-none p-1"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#008b44] hover:bg-[#007036] text-white font-bold py-3 rounded-md transition-colors cursor-pointer select-none text-center shadow-sm disabled:opacity-50 text-sm tracking-wider uppercase"
          >
            {loading ? 'Đang kiểm tra...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-400 font-medium select-none">
          Gooli.vn &copy; {new Date().getFullYear()} - ALL RIGHTS RESERVED
        </div>
      </div>
    </main>
  );
}
