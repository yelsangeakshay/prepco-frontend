import { api } from "../client";
import { okSchema } from "@/features/auth/schemas";
import {
  applicationResultSchema,
  availabilitySchema,
  briefListSchema,
  briefSchema,
  panelistProfileSchema,
  scoreResultSchema,
  scoringListSchema,
  todaySchema,
  type ScoreBody,
  type UpdatePanelistProfile,
} from "@/features/panelist/schemas";

export const getPanelistToday = () => api("/panelist/today", todaySchema);
export const getPanelBriefs = () => api("/panelist/briefs", briefListSchema);
export const getBrief = (sessionId: string) => api(`/briefs/${sessionId}`, briefSchema);
export const getScoringList = () => api("/panelist/scoring", scoringListSchema);
export const postScore = (sessionId: string, body: ScoreBody) =>
  api(`/scores/${sessionId}`, scoreResultSchema, { method: "POST", json: body });
export const getAvailability = () => api("/availability", availabilitySchema);
export const putAvailability = (slots: Record<string, boolean>) =>
  api("/availability", availabilitySchema, { method: "PUT", json: { slots } });
export const postApplication = (body: unknown) =>
  api("/panelist/applications", applicationResultSchema, { method: "POST", json: body });
export const getPanelistProfile = () => api("/panelist/profile", panelistProfileSchema);
export const putPanelistProfile = (body: UpdatePanelistProfile) =>
  api("/panelist/profile", okSchema, { method: "PUT", json: body });
