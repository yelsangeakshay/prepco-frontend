import type { QueryClient } from "@tanstack/react-query";
import { API_MOCKING } from "@/lib/api/client";
import { endMockSession } from "./client";

const CHANNEL = "prepco-auth";
const LOCAL_PREFIX = "prepco-";

/** Everything the signed-in person left on this device: cached data, session cookies, drafts, the mock world. */
export async function clearLocalSession(qc: QueryClient) {
  await qc.cancelQueries();
  qc.clear();
  endMockSession();
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith(LOCAL_PREFIX)) window.localStorage.removeItem(key);
    }
  } catch {
    // blocked storage: nothing to clear
  }
  if (API_MOCKING) {
    try {
      (await import("@/mocks/persist")).clearSnapshot();
    } catch {
      // the mock world is only a dev aid
    }
  }
}

/** Tell the other tabs of this browser, so they leave the app too. */
export function announceSignOut() {
  try {
    const channel = new BroadcastChannel(CHANNEL);
    channel.postMessage("signed-out");
    channel.close();
  } catch {
    // no BroadcastChannel: other tabs find out on their next navigation
  }
}

export function onSignOutElsewhere(callback: () => void) {
  try {
    const channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = callback;
    return () => channel.close();
  } catch {
    return () => undefined;
  }
}
