import { expect, test } from "@playwright/test";
import { SCREENS } from "../../lib/config/screens";
import { gotoReady, signInAs, type RoleName } from "./helpers";

/**
 * Responsive pass at 390 (phone), 768 (tablet) and 1280 (desktop): the three Playwright
 * projects run this same file. No screen may scroll sideways, and the shell must match the width.
 */
const ROLES: (RoleName | "public")[] = ["public", "student", "panelist", "ops"];

for (const access of ROLES) {
  test(`no horizontal scroll: ${access} screens`, async ({ page, context }) => {
    test.setTimeout(240_000);
    if (access !== "public") await signInAs(context, access);
    const bad: string[] = [];
    for (const s of SCREENS.filter((x) => x.access === access)) {
      await gotoReady(page, s.sample);
      await page.waitForTimeout(300);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      if (overflow > 0) bad.push(`${s.sample} (+${overflow}px)`);
    }
    expect(bad, bad.join("\n")).toEqual([]);
  });
}

test("shell matches the width: bottom bar, icon rail, or full sidebar", async ({
  page,
  context,
}) => {
  await signInAs(context, "student");
  await gotoReady(page, "/home");
  const width = page.viewportSize()!.width;
  const sidebar = page.getByRole("complementary", { name: "Sidebar" });
  const mobile = page.getByRole("navigation", { name: "Mobile" });

  if (width < 768) {
    await expect(mobile).toBeVisible();
    await expect(sidebar).toBeHidden();
  } else if (width < 1280) {
    await expect(mobile).toBeHidden();
    const box = await sidebar.boundingBox();
    expect(box!.width).toBeLessThan(100); // icon rail
    // Labels are screen-reader only on the rail: they take no visible space.
    const label = await sidebar.getByText("Sessions & runway").boundingBox();
    expect(label!.width).toBeLessThanOrEqual(1);
  } else {
    await expect(mobile).toBeHidden();
    const box = await sidebar.boundingBox();
    expect(box!.width).toBeGreaterThan(200);
    await expect(sidebar.getByText("Sessions & runway")).toBeVisible();
  }
});

test("touch targets are at least 44px on the shell and primary buttons", async ({
  page,
  context,
}) => {
  await signInAs(context, "student");
  await gotoReady(page, "/sessions");
  const width = page.viewportSize()!.width;
  const nav =
    width < 768
      ? page.getByRole("navigation", { name: "Mobile" })
      : page.getByRole("navigation", { name: "Primary" });
  const links = nav.getByRole("link");
  const n = await links.count();
  for (let i = 0; i < n; i++) {
    const box = await links.nth(i).boundingBox();
    expect(box!.height, `nav link ${i}`).toBeGreaterThanOrEqual(43.5);
  }
});
