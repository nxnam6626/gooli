import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductBySlug, getProducts } from '@/services/api';
import ProductImageGallery from '@/components/product/product-image-gallery';

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
      <div className="w-full bg-neutral-50 border-b border-neutral-200" style={{ padding: '12px 0' }}>
        <div className="custom-container">
          <nav className="flex items-center text-sm text-neutral-500 uppercase tracking-wide" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

      <div className="custom-container" style={{ marginTop: '48px' }}>
        <div className="custom-grid">
          
          {/* ================= COLUMN 1: IMAGE (5/12) ================= */}
          <ProductImageGallery 
            images={[
              product.imageUrl || '/luxury_interior.png', 
              '/hero_ceiling.png', 
              '/project_clipin.png', 
              '/projects/banner_top_marble.png', 
              '/projects/project_sunshade_ams.png'
            ]} 
            productName={product.name} 
            productSku={product.sku} 
          />

          {/* ================= COLUMN 2: INFO & FORM (4/12) ================= */}
          <div className="custom-col-mid flex flex-col">
            <h1 className="text-3xl font-bold text-neutral-900 leading-tight tracking-tight" style={{ marginBottom: '16px' }}>{product.name}</h1>
            
            <div className="text-sm text-neutral-600 flex items-center" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              SKU: <span className="text-neutral-900 font-bold tracking-wide">{product.sku || 'N/A'}</span>
            </div>



            {/* Specs List */}
            <div className="border border-neutral-200 rounded-md overflow-hidden bg-white shadow-sm">
              <ul className="text-sm text-neutral-800" style={{ display: 'flex', flexDirection: 'column' }}>
                <li style={{ display: 'flex', padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
                  <span className="font-bold w-1/3" style={{ color: '#1a1a1a' }}>Kích thước:</span> 
                  <span className="w-2/3">{product.width} x {product.length} x {product.thickness}mm</span>
                </li>
                <li style={{ display: 'flex', padding: '12px 16px', backgroundColor: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                  <span className="font-bold w-1/3" style={{ color: '#1a1a1a' }}>Nhập khẩu:</span> 
                  <span className="w-2/3">Đài Loan</span>
                </li>
                <li style={{ display: 'flex', padding: '12px 16px' }}>
                  <span className="font-bold w-1/3" style={{ color: '#1a1a1a' }}>Khuyến nghị:</span> 
                  <span className="w-2/3">Sử dụng trên 10 năm</span>
                </li>
              </ul>
            </div>
          </div>

          {/* ================= COLUMN 3: SIDEBAR (3/12) ================= */}
          <div className="custom-col-right custom-sticky flex flex-col" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>            {/* Box: Báo giá & Tư vấn */}
            <div className="border border-[#bc6f21] rounded-md bg-white shadow-sm overflow-hidden sticky" style={{ top: '24px' }}>
              <div className="bg-[#bc6f21] text-white text-center font-bold uppercase text-sm tracking-widest" style={{ padding: '16px 0' }}>
                Liên hệ Báo giá
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <button className="bg-[#1a1a1a] hover:bg-black transition-colors text-white rounded-md flex items-center justify-center shadow-sm" style={{ width: '100%', height: '48px' }}>
                    <span className="text-sm font-bold uppercase tracking-wide">Yêu Cầu Báo Giá</span>
                  </button>
                  <button className="bg-transparent hover:bg-neutral-50 transition-colors text-neutral-900 border border-neutral-900 rounded-md flex items-center justify-center shadow-sm" style={{ width: '100%', height: '48px' }}>
                    <span className="text-sm font-bold uppercase tracking-wide">Gọi: 0934 119 376</span>
                  </button>
                </div>

                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wide text-center" style={{ marginBottom: '16px' }}>Hoặc để lại số điện thoại</h3>
                  <div className="relative flex border border-neutral-300 rounded-md bg-white overflow-hidden shadow-sm hover:border-[#bc6f21] transition-colors" style={{ display: 'flex' }}>
                    <input type="text" placeholder="Số ĐT của bạn..." className="outline-none text-sm text-neutral-800" style={{ flex: 1, padding: '12px', minWidth: '0' }} />
                    <button className="font-bold text-white bg-[#bc6f21] hover:bg-[#a65d1b] transition-colors text-sm uppercase tracking-widest" style={{ padding: '0 16px' }}>
                      Gửi
                    </button>
                  </div>
                </div>
              </div>
            </div>


            {/* Box 3: Sản Phẩm Đã Xem */}
            <div className="border border-neutral-200 rounded-md bg-white shadow-sm overflow-hidden">
              <div className="bg-[#1a1a1a] text-white text-center font-bold uppercase text-sm tracking-widest" style={{ padding: '12px 0' }}>
                Sản phẩm đã xem
              </div>
              <div style={{ padding: '16px' }}>
                <Link href="#" className="flex items-center group" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className="relative bg-neutral-100 shrink-0 rounded-md overflow-hidden border border-neutral-200" style={{ width: '64px', height: '64px' }}>
                    <Image src="/luxury_interior.png" alt="Recent" fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-800 group-hover:text-[#bc6f21] transition-colors leading-tight" style={{ marginBottom: '4px' }}>{product.name}</h4>
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
                    <svg style={{ width: '14px', height: '14px', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
                    Nhận Báo Giá
                  </button>
                  

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
