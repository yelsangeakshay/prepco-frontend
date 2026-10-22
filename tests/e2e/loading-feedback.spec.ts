import { expect, test } from "@playwright/test";
import { gotoReady, signInAsRiya } from "./helpers";

const submit = (page: import("@playwright/test").Page) =>
  page.getByRole("button", { name: "Sign in", exact: true });

test.describe("Sign in feedback", () => {
  test("double click sends one request and the button stays busy until the home page renders", async ({
    page,
  }) => {
    await gotoReady(page, "/sign-in");
    const requests: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("/auth/sign-in")) requests.push(r.url());
    });
    // Records a flip back to idle while the sign-in page is still showing.
    await page.evaluate(() => {
      const w = window as unknown as { __idleFlip?: boolean };
      const btn = [...document.querySelectorAll("button")].find(
        (b) => b.textContent?.trim() === "Sign in",
      )!;
      let busySeen = false;
      new MutationObserver(() => {
        if (btn.getAttribute("aria-busy") === "true") busySeen = true;
        else if (busySeen && location.pathname === "/sign-in") w.__idleFlip = true;
      }).observe(btn, { attributes: true, attributeFilter: ["aria-busy"] });
    });

    await page.getByLabel("College email").fill("riya@scmhrd.edu");
    await page.getByLabel("Password").fill("password123");
    await submit(page).dblclick();

    await expect(submit(page)).toHaveAttribute("aria-busy", "true");
    await expect(page.getByLabel("College email")).toBeDisabled();
    await expect(page).toHaveURL(/\/home$/);
    expect(requests).toHaveLength(1);
    expect(
      await page.evaluate(() => (window as unknown as { __idleFlip?: boolean }).__idleFlip),
    ).toBeFalsy();
  });

  test("a signed-in user is sent away from the sign-in page", async ({ page, context }) => {
    await signInAsRiya(context);
    await page.goto("/sign-in");
    await expect(page).toHaveURL(/\/home$/);
    await page.goto("/sign-up");
    await expect(page).toHaveURL(/\/home$/);
  });
});

test.describe("Sign in when the preview service cannot start", () => {
  test.use({ serviceWorkers: "block" });
  test("explains the disabled button and offers a retry", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("alert").filter({ hasText: "Couldn't connect" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
    await expect(submit(page)).toBeDisabled();
  });
});
