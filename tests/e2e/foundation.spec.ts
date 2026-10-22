import { expect, test, type BrowserContext } from "@playwright/test";
import { NAV } from "../../lib/config/nav";
import { SCREENS } from "../../lib/config/screens";
import { ROLE_HOME, type Role } from "../../lib/auth/roles";

const BASE = `http://localhost:${process.env.PORT ?? "3000"}`;

async function signInAs(context: BrowserContext, role: Role) {
  await context.addCookies([{ name: "prepco_role", value: role, url: BASE }]);
}

for (const role of ["student", "panelist", "ops"] as const) {
  test.describe(`${role}`, () => {
    test("every nav link renders with zero 404s", async ({ page, context }) => {
      await signInAs(context, role);
      const hrefs = NAV[role].sections.flatMap((s) => s.items.map((i) => i.href));
      for (const href of hrefs) {
        const res = await page.goto(href);
        expect(res?.status(), href).toBeLessThan(400);
        await expect(page.locator("h1:visible").first(), href).toBeVisible();
      }
    });

    test("every owned route renders", async ({ page, context }) => {
      await signInAs(context, role);
      for (const s of SCREENS.filter((x) => x.access === role)) {
        const res = await page.goto(s.sample);
        expect(res?.status(), s.sample).toBeLessThan(400);
        await expect(page.locator("h1:visible").first(), s.sample).toBeVisible();
      }
    });
  });
}

test("public routes render signed out", async ({ page }) => {
  for (const s of SCREENS.filter((x) => x.access === "public")) {
    const res = await page.goto(s.sample);
    expect(res?.status(), s.sample).toBeLessThan(400);
    await expect(page.locator("h1:visible").first(), s.sample).toBeVisible();
  }
});

test("signed out is sent to /sign-in", async ({ page }) => {
  await page.goto("/home");
  await expect(page).toHaveURL(/\/sign-in$/);
  await page.goto("/");
  await expect(page).toHaveURL(/\/sign-in$/);
});

test("cross-role access redirects to own home", async ({ page, context }) => {
  await signInAs(context, "student");
  await page.goto("/ops/students");
  await expect(page).toHaveURL(new RegExp(`${ROLE_HOME.student}$`));
  await page.goto("/panelist/today");
  await expect(page).toHaveURL(new RegExp(`${ROLE_HOME.student}$`));

  await context.clearCookies();
  await signInAs(context, "ops");
  await page.goto("/home");
  await expect(page).toHaveURL(/\/ops$/);

  await context.clearCookies();
  await signInAs(context, "panelist");
  await page.goto("/ops");
  await expect(page).toHaveURL(/\/panelist\/today$/);
});

test("first-login scenario sends students to onboarding", async ({ page, context }) => {
  await signInAs(context, "student");
  await page.goto("/home?scenario=first-login");
  await expect(page).toHaveURL(/\/onboarding\/1$/);
});

test("unknown route shows branded 404", async ({ page, context }) => {
  await signInAs(context, "student");
  const res = await page.goto("/nope-not-here");
  expect(res?.status()).toBe(404);
  await expect(page.getByText("We could not find that page")).toBeVisible();
});

test("phone shows bottom nav, desktop shows sidebar", async ({ page, context, isMobile }) => {
  await signInAs(context, "student");
  await page.goto("/home");
  if (isMobile) {
    await expect(page.getByRole("navigation", { name: "Mobile" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeHidden();
  } else {
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Mobile" })).toBeHidden();
  }
});
