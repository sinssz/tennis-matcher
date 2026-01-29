import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Header } from '@/components/common/Header';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Tennis Matcher - 테니스 대진표 생성',
  description: '테니스 동호회를 위한 스마트 대진표 생성 서비스',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header />
        <main className="container mx-auto py-6 px-4">{children}</main>
      </body>
    </html>
  );
}
