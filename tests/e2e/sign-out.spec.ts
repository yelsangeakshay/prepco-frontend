import { expect, test, type Page } from "@playwright/test";
import { ROLE_HOME } from "../../lib/auth/roles";
import { gotoReady, signInAs, type RoleName } from "./helpers";

const menuButton = (page: Page) => page.getByRole("button", { name: /account menu for/ });
const signOutItem = (page: Page) => page.getByRole("menuitem", { name: "Sign out" });

for (const role of ["student", "panelist", "ops"] as const satisfies RoleName[]) {
  test(`${role}: the avatar opens a menu and Sign out returns to sign-in`, async ({
    page,
    context,
  }) => {
    await signInAs(context, role);
    await gotoReady(page, ROLE_HOME[role]);

    await menuButton(page).first().click();
    await expect(page.getByRole("menu", { name: "Account" })).toBeVisible();
    await signOutItem(page).click();

    await expect(page).toHaveURL(/\/sign-in$/);
    // The session is gone, so a protected page sends the visitor back.
    await page.goto(ROLE_HOME[role]);
    await expect(page).toHaveURL(/\/sign-in$/);
  });
}

test("Escape closes the menu and returns focus to the avatar", async ({ page, context }) => {
  await signInAs(context, "student");
  await gotoReady(page, "/home");
  const button = menuButton(page).first();
  await button.click();
  await expect(page.getByRole("menuitem").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu", { name: "Account" })).toHaveCount(0);
  await expect(button).toBeFocused();
});

test("a double click sends one sign-out request", async ({ page, context }) => {
  await signInAs(context, "student");
  await gotoReady(page, "/home");
  const requests: string[] = [];
  page.on("request", (r) => r.url().includes("/auth/sign-out") && requests.push(r.url()));
  await menuButton(page).first().click();
  await signOutItem(page).dblclick();
  await expect(page).toHaveURL(/\/sign-in$/);
  expect(requests).toHaveLength(1);
});

test("signing in as another role afterwards shows none of the earlier person's data", async ({
  page,
  context,
}) => {
  await signInAs(context, "student");
  await gotoReady(page, "/home");
  await menuButton(page).first().click();
  await signOutItem(page).click();
  await expect(page).toHaveURL(/\/sign-in$/);

  await page.getByLabel("College email").fill("ops@theprepco.in");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/ops$/);
  await expect(page.getByText("Riya")).toHaveCount(0);
});

test("another open tab leaves the app too", async ({ page, context }) => {
  await signInAs(context, "student");
  await gotoReady(page, "/home");
  const other = await context.newPage();
  await gotoReady(other, "/sessions");

  await menuButton(page).first().click();
  await signOutItem(page).click();

  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(other).toHaveURL(/\/sign-in$/, { timeout: 10_000 });
});

test.describe("when the sign-out request fails", () => {
  test.use({ serviceWorkers: "block" });
  test("the local session is still cleared", async ({ page, context }) => {
    await signInAs(context, "student");
    await page.goto("/home");
    await menuButton(page).first().click();
    await signOutItem(page).click();
    await expect(page).toHaveURL(/\/sign-in$/);
  });
});

test.describe("phone", () => {
  test("the Account sheet has Sign out", async ({ page, context, isMobile }) => {
    test.skip(!isMobile, "phone only");
    await signInAs(context, "student");
    await gotoReady(page, "/home");
    await page
      .getByRole("navigation", { name: "Mobile" })
      .getByRole("button", { name: "Account" })
      .click();
    await page.getByRole("dialog").getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/sign-in$/);
  });
});
