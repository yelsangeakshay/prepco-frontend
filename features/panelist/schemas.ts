import { z } from "zod";
import { PANELIST_FUNCTIONS } from "@/features/onboarding/schemas";

export const DIMENSIONS = ["Structure", "Defensibility", "Composure"] as const;
export const VERDICTS = ["Ready", "Almost There", "Needs Work"] as const;

export const panelItemSchema = z.object({
  sessionId: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  /** "Premium · Finals" (p02). */
  plan: z.string(),
  college: z.string(),
  target: z.string(),
  title: z.string(),
  startsAt: z.string(),
  status: z.enum(["upcoming", "awaiting-score", "scored"]),
  verdict: z.string().nullable(),
  briefRead: z.boolean(),
  /** For feedback still to write: "Due today", "Due tomorrow", or "Overdue". */
  dueLabel: z.string().nullable(),
});
export type PanelItem = z.infer<typeof panelItemSchema>;

export const todaySchema = z.object({
  panelist: z.object({
    name: z.string(),
    function: z.string(),
    specialty: z.string(),
    panelsThisSeason: z.number(),
  }),
  today: z.array(panelItemSchema),
  upcoming: z.array(panelItemSchema),
  awaitingScore: z.array(panelItemSchema),
  stats: z.object({ rating: z.number(), feedbackOnTimePct: z.number(), unscored: z.number() }),
});
export type Today = z.infer<typeof todaySchema>;

export const briefSchema = z.object({
  sessionId: z.string(),
  title: z.string(),
  startsAt: z.string(),
  student: z.object({
    id: z.string(),
    name: z.string(),
    college: z.string(),
    track: z.string(),
    target: z.string(),
    background: z.string(),
    readiness: z.number(),
  }),
  cvHighlights: z.array(z.string()),
  answersToProbe: z.array(z.object({ question: z.string(), why: z.string() })),
  previousFeedback: z
    .object({ panelist: z.string(), verdict: z.string(), headline: z.string() })
    .nullable(),
  suggestedQuestions: z.array(z.string()),
});
export type Brief = z.infer<typeof briefSchema>;

export const briefListSchema = z.object({ items: z.array(panelItemSchema) });
export const scoringListSchema = z.object({
  awaiting: z.array(panelItemSchema),
  done: z.array(panelItemSchema),
});

export const scoreBodySchema = z.object({
  scores: z.object({
    Structure: z.number().min(1).max(5),
    Defensibility: z.number().min(1).max(5),
    Composure: z.number().min(1).max(5),
  }),
  verdict: z.enum(VERDICTS),
  note: z.string().trim().min(20),
  sendBack: z.boolean(),
});
export type ScoreBody = z.infer<typeof scoreBodySchema>;

export const scoreResultSchema = z.object({
  ok: z.literal(true),
  feedbackId: z.string(),
  sentBack: z.boolean(),
});

export const availabilitySchema = z.object({
  slots: z.record(z.string(), z.boolean()),
  booked: z.array(z.string()),
});
export type Availability = z.infer<typeof availabilitySchema>;

export const applicationBodySchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().email("Enter a valid email"),
  function: z.enum(PANELIST_FUNCTIONS, { message: "Pick your function" }),
  company: z.string().trim().min(2, "Enter your company"),
  role: z.string().trim().min(2, "Enter your current role"),
  years: z.coerce
    .number({ message: "Enter your years of experience" })
    .min(3, "We need at least 3 years")
    .max(40, "Enter 40 or less"),
  linkedin: z.string().trim().url("Enter a full LinkedIn URL").or(z.literal("")),
  hoursPerMonth: z.coerce
    .number({ message: "Enter hours per month" })
    .min(2, "At least 2 hours")
    .max(40, "40 hours or less"),
  why: z.string().trim().min(30, "Tell us a bit more (30 characters or more)"),
});
export type ApplicationBody = z.input<typeof applicationBodySchema>;
export type ApplicationParsed = z.output<typeof applicationBodySchema>;

export const applicationResultSchema = z.object({ id: z.string(), status: z.literal("received") });

export const panelistProfileSchema = z.object({
  name: z.string(),
  email: z.string(),
  function: z.string(),
  specialty: z.string(),
  company: z.string(),
  role: z.string(),
  bio: z.string(),
});
export type PanelistProfile = z.infer<typeof panelistProfileSchema>;

export const updatePanelistProfileSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  company: z.string().trim().min(2, "Enter your company"),
  role: z.string().trim().min(2, "Enter your role"),
  bio: z.string().trim().min(20, "Write at least 20 characters"),
});
export type UpdatePanelistProfile = z.infer<typeof updatePanelistProfileSchema>;
