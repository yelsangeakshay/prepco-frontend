import { HttpResponse } from "msw";
import { http } from "../http";
import { API_BASE_URL } from "@/lib/api/client";
import type { PatchAnswerBody } from "@/features/answer-bank/schemas";
import { answerCounts, getState } from "../state";
import { apiError, latency, paginate, scenarioOf } from "../utils";

export const answerHandlers = [
  http.get(`${API_BASE_URL}/answers`, async ({ request }) => {
    await latency();
    const st = getState(scenarioOf(request));
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const round = url.searchParams.get("round");
    const q = url.searchParams.get("q")?.toLowerCase().trim();
    let list = st.answers;
    if (round) list = list.filter((a) => a.round === round);
    const rounds = {
      fit: st.answers.filter((a) => a.round === "fit").length,
      cv: st.answers.filter((a) => a.round === "cv").length,
    };
    if (status) list = list.filter((a) => a.status === status);
    if (q) list = list.filter((a) => `${a.question} ${a.category}`.toLowerCase().includes(q));
    const summaries = list.map((a) => ({
      id: a.id,
      question: a.question,
      category: a.category,
      round: a.round,
      status: a.status,
      snippet: a.snippet,
      critique: a.critique,
      noteTags: a.noteTags,
    }));
    return HttpResponse.json({ ...paginate(summaries, url), counts: answerCounts(st), rounds });
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
    const body = (await request.json()) as PatchAnswerBody;
    const parts = body.parts ? { ...a.parts, ...body.parts } : null;
    const draft =
      parts !== null
        ? [parts.situation, parts.decision, parts.result]
            .map((p) => p.trim())
            .filter(Boolean)
            .join(" ")
        : body.draft;
    if (draft !== undefined) {
      a.draft = draft;
      a.parts = parts ?? { situation: draft, decision: "", result: "" };
      a.snippet = draft ? draft.slice(0, 120) : null;
      a.draftNo += 1;
      a.savedLabel = "just now";
      if (!draft && a.status !== "not-drafted") a.status = "not-drafted";
      if (draft && a.status === "not-drafted") a.status = "flagged";
    }
    if (body.rehearseNext !== undefined) a.rehearseNext = body.rehearseNext;
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
      a.noteTags = [];
      a.flaggedAt = null;
    } else if (!a.critique) {
      a.critique = "You flagged this one for another pass.";
      a.noteTags = ["situation"];
      a.flaggedAt = "Flagged by you · 5 Oct";
    }
    return HttpResponse.json(a);
  }),
];
