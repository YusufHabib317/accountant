'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes';
import {
  QueryClient,
  QueryClientProvider,
  Hydrate,
} from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToast } from '@/components/ui/sonner';

function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({
  children,
}: Readonly<ProvidersProps>) {
  const [queryClient] = React.useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 0,
          refetchOnWindowFocus: true,
          // refetchInterval: 60000,
          retry: 3,
          refetchIntervalInBackground: false,
          refetchOnReconnect: true,
          keepPreviousData: true,
        },
      },
    }),
  );
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <Hydrate>
          <Toaster />
          <SonnerToast />
          {children}
        </Hydrate>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
