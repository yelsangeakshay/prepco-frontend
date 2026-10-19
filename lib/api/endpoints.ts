import { z } from "zod";
import { api } from "./client";
import {
  authResultSchema,
  okSchema,
  type ForgotBody,
  type ResetBody,
  type SignInBody,
  type SignUpBody,
} from "@/features/auth/schemas";
import {
  cvUploadResultSchema,
  freeSessionSchema,
  type OnboardingProfile,
} from "@/features/onboarding/schemas";
import { checkoutSchema, plansSchema, waitlistSchema } from "@/features/plans/schemas";
import {
  runwaySchema,
  sessionListSchema,
  sessionSchema,
  slotsSchema,
} from "@/features/runway/schemas";
import { feedbackDetailSchema, feedbackListSchema } from "@/features/feedback/schemas";

import {
  cvSchema,
  cvVersionsSchema,
  patchBulletResultSchema,
  relockResultSchema,
  type RelockBody,
} from "@/features/cv-builder/schemas";
import {
  answerDetailSchema,
  answerListSchema,
  type PatchAnswerBody,
} from "@/features/answer-bank/schemas";
import { caseTrackSchema, journeySchema, quickSwitchSchema } from "@/features/journey/schemas";
import { billingSchema, upgradeQuoteSchema, upgradeResultSchema } from "@/features/billing/schemas";
import {
  changeTargetResultSchema,
  profileViewSchema,
  type ChangeTargetBody,
  type UpdateProfileBody,
} from "@/features/profile/schemas";
import { outcomeSchema, type OutcomeBody } from "@/features/outcome/schemas";
import { notificationsSchema, type MarkReadBody } from "@/features/notifications/schemas";

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

export const meSchema = z.object({
  id: z.string(),
  role: z.enum(["student", "panelist", "ops"]),
  name: z.string(),
  initials: z.string(),
  onboarded: z.boolean(),
});
export type Me = z.infer<typeof meSchema>;

/** Every function maps 1:1 to a route in docs/API_CONTRACT.md. */

// Auth
export const getMe = () => api("/me", meSchema);
export const signIn = (body: SignInBody) =>
  api("/auth/sign-in", authResultSchema, { method: "POST", json: body });
export const signUp = (body: SignUpBody) =>
  api("/auth/sign-up", authResultSchema, { method: "POST", json: body });
export const forgotPassword = (body: ForgotBody) =>
  api("/auth/forgot", okSchema, { method: "POST", json: body });
export const resetPassword = (body: Pick<ResetBody, "token" | "password">) =>
  api("/auth/reset", okSchema, { method: "POST", json: body });

// Onboarding
export const saveProfile = (body: OnboardingProfile) =>
  api("/students/me/profile", okSchema, { method: "PUT", json: body });
export const uploadCv = (body: { fileName: string; size: number; consent: true }) =>
  api("/students/me/cv", cvUploadResultSchema, { method: "POST", json: body });
export const getFreeSession = () => api("/free-session", freeSessionSchema);

// Plans and payment
export const getPlans = () => api("/plans", plansSchema);
export const postCheckout = (planId: string) =>
  api("/checkout", checkoutSchema, { method: "POST", json: { planId } });
export const getCheckout = (id: string) => api(`/checkout/${id}`, checkoutSchema);
export const postWaitlist = (body: { planId: string; email: string }) =>
  api("/waitlist", waitlistSchema, { method: "POST", json: body });

// Runway and sessions
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

// Feedback
export const getFeedback = (params: { page?: number; pageSize?: number } = {}) => {
  const q = new URLSearchParams({
    page: String(params.page ?? 1),
    pageSize: String(params.pageSize ?? 25),
  });
  return api(`/feedback?${q}`, feedbackListSchema);
};
export const getFeedbackDetail = (panelId: string) =>
  api(`/feedback/${panelId}`, feedbackDetailSchema);

// CV
export const getCv = () => api("/cv", cvSchema);
export const patchBullet = (id: string, text: string) =>
  api(`/cv/bullets/${id}`, patchBulletResultSchema, { method: "PATCH", json: { text } });
export const getCvVersions = () => api("/cv/versions", cvVersionsSchema);
export const lockCvVersion = (id: string) =>
  api(`/cv/versions/${id}/lock`, okSchema, { method: "POST" });
export const requestRelock = (body: RelockBody) =>
  api("/cv/relock-request", relockResultSchema, { method: "POST", json: body });

// Answers
export const getAnswers = (params: {
  status?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}) => {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.q) q.set("q", params.q);
  q.set("page", String(params.page ?? 1));
  q.set("pageSize", String(params.pageSize ?? 25));
  return api(`/answers?${q}`, answerListSchema);
};
export const getAnswer = (id: string) => api(`/answers/${id}`, answerDetailSchema);
export const patchAnswer = (id: string, body: PatchAnswerBody) =>
  api(`/answers/${id}`, answerDetailSchema, { method: "PATCH", json: body });

// Journey, extras
export const getJourney = () => api("/journey", journeySchema);
export const getQuickSwitch = (to: string) =>
  api(`/quick-switch?to=${encodeURIComponent(to)}`, quickSwitchSchema);
export const getCaseTrack = () => api("/case-track", caseTrackSchema);

// Billing
export const getBilling = () => api("/billing", billingSchema);
export const getUpgradeQuote = () => api("/billing/upgrade-quote", upgradeQuoteSchema);
export const postUpgrade = () => api("/billing/upgrade", upgradeResultSchema, { method: "POST" });

// Profile
export const getProfile = () => api("/profile", profileViewSchema);
export const updateProfile = (body: UpdateProfileBody) =>
  api("/profile", okSchema, { method: "PUT", json: body });
export const changeTarget = (body: ChangeTargetBody) =>
  api("/profile/change-target", changeTargetResultSchema, { method: "POST", json: body });

// Outcome
export const getOutcome = () => api("/outcome", outcomeSchema);
export const postOutcome = (body: OutcomeBody) =>
  api("/outcome", outcomeSchema, { method: "POST", json: body });

// Notifications
export const getNotifications = () => api("/notifications", notificationsSchema);
export const markNotificationsRead = (body: MarkReadBody) =>
  api("/notifications/read", okSchema, { method: "POST", json: body });

// Query-string helper for list endpoints.
const qs = (params: Record<string, string | number | undefined | null>) => {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params))
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  const s = q.toString();
  return s ? `?${s}` : "";
};
export type ListParams = Record<string, string | number | undefined | null>;

// Panelist
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

// Ops
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
