"use client";

import { useState, useEffect } from "react";
import { CONTACT_INFO } from "@/constants/contact";

export default function AboutContact() {
  const [address, setAddress] = useState(CONTACT_INFO.address);
  const [phone, setPhone] = useState(CONTACT_INFO.hotline);
  const [email, setEmail] = useState(CONTACT_INFO.email);

  useEffect(() => {
    const loadSettings = () => {
      const saved = localStorage.getItem("gooli_public_website_settings");
      if (saved) {
        try {
          const config = JSON.parse(saved);
          if (config.address) setAddress(config.address);
          if (config.phone) setPhone(config.phone);
          if (config.email) setEmail(config.email);
        } catch (err) {
          console.error("Failed to parse website settings in about page:", err);
        }
      }
    };

    loadSettings();
    window.addEventListener("website-settings-updated", loadSettings);
    return () => window.removeEventListener("website-settings-updated", loadSettings);
  }, []);

  return (
    <section className="bg-white border-t border-neutral-100" style={{ padding: "clamp(20px, 3vw, 32px) 0" }}>
      <div className="container-gooli">
        <h2
          className="text-2xl sm:text-3xl font-extrabold text-neutral-900 uppercase tracking-widest text-center"
          style={{ marginBottom: "20px" }}
        >
          THÔNG TIN LIÊN HỆ
        </h2>

        <div
          className="grid grid-cols-1 lg:grid-cols-3 max-w-6xl mx-auto items-stretch"
          style={{ gap: "20px" }}
        >
          <div
            className="lg:col-span-2 flex border border-neutral-200 bg-[#FAF8F5] rounded-lg"
            style={{ padding: "clamp(16px, 2vw, 24px)" }}
          >
            <div className="flex flex-col sm:flex-row sm:items-stretch w-full" style={{ gap: "24px" }}>
              <div className="flex-shrink-0 sm:w-52 flex flex-col" style={{ gap: "12px" }}>
                <span
                  className="text-[10px] font-bold text-[#B06518] uppercase tracking-widest"
                  style={{ display: "block", marginBottom: "4px" }}
                >
                  Liên hệ với chúng tôi
                </span>
                <h3
                  className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight leading-snug"
                  style={{ marginBottom: "0" }}
                >
                  CÔNG TY TNHH<br />
                  THƯƠNG MẠI<br />
                  SẢN XUẤT GOOLI
                </h3>
                <a
                  href={`mailto:${email}`}
                  className="inline-block hover:bg-[#8C4E10] text-white font-bold text-xs uppercase tracking-widest transition-all duration-200"
                  style={{ padding: "8px 20px", backgroundColor: "#B06518" }}
                >
                  Gửi Email Ngay
                </a>
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2" style={{ gap: "16px" }}>
                <ContactItem label="Địa chỉ" icon={<AddressIcon />}>
                  <p className="text-sm text-neutral-700 font-medium leading-relaxed">
                    {address}
                  </p>
                </ContactItem>

                <ContactItem label="Hotline" icon={<PhoneIcon />}>
                  <a href={`tel:${phone.replace(/\.|\s/g, '')}`} className="text-sm text-neutral-700 font-medium hover:text-[#B06518] transition-colors duration-200">
                    {phone}
                  </a>
                </ContactItem>

                <ContactItem label="Email" icon={<EmailIcon />}>
                  <a href={`mailto:${email}`} className="text-sm text-neutral-700 font-medium hover:text-[#B06518] transition-colors duration-200">
                    {email}
                  </a>
                </ContactItem>

                <ContactItem label="Mã số thuế" icon={<TaxIcon />}>
                  <p className="text-sm text-neutral-700 font-medium font-mono">0111469615</p>
                </ContactItem>
              </div>
            </div>
          </div>

          <div className="border border-neutral-200 overflow-hidden rounded-lg min-h-[280px] lg:min-h-0">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.4!2d105.742!3d21.052!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDAzJzA3LjIiTiAxMDXCsDQ0JzMxLjIiRQ!5e0!3m2!1svi!2svn!4v1686000000000!5m2!1svi!2svn&q=Ô+đất+số+37,+Lô+3-4+khu+tái+định+cư+3.6ha,+Phường+Xuân+Phương,+Hà+Nội"
              width="100%"
              height="100%"
              style={{ border: 0, display: "block", minHeight: "280px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Bản đồ GOOLI Việt Nam - Phường Xuân Phương, Hà Nội"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactItem({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start" style={{ gap: "10px" }}>
      <div className="flex-shrink-0 w-7 h-7 bg-white border border-neutral-200 rounded flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest" style={{ marginBottom: "3px" }}>
          {label}
        </p>
        {children}
      </div>
    </div>
  );
}

function AddressIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-[#B06518]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-[#B06518]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-[#B06518]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function TaxIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-[#B06518]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}
