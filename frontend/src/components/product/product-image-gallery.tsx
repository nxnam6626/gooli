"use client";

import { useState } from 'react';
import Image from 'next/image';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  productSku: string;
}

export default function ProductImageGallery({ images, productName, productSku }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <>
      {/* Giao diện bên ngoài trang */}
      <div className="custom-col-left relative">
        <div 
          className="relative w-full bg-neutral-100 rounded-md overflow-hidden shadow-sm border border-neutral-200 cursor-pointer group" 
          style={{ position: 'relative', width: '100%', aspectRatio: '1/1', backgroundColor: '#f5f5f5', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e5e5e5' }}
          onClick={() => setIsModalOpen(true)}
        >
          <Image
            src={images[activeIndex]}
            alt={productName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority
            sizes="(max-width: 1024px) 100vw, 40vw"
          />
          
          {/* Overlay Hover Effect */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="bg-white/90 text-neutral-900 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg transform scale-90 group-hover:scale-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
            </div>
          </div>
          
          {/* Top Right Tag */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md text-neutral-900 text-sm font-black px-4 py-2 rounded-sm shadow-sm text-center leading-tight flex flex-col items-center">
            <span className="text-xs uppercase tracking-widest font-semibold text-neutral-500">Ngoài trời</span>
            <span className="text-base">{productSku || 'HH-Wood'}</span>
          </div>

          {/* Bottom Left Logo */}
          <div className="absolute bottom-4 left-4 bg-[#bc6f21] w-16 h-16 rounded-md shadow-sm flex items-center justify-center p-2">
            <div className="text-center text-white">
              <svg className="w-6 h-6 mx-auto mb-1 fill-current" viewBox="0 0 24 24"><path d="M12 3L2 12h3v8h14v-8h3L12 3zm-1 15h-2v-4h2v4zm4 0h-2v-4h2v4z"/></svg>
              <span className="font-bold block leading-none" style={{ fontSize: '8px' }}>HÙNG HƯNG</span>
            </div>
          </div>
        </div>

        {/* Thumbnail Gallery (Ngoài trang) */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
          {images.map((img, i) => (
            <div 
              key={i} 
              style={{ 
                position: 'relative', 
                width: '80px', 
                height: '80px', 
                flexShrink: 0,
                borderRadius: '6px', 
                border: i === activeIndex ? '2px solid #bc6f21' : '1px solid #e5e5e5', 
                overflow: 'hidden',
                cursor: 'pointer',
                opacity: i === activeIndex ? 1 : 0.6,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
                setActiveIndex(i);
              }}
              onMouseLeave={(e) => { 
                if(i !== activeIndex) e.currentTarget.style.opacity = '0.6';
              }}
              onClick={() => {
                setActiveIndex(i);
                setIsModalOpen(true);
              }}
            >
              <Image src={img} alt={`${productName} thumbnail ${i}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* ================= MODAL LIGHTBOX ================= */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8" 
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)' }}
          onClick={() => setIsModalOpen(false)}
        >


          {/* Khối Modal Trắng */}
          <div 
            className="bg-white rounded-lg flex flex-col md:flex-row w-full max-w-5xl shadow-2xl relative"
            style={{ maxHeight: '80vh', padding: '24px', gap: '24px' }}
            onClick={(e) => e.stopPropagation()} // Chặn click out
          >
            
            {/* Vùng ảnh to bên trái Modal */}
            <div className="relative w-full md:w-[65%] lg:w-[70%] bg-[#f5f5f5] flex items-center justify-center rounded-md overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <Image
                src={images[activeIndex]}
                alt={productName}
                fill
                className="object-contain"
                priority
              />
              
              {/* Nút Prev */}
              <button 
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/80 text-white rounded-full p-3 transition-colors backdrop-blur-sm"
                onClick={handlePrev}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
              </button>

              {/* Nút Next */}
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/80 text-white rounded-full p-3 transition-colors backdrop-blur-sm"
                onClick={handleNext}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>

            {/* Vùng Thumbnail bên phải Modal */}
            <div className="w-full md:w-[35%] lg:w-[30%] flex flex-col bg-white overflow-y-auto pr-2">
              <h2 className="text-xl md:text-2xl font-bold text-neutral-900 mb-6 leading-tight">{productName}</h2>
              
              <div className="grid grid-cols-3 gap-3">
                {images.map((img, idx) => (
                  <div 
                    key={idx} 
                    className={`relative w-full aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all ${idx === activeIndex ? 'border-[#bc6f21]' : 'border-transparent hover:border-neutral-300'}`}
                    onClick={() => setActiveIndex(idx)}
                  >
                    <Image src={img} alt={`Modal thumb ${idx}`} fill className="object-cover" />
                    {idx !== activeIndex && <div className="absolute inset-0 bg-white/40"></div>}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
