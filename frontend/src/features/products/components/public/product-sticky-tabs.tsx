"use client";

import { useState, useEffect } from 'react';

const TABS = [
  { id: 'mo-ta', label: 'Mô tả sản phẩm' },
  { id: 'lien-quan', label: 'Sản phẩm liên quan' },
];

export default function ProductStickyTabs() {
  const [activeTab, setActiveTab] = useState('mo-ta');
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // 1. Kiểm tra trạng thái Sticky
      // Thanh tab sẽ dính khi cuộn qua khỏi vị trí ban đầu của nó
      // Tuy nhiên cách đơn giản nhất là dùng CSS `position: sticky` và chỉ theo dõi vị trí các Section
      
      // 2. Scroll Spy logic
      const scrollPosition = window.scrollY + 100; // Offset cho header
      
      let currentActive = 'mo-ta';
      
      for (const tab of TABS) {
        const element = document.getElementById(tab.id);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            currentActive = tab.id;
          }
        }
      }
      
      setActiveTab(currentActive);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check once on mount
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Trừ đi chiều cao của thanh header/sticky tab
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-sm transition-all w-full" style={{ top: '0px' }}>
      <div className="custom-container mx-auto">
        <ul className="flex flex-row gap-8 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <li key={tab.id} className="shrink-0">
              <a
                href={`#${tab.id}`}
                onClick={(e) => scrollToSection(e, tab.id)}
                className={`block py-4 text-sm md:text-base font-bold uppercase tracking-wide transition-colors border-b-2 ${
                  activeTab === tab.id 
                    ? 'text-[#bc6f21] border-[#bc6f21]' 
                    : 'text-neutral-500 border-transparent hover:text-neutral-900'
                }`}
              >
                {tab.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
