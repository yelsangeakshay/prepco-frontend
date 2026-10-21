// Screenshot a route as a role, for comparing against design/mockups.
// Usage: node scripts/shot.mjs <role> <path> <out.png> [width] [height]
import { chromium } from "@playwright/test";

const [role, path, out, w = "1440", h = "1000"] = process.argv.slice(2);
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: Number(w), height: Number(h) },
  deviceScaleFactor: 1,
});
if (role !== "public") {
  await context.addCookies([{ name: "prepco_role", value: role, url: "http://localhost:3000" }]);
}
const page = await context.newPage();
await page.addInitScript(() => {
  window.__PREPCO_NO_LATENCY__ = true;
});
await page.goto(`http://localhost:3000${path}`, { waitUntil: "networkidle" });
await page
  .locator("main h1")
  .first()
  .waitFor({ timeout: 20000 })
  .catch(() => {});
await page.waitForTimeout(600);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log("saved", out);
