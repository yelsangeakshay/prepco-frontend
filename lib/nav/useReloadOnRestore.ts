"use client";

import { useEffect } from "react";

/**
 * Back/forward can restore a full-page load from the browser's cache with a frozen spinner and stale
 * form state. Reloading re-runs the auth guard, so a user who has since signed in is sent home.
 */
export function useReloadOnRestore() {
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);
}
