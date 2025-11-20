// app/providers/SWRProvider.tsx
'use client';

import { SWRConfig } from 'swr';
import type { ReactNode } from 'react';
import { globalFetcher } from './fetcher';

export default function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: globalFetcher, // default GET
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 3000,
        shouldRetryOnError: (err) => err?.status !== 401,
      }}
    >
      {children}
    </SWRConfig>
  );
}
