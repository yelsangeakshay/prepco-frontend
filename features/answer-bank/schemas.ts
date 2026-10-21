import { z } from "zod";

export const answerStatusSchema = z.enum(["rehearsed", "flagged", "not-drafted"]);
export type AnswerStatus = z.infer<typeof answerStatusSchema>;

/** s08.png: "Fit round" holds the general HR questions, "CV deep-dive" the ones built from CV bullets. */
export const answerRoundSchema = z.enum(["fit", "cv"]);
export type AnswerRound = z.infer<typeof answerRoundSchema>;

export const answerSummarySchema = z.object({
  id: z.string(),
  question: z.string(),
  category: z.string(),
  round: answerRoundSchema,
  status: answerStatusSchema,
  snippet: z.string().nullable(),
  critique: z.string().nullable(),
  /** Which parts of the answer the panel note is about (the chips under the note). */
  noteTags: z.array(z.enum(["situation", "decision", "result"])),
});
export type AnswerSummary = z.infer<typeof answerSummarySchema>;

export const answerListSchema = z.object({
  items: z.array(answerSummarySchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  /** Counts for the whole bank, whatever the filters are. */
  counts: z.object({
    all: z.number(),
    rehearsed: z.number(),
    flagged: z.number(),
    notDrafted: z.number(),
  }),
  /** Counts per round, for the round tabs. */
  rounds: z.object({ fit: z.number(), cv: z.number() }),
});

export const answerPartsSchema = z.object({
  situation: z.string(),
  decision: z.string(),
  result: z.string(),
});
export type AnswerParts = z.infer<typeof answerPartsSchema>;

export const answerDetailSchema = answerSummarySchema.extend({
  /** The three parts joined, kept for readers that want one string. */
  draft: z.string(),
  parts: answerPartsSchema,
  /** Inline critique: each note points at a phrase in the draft. */
  inlineCritique: z.array(z.object({ quote: z.string(), note: z.string() })),
  /** "P1 · 21 Sep": the panel that flagged it. */
  flaggedAt: z.string().nullable(),
  draftNo: z.number(),
  /** "2 min ago". */
  savedLabel: z.string().nullable(),
  /** Ask the next panelist this question. */
  rehearseNext: z.boolean(),
  /** "P2 · Mon 12 Oct". */
  nextPanel: z.string().nullable(),
});
export type AnswerDetail = z.infer<typeof answerDetailSchema>;

export const patchAnswerBodySchema = z.object({
  draft: z.string().optional(),
  parts: answerPartsSchema.partial().optional(),
  status: answerStatusSchema.optional(),
  rehearseNext: z.boolean().optional(),
});
export type PatchAnswerBody = z.infer<typeof patchAnswerBodySchema>;
