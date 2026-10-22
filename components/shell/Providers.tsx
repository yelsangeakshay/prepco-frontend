"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { API_MOCKING } from "@/lib/api/client";
import { NavProgress } from "./NavProgress";

// Start loading the mock worker as soon as this module runs in the browser, not after hydration.
const workerStarted: Promise<void> | null =
  API_MOCKING && typeof window !== "undefined"
    ? import("@/mocks/browser").then(async ({ worker }) => {
        await worker.start({ onUnhandledFrame: "bypass", quiet: true });
      })
    : null;

/** "failed" means the mock worker did not come up within 8 s (private window, service worker blocked). */
export type ApiStatus = "starting" | "ready" | "failed";

const API_BOOT_TIMEOUT_MS = 8000;

const ApiStatusContext = createContext<ApiStatus>(API_MOCKING ? "starting" : "ready");

// Toasts are rarely needed on first paint; keep sonner out of the initial bundle.
const Toaster = dynamic(() => import("sonner").then((m) => m.Toaster), { ssr: false });

export const useApiStatus = () => useContext(ApiStatusContext);

/** False until the MSW worker is up. Feature hooks pass this as `enabled`. */
export const useApiReady = () => useContext(ApiStatusContext) === "ready";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }),
  );
  const [status, setStatus] = useState<ApiStatus>(API_MOCKING ? "starting" : "ready");

  useEffect(() => {
    if (!API_MOCKING) return;
    let cancelled = false;
    const timeout = setTimeout(
      () => !cancelled && setStatus((s) => (s === "starting" ? "failed" : s)),
      API_BOOT_TIMEOUT_MS,
    );
    workerStarted?.then(
      () => !cancelled && setStatus("ready"),
      () => !cancelled && setStatus("failed"),
    );
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  return (
    <ApiStatusContext.Provider value={status}>
      <QueryClientProvider client={client}>
        <NavProgress />
        {children}
        <Toaster position="top-right" />
      </QueryClientProvider>
    </ApiStatusContext.Provider>
  );
}
