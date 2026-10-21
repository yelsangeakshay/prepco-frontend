import { z } from "zod";

export const billingSchema = z.object({
  plan: z.object({
    id: z.enum(["free", "basic", "premium", "elite"]),
    name: z.string(),
    paid: z.number(),
    status: z.enum(["active", "ended"]),
    endedAt: z.string().nullable(),
  }),
  credits: z.object({ total: z.number(), used: z.number(), carriedOver: z.number() }),
  invoices: z.array(
    z.object({
      id: z.string(),
      receiptNo: z.string(),
      description: z.string(),
      amount: z.number(),
      at: z.string(),
    }),
  ),
  canUpgrade: z.boolean(),
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

export const upgradeResultSchema = z.object({
  status: z.enum(["paid", "failed"]),
  receiptNo: z.string().nullable(),
  amount: z.number(),
  plan: z.string(),
  message: z.string().nullable(),
});
export type UpgradeResult = z.infer<typeof upgradeResultSchema>;
