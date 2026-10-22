import { describe, expect, it, vi } from "vitest";
import { ensureWorkerControls } from "./workerControl";

function store(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (k: string) => data[k] ?? null,
    setItem: (k: string, v: string) => void (data[k] = v),
    removeItem: (k: string) => void delete data[k],
  };
}

const sw = (controller: unknown) => ({
  controller: controller as ServiceWorker | null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
});

describe("ensureWorkerControls", () => {
  it("does nothing when the worker controls the page, and clears the reload flag", async () => {
    const storage = store({ "prepco-sw-reload": "1" });
    const reload = vi.fn();
    expect(await ensureWorkerControls({ serviceWorker: sw({}), storage, reload })).toBe("ok");
    expect(reload).not.toHaveBeenCalled();
    expect(storage.data["prepco-sw-reload"]).toBeUndefined();
  });

  it("reloads once when the page is not controlled", async () => {
    vi.useFakeTimers();
    const storage = store();
    const reload = vi.fn();
    const p = ensureWorkerControls({ serviceWorker: sw(null), storage, reload });
    await vi.advanceTimersByTimeAsync(600);
    expect(await p).toBe("reloading");
    expect(reload).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("does not loop: a second uncontrolled load gives up instead of reloading", async () => {
    vi.useFakeTimers();
    const storage = store({ "prepco-sw-reload": "1" });
    const reload = vi.fn();
    const p = ensureWorkerControls({ serviceWorker: sw(null), storage, reload });
    await vi.advanceTimersByTimeAsync(600);
    expect(await p).toBe("uncontrolled");
    expect(reload).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("gives up without service worker support or storage", async () => {
    expect(await ensureWorkerControls({ storage: store(), reload: vi.fn() })).toBe("uncontrolled");
    vi.useFakeTimers();
    const p = ensureWorkerControls({ serviceWorker: sw(null), storage: null, reload: vi.fn() });
    await vi.advanceTimersByTimeAsync(600);
    expect(await p).toBe("uncontrolled");
    vi.useRealTimers();
  });
});
