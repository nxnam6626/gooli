import Image from 'next/image';

export default function AboutPage() {
  return (
    <main className="flex-1 bg-neutral-50 dark:bg-neutral-950 py-16">
        <div className="container-gooli flex flex-col gap-16">
          {/* Header Section */}
          <div className="flex flex-col gap-4 text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">Về Chúng Tôi</span>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">
              GOOLI VIỆT NAM
            </h1>
            <div className="h-1.5 w-20 bg-brand-gold mx-auto"></div>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg leading-relaxed mt-2">
              Kiến tạo giải pháp kiến trúc trần nhôm và tấm ốp mặt dựng hàng đầu, nâng tầm giá trị thẩm mỹ và độ bền vững cho mọi công trình hiện đại.
            </p>
          </div>

          {/* Intro Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 md:p-12" style={{ borderRadius: 'var(--radius-sm)' }}>
            <div className="relative aspect-[16/10] w-full overflow-hidden border border-neutral-150 dark:border-neutral-800" style={{ borderRadius: 'var(--radius-sm)' }}>
              <Image 
                src="/project_clipin.png" 
                alt="Thi công trần nhôm Gooli thực tế" 
                fill 
                className="object-cover hover:scale-105 transition-transform duration-700"
                sizes="(max-w-768px) 100vw, 50vw"
              />
            </div>
            
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-bold uppercase tracking-tight text-neutral-900 dark:text-white">
                Tầm Nhìn & Sứ Mệnh
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
                GOOLI ra đời với sứ mệnh mang đến cho thị trường xây dựng Việt Nam những sản phẩm trần nhôm, tấm ốp alu và hệ xương cá phụ kiện treo đồng bộ đạt tiêu chuẩn quốc tế. Chúng tôi luôn cải tiến công nghệ sản xuất, tối ưu hóa thiết kế nhằm đáp ứng các yêu cầu khắt khe về cách âm, cách nhiệt và độ chống oxy hóa cao.
              </p>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
                Tầm nhìn của chúng tôi là trở thành biểu tượng hàng đầu về giải pháp hoàn thiện mặt đứng và trần nhà kim loại, đồng hành cùng các nhà thầu lớn kiến tạo nên những đại công trình biểu tượng của đất nước.
              </p>
            </div>
          </div>

          {/* Core Values */}
          <div className="flex flex-col gap-10">
            <h2 className="text-3xl font-black uppercase text-center tracking-tight text-neutral-900 dark:text-white">
              Giá Trị Cốt Lõi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Chất Lượng Tiên Phong',
                  desc: 'Mọi sản phẩm của GOOLI đều tuân thủ quy trình kiểm định chất lượng chặt chẽ từ phôi nhôm đầu vào đến hệ sơn phủ tĩnh điện bề mặt đạt chuẩn quốc tế.'
                },
                {
                  title: 'Giải Pháp Đồng Bộ',
                  desc: 'Chúng tôi không chỉ bán sản phẩm đơn lẻ mà cung cấp trọn gói từ khâu tư vấn thiết kế, sản xuất hệ xương treo đồng bộ đến hướng dẫn thi công thực tế.'
                },
                {
                  title: 'Tận Tâm Đồng Hành',
                  desc: 'GOOLI cam kết đồng hành dài lâu cùng mọi đối tác nhà thầu với chế độ bảo hành sản phẩm uy tín, giao hàng nhanh chóng và hỗ trợ kỹ thuật 24/7.'
                }
              ].map((val, idx) => (
                <div key={idx} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 hover:border-brand-gold transition-colors duration-300" style={{ borderRadius: 'var(--radius-sm)' }}>
                  <div className="text-brand-gold text-2xl font-black mb-4">0{idx + 1}</div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white uppercase mb-2">{val.title}</h3>
                  <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
  );
}
