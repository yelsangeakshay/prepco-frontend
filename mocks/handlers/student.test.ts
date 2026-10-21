import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { server } from "@/mocks/server";
import { resetDb } from "@/mocks/db";
import { ApiError } from "@/lib/api/client";
import {
  bookSession,
  getFeedback,
  getFreeSession,
  getPlans,
  getRunway,
  getSessionSlots,
  getSessions,
  postCheckout,
  signIn,
  signUp,
} from "@/lib/api/endpoints";

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const asScenario = (name: string | null) => {
  document.cookie = name
    ? `prepco_scenario=${name}; path=/`
    : "prepco_scenario=; path=/; max-age=0";
};

beforeEach(() => {
  resetDb();
  asScenario(null);
});

const code = async (p: Promise<unknown>) => {
  try {
    await p;
    return null;
  } catch (e) {
    return e instanceof ApiError ? e.code : "other";
  }
};

describe("runway", () => {
  it("base: Riya has 2 of 6 sessions done, Day 0 in 35 days, deep-dive next", async () => {
    const r = await getRunway();
    expect(r.doneCount).toBe(2);
    expect(r.totalCount).toBe(6);
    expect(r.day0.daysLeft).toBe(35);
    expect(r.student.readiness).toBe(64);
    expect(r.steps.find((s) => s.status === "next")?.title).toBe("Domain deep-dive");
    expect(r.steps.find((s) => s.status === "pick-slot")?.id).toBe("s-1004");
    expect(r.cv).toMatchObject({ version: "V4", locked: true, score: 84 });
    expect(r.answers).toMatchObject({ total: 18, prepared: 12, needWork: 4 });
  });

  it("late-joiner compresses the runway", async () => {
    asScenario("late-joiner");
    const r = await getRunway();
    expect(r.totalCount).toBe(3);
    expect(r.banner).toBe("late-joiner");
  });

  it("day0-moved shifts Day 0 by a week", async () => {
    asScenario("day0-moved");
    const r = await getRunway();
    expect(r.day0.daysLeft).toBe(42);
    expect(r.day0.movedFrom).toBe("Mon 9 Nov");
  });

  it("panelist-cancelled surfaces the deep-dive as needing a slot", async () => {
    asScenario("panelist-cancelled");
    const r = await getRunway();
    expect(r.nextSession?.status).toBe("cancelled");
    expect(r.steps.find((s) => s.id === "s-1003")?.status).toBe("pick-slot");
  });

  it("first-login has nothing booked and no feedback", async () => {
    asScenario("first-login");
    const r = await getRunway();
    expect(r.doneCount).toBe(0);
    expect(r.student.readiness).toBe(0);
    expect((await getFeedback()).items).toHaveLength(0);
  });
});

describe("booking", () => {
  it("s09: the P2 session offers the four drawn slots and every session has a runway line", async () => {
    const slots = (await getSessionSlots("s-1004")).items;
    expect(slots.map((s) => s.label)).toEqual([
      "Mon 12 Oct · 6:00 PM IST",
      "Mon 12 Oct · 7:30 PM IST",
      "Tue 13 Oct · 6:30 PM IST",
      "Wed 14 Oct · 8:00 PM IST",
    ]);
    const list = await getSessions();
    expect(list.items.every((s) => !!s.blurb)).toBe(true);
    expect(list.items[1]?.blurb).toBe("External industry expert · your baseline");
  });

  it("race slot loses once with slot_taken, then succeeds; taken slots always fail", async () => {
    expect(await code(bookSession("s-1004", "s-1004-race"))).toBe("slot_taken");
    const booked = await bookSession("s-1004", "s-1004-race");
    expect(booked.status).toBe("upcoming");
    const list = await getSessions();
    expect(list.items.find((s) => s.id === "s-1004")?.status).toBe("upcoming");
    expect(await code(bookSession("s-1004", "nope"))).toBe("slot_taken");
  });
});

describe("feedback", () => {
  it("Riya has one P1 note from Arjun", async () => {
    const f = await getFeedback();
    expect(f.total).toBe(1);
    expect(f.items[0]?.panelist).toBe("Arjun Mehta");
  });
});

describe("late joiner and free session summary", () => {
  it("late-joiner has Day 0 in 19 days and a compressed plan offer, others do not", async () => {
    asScenario("late-joiner");
    expect((await getRunway()).day0.daysLeft).toBe(19);
    const late = (await getPlans()).lateJoiner;
    expect(late?.rows.filter((r) => r.status === "fits")).toHaveLength(3);
    expect(late?.recommendation.planId).toBe("basic");
    asScenario(null);
    expect((await getPlans()).lateJoiner).toBeNull();
  });

  it("a student who already had the session gets the written summary", async () => {
    asScenario("returning-student");
    const r = await getFreeSession();
    expect(r.eligible).toBe(false);
    expect(r.summary?.roles).toHaveLength(3);
    expect(r.summary?.answers.map((a) => a.verdict)).toEqual(["landed", "needs-work"]);
    asScenario(null);
    expect((await getFreeSession()).summary).toBeNull();
  });
});

describe("plans and checkout", () => {
  it("cohort-full blocks checkout and marks plans full", async () => {
    asScenario("cohort-full");
    const plans = await getPlans();
    expect(plans.cohortFull).toBe(true);
    expect(await code(postCheckout({ planId: "premium" }))).toBe("cohort_full");
  });

  it("payment-failed fails the first attempt only, with a 15-minute seat hold", async () => {
    asScenario("payment-failed");
    const first = await postCheckout({ planId: "premium" });
    expect(first.status).toBe("failed");
    const hold = new Date(first.seatHeldUntil!).getTime() - Date.now();
    expect(hold).toBeGreaterThan(14 * 60_000);
    expect(hold).toBeLessThanOrEqual(15 * 60_000);
    expect((await postCheckout({ planId: "premium" })).status).toBe("paid");
  });
});

describe("auth", () => {
  it("covers wrong email, wrong password, unverified gmail and duplicate sign-up", async () => {
    expect(await code(signIn({ email: "wrong@x.com", password: "pw" }))).toBe("no_account");
    expect(await code(signIn({ email: "riya@scmhrd.edu", password: "wrong" }))).toBe(
      "invalid_credentials",
    );
    asScenario("gmail-unverified");
    expect(await code(signIn({ email: "a@gmail.com", password: "pw" }))).toBe("email_unverified");
    asScenario(null);
    const ok = await signUp({ name: "A B", email: "ab@example.com", password: "password1" });
    expect(ok.onboarded).toBe(false);
    expect(
      await code(signUp({ name: "A B", email: "ab@example.com", password: "password1" })),
    ).toBe("email_taken");
  });
});
