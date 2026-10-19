import { z } from "zod";

export const planSchema = z.object({
  id: z.enum(["basic", "premium", "elite"]),
  name: z.string(),
  price: z.number(),
  tagline: z.string(),
  features: z.array(z.string()),
  mostChosen: z.boolean(),
  elite: z.boolean(),
  seatsTotal: z.number(),
  seatsTaken: z.number(),
});
export type Plan = z.infer<typeof planSchema>;

export const plansSchema = z.object({
  items: z.array(planSchema),
  cohortFull: z.boolean(),
});

export const checkoutBodySchema = z.object({ planId: planSchema.shape.id });

export const checkoutSchema = z.object({
  id: z.string(),
  planId: planSchema.shape.id,
  planName: z.string(),
  amount: z.number(),
  status: z.enum(["paid", "failed"]),
  failureReason: z.string().nullable(),
  /** ISO time until which the seat is held after a failed payment (Proposed: 15 min). */
  seatHeldUntil: z.string().nullable(),
  receiptNo: z.string().nullable(),
  paidAt: z.string().nullable(),
});
export type Checkout = z.infer<typeof checkoutSchema>;

export const waitlistBodySchema = z.object({
  planId: planSchema.shape.id,
  email: z.string().email(),
});
export const waitlistSchema = z.object({
  position: z.number(),
  claimWindowHours: z.number(),
  priceKept: z.boolean(),
});
export type Waitlist = z.infer<typeof waitlistSchema>;
