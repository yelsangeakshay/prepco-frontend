import { z } from "zod";

export const feedbackSummarySchema = z.object({
  panelId: z.string(),
  sessionId: z.string(),
  panelist: z.string(),
  function: z.string(),
  startsAt: z.string(),
  verdict: z.string(),
  headline: z.string(),
});

export const feedbackListSchema = z.object({
  items: z.array(feedbackSummarySchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export const feedbackDetailSchema = feedbackSummarySchema.extend({
  note: z.string(),
  scores: z.array(z.object({ label: z.string(), value: z.number() })),
  sentBackToBuilder: z.boolean(),
});
export type FeedbackSummary = z.infer<typeof feedbackSummarySchema>;
export type FeedbackDetail = z.infer<typeof feedbackDetailSchema>;
