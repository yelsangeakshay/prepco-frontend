import { expect, test } from "@playwright/test";
import { alerts, gotoReady, openFromNav, signInAsRiya } from "./helpers";

test.describe("Prepare for Day 0", () => {
  test("sharpen a CV bullet, request a re-lock, then rework a flagged answer", async ({
    page,
    context,
  }) => {
    await signInAsRiya(context);
    await gotoReady(page, "/cv");
    await expect(page.getByText("V4 · Locked").first()).toBeVisible();
    await expect(page.getByTestId("overall-score")).toHaveText("84");

    // Edit a bullet: the three tests preview live, the score moves after saving.
    await page.getByRole("button", { name: /Edit bullet: Built a weekly sales dashboard/ }).click();
    const editor = page.getByRole("textbox", {
      name: /Edit bullet: Built a weekly sales dashboard/,
    });
    await editor.fill(
      "Led a weekly sales dashboard for 6 regional managers instead of ad-hoc reports",
    );
    await page.getByRole("button", { name: "Save Bullet" }).click();
    await expect(page.getByTestId("overall-score")).not.toHaveText("84");
    expect(Number(await page.getByTestId("overall-score").textContent())).toBeGreaterThan(84);

    // Re-lock request
    await page.getByRole("button", { name: "Request Re-lock" }).click();
    await page
      .getByLabel("Why do you need to change it?")
      .fill("Sharpened bullets after panel feedback");
    await page.getByRole("button", { name: "Send Request" }).click();
    await expect(page.getByText(/Re-lock requested/)).toBeVisible();

    // Versions
    await page.getByRole("link", { name: "Versions" }).click();
    await expect(page.getByRole("heading", { name: "CV versions" })).toBeVisible();
    await expect(page.getByText("V5 draft")).toBeVisible();
    await expect(page.getByText("V4 · Locked")).toBeVisible();

    // Answer bank: the Flagged filter is in the URL. The fit round holds 3 of the 4 flagged answers.
    await gotoReady(page, "/answers");
    await page.getByRole("tab", { name: "Flagged" }).click();
    await expect(page).toHaveURL(/status=flagged/);
    await expect(page.getByTestId("answer-row")).toHaveCount(3);

    // The MT answer carries the panel note and the three parts.
    await gotoReady(page, "/answers/a-1009");
    await expect(page.getByText("Panel note:")).toBeVisible();
    await expect(page.getByLabel("Situation")).toHaveValue(/400\+ outlets in West Delhi/);
    await expect(page.getByLabel("Result")).toHaveValue("");
    await page.getByRole("button", { name: "Mark Rehearsed" }).click();
    await expect(page.getByTestId("answer-status")).toContainText("Rehearsed");

    await page.getByRole("link", { name: "All answers" }).click();
    await page.getByRole("tab", { name: "Flagged" }).click();
    await expect(page.getByTestId("answer-row")).toHaveCount(2);
  });

  test("write the three parts of an answer and send it for review", async ({ page, context }) => {
    await signInAsRiya(context);
    await gotoReady(page, "/answers/a-1015");
    await expect(page.getByTestId("answer-status")).toContainText("Not drafted");
    await expect(page.getByRole("button", { name: "Send for review" })).toBeDisabled();
    await page
      .getByLabel("Situation")
      .fill("Our West Delhi outlets were split across 20 trade clusters.");
    await page
      .getByLabel("Decision")
      .fill("I mapped white space before the next distributor review.");
    await page.getByRole("button", { name: "Send for review" }).click();
    await expect(page.getByText("Draft 1")).toBeVisible();
    await expect(page.getByTestId("answer-status")).toContainText("Flagged");
    await expect(page.getByRole("switch", { name: "Rehearse in my next panel" })).toBeVisible();
  });

  test("answer drafts survive a reload until saved", async ({ page, context }) => {
    await signInAsRiya(context);
    await gotoReady(page, "/answers/a-1001");
    await page.getByLabel("Situation").fill("A fresh opening that I have not saved yet.");
    await page.reload();
    await expect(page.getByText("Restored your unsaved draft.")).toBeVisible();
    await page.getByRole("button", { name: "Discard" }).click();
    await expect(page.getByText("Restored your unsaved draft.")).toHaveCount(0);
  });

  test("round tabs and filters live in the URL, and a row opens its answer", async ({
    page,
    context,
    isMobile,
  }) => {
    await signInAsRiya(context);
    await gotoReady(page, "/answers");
    await expect(page.getByText("+ 7 more in Fit round")).toBeVisible();
    await page.getByRole("tab", { name: /CV deep-dive/ }).click();
    await expect(page).toHaveURL(/round=cv/);
    await expect(page.getByTestId("answer-row")).toHaveCount(4);
    await page.getByRole("tab", { name: /Fit round/ }).click();
    await page.getByRole("tab", { name: "Not drafted" }).click();
    await expect(page.getByTestId("answer-row")).toHaveCount(2);
    await page.getByRole("tab", { name: "All" }).click();
    await expect(page.getByTestId("answer-row")).toHaveCount(7);
    await page.getByTestId("answer-row").nth(1).click();
    if (isMobile) {
      await expect(page).toHaveURL(/\/answers\/a-1003$/);
    } else {
      await expect(page).toHaveURL(/a=a-1003/);
    }
    await expect(page.getByRole("heading", { name: "Why MBA, and why now?" })).toBeVisible();
  });
});

test.describe("Routes and extras", () => {
  test("journey, quick switch, locked case track", async ({ page, context }) => {
    await signInAsRiya(context);
    await gotoReady(page, "/journey");
    await expect(page.getByRole("heading", { name: "Four routes to an offer" })).toBeVisible();
    await expect(page.getByText("You joined at Term 5–6")).toBeVisible();
    await expect(page.getByText("Your route", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Final placements" }).first()).toBeVisible();

    // Quick Switch: the agent, with the function comparison below it.
    await gotoReady(page, "/quick-switch");
    await expect(page.getByText("Today's digest · 3 new matches")).toBeVisible();
    await page.getByRole("button", { name: "Save Business Analyst: Consulting" }).click();
    await expect(
      page.getByRole("button", { name: "Saved Business Analyst: Consulting" }),
    ).toBeVisible();
    await page.getByLabel("Only send matches with fit above").fill("90");
    await page.getByRole("button", { name: "Save preferences" }).click();
    await expect(page.getByText("Today's digest · 2 new matches")).toBeVisible();

    await page.getByLabel("Compare with").selectOption("Finance");
    await expect(page.getByTestId("quick-switch-result")).toContainText(
      "9 of 18 answers carry over",
    );

    await gotoReady(page, "/case-track");
    await expect(page.getByTestId("case-locked")).toContainText("Preview · Included with Elite");
    await expect(page.getByText("5 of 22 left")).toBeVisible();
    await expect(page.getByText("Case track · runs in parallel from Week -12")).toBeVisible();
    await page.getByRole("link", { name: /^Upgrade to Elite · ₹4,000/ }).click();
    await expect(page).toHaveURL(/\/billing\/upgrade$/);
  });
});

test.describe("Upgrade mid-season", () => {
  test("Premium to Elite with top-up credit, then the case track opens", async ({
    page,
    context,
    isMobile,
  }) => {
    await signInAsRiya(context);
    await gotoReady(page, "/billing");
    await expect(page.getByTestId("credits")).toHaveText("2 of 6 done");
    await page.getByRole("link", { name: /^Upgrade (to Elite|· ₹4,000)/ }).click();

    await expect(page.getByTestId("payable")).toHaveText("₹4,000");
    await page.getByRole("button", { name: /^Upgrade for ₹4,000/ }).click();
    await expect(page.getByTestId("upgrade-receipt")).toContainText("You are on Elite");

    await page.getByRole("link", { name: "Open Case Track" }).click();
    await expect(page.getByTestId("case-modules")).toBeVisible();

    await openFromNav(page, "Plan & billing", isMobile);
    await expect(page.locator("main")).toContainText("Paid ₹13,999");
    await expect(page.getByRole("link", { name: /^Upgrade (to Elite|·)/ })).toHaveCount(0);
  });

  test("payment-failed upgrade can be retried", async ({ page, context }) => {
    await signInAsRiya(context, "payment-failed");
    await gotoReady(page, "/billing/upgrade");
    await page.getByRole("button", { name: /^Upgrade for/ }).click();
    await expect(alerts(page)).toContainText("Payment failed");
    await page.getByRole("button", { name: /^Retry payment/ }).click();
    await expect(page.getByTestId("upgrade-receipt")).toBeVisible();
  });

  test("Elite full: offers the waitlist", async ({ page, context }) => {
    await signInAsRiya(context, "cohort-full");
    await gotoReady(page, "/billing/upgrade");
    await expect(page.getByText("Elite is full right now.")).toBeVisible();
    await page.getByRole("link", { name: "Join Waitlist" }).click();
    await expect(page).toHaveURL(/\/waitlist$/);
  });

  test("basic-ended shows the ended plan", async ({ page, context }) => {
    await signInAsRiya(context, "basic-ended");
    await gotoReady(page, "/billing");
    await expect(page.getByTestId("basic-ended")).toContainText("ended");
  });
});

test.describe("Day 0 moves", () => {
  test("banner, countdown and notification all agree", async ({ page, context }) => {
    await signInAsRiya(context, "day0-moved");
    await gotoReady(page, "/home");
    await expect(page.getByTestId("banner-day0-moved")).toContainText("Mon 9 Nov");
    await expect(page.getByText("42", { exact: true }).locator("visible=true")).toBeVisible();

    // Bell drawer, on a page that is not /notifications
    await expect(page.locator("[data-testid=bell-dot]:visible")).toBeVisible();
    await page.getByRole("button", { name: /^Notifications, \d+ unread/ }).click();
    const drawer = page.getByRole("dialog", { name: "Notifications" });
    await expect(drawer.getByText("Day 0 moved to Mon 16 Nov")).toBeVisible();
    await drawer.getByRole("button", { name: /Day 0 moved to Mon 16 Nov/ }).click();
    await expect(page).toHaveURL(/\/journey$/);
  });
});

test.describe("Notifications", () => {
  test("mark all read clears the dot", async ({ page, context }) => {
    await signInAsRiya(context);
    await gotoReady(page, "/notifications");
    await expect(page.getByText(/\d+ unread/)).toBeVisible();
    await page.getByRole("button", { name: "Mark all read" }).click();
    await expect(page.getByText("0 unread")).toBeVisible();
    await expect(page.getByTestId("bell-dot")).toHaveCount(0);
  });
});

test.describe("After Day 0", () => {
  test("placed", async ({ page, context }) => {
    await signInAsRiya(context, "placed");
    await gotoReady(page, "/home");
    await expect(page.getByTestId("banner-placed")).toBeVisible();
    await gotoReady(page, "/outcome");
    await expect(page.getByTestId("outcome-placed")).toContainText("Northwind Consumer Brands");
    await expect(page.getByTestId("outcome-placed")).toContainText("₹12,00,000");
  });

  test("report an outcome yourself", async ({ page, context }) => {
    await signInAsRiya(context);
    await gotoReady(page, "/outcome");
    await page.getByRole("button", { name: /Placed on Day 0/ }).click();
    await page.getByRole("button", { name: "Save my result" }).click();
    await expect(page.getByText("Enter the company")).toBeVisible();
    await page.getByLabel("Company (private)").fill("Acme Foods");
    await page.getByLabel("Role", { exact: true }).fill("Sales MT");
    await page.getByLabel("Annual CTC (₹)").fill("1050000");
    await page.getByRole("button", { name: "Save my result" }).click();
    await expect(page.getByTestId("outcome-placed")).toContainText("₹10,50,000");
  });
});

test.describe("Target role changes", () => {
  test("change to Finance flags answers", async ({ page, context }) => {
    await signInAsRiya(context);
    await gotoReady(page, "/profile/change-target");
    await page.getByRole("button", { name: "Finance", exact: true }).click();
    await page.getByRole("button", { name: "Confirm change to Finance" }).click();
    await expect(page.getByTestId("target-result")).toContainText("4 answers");

    await page.getByRole("link", { name: "Back To Profile" }).click();
    await expect(page.getByTestId("target")).toHaveValue("Finance");
    await expect(page.getByTestId("target-changed")).toBeVisible();
  });

  test("target-change scenario shows the notice", async ({ page, context }) => {
    await signInAsRiya(context, "target-change");
    await gotoReady(page, "/profile");
    await expect(page.getByTestId("target-changed")).toContainText("6 answers need rework");
  });
});

test.describe("Profile", () => {
  test("edit details with validation", async ({ page, context }) => {
    await signInAsRiya(context);
    await gotoReady(page, "/profile");
    await page.getByLabel("College", { exact: true }).fill("");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Enter your college")).toBeVisible();
    await page.getByLabel("College", { exact: true }).fill("SCMHRD Pune, Symbiosis");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Profile saved")).toBeVisible();
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("No changes to save")).toBeVisible();
  });
});

test.describe("On a phone, start to finish", () => {
  test("home, more sheet, bell drawer, tools at 390 px", async ({ page, context, isMobile }) => {
    test.skip(!isMobile, "phone project only");
    await signInAsRiya(context);
    await gotoReady(page, "/home");
    const noHScroll = () =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      );
    expect(await noHScroll()).toBe(true);

    await openFromNav(page, "Plan & billing", true);
    await expect(page).toHaveURL(/\/billing$/);
    expect(await noHScroll()).toBe(true);

    await page.getByRole("button", { name: /^Notifications/ }).click();
    await expect(page.getByRole("dialog", { name: "Notifications" })).toBeVisible();
    await page.getByRole("button", { name: "Close" }).click();

    await openFromNav(page, "Answer bank", true);
    await expect(page).toHaveURL(/\/answers$/);
    await page.getByRole("tab", { name: "Flagged" }).click();
    await expect(page.getByTestId("answer-row")).toHaveCount(3);
    expect(await noHScroll()).toBe(true);

    await openFromNav(page, "CV Builder", true);
    await expect(page).toHaveURL(/\/cv$/);
    expect(await noHScroll()).toBe(true);

    await openFromNav(page, "Sessions & runway", true);
    await expect(page).toHaveURL(/\/sessions$/);
    expect(await noHScroll()).toBe(true);
  });
});

test.describe("Not placed, credit carried over", () => {
  test("outcome page, home banner, and billing agree", async ({ page, context, isMobile }) => {
    await signInAsRiya(context, "not-placed");
    await gotoReady(page, "/home");
    await expect(page.getByTestId("banner-not-placed")).toContainText("credit is carried over");
    await openFromNav(page, "Plan & billing", isMobile);
    await expect(page.getByRole("heading", { name: "Plan & billing" })).toBeVisible();
    await gotoReady(page, "/outcome");
    await expect(page.getByTestId("outcome-not-placed")).toContainText("₹9,999");
    await expect(page.getByTestId("outcome-not-placed")).toContainText("full credit");
  });
});
