import * as z from "zod/mini";

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
  short: z.optional(z.nullable(z.string())),
  /** Parts of the answer the comment is about, shown as chips on flagged rows. */
  tags: z.array(z.enum(["situation", "decision", "result"])),
  /** Answer in the builder; set on flagged rows. */
  answerId: z.nullable(z.string()),
});

export const feedbackDetailSchema = z.extend(feedbackSummarySchema, {
  note: z.string(),
  scores: z.array(z.object({ label: z.string(), value: z.number() })),
  sentBackToBuilder: z.boolean(),
  /** s10.png extras. A note scored live by a panelist has none of them. */
  label: z.optional(z.string()),
  badge: z.optional(z.nullable(z.string())),
  title: z.optional(z.string()),
  panelistBlurb: z.optional(z.string()),
  readiness: z.optional(z.nullable(z.number())),
  readinessNote: z.optional(z.string()),
  questions: z.optional(z.array(feedbackQuestionSchema)),
  /** "Mon 12 Oct": when the next panel is, for the fix list. */
  fixBefore: z.optional(z.string()),
  fixes: z.optional(z.array(z.string())),
});
export type FeedbackQuestion = z.infer<typeof feedbackQuestionSchema>;
export type FeedbackSummary = z.infer<typeof feedbackSummarySchema>;
export type FeedbackDetail = z.infer<typeof feedbackDetailSchema>;
