import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bukizz Vendor Platform',
  description: 'Sell school books, uniforms, and stationery on Bukizz',
  keywords: ['vendor', 'school supplies', 'books', 'uniforms', 'stationery'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {children}
      </body>
    </html>
  );
}
