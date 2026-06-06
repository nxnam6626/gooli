'use client';

import { useState } from 'react';
import { createConsultation } from '../../services/api';

export default function ConsultationForm() {
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
        note: note.trim() || undefined,
      });
      setStatus('success');
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
      <h3 className="text-white text-base font-bold uppercase tracking-tight">
        Miễn phí tư vấn
      </h3>
      
      {status === 'success' && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs p-3" style={{ borderRadius: 'var(--radius-sm)' }}>
          Gửi yêu cầu tư vấn thành công! Chúng tôi sẽ liên hệ lại sớm nhất.
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-500/10 border border-red-500/25 text-red-400 text-xs p-3" style={{ borderRadius: 'var(--radius-sm)' }}>
          {errorMsg}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email của bạn (không bắt buộc)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 w-full bg-neutral-800 border border-neutral-700 px-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-colors"
          style={{ borderRadius: 'var(--radius-sm)' }}
          disabled={status === 'loading'}
        />

        <input
          type="tel"
          placeholder="Số điện thoại của bạn *"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="h-11 w-full bg-neutral-800 border border-neutral-700 px-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-colors"
          style={{ borderRadius: 'var(--radius-sm)' }}
          disabled={status === 'loading'}
        />

        <textarea
          placeholder="Lời nhắn (tùy chọn)..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full bg-neutral-800 border border-neutral-700 p-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-colors resize-none"
          style={{ borderRadius: 'var(--radius-sm)' }}
          disabled={status === 'loading'}
        />

        <button
          type="submit"
          className="h-11 w-full bg-brand-gold text-neutral-900 font-bold uppercase tracking-wider text-sm hover:bg-amber-600 transition-colors flex items-center justify-center"
          style={{ borderRadius: 'var(--radius-sm)' }}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <svg className="animate-spin h-5 w-5 text-neutral-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Gửi đi'
          )}
        </button>
      </div>
    </form>
  );
}
