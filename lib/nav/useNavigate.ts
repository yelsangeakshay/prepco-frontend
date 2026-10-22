"use client";

import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { isSameUrl, startNav } from "./progress";

interface NavigateOptions {
  replace?: boolean;
  scroll?: boolean;
}

/**
 * Programmatic navigation that drives the top progress bar. `pending` stays true until the next page has
 * rendered, so a submit button can stay busy through the redirect and not flip back after the request ends.
 */
export function useNavigate() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const navigate = useCallback(
    (href: string, opts: NavigateOptions = {}) => {
      if (!isSameUrl(href)) startNav();
      startTransition(() => {
        const o = opts.scroll === undefined ? undefined : { scroll: opts.scroll };
        if (opts.replace) router.replace(href, o);
        else router.push(href, o);
      });
    },
    [router],
  );

  return { navigate, pending };
}
