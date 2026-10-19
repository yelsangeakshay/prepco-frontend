import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

/**
 * Every story renders without a Storybook error. Loading stories show a status region, error
 * stories show an alert, the rest show real content. This is how "each state is in Storybook"
 * is checked.
 */
interface Entry {
  id: string;
  type: "story" | "docs";
  title: string;
  name: string;
}
const index = JSON.parse(readFileSync("storybook-static/index.json", "utf8")) as {
  entries: Record<string, Entry>;
};
const stories = Object.values(index.entries).filter((e) => e.type === "story");

test("storybook has stories for every state", () => {
  expect(stories.length).toBeGreaterThan(150);
  const names = stories.map((s) => s.name);
  for (const state of ["Loading", "Error", "Empty", "Phone"]) {
    expect(
      names.some((n) => n.endsWith(`: ${state}`) || n.includes(state)),
      state,
    ).toBe(true);
  }
});

for (const s of stories) {
  test(`${s.title} / ${s.name}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`/iframe.html?id=${s.id}&viewMode=story`, { waitUntil: "load" });
    const root = page.locator("#storybook-root");
    // toBeEmpty() looks at text only; skeleton-only stories have elements but no text.
    await expect(root.locator(":scope > *").first()).toBeAttached({ timeout: 15_000 });

    if (/: Loading$/.test(s.name)) {
      await expect(root.locator("[role=status]").first()).toBeVisible({ timeout: 10_000 });
    } else if (/: Error$/.test(s.name)) {
      await expect(root.locator("[role=alert]").first()).toBeVisible({ timeout: 10_000 });
    } else if (
      !/(Components|Shared|UI|Runway|Plans|Panelist|Ops|AnswerBank|Feedback|Notifications)\//.test(
        s.title,
      )
    ) {
      // Views: wait for the skeleton to give way to real content.
      await expect(root.locator("h1, h2").first()).toBeVisible({ timeout: 15_000 });
    }
    await expect(page.locator(".sb-errordisplay:visible")).toHaveCount(0);
    expect(errors, errors.join("\n")).toEqual([]);
  });
}
