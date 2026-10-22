import { HttpResponse } from "msw";
import { http } from "../http";
import { API_BASE_URL } from "@/lib/api/client";
import type { Billing } from "@/features/billing/schemas";
import { formatDay } from "@/lib/utils/dates";
import { getDb } from "../db";
import { getState } from "../state";
import { PLAN_PRICE, SEATS } from "../world";
import { apiError, latency, scenarioOf } from "../utils";

const NOW = "2026-10-05T12:00:00+05:30";

const UNLOCKS = {
  premium: [
    "P2 panel with an external specialist",
    "Domain deep-dive with a practitioner",
    "P3 pressure mock, one week out",
    "Shortlist, JD & application strategy",
  ],
  elite: [
    "Case competition track: 3 sessions",
    "2 expert deck reviews",
    "PPI conversion preparation",
    "Lowest top-up rates all season",
  ],
} as const;

/** e08: next tier price, minus what you paid for this tier, minus top-ups bought this season. */
function quoteFor(st: ReturnType<typeof getState>, scenario: string | null | undefined) {
  const toElite = st.plan.id === "premium";
  const listPrice = toElite ? PLAN_PRICE.elite : PLAN_PRICE.premium;
  const difference = listPrice - st.plan.paid;
  const topUpCredit = st.topUps.reduce((sum, t) => sum + t.amount, 0);
  const seats = toElite ? SEATS.elite : SEATS.finals;
  return {
    from: st.plan.name,
    to: toElite ? "Elite" : "Premium",
    listPrice,
    difference,
    topUps: st.topUps,
    topUpCredit,
    payable: Math.max(0, difference - topUpCredit),
    unlocks: [...(toElite ? UNLOCKS.elite : UNLOCKS.premium)],
    seatsLeft: scenario === "cohort-full" ? 0 : seats.total - seats.taken,
  };
}

/** Top-up mock rate per plan (s04.png). Deck review and the 3-mock pack have ranges only. */
const MOCK_RATE: Record<string, number> = { Basic: 1799, Premium: 1299, Elite: 999 };

function topUpsFor(plan: string) {
  return [
    {
      id: "mock-panel",
      label: "Extra mock panel",
      detail: `${plan} rate · ₹999–1,799 across plans`,
      price: MOCK_RATE[plan] ?? null,
    },
    { id: "deck-review", label: "Deck review", detail: "₹899–1,499 across plans", price: null },
    { id: "mock-pack", label: "3-mock pack", detail: "₹2,499–4,499 across plans", price: null },
  ];
}

const ENTITLEMENT_LABEL: Record<string, string> = {
  "s-1001": "Profiling & strategy call",
  "s-1002": "P1 mock with an external industry expert",
  "s-1003": "Domain deep-dive with a practitioner",
  "s-1004": "P2 panel with an external specialist",
  "s-1005": "Group positioning session",
  "s-1006": "P3 pressure mock, one week out",
};

function buildBilling(st: ReturnType<typeof getState>, db: ReturnType<typeof getDb>) {
  const entitlements: Billing["entitlements"] = db.sessions.map((s) => ({
    id: s.id,
    label: ENTITLEMENT_LABEL[s.id] ?? s.title,
    state:
      s.status === "completed"
        ? ("used" as const)
        : s.status === "upcoming" || s.status === "rescheduled"
          ? ("booked" as const)
          : s.startsAt && s.status === "locked"
            ? ("scheduled" as const)
            : ("unbooked" as const),
    when: s.startsAt && s.status !== "completed" ? formatDay(s.startsAt) : null,
  }));
  const perks =
    st.plan.id === "elite"
      ? "Unlimited answer reviews · company-specific prep pack · priority slot booking · case track"
      : st.plan.id === "premium"
        ? "Unlimited answer reviews · company-specific prep pack · priority slot booking"
        : null;
  if (perks) entitlements.push({ id: "perks", label: perks, state: "active", when: null });
  const paid = st.invoices.filter((i) => i.amount > 0);
  const invoices = [
    ...st.invoices.map((i) => ({
      ...i,
      description:
        i.amount > 0 && i === paid[0] ? `${st.plan.name} · Finals · Season 1` : i.description,
      status: "paid" as const,
    })),
    ...st.topUps.map((t, i) => ({
      id: `inv-top-${i + 1}`,
      receiptNo: `PC-2026-43${10 + i}`,
      description: t.label,
      amount: t.amount,
      at: t.at,
      status: "paid" as const,
    })),
    ...(st.plan.id === "free"
      ? []
      : [
          {
            id: "inv-free",
            receiptNo: "",
            description: "Free session",
            amount: 0,
            at: "2026-09-08T12:00:00+05:30",
            status: "no-charge" as const,
          },
        ]),
  ].sort((a, b) => b.at.localeCompare(a.at));
  return {
    plan: st.plan,
    credits: st.credits,
    invoices,
    canUpgrade: st.plan.id !== "elite",
    season: "Finals · Season 1",
    tagline:
      st.plan.id === "premium" || st.plan.id === "elite"
        ? "The full runway, from CV lock to the pressure mock seven days before Day 0."
        : null,
    paidAt: paid[0]?.at ?? null,
    entitlements,
    topUps: topUpsFor(st.plan.name),
  };
}

const LISTINGS = [
  {
    id: "l1",
    fit: 96,
    title: "Business Analyst: Consulting",
    meta: "Posted 2 days ago · Mumbai · on-site",
  },
  {
    id: "l2",
    fit: 91,
    title: "Product Associate: SaaS",
    meta: "Posted 4 days ago · Bengaluru · hybrid",
  },
  { id: "l3", fit: 88, title: "Strategy & Ops", meta: "Posted 6 days ago · Pune · on-site" },
];

function buildDigest(st: ReturnType<typeof getState>) {
  const { prefs, saved } = st.quickSwitch;
  const items = LISTINGS.filter((l) => l.fit > prefs.minFit).map((l) => ({
    ...l,
    saved: saved.includes(l.id),
  }));
  return {
    stats: {
      matches: 20,
      highFit: LISTINGS.filter((l) => l.fit >= 85).length,
      boards: "7+",
      oldest: "7 days",
    },
    date: "Mon 5 Oct",
    items: prefs.enabled ? items : [],
    prefs,
  };
}

export const accountHandlers = [
  // Journey, quick switch, case track
  http.get(`${API_BASE_URL}/journey`, async ({ request }) => {
    await latency();
    const db = getDb(scenarioOf(request));
    const done = db.sessions.filter((s) => s.status === "completed").length;
    const stage = (
      id: string,
      term: string,
      title: string,
      detail: string,
      state: "before" | "now" | "after",
    ) => ({
      id,
      term,
      title,
      detail,
      state,
      progress: state === "now" ? Math.round((done / Math.max(1, db.sessions.length)) * 100) : null,
    });
    return HttpResponse.json({
      joinedAt: "Term 5–6",
      stages: [
        stage("t1", "Term 1", "Inception", "Two-year runway begins", "before"),
        stage("t2", "Term 1–2", "CV built & locked", "Versioned & panel-reviewed", "before"),
        stage("t3", "Term 2", "Case competitions", "PPI conversion track", "before"),
        stage("t4", "Term 3", "Summers", "Rehearsed, not improvised", "before"),
        stage("t5", "Term 4–5", "PPO push", "Before finals even opens", "before"),
        stage("t6", "Term 5–6 · Now", "Final placements", "P1 → P2 → P3 → Day 0", "now"),
        stage("t7", "After", "Offer letter", "No extra cost, until there's one", "after"),
      ],
      routes: [
        {
          id: "r1",
          label: "Route one",
          title: "Case competitions",
          description: "Win or place well, convert the PPI, and skip the queue entirely.",
          path: "Compete → PPI → Offer",
          fit: "alternate",
          badge: null,
          link: null,
        },
        {
          id: "r2",
          label: "Route two",
          title: "Summer internship",
          description: "Land the right SIP, then convert it into a pre-placement offer.",
          path: "Summers → PPO",
          fit: "alternate",
          badge: null,
          link: null,
        },
        {
          id: "r3",
          label: "Route three",
          title: "Final placements",
          description: "The main process. Day 0 through Day 2, shortlist to offer.",
          path: "Shortlist → Panel → Offer",
          fit: "primary",
          badge: null,
          link: null,
        },
        {
          id: "r4",
          label: "Route four",
          title: "Lateral support",
          description: "If campus doesn't land, we keep working with you off it.",
          path: "",
          fit: "alternate",
          badge: "Powered by Quick Switch",
          link: { label: "Off-campus → Offer", href: "/quick-switch" },
        },
      ],
    });
  }),

  http.get(`${API_BASE_URL}/quick-switch/digest`, async ({ request }) => {
    await latency();
    return HttpResponse.json(buildDigest(getState(scenarioOf(request))));
  }),

  http.put(`${API_BASE_URL}/quick-switch/preferences`, async ({ request }) => {
    await latency();
    const st = getState(scenarioOf(request));
    st.quickSwitch.prefs = (await request.json()) as typeof st.quickSwitch.prefs;
    return HttpResponse.json(st.quickSwitch.prefs);
  }),

  http.post(`${API_BASE_URL}/quick-switch/saved/:id`, async ({ request, params }) => {
    await latency();
    const st = getState(scenarioOf(request));
    const id = String(params.id);
    const saved = st.quickSwitch.saved;
    st.quickSwitch.saved = saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id];
    return HttpResponse.json(buildDigest(st));
  }),

  http.get(`${API_BASE_URL}/quick-switch`, async ({ request }) => {
    await latency();
    const st = getState(scenarioOf(request));
    const to = new URL(request.url).searchParams.get("to") ?? "";
    const reusableByFn: Record<string, number> = {
      "Sales & Marketing": 18,
      Finance: 9,
      Operations: 12,
      "Business Analytics": 8,
      HR: 14,
      "General Management": 10,
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
    const st = getState(scenarioOf(request));
    const unlocked = st.plan.id === "elite";
    const step = (
      id: string,
      n: number | null,
      title: string,
      detail: string,
      state: "done" | "upload" | "book" | "later" | "on-placing",
    ) => ({ id, n, title, detail, state });
    return HttpResponse.json({
      unlocked,
      plan: st.plan.name,
      upgrade: unlocked
        ? null
        : { alone: 7999, moreThanPlan: Math.max(0, PLAN_PRICE.elite - st.plan.paid) },
      startWeek: "Week -12",
      seats: { left: SEATS.elite.total - SEATS.elite.taken, total: SEATS.elite.total },
      summary: [
        { label: "Coaching sessions", value: "3" },
        { label: "Expert deck reviews", value: "2" },
        { label: "PPI conversion prep", value: "Included" },
        { label: "Start", value: "Week -12" },
      ],
      steps: [
        step("c1", 1, "Coaching session 1", "Reading the brief and picking the angle", "done"),
        step(
          "c2",
          2,
          "Expert deck review 1",
          "Upload your round-one deck · written review back",
          "upload",
        ),
        step("c3", 3, "Coaching session 2", "Structure, storyline and the numbers slide", "book"),
        step("c4", 4, "Expert deck review 2", "Finals deck", "later"),
        step("c5", 5, "Coaching session 3", "Presenting and the Q&A round", "later"),
        step(
          "c6",
          null,
          "PPI conversion preparation",
          "If you place, we prep the pre-placement interview",
          "on-placing",
        ),
      ],
    });
  }),

  // Billing
  http.get(`${API_BASE_URL}/billing`, async ({ request }) => {
    await latency();
    const st = getState(scenarioOf(request));
    return HttpResponse.json(buildBilling(st, getDb(scenarioOf(request))));
  }),

  http.post(`${API_BASE_URL}/billing/top-ups`, async ({ request }) => {
    await latency();
    const st = getState(scenarioOf(request));
    const { id } = (await request.json()) as { id: string };
    const item = topUpsFor(st.plan.name).find((t) => t.id === id);
    if (!item?.price) return apiError(422, "top_up_unpriced", "That top-up has no price yet.");
    st.topUps.push({ label: item.label, amount: item.price, at: NOW });
    return HttpResponse.json({ ok: true, label: item.label, amount: item.price });
  }),

  http.get(`${API_BASE_URL}/billing/upgrade-quote`, async ({ request }) => {
    await latency();
    const scenario = scenarioOf(request);
    const st = getState(scenario);
    if (st.plan.id === "elite") return apiError(409, "already_elite", "You are already on Elite.");
    return HttpResponse.json(quoteFor(st, scenario));
  }),

  http.post(`${API_BASE_URL}/billing/upgrade`, async ({ request }) => {
    await latency();
    const scenario = scenarioOf(request);
    const st = getState(scenario);
    if (st.plan.id === "elite") return apiError(409, "already_elite", "You are already on Elite.");
    const quote = quoteFor(st, scenario);
    if (quote.seatsLeft === 0) {
      return apiError(409, "cohort_full", `${quote.to} is full. Join the waitlist instead.`);
    }
    const amount = quote.payable;
    st.upgradeAttempts += 1;
    if (scenario === "payment-failed" && st.upgradeAttempts === 1) {
      return HttpResponse.json({
        status: "failed",
        receiptNo: null,
        amount,
        plan: quote.to,
        message: "Your bank declined the payment. No money was taken.",
      });
    }
    const receiptNo = `PC-2026-${4300 + st.invoices.length + 1}`;
    st.invoices.push({
      id: `inv-${st.invoices.length + 1}`,
      receiptNo,
      description: `Upgrade to ${quote.to}`,
      amount,
      at: NOW,
    });
    const toElite = quote.to === "Elite";
    st.plan = {
      id: toElite ? "elite" : "premium",
      name: quote.to,
      paid: toElite ? PLAN_PRICE.elite : PLAN_PRICE.premium,
      status: "active",
      endedAt: null,
    };
    st.topUps = [];
    st.notifications.unshift({
      id: `n-up-${st.invoices.length}`,
      kind: "billing",
      title: `Welcome to ${quote.to}`,
      body: toElite
        ? `Receipt ${receiptNo}. The case track is now open.`
        : `Receipt ${receiptNo}. Your runway continues.`,
      at: NOW,
      read: false,
      href: toElite ? "/case-track" : "/home",
    });
    return HttpResponse.json({ status: "paid", receiptNo, amount, plan: quote.to, message: null });
  }),

  // Profile
  http.get(`${API_BASE_URL}/profile`, async ({ request }) => {
    await latency();
    const st = getState(scenarioOf(request));
    return HttpResponse.json({
      name: st.profile.name,
      email: "riya.kulkarni@scmhrd.edu",
      college: st.profile.college,
      batch: st.profile.batch,
      track: "Finals",
      background: "Two years as an FMCG sales analyst",
      workExperience: st.profile.workExperience,
      phone: st.profile.phone,
      day0: "Mon, 9 Nov 2026",
      panelSees: [
        {
          id: "cv",
          label: "Locked CV and version history",
          detail: st.cv.lockedVersion ? `V1 → ${st.cv.lockedVersion}` : "Not locked yet",
        },
        { id: "profiling", label: "Profiling call notes", detail: "14 Sep" },
        {
          id: "answers",
          label: "Answer bank",
          detail: `${st.answers.length} questions · drafts and reviews`,
        },
        { id: "feedback", label: "Past panel feedback", detail: "P1 · 21 Sep" },
      ],
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
    const body = (await request.json()) as { function: string; role?: string };
    const sameFunction = body.function === st.target.function;
    const toFlag = sameFunction ? 1 : 4;
    let flagged = 0;
    for (const a of st.answers) {
      if (flagged >= toFlag) break;
      if (a.status === "rehearsed") {
        a.status = "flagged";
        a.critique = "Your target changed: reframe this for the new role.";
        a.noteTags = ["situation"];
        a.flaggedAt = "Target change · 5 Oct";
        flagged++;
      }
    }
    st.targetChange = {
      changedAt: NOW,
      from: `${st.target.function} (${st.target.role})`,
      answersToRework: flagged,
    };
    st.target = { function: body.function, role: body.role ?? body.function };
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
