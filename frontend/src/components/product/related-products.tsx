import React from 'react';
import Image from 'next/image';

export default function RelatedProducts() {
  return (
    <section id="lien-quan" style={{ marginTop: '32px', marginBottom: '64px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a', textTransform: 'uppercase', marginBottom: '32px', letterSpacing: '0.5px' }}>SẢN PHẨM LIÊN QUAN</h2>
      
      <div className="custom-related-grid">
        {[
          { name: 'Lam sóng ngoài trời - HH Brown', price: 'Liên hệ', views: 1264, tag: 'HH-BROWN', img: '/luxury_interior.png' },
          { name: 'Lam sóng ngoài trời màu Red - HH008', price: 'Liên hệ', views: 1201, tag: 'RED', img: '/luxury_interior.png' },
          { name: 'Lam sóng ngoài trời - HH Wood', price: 'Liên hệ', views: 1414, tag: 'HH-WOOD', img: '/luxury_interior.png' },
          { name: 'Lam sóng ngoài trời màu Teak - HH007', price: 'Liên hệ', views: 1194, tag: 'TEAK', img: '/luxury_interior.png' },
          { name: 'Lam sóng ngoài trời Coffee - HH010', price: 'Liên hệ', views: 1012, tag: 'COFFEE', img: '/luxury_interior.png' },
        ].map((rp, idx) => (
          <div key={idx} className="custom-rp-card">
            {/* Card image */}
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', backgroundColor: '#f5f5f5', borderBottom: '1px solid #f0f0f0' }}>
              <Image src={rp.img} alt={rp.name} fill className="object-cover" />
              <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'rgba(255,255,255,0.95)', padding: '6px 12px', borderRadius: '4px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '9px', color: '#737373', fontWeight: 'bold', lineHeight: '1', marginBottom: '2px', textTransform: 'uppercase' }}>Ngoài trời</div>
                <div style={{ fontSize: '11px', color: '#1a1a1a', fontWeight: '900', lineHeight: '1', textTransform: 'uppercase' }}>{rp.tag}</div>
              </div>
              <div style={{ position: 'absolute', bottom: '12px', left: '12px', backgroundColor: '#1a1a1a', width: '40px', height: '40px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                 <div style={{ textAlign: 'center' }}>
                    <svg style={{ width: '16px', height: '16px', margin: '0 auto 2px', fill: 'currentColor' }} viewBox="0 0 24 24"><path d="M12 3L2 12h3v8h14v-8h3L12 3z"/></svg>
                    <span style={{ fontSize: '6px', fontWeight: 'bold', display: 'block', lineHeight: '1' }}>HÙNG HƯNG</span>
                 </div>
              </div>
            </div>
            
            {/* Card info */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '16px', lineHeight: '1.4', textAlign: 'left', width: '100%', minHeight: '40px' }}>{rp.name}</h3>
              <div style={{ color: '#bc6f21', fontWeight: 'bold', fontSize: '16px', textAlign: 'center', marginBottom: '16px' }}>{rp.price}</div>
              
              <div style={{ width: '100%', border: '1px solid #e5e5e5', borderRadius: '4px', padding: '8px', textAlign: 'center', fontSize: '13px', color: '#4a4a4a', marginBottom: '12px', fontWeight: '500', backgroundColor: '#fafafa' }}>
                Lượt xem: {rp.views}
              </div>
              
              <button className="custom-rp-btn">
                <svg style={{ width: '14px', height: '14px', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
                Nhận Báo Giá
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
