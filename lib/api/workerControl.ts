const RELOAD_FLAG = "prepco-sw-reload";
const CONTROL_WAIT_MS = 500;

interface Env {
  serviceWorker?: Pick<
    ServiceWorkerContainer,
    "controller" | "addEventListener" | "removeEventListener"
  >;
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null;
  reload: () => void;
}

/**
 * After the mock worker starts, the page must be controlled by it or API calls go to the Next server and 404.
 * A hard refresh (Ctrl+Shift+R) loads the page without its worker. Reload once, a plain reload brings control back.
 * Resolves "ok" when controlled, "reloading" when a reload was started, and "uncontrolled" when a reload
 * already happened and the page is still not controlled.
 */
export async function ensureWorkerControls(env: Env): Promise<"ok" | "reloading" | "uncontrolled"> {
  const sw = env.serviceWorker;
  if (!sw) return "uncontrolled";

  if (!sw.controller) {
    // Right after the first install the claim can land a moment after start() resolves.
    await new Promise<void>((resolve) => {
      const done = () => {
        sw.removeEventListener("controllerchange", done);
        clearTimeout(timer);
        resolve();
      };
      const timer = setTimeout(done, CONTROL_WAIT_MS);
      sw.addEventListener("controllerchange", done);
    });
  }

  if (sw.controller) {
    try {
      env.storage?.removeItem(RELOAD_FLAG);
    } catch {
      // storage can be blocked; nothing to clear
    }
    return "ok";
  }

  try {
    if (!env.storage || env.storage.getItem(RELOAD_FLAG)) return "uncontrolled";
    env.storage.setItem(RELOAD_FLAG, "1");
  } catch {
    return "uncontrolled";
  }
  env.reload();
  return "reloading";
}

/** Run right after the worker starts. Never resolves while a reload is under way, so no query fires and fails first. */
export async function afterWorkerStart() {
  let storage: Storage | null = null;
  try {
    storage = window.sessionStorage;
  } catch {
    // blocked storage: no reload guard, so no reload
  }
  const state = await ensureWorkerControls({
    serviceWorker: navigator.serviceWorker,
    storage,
    reload: () => window.location.reload(),
  });
  if (state === "reloading") await new Promise<never>(() => undefined);
  if (state === "uncontrolled") throw new Error("The mock worker is not controlling this page");
}
