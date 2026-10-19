import { api } from "../client";
import {
  runwaySchema,
  sessionListSchema,
  sessionSchema,
  slotsSchema,
} from "@/features/runway/schemas";

export const getRunway = () => api("/students/me/runway", runwaySchema);
export const getSessions = (params: { page?: number; pageSize?: number } = {}) => {
  const q = new URLSearchParams({
    page: String(params.page ?? 1),
    pageSize: String(params.pageSize ?? 25),
  });
  return api(`/sessions?${q}`, sessionListSchema);
};
export const getSession = (id: string) => api(`/sessions/${id}`, sessionSchema);
export const getSessionSlots = (id: string) => api(`/sessions/${id}/slots`, slotsSchema);
export const bookSession = (id: string, slotId: string) =>
  api(`/sessions/${id}/book`, sessionSchema, { method: "POST", json: { slotId } });
export const rescheduleSession = (id: string, slotId: string) =>
  api(`/sessions/${id}/reschedule`, sessionSchema, { method: "POST", json: { slotId } });
export const cancelSession = (id: string) =>
  api(`/sessions/${id}/cancel`, sessionSchema, { method: "POST" });
