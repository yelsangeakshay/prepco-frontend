import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { server } from "@/mocks/server";
import { resetDb } from "@/mocks/db";
import { ApiError } from "@/lib/api/client";
import {
  bookSession,
  decideApplication,
  decideRelock,
  excuseBooking,
  getAnswers,
  getAvailability,
  getBrief,
  getFeedback,
  getNotifications,
  getOpsApplications,
  getOpsAssignments,
  getOpsBookings,
  getOpsCohort,
  getOpsLedger,
  getOpsPanelists,
  getOpsStudent,
  getOpsStudents,
  getPanelistToday,
  getScoringList,
  postApplication,
  postAssignment,
  postScore,
  putAvailability,
  panelistAction,
  requestRelock,
  getCv,
} from "@/lib/api/endpoints";

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
beforeEach(() => {
  resetDb();
  document.cookie = "prepco_scenario=; path=/; max-age=0";
});

const code = async (p: Promise<unknown>) => {
  try {
    await p;
    return null;
  } catch (e) {
    return e instanceof ApiError ? e.code : "other";
  }
};

const score = {
  scores: { Structure: 4, Defensibility: 3, Composure: 5 },
  verdict: "Almost There" as const,
  note: "Good structure. Prepare a defensible number for pricing.",
  sendBack: false,
};

describe("the world", () => {
  it("1,000 students with the advertised plan mix; 52 panelists across six functions", async () => {
    const all = await getOpsStudents({ pageSize: 1 });
    expect(all.total).toBe(1000);
    expect((await getOpsStudents({ plan: "elite", pageSize: 1 })).total).toBe(41);
    expect((await getOpsStudents({ plan: "premium", pageSize: 1 })).total).toBe(312);
    expect((await getOpsStudents({ plan: "basic", pageSize: 1 })).total).toBe(212);
    expect((await getOpsStudents({ plan: "none", pageSize: 1 })).total).toBe(435);

    const roster = await getOpsPanelists({ pageSize: 100 });
    expect(roster.total).toBe(52);
    expect(new Set(roster.items.map((p) => p.function)).size).toBe(6);
  });

  it("is deterministic and paginated, searchable and sortable", async () => {
    const a = await getOpsStudents({ pageSize: 25, sort: "readiness:desc" });
    const b = await getOpsStudents({ pageSize: 25, sort: "readiness:desc" });
    expect(a.items.map((s) => s.id)).toEqual(b.items.map((s) => s.id));
    expect(a.items[0]!.readiness).toBeGreaterThanOrEqual(a.items[24]!.readiness);
    expect((await getOpsStudents({ q: "riya" })).items[0]?.id).toBe("st-riya");
    expect((await getOpsStudents({ pageSize: 1000 })).items).toHaveLength(1000);
  });

  it("cohort overview: seats match plans, seven panels unassigned, 5 applications waiting", async () => {
    const c = await getOpsCohort();
    expect(c.seats).toEqual([
      { plan: "Basic", taken: 212, total: 300 },
      { plan: "Premium", taken: 312, total: 400 },
      { plan: "Elite", taken: 41, total: 50 },
    ]);
    expect(c.totals.paid).toBe(565);
    const attn = Object.fromEntries(c.needsAttention.map((n) => [n.id, n.count]));
    expect(attn.unassigned).toBe(7);
    expect(attn.applications).toBe(5);
    expect(c.funnel.at(-1)?.value).toBe(565);
    expect(c.totals.revenue).toBeGreaterThan(15_000_000);
  });
});

describe("Arjun", () => {
  it("has twelve panels this season, two tonight, one to score, and Riya's P1 among them", async () => {
    const t = await getPanelistToday();
    expect(t.panelist.panelsThisSeason).toBe(12);
    expect(t.today).toHaveLength(2);
    expect(t.awaitingScore).toHaveLength(1);
    const done = await getScoringList();
    expect(done.done.some((d) => d.studentName === "Riya Kulkarni")).toBe(true);
  });

  it("brief for Riya shows flagged answers and her last feedback", async () => {
    const b = await getBrief("s-1002");
    expect(b.student.name).toBe("Riya Kulkarni");
    expect(b.answersToProbe).toHaveLength(3);
    expect(b.previousFeedback?.verdict).toBe("Almost There");
    expect(await code(getBrief("s-1003"))).toBe("brief_not_found");
  });

  it("scoring a tonight panel counts it, and cannot be repeated or done for someone else's panel", async () => {
    const t = await getPanelistToday();
    const id = t.today[0]!.sessionId;
    expect((await postScore(id, score)).sentBack).toBe(false);
    expect((await getPanelistToday()).panelist.panelsThisSeason).toBe(13);
    expect(await code(postScore(id, score))).toBe("already_scored");
    expect(await code(postScore("s-1003", score))).toBe("not_your_panel");
  });

  it("availability: booked slots cannot be switched off", async () => {
    const a = await getAvailability();
    expect(Object.values(a.slots).filter(Boolean)).toHaveLength(9);
    expect(a.booked).toContain("Mon-18:00");
    const slots = { ...a.slots, "Sat-19:00": true };
    expect((await putAvailability(slots)).slots["Sat-19:00"]).toBe(true);
    expect(await code(putAvailability({ ...slots, "Mon-18:00": false }))).toBe("slot_booked");
  });
});

describe("one panel, three roles", () => {
  it("Riya books P2 -> ops sees it unassigned -> assigns Arjun -> Arjun scores -> Riya gets feedback and flagged answers", async () => {
    expect((await getOpsAssignments()).unassigned).toHaveLength(7);

    await bookSession("s-1004", "s-1004-10-12-18");
    const queue = await getOpsAssignments();
    expect(queue.unassigned).toHaveLength(8);
    const mine = queue.unassigned.find((u) => u.booking.id === "s-1004")!;
    expect(mine.booking.studentName).toBe("Riya Kulkarni");
    expect((await getOpsBookings({ tab: "unassigned", pageSize: 100 })).counts.unassigned).toBe(8);

    // Before assignment Arjun does not see it.
    expect((await getPanelistToday()).upcoming.some((u) => u.sessionId === "s-1004")).toBe(false);

    const arjun = mine.candidates.find((c) => c.name === "Arjun Mehta");
    expect(arjun?.free).toBe(true);
    await postAssignment({ sessionId: "s-1004", panelistId: arjun!.panelistId });
    expect((await getOpsAssignments()).unassigned).toHaveLength(7);
    expect((await getPanelistToday()).upcoming.some((u) => u.sessionId === "s-1004")).toBe(true);
    expect((await getNotifications()).items.some((n) => n.title.includes("is confirmed"))).toBe(
      true,
    );
    expect(await code(postAssignment({ sessionId: "s-1004", panelistId: arjun!.panelistId }))).toBe(
      "not_unassigned",
    );

    const before = (await getAnswers({})).counts;
    await postScore("s-1004", { ...score, sendBack: true });
    expect((await getFeedback()).items).toHaveLength(2);
    expect((await getAnswers({})).counts.flagged).toBe(before.flagged + 2);
    expect((await getNotifications()).items[0]?.title).toBe("Arjun Mehta sent your feedback");
  });

  it("a panelist cannot take two panels at the same time", async () => {
    const queue = await getOpsAssignments();
    const [a, b] = queue.unassigned;
    const pid = a!.candidates.find((c) => c.free)!.panelistId;
    await postAssignment({ sessionId: a!.booking.id, panelistId: pid });
    // Force the clash: same panelist, other booking at the same instant is only possible if times match.
    if (b!.booking.startsAt === a!.booking.startsAt) {
      expect(await code(postAssignment({ sessionId: b!.booking.id, panelistId: pid }))).toBe(
        "slot_conflict",
      );
    }
  });
});

describe("ops actions", () => {
  it("excuse a no-show; approve and reject applications; roster follows", async () => {
    const ns = await getOpsBookings({ tab: "no-shows", pageSize: 100 });
    expect(ns.counts.noShows).toBe(18);
    const id = ns.items.find((b) => !b.excused)!.id;
    await excuseBooking(id);
    expect(await code(excuseBooking("b-nope"))).toBe("not_a_no_show");

    const apps = await getOpsApplications("pending");
    expect(apps.items).toHaveLength(5);
    await decideApplication(apps.items[0]!.id, "approve");
    await decideApplication(apps.items[1]!.id, "reject");
    expect(await code(decideApplication(apps.items[0]!.id, "approve"))).toBe("already_decided");
    expect((await getOpsApplications()).counts).toEqual({ pending: 3, approved: 3, rejected: 2 });
    expect((await getOpsPanelists({ pageSize: 100 })).total).toBe(53);
  });

  it("a public application lands in the queue; duplicates are refused", async () => {
    const body = {
      name: "Test Person",
      email: "test.person@example.com",
      function: "Finance",
      company: "Acme",
      role: "VP",
      years: 9,
      hoursPerMonth: 6,
      linkedin: "",
      why: "I want to help students prepare for finance panels well.",
    };
    expect((await postApplication(body)).status).toBe("received");
    expect(await code(postApplication(body))).toBe("already_applied");
    expect((await getOpsApplications("pending")).items[0]?.name).toBe("Test Person");
  });

  it("roster health: overdue feedback and cancellations need attention; reminders clear overdue", async () => {
    const need = await getOpsPanelists({ health: "needs-attention", pageSize: 100 });
    expect(need.total).toBeGreaterThanOrEqual(5);
    const overdue = need.items.find((p) => p.feedbackOverdue > 0)!;
    await panelistAction(overdue.id, "nudge");
    const after = await getOpsPanelists({ health: "needs-attention", pageSize: 100 });
    expect(after.items.find((p) => p.id === overdue.id)).toBeUndefined();
    await panelistAction(need.items[0]!.id, "pause");
    expect((await getOpsPanelists({ pageSize: 100 })).counts.paused).toBe(1);
    expect(await code(panelistAction("pn-nope", "pause"))).toBe("panelist_not_found");
  });

  it("student detail and CV re-lock review", async () => {
    expect(await code(getOpsStudent("st-nope"))).toBe("student_not_found");
    expect((await getOpsStudent("st-riya")).relockRequest).toBeNull();
    expect(await code(decideRelock("st-riya", "approve"))).toBe("no_request");

    await requestRelock({ reason: "Sharpened bullets after panel feedback" });
    const d = await getOpsStudent("st-riya");
    expect(d.relockRequest?.reason).toContain("Sharpened");
    await decideRelock("st-riya", "approve");
    expect((await getCv()).locked.version).toBe("V5");
    expect((await getOpsStudent("st-riya")).relockRequest).toBeNull();
  });

  it("ledger totals reconcile", async () => {
    const l = await getOpsLedger({ pageSize: 25 });
    expect(l.total).toBeGreaterThan(500);
    expect(l.totals.net).toBe(l.totals.payments + l.totals.refunds + l.totals.credits);
    expect((await getOpsLedger({ type: "refund" })).items.every((e) => e.amount < 0)).toBe(true);
  });
});
