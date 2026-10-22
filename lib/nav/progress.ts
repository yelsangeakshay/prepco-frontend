"use client";

import { useSyncExternalStore } from "react";

/** A navigation is "running" from the click until the URL changes. A hard cap keeps a stuck bar from lingering. */
const CAP_MS = 10_000;

let running = false;
let cap: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function startNav() {
  clearTimeout(cap);
  cap = setTimeout(stopNav, CAP_MS);
  if (!running) {
    running = true;
    emit();
  }
}

export function stopNav() {
  clearTimeout(cap);
  if (running) {
    running = false;
    emit();
  }
}

export function useNavRunning() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => running,
    () => false,
  );
}

/** pathname + search of an href resolved against the current page, or null for another origin. */
export function resolveUrl(href: string): string | null {
  try {
    const u = new URL(href, window.location.href);
    return u.origin === window.location.origin ? u.pathname + u.search : null;
  } catch {
    return null;
  }
}

export function isSameUrl(href: string) {
  return resolveUrl(href) === window.location.pathname + window.location.search;
}
