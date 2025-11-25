import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import { PT_Sans } from 'next/font/google'
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Alpha Insights',
  description: 'Physical evaluation and training insights powered by AI.',
};

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${ptSans.variable} font-body antialiased`}>
        <Header />
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
