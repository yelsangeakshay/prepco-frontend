import { HttpResponse } from "msw";
import { http } from "../http";
import { API_BASE_URL } from "@/lib/api/client";
import type { Booking } from "@/features/ops/schemas";
import type { Scenario } from "@/lib/config/scenarios";
import { formatDay } from "@/lib/utils/dates";
import { formatINR } from "@/lib/utils/currency";
import { getDb } from "../db";
import { RIYA } from "../fixtures/personas";
import { computeScores, getState } from "../state";
import { apiError, latency, paginate, scenarioOf } from "../utils";
import {
  allBookings,
  allStudents,
  findBooking,
  getWorld,
  ledgerAll,
  panelFunctionFor,
  panelistLoad,
  PLAN_PRICE,
  SEATS,
  slotKey,
  studentStatus,
  type BookingRec,
  type PanelistRec,
} from "../world";

const NOW = "2026-10-05T12:00:00+05:30";
const DAY0_LABEL = "Mon 9 Nov";

function sortItems<T>(
  items: T[],
  sort: string | null,
  getters: Record<string, (x: T) => string | number>,
) {
  if (!sort) return items;
  const [field, dir] = sort.split(":");
  const get = getters[field ?? ""];
  if (!get) return items;
  const m = dir === "desc" ? -1 : 1;
  return [...items].sort((a, b) => {
    const x = get(a);
    const y = get(b);
    return (x < y ? -1 : x > y ? 1 : 0) * m;
  });
}

function panelistName(scenario: Scenario | null, id: string | null) {
  if (!id) return null;
  return getWorld(scenario).panelists.find((p) => p.id === id)?.name ?? null;
}

function toBooking(scenario: Scenario | null, x: BookingRec): Booking {
  return {
    id: x.id,
    studentId: x.studentId,
    studentName: x.studentName,
    function: x.function,
    title: x.title,
    startsAt: x.startsAt,
    status: x.status,
    panelistId: x.panelistId,
    panelistName: panelistName(scenario, x.panelistId),
    excused: x.excused,
  };
}

function health(p: PanelistRec, load: number): "good" | "watch" | "needs-attention" {
  if (p.feedbackOverdue > 0 || p.cancellations >= 3) return "needs-attention";
  if (load > p.capacity || p.rating < 4.3 || p.status === "paused") return "watch";
  return "good";
}

export const opsHandlers = [
  http.get(`${API_BASE_URL}/ops/cohort`, async ({ request }) => {
    await latency();
    const scenario = scenarioOf(request);
    const w = getWorld(scenario);
    const st = getState(scenario);
    const students = allStudents(scenario);
    const bookings = allBookings(scenario);
    const ledger = ledgerAll(scenario);
    const paidStudents = students.filter((s) => s.plan !== "none");

    // Seats (a01.png): Finals, Summers and Elite.
    const finals = paidStudents.filter((s) => s.track === "Finals").length;
    const summers = paidStudents.filter((s) => s.track === "Summers").length;
    const elite = students.filter((s) => s.plan === "elite").length;

    // Free session funnel.
    const booked = students.filter((s) => s.freeSession !== "none").length;
    const attended = students.filter((s) => s.freeSession === "attended").length;
    const paid = paidStudents.length;

    // Revenue: plan payments by tier, top-ups on their own line.
    const count = (plan: string) => students.filter((s) => s.plan === plan).length;
    const tiers = (["basic", "premium", "elite"] as const).map((tier) => {
      const unit = PLAN_PRICE[tier];
      // Riya's upgrade is a top-up, so the tier line is count x unit.
      return {
        tier: tier[0]!.toUpperCase() + tier.slice(1),
        count: count(tier),
        unit,
        amount: count(tier) * unit,
      };
    });
    const topUps = ledger.filter((e) => e.type === "top-up").reduce((n, e) => n + e.amount, 0);
    const revenueTotal = tiers.reduce((n, t) => n + t.amount, 0) + topUps;

    // Needs attention (a01.png).
    const unassigned = bookings.filter((x) => x.status === "unassigned");
    const withChange = unassigned
      .map((x) => students.find((s) => s.id === x.studentId))
      .find((s) => s?.targetChange);
    const noShows = bookings.filter((x) => x.status === "no-show" && !x.excused);
    const hasP2 = (id: string) =>
      bookings.some((x) => x.studentId === id && /P2/.test(x.title) && x.status !== "cancelled");
    const noP2 = students.filter(
      (s) =>
        s.id !== RIYA.id &&
        (s.plan === "premium" || s.plan === "elite") &&
        bookings.some((x) => x.studentId === s.id && x.status === "completed") &&
        !hasP2(s.id),
    );
    const karan = students.find((s) => s.name === "Karan Shah");
    const pendingApps = w.applications.filter((a) => a.status === "pending").length;
    const relock = st.cv.relock.status === "pending";
    const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

    const needsAttention = [
      {
        id: "unassigned",
        title: unassigned.length
          ? `${unassigned.length} ${plural(unassigned.length, "session", "sessions")} without a panelist`
          : "Every session has a panelist",
        detail: withChange
          ? `Including 1 target change: ${withChange.name}, now ${withChange.targetChange}`
          : unassigned.length
            ? "Assign a panelist so the student can prepare."
            : "Nothing to assign.",
        count: unassigned.length,
        action: "Assign",
        href: "/ops/assignments",
        tone: unassigned.length ? ("maroon" as const) : ("neutral" as const),
      },
      {
        id: "no-p2",
        title: noP2.length
          ? noP2.length === 1
            ? `${noP2[0]!.name} hasn't booked P2`
            : `${noP2.length} students haven't booked P2`
          : "Everyone has booked P2",
        detail: noP2.length
          ? `${noP2.map((s) => s.name).join(", ")} · Week -4 starts Mon 12 Oct`
          : "Week -4 starts Mon 12 Oct.",
        count: noP2.length,
        action: "Nudge",
        href: noP2[0] ? `/ops/students/${noP2[0].id}` : "/ops/students",
        tone: "neutral" as const,
      },
      {
        id: "basic-ended",
        title: karan ? `${karan.name}: Basic ended after P1` : "No Basic plans have ended",
        detail: karan
          ? `Upgrade quote sent · ${formatINR(PLAN_PRICE.premium - PLAN_PRICE.basic - 1799)} after top-up credit`
          : "Nothing to follow up.",
        count: karan ? 1 : 0,
        action: "View",
        href: karan ? `/ops/students/${karan.id}` : "/ops/students",
        tone: "neutral" as const,
      },
      {
        id: "no-shows",
        title: noShows.length
          ? `${noShows.length} no-${plural(noShows.length, "show", "shows")} this week`
          : "No no-shows this week",
        detail: noShows[0]
          ? `${noShows[0].title} · ${formatDay(noShows[0].startsAt ?? "2026-10-04T19:00:00+05:30")}`
          : "Nothing to review.",
        count: noShows.length,
        action: "Review",
        href: "/ops/sessions?tab=no-shows",
        tone: noShows.length ? ("maroon" as const) : ("neutral" as const),
      },
      ...(relock
        ? [
            {
              id: "relock",
              title: "CV re-lock request",
              detail: `${RIYA.name} asked to replace her locked CV`,
              count: 1,
              action: "Review",
              href: `/ops/students/${RIYA.id}`,
              tone: "neutral" as const,
            },
          ]
        : []),
      ...(pendingApps
        ? [
            {
              id: "applications",
              title: `${pendingApps} panelist ${plural(pendingApps, "application", "applications")} waiting`,
              detail: "Review and approve to grow the roster.",
              count: pendingApps,
              action: "Review",
              href: "/ops/panelists/applications",
              tone: "neutral" as const,
            },
          ]
        : []),
    ];

    const weekLo = "2026-10-05T00:00:00+05:30";
    const weekHi = "2026-10-12T00:00:00+05:30";
    const inWeek = bookings.filter(
      (x) =>
        (x.status === "upcoming" || x.status === "unassigned") &&
        x.startsAt &&
        x.startsAt >= weekLo &&
        x.startsAt < weekHi,
    );

    return HttpResponse.json({
      season: "Season 1",
      day0: { label: DAY0_LABEL, daysLeft: 35 },
      totals: { students: students.length, paid, revenue: revenueTotal },
      seats: [
        { id: "finals", label: "Finals seats, season 1", taken: finals, total: SEATS.finals.total },
        {
          id: "summers",
          label: "Summers seats, season 1",
          taken: summers,
          total: SEATS.summers.total,
        },
        {
          id: "elite",
          label: "Elite seats, case track capped",
          taken: elite,
          total: SEATS.elite.total,
        },
      ],
      seatsNote: "Seats close fifteen days before the process opens.",
      funnel: [
        { label: "booked", value: booked },
        { label: "attended", value: attended },
        { label: "bought a plan", value: paid },
      ],
      conversionPct: attended ? Math.round((paid / attended) * 100) : 0,
      revenue: { lines: tiers, topUps, total: revenueTotal },
      needsAttention,
      thisWeek: {
        sessionsScheduled: inWeek.length,
        freeSessions: 12,
        feedbackOverdue: w.panelists.reduce((n, p) => n + p.feedbackOverdue, 0),
        panelistsActive: w.panelists.filter((p) => p.status === "active").length,
        panelistsTotal: w.panelists.length,
      },
    });
  }),

  http.get(`${API_BASE_URL}/ops/badges`, async ({ request }) => {
    const scenario = scenarioOf(request);
    return HttpResponse.json({
      unassigned: allBookings(scenario).filter((x) => x.status === "unassigned").length,
    });
  }),

  // Students -----------------------------------------------------------------
  http.get(`${API_BASE_URL}/ops/students`, async ({ request }) => {
    await latency();
    const scenario = scenarioOf(request);
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.toLowerCase().trim();
    const plan = url.searchParams.get("plan");
    const fn = url.searchParams.get("function");
    const status = url.searchParams.get("status");

    let list = allStudents(scenario).map((s) => ({ ...s, status: studentStatus(s) }));
    if (q) list = list.filter((s) => `${s.name} ${s.email} ${s.college}`.toLowerCase().includes(q));
    if (plan) list = list.filter((s) => s.plan === plan);
    if (fn) list = list.filter((s) => s.function === fn);
    if (status) list = list.filter((s) => s.status === status);
    list = sortItems(list, url.searchParams.get("sort"), {
      name: (s) => s.name,
      readiness: (s) => s.readiness,
      joinedAt: (s) => s.joinedAt,
      plan: (s) => s.plan,
      panelsDone: (s) => s.panelsDone,
    });
    const rows = list.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      college: s.college,
      track: s.track,
      function: s.function,
      plan: s.plan,
      readiness: s.readiness,
      panelsDone: s.panelsDone,
      noShows: s.noShows,
      status: s.status,
      joinedAt: s.joinedAt,
    }));
    return HttpResponse.json(paginate(rows, url));
  }),

  http.get(`${API_BASE_URL}/ops/students/:id`, async ({ request, params }) => {
    await latency();
    const scenario = scenarioOf(request);
    const s = allStudents(scenario).find((x) => x.id === params.id);
    if (!s) return apiError(404, "student_not_found", "We could not find that student.");
    const st = getState(scenario);
    const isRiya = s.id === RIYA.id;
    const counts = isRiya
      ? {
          total: st.answers.length,
          prepared: st.answers.filter((a) => a.status === "rehearsed").length,
          needWork: st.answers.filter((a) => a.status === "flagged").length,
        }
      : {
          total: 18,
          prepared: Math.round(s.readiness / 6),
          needWork: Math.round((100 - s.readiness) / 20),
        };
    return HttpResponse.json({
      id: s.id,
      name: s.name,
      email: s.email,
      college: s.college,
      track: s.track,
      function: s.function,
      plan: s.plan,
      readiness: s.readiness,
      panelsDone: s.panelsDone,
      noShows: s.noShows,
      status: studentStatus(s),
      joinedAt: s.joinedAt,
      background: s.background,
      cv: { version: isRiya ? st.cv.lockedVersion : "V2", score: s.cvScore },
      answers: counts,
      sessions: allBookings(scenario)
        .filter((x) => x.studentId === s.id)
        .map((x) => toBooking(scenario, x)),
      payments: ledgerAll(scenario)
        .filter((e) => e.studentId === s.id)
        .map((e) => ({ id: e.id, at: e.at, description: e.description, amount: e.amount })),
      relockRequest:
        isRiya && st.cv.relock.status === "pending"
          ? {
              requestedAt: st.cv.relock.requestedAt ?? NOW,
              reason: st.cv.relock.reason ?? "",
              draftScore: computeScores(st.cv).overall,
            }
          : null,
    });
  }),

  http.post(`${API_BASE_URL}/ops/students/:id/relock`, async ({ request, params }) => {
    await latency();
    const scenario = scenarioOf(request);
    const st = getState(scenario);
    if (params.id !== RIYA.id || st.cv.relock.status !== "pending") {
      return apiError(409, "no_request", "There is no pending re-lock request.");
    }
    const { decision } = (await request.json()) as { decision: "approve" | "reject" };
    if (decision === "approve") {
      const scores = computeScores(st.cv);
      st.cv.versions.forEach((v) => {
        v.locked = false;
        v.current = false;
      });
      st.cv.versions.push({
        id: "v5",
        version: "V5",
        createdAt: NOW,
        score: scores.overall,
        locked: true,
        current: true,
        note: "Locked after re-lock request",
      });
      st.cv.lockedVersion = "V5";
      st.cv.lockedAt = NOW;
      st.cv.lockedScores = scores;
    }
    st.cv.relock = { status: "none", requestedAt: null, reason: null };
    st.notifications.unshift({
      id: `n-relock-${Date.now()}`,
      kind: "system",
      title:
        decision === "approve" ? "Your CV re-lock was approved" : "Your CV re-lock was declined",
      body:
        decision === "approve"
          ? "V5 is now what panelists see."
          : "Keep working on your draft and ask again.",
      at: NOW,
      read: false,
      href: "/cv",
    });
    return HttpResponse.json({ ok: true });
  }),

  // Assignments --------------------------------------------------------------
  http.get(`${API_BASE_URL}/ops/assignments`, async ({ request }) => {
    await latency();
    const scenario = scenarioOf(request);
    const w = getWorld(scenario);
    const unassigned = allBookings(scenario)
      .filter((x) => x.status === "unassigned")
      .sort((a, b) => (a.startsAt ?? "").localeCompare(b.startsAt ?? ""));

    const bookings = allBookings(scenario);
    const free = (p: PanelistRec, startsAt: string | null) => {
      if (!startsAt || p.status !== "active") return false;
      const key = slotKey(startsAt);
      const taken = bookings.some(
        (x) => x.panelistId === p.id && x.status === "upcoming" && x.startsAt === startsAt,
      );
      return !!w.availability[p.id]?.[key] && !taken;
    };

    const fns = [...new Set(w.panelists.map((p) => p.function))];
    return HttpResponse.json({
      unassigned: unassigned.map((x) => ({
        booking: toBooking(scenario, x),
        candidates: w.panelists
          .filter((p) => p.function === panelFunctionFor(x.function) && p.status === "active")
          .map((p) => ({
            panelistId: p.id,
            name: p.name,
            specialty: p.specialty,
            load: panelistLoad(scenario, p.id),
            capacity: p.capacity,
            free: free(p, x.startsAt),
          }))
          .sort(
            (a, b) =>
              Number(b.free) - Number(a.free) || a.load - b.load || a.name.localeCompare(b.name),
          ),
      })),
      load: fns.map((fn) => {
        const ps = w.panelists.filter((p) => p.function === fn && p.status === "active");
        return {
          function: fn,
          panelists: ps.length,
          booked: ps.reduce((n, p) => n + panelistLoad(scenario, p.id), 0),
          capacity: ps.reduce((n, p) => n + p.capacity, 0),
          unassigned: unassigned.filter((x) => panelFunctionFor(x.function) === fn).length,
        };
      }),
    });
  }),

  http.post(`${API_BASE_URL}/ops/assignments`, async ({ request }) => {
    await latency();
    const scenario = scenarioOf(request);
    const w = getWorld(scenario);
    const { sessionId, panelistId } = (await request.json()) as {
      sessionId: string;
      panelistId: string;
    };
    const x = findBooking(scenario, sessionId);
    const p = w.panelists.find((y) => y.id === panelistId);
    if (!x) return apiError(404, "booking_not_found", "We could not find that booking.");
    if (!p) return apiError(404, "panelist_not_found", "We could not find that panelist.");
    if (x.status !== "unassigned")
      return apiError(409, "not_unassigned", "This panel already has a panelist.");
    if (p.status !== "active") return apiError(409, "panelist_paused", `${p.name} is paused.`);
    const clash = allBookings(scenario).some(
      (y) => y.panelistId === p.id && y.status === "upcoming" && y.startsAt === x.startsAt,
    );
    if (clash) return apiError(409, "slot_conflict", `${p.name} already has a panel at that time.`);

    if (x.source === "live") {
      const db = getDb(scenario);
      const st = getState(scenario);
      const s = db.sessions.find((y) => y.id === x.id)!;
      Object.assign(s, { panelist: p.name, panelFunction: p.specialty });
      st.notifications.unshift({
        id: `n-assign-${x.id}`,
        kind: "session",
        title: `${s.title} is confirmed`,
        body: `${p.name} will run your panel.`,
        at: NOW,
        read: false,
        href: `/sessions/${x.id}`,
      });
    } else {
      x.panelistId = p.id;
      x.status = "upcoming";
    }
    const updated = findBooking(scenario, sessionId)!;
    return HttpResponse.json({ booking: toBooking(scenario, updated) });
  }),

  // Bookings -----------------------------------------------------------------
  http.get(`${API_BASE_URL}/ops/bookings`, async ({ request }) => {
    await latency();
    const scenario = scenarioOf(request);
    const url = new URL(request.url);
    const tab = url.searchParams.get("tab") ?? "all";
    const q = url.searchParams.get("q")?.toLowerCase().trim();
    const all = allBookings(scenario);
    let list = all;
    if (tab === "unassigned") list = all.filter((x) => x.status === "unassigned");
    if (tab === "no-shows") list = all.filter((x) => x.status === "no-show");
    if (q) list = list.filter((x) => `${x.studentName} ${x.title}`.toLowerCase().includes(q));
    list = sortItems(list, url.searchParams.get("sort") ?? "startsAt:desc", {
      startsAt: (x) => x.startsAt ?? "",
      studentName: (x) => x.studentName,
      status: (x) => x.status,
    });
    return HttpResponse.json({
      ...paginate(
        list.map((x) => toBooking(scenario, x)),
        url,
      ),
      counts: {
        all: all.length,
        unassigned: all.filter((x) => x.status === "unassigned").length,
        noShows: all.filter((x) => x.status === "no-show").length,
      },
    });
  }),

  http.post(`${API_BASE_URL}/ops/bookings/:id/excuse`, async ({ request, params }) => {
    await latency();
    const scenario = scenarioOf(request);
    const x = findBooking(scenario, String(params.id));
    if (!x || x.status !== "no-show")
      return apiError(409, "not_a_no_show", "This booking is not a no-show.");
    if (x.source === "live") {
      const st = getState(scenario);
      st.notifications.unshift({
        id: `n-excuse-${x.id}`,
        kind: "session",
        title: "Your no-show was excused",
        body: "No credit lost. Pick a new slot.",
        at: NOW,
        read: false,
        href: `/sessions/${x.id}`,
      });
    } else {
      x.excused = true;
    }
    return HttpResponse.json({ booking: toBooking(scenario, { ...x, excused: true }) });
  }),

  // Ledger -------------------------------------------------------------------
  http.get(`${API_BASE_URL}/ops/ledger`, async ({ request }) => {
    await latency();
    const scenario = scenarioOf(request);
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const q = url.searchParams.get("q")?.toLowerCase().trim();
    const all = ledgerAll(scenario);
    let list = all;
    if (type) list = list.filter((e) => e.type === type);
    if (q) list = list.filter((e) => `${e.studentName} ${e.description}`.toLowerCase().includes(q));
    const t = (types: string[]) =>
      all.filter((e) => types.includes(e.type)).reduce((n, e) => n + e.amount, 0);
    return HttpResponse.json({
      ...paginate(
        list.map((e) => ({
          id: e.id,
          at: e.at,
          studentId: e.studentId,
          studentName: e.studentName,
          description: e.description,
          amount: e.amount,
          type: e.type,
        })),
        url,
      ),
      totals: {
        payments: t(["payment", "top-up"]),
        refunds: t(["refund"]),
        credits: t(["credit"]),
        net: all.reduce((n, e) => n + e.amount, 0),
      },
    });
  }),

  // Panelists ----------------------------------------------------------------
  http.get(`${API_BASE_URL}/ops/panelists`, async ({ request }) => {
    await latency();
    const scenario = scenarioOf(request);
    const w = getWorld(scenario);
    const url = new URL(request.url);
    const fn = url.searchParams.get("function");
    const h = url.searchParams.get("health");
    const q = url.searchParams.get("q")?.toLowerCase().trim();
    let list = w.panelists.map((p) => {
      const load = panelistLoad(scenario, p.id);
      return {
        id: p.id,
        name: p.name,
        function: p.function,
        specialty: p.specialty,
        company: p.company,
        status: p.status,
        panelsThisSeason: p.panelsThisSeason,
        load,
        capacity: p.capacity,
        rating: p.rating,
        feedbackOverdue: p.feedbackOverdue,
        cancellations: p.cancellations,
        health: health(p, load),
      };
    });
    const all = list;
    if (fn) list = list.filter((p) => p.function === fn);
    if (h) list = list.filter((p) => p.health === h);
    if (q)
      list = list.filter((p) => `${p.name} ${p.company} ${p.specialty}`.toLowerCase().includes(q));
    list = sortItems(list, url.searchParams.get("sort"), {
      name: (p) => p.name,
      rating: (p) => p.rating,
      load: (p) => p.load,
      panelsThisSeason: (p) => p.panelsThisSeason,
    });
    return HttpResponse.json({
      ...paginate(list, url),
      counts: {
        all: all.length,
        needsAttention: all.filter((p) => p.health === "needs-attention").length,
        paused: all.filter((p) => p.status === "paused").length,
      },
    });
  }),

  http.post(`${API_BASE_URL}/ops/panelists/:id/action`, async ({ request, params }) => {
    await latency();
    const scenario = scenarioOf(request);
    const p = getWorld(scenario).panelists.find((x) => x.id === params.id);
    if (!p) return apiError(404, "panelist_not_found", "We could not find that panelist.");
    const { action } = (await request.json()) as { action: "pause" | "resume" | "nudge" };
    if (action === "pause") p.status = "paused";
    if (action === "resume") p.status = "active";
    if (action === "nudge") p.feedbackOverdue = 0;
    return HttpResponse.json({ ok: true });
  }),

  // Applications -------------------------------------------------------------
  http.get(`${API_BASE_URL}/ops/applications`, async ({ request }) => {
    await latency();
    const w = getWorld(scenarioOf(request));
    const status = new URL(request.url).searchParams.get("status");
    const items = status ? w.applications.filter((a) => a.status === status) : w.applications;
    return HttpResponse.json({
      items,
      counts: {
        pending: w.applications.filter((a) => a.status === "pending").length,
        approved: w.applications.filter((a) => a.status === "approved").length,
        rejected: w.applications.filter((a) => a.status === "rejected").length,
      },
    });
  }),

  http.post(`${API_BASE_URL}/ops/applications/:id/decision`, async ({ request, params }) => {
    await latency();
    const w = getWorld(scenarioOf(request));
    const a = w.applications.find((x) => x.id === params.id);
    if (!a) return apiError(404, "application_not_found", "We could not find that application.");
    if (a.status !== "pending")
      return apiError(409, "already_decided", `This application is already ${a.status}.`);
    const { decision } = (await request.json()) as { decision: "approve" | "reject" };
    a.status = decision === "approve" ? "approved" : "rejected";
    if (decision === "approve") {
      const id = `pn-${String(w.panelists.length + 1).padStart(3, "0")}`;
      w.panelists.push({
        id,
        name: a.name,
        email: a.email,
        function: a.function,
        specialty: a.function,
        company: a.company,
        role: a.role,
        bio: a.why,
        status: "active",
        panelsThisSeason: 0,
        capacity: 6,
        rating: 4.5,
        cancellations: 0,
        feedbackOverdue: 0,
      });
      w.availability[id] = {};
    }
    return HttpResponse.json({ ok: true });
  }),
];
