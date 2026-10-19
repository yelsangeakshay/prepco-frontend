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

export const upgradeQuoteSchema = z.object({
  from: z.string(),
  to: z.string(),
  listPrice: z.number(),
  /** Credit for unused sessions on the current plan (Proposed). */
  topUpCredit: z.number(),
  payable: z.number(),
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
