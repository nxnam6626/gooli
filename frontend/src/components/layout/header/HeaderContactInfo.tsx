'use client';

import React from 'react';
import { MapPin, Phone } from '@phosphor-icons/react';

interface HeaderContactInfoProps {
  address: string;
  phone: string;
}

export default function HeaderContactInfo({
  address,
  phone,
}: HeaderContactInfoProps) {
  return (
    <div className="hidden md:flex items-center gap-8 text-sm text-neutral-600 dark:text-neutral-400">
      <div className="flex items-center gap-2">
        <MapPin size={18} className="text-brand-gold" aria-hidden="true" />
        <div>
          <p className="text-[10px] uppercase font-bold text-neutral-400">
            Văn phòng
          </p>
          <p className="font-semibold text-neutral-800 dark:text-neutral-200">
            {address}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Phone size={18} className="text-brand-gold" aria-hidden="true" />
        <div>
          <p className="text-[10px] uppercase font-bold text-neutral-400">
            Hotline hỗ trợ
          </p>
          <p className="font-semibold text-neutral-800 dark:text-neutral-200">
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="hover:text-brand-gold transition-colors"
            >
              {phone}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
