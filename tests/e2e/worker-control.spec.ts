import { expect, test } from "@playwright/test";
import { signInAsRiya } from "./helpers";

// A hard refresh loads the page without its service worker. Chrome reports no controller; fake that for
// the first load only, the way the browser would, and check the app reloads itself once and recovers.
test("a page the mock worker does not control reloads itself once and loads its data", async ({
  page,
  context,
}) => {
  await signInAsRiya(context);
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("prepco-sw-reload")) {
      Object.defineProperty(navigator.serviceWorker, "controller", { get: () => null });
    }
  });
  let loads = 0;
  page.on("load", () => loads++);

  await page.goto("/home");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Riya", { timeout: 20_000 });
  await expect(page.getByText("Something went wrong")).toHaveCount(0);
  // One load, then the one self-reload.
  expect(loads).toBe(2);
});
