import { HttpResponse } from "msw";
import { http } from "../http";
import { API_BASE_URL } from "@/lib/api/client";
import { getDb } from "../db";
import { apiError, latency, paginate, scenarioOf } from "../utils";
import { getWorld } from "../world";

/** Student feedback = notes whose session is actually completed in this scenario. */
function visible(scenario: ReturnType<typeof scenarioOf>) {
  const db = getDb(scenario);
  return getWorld(scenario)
    .feedbacks.filter((f) => db.sessions.find((s) => s.id === f.sessionId)?.status === "completed")
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
}

export const feedbackHandlers = [
  http.get(`${API_BASE_URL}/feedback`, async ({ request }) => {
    await latency();
    const items = visible(scenarioOf(request)).map((f) => ({
      panelId: f.panelId,
      sessionId: f.sessionId,
      panelist: f.panelist,
      function: f.function,
      startsAt: f.startsAt,
      verdict: f.verdict,
      headline: f.headline,
    }));
    return HttpResponse.json(paginate(items, new URL(request.url)));
  }),

  http.get(`${API_BASE_URL}/feedback/:panelId`, async ({ request, params }) => {
    await latency();
    const f = visible(scenarioOf(request)).find((x) => x.panelId === params.panelId);
    if (!f) return apiError(404, "feedback_not_found", "We could not find that feedback.");
    return HttpResponse.json(f);
  }),
];
