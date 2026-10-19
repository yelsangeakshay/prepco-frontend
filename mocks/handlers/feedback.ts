import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "@/lib/api/client";
import { getDb } from "../db";
import { ARJUN } from "../fixtures/personas";
import { apiError, latency, paginate, scenarioOf } from "../utils";

const DETAIL = {
  panelId: "p-1001",
  sessionId: "s-1002",
  panelist: ARJUN.name,
  function: ARJUN.function,
  startsAt: "2026-09-21T19:00:00+05:30",
  verdict: "Almost There",
  headline: "Strong structure, thin on the pricing trade-off.",
  note: "You framed the problem well and your FMCG numbers were credible. When I pushed on why the distributor margin should change, you went quiet. Prepare one number you can defend and the trade-off behind it.",
  scores: [
    { label: "Structure", value: 82 },
    { label: "Defensibility", value: 61 },
    { label: "Composure", value: 74 },
  ],
  sentBackToBuilder: true,
};

const SUMMARY = {
  panelId: DETAIL.panelId,
  sessionId: DETAIL.sessionId,
  panelist: DETAIL.panelist,
  function: DETAIL.function,
  startsAt: DETAIL.startsAt,
  verdict: DETAIL.verdict,
  headline: DETAIL.headline,
};

export const feedbackHandlers = [
  http.get(`${API_BASE_URL}/feedback`, async ({ request }) => {
    await latency();
    const db = getDb(scenarioOf(request));
    const has = db.sessions.some((s) => s.feedbackId === "p-1001" && s.status === "completed");
    return HttpResponse.json(paginate(has ? [SUMMARY] : [], new URL(request.url)));
  }),

  http.get(`${API_BASE_URL}/feedback/:panelId`, async ({ params }) => {
    await latency();
    if (params.panelId !== DETAIL.panelId) {
      return apiError(404, "feedback_not_found", "We could not find that feedback.");
    }
    return HttpResponse.json(DETAIL);
  }),
];
