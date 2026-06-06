'use client';

import React from 'react';

interface CallButtonProps {
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  title?: string;
  phone?: string;
}

export default function CallButton({ className, children, style, title, phone = '0969889889' }: CallButtonProps) {
  return (
    <button
      onClick={() => window.location.href = `tel:${phone}`}
      className={`${className} cursor-pointer`}
      style={style}
      title={title}
    >
      {children}
    </button>
  );
}
