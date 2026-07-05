'use client';

import React, { useState, useEffect } from 'react';
import ConsultationForm from '@/components/common/consultation-form';
import PageHero from '@/components/common/PageHero';
import { FacebookLogo, LinkedinLogo, Chat } from '@phosphor-icons/react';
import { CONTACT_INFO } from '@/constants/contact';

export default function ContactPage() {
  const [address, setAddress] = useState(CONTACT_INFO.address);
  const [phone, setPhone] = useState(CONTACT_INFO.hotline);
  const [email, setEmail] = useState(CONTACT_INFO.email);
  const [facebookUrl, setFacebookUrl] = useState(CONTACT_INFO.facebook);
  const [linkedinUrl, setLinkedinUrl] = useState(CONTACT_INFO.linkedin);
  const [zaloOaId, setZaloOaId] = useState(CONTACT_INFO.zalo);

  useEffect(() => {
    const loadSettings = () => {
      const saved = localStorage.getItem('gooli_public_website_settings');
      if (saved) {
        try {
          const config = JSON.parse(saved);
          if (config.address) setAddress(config.address);
          if (config.phone) setPhone(config.phone);
          if (config.email) setEmail(config.email);
          if (config.facebook) setFacebookUrl(config.facebook);
          if (config.linkedin) setLinkedinUrl(config.linkedin);
          if (config.zalo) setZaloOaId(config.zalo);
        } catch (err) {
          console.error(
            'Failed to parse website settings in contact page:',
            err,
          );
        }
      }
    };

    loadSettings();
    window.addEventListener('website-settings-updated', loadSettings);
    return () =>
      window.removeEventListener('website-settings-updated', loadSettings);
  }, []);

  return (
    <main className="flex-1 bg-neutral-100 min-h-screen pb-20">
      <PageHero title="Liên hệ" breadcrumbText="Liên hệ" />

      {/* Main Content Section */}
      <div
        className="container-gooli relative z-20"
        style={{ padding: '64px 16px', marginBottom: '40px' }}
      >
        <div
          className="bg-white rounded-lg shadow-xl overflow-hidden border border-neutral-100 flex flex-col lg:flex-row"
          style={{ maxWidth: '1000px', margin: '0 auto' }}
        >
          {/* Left: Map (40%) */}
          <div
            className="w-full lg:w-[40%] relative bg-neutral-100"
            style={{ minHeight: '400px' }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.4!2d105.742!3d21.052!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDAzJzA3LjIiTiAxMDXCsDQ0JzMxLjIiRQ!5e0!3m2!1svi!2svn!4v1686000000000!5m2!1svi!2svn&q=Ô+đất+số+37,+Lô+3-4+khu+tái+định+cư+3.6ha,+Phường+Xuân+Phương,+Hà+Nội"
              width="100%"
              height="100%"
              style={{ border: 0, position: 'absolute', inset: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Bản đồ GOOLI Việt Nam"
            />
          </div>

          {/* Right: Info & Form (60%) */}
          <div
            className="w-full lg:w-[60%] flex flex-col"
            style={{ padding: '32px 40px', gap: '24px' }}
          >
            {/* Contact Info Section */}
            <div>
              <h2
                className="text-xl md:text-2xl font-bold uppercase tracking-tight text-[#35507A]"
                style={{ marginBottom: '8px' }}
              >
                THÔNG TIN LIÊN HỆ
              </h2>
              <div
                style={{
                  height: '2px',
                  width: '48px',
                  backgroundColor: '#E46C0A',
                  marginBottom: '16px',
                }}
              ></div>

              <div
                className="flex flex-col"
                style={{ gap: '8px', fontSize: '14px', color: '#52525b' }}
              >
                <p>
                  <strong style={{ color: '#35507A', fontWeight: 'bold' }}>
                    Địa chỉ:
                  </strong>{' '}
                  {address}
                </p>
                <p>
                  <strong style={{ color: '#35507A', fontWeight: 'bold' }}>
                    Điện thoại:
                  </strong>{' '}
                  {phone}
                </p>
                <p>
                  <strong style={{ color: '#35507A', fontWeight: 'bold' }}>
                    E-mail:
                  </strong>{' '}
                  {email}
                </p>
              </div>

              {/* Social Icons */}
              <div className="flex" style={{ gap: '12px', marginTop: '16px' }}>
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full text-white flex items-center justify-center transition-colors hover:bg-[#c95e08]"
                    style={{ backgroundColor: '#E46C0A' }}
                  >
                    <FacebookLogo size={18} weight="fill" />
                  </a>
                )}
                {linkedinUrl && (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full text-white flex items-center justify-center transition-colors hover:bg-[#c95e08]"
                    style={{ backgroundColor: '#E46C0A' }}
                  >
                    <LinkedinLogo size={18} weight="fill" />
                  </a>
                )}
                {zaloOaId && (
                  <a
                    href={`https://zalo.me/${zaloOaId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full text-white flex items-center justify-center transition-colors hover:bg-[#c95e08]"
                    style={{ backgroundColor: '#E46C0A' }}
                  >
                    <Chat size={18} weight="fill" />
                  </a>
                )}
              </div>
            </div>

            {/* Consultation Form Section */}
            <div>
              <h2
                className="text-xl md:text-2xl font-bold uppercase tracking-tight text-[#35507A]"
                style={{ marginBottom: '8px' }}
              >
                LIÊN HỆ CHÚNG TÔI
              </h2>
              <div
                style={{
                  height: '2px',
                  width: '48px',
                  backgroundColor: '#E46C0A',
                  marginBottom: '16px',
                }}
              ></div>

              <ConsultationForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
