'use client';

import './globals.css';
import { Providers } from './providers';
import { SessionProvider } from 'next-auth/react';
import { MainLayout } from './MainLayout';

export default function RootLayout({ children, session }: any) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SessionProvider session={session}>
            <MainLayout>{children}</MainLayout>
          </SessionProvider>
        </Providers>
      </body>
    </html>
  );
}
