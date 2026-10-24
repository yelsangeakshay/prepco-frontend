import * as z from "zod/mini";

export const TRACKS = ["finals", "summers"] as const;
export type Track = (typeof TRACKS)[number];

export const PAY_METHODS = ["upi", "card", "netbanking"] as const;
export type PayMethod = (typeof PAY_METHODS)[number];
export const PAY_METHOD_LABEL: Record<PayMethod, string> = {
  upi: "UPI",
  card: "Card",
  netbanking: "Net banking",
};

export const planSchema = z.object({
  id: z.enum(["basic", "premium", "elite"]),
  name: z.string(),
  price: z.number(),
  /** Struck-through list price (s04.png). */
  listPrice: z.number(),
  /** Tag at the top right of the card, e.g. "33% off · Season 1", "Most chosen", "Best value". */
  badge: z.string(),
  /** "Suggested from your free session". */
  suggested: z.boolean(),
  tagline: z.string(),
  coverage: z.object({ done: z.number(), total: z.number(), caption: z.string() }),
  /** "Everything in Basic, plus". */
  inherits: z.nullable(z.string()),
  features: z.array(z.object({ text: z.string(), included: z.boolean() })),
  note: z.nullable(z.string()),
  /** "Top-up mock" price. */
  topUp: z.number(),
  seatsTotal: z.number(),
  seatsTaken: z.number(),
});
export type Plan = z.infer<typeof planSchema>;

/** The compressed runway offered to someone who joins too late for the full one (e03.png). Proposed policy. */
export const lateJoinerSchema = z.object({
  daysLeft: z.number(),
  rows: z.array(
    z.object({
      when: z.string(),
      title: z.string(),
      note: z.nullable(z.string()),
      status: z.enum(["fits", "dropped"]),
      /** Pill text for a dropped row. */
      reason: z.nullable(z.string()),
    }),
  ),
  recommendation: z.object({
    title: z.string(),
    price: z.string(),
    body: z.string(),
    cta: z.string(),
    planId: z.enum(["basic", "premium", "elite"]),
  }),
  nextSeason: z.string(),
});
export type LateJoiner = z.infer<typeof lateJoinerSchema>;

export const plansSchema = z.object({
  items: z.array(planSchema),
  cohortFull: z.boolean(),
  /** Queue position the next person to join the waitlist gets (e05.png, "#4 in the finals queue"). */
  waitlistNext: z.number(),
  lateJoiner: z.nullable(lateJoinerSchema),
  track: z.enum(TRACKS),
  seats: z.object({ label: z.string(), taken: z.number(), total: z.number() }),
});
export type Plans = z.infer<typeof plansSchema>;

export const checkoutBodySchema = z.object({
  planId: planSchema.shape.id,
  method: z._default(z.enum(PAY_METHODS), "upi"),
});
export type CheckoutBody = z.input<typeof checkoutBodySchema>;

export const checkoutSchema = z.object({
  id: z.string(),
  planId: planSchema.shape.id,
  planName: z.string(),
  track: z.enum(TRACKS),
  method: z.enum(PAY_METHODS),
  amount: z.number(),
  status: z.enum(["paid", "failed"]),
  /** "The UPI payment timed out". */
  failureTitle: z.nullable(z.string()),
  failureReason: z.nullable(z.string()),
  /** ISO time until which the seat is held after a failed payment (Proposed: 15 min). */
  seatHeldUntil: z.nullable(z.string()),
  receiptNo: z.nullable(z.string()),
  paidAt: z.nullable(z.string()),
  email: z.nullable(z.string()),
});
export type Checkout = z.infer<typeof checkoutSchema>;

export const waitlistBodySchema = z.object({
  planId: planSchema.shape.id,
  email: z.email(),
});
export const waitlistSchema = z.object({
  position: z.number(),
  claimWindowHours: z.number(),
  priceKept: z.boolean(),
});
export type Waitlist = z.infer<typeof waitlistSchema>;
