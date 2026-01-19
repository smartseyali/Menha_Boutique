"use client";

import { SWRConfig } from 'swr';

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        // Revalidate on focus - but with a longer interval
        revalidateOnFocus: false,
        // Revalidate on reconnect
        revalidateOnReconnect: true,
        // Don't revalidate on mount if data exists in cache
        revalidateIfStale: true,
        // Dedupe requests - if the same request is made multiple times, only fetch once
        dedupingInterval: 2000,
        // Focus throttle - wait 5 seconds before revalidating on focus
        focusThrottleInterval: 5000,
        // Error retry configuration
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        // Provider configuration for better caching
        provider: () => new Map(),
      }}
    >
      {children}
    </SWRConfig>
  );
}

