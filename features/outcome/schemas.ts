import { z } from "zod";

export const outcomeSchema = z.object({
  state: z.enum(["pending", "placed", "not-placed"]),
  company: z.string().nullable(),
  role: z.string().nullable(),
  ctc: z.number().nullable(),
  /** Credit carried to next season when not placed (Proposed: full credit). */
  creditCarried: z.number().nullable(),
  day0Label: z.string(),
});
export type Outcome = z.infer<typeof outcomeSchema>;

export const outcomeBodySchema = z.discriminatedUnion("state", [
  z.object({
    state: z.literal("placed"),
    company: z.string().trim().min(2, "Enter the company"),
    role: z.string().trim().min(2, "Enter the role"),
    ctc: z.coerce.number().positive("Enter the CTC in ₹"),
  }),
  z.object({ state: z.literal("not-placed") }),
]);
export type OutcomeBody = z.infer<typeof outcomeBodySchema>;
