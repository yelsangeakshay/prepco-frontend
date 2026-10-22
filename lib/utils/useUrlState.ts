"use client";

import { useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useNavigate } from "@/lib/nav/useNavigate";

/** List filters, sort, search and page live in the URL. Setting a key to "" or null removes it. */
export function useUrlState() {
  const { navigate } = useNavigate();
  const pathname = usePathname();
  const params = useSearchParams();

  const set = useCallback(
    (
      patch: Record<string, string | number | null | undefined>,
      opts: { resetPage?: boolean } = {},
    ) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === undefined || v === "") next.delete(k);
        else next.set(k, String(v));
      }
      if (opts.resetPage) next.delete("page");
      const qs = next.toString();
      navigate(qs ? `${pathname}?${qs}` : pathname, { replace: true, scroll: false });
    },
    [params, pathname, navigate],
  );

  return { params, set };
}
