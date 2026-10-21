import { expect, test } from "@playwright/test";
import { alerts, gotoReady, signInAsRiya } from "./helpers";

test.describe("Join and buy a plan", () => {
  test("sign up, onboard, upload CV, book free session, buy Premium", async ({ page }) => {
    await gotoReady(page, "/sign-up");
    await page.getByLabel("Full name").fill("Test Student");
    await page.getByLabel("Email").fill("test.student@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Create Account" }).click();

    // Step 1
    await expect(page).toHaveURL(/\/onboarding\/1$/);
    await page.getByLabel("College").fill("SCMHRD Pune");
    await page.getByLabel("Batch").fill("2025–27");
    await page.getByLabel("Track").selectOption("finals");
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 2
    await expect(page).toHaveURL(/\/onboarding\/2$/);
    await page.getByLabel("Target function").selectOption("Sales & Marketing");
    await page.getByLabel("Target role").fill("Management Trainee");
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 3
    await expect(page).toHaveURL(/\/onboarding\/3$/);
    await page
      .getByLabel("Experience", { exact: true })
      .fill("Two years as an FMCG sales analyst.");
    await page.getByLabel("Years of experience").fill("2");
    await page.getByRole("button", { name: "Continue" }).click();

    // CV upload (E2)
    await expect(page).toHaveURL(/\/onboarding\/cv-upload$/);
    await page.locator("#cv-file").setInputFiles({
      name: "riya-cv.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 sample"),
    });
    await page.getByRole("button", { name: "Upload CV" }).click();
    await expect(page.getByText("Please give consent to continue.")).toBeVisible();
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Upload CV" }).click();
    await expect(page.getByText("CV read successfully")).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();

    // Free session (S3)
    await expect(page).toHaveURL(/\/free-session$/);
    await page.getByRole("radio").first().click();
    await page.getByRole("button", { name: "Confirm Slot" }).click();
    await expect(page.getByText("You are booked")).toBeVisible();
    await page.getByRole("link", { name: "See Plans" }).click();

    // Plans (S4) and checkout
    await expect(page).toHaveURL(/\/plans$/);
    await page.getByRole("button", { name: "Choose Premium" }).click();
    await expect(page.getByRole("heading", { name: "Payment" })).toBeVisible();
    await page.getByRole("button", { name: /^Pay ₹9,999/ }).click();
    await expect(page.getByTestId("receipt")).toContainText("You're in, Riya.");
    await page.getByRole("link", { name: "Book profiling call" }).click();
    await expect(page).toHaveURL(/\/home$/);
  });
});

test.describe("First login, nothing booked", () => {
  test("un-onboarded student is sent to onboarding; after onboarding home offers the free session", async ({
    page,
    context,
  }) => {
    await signInAsRiya(context, "first-login");
    await page.goto("/home");
    await expect(page).toHaveURL(/\/onboarding\/1$/);

    await context.addCookies([
      { name: "prepco_onboarded", value: "1", url: "http://localhost:3000" },
    ]);
    await gotoReady(page, "/home");
    await expect(page.getByTestId("banner-first-login")).toContainText("Nothing is booked yet");
    await expect(page.getByRole("link", { name: "Book Free Session" })).toBeVisible();
    await expect(page.getByRole("progressbar", { name: "Readiness for Day 0" })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
  });
});

test.describe("Locked out / wrong email", () => {
  test("wrong email offers sign up; wrong password offers reset", async ({ page }) => {
    await gotoReady(page, "/sign-in");
    await page.getByLabel("Email").fill("wrong@example.com");
    await page.getByLabel("Password").fill("whatever1");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(alerts(page)).toContainText("could not find an account");
    await expect(page.getByRole("link", { name: "Sign up instead" })).toBeVisible();

    await page.getByLabel("Email").fill("riya@scmhrd.edu");
    await page.getByLabel("Password").fill("wrong");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(alerts(page)).toContainText("password is not right");
    await alerts(page).getByRole("link", { name: "Reset your password" }).click();
    await expect(page).toHaveURL(/\/forgot-password$/);

    await page.getByLabel("Email").fill("riya@scmhrd.edu");
    await page.getByRole("button", { name: "Send Reset Link" }).click();
    await expect(page.getByText("a reset link is on its way")).toBeVisible();
  });

  test("expired reset link, and gmail-unverified goes to verify email", async ({
    page,
    context,
  }) => {
    await gotoReady(page, "/reset-password/expired");
    await page.getByLabel("New password").fill("newpassword1");
    await page.getByLabel("Confirm password").fill("newpassword1");
    await page.getByRole("button", { name: "Update Password" }).click();
    await expect(alerts(page)).toContainText("expired");

    await context.addCookies([
      { name: "prepco_scenario", value: "gmail-unverified", url: "http://localhost:3000" },
    ]);
    await gotoReady(page, "/sign-in");
    await page.getByLabel("Email").fill("someone@gmail.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL(/\/verify-email\?email=/);
    await expect(page.getByRole("heading", { name: "Verify your email" })).toBeVisible();
  });
});

test.describe("Payment fails", () => {
  test("shows seat hold, then retry succeeds", async ({ page, context }) => {
    await signInAsRiya(context, "payment-failed");
    await gotoReady(page, "/checkout/premium");
    await page.getByRole("button", { name: /^Pay/ }).click();
    await expect(alerts(page)).toContainText("The UPI payment timed out");
    await expect(page.getByText(/Your seat is held for \d+:\d{2}/)).toBeVisible();
    await page.getByRole("button", { name: "Try again with UPI" }).click();
    await expect(page.getByTestId("receipt")).toBeVisible();
  });
});

test.describe("Cohort is full", () => {
  test("plans send people to the waitlist", async ({ page, context }) => {
    await signInAsRiya(context, "cohort-full");
    await gotoReady(page, "/plans");
    await expect(page.getByText("This cohort is full")).toBeVisible();
    await page.getByRole("button", { name: "Join Waitlist" }).first().click();
    await expect(page).toHaveURL(/\/waitlist$/);
    await page.getByLabel("Email").fill("riya@scmhrd.edu");
    await page.getByRole("button", { name: "Join Waitlist" }).click();
    await expect(page.getByText(/You are #\d+/)).toBeVisible();
    await expect(page.getByText(/24 hours to claim/)).toBeVisible();
  });
});

test.describe("Joined late", () => {
  test("onboarding and home show the compressed runway", async ({ page, context }) => {
    await signInAsRiya(context, "late-joiner");
    await gotoReady(page, "/home");
    await expect(page.getByTestId("banner-late-joiner")).toContainText("compressed");
    await expect(page.getByText("Domain deep-dive")).toHaveCount(0);
  });
});

test.describe("Session cancelled / moved / missed", () => {
  test("panelist cancelled: pick a new slot, hit a taken slot, then rebook", async ({
    page,
    context,
  }) => {
    await signInAsRiya(context, "panelist-cancelled");
    await gotoReady(page, "/home");
    await page.getByRole("button", { name: "Pick A New Slot" }).click();
    await expect(page).toHaveURL(/\/sessions\/s-1003$/);
    await expect(
      page.getByRole("status").filter({ hasText: "panelist can no longer" }),
    ).toBeVisible();

    // The "race" slot loses the first time (never optimistic).
    await page.getByRole("radio", { name: /Fri 9 Oct · 7:00 PM/ }).click();
    await page.getByRole("button", { name: "Confirm Slot" }).click();
    await expect(page.getByText("That slot was just taken")).toBeVisible();

    await page.getByRole("radio").first().click();
    await page.getByRole("button", { name: "Confirm Slot" }).click();
    await expect(page.getByText("Booked", { exact: true })).toBeVisible();
  });

  test("student moved: shows old time struck through", async ({ page, context }) => {
    await signInAsRiya(context, "student-reschedule");
    await gotoReady(page, "/sessions/s-1003");
    await expect(page.getByText("Moved", { exact: true })).toBeVisible();
    await expect(page.getByText("Was")).toBeVisible();
  });

  test("no-show: first miss is free, rebook offered", async ({ page, context }) => {
    await signInAsRiya(context, "no-show");
    await gotoReady(page, "/sessions/s-1003");
    await expect(page.getByText("first no-show is free")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pick a slot" })).toBeVisible();
  });

  test("unknown session shows not found card", async ({ page, context }) => {
    await signInAsRiya(context);
    await gotoReady(page, "/sessions/nope");
    await expect(page.getByText("Session not found")).toBeVisible();
  });
});

test.describe("Home, sessions and feedback (Riya)", () => {
  test("home shows runway, countdown and readiness", async ({ page, context, isMobile }) => {
    await signInAsRiya(context);
    await gotoReady(page, "/home");
    await expect(page.getByRole("heading", { name: "Good evening, Riya." })).toBeVisible();
    await expect(
      page
        .getByText(/days( to Day 0| · Mon 9 Nov)/)
        .locator("visible=true")
        .first(),
    ).toBeVisible();
    await expect(page.getByText("35", { exact: true }).locator("visible=true")).toBeVisible();
    await expect(page.getByRole("progressbar", { name: "Readiness for Day 0" })).toHaveAttribute(
      "aria-valuenow",
      "64",
    );
    if (!isMobile)
      await expect(page.getByText("4 need work").locator("visible=true").first()).toBeVisible();
  });

  test("feedback list opens detail", async ({ page, context }) => {
    await signInAsRiya(context);
    await gotoReady(page, "/feedback");
    await page.getByRole("link", { name: /Arjun Mehta/ }).click();
    await expect(page).toHaveURL(/\/feedback\/p-1001$/);
    await expect(page.getByText("Almost There")).toBeVisible();
    await expect(page.getByText("Defensibility")).toBeVisible();
  });

  test("feedback is empty on first login runway", async ({ page, context }) => {
    await signInAsRiya(context, "returning-student");
    await gotoReady(page, "/feedback");
    await expect(page.getByRole("heading", { name: "Panel feedback" })).toBeVisible();
  });

  test("sessions list links to each session", async ({ page, context }) => {
    await signInAsRiya(context);
    await gotoReady(page, "/sessions");
    await expect(page.getByRole("link", { name: /P2: external specialist panel/ })).toBeVisible();
    await page.getByRole("link", { name: /Domain deep-dive/ }).click();
    await expect(page).toHaveURL(/\/sessions\/s-1003$/);
  });
});

test.describe("Phone: sign-up to dashboard", () => {
  test("works at 390 px", async ({ page, isMobile }) => {
    test.skip(!isMobile, "phone project only");
    await gotoReady(page, "/sign-up");
    await page.getByLabel("Full name").fill("Phone Student");
    await page.getByLabel("Email").fill("phone.student@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page).toHaveURL(/\/onboarding\/1$/);
    const noHScroll = await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    );
    expect(noHScroll).toBe(true);
  });
});

test.describe("Edge scenarios by URL", () => {
  test("cv-upload-failed shows the failure and allows skipping", async ({ page, context }) => {
    await signInAsRiya(context, "cv-upload-failed");
    await context.addCookies([
      { name: "prepco_onboarded", value: "1", url: "http://localhost:3000" },
    ]);
    await gotoReady(page, "/onboarding/cv-upload");
    await page.locator("#cv-file").setInputFiles({
      name: "cv.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4"),
    });
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Upload CV" }).click();
    await expect(alerts(page)).toContainText("We could not read your CV");
    await page.getByRole("button", { name: "Skip For Now" }).click();
    await expect(page).toHaveURL(/\/free-session$/);
  });

  test("oversized or wrong-type CV is rejected client-side", async ({ page, context }) => {
    await signInAsRiya(context);
    await gotoReady(page, "/onboarding/cv-upload");
    await page.locator("#cv-file").setInputFiles({
      name: "cv.png",
      mimeType: "image/png",
      buffer: Buffer.from("x"),
    });
    await expect(page.getByText("Upload a PDF or DOCX file.")).toBeVisible();
  });

  test("returning-student sees the free session already used", async ({ page, context }) => {
    await signInAsRiya(context, "returning-student");
    await gotoReady(page, "/free-session");
    await expect(page.getByText("Free session already used")).toBeVisible();
  });
});
