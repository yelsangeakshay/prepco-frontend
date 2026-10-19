import { z } from "zod";

export const answerStatusSchema = z.enum(["rehearsed", "flagged", "not-drafted"]);
export type AnswerStatus = z.infer<typeof answerStatusSchema>;

export const answerSummarySchema = z.object({
  id: z.string(),
  question: z.string(),
  category: z.string(),
  status: answerStatusSchema,
  snippet: z.string().nullable(),
  critique: z.string().nullable(),
});
export type AnswerSummary = z.infer<typeof answerSummarySchema>;

export const answerListSchema = z.object({
  items: z.array(answerSummarySchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  counts: z.object({
    all: z.number(),
    rehearsed: z.number(),
    flagged: z.number(),
    notDrafted: z.number(),
  }),
});

export const answerDetailSchema = answerSummarySchema.extend({
  draft: z.string(),
  /** Inline critique: each note points at a phrase in the draft. */
  inlineCritique: z.array(z.object({ quote: z.string(), note: z.string() })),
});
export type AnswerDetail = z.infer<typeof answerDetailSchema>;

export const patchAnswerBodySchema = z.object({
  draft: z.string().optional(),
  status: answerStatusSchema.optional(),
});
export type PatchAnswerBody = z.infer<typeof patchAnswerBodySchema>;
