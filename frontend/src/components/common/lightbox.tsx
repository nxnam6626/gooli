'use client';

import { useEffect } from 'react';
import Image from 'next/image';

interface LightboxProps {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function Lightbox({
  isOpen,
  images,
  currentIndex,
  onClose,
  onNavigate,
}: LightboxProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') {
        onNavigate((currentIndex + 1) % images.length);
      }
      if (e.key === 'ArrowLeft') {
        onNavigate((currentIndex - 1 + images.length) % images.length);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, currentIndex, images, onClose, onNavigate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm transition-opacity duration-300">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-6 top-6 z-50 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
        aria-label="Đóng"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Prev button */}
      <button
        onClick={() => onNavigate((currentIndex - 1 + images.length) % images.length)}
        className="absolute left-6 z-50 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 hover:scale-105 transition-transform"
        aria-label="Ảnh trước"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5 8.25 12l7.5-7.5"
          />
        </svg>
      </button>

      {/* Next button */}
      <button
        onClick={() => onNavigate((currentIndex + 1) % images.length)}
        className="absolute right-6 z-50 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 hover:scale-105 transition-transform"
        aria-label="Ảnh sau"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m8.25 4.5 7.5 7.5-7.5 7.5"
          />
        </svg>
      </button>

      {/* Image Container */}
      <div className="relative h-[80vh] w-[90vw] max-w-5xl overflow-hidden flex items-center justify-center select-none">
        <Image
          src={images[currentIndex]}
          alt={`Hình ảnh dự án ${currentIndex + 1}`}
          fill
          className="object-contain"
          sizes="90vw"
          priority
        />
      </div>

      {/* Index indicator */}
      <div className="absolute bottom-6 text-sm text-neutral-400 font-medium select-none">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}
