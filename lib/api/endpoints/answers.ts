import { api } from "../client";
import {
  answerDetailSchema,
  answerListSchema,
  type PatchAnswerBody,
} from "@/features/answer-bank/schemas";

export const getAnswers = (params: {
  status?: string;
  round?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}) => {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.round) q.set("round", params.round);
  if (params.q) q.set("q", params.q);
  q.set("page", String(params.page ?? 1));
  q.set("pageSize", String(params.pageSize ?? 25));
  return api(`/answers?${q}`, answerListSchema);
};
export const getAnswer = (id: string) => api(`/answers/${id}`, answerDetailSchema);
export const patchAnswer = (id: string, body: PatchAnswerBody) =>
  api(`/answers/${id}`, answerDetailSchema, { method: "PATCH", json: body });
