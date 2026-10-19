import type { BrowserContext, Page } from "@playwright/test";

const BASE = "http://localhost:3000";

export async function signInAsRiya(context: BrowserContext, scenario?: string) {
  const cookies = [{ name: "prepco_role", value: "student", url: BASE }];
  if (scenario) cookies.push({ name: "prepco_scenario", value: scenario, url: BASE });
  await context.addCookies(cookies);
}

/** Navigate and wait for the mock worker plus first data render. */
export async function gotoReady(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
}

/** App alerts only. Excludes Next's route announcer, which also has role=alert. */
export const alerts = (page: Page) => page.locator("[role=alert]:not(#__next-route-announcer__)");
