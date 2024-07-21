import '@/dayjs';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { Layout } from '../components/layout';
import { Scrollable } from '../components/Scrollable';
import { PrimeReactProvider } from 'primereact/api';

import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '@/styles/app.scss';
import 'overlayscrollbars/overlayscrollbars.css';

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
        <Scrollable className="root" autoHide="scroll">
          <PrimeReactProvider>
            <AppProviders>
              <Layout>{children}</Layout>
            </AppProviders>
          </PrimeReactProvider>
          <Analytics />
        </Scrollable>
      </body>
    </html>
  );
}
