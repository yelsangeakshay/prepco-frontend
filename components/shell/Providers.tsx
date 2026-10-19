"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { API_MOCKING } from "@/lib/api/client";

const ApiReadyContext = createContext(!API_MOCKING);

/** False until the MSW worker is up. Feature hooks pass this as `enabled`. */
export const useApiReady = () => useContext(ApiReadyContext);

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }),
  );
  const [ready, setReady] = useState(!API_MOCKING);

  useEffect(() => {
    if (!API_MOCKING) return;
    let cancelled = false;
    import("@/mocks/browser")
      .then(({ worker }) => worker.start({ onUnhandledFrame: "bypass", quiet: true }))
      .then(() => !cancelled && setReady(true));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ApiReadyContext.Provider value={ready}>
      <QueryClientProvider client={client}>
        {children}
        <Toaster position="top-right" />
      </QueryClientProvider>
    </ApiReadyContext.Provider>
  );
}
