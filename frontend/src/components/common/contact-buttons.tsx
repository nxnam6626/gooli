'use client';

import { useEffect, useState } from 'react';

export default function ContactButtons() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Bottom Right Floating Vertical List */}
      <div className="fixed bottom-6 right-3 lg:right-4 z-50 flex flex-col gap-2.5">
        {/* Hotline Call Button */}
        <button
          onClick={() => window.location.href = 'tel:0969889889'}
          className="relative flex h-10 w-10 items-center justify-center bg-red-600 text-white shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 rounded-full hover:shadow-red-500/50 hover:shadow-xl group cursor-pointer"
          title="Gọi Hotline"
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-600 opacity-40"></span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="h-4.5 w-4.5 relative z-10 transition-transform duration-200 group-hover:rotate-12"
          >
            <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.387a20.373 20.373 0 0 1-7.147-7.147c-.155-.441.011-.928.387-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
          </svg>
        </button>

        {/* Zalo Button */}
        <a
          href="https://zalo.me/0969889889"
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex h-10 w-10 items-center justify-center bg-[#0068ff] text-white shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 rounded-full hover:shadow-blue-500/50 hover:shadow-xl"
          title="Chat Zalo"
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0068ff] opacity-40"></span>
          <span className="relative text-[9px] font-black tracking-tighter">ZALO</span>
        </a>

        {/* Facebook Page Button */}
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 items-center justify-center bg-[#1877f2] text-white shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 rounded-full hover:shadow-blue-600/50 hover:shadow-xl"
          title="Facebook"
        >
          <svg
            fill="currentColor"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
              clipRule="evenodd"
            />
          </svg>
        </a>

        {/* YouTube Button */}
        <a
          href="https://youtube.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 items-center justify-center bg-red-600 text-white shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 rounded-full hover:shadow-red-500/50 hover:shadow-xl"
          title="Kênh YouTube"
        >
          <svg
            fill="currentColor"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.418-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 12 5 12 5s6.256 0 7.812.418ZM10.5 15l5.25-3-5.25-3v6Z"
              clipRule="evenodd"
            />
          </svg>
        </a>

        {/* Back to Top Button */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="flex h-10 w-10 items-center justify-center bg-neutral-800 text-white shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 rounded-full hover:bg-neutral-700"
            title="Cuộn lên đầu trang"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
              />
            </svg>
          </button>
        )}
      </div>
    </>
  );
}
