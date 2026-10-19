import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { SCREENS } from "../../lib/config/screens";
import { gotoReady, signInAs, type RoleName } from "./helpers";

/** WCAG 2.1 AA via axe on every screen, for every role, at desktop and phone widths. */
const ROLES: (RoleName | "public")[] = ["public", "student", "panelist", "ops"];

for (const access of ROLES) {
  test(`axe: ${access} screens have no WCAG 2.1 AA violations`, async ({ page, context }) => {
    test.setTimeout(240_000);
    if (access !== "public") await signInAs(context, access);
    const failures: string[] = [];

    for (const s of SCREENS.filter((x) => x.access === access)) {
      await gotoReady(page, s.sample);
      // Let lazy chunks (tables, charts) finish.
      await page.waitForTimeout(400);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      for (const v of results.violations) {
        const where = v.nodes
          .map((n) => n.target.join(" "))
          .slice(0, 2)
          .join(" | ");
        failures.push(`${s.sample}: ${v.id} (${v.impact}) ${where}`);
      }
    }
    if (failures.length) console.log("A11Y\n" + failures.join("\n"));
    expect(failures).toEqual([]);
  });
}

test("axe: open overlays (bell drawer, more sheet, re-lock dialog)", async ({
  page,
  context,
  isMobile,
}) => {
  await signInAs(context, "student");
  const failures: string[] = [];
  const scan = async (label: string) => {
    const r = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    for (const v of r.violations)
      failures.push(`${label}: ${v.id} ${v.nodes[0]?.target.join(" ")}`);
  };

  await gotoReady(page, "/cv");
  await page.getByRole("button", { name: /^Notifications/ }).click();
  await page.getByRole("dialog", { name: "Notifications" }).waitFor();
  await scan("bell drawer");
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Request Re-lock" }).click();
  await page.getByRole("dialog").waitFor();
  await scan("re-lock dialog");
  await page.keyboard.press("Escape");

  if (isMobile) {
    await page.getByRole("button", { name: "More" }).click();
    await page.getByRole("dialog").waitFor();
    await scan("more sheet");
  }
  if (failures.length) console.log("A11Y\n" + failures.join("\n"));
  expect(failures).toEqual([]);
});
