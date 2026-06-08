import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductBySlug, getProducts } from '@/services/api';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const { id } = await params;
  
  // Lấy dữ liệu thật từ DB, nếu không có thì fallback hoặc lấy mock
  let dbProduct = await getProductBySlug(id).catch(() => null);

  let product: any;
  // Fallback mock data in case DB is unreachable
  if (dbProduct) {
    product = dbProduct;
  } else {
    if (id === 'lam-song-ngoai-troi-hh-wood') {
      product = {
        id: 999,
        name: 'Lam sóng ngoài trời - HH Wood',
        slug: 'lam-song-ngoai-troi-hh-wood',
        sku: 'HH Wood',
        pricePerM2: 0,
        imageUrl: '/luxury_interior.png',
        description: 'Vật liệu trang trí ngoại thất hiện đại, được sản xuất từ nhựa tổng hợp cao cấp hoặc gỗ nhựa composite.',
        category: { name: 'Lam sóng ngoài trời' },
        stock: 100,
        width: 220,
        length: 2900,
        thickness: 26,
      };
    } else {
      product = {
        id: 1,
        name: id.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
        slug: id,
        sku: id.toUpperCase().slice(0, 8),
        pricePerM2: 0,
        imageUrl: '/luxury_interior.png',
        description: 'Vật liệu trang trí cao cấp.',
        category: { name: 'Vật tư xây dựng' },
        stock: 50,
        width: 220,
        length: 2900,
        thickness: 26,
      };
    }
  }

  const categoryName = product?.category?.name?.toUpperCase() || 'LAM GỖ NHỰA NGOÀI TRỜI';

  return (
    <main className="flex-1 bg-white min-h-screen pb-20">
      {/* Injecting custom CSS to bypass Tailwind JIT cache missing new classes */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-container { width: 100%; max-width: 1280px; margin: 0 auto; padding: 0 24px; }
        .custom-grid { display: flex; flex-direction: column; gap: 32px; align-items: flex-start; }
        .custom-col-left { width: 100%; }
        .custom-col-mid { width: 100%; }
        .custom-col-right { width: 100%; }
        .custom-related-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        
        @media (min-width: 768px) {
          .custom-related-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; }
        }
        @media (min-width: 1024px) {
          .custom-grid { display: grid; grid-template-columns: 5fr 4fr 3fr; gap: 32px; }
          .custom-col-left, .custom-col-mid, .custom-col-right { width: auto; }
          .custom-sticky { position: sticky; top: 32px; }
          .custom-related-grid { grid-template-columns: repeat(5, 1fr); gap: 16px; }
        }
        .custom-rp-card { background-color: white; border: 1px solid #e5e5e5; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.03); transition: all 0.2s ease; cursor: pointer; }
        .custom-rp-card:hover { border-color: #bc6f21; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .custom-rp-btn { width: 100%; border: 1px solid #1a1a1a; border-radius: 4px; padding: 10px; font-size: 13px; color: #1a1a1a; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 16px; background-color: transparent; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.5px; }
        .custom-rp-btn:hover { background-color: #1a1a1a; color: white; }
      `}} />

      {/* Breadcrumb Bar */}
      <div className="w-full bg-neutral-50 border-b border-neutral-200">
        <div className="custom-container py-3">
          <nav className="flex items-center gap-2 text-sm text-neutral-500 uppercase tracking-wide">
            <Link href="/" className="hover:text-[#bc6f21] transition-colors">Trang chủ</Link>
            <span>/</span>
            <Link href="/san-pham" className="hover:text-[#bc6f21] transition-colors">Sản phẩm</Link>
            <span>/</span>
            <Link href="/san-pham" className="hover:text-[#bc6f21] transition-colors">{categoryName}</Link>
            <span>/</span>
            <span className="text-neutral-800 font-bold">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="custom-container mt-8">
        <div className="custom-grid">
          
          {/* ================= COLUMN 1: IMAGE (5/12) ================= */}
          <div className="custom-col-left flex flex-col gap-4">
            <div className="relative aspect-square w-full bg-neutral-100 rounded-md overflow-hidden border border-neutral-200 shadow-sm" style={{ aspectRatio: '1 / 1' }}>
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              
              {/* Top Right Tag */}
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md text-neutral-900 text-sm font-black px-4 py-2 rounded-sm shadow-sm text-center leading-tight flex flex-col items-center">
                <span className="text-xs uppercase tracking-widest font-semibold text-neutral-500">Ngoài trời</span>
                <span className="text-base">{product.sku || 'HH-Wood'}</span>
              </div>

              {/* Bottom Left Logo */}
              <div className="absolute bottom-4 left-4 bg-[#bc6f21] w-16 h-16 rounded-md shadow-sm flex items-center justify-center p-2">
                <div className="text-center text-white">
                  <svg className="w-6 h-6 mx-auto mb-1 fill-current" viewBox="0 0 24 24"><path d="M12 3L2 12h3v8h14v-8h3L12 3zm-1 15h-2v-4h2v4zm4 0h-2v-4h2v4z"/></svg>
                  <span className="font-bold block leading-none" style={{ fontSize: '8px' }}>HÙNG HƯNG</span>
                </div>
              </div>
            </div>

            {/* Social Share Icons */}
            <div className="flex items-center gap-2 mt-4">
              <button className="w-9 h-9 rounded-md border border-neutral-300 text-neutral-600 flex items-center justify-center hover:bg-neutral-100 hover:text-neutral-900 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5.01 3.66 9.15 8.44 9.9v-7.03H7.9v-2.87h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.87h-2.34v7.03C18.34 21.2 22 17.06 22 12.06c0-5.53-4.5-10.02-10-10.02z"/></svg>
              </button>
              <button className="w-9 h-9 rounded-md border border-neutral-300 text-neutral-600 flex items-center justify-center hover:bg-neutral-100 hover:text-neutral-900 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M16.5 6.5h-9v11h9v-11z M12 16.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              </button>
              <button className="w-9 h-9 rounded-md border border-neutral-300 text-neutral-600 flex items-center justify-center hover:bg-neutral-100 hover:text-neutral-900 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
              </button>
              <button className="w-9 h-9 rounded-md border border-neutral-300 text-neutral-600 flex items-center justify-center hover:bg-neutral-100 hover:text-neutral-900 transition-colors text-xs font-bold uppercase">
                Zalo
              </button>
              <button className="w-9 h-9 rounded-md border border-neutral-300 text-neutral-600 flex items-center justify-center hover:bg-neutral-100 hover:text-neutral-900 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M3 3h8v8H3zm2 2v4h4V5zM3 13h8v8H3zm2 2v4h4v-4zM13 3h8v8h-8zm2 2v4h4V5zM13 13h2v2h-2zm2 2h2v2h-2zm2-2h2v2h-2zm0 4h2v2h-2zm-4 0h2v2h-2z"/></svg>
              </button>
            </div>
          </div>

          {/* ================= COLUMN 2: INFO & FORM (4/12) ================= */}
          <div className="custom-col-mid flex flex-col">
            <h1 className="text-3xl font-bold text-neutral-900 mb-3 leading-tight tracking-tight">{product.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-4 h-4 text-[#bc6f21] fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              ))}
              <span className="text-sm text-neutral-600 ml-2 font-medium">( 5 đánh giá )</span>
            </div>

            <div className="text-sm text-neutral-600 mb-6 flex items-center gap-2">
              SKU: <span className="text-neutral-900 font-bold tracking-wide">{product.sku || 'N/A'}</span>
            </div>

            <div className="text-2xl font-bold text-[#bc6f21] mb-8">Liên hệ</div>

            {/* Actions */}
            <div className="flex items-center gap-4 mb-8 border-b border-neutral-100 pb-8">
              <div className="flex items-center border border-neutral-300 rounded-md overflow-hidden h-12 bg-white">
                <button className="w-12 h-full flex items-center justify-center text-neutral-600 font-bold hover:bg-neutral-100 transition-colors">−</button>
                <div className="w-12 h-full flex items-center justify-center text-sm font-medium border-x border-neutral-300">1</div>
                <button className="w-12 h-full flex items-center justify-center text-neutral-600 font-bold hover:bg-neutral-100 transition-colors">+</button>
              </div>
              <button className="flex-1 bg-neutral-900 hover:bg-black transition-colors text-white rounded-md flex flex-col items-center justify-center h-12 px-2 shadow-sm">
                <span className="text-sm font-bold uppercase tracking-wide">Thêm vào giỏ</span>
              </button>
              <button className="flex-1 bg-[#bc6f21] hover:bg-[#a65d1b] transition-colors text-white rounded-md flex flex-col items-center justify-center h-12 px-2 shadow-sm">
                <span className="text-sm font-bold uppercase tracking-wide">Mua Ngay</span>
              </button>
            </div>

            {/* Consultation Form */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-neutral-900 uppercase mb-3 tracking-wide">Nhận tư vấn thiết kế</h3>
              <div className="relative">
                <div className="relative flex border border-neutral-300 rounded-md bg-white overflow-hidden shadow-sm hover:border-[#bc6f21] transition-colors">
                  <input type="text" placeholder="Số điện thoại của bạn" className="flex-1 px-4 py-3 outline-none text-sm text-neutral-800" />
                  <button className="px-6 font-bold text-white bg-[#bc6f21] hover:bg-[#a65d1b] transition-colors text-sm uppercase tracking-widest">
                    Gửi
                  </button>
                </div>
              </div>
            </div>

            {/* Specs List */}
            <ul className="flex flex-col gap-3 text-sm text-neutral-800">
              <li><span className="font-bold">Tên sản phẩm:</span> {product.name}</li>
              <li><span className="font-bold">Mã sản phẩm:</span> {product.sku || 'HH Wood'}</li>
              <li><span className="font-bold">Kích thước:</span> {product.width} x {product.length} x {product.thickness}mm</li>
              <li><span className="font-bold">Nhập khẩu:</span> Đài Loan</li>
              <li><span className="font-bold">Khuyến nghị:</span> sử dụng trên 10 năm.</li>
            </ul>
          </div>

          {/* ================= COLUMN 3: SIDEBAR (3/12) ================= */}
          <div className="custom-col-right custom-sticky flex flex-col gap-6">
            
            {/* Box 1: Cam kết */}
            <div className="border border-neutral-200 rounded-md bg-white shadow-sm overflow-hidden">
              <div className="bg-[#1a1a1a] text-white text-center font-bold uppercase py-3 text-sm tracking-widest">
                Cam kết của Hùng Hưng
              </div>
              <div className="p-5 flex flex-col gap-5">
                <div className="flex gap-4 items-start">
                  <div className="text-neutral-800 pt-1">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-neutral-900 uppercase mb-0.5">Vận chuyển</div>
                    <div className="text-xs text-neutral-500">Giao hàng toàn quốc</div>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="text-neutral-800 pt-1">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-neutral-900 uppercase mb-0.5">Chính sách bảo hành</div>
                    <div className="text-xs text-neutral-500">Bảo hành lên đến 24 tháng</div>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="text-neutral-800 pt-1">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-neutral-900 uppercase mb-0.5">Hỗ trợ 24/7</div>
                    <div className="text-xs text-neutral-500">Hotline: 0934 119 376</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Hỗ trợ 24/24 */}
            <div className="border border-neutral-200 rounded-md bg-white shadow-sm overflow-hidden text-center">
              <div className="bg-[#1a1a1a] text-white font-bold uppercase py-3 text-sm tracking-widest">
                Hỗ trợ 24/24
              </div>
              <div className="p-6">
                <div className="w-16 h-16 mx-auto mb-4 text-[#bc6f21] bg-neutral-50 rounded-full flex items-center justify-center border border-neutral-100">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/><path d="M15 12h2.26c-.45-1.12-1.2-2.08-2.14-2.79l-1.42 1.42C14.36 11 14.73 11.47 15 12zM9 12H6.74c.45-1.12 1.2-2.08 2.14-2.79l1.42 1.42C9.64 11 9.27 11.47 9 12z"/></svg>
                </div>
                <p className="text-xs text-neutral-500 mb-2 uppercase tracking-wide">Để được hỗ trợ tốt nhất. Hãy gọi</p>
                <div className="text-2xl font-black text-neutral-900 mb-4 tracking-tight">0934 119 376</div>
                <div className="flex items-center gap-2 text-neutral-300 text-xs mb-4">
                  <div className="flex-1 h-px bg-neutral-200"></div>
                  <span className="text-neutral-400">HOẶC</span>
                  <div className="flex-1 h-px bg-neutral-200"></div>
                </div>
                <p className="text-xs text-neutral-500 mb-4 uppercase tracking-wide">hỗ trợ trực tuyến</p>
                <button className="w-full border border-neutral-300 text-neutral-800 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-colors rounded-sm">
                  Liên hệ ngay
                </button>
              </div>
            </div>

            {/* Box 3: Sản Phẩm Đã Xem */}
            <div className="border border-neutral-200 rounded-md bg-white shadow-sm overflow-hidden">
              <div className="bg-[#1a1a1a] text-white text-center font-bold uppercase py-3 text-sm tracking-widest">
                Sản phẩm đã xem
              </div>
              <div className="p-4">
                <Link href="#" className="flex gap-4 items-center group">
                  <div className="w-16 h-16 relative bg-neutral-100 shrink-0 rounded-md overflow-hidden border border-neutral-200">
                    <Image src="/luxury_interior.png" alt="Recent" fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-800 group-hover:text-[#bc6f21] transition-colors leading-tight mb-1">{product.name}</h4>
                    <div className="text-sm font-bold text-[#bc6f21]">Liên hệ</div>
                  </div>
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* ================= BOTTOM TABS & CONTENT ================= */}
        <div style={{ marginTop: '64px', width: '100%' }}>
          <div style={{ display: 'inline-block', backgroundColor: '#1a1a1a', color: 'white', fontWeight: 'bold', padding: '12px 32px', borderRadius: '6px', marginBottom: '24px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Nội dung Chi Tiết
          </div>
          
          <div style={{ backgroundColor: 'white', border: '1px solid #e5e5e5', borderRadius: '6px', padding: '40px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '20px', lineHeight: '1.3' }}>1. Lam Sóng Ngoài Trời Là Gì?</h2>
            
            <div style={{ fontSize: '15px', color: '#4a4a4a', lineHeight: '1.7' }}>
              <p style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#1a1a1a' }}>Lam Sóng Ngoài Trời</strong> là vật liệu trang trí ngoại thất hiện đại, được sản xuất từ nhựa tổng hợp cao cấp hoặc gỗ nhựa composite. Sản phẩm có thiết kế dạng sóng độc đáo, tạo điểm nhấn thẩm mỹ cho các khu vực như mặt tiền, hiên nhà, hàng rào, hoặc khu vực sân vườn.
              </p>
              <p style={{ marginBottom: '32px' }}>
                Với khả năng chống chịu tốt trước các điều kiện khắc nghiệt như mưa, nắng, nhiệt độ cao, <strong style={{ color: '#1a1a1a' }}>Lam Sóng Ngoài Trời</strong> ngày càng được ưa chuộng trong trang trí ngoại thất.
              </p>
              
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', backgroundColor: '#f5f5f5', borderRadius: '6px', overflow: 'hidden', marginBottom: '40px', border: '1px solid #e5e5e5' }}>
                 <Image src="/luxury_interior.png" alt="Lam sóng" fill className="object-cover" />
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '20px', lineHeight: '1.3' }}>2. Ưu Điểm Nổi Bật Của Lam Sóng Ngoài Trời</h2>
              <div style={{ marginBottom: '32px' }}>
                 <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '6px' }}>2.1. Chống Nước Và Chịu Mọi Thời Tiết</h3>
                 <p style={{ marginBottom: '16px' }}><strong style={{ color: '#1a1a1a' }}>Lam Sóng Ngoài Trời</strong> được thiết kế để chịu được tác động từ mưa, ánh nắng mặt trời và độ ẩm cao. Sản phẩm không bị cong vênh, mối mọt hay phai màu dù sử dụng trong thời gian dài.</p>
                 
                 <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '6px' }}>2.2. Tính Thẩm Mỹ Cao</h3>
                 <p style={{ marginBottom: '16px' }}>Với kiểu dáng dạng sóng độc đáo cùng màu sắc và họa tiết đa dạng, <strong style={{ color: '#1a1a1a' }}>Lam Sóng Ngoài Trời</strong> không chỉ bảo vệ mà còn làm tăng giá trị thẩm mỹ cho không gian ngoại thất.</p>
                 
                 <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '6px' }}>2.3. Độ Bền Vượt Trội</h3>
                 <p style={{ marginBottom: '16px' }}>Sản phẩm có tuổi thọ cao, khả năng chống chịu va đập tốt, không bị ảnh hưởng bởi các yếu tố như nhiệt độ hay độ ẩm.</p>
                 
                 <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '6px' }}>2.4. Thân Thiện Với Môi Trường</h3>
                 <p style={{ marginBottom: '16px' }}><strong style={{ color: '#1a1a1a' }}>Lam Sóng Ngoài Trời</strong> làm từ vật liệu tái chế, không chứa hóa chất độc hại, an toàn cho người dùng và môi trường xung quanh.</p>
                 
                 <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '6px' }}>2.5. Dễ Dàng Lắp Đặt</h3>
                 <p style={{ marginBottom: '16px' }}>Với thiết kế nhẹ và dễ thi công, <strong style={{ color: '#1a1a1a' }}>Lam Sóng Ngoài Trời</strong> giúp tiết kiệm thời gian và chi phí lắp đặt.</p>
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '20px', lineHeight: '1.3' }}>3. Ứng Dụng Của Lam Sóng Ngoài Trời</h2>
              <div style={{ marginBottom: '32px' }}>
                 <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '6px' }}>3.1. Trang Trí Mặt Tiền</h3>
                 <p style={{ marginBottom: '16px' }}>Lam Sóng Ngoài Trời thường được sử dụng để ốp mặt tiền nhà, tạo vẻ ngoài sang trọng, hiện đại.</p>

                 <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '6px' }}>3.2. Làm Hàng Rào Trang Trí</h3>
                 <p style={{ marginBottom: '16px' }}>Các hàng rào sử dụng <strong style={{ color: '#1a1a1a' }}>Lam Sóng Ngoài Trời</strong> không chỉ bền mà còn mang tính thẩm mỹ cao, phù hợp với mọi phong cách kiến trúc.</p>
                 
                 <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '6px' }}>3.3. Tạo Điểm Nhấn Ở Sân Vườn</h3>
                 <p style={{ marginBottom: '16px' }}><strong style={{ color: '#1a1a1a' }}>Lam Sóng Ngoài Trời</strong> có thể dùng để trang trí các tiểu cảnh, mái che hoặc làm vách ngăn trong khu vực sân vườn.</p>

                 <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '6px' }}>3.4. Trang Trí Hồ Bơi Và Khu Vực Ngoài Trời Khác</h3>
                 <p style={{ marginBottom: '16px' }}>Sản phẩm là lựa chọn lý tưởng cho các khu vực ngoài trời thường xuyên tiếp xúc với nước như hồ bơi hay bể tiểu cảnh.</p>
              </div>

              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', backgroundColor: '#f5f5f5', borderRadius: '6px', overflow: 'hidden', marginBottom: '40px', border: '1px solid #e5e5e5' }}>
                 <Image src="/luxury_interior.png" alt="Lam sóng" fill className="object-cover" />
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '20px', lineHeight: '1.3' }}>4. Chất Lượng Sản Phẩm Lam Sóng Ngoài Trời</h2>
              <p style={{ marginBottom: '16px' }}>Tất cả sản phẩm Lam Sóng Ngoài Trời của chúng tôi đều được kiểm tra chất lượng nghiêm ngặt, đảm bảo các tiêu chí:</p>
              <ul style={{ paddingLeft: '24px', listStyleType: 'disc', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><strong style={{ color: '#1a1a1a' }}>Bề mặt hoàn thiện:</strong> Mịn, không bong tróc, màu sắc đồng đều.</li>
                <li><strong style={{ color: '#1a1a1a' }}>Khả năng chống chịu:</strong> Không bị biến dạng khi tiếp xúc với nhiệt độ cao hoặc mưa lớn.</li>
                <li><strong style={{ color: '#1a1a1a' }}>Độ bền màu:</strong> Giữ được màu sắc ban đầu sau nhiều năm sử dụng.</li>
                <li><strong style={{ color: '#1a1a1a' }}>Đa dạng mẫu mã:</strong> Từ phong cách tối giản đến hiện đại, đáp ứng mọi nhu cầu của khách hàng.</li>
              </ul>

              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '20px', lineHeight: '1.3' }}>5. Dịch Vụ Cung Cấp Lam Sóng Ngoài Trời</h2>
              <div style={{ marginBottom: '32px' }}>
                 <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '6px' }}>5.1. Tư Vấn Miễn Phí</h3>
                 <p style={{ marginBottom: '16px' }}>Chúng tôi hỗ trợ tư vấn chuyên sâu về sản phẩm, giúp bạn lựa chọn mẫu Lam Sóng Ngoài Trời phù hợp nhất.</p>
                 
                 <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '6px' }}>5.2. Hỗ Trợ Giao Hàng Nhanh Chóng</h3>
                 <p style={{ marginBottom: '16px' }}>Dịch vụ giao hàng trên toàn quốc, đảm bảo sản phẩm đến tay khách hàng trong thời gian ngắn nhất.</p>
                 
                 <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '6px' }}>5.3. Thi Công Chuyên Nghiệp</h3>
                 <p style={{ marginBottom: '16px' }}>Đội ngũ thi công giàu kinh nghiệm sẽ đảm bảo <a href="#" style={{ color: '#bc6f21', textDecoration: 'underline' }}>lam sóng ngoài trời</a> được lắp đặt chuẩn xác và bền vững.</p>
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '20px', lineHeight: '1.3' }}>6. Cách Lựa Chọn Lam Sóng Ngoài Trời Phù Hợp</h2>
              <div style={{ marginBottom: '32px' }}>
                 <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '6px' }}>6.1. Chú Ý Đến Chất Liệu</h3>
                 <p style={{ marginBottom: '16px' }}>Hãy chọn loại Lam Sóng Ngoài Trời được làm từ chất liệu nhựa composite hoặc gỗ nhựa để đảm bảo độ bền cao nhất.</p>
                 
                 <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '6px' }}>6.2. Phù Hợp Với Không Gian Sử Dụng</h3>
                 <p style={{ marginBottom: '16px' }}>Dựa vào phong cách thiết kế ngoại thất để chọn màu sắc và kiểu dáng phù hợp.</p>
                 
                 <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '6px' }}>6.3. Chọn Đơn Vị Cung Cấp Uy Tín</h3>
                 <p style={{ marginBottom: '16px' }}>Hãy đảm bảo bạn mua sản phẩm từ các nhà cung cấp uy tín để tránh mua phải hàng kém chất lượng.</p>
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '20px', lineHeight: '1.3' }}>7. Báo Giá Lam Sóng Ngoài Trời</h2>
              <p style={{ marginBottom: '16px' }}>Giá của <strong style={{ color: '#1a1a1a' }}>lam sóng ngoài trời</strong> thay đổi tùy thuộc vào mẫu mã, kích thước và số lượng đơn hàng. Để nhận báo giá chi tiết, vui lòng liên hệ qua hotline hoặc email của chúng tôi.</p>
            </div>
          </div>
        </div>

        {/* ================= RELATED PRODUCTS ================= */}
        <div style={{ marginTop: '64px', marginBottom: '64px' }}>
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
                    <svg style={{ width: '14px', height: '14px', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                    Mua Ngay
                  </button>
                  
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} style={{ width: '14px', height: '14px', color: '#bc6f21', fill: 'currentColor' }} viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}

export async function generateStaticParams() {
  try {
    const productsData = await getProducts({ limit: 100 });
    return productsData.items.map((prod) => ({
      id: prod.slug,
    }));
  } catch (error) {
    console.error('generateStaticParams error:', error);
    return [];
  }
}
