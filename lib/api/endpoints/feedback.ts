import { api } from "../client";
import { feedbackDetailSchema, feedbackListSchema } from "@/features/feedback/schemas";

export const getFeedback = (params: { page?: number; pageSize?: number } = {}) => {
  const q = new URLSearchParams({
    page: String(params.page ?? 1),
    pageSize: String(params.pageSize ?? 25),
  });
  return api(`/feedback?${q}`, feedbackListSchema);
};
export const getFeedbackDetail = (panelId: string) =>
  api(`/feedback/${panelId}`, feedbackDetailSchema);
