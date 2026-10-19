import { api } from "../client";
import { qs, type ListParams } from "./qs";
import { okSchema } from "@/features/auth/schemas";
import {
  applicationListSchema,
  assignResultSchema,
  assignmentsSchema,
  bookingListSchema,
  cohortSchema,
  ledgerSchema,
  rosterSchema,
  studentDetailSchema,
  studentListSchema,
} from "@/features/ops/schemas";

export const getOpsCohort = () => api("/ops/cohort", cohortSchema);
export const getOpsStudents = (p: ListParams) => api(`/ops/students${qs(p)}`, studentListSchema);
export const getOpsStudent = (id: string) => api(`/ops/students/${id}`, studentDetailSchema);
export const decideRelock = (id: string, decision: "approve" | "reject") =>
  api(`/ops/students/${id}/relock`, okSchema, { method: "POST", json: { decision } });
export const getOpsAssignments = () => api("/ops/assignments", assignmentsSchema);
export const postAssignment = (body: { sessionId: string; panelistId: string }) =>
  api("/ops/assignments", assignResultSchema, { method: "POST", json: body });
export const getOpsBookings = (p: ListParams) => api(`/ops/bookings${qs(p)}`, bookingListSchema);
export const excuseBooking = (id: string) =>
  api(`/ops/bookings/${id}/excuse`, assignResultSchema, { method: "POST" });
export const getOpsLedger = (p: ListParams) => api(`/ops/ledger${qs(p)}`, ledgerSchema);
export const getOpsPanelists = (p: ListParams) => api(`/ops/panelists${qs(p)}`, rosterSchema);
export const panelistAction = (id: string, action: "pause" | "resume" | "nudge") =>
  api(`/ops/panelists/${id}/action`, okSchema, { method: "POST", json: { action } });
export const getOpsApplications = (status?: string) =>
  api(`/ops/applications${qs({ status })}`, applicationListSchema);
export const decideApplication = (id: string, decision: "approve" | "reject") =>
  api(`/ops/applications/${id}/decision`, okSchema, { method: "POST", json: { decision } });
