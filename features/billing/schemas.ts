import * as z from "zod/mini";

export const billingSchema = z.object({
  plan: z.object({
    id: z.enum(["free", "basic", "premium", "elite"]),
    name: z.string(),
    paid: z.number(),
    status: z.enum(["active", "ended"]),
    endedAt: z.nullable(z.string()),
  }),
  credits: z.object({ total: z.number(), used: z.number(), carriedOver: z.number() }),
  invoices: z.array(
    z.object({
      id: z.string(),
      receiptNo: z.string(),
      description: z.string(),
      amount: z.number(),
      at: z.string(),
      /** The free session is listed with no charge and no download. */
      status: z.enum(["paid", "no-charge"]),
    }),
  ),
  canUpgrade: z.boolean(),
  /** s14.png: "Finals · Season 1". */
  season: z.string(),
  /** The plan's one-line promise, shown under the plan name. */
  tagline: z.nullable(z.string()),
  paidAt: z.nullable(z.string()),
  /** What the plan includes, one row per runway session plus the standing perks. */
  entitlements: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      state: z.enum(["used", "booked", "unbooked", "scheduled", "active"]),
      /** "Wed 7 Oct" for booked and scheduled rows. */
      when: z.nullable(z.string()),
    }),
  ),
  /** Top-ups at the student's plan rate. A null price means the rate is not set yet. */
  topUps: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      detail: z.string(),
      price: z.nullable(z.number()),
    }),
  ),
});
export type Billing = z.infer<typeof billingSchema>;

/** e08: next tier price, minus what you paid for the current tier, minus top-ups bought this season. */
export const upgradeQuoteSchema = z.object({
  from: z.string(),
  to: z.string(),
  /** Price of the next tier. */
  listPrice: z.number(),
  /** Next tier price minus the current tier price paid. */
  difference: z.number(),
  topUps: z.array(z.object({ label: z.string(), amount: z.number(), at: z.string() })),
  /** Sum of the top-up credits. */
  topUpCredit: z.number(),
  payable: z.number(),
  /** What the next tier adds over the current one. */
  unlocks: z.array(z.string()),
  seatsLeft: z.number(),
});
export type UpgradeQuote = z.infer<typeof upgradeQuoteSchema>;

export const buyTopUpBodySchema = z.object({ id: z.string() });
export const buyTopUpResultSchema = z.object({
  ok: z.boolean(),
  label: z.string(),
  amount: z.number(),
});
export type BuyTopUpResult = z.infer<typeof buyTopUpResultSchema>;

export const upgradeResultSchema = z.object({
  status: z.enum(["paid", "failed"]),
  receiptNo: z.nullable(z.string()),
  amount: z.number(),
  plan: z.string(),
  message: z.nullable(z.string()),
});
export type UpgradeResult = z.infer<typeof upgradeResultSchema>;
