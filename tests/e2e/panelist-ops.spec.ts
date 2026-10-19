import { expect, test, type Page } from "@playwright/test";
import { alerts, gotoReady, signInAs } from "./helpers";

const SCORING_NOTE = "Clear structure. Prepare one defensible number for the pricing trade-off.";

async function fillScore(page: Page, opts: { sendBack?: boolean } = {}) {
  for (const d of ["Structure", "Defensibility", "Composure"]) {
    await page.getByRole("radio", { name: `${d} 4 of 5` }).click();
  }
  await page.getByRole("radio", { name: "Almost There" }).click();
  await page.getByLabel("Feedback note").fill(SCORING_NOTE);
  if (opts.sendBack) await page.getByRole("switch", { name: "Send back to builder" }).click();
}

async function pickByText(
  page: Page,
  selectScope: ReturnType<Page["locator"]>,
  startsWith: string,
) {
  const select = selectScope.getByRole("combobox");
  const opts = await select.locator("option").allTextContents();
  const i = opts.findIndex((t) => t.startsWith(startsWith));
  expect(i, `option starting with ${startsWith}`).toBeGreaterThan(0);
  await select.selectOption({ index: i });
}

test.describe("Become a panelist", () => {
  test("apply, then ops approves and the roster grows", async ({ page, context }) => {
    await gotoReady(page, "/panelist/apply");
    await page.getByRole("button", { name: "Submit Application" }).click();
    await expect(page.getByText("Enter your full name")).toBeVisible();
    await expect(page.getByText("Enter a valid email")).toBeVisible();

    await page.getByLabel("Full name").fill("Meera Kapoor");
    await page.getByLabel("Work email").fill("meera.kapoor@example.com");
    await page.getByLabel("Function you can assess").selectOption("Finance");
    await page.getByLabel("Company").fill("Tailspin Finance");
    await page.getByLabel("Current role").fill("Associate Director");
    await page.getByLabel("Years of experience").fill("2");
    await page.getByLabel("Hours per month").fill("8");
    await page
      .getByLabel("Why do you want to join?")
      .fill("I want to coach students on the finance questions I once got wrong.");
    await page.getByRole("button", { name: "Submit Application" }).click();
    await expect(page.getByText("We need at least 3 years")).toBeVisible();
    await page.getByLabel("Years of experience").fill("9");
    await page.getByRole("button", { name: "Submit Application" }).click();
    await expect(page).toHaveURL(/\/panelist\/apply\/submitted$/);
    await expect(page.getByRole("heading", { name: "Application received" })).toBeVisible();

    await signInAs(context, "ops");
    await gotoReady(page, "/ops/panelists/applications");
    const card = page.getByTestId("application-app-009");
    await expect(card).toContainText("Meera Kapoor");
    await card.getByRole("button", { name: /Approve/ }).click();
    await expect(card).toHaveCount(0);

    await gotoReady(page, "/ops/panelists?q=Meera");
    await expect(page.getByText("Meera Kapoor").first()).toBeVisible();
  });
});

test.describe("Run a panel", () => {
  test("tonight: brief, validation, score, count goes up", async ({ page, context }) => {
    await signInAs(context, "panelist");
    await gotoReady(page, "/panelist/today");
    await expect(
      page.getByText("Panels this season").locator("..").getByText("12", { exact: true }),
    ).toBeVisible();
    const tonight = page.locator("section[aria-labelledby=today-h]");
    await expect(tonight.getByRole("link", { name: "View Brief" })).toHaveCount(2);

    await tonight.getByRole("link", { name: "View Brief" }).first().click();
    await expect(page.getByRole("heading", { name: /^Brief:/ })).toBeVisible();
    await expect(page.getByText("Suggested questions")).toBeVisible();
    await page.getByRole("link", { name: "Start Scoring" }).click();

    await expect(page).toHaveURL(/\/panelist\/scoring\/b-\d+$/);
    await page.getByRole("button", { name: "Send Feedback" }).click();
    await expect(page.getByText("Score every dimension").first()).toBeVisible();
    await expect(page.getByText("Pick a verdict")).toBeVisible();

    await fillScore(page);
    await page.getByRole("button", { name: "Send Feedback" }).click();
    await expect(page.getByTestId("score-sent")).toBeVisible();
    await page.getByRole("link", { name: "Back To Today" }).click();
    await expect(
      page.getByText("Panels this season").locator("..").getByText("13", { exact: true }),
    ).toBeVisible();
    await expect(
      page.locator("section[aria-labelledby=today-h]").getByRole("link", { name: "View Brief" }),
    ).toHaveCount(1);
  });

  test("an unsent score survives a reload", async ({ page, context }) => {
    await signInAs(context, "panelist");
    await gotoReady(page, "/panelist/scoring");
    await page.getByRole("link", { name: "Score Now" }).first().click();
    await page.getByRole("radio", { name: "Structure 5 of 5" }).click();
    await page.getByLabel("Feedback note").fill("A draft note that is long enough to keep.");
    await page.reload();
    await expect(page.getByText("Restored your unsent draft.")).toBeVisible();
    await expect(page.getByRole("radio", { name: "Structure 5 of 5" })).toBeChecked();
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
    await expect(page.getByTestId("open-count")).toHaveText("9");
    await expect(page.getByRole("button", { name: "Mon 18:00, booked" })).toBeDisabled();

    const save = page.getByRole("button", { name: "Save Availability" });
    await expect(save).toBeDisabled();
    await page.getByRole("button", { name: "Sat 19:00" }).click();
    await expect(page.getByTestId("open-count")).toHaveText("10");
    await save.click();
    await expect(save).toBeDisabled();

    await page.reload();
    await expect(page.getByTestId("open-count")).toHaveText("10");
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
    await expect(page.getByTestId("attn-unassigned")).toContainText("7");
    await expect(page.getByTestId("attn-applications")).toContainText("5");

    await page.getByTestId("attn-unassigned").click();
    await expect(page).toHaveURL(/\/ops\/assignments$/);
    await expect(page.getByTestId("unassigned-count")).toContainText("7 panels");
    if (!isMobile) {
      await expect(
        page.getByRole("navigation", { name: "Primary" }).getByText("7", { exact: true }),
      ).toBeVisible();
    }

    const first = page.locator("[data-testid^=unassigned-b-]").first();
    const select = first.getByRole("combobox");
    const options = await select.locator("option").allTextContents();
    const freeIdx = options.findIndex((t) => t.endsWith("· free"));
    expect(freeIdx).toBeGreaterThan(0);
    await select.selectOption({ index: freeIdx });
    await first.getByRole("button", { name: "Assign" }).click();
    await expect(page.getByTestId("unassigned-count")).toContainText("6 panels");

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
    await expect(page.getByTestId("attn-unassigned")).toContainText("6");
    await expect(page.getByTestId("attn-applications")).toContainText("4");
  });
});

test.describe("Keep the panel healthy", () => {
  test("find panelists who need attention, remind one, pause one", async ({ page, context }) => {
    await signInAs(context, "ops");
    await gotoReady(page, "/ops/panelists?health=needs-attention");
    await expect(page.getByText(/feedback overdue/).first()).toBeVisible();
    const reminders = page.getByRole("button", { name: /^Send Reminder/ });
    const n = await reminders.count();
    expect(n).toBeGreaterThan(0);
    await reminders.first().click();
    await expect(reminders).toHaveCount(n - 1);

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
    await expect(page.getByText("1,000 match")).toBeVisible();
    const rendered = await page.locator("tbody tr").count();
    expect(rendered).toBeLessThan(60);

    await gotoReady(page, "/ops/students");
    await page.getByLabel("Plan").selectOption("elite");
    await expect(page).toHaveURL(/plan=elite/);
    await expect(page.getByText("41 match")).toBeVisible();

    await page.getByRole("button", { name: "Readiness" }).click();
    await expect(page).toHaveURL(/sort=readiness%3Aasc/);
    await page.getByLabel("Search").fill("zzzzzz");
    await expect(page).toHaveURL(/q=zzzzzz/);
    await expect(page.getByText("No students match").first()).toBeVisible();
  });

  test("student detail", async ({ page, context }) => {
    await signInAs(context, "ops");
    await gotoReady(page, "/ops/students?q=Riya");
    await page.getByRole("cell", { name: /Riya Kulkarni/ }).click();
    await expect(page).toHaveURL(/\/ops\/students\/st-riya$/);
    await expect(page.getByRole("heading", { name: "Riya Kulkarni" })).toBeVisible();
    await expect(page.getByText("P1 first mock panel")).toBeVisible();
    await gotoReady(page, "/ops/students/nope");
    await expect(page.getByText("Student not found")).toBeVisible();
  });

  test("ledger totals and filter", async ({ page, context }) => {
    await signInAs(context, "ops");
    await gotoReady(page, "/ops/ledger");
    await expect(page.getByText("Payments").first()).toBeVisible();
    await page.getByLabel("Type").selectOption("refund");
    await expect(page).toHaveURL(/type=refund/);
    await expect(page.getByText("Refund · seat released").first()).toBeVisible();
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
    await page.getByRole("button", { name: "Confirm Slot" }).click();
    await expect(page.getByText("Booked", { exact: true })).toBeVisible();

    // 2. Ops sees it unassigned and assigns Arjun.
    await signInAs(context, "ops");
    await gotoReady(page, "/ops/sessions?tab=unassigned");
    await expect(page.getByRole("cell", { name: "Riya Kulkarni" })).toBeVisible();
    await gotoReady(page, "/ops/assignments");
    await expect(page.getByTestId("unassigned-count")).toContainText("8 panels");
    const row = page.getByTestId("unassigned-s-1004");
    await pickByText(page, row, "Arjun Mehta");
    await row.getByRole("button", { name: "Assign" }).click();
    await expect(page.getByTestId("unassigned-count")).toContainText("7 panels");

    // 3. Arjun sees it on Today, reads the brief, scores with send-back.
    await signInAs(context, "panelist");
    await gotoReady(page, "/panelist/today");
    await expect(page.getByText("Riya Kulkarni")).toBeVisible();
    await gotoReady(page, "/panelist/briefs/s-1004");
    await expect(page.getByText("Probe these answers")).toBeVisible();
    await page.getByRole("link", { name: "Start Scoring" }).click();
    await fillScore(page, { sendBack: true });
    await page.getByRole("button", { name: "Send Feedback" }).click();
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
    await expect(page.getByRole("button", { name: "Open Answer" })).toHaveCount(6);
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
    await page.getByTestId("attn-relock").click();
    await expect(page.getByTestId("relock-request")).toContainText("Sharpened bullets");
    await page.getByRole("button", { name: "Approve Re-lock" }).click();
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
