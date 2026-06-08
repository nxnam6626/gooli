import ConsultationForm from '@/components/common/consultation-form';
import PageHero from '@/components/common/PageHero';

export default function ContactPage() {
  return (
    <main className="flex-1 bg-neutral-100 min-h-screen pb-20">
      <PageHero title="Liên hệ" breadcrumbText="Liên hệ" />

      {/* Main Content Overlapping Banner */}
      <div className="container-gooli relative z-20 -mt-16 md:-mt-24">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-neutral-200">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Left: Map */}
            <div className="h-[400px] lg:h-auto min-h-[500px] w-full relative bg-neutral-100">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.863855881395!2d105.7720974154023!3d21.03812979283529!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313454b6163c392f%3A0x1ebf6d0f3aa1b97a!2zMjIxIEjhu5MgVMO5bmcgTeG6rXUsIEPhuqd1IERp4buFbiwgVOG7qyBMacOqbSwgSMOgIE7hu5lpLCBWaWV0bmFt!5e0!3m2!1sen!2s!4v1652782489000!5m2!1sen!2s"
                width="100%"
                height="100%"
                className="border-0 absolute inset-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Right: Info & Form */}
            <div className="p-8 md:p-12 flex flex-col gap-10">
              
              {/* Contact Info Section */}
              <div>
                <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-neutral-800 mb-2">
                  THÔNG TIN LIÊN HỆ
                </h2>
                <div className="h-0.5 w-16 bg-[#B06518] mb-6"></div>
                
                <div className="flex flex-col gap-4 text-sm text-neutral-600">
                  <p>
                    <strong className="text-[#B06518] font-semibold">Địa chỉ:</strong> 221 Hồ Tùng Mậu, Phường Cầu Diễn, Quận Nam Từ Liêm, Hà Nội
                  </p>
                  <p>
                    <strong className="text-[#B06518] font-semibold">Điện thoại:</strong> 0969 889 889 / 0981 599 011
                  </p>
                  <p>
                    <strong className="text-[#B06518] font-semibold">E-mail:</strong> contact@gooli.vn / support@gooli.vn
                  </p>
                </div>

                {/* Social Icons */}
                <div className="flex gap-3 mt-6">
                  <a href="#" className="w-8 h-8 rounded-full bg-[#B06518] text-white flex items-center justify-center hover:bg-[#8C4E10] transition-colors">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                  <a href="#" className="w-8 h-8 rounded-full bg-[#B06518] text-white flex items-center justify-center hover:bg-[#8C4E10] transition-colors">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                </div>
              </div>

              {/* Consultation Form Section */}
              <div>
                <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-neutral-800 mb-2">
                  LIÊN HỆ CHÚNG TÔI
                </h2>
                <div className="h-0.5 w-16 bg-[#B06518] mb-6"></div>
                
                <ConsultationForm />
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
