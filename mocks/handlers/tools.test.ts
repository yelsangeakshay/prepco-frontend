import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { server } from "@/mocks/server";
import { resetDb } from "@/mocks/db";
import { ApiError } from "@/lib/api/client";
import {
  changeTarget,
  getAnswer,
  getAnswers,
  getBilling,
  getCaseTrack,
  getCv,
  getNotifications,
  getOutcome,
  getQuickSwitch,
  getRunway,
  getUpgradeQuote,
  lockCvVersion,
  markNotificationsRead,
  patchAnswer,
  patchBullet,
  postOutcome,
  postUpgrade,
  requestRelock,
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

describe("CV", () => {
  it("Riya: V4 locked at 84 (Impact 88, Clarity 82, Defensibility 81)", async () => {
    const cv = await getCv();
    expect(cv.locked.version).toBe("V4");
    expect(cv.locked.scores).toEqual({ overall: 84, impact: 88, clarity: 82, defensibility: 81 });
    expect(cv.draft.scores).toEqual(cv.locked.scores);
  });

  it("editing a bullet re-scores on decision, number and trade-off", async () => {
    const before = await getCv();
    const b2 = before.draft.sections[0]!.bullets.find((b) => b.id === "b2")!;
    expect([b2.hasDecision, b2.hasNumber, b2.hasTradeoff]).toEqual([false, true, false]);

    const r = await patchBullet("b2", "Led the dashboard for 6 managers instead of ad-hoc reports");
    expect([r.bullet.hasDecision, r.bullet.hasNumber, r.bullet.hasTradeoff]).toEqual([
      true,
      true,
      true,
    ]);
    expect(r.scores.overall).toBeGreaterThan(84);

    const worse = await patchBullet("b1", "Worked on pricing");
    expect(worse.scores.overall).toBeLessThan(r.scores.overall);
    expect(await code(patchBullet("nope", "x"))).toBe("bullet_not_found");
    expect(await code(patchBullet("b2", "   "))).toBe("empty_bullet");
  });

  it("a locked CV needs a re-lock request; first-login CV can be locked directly", async () => {
    expect(await code(lockCvVersion("draft"))).toBe("relock_required");
    const r = await requestRelock({ reason: "Sharpened after feedback" });
    expect(r.status).toBe("pending");
    expect((await getCv()).relock.status).toBe("pending");
  });
});

describe("Answers", () => {
  it("18 questions: 12 rehearsed, 4 flagged, 2 not drafted; filters and search work", async () => {
    const all = await getAnswers({});
    expect(all.counts).toEqual({ all: 18, rehearsed: 12, flagged: 4, notDrafted: 2 });
    expect((await getAnswers({ status: "flagged" })).items).toHaveLength(4);
    expect((await getAnswers({ status: "not-drafted" })).items).toHaveLength(2);
    expect((await getAnswers({ q: "failure" })).items).toHaveLength(1);
    expect((await getAnswers({ pageSize: 10 })).items).toHaveLength(10);
  });

  it("marks rehearsed, validates impossible transitions, and updates counts", async () => {
    const flagged = (await getAnswers({ status: "flagged" })).items[0]!;
    expect((await getAnswer(flagged.id)).inlineCritique.length).toBeGreaterThan(0);
    expect((await patchAnswer(flagged.id, { status: "rehearsed" })).status).toBe("rehearsed");
    expect((await getAnswers({})).counts.flagged).toBe(3);

    const undrafted = (await getAnswers({ status: "not-drafted" })).items[0]!;
    expect(await code(patchAnswer(undrafted.id, { status: "rehearsed" }))).toBe("no_draft");
    expect((await patchAnswer(undrafted.id, { draft: "My first draft." })).status).toBe("flagged");
  });
});

describe("Extras, billing, profile, outcome, notifications", () => {
  it("quick switch and case track gate", async () => {
    const q = await getQuickSwitch("Finance");
    expect(q.reusableAnswers).toBe(9);
    expect(await code(getQuickSwitch("Astrology"))).toBe("unknown_function");
    expect(await code(getCaseTrack())).toBe("elite_only");
  });

  it("upgrade: quote is next tier minus paid minus top-ups, pay unlocks case track and notifies", async () => {
    const quote = await getUpgradeQuote();
    expect(quote).toMatchObject({
      to: "Elite",
      listPrice: 13999,
      difference: 4000,
      topUpCredit: 0,
      payable: 4000,
    });
    const paid = await postUpgrade();
    expect(paid.status).toBe("paid");
    expect((await getBilling()).plan.id).toBe("elite");
    expect((await getCaseTrack()).modules).toHaveLength(5);
    expect(await code(getUpgradeQuote())).toBe("already_elite");
    expect((await getNotifications()).items[0]?.title).toBe("Welcome to Elite");
  });

  it("upgrade respects payment-failed (first attempt) and cohort-full", async () => {
    asScenario("payment-failed");
    expect((await postUpgrade()).status).toBe("failed");
    expect((await postUpgrade()).status).toBe("paid");
    resetDb();
    asScenario("cohort-full");
    expect(await code(postUpgrade())).toBe("cohort_full");
  });

  it("basic-ended: Premium upgrade is credited with the top-up mock", async () => {
    asScenario("basic-ended");
    expect((await getBilling()).plan.status).toBe("ended");
    expect(await getUpgradeQuote()).toMatchObject({
      to: "Premium",
      difference: 4000,
      topUpCredit: 1799,
      payable: 2201,
    });
  });

  it("changing target flags answers and shows up in the runway", async () => {
    const r = await changeTarget({
      function: "Finance",
      role: "Analyst",
      reason: "I like numbers more",
    });
    expect(r.answersToRework).toBe(4);
    expect((await getRunway()).answers.needWork).toBe(8);
  });

  it("outcome: pending, then placed or not placed", async () => {
    expect((await getOutcome()).state).toBe("pending");
    const n = await postOutcome({ state: "not-placed" });
    expect(n.creditCarried).toBe(9999);
    resetDb();
    const p = await postOutcome({ state: "placed", company: "Acme", role: "MT", ctc: 900000 });
    expect(p).toMatchObject({ state: "placed", company: "Acme", ctc: 900000 });
  });

  it("notifications: mark one, then all, read", async () => {
    const first = await getNotifications();
    expect(first.unread).toBe(2);
    await markNotificationsRead({ ids: [first.items.find((n) => !n.read)!.id] });
    expect((await getNotifications()).unread).toBe(1);
    await markNotificationsRead({ all: true });
    expect((await getNotifications()).unread).toBe(0);
  });

  it("scenarios add their own notification", async () => {
    asScenario("day0-moved");
    expect((await getNotifications()).items.some((n) => n.title.includes("Day 0 moved"))).toBe(
      true,
    );
  });
});
