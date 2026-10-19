import { api } from "../client";
import { checkoutSchema, plansSchema, waitlistSchema } from "@/features/plans/schemas";

export const getPlans = () => api("/plans", plansSchema);
export const postCheckout = (planId: string) =>
  api("/checkout", checkoutSchema, { method: "POST", json: { planId } });
export const getCheckout = (id: string) => api(`/checkout/${id}`, checkoutSchema);
export const postWaitlist = (body: { planId: string; email: string }) =>
  api("/waitlist", waitlistSchema, { method: "POST", json: body });
