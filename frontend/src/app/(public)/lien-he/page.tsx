import ConsultationForm from '@/components/common/consultation-form';
import PageHero from '@/components/common/PageHero';

export default function ContactPage() {
  return (
    <main className="flex-1 bg-neutral-100 min-h-screen pb-20">
      <PageHero title="Liên hệ" breadcrumbText="Liên hệ" />

      {/* Main Content Section */}
      <div className="container-gooli relative z-20" style={{ padding: "64px 16px", marginBottom: "40px" }}>
        <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-neutral-100 flex flex-col lg:flex-row" style={{ maxWidth: "1000px", margin: "0 auto" }}>
          
          {/* Left: Map (40%) */}
          <div className="w-full lg:w-[40%] relative bg-neutral-100" style={{ minHeight: "400px" }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.4!2d105.742!3d21.052!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDAzJzA3LjIiTiAxMDXCsDQ0JzMxLjIiRQ!5e0!3m2!1svi!2svn!4v1686000000000!5m2!1svi!2svn&q=Ô+đất+số+37,+Lô+3-4+khu+tái+định+cư+3.6ha,+Phường+Xuân+Phương,+Hà+Nội"
              width="100%"
              height="100%"
              style={{ border: 0, position: "absolute", inset: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Bản đồ GOOLI Việt Nam"
            />
          </div>

          {/* Right: Info & Form (60%) */}
          <div className="w-full lg:w-[60%] flex flex-col" style={{ padding: "32px 40px", gap: "24px" }}>
            
            {/* Contact Info Section */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-[#35507A]" style={{ marginBottom: "8px" }}>
                THÔNG TIN LIÊN HỆ
              </h2>
              <div style={{ height: "2px", width: "48px", backgroundColor: "#E46C0A", marginBottom: "16px" }}></div>
              
              <div className="flex flex-col" style={{ gap: "8px", fontSize: "14px", color: "#52525b" }}>
                <p>
                  <strong style={{ color: "#35507A", fontWeight: "bold" }}>Địa chỉ:</strong> Ô đất số 37, Lô đất 3-4 khu tái định cư 3,6ha, Phường Xuân Phương, Hà Nội
                </p>
                <p>
                  <strong style={{ color: "#35507A", fontWeight: "bold" }}>Điện thoại:</strong> 0934 119 376
                </p>
                <p>
                  <strong style={{ color: "#35507A", fontWeight: "bold" }}>E-mail:</strong> vatlieuhunghung@gmail.com
                </p>
              </div>

              {/* Social Icons */}
              <div className="flex" style={{ gap: "12px", marginTop: "16px" }}>
                <a href="#" className="w-8 h-8 rounded-full text-white flex items-center justify-center transition-colors hover:bg-[#c95e08]" style={{ backgroundColor: "#E46C0A" }}>
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full text-white flex items-center justify-center transition-colors hover:bg-[#c95e08]" style={{ backgroundColor: "#E46C0A" }}>
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              </div>
            </div>

            {/* Consultation Form Section */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-[#35507A]" style={{ marginBottom: "8px" }}>
                LIÊN HỆ CHÚNG TÔI
              </h2>
              <div style={{ height: "2px", width: "48px", backgroundColor: "#E46C0A", marginBottom: "16px" }}></div>
              
              <ConsultationForm />
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
