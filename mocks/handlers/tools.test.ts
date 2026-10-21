import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { server } from "@/mocks/server";
import { resetDb } from "@/mocks/db";
import { ApiError } from "@/lib/api/client";
import {
  changeTarget,
  getAnswer,
  getAnswers,
  buyTopUp,
  getBilling,
  getCaseTrack,
  getCv,
  getNotifications,
  getOutcome,
  getJourney,
  getQuickSwitch,
  getQuickSwitchDigest,
  getRunway,
  saveQuickSwitchPrefs,
  toggleQuickSwitchSaved,
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
    expect((await getAnswers({ q: "channels" })).items).toHaveLength(1);
    expect((await getAnswers({ pageSize: 10 })).items).toHaveLength(10);
  });

  it("s08: fit round has 14 questions, CV deep-dive 4, and the list opens on the drawn rows", async () => {
    const fit = await getAnswers({ round: "fit" });
    expect(fit.total).toBe(14);
    expect(fit.rounds).toEqual({ fit: 14, cv: 4 });
    expect((await getAnswers({ round: "cv" })).total).toBe(4);
    expect(fit.items.slice(0, 7).map((a) => a.status)).toEqual([
      "rehearsed",
      "rehearsed",
      "rehearsed",
      "flagged",
      "flagged",
      "not-drafted",
      "not-drafted",
    ]);
    const mt = fit.items[3]!;
    expect(mt.question).toBe("You already have experience. Why should we hire you as an MT?");
    expect(mt.noteTags).toEqual(["situation", "decision", "result"]);
  });

  it("saves the three parts, joins them into the draft and keeps the rehearse switch", async () => {
    const mt = (await getAnswers({ status: "flagged" })).items.find((a) =>
      a.question.includes("MT"),
    )!;
    const before = await getAnswer(mt.id);
    expect(before).toMatchObject({ draftNo: 3, flaggedAt: "P1 · 21 Sep", rehearseNext: true });
    expect(before.parts.result).toBe("");
    const after = await patchAnswer(mt.id, {
      parts: { result: "You get a hire who already owns a number." },
      rehearseNext: false,
    });
    expect(after.parts.situation).toBe(before.parts.situation);
    expect(after.draft.endsWith("a number.")).toBe(true);
    expect(after).toMatchObject({ draftNo: 4, rehearseNext: false, status: "flagged" });
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

describe("s11 to s15 screens", () => {
  it("journey: seven stages with Term 5–6 as now, four routes, Final placements is the route", async () => {
    const j = await getJourney();
    expect(j.joinedAt).toBe("Term 5–6");
    expect(j.stages).toHaveLength(7);
    expect(j.stages.filter((s) => s.state === "now")).toHaveLength(1);
    expect(j.routes.map((r) => r.title)).toEqual([
      "Case competitions",
      "Summer internship",
      "Final placements",
      "Lateral support",
    ]);
    expect(j.routes.find((r) => r.fit === "primary")?.title).toBe("Final placements");
  });

  it("case track: Premium sees the preview with the upgrade prices", async () => {
    const t = await getCaseTrack();
    expect(t).toMatchObject({ unlocked: false, plan: "Premium", seats: { left: 5, total: 22 } });
    expect(t.upgrade).toEqual({ alone: 7999, moreThanPlan: 4000 });
    expect(t.steps.map((s) => s.state)).toEqual([
      "done",
      "upload",
      "book",
      "later",
      "later",
      "on-placing",
    ]);
  });

  it("quick switch agent: three matches, fit filter, save toggle and paused state", async () => {
    const d = await getQuickSwitchDigest();
    expect(d.stats).toEqual({ matches: 20, highFit: 3, boards: "7+", oldest: "7 days" });
    expect(d.items.map((i) => i.fit)).toEqual([96, 91, 88]);
    expect((await toggleQuickSwitchSaved("l1")).items[0]?.saved).toBe(true);
    expect((await toggleQuickSwitchSaved("l1")).items[0]?.saved).toBe(false);
    await saveQuickSwitchPrefs({ ...d.prefs, minFit: 90 });
    expect((await getQuickSwitchDigest()).items.map((i) => i.fit)).toEqual([96, 91]);
    await saveQuickSwitchPrefs({ ...d.prefs, enabled: false });
    expect((await getQuickSwitchDigest()).items).toEqual([]);
  });

  it("billing: what the plan includes, top-ups at the plan rate, and a bought top-up feeds the upgrade quote", async () => {
    const b = await getBilling();
    expect(b.season).toBe("Finals · Season 1");
    expect(b.entitlements.map((e) => e.state)).toEqual([
      "used",
      "used",
      "booked",
      "unbooked",
      "scheduled",
      "scheduled",
      "active",
    ]);
    expect(b.topUps.map((t) => t.price)).toEqual([1299, null, null]);
    expect(b.invoices.map((i) => [i.description, i.status])).toEqual([
      ["Premium · Finals · Season 1", "paid"],
      ["Free session", "no-charge"],
    ]);
    expect(await code(buyTopUp("deck-review"))).toBe("top_up_unpriced");
    expect((await buyTopUp("mock-panel")).amount).toBe(1299);
    expect((await getUpgradeQuote()).topUpCredit).toBe(1299);
    expect((await getBilling()).invoices[0]?.description).toBe("Extra mock panel");
  });
});

describe("Extras, billing, profile, outcome, notifications", () => {
  it("quick switch and case track gate", async () => {
    const q = await getQuickSwitch("Finance");
    expect(q.reusableAnswers).toBe(9);
    expect(await code(getQuickSwitch("Astrology"))).toBe("unknown_function");
    expect((await getCaseTrack()).unlocked).toBe(false);
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
    expect((await getCaseTrack()).steps).toHaveLength(6);
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
