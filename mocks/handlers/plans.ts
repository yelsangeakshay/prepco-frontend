import { HttpResponse } from "msw";
import { http } from "../http";
import { API_BASE_URL } from "@/lib/api/client";
import {
  PAY_METHOD_LABEL,
  type Checkout,
  type PayMethod,
  type Plan,
  type Track,
} from "@/features/plans/schemas";
import { getDb } from "../db";
import { PLAN_PRICE, SEATS } from "../world";
import { apiError, latency, scenarioOf } from "../utils";

/** Plans exactly as drawn in s04.png (Season 1 pricing). */
function buildPlans(track: Track, full: boolean): Plan[] {
  const seats = track === "finals" ? SEATS.finals : SEATS.summers;
  const taken = full ? seats.total : seats.taken;
  const eliteTaken = full ? SEATS.elite.total : SEATS.elite.taken;
  return [
    {
      id: "basic",
      name: "Basic",
      price: PLAN_PRICE.basic,
      listPrice: 8999,
      badge: "33% off · Season 1",
      suggested: false,
      tagline:
        "A diagnostic and one real panel. Enough to find out where you stand, not enough to fix it.",
      coverage: { done: 2, total: 6, caption: "CV lock · P1, then stops" },
      inherits: null,
      features: [
        { text: "CV Builder + expert review, 1 re-lock", included: true },
        { text: "HR Question Builder access", included: true },
        { text: "Profiling & strategy call", included: true },
        { text: "P1 mock with an external industry expert", included: true },
        { text: "No P2 or P3 panel", included: false },
        { text: "No domain deep-dive", included: false },
        { text: "No shortlist strategy support", included: false },
      ],
      note: null,
      topUp: 1799,
      seatsTotal: seats.total,
      seatsTaken: taken,
    },
    {
      id: "premium",
      name: "Premium",
      price: PLAN_PRICE.premium,
      listPrice: 17999,
      badge: "Most chosen",
      suggested: true,
      tagline: "The full runway, from CV lock to the pressure mock seven days before Day 0.",
      coverage: { done: 6, total: 6, caption: "CV lock → P1 → deep-dive → P2 → P3 → Day 0" },
      inherits: "Basic",
      features: [
        { text: "P2 panel with an external specialist", included: true },
        { text: "Domain deep-dive with a practitioner", included: true },
        { text: "P3 pressure mock, one week out", included: true },
        { text: "Group positioning session", included: true },
        { text: "Shortlist, JD & application strategy", included: true },
        { text: "Unlimited answer reviews in the builder", included: true },
        { text: "Company-specific prep pack", included: true },
        { text: "Priority slot booking", included: true },
      ],
      note: null,
      topUp: 1299,
      seatsTotal: seats.total,
      seatsTaken: taken,
    },
    {
      id: "elite",
      name: "Elite",
      price: PLAN_PRICE.elite,
      listPrice: 26999,
      badge: "Best value",
      suggested: false,
      tagline:
        "Premium, plus the case competition track: the fastest route to an offer before the process even opens.",
      coverage: { done: 6, total: 6, caption: "Full runway + case track from Week -12" },
      inherits: "Premium",
      features: [
        { text: "Case competition track: 3 sessions", included: true },
        { text: "2 expert deck reviews", included: true },
        { text: "PPI conversion preparation", included: true },
        { text: "Builders stay open across both seasons", included: true },
        { text: "Lowest top-up rates all season", included: true },
      ],
      note: "The case track alone is ₹7,999 on its own. Elite costs ₹4,000 more than Premium.",
      topUp: 999,
      seatsTotal: SEATS.elite.total,
      seatsTaken: eliteTaken,
    },
  ];
}

const FAIL_TITLE: Record<PayMethod, string> = {
  upi: "The UPI payment timed out",
  card: "Your card was declined",
  netbanking: "The net banking session ended",
};

const trackOf = (url: string): Track =>
  new URL(url).searchParams.get("track") === "summers" ? "summers" : "finals";

const LATE_JOINER = {
  daysLeft: 19,
  rows: [
    {
      when: "This week",
      title: "Profiling call + CV lock",
      note: "Same day, back to back",
      status: "fits",
      reason: null,
    },
    {
      when: "Week -2",
      title: "P1 + domain deep-dive",
      note: "Two days apart instead of two weeks",
      status: "fits",
      reason: null,
    },
    {
      when: "Week -1",
      title: "P3: pressure mock",
      note: "Seven days out, as normal",
      status: "fits",
      reason: null,
    },
    {
      when: "Week -4",
      title: "P2 specialist panel",
      note: null,
      status: "dropped",
      reason: "Dropped",
    },
    {
      when: "Week -2",
      title: "Group positioning session",
      note: null,
      status: "dropped",
      reason: "Cohort already ran it",
    },
  ],
  recommendation: {
    title: "Basic + one top-up mock.",
    price: "₹5,999 + ₹1,799",
    body: "It covers what still fits. Premium's later stages wouldn't happen in time, so we won't sell it to you this close.",
    cta: "Choose Basic + top-up",
    planId: "basic",
  },
  nextSeason:
    "If summers is your real target, the CV Builder is free now and the full runway opens 8 weeks before that Day 0.",
} as const;

export const plansHandlers = [
  http.get(`${API_BASE_URL}/plans`, async ({ request }) => {
    await latency();
    const track = trackOf(request.url);
    const full = scenarioOf(request) === "cohort-full";
    const seats = track === "finals" ? SEATS.finals : SEATS.summers;
    return HttpResponse.json({
      items: buildPlans(track, full),
      cohortFull: full,
      waitlistNext: getDb(scenarioOf(request)).waitlistCount + 1,
      lateJoiner: scenarioOf(request) === "late-joiner" ? LATE_JOINER : null,
      track,
      seats: {
        label: `${track === "finals" ? "Finals" : "Summers"} seats, season 1`,
        taken: full ? seats.total : seats.taken,
        total: seats.total,
      },
    });
  }),

  http.post(`${API_BASE_URL}/checkout`, async ({ request }) => {
    await latency();
    const scenario = scenarioOf(request);
    const body = (await request.json()) as { planId: Plan["id"]; method?: PayMethod };
    const method: PayMethod = body.method ?? "upi";
    const plan = buildPlans("finals", scenario === "cohort-full").find((p) => p.id === body.planId);
    if (!plan) return apiError(404, "plan_not_found", "That plan does not exist.");
    if (plan.seatsTaken >= plan.seatsTotal) {
      return apiError(409, "cohort_full", "This plan is full. Join the waitlist instead.");
    }

    const db = getDb(scenario);
    const attempts = [...db.checkouts.values()].filter((c) => c.planId === body.planId).length;
    const id = `co-${1000 + db.checkouts.size + 1}`;
    const failFirst = scenario === "payment-failed" && attempts === 0;
    const base = {
      id,
      planId: plan.id,
      planName: plan.name,
      track: "finals" as const,
      method,
      amount: plan.price,
      email: "riya.kulkarni@scmhrd.edu",
    };

    const checkout: Checkout = failFirst
      ? {
          ...base,
          status: "failed",
          failureTitle: FAIL_TITLE[method],
          failureReason:
            "Nothing was charged. If your bank shows a debit, it reverses on its own within 5–7 working days, and we'll email you the reference.",
          seatHeldUntil: new Date(Date.now() + 15 * 60_000).toISOString(),
          receiptNo: null,
          paidAt: null,
        }
      : {
          ...base,
          status: "paid",
          failureTitle: null,
          failureReason: null,
          seatHeldUntil: null,
          receiptNo: `PC-${24816 + db.checkouts.size}`,
          paidAt: "2026-09-10T12:00:00+05:30",
        };
    db.checkouts.set(id, checkout);
    return HttpResponse.json(checkout);
  }),

  http.get(`${API_BASE_URL}/checkout/:id`, async ({ request, params }) => {
    await latency();
    const c = getDb(scenarioOf(request)).checkouts.get(String(params.id));
    if (!c) return apiError(404, "checkout_not_found", "We could not find that payment.");
    return HttpResponse.json(c);
  }),

  http.post(`${API_BASE_URL}/waitlist`, async ({ request }) => {
    await latency();
    const db = getDb(scenarioOf(request));
    db.waitlistCount += 1;
    return HttpResponse.json({ position: db.waitlistCount, claimWindowHours: 24, priceKept: true });
  }),
];

void PAY_METHOD_LABEL;
