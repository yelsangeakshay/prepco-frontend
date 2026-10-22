"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { resolveUrl, startNav, stopNav, useNavRunning } from "@/lib/nav/progress";

const SHOW_AFTER_MS = 150;
const MIN_VISIBLE_MS = 300;

/** Stops the bar when the URL (path or query) changes, and starts it for link clicks and back/forward. */
function UrlWatcher() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const current = useRef("");

  useEffect(() => {
    current.current = pathname + (search ? `?${search}` : "");
    stopNav();
  }, [pathname, search]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      // Next's Link calls preventDefault when it handles the navigation itself.
      if (!e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const to = resolveUrl(a.href);
      if (to && to !== current.current) startNav();
    };
    const onPop = () => {
      if (window.location.pathname + window.location.search !== current.current) startNav();
    };
    document.addEventListener("click", onClick);
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  return null;
}

/** 2 px bar under the top edge. Appears only if a navigation takes over 150 ms, then stays at least 300 ms. */
function Bar() {
  const running = useNavRunning();
  const [phase, setPhase] = useState<"idle" | "running" | "finishing">("idle");
  const shownAt = useRef(0);
  const [announce, setAnnounce] = useState(false);

  useEffect(() => {
    if (running) {
      const show = setTimeout(() => {
        shownAt.current = Date.now();
        setPhase("running");
      }, SHOW_AFTER_MS);
      const say = setTimeout(() => setAnnounce(true), 1000);
      return () => {
        clearTimeout(show);
        clearTimeout(say);
      };
    }
    setAnnounce(false);
    if (phase !== "running") return;
    const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAt.current));
    const finish = setTimeout(() => setPhase("finishing"), wait);
    const hide = setTimeout(() => setPhase("idle"), wait + 250);
    return () => {
      clearTimeout(finish);
      clearTimeout(hide);
    };
    // phase is read only to know whether the bar was ever shown for this run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  return (
    <>
      {phase !== "idle" && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 pt-[env(safe-area-inset-top)]"
        >
          <div
            className={
              phase === "finishing"
                ? "bg-maroon-600 h-full w-full opacity-0 transition-opacity duration-200"
                : "bg-maroon-600 nav-progress-run h-full"
            }
          />
        </div>
      )}
      <p role="status" className="sr-only">
        {announce ? "Loading page" : ""}
      </p>
    </>
  );
}

export function NavProgress() {
  return (
    <>
      <Suspense fallback={null}>
        <UrlWatcher />
      </Suspense>
      <Bar />
    </>
  );
}
