import './globals.css';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'PWKfastwork - แพลตฟอร์มหางานและอาชีพสำหรับ 4 บทบาท',
  description:
    'เว็บไซต์หางาน PWKfastwork สำหรับผู้หางาน บริษัท มหาวิทยาลัย และผู้ดูแลระบบ ครบครันด้วยระบบจัดการสิทธิ์ ติดตามผลการสมัคร และสถิติการมีงานทำ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
