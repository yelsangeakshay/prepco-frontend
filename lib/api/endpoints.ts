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
