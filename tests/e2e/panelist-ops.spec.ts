import { expect, test, type Page } from "@playwright/test";
import { alerts, gotoReady, signInAs } from "./helpers";

const SCORING_NOTE = "Clear structure. Prepare one defensible number for the pricing trade-off.";

async function fillScore(page: Page, opts: { sendBack?: boolean } = {}) {
  await page.getByRole("checkbox", { name: "Situation" }).check();
  await page.getByRole("radio", { name: "Strong" }).click();
  await page.getByLabel("Note to the student").fill(SCORING_NOTE);
  if (opts.sendBack) {
    await page.getByRole("switch", { name: "Send back to the student's builder" }).click();
  }
}

test.describe("Become a panelist", () => {
  test("apply, then ops approves and the roster grows", async ({ page, context }) => {
    await gotoReady(page, "/panelist/apply");
    await page.getByRole("button", { name: "Submit application" }).click();
    await expect(page.getByText("Enter your full name")).toBeVisible();
    await expect(page.getByText("Enter a valid email")).toBeVisible();

    await page.getByLabel("Full name").fill("Meera Kapoor");
    await page.getByLabel("Work email").fill("meera.kapoor@example.com");
    await page.getByRole("radio", { name: "Finance & Banking" }).click();
    await page.getByLabel("Company (kept private from students)").fill("Tailspin Finance");
    await page.getByLabel("Current role").fill("Associate Director");
    await page.getByLabel("Years in the function").fill("2");
    await page.getByRole("checkbox", { name: "P1 · first mock panel" }).check();
    await page.getByLabel("When you're usually free").fill("Weekday evenings after 6 PM");
    await page.getByRole("button", { name: "Submit application" }).click();
    await expect(page.getByText("We need at least 3 years")).toBeVisible();
    await page.getByLabel("Years in the function").fill("9");
    await page.getByRole("button", { name: "Submit application" }).click();
    await expect(page).toHaveURL(/\/panelist\/apply\/submitted$/);
    await expect(page.getByRole("heading", { name: "Application received" })).toBeVisible();

    await signInAs(context, "ops");
    await gotoReady(page, "/ops/panelists/applications");
    const card = page.getByTestId("application-app-007");
    await expect(card).toContainText("Meera Kapoor");
    await card.getByRole("button", { name: /Approve/ }).click();
    await expect(card).toHaveCount(0);

    await gotoReady(page, "/ops/panelists?q=Meera");
    await expect(page.getByText("Meera Kapoor").first()).toBeVisible();
  });
});

test.describe("Run a panel", () => {
  test("tonight: brief, validation, score, count goes up", async ({ page, context, isMobile }) => {
    await signInAs(context, "panelist");
    await gotoReady(page, "/panelist/today");
    const season = (n: string) =>
      page.getByText("This season", { exact: true }).locator("..").getByText(n, { exact: true });
    if (!isMobile) await expect(season("12")).toBeVisible();
    const tonight = page.locator("section[aria-labelledby=tonight-h]");
    // Desktop shows a "Read brief" button per unread panel; the phone shows a card per panel.
    const unread = isMobile
      ? tonight.getByRole("link", { name: /Not read yet/i })
      : tonight.getByRole("link", { name: "Read brief" });
    await expect(unread).toHaveCount(2);

    await unread.first().click();
    await expect(page.getByRole("heading", { name: /Locked CV/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pull on these" })).toBeVisible();
    await page.getByRole("link", { name: "Start panel" }).click();

    await expect(page).toHaveURL(/\/panelist\/scoring\/b-\d+$/);
    await expect(page.getByRole("heading", { name: /^Question 1 of \d+$/ })).toBeVisible();
    await page.getByRole("button", { name: "Submit feedback" }).click();
    await expect(page.getByText("Mark at least one question first.")).toBeVisible();

    await fillScore(page);
    await page.getByRole("button", { name: "Submit feedback" }).click();
    await expect(page.getByTestId("score-sent")).toBeVisible();
    await page.getByRole("link", { name: "Back To Today" }).click();
    if (!isMobile) await expect(season("13")).toBeVisible();
    await expect(unread).toHaveCount(1);
  });

  test("an unsent score survives a reload", async ({ page, context }) => {
    await signInAs(context, "panelist");
    await gotoReady(page, "/panelist/scoring");
    await page.getByRole("link", { name: "Start scoring" }).first().click();
    await page.getByRole("radio", { name: "Strong" }).click();
    await page.getByLabel("Note to the student").fill("A draft note that is long enough to keep.");
    await page.reload();
    await expect(page.getByText("Restored your unsent draft.")).toBeVisible();
    await expect(page.getByRole("radio", { name: "Strong" })).toBeChecked();
  });

  test("a brief that is not yours is not found", async ({ page, context }) => {
    await signInAs(context, "panelist");
    await gotoReady(page, "/panelist/briefs/s-1003");
    await expect(page.getByText("Brief not found")).toBeVisible();
  });
});

test.describe("Set availability", () => {
  test("toggle a slot, save, reload; booked slots are locked", async ({ page, context }) => {
    await signInAs(context, "panelist");
    await gotoReady(page, "/panelist/availability");
    await expect(page.getByTestId("open-count")).toHaveText("10");
    await expect(page.getByRole("button", { name: "Mon 18:00, booked" })).toBeDisabled();

    const save = page.getByRole("button", { name: "Save availability" });
    await expect(save).toBeDisabled();
    await page.getByRole("button", { name: "Sat 19:00" }).click();
    await expect(page.getByTestId("open-count")).toHaveText("11");
    await save.click();
    // The button disables at once; wait for the save itself before reloading.
    await expect(page.getByText("Availability saved")).toBeVisible();
    await expect(save).toBeDisabled();

    await page.reload();
    await expect(page.getByTestId("open-count")).toHaveText("11");
    await expect(page.getByRole("button", { name: "Sat 19:00" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});

test.describe("Weekly ops loop", () => {
  test("clear the queue: assign, excuse a no-show, review an application", async ({
    page,
    context,
    isMobile,
  }) => {
    await signInAs(context, "ops");
    await gotoReady(page, "/ops");
    await expect(page.getByTestId("attn-unassigned")).toContainText("3");
    await expect(page.getByTestId("attn-applications")).toContainText("3");

    await page.getByTestId("attn-unassigned-action").click();
    await expect(page).toHaveURL(/\/ops\/assignments$/);
    await expect(page.getByTestId("unassigned-count")).toContainText("3 panels");
    if (!isMobile) {
      await expect(
        page.getByRole("navigation", { name: "Primary" }).getByText("3", { exact: true }),
      ).toBeVisible();
    }

    const free = page
      .locator("[data-testid^=candidate-]")
      .filter({ hasText: "open at that time" })
      .first();
    await free.getByRole("button", { name: /^Assign/ }).click();
    await expect(page.getByTestId("unassigned-count")).toContainText("2 panels");

    await gotoReady(page, "/ops/sessions?tab=no-shows");
    const before = await page.getByRole("button", { name: /^Excuse/ }).count();
    expect(before).toBeGreaterThan(0);
    await page
      .getByRole("button", { name: /^Excuse/ })
      .first()
      .click();
    await expect(page.getByRole("button", { name: /^Excuse/ })).toHaveCount(before - 1);

    await gotoReady(page, "/ops/panelists/applications");
    const approvals = page.getByRole("button", { name: /^Approve/ });
    const pending = await approvals.count();
    await approvals.first().click();
    await expect(approvals).toHaveCount(pending - 1);
    await gotoReady(page, "/ops");
    await expect(page.getByTestId("attn-unassigned")).toContainText("2");
    await expect(page.getByTestId("attn-applications")).toContainText("2");
  });
});

test.describe("Keep the panel healthy", () => {
  test("find panelists who need attention, pause one", async ({ page, context }) => {
    await signInAs(context, "ops");
    await gotoReady(page, "/ops/panelists?health=needs-attention");
    await expect(page.getByText(/[0-9]+ cancellations/).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /^Send Reminder/ })).toHaveCount(0);

    await page
      .getByRole("button", { name: /^Pause/ })
      .first()
      .click();
    await expect(page.getByText("Paused").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /^Resume/ })).toHaveCount(1);
  });
});

test.describe("Students at scale", () => {
  test("1,000 rows are virtualised; filters and sort live in the URL", async ({
    page,
    context,
  }) => {
    await signInAs(context, "ops");
    await gotoReady(page, "/ops/students?pageSize=1000");
    await expect(page.getByText("1,000 students")).toBeVisible();
    const rendered = await page.locator("tbody tr").count();
    expect(rendered).toBeLessThan(60);

    await gotoReady(page, "/ops/students");
    await page.getByRole("tab", { name: "Elite" }).click();
    await expect(page).toHaveURL(/plan=elite/);
    await expect(page.getByText("17 students")).toBeVisible();

    await page.getByRole("button", { name: "Readiness" }).click();
    await expect(page).toHaveURL(/sort=readiness%3Aasc/);
    await page.getByLabel("Search").fill("zzzzzz");
    await expect(page).toHaveURL(/q=zzzzzz/);
    await expect(page.getByText("No students match").first()).toBeVisible();
  });

  test("student detail", async ({ page, context, isMobile }) => {
    await signInAs(context, "ops");
    await gotoReady(page, "/ops/students?q=Riya");
    await page.getByRole("cell", { name: /Riya Kulkarni/ }).click();
    if (!isMobile) {
      // On a wide screen the row opens the side card first.
      const panel = page.getByTestId("student-panel");
      await expect(page).toHaveURL(/student=st-riya/);
      await expect(panel.getByText("Runway")).toBeVisible();
      await expect(panel.getByText(/Sethi/).first()).toBeVisible();
      await panel.getByRole("link", { name: "Full profile" }).click();
    }
    await expect(page).toHaveURL(/\/ops\/students\/st-riya$/);
    await expect(page.getByRole("heading", { name: "Riya Kulkarni" })).toBeVisible();
    await expect(page.getByText("P1: first mock panel")).toBeVisible();
    await gotoReady(page, "/ops/students/nope");
    await expect(page.getByText("Student not found")).toBeVisible();
  });

  test("ledger totals and filter", async ({ page, context }) => {
    await signInAs(context, "ops");
    await gotoReady(page, "/ops/ledger");
    await expect(page.getByText("Plan revenue")).toBeVisible();
    await page.getByLabel("Type").selectOption("top-up");
    await expect(page).toHaveURL(/type=top-up/);
    await expect(page.getByText("Top-up mock").first()).toBeVisible();
  });
});

test.describe("One panel, three roles", () => {
  test("Riya books P2, ops assigns Arjun, Arjun scores, feedback returns to Riya", async ({
    page,
    context,
  }) => {
    // 1. Riya books her P2 panel.
    await signInAs(context, "student");
    await gotoReady(page, "/sessions/s-1004");
    await page.getByRole("radio", { name: /Mon 12 Oct · 6:00 PM/ }).click();
    await page.getByRole("button", { name: "Confirm slot" }).click();
    await expect(page.getByText("Booked", { exact: true })).toBeVisible();

    // 2. Ops sees it unassigned and assigns Arjun.
    await signInAs(context, "ops");
    await gotoReady(page, "/ops/sessions?tab=unassigned");
    await expect(page.getByRole("cell", { name: "Riya Kulkarni", exact: true })).toBeVisible();
    await gotoReady(page, "/ops/assignments");
    await expect(page.getByTestId("unassigned-count")).toContainText("4 panels");
    await page.getByTestId("unassigned-s-1004").click();
    const arjun = page.locator("[data-testid^=candidate-]").filter({ hasText: "Arjun Mehta" });
    await arjun.getByRole("button", { name: /^Assign/ }).click();
    await expect(page.getByTestId("unassigned-count")).toContainText("3 panels");

    // 3. Arjun sees it on Today, reads the brief, scores with send-back.
    await signInAs(context, "panelist");
    await gotoReady(page, "/panelist/today");
    await gotoReady(page, "/panelist/briefs/s-1004");
    await expect(page.getByRole("heading", { name: "Pull on these" })).toBeVisible();
    await page.getByRole("link", { name: "Start panel" }).click();
    await fillScore(page, { sendBack: true });
    await page.getByRole("button", { name: "Submit feedback" }).click();
    await expect(page.getByTestId("score-sent")).toContainText("sent back");

    // 4. Riya: feedback, answer bank and notifications all reflect it.
    await signInAs(context, "student");
    await gotoReady(page, "/feedback");
    await expect(page.getByRole("link", { name: /Arjun Mehta/ })).toHaveCount(2);
    await page
      .getByRole("link", { name: /Arjun Mehta/ })
      .first()
      .click();
    await expect(page.getByText(SCORING_NOTE)).toBeVisible();
    await gotoReady(page, "/answers?status=flagged");
    await expect(page.getByTestId("answer-row")).toHaveCount(5);
    await gotoReady(page, "/notifications");
    await expect(page.getByText("Arjun Mehta sent your feedback")).toBeVisible();
  });
});

test.describe("CV re-lock reviewed by ops", () => {
  test("Riya requests, ops approves, Riya sees V5 locked", async ({ page, context }) => {
    await signInAs(context, "student");
    await gotoReady(page, "/cv");
    await page.getByRole("button", { name: "Request Re-lock" }).click();
    await page.getByLabel("Why do you need to change it?").fill("Sharpened bullets after feedback");
    await page.getByRole("button", { name: "Send Request" }).click();
    await expect(page.getByText(/Re-lock requested/)).toBeVisible();

    await signInAs(context, "ops");
    await gotoReady(page, "/ops");
    await page.getByTestId("attn-relock-action").click();
    await expect(page.getByTestId("relock-request")).toContainText("Sharpened bullets");
    await page.getByRole("button", { name: "Approve re-lock" }).click();
    await expect(page.getByTestId("relock-request")).toHaveCount(0);

    await signInAs(context, "student");
    await gotoReady(page, "/cv");
    await expect(page.getByText("V5 · Locked").first()).toBeVisible();
    await expect(alerts(page)).toHaveCount(0);
  });
});

test.describe("Phone: panelist and ops", () => {
  test("no horizontal scroll on key screens", async ({ page, context, isMobile }) => {
    test.skip(!isMobile, "phone project only");
    const noHScroll = () =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      );
    await signInAs(context, "panelist");
    for (const path of ["/panelist/today", "/panelist/availability", "/panelist/scoring"]) {
      await gotoReady(page, path);
      expect(await noHScroll(), path).toBe(true);
    }
    await signInAs(context, "ops");
    for (const path of ["/ops", "/ops/assignments", "/ops/panelists/applications"]) {
      await gotoReady(page, path);
      expect(await noHScroll(), path).toBe(true);
    }
  });
});
