import { api } from "../client";
import {
  checkoutSchema,
  plansSchema,
  waitlistSchema,
  type CheckoutBody,
  type Track,
} from "@/features/plans/schemas";

export const getPlans = (track: Track = "finals") => api(`/plans?track=${track}`, plansSchema);
export const postCheckout = (body: CheckoutBody) =>
  api("/checkout", checkoutSchema, { method: "POST", json: body });
export const getCheckout = (id: string) => api(`/checkout/${id}`, checkoutSchema);
export const postWaitlist = (body: { planId: string; email: string }) =>
  api("/waitlist", waitlistSchema, { method: "POST", json: body });
