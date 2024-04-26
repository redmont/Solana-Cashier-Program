'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider } from '@chakra-ui/react';
import axios, { ResponseType } from 'axios';
import theme from '@/theme';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey: [url, responseType] }) => {
        if (typeof url === 'string') {
          const { data } = await axios.get(`${baseUrl}/${url.toLowerCase()}`, {
            responseType: (responseType as ResponseType) ?? undefined,
          });

          if (responseType === 'blob') {
            return new Blob([data]);
          }

          return data;
        }
        throw new Error('Invalid QueryKey');
      },
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
    </QueryClientProvider>
  );
}
