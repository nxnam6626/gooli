import ConsultationForm from '@/components/common/consultation-form';

export default function ContactPage() {
  return (
    <main className="flex-1 bg-neutral-50 dark:bg-neutral-950 py-16">
        <div className="container-gooli flex flex-col gap-12">
          {/* Header */}
          <div className="flex flex-col gap-4 text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">Liên Hệ Với GOOLI</span>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">
              KẾT NỐI VỚI CHÚNG TÔI
            </h1>
            <div className="h-1.5 w-20 bg-brand-gold mx-auto"></div>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mt-2">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn khảo sát dự án, tư vấn thiết kế và báo giá ưu đãi trong vòng 24 giờ.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Contact Details & Map */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 flex flex-col gap-6" style={{ borderRadius: 'var(--radius-sm)' }}>
                <h2 className="text-xl font-bold uppercase tracking-tight text-neutral-900 dark:text-white">
                  Văn phòng & Nhà máy
                </h2>
                
                <div className="flex flex-col gap-4 text-sm">
                  <div className="flex items-start gap-4">
                    <span className="text-brand-gold text-lg">📍</span>
                    <div>
                      <strong className="text-neutral-900 dark:text-white block font-bold">Văn phòng giao dịch Hà Nội:</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">221 Hồ Tùng Mậu, Phường Cầu Diễn, Quận Nam Từ Liêm, Hà Nội</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <span className="text-brand-gold text-lg">🏭</span>
                    <div>
                      <strong className="text-neutral-900 dark:text-white block font-bold">Nhà máy sản xuất chính:</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">Lô 18 KCN Quang Minh, Huyện Mê Linh, TP. Hà Nội</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="text-brand-gold text-lg">📞</span>
                    <div>
                      <strong className="text-neutral-900 dark:text-white block font-bold">Điện thoại liên hệ:</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">0969.889.889 / 0981.599.011</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="text-brand-gold text-lg">✉️</span>
                    <div>
                      <strong className="text-neutral-900 dark:text-white block font-bold">Thư điện tử (Email):</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">contact@gooli.vn / support@gooli.vn</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map embed */}
              <div className="h-[350px] w-full relative border border-neutral-200 dark:border-neutral-800 overflow-hidden" style={{ borderRadius: 'var(--radius-sm)' }}>
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
            </div>

            {/* Consultation Form block */}
            <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 p-8" style={{ borderRadius: 'var(--radius-sm)' }}>
              <ConsultationForm />
            </div>
          </div>
        </div>
      </main>
  );
}
