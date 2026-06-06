import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductBySlug, getProducts } from '@/services/api';
import CallButton from '@/components/common/call-button';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductBySlug(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="flex-1 bg-neutral-50 py-12 dark:bg-neutral-950">
        <div className="container-gooli bg-white border border-neutral-200 p-6 md:p-12 dark:bg-neutral-900 dark:border-neutral-800 animate-reveal" style={{ borderRadius: 'var(--radius-sm)' }}>
          
          <nav className="flex gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 mb-8">
            <Link href="/" className="hover:text-brand-gold">Trang chủ</Link>
            <span>/</span>
            <Link href="/san-pham" className="hover:text-brand-gold">Sản phẩm</Link>
            <span>/</span>
            <span className="text-neutral-900 dark:text-white">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-7 relative aspect-square border border-neutral-200 overflow-hidden bg-neutral-50 dark:border-neutral-800" style={{ borderRadius: 'var(--radius-sm)' }}>
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-w-768px) 100vw, 50vw"
              />
            </div>

            <div className="md:col-span-5 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">
                  {product.category?.name || 'Vật tư xây dựng'}
                </span>
                <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">
                  {product.name}
                </h1>
              </div>

              <div className="flex justify-between items-center py-4 border-t border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <span className="text-xs text-neutral-400 uppercase font-semibold">Đơn giá vật tư</span>
                  <div className="text-3xl font-black text-brand-gold mt-1">
                    {Number(product.pricePerM2).toLocaleString('vi-VN')} đ/m²
                  </div>
                </div>
                
                <div>
                  <span className="text-xs text-neutral-400 uppercase font-semibold block text-right">Trạng thái</span>
                  <div className="mt-1">
                    {product.stock > 0 ? (
                      <span className="badge-in-stock">Còn hàng</span>
                    ) : (
                      <span className="badge-out-of-stock">Hết hàng</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-white">Mô tả sản phẩm</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {product.description || 'Chưa có mô tả cụ thể cho sản phẩm này.'}
                </p>
              </div>

              <div className="flex flex-col gap-3 mt-4">
                <CallButton
                  className="flex h-12 w-full items-center justify-center bg-brand-gold text-white text-sm font-bold uppercase tracking-wider hover:bg-brand-gold-dark transition-all duration-200"
                  style={{ borderRadius: 'var(--radius-sm)' }}
                >
                  Gọi hotline báo giá dự án: 0969.889.889
                </CallButton>
                <a
                  href={`https://zalo.me/0969889889?text=Tôi%20muốn%20nhận%20báo%20giá%20sản%20phẩm%20${encodeURIComponent(product.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-full items-center justify-center border-2 border-brand-dark text-brand-dark text-sm font-bold uppercase tracking-wider hover:bg-brand-dark hover:text-white transition-all duration-200 dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
                  style={{ borderRadius: 'var(--radius-sm)' }}
                >
                  Liên hệ qua Zalo Chat
                </a>
              </div>
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
