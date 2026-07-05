import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

// Font Outfit: hiện đại, sạch sẽ, phù hợp thương hiệu vật liệu xây dựng
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap', // Tối ưu CLS - hiển thị fallback font trong khi tải
});

export const metadata: Metadata = {
  title: {
    default: 'GOOLI - Chuyên gia Trần Nhôm & Vật liệu Xây dựng',
    template: '%s | GOOLI',
  },
  description:
    'Công ty TNHH Thương mại Sản xuất GOOLI - Chuyên cung cấp và lắp đặt trần nhôm, linh phụ kiện xây dựng chất lượng cao. Báo giá trần nhôm, thi công chuyên nghiệp.',
  keywords: [
    'trần nhôm',
    'linh phụ kiện xây dựng',
    'GOOLI',
    'thi công trần nhôm',
  ],
  metadataBase: new URL('https://gooli.vn'),
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://gooli.vn',
    siteName: 'GOOLI',
    title: 'GOOLI - Chuyên gia Trần Nhôm & Vật liệu Xây dựng',
    description:
      'Chuyên cung cấp và lắp đặt trần nhôm, linh phụ kiện xây dựng chất lượng cao.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${outfit.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
