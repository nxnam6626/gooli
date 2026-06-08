'use client';

import { useState } from 'react';
import { createConsultation } from '../../services/api';

export default function ConsultationForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setStatus('error');
      setErrorMsg('Vui lòng nhập số điện thoại.');
      return;
    }

    setStatus('loading');
    try {
      await createConsultation({
        phone: phone.trim(),
        email: email.trim() || undefined,
        note: `[Tên: ${name}] ${note}`.trim() || undefined,
      });
      setStatus('success');
      setName('');
      setPhone('');
      setEmail('');
      setNote('');
    } catch (err: unknown) {
      console.error(err);
      setStatus('error');
      const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi, vui lòng thử lại sau.';
      setErrorMsg(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left w-full">
      {status === 'success' && (
        <div className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-sm p-4 rounded" style={{ borderRadius: 'var(--radius-sm)' }}>
          Gửi yêu cầu tư vấn thành công! Chúng tôi sẽ liên hệ lại sớm nhất.
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 text-red-600 border border-red-200 text-sm p-4 rounded" style={{ borderRadius: 'var(--radius-sm)' }}>
          {errorMsg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Họ tên của bạn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-11 w-full bg-white border border-neutral-300 px-4 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#B06518] focus:ring-1 focus:ring-[#B06518] transition-colors rounded"
          disabled={status === 'loading'}
        />

        <input
          type="email"
          placeholder="Email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 w-full bg-white border border-neutral-300 px-4 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#B06518] focus:ring-1 focus:ring-[#B06518] transition-colors rounded"
          disabled={status === 'loading'}
        />
      </div>

      <input
        type="tel"
        placeholder="Điện thoại của bạn"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
        className="h-11 w-full bg-white border border-neutral-300 px-4 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#B06518] focus:ring-1 focus:ring-[#B06518] transition-colors rounded"
        disabled={status === 'loading'}
      />

      <textarea
        placeholder="Ghi chú"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={4}
        className="w-full bg-white border border-neutral-300 p-4 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#B06518] focus:ring-1 focus:ring-[#B06518] transition-colors resize-none rounded"
        disabled={status === 'loading'}
      />

      <div className="mt-2">
        <button
          type="submit"
          className="h-11 px-8 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium text-sm transition-colors flex items-center justify-center rounded"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'GỬI'
          )}
        </button>
      </div>
    </form>
  );
}
