import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import { PT_Sans } from 'next/font/google'
import './globals.css';
import Header from '@/components/Header';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { EvaluationProvider } from '@/context/EvaluationContext';

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
        <EvaluationProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main>{children}</main>
            <Toaster />
            <ThemeToggle />
          </ThemeProvider>
        </EvaluationProvider>
      </body>
    </html>
  );
}
