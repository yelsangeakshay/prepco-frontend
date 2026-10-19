import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "@/lib/api/client";
import { getDb } from "../db";
import { getState } from "../state";
import { apiError, latency, scenarioOf } from "../utils";

const NOW = "2026-10-05T12:00:00+05:30";
const ELITE_PRICE = 59999;
const ELITE_SEATS_LEFT = 9;

export const accountHandlers = [
  // Journey, quick switch, case track
  http.get(`${API_BASE_URL}/journey`, async ({ request }) => {
    await latency();
    const db = getDb(scenarioOf(request));
    const done = db.sessions.filter((s) => s.status === "completed").length;
    return HttpResponse.json({
      season: [
        { id: "j1", label: "Profile and CV lock", detail: "Weeks -8 to -7", done: done >= 1 },
        { id: "j2", label: "Mock panels and deep-dive", detail: "Weeks -7 to -4", done: done >= 4 },
        {
          id: "j3",
          label: "Group positioning and pressure mock",
          detail: "Weeks -2 to -1",
          done: done >= 6,
        },
        { id: "j4", label: "Day 0", detail: "Mon 9 Nov", done: false },
      ],
      routes: [
        {
          id: "r1",
          title: "Management Trainee, Sales & Marketing",
          description: "Rotational programmes at consumer-goods firms. Your primary route.",
          fit: "primary",
        },
        {
          id: "r2",
          title: "Key Account Manager",
          description: "Direct to a territory. Fits two years of FMCG sales.",
          fit: "alternate",
        },
        {
          id: "r3",
          title: "Brand Assistant",
          description: "Brand teams hire from marketing electives. Needs a sharper CV story.",
          fit: "alternate",
        },
      ],
    });
  }),

  http.get(`${API_BASE_URL}/quick-switch`, async ({ request }) => {
    await latency();
    const st = getState(scenarioOf(request));
    const to = new URL(request.url).searchParams.get("to") ?? "";
    const reusableByFn: Record<string, number> = {
      "Sales & Marketing": 18,
      Finance: 9,
      Operations: 12,
      Consulting: 10,
      HR: 14,
      "Product & Analytics": 8,
    };
    if (!(to in reusableByFn))
      return apiError(422, "unknown_function", "Pick a function from the list.");
    const total = st.answers.length;
    const reusable = reusableByFn[to]!;
    return HttpResponse.json({
      from: st.target.function,
      to,
      reusableAnswers: reusable,
      totalAnswers: total,
      cvBulletsToReframe: Math.round(((total - reusable) / total) * 7),
      gaps:
        reusable === total
          ? []
          : [
              `${total - reusable} answers need a new angle for ${to}`,
              `Add one ${to} example to your CV`,
            ],
    });
  }),

  http.get(`${API_BASE_URL}/case-track`, async ({ request }) => {
    await latency();
    if (getState(scenarioOf(request)).plan.id !== "elite") {
      return apiError(403, "elite_only", "The case track is part of the Elite plan.");
    }
    return HttpResponse.json({
      modules: [
        { id: "c1", title: "Structuring a market-entry case", minutes: 40, done: false },
        { id: "c2", title: "Pricing and distributor margins", minutes: 35, done: false },
        { id: "c3", title: "Profitability drivers", minutes: 30, done: false },
        { id: "c4", title: "Brand revival case", minutes: 45, done: false },
        { id: "c5", title: "Live case with a panelist", minutes: 60, done: false },
      ],
    });
  }),

  // Billing
  http.get(`${API_BASE_URL}/billing`, async ({ request }) => {
    await latency();
    const st = getState(scenarioOf(request));
    return HttpResponse.json({
      plan: st.plan,
      credits: st.credits,
      invoices: st.invoices,
      canUpgrade: st.plan.id !== "elite",
    });
  }),

  http.get(`${API_BASE_URL}/billing/upgrade-quote`, async ({ request }) => {
    await latency();
    const scenario = scenarioOf(request);
    const st = getState(scenario);
    if (st.plan.id === "elite") return apiError(409, "already_elite", "You are already on Elite.");
    const unused = Math.max(0, st.credits.total - st.credits.used);
    const credit =
      st.plan.status === "ended" || st.credits.total === 0
        ? 0
        : Math.round((st.plan.paid * unused) / st.credits.total);
    return HttpResponse.json({
      from: st.plan.name,
      to: "Elite",
      listPrice: ELITE_PRICE,
      topUpCredit: credit,
      payable: ELITE_PRICE - credit,
      seatsLeft: scenario === "cohort-full" ? 0 : ELITE_SEATS_LEFT,
    });
  }),

  http.post(`${API_BASE_URL}/billing/upgrade`, async ({ request }) => {
    await latency();
    const scenario = scenarioOf(request);
    const st = getState(scenario);
    if (st.plan.id === "elite") return apiError(409, "already_elite", "You are already on Elite.");
    if (scenario === "cohort-full") {
      return apiError(409, "cohort_full", "Elite is full. Join the waitlist instead.");
    }
    const unused = Math.max(0, st.credits.total - st.credits.used);
    const credit =
      st.plan.status === "ended" || st.credits.total === 0
        ? 0
        : Math.round((st.plan.paid * unused) / st.credits.total);
    const amount = ELITE_PRICE - credit;
    st.upgradeAttempts += 1;
    if (scenario === "payment-failed" && st.upgradeAttempts === 1) {
      return HttpResponse.json({
        status: "failed",
        receiptNo: null,
        amount,
        plan: "Elite",
        message: "Your bank declined the payment. No money was taken.",
      });
    }
    const receiptNo = `PC-2026-${4300 + st.invoices.length + 1}`;
    st.invoices.push({
      id: `inv-${st.invoices.length + 1}`,
      receiptNo,
      description: "Upgrade to Elite",
      amount,
      at: NOW,
    });
    st.plan = {
      id: "elite",
      name: "Elite",
      paid: st.plan.paid + amount,
      status: "active",
      endedAt: null,
    };
    st.notifications.unshift({
      id: `n-up-${st.invoices.length}`,
      kind: "billing",
      title: "Welcome to Elite",
      body: `Receipt ${receiptNo}. The case track is now open.`,
      at: NOW,
      read: false,
      href: "/case-track",
    });
    return HttpResponse.json({ status: "paid", receiptNo, amount, plan: "Elite", message: null });
  }),

  // Profile
  http.get(`${API_BASE_URL}/profile`, async ({ request }) => {
    await latency();
    const st = getState(scenarioOf(request));
    return HttpResponse.json({
      name: st.profile.name,
      email: "riya@scmhrd.edu",
      college: st.profile.college,
      batch: st.profile.batch,
      track: "Finals",
      background: "Two years as an FMCG sales analyst",
      target: { function: st.target.function, role: st.target.role },
      targetChange: st.targetChange,
    });
  }),

  http.put(`${API_BASE_URL}/profile`, async ({ request }) => {
    await latency();
    const st = getState(scenarioOf(request));
    Object.assign(st.profile, await request.json());
    return HttpResponse.json({ ok: true });
  }),

  http.post(`${API_BASE_URL}/profile/change-target`, async ({ request }) => {
    await latency();
    const st = getState(scenarioOf(request));
    const body = (await request.json()) as { function: string; role: string };
    const sameFunction = body.function === st.target.function;
    const toFlag = sameFunction ? 1 : 4;
    let flagged = 0;
    for (const a of st.answers) {
      if (flagged >= toFlag) break;
      if (a.status === "rehearsed") {
        a.status = "flagged";
        a.critique = "Your target changed: reframe this for the new role.";
        flagged++;
      }
    }
    st.targetChange = {
      changedAt: NOW,
      from: `${st.target.function} (${st.target.role})`,
      answersToRework: flagged,
    };
    st.target = { function: body.function, role: body.role };
    st.notifications.unshift({
      id: `n-tc-${Date.now()}`,
      kind: "runway",
      title: `Target changed to ${body.function}`,
      body: `${flagged} answers need rework.`,
      at: NOW,
      read: false,
      href: "/answers?status=flagged",
    });
    return HttpResponse.json({
      ok: true,
      answersToRework: flagged,
      cvBulletsToReframe: sameFunction ? 1 : 4,
    });
  }),

  // Outcome
  http.get(`${API_BASE_URL}/outcome`, async ({ request }) => {
    await latency();
    return HttpResponse.json(getState(scenarioOf(request)).outcome);
  }),

  http.post(`${API_BASE_URL}/outcome`, async ({ request }) => {
    await latency();
    const st = getState(scenarioOf(request));
    const body = (await request.json()) as {
      state: "placed" | "not-placed";
      company?: string;
      role?: string;
      ctc?: number;
    };
    st.outcome =
      body.state === "placed"
        ? {
            state: "placed",
            company: body.company ?? null,
            role: body.role ?? null,
            ctc: body.ctc ?? null,
            creditCarried: null,
            day0Label: st.outcome.day0Label,
          }
        : {
            state: "not-placed",
            company: null,
            role: null,
            ctc: null,
            creditCarried: st.plan.paid,
            day0Label: st.outcome.day0Label,
          };
    return HttpResponse.json(st.outcome);
  }),

  // Notifications
  http.get(`${API_BASE_URL}/notifications`, async ({ request }) => {
    await latency();
    const st = getState(scenarioOf(request));
    const items = [...st.notifications].sort((a, b) => b.at.localeCompare(a.at));
    return HttpResponse.json({ items, unread: items.filter((n) => !n.read).length });
  }),

  http.post(`${API_BASE_URL}/notifications/read`, async ({ request }) => {
    const st = getState(scenarioOf(request));
    const body = (await request.json()) as { ids?: string[]; all?: boolean };
    for (const n of st.notifications) {
      if (body.all || body.ids?.includes(n.id)) n.read = true;
    }
    return HttpResponse.json({ ok: true });
  }),
];
