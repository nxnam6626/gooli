/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin } from '../../../services/api';
import GooliLogo from '@/components/common/GooliLogo';
import { 
  EnvelopeSimple, 
  Lock, 
  Eye, 
  EyeSlash, 
  WarningCircle, 
  CircleNotch 
} from '@phosphor-icons/react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check login state and check remembered email on load
  useEffect(() => {
    const token = localStorage.getItem('gooli_token');
    if (token) {
      router.push('/admin');
      return;
    }

    const savedEmail = localStorage.getItem('gooli_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
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

      // Remember me handling
      if (rememberMe) {
        localStorage.setItem('gooli_remember_email', email);
      } else {
        localStorage.removeItem('gooli_remember_email');
      }

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

  // Inline Style objects for layout correctness and reliability (guaranteeing padding/margin aren't collapsed)
  const rootStyle = {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    backgroundImage: 'radial-gradient(at 0% 0%, rgba(176, 101, 24, 0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(203, 213, 225, 0.2) 0px, transparent 50%)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    fontFamily: "var(--font-sans), 'Outfit', system-ui, sans-serif",
    padding: '24px'
  };

  const cardStyle = {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderTop: '4px solid #B06518',
    borderRadius: '12px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
    padding: '48px 40px',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const,
    boxSizing: 'border-box' as const
  };

  const inputStyle = {
    width: '100%',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '12px 16px 12px 42px',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box' as const
  };

  const buttonStyle = {
    width: '100%',
    backgroundColor: '#B06518',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '14px 24px',
    fontSize: '14px',
    fontWeight: '700',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 6px -1px rgba(176, 101, 24, 0.15), 0 2px 4px -1px rgba(176, 101, 24, 0.1)',
    boxSizing: 'border-box' as const
  };

  return (
    <main style={rootStyle}>
      {/* Decorative Light Background Blobs */}
      <div 
        style={{
          width: '400px',
          height: '400px',
          backgroundColor: 'rgba(176, 101, 24, 0.03)',
          filter: 'blur(80px)',
          borderRadius: '50%',
          position: 'absolute',
          top: '-100px',
          left: '-100px',
          pointerEvents: 'none'
        }} 
      />
      <div 
        style={{
          width: '500px',
          height: '500px',
          backgroundColor: 'rgba(203, 213, 225, 0.15)',
          filter: 'blur(100px)',
          borderRadius: '50%',
          position: 'absolute',
          bottom: '-150px',
          right: '-150px',
          pointerEvents: 'none'
        }} 
      />

      {/* Login Card Panel */}
      <div style={cardStyle}>
        
        {/* Header Branding */}
        <div style={{ marginBottom: '36px', textAlign: 'center' }}>
          <GooliLogo 
            width={64} 
            height={64} 
            className="mx-auto mb-4 hover:scale-105 transition-transform duration-300 cursor-pointer" 
          />
          <h1 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '0.02em', color: '#0f172a', marginBottom: '6px', fontFamily: 'var(--font-sans)' }}>
            GOOLI WMS
          </h1>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.2em', fontWeight: '700' }}>
            Hệ thống quản lý kho
          </div>
        </div>

        {/* Error Feedback Alert Banner */}
        {error && (
          <div style={{
            marginBottom: '24px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fee2e2',
            color: '#991b1b',
            padding: '14px 16px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            fontSize: '13px'
          }}>
            <WarningCircle size={20} weight="fill" style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <span style={{ display: 'block', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#b91c1c', marginBottom: '2px' }}>[LỖI TRUY CẬP]</span>
              <span style={{ lineHeight: '1.5' }}>{error}</span>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Username/Email Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="admin_email" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', fontWeight: '700', userSelect: 'none' }}>
              Tên đăng nhập / Email
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <EnvelopeSimple size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                id="admin_email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@gooli.vn"
                required
                disabled={loading}
                autoComplete="off"
                style={inputStyle}
                className="focus:border-[#B06518] focus:ring-1 focus:ring-[#B06518] hover:border-slate-400 transition-colors duration-200"
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="admin_password" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', fontWeight: '700' }}>
                Mật khẩu
              </label>
              <button
                type="button"
                onClick={() => alert('Vui lòng liên hệ với quản trị viên để được cấp lại mật khẩu.')}
                style={{
                  border: 'none',
                  background: 'none',
                  fontSize: '11px',
                  color: '#B06518',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  padding: 0
                }}
                className="hover:text-[#905212] transition-colors"
              >
                Quên mật khẩu?
              </button>
            </div>
            <div style={{ position: 'relative', width: '100%' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                id="admin_password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                autoComplete="current-password"
                style={inputStyle}
                className="focus:border-[#B06518] focus:ring-1 focus:ring-[#B06518] hover:border-slate-400 transition-colors duration-200"
              />
              
              {/* Show/Hide Password Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                className="hover:color-slate-600 transition-colors focus:outline-none"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              >
                {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me Option */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              id="remember_me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                accentColor: '#B06518',
                cursor: 'pointer'
              }}
            />
            <label htmlFor="remember_me" style={{ marginLeft: '10px', fontSize: '13px', color: '#64748b', fontWeight: '500', cursor: 'pointer' }} className="hover:text-slate-700 transition-colors">
              Ghi nhớ đăng nhập
            </label>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            style={buttonStyle}
            className="hover:bg-[#905212] active:scale-[0.98] transition-all duration-200"
          >
            {loading ? (
              <>
                <CircleNotch size={18} className="animate-spin text-white" />
                <span>Đang kiểm tra...</span>
              </>
            ) : (
              <span>Đăng nhập</span>
            )}
          </button>
        </form>

        {/* Footer Brand Rights */}
        <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          Gooli.vn &copy; {new Date().getFullYear()} - All Rights Reserved
        </div>
      </div>
    </main>
  );
}


