import { expect, test, type Page } from "@playwright/test";
import { SCENARIOS } from "../../lib/config/scenarios";
import { alerts, gotoReady, signInAs } from "./helpers";

/**
 * Every scenario must be reachable by URL (`?scenario=<name>`), without the dev toolbar.
 * Each entry opens the URL and checks the effect that scenario is meant to show.
 */
const cases: Record<string, (page: Page) => Promise<void>> = {
  "payment-failed": async (page) => {
    await gotoReady(page, "/checkout/premium?scenario=payment-failed");
    await page.getByRole("button", { name: /^Pay/ }).click();
    await expect(alerts(page)).toContainText("Payment failed");
  },
  "payment-success": async (page) => {
    await gotoReady(page, "/checkout/premium?scenario=payment-success");
    await page.getByRole("button", { name: /^Pay/ }).click();
    await expect(page.getByTestId("receipt")).toBeVisible();
  },
  "cohort-full": async (page) => {
    await gotoReady(page, "/plans?scenario=cohort-full");
    await expect(page.getByText("This cohort is full")).toBeVisible();
  },
  "late-joiner": async (page) => {
    await gotoReady(page, "/home?scenario=late-joiner");
    await expect(page.getByTestId("banner-late-joiner")).toBeVisible();
  },
  "cv-upload-failed": async (page) => {
    await gotoReady(page, "/onboarding/cv-upload?scenario=cv-upload-failed");
    await page.locator("#cv-file").setInputFiles({
      name: "cv.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4"),
    });
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Upload CV" }).click();
    await expect(alerts(page)).toContainText("We could not read your CV");
  },
  "panelist-cancelled": async (page) => {
    await gotoReady(page, "/sessions/s-1003?scenario=panelist-cancelled");
    await expect(page.getByText("can no longer make this slot")).toBeVisible();
  },
  "student-reschedule": async (page) => {
    await gotoReady(page, "/sessions/s-1003?scenario=student-reschedule");
    await expect(page.getByText("Moved", { exact: true })).toBeVisible();
  },
  "no-show": async (page) => {
    await gotoReady(page, "/sessions/s-1003?scenario=no-show");
    await expect(page.getByText("first no-show is free")).toBeVisible();
  },
  "day0-moved": async (page) => {
    await gotoReady(page, "/home?scenario=day0-moved");
    await expect(page.getByTestId("banner-day0-moved")).toBeVisible();
  },
  placed: async (page) => {
    await gotoReady(page, "/outcome?scenario=placed");
    await expect(page.getByTestId("outcome-placed")).toBeVisible();
  },
  "not-placed": async (page) => {
    await gotoReady(page, "/outcome?scenario=not-placed");
    await expect(page.getByTestId("outcome-not-placed")).toBeVisible();
  },
  "first-login": async (page) => {
    await page.goto("/home?scenario=first-login");
    await expect(page).toHaveURL(/\/onboarding\/1$/);
  },
  "gmail-unverified": async (page) => {
    await gotoReady(page, "/sign-in?scenario=gmail-unverified");
    await page.getByLabel("Email").fill("someone@gmail.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL(/\/verify-email/);
  },
  "basic-ended": async (page) => {
    await gotoReady(page, "/billing?scenario=basic-ended");
    await expect(page.getByTestId("basic-ended")).toBeVisible();
  },
  "target-change": async (page) => {
    await gotoReady(page, "/profile?scenario=target-change");
    await expect(page.getByTestId("target-changed")).toBeVisible();
  },
  "returning-student": async (page) => {
    await gotoReady(page, "/free-session?scenario=returning-student");
    await expect(page.getByText("Free session already used")).toBeVisible();
  },
};

test("the list of cases covers every scenario", () => {
  expect(Object.keys(cases).sort()).toEqual([...SCENARIOS].sort());
});

for (const scenario of SCENARIOS) {
  test(`scenario by URL: ${scenario}`, async ({ page, context }) => {
    if (scenario !== "gmail-unverified") await signInAs(context, "student");
    await cases[scenario]!(page);
  });
}

test("an unknown scenario name is ignored", async ({ page, context }) => {
  await signInAs(context, "student");
  await gotoReady(page, "/home?scenario=does-not-exist");
  await expect(page.getByRole("heading", { name: "Hello, Riya" })).toBeVisible();
  await expect(page.getByTestId("banner-late-joiner")).toHaveCount(0);
});
