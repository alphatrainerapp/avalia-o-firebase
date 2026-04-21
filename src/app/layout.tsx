import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import { PT_Sans } from 'next/font/google'
import './globals.css';
import Header from '@/components/Header';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { EvaluationProvider } from '@/context/EvaluationContext';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';

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
            <SidebarProvider defaultOpen={false}>
              <AppSidebar />
              <SidebarInset className="flex flex-col">
                <Header />
                <main className="flex-1 overflow-auto">{children}</main>
                <Toaster />
                <ThemeToggle />
              </SidebarInset>
            </SidebarProvider>
          </ThemeProvider>
        </EvaluationProvider>
      </body>
    </html>
  );
}
