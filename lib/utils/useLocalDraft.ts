"use client";

import { useCallback, useState } from "react";

/** Draft text that survives a reload. Storage can be blocked, so every access is guarded. */
export function useLocalDraft(key: string) {
  const [stored, setStored] = useState<string | null>(() => {
    try {
      return typeof window === "undefined" ? null : window.localStorage.getItem(key);
    } catch {
      return null;
    }
  });

  const save = useCallback(
    (value: string) => {
      setStored(value);
      try {
        window.localStorage.setItem(key, value);
      } catch {
        /* storage unavailable: the draft just won't persist */
      }
    },
    [key],
  );

  const clear = useCallback(() => {
    setStored(null);
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }, [key]);

  return { stored, save, clear };
}
