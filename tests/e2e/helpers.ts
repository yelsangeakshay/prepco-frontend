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

/** Client-side navigation through the shell (mock state lives in the page, so avoid hard reloads). */
export async function openFromNav(page: Page, label: string, isMobile: boolean) {
  if (!isMobile) {
    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: label })
      .click();
    return;
  }
  const direct = page
    .getByRole("navigation", { name: "Mobile" })
    .getByRole("link", { name: label.split(" ")[0], exact: true });
  if (await direct.count()) {
    await direct.click();
    return;
  }
  await page.getByRole("button", { name: "More" }).click();
  await page.getByRole("dialog").getByRole("link", { name: label }).click();
}

export type RoleName = "student" | "panelist" | "ops";

/** Switch the mock session. Mock state survives because it is persisted in sessionStorage. */
export async function signInAs(context: BrowserContext, role: RoleName, scenario?: string) {
  await context.clearCookies();
  const cookies: { name: string; value: string; url: string }[] = [
    { name: "prepco_role", value: role, url: BASE },
  ];
  if (scenario) cookies.push({ name: "prepco_scenario", value: scenario, url: BASE });
  await context.addCookies(cookies);
}
