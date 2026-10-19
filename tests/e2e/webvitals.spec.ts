import { expect, test, type Page } from "@playwright/test";
import { signInAs, type RoleName } from "./helpers";

/**
 * Web Vitals budget on a mid-range Android over 4G: LCP < 2.5 s, INP < 200 ms, CLS < 0.1.
 * Phone project only. CPU is throttled 4x and the network is a typical 4G link: 9 Mbps down, 1.5 Mbps up, 100 ms RTT.
 * Measured with the browser's own PerformanceObserver (no extra library).
 */
const ROUTES: { role: RoleName | "public"; path: string; interact?: string }[] = [
  { role: "public", path: "/sign-in", interact: "Email" },
  { role: "student", path: "/home", interact: "More" },
  { role: "student", path: "/answers", interact: "Flagged" },
  { role: "student", path: "/cv", interact: "Versions" },
  { role: "panelist", path: "/panelist/today" },
  { role: "ops", path: "/ops/students" },
];

async function throttle(page: Page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 100,
    downloadThroughput: (9 * 1024 * 1024) / 8,
    uploadThroughput: (1.5 * 1024 * 1024) / 8,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
}

test.beforeEach(({ isMobile }) => {
  test.skip(!isMobile, "Web Vitals budget is checked on the phone project");
});

for (const r of ROUTES) {
  test(`web vitals: ${r.path}`, async ({ page, context }) => {
    test.setTimeout(90_000);
    if (r.role !== "public") await signInAs(context, r.role);

    await page.addInitScript(() => {
      (window as unknown as { __PREPCO_NO_LATENCY__: boolean }).__PREPCO_NO_LATENCY__ = true;
      const w = window as unknown as { __v: { lcp: number; cls: number; inp: number } };
      w.__v = { lcp: 0, cls: 0, inp: 0 };
      new PerformanceObserver((l) => {
        const e = l.getEntries().at(-1);
        if (e) w.__v.lcp = e.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((l) => {
        for (const e of l.getEntries() as unknown as { hadRecentInput: boolean; value: number }[]) {
          if (!e.hadRecentInput) w.__v.cls += e.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) if (e.duration > w.__v.inp) w.__v.inp = e.duration;
      }).observe({
        type: "event",
        durationThreshold: 16,
        buffered: true,
      } as PerformanceObserverInit);
    });

    await throttle(page);
    await page.goto(r.path, { waitUntil: "networkidle" });
    // A real interaction so INP has something to measure.
    if (r.interact) {
      const target = page
        .getByRole("button", { name: r.interact })
        .or(page.getByLabel(r.interact))
        .or(page.getByRole("tab", { name: new RegExp(r.interact) }))
        .or(page.getByRole("link", { name: r.interact }));
      await target
        .first()
        .click({ trial: false })
        .catch(() => undefined);
      await page.waitForTimeout(300);
    }

    const v = await page.evaluate(
      () => (window as unknown as { __v: { lcp: number; cls: number; inp: number } }).__v,
    );
    console.log(
      `VITALS ${r.path} LCP ${Math.round(v.lcp)}ms CLS ${v.cls.toFixed(3)} INP ${Math.round(v.inp)}ms`,
    );
    expect(v.lcp, "LCP").toBeLessThan(2500);
    expect(v.cls, "CLS").toBeLessThan(0.1);
    expect(v.inp, "INP").toBeLessThan(200);
  });
}
