'use client';

import { getCsrfToken, signOut } from 'next-auth/react';
import { DynamicContextProvider } from '../lib/dynamic';
import { EthereumWalletConnectors } from '../lib/dynamic';

export default function ProviderWrapper({ children }: React.PropsWithChildren) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID!,
        walletConnectors: [EthereumWalletConnectors],
        events: {
          onAuthSuccess: async (event) => {
            const { authToken } = event;

            const csrfToken = await getCsrfToken();

            fetch('/api/auth/callback/credentials', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: `csrfToken=${encodeURIComponent(
                csrfToken!,
              )}&token=${encodeURIComponent(authToken)}`,
            })
              .then((res) => {
                if (res.ok) {
                  window.location.reload();
                  // Handle success - maybe redirect to the home page or user dashboard
                } else {
                  // Handle any errors - maybe show an error message to the user
                  console.error('Failed to log in');
                }
              })
              .catch((error) => {
                // Handle any exceptions
                console.error('Error logging in', error);
              });
          },
          onLogout: async () => {
            await signOut();
          },
        },
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
