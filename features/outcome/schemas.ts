import * as z from "zod/mini";

export const outcomeSchema = z.object({
  state: z.enum(["pending", "placed", "not-placed"]),
  company: z.nullable(z.string()),
  role: z.nullable(z.string()),
  ctc: z.nullable(z.number()),
  /** Credit carried to next season when not placed (Proposed: full credit). */
  creditCarried: z.nullable(z.number()),
  day0Label: z.string(),
});
export type Outcome = z.infer<typeof outcomeSchema>;

export const outcomeBodySchema = z.discriminatedUnion("state", [
  z.object({
    state: z.literal("placed"),
    company: z.string().check(z.trim()).check(z.minLength(2, "Enter the company")),
    role: z.string().check(z.trim()).check(z.minLength(2, "Enter the role")),
    ctc: z.coerce.number().check(z.positive("Enter the CTC in ₹")),
  }),
  z.object({ state: z.literal("not-placed") }),
]);
export type OutcomeBody = z.infer<typeof outcomeBodySchema>;
