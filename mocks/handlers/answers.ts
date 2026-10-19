import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "@/lib/api/client";
import { answerCounts, getState } from "../state";
import { apiError, latency, paginate, scenarioOf } from "../utils";

export const answerHandlers = [
  http.get(`${API_BASE_URL}/answers`, async ({ request }) => {
    await latency();
    const st = getState(scenarioOf(request));
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const q = url.searchParams.get("q")?.toLowerCase().trim();
    let list = st.answers;
    if (status) list = list.filter((a) => a.status === status);
    if (q) list = list.filter((a) => `${a.question} ${a.category}`.toLowerCase().includes(q));
    const summaries = list.map((a) => ({
      id: a.id,
      question: a.question,
      category: a.category,
      status: a.status,
      snippet: a.snippet,
      critique: a.critique,
    }));
    return HttpResponse.json({ ...paginate(summaries, url), counts: answerCounts(st) });
  }),

  http.get(`${API_BASE_URL}/answers/:id`, async ({ request, params }) => {
    await latency();
    const a = getState(scenarioOf(request)).answers.find((x) => x.id === params.id);
    if (!a) return apiError(404, "answer_not_found", "We could not find that answer.");
    return HttpResponse.json(a);
  }),

  http.patch(`${API_BASE_URL}/answers/:id`, async ({ request, params }) => {
    await latency();
    const a = getState(scenarioOf(request)).answers.find((x) => x.id === params.id);
    if (!a) return apiError(404, "answer_not_found", "We could not find that answer.");
    const body = (await request.json()) as { draft?: string; status?: typeof a.status };
    if (body.draft !== undefined) {
      a.draft = body.draft;
      a.snippet = body.draft ? body.draft.slice(0, 120) : null;
      if (!body.draft && a.status !== "not-drafted") a.status = "not-drafted";
      if (body.draft && a.status === "not-drafted") a.status = "flagged";
    }
    if (body.status) {
      if (body.status === "not-drafted" && a.draft) {
        return apiError(422, "has_draft", "This answer already has a draft.");
      }
      if (body.status === "rehearsed" && !a.draft) {
        return apiError(422, "no_draft", "Write a draft before marking it rehearsed.");
      }
      a.status = body.status;
    }
    if (a.status !== "flagged") {
      a.critique = null;
      a.inlineCritique = [];
    } else if (!a.critique) {
      a.critique = "You flagged this one for another pass.";
    }
    return HttpResponse.json(a);
  }),
];
