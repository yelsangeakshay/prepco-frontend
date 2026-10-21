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

export const feedbackQuestionSchema = z.object({
  question: z.string(),
  rating: z.enum(["strong", "okay", "flagged"]),
  comment: z.string(),
  /** One line for the phone layout. */
  short: z.string().nullable().optional(),
  /** Parts of the answer the comment is about, shown as chips on flagged rows. */
  tags: z.array(z.enum(["situation", "decision", "result"])),
  /** Answer in the builder; set on flagged rows. */
  answerId: z.string().nullable(),
});

export const feedbackDetailSchema = feedbackSummarySchema.extend({
  note: z.string(),
  scores: z.array(z.object({ label: z.string(), value: z.number() })),
  sentBackToBuilder: z.boolean(),
  /** s10.png extras. A note scored live by a panelist has none of them. */
  label: z.string().optional(),
  badge: z.string().nullable().optional(),
  title: z.string().optional(),
  panelistBlurb: z.string().optional(),
  readiness: z.number().nullable().optional(),
  readinessNote: z.string().optional(),
  questions: z.array(feedbackQuestionSchema).optional(),
  /** "Mon 12 Oct": when the next panel is, for the fix list. */
  fixBefore: z.string().optional(),
  fixes: z.array(z.string()).optional(),
});
export type FeedbackQuestion = z.infer<typeof feedbackQuestionSchema>;
export type FeedbackSummary = z.infer<typeof feedbackSummarySchema>;
export type FeedbackDetail = z.infer<typeof feedbackDetailSchema>;
