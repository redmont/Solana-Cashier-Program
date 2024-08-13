import '@/dayjs';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { Layout } from '../components/layout';
import { Toaster } from '@/components/ui/toaster';

import 'primeicons/primeicons.css';
import '@/styles/app.scss';

import { AppProviders } from '@/providers';

export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
});

export const metadata: Metadata = {
  title: 'Brawlers',
  description: 'Brawlers: Frogs vs Dogs',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={plusJakartaSans.className}>
        <AppProviders>
          <Layout>{children}</Layout>
          <Toaster />
        </AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
