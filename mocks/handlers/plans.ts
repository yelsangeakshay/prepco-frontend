import { HttpResponse } from "msw";
import { http } from "../http";
import { API_BASE_URL } from "@/lib/api/client";
import type { Checkout, Plan } from "@/features/plans/schemas";
import { getDb } from "../db";
import { apiError, latency, scenarioOf } from "../utils";

/** Sample prices. Real pricing is an open decision. */
function buildPlans(cohortFull: boolean): Plan[] {
  return [
    {
      id: "basic",
      name: "Basic",
      price: 14999,
      tagline: "Start your runway",
      features: ["Profiling call + CV lock", "One mock panel", "CV Builder"],
      mostChosen: false,
      elite: false,
      seatsTotal: 300,
      seatsTaken: 212,
    },
    {
      id: "premium",
      name: "Premium",
      price: 36999,
      tagline: "The full runway to Day 0",
      features: [
        "Six runway sessions",
        "Three mock panels",
        "CV Builder + HR Question Builder",
        "Quick Switch",
      ],
      mostChosen: true,
      elite: false,
      seatsTotal: 400,
      seatsTaken: cohortFull ? 400 : 312,
    },
    {
      id: "elite",
      name: "Elite",
      price: 59999,
      tagline: "Premium plus the case track",
      features: ["Everything in Premium", "Case track", "Extra pressure mock", "1:1 mentor review"],
      mostChosen: false,
      elite: true,
      seatsTotal: 50,
      seatsTaken: cohortFull ? 50 : 41,
    },
  ];
}

export const plansHandlers = [
  http.get(`${API_BASE_URL}/plans`, async ({ request }) => {
    await latency();
    const cohortFull = scenarioOf(request) === "cohort-full";
    return HttpResponse.json({ items: buildPlans(cohortFull), cohortFull });
  }),

  http.post(`${API_BASE_URL}/checkout`, async ({ request }) => {
    await latency();
    const scenario = scenarioOf(request);
    const { planId } = (await request.json()) as { planId: Plan["id"] };
    const plan = buildPlans(scenario === "cohort-full").find((p) => p.id === planId);
    if (!plan) return apiError(404, "plan_not_found", "That plan does not exist.");
    if (plan.seatsTaken >= plan.seatsTotal) {
      return apiError(409, "cohort_full", "This plan is full. Join the waitlist instead.");
    }

    const db = getDb(scenario);
    const attempts = [...db.checkouts.values()].filter((c) => c.planId === planId).length;
    const id = `co-${1000 + db.checkouts.size + 1}`;
    const failFirst = scenario === "payment-failed" && attempts === 0;

    const checkout: Checkout = failFirst
      ? {
          id,
          planId,
          planName: plan.name,
          amount: plan.price,
          status: "failed",
          failureReason: "Your bank declined the payment. No money was taken.",
          seatHeldUntil: new Date(Date.now() + 15 * 60_000).toISOString(),
          receiptNo: null,
          paidAt: null,
        }
      : {
          id,
          planId,
          planName: plan.name,
          amount: plan.price,
          status: "paid",
          failureReason: null,
          seatHeldUntil: null,
          receiptNo: `PC-2026-${String(4200 + db.checkouts.size + 1)}`,
          paidAt: "2026-10-05T12:00:00+05:30",
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
