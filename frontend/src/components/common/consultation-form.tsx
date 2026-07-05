'use client';

import { useState } from 'react';
import { createConsultation } from '../../services/api';

export default function ConsultationForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
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
      const message =
        err instanceof Error
          ? err.message
          : 'Đã xảy ra lỗi, vui lòng thử lại sau.';
      setErrorMsg(message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
        textAlign: 'left',
      }}
    >
      {status === 'success' && (
        <div
          style={{
            backgroundColor: '#ecfdf5',
            color: '#059669',
            border: '1px solid #a7f3d0',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          Gửi yêu cầu tư vấn thành công! Chúng tôi sẽ liên hệ lại sớm nhất.
        </div>
      )}

      {status === 'error' && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          {errorMsg}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Họ tên của bạn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            flex: '1 1 calc(50% - 6px)',
            minWidth: '180px',
            height: '38px',
            backgroundColor: '#fff',
            border: '1px solid #d4d4d8',
            padding: '0 12px',
            fontSize: '14px',
            color: '#27272a',
            borderRadius: '4px',
            outline: 'none',
          }}
          disabled={status === 'loading'}
        />

        <input
          type="email"
          placeholder="Email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            flex: '1 1 calc(50% - 6px)',
            minWidth: '180px',
            height: '38px',
            backgroundColor: '#fff',
            border: '1px solid #d4d4d8',
            padding: '0 12px',
            fontSize: '14px',
            color: '#27272a',
            borderRadius: '4px',
            outline: 'none',
          }}
          disabled={status === 'loading'}
        />
      </div>

      <input
        type="tel"
        placeholder="Điện thoại của bạn"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
        style={{
          width: '100%',
          height: '38px',
          backgroundColor: '#fff',
          border: '1px solid #d4d4d8',
          padding: '0 12px',
          fontSize: '14px',
          color: '#27272a',
          borderRadius: '4px',
          outline: 'none',
        }}
        disabled={status === 'loading'}
      />

      <textarea
        placeholder="Ghi chú"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        style={{
          width: '100%',
          backgroundColor: '#fff',
          border: '1px solid #d4d4d8',
          padding: '10px 12px',
          fontSize: '14px',
          color: '#27272a',
          borderRadius: '4px',
          resize: 'none',
          outline: 'none',
        }}
        disabled={status === 'loading'}
      />

      <div style={{ marginTop: '4px' }}>
        <button
          type="submit"
          style={{
            height: '38px',
            padding: '0 28px',
            backgroundColor: '#3b82f6',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '14px',
            letterSpacing: '0.5px',
            borderRadius: '4px',
            border: 'none',
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          }}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg
                style={{
                  animation: 'spin 1s linear infinite',
                  height: '16px',
                  width: '16px',
                  color: '#fff',
                }}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  style={{ opacity: 0.25 }}
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  style={{ opacity: 0.75 }}
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Đang gửi...
            </span>
          ) : (
            'GỬI'
          )}
        </button>
      </div>
    </form>
  );
}
