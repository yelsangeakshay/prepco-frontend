import * as z from "zod/mini";

export const bulletSchema = z.object({
  id: z.string(),
  text: z.string(),
  /** The three tests a panel probes: a decision, a number, a trade-off. */
  hasDecision: z.boolean(),
  hasNumber: z.boolean(),
  hasTradeoff: z.boolean(),
});
export type Bullet = z.infer<typeof bulletSchema>;

export const cvScoresSchema = z.object({
  overall: z.number(),
  impact: z.number(),
  clarity: z.number(),
  defensibility: z.number(),
});
export type CvScores = z.infer<typeof cvScoresSchema>;

export const cvSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  bullets: z.array(bulletSchema),
});

export const cvSchema = z.object({
  locked: z.object({
    version: z.nullable(z.string()),
    lockedAt: z.nullable(z.string()),
    scores: z.nullable(cvScoresSchema),
  }),
  draft: z.object({
    version: z.string(),
    sections: z.array(cvSectionSchema),
    scores: cvScoresSchema,
  }),
  relock: z.object({
    status: z.enum(["none", "pending"]),
    requestedAt: z.nullable(z.string()),
    reason: z.nullable(z.string()),
  }),
});
export type Cv = z.infer<typeof cvSchema>;

export const patchBulletResultSchema = z.object({
  bullet: bulletSchema,
  scores: cvScoresSchema,
});

export const cvVersionSchema = z.object({
  id: z.string(),
  version: z.string(),
  createdAt: z.string(),
  score: z.number(),
  locked: z.boolean(),
  current: z.boolean(),
  note: z.string(),
});
export type CvVersion = z.infer<typeof cvVersionSchema>;
export const cvVersionsSchema = z.object({ items: z.array(cvVersionSchema) });

export const relockBodySchema = z.object({
  reason: z
    .string()
    .check(z.trim())
    .check(z.minLength(10, "Tell ops why you need to change a locked CV")),
});
export type RelockBody = z.infer<typeof relockBodySchema>;
export const relockResultSchema = z.object({
  status: z.literal("pending"),
  requestedAt: z.string(),
});

/** Same heuristic the mock server uses, so the editor can preview the three tests as you type. */
export function scoreBulletText(text: string) {
  return {
    hasNumber: /\d/.test(text),
    hasDecision:
      /\b(chose|decided|led|prioriti[sz]ed|launched|cut|switched|negotiated|owned)\b/i.test(text),
    hasTradeoff: /\b(instead|trade-?off|rather than|at the cost|despite|but)\b/i.test(text),
  };
}
