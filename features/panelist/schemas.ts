import * as z from "zod/mini";
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
  verdict: z.nullable(z.string()),
  briefRead: z.boolean(),
  /** For feedback still to write: "Due today", "Due tomorrow", or "Overdue". */
  dueLabel: z.nullable(z.string()),
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
    /** "Premium · Finals". */
    plan: z.string(),
  }),
  cvHighlights: z.array(z.string()),
  /** The locked CV (p03): version, score and the work-experience bullets with their own scores. */
  cv: z.object({
    version: z.string(),
    score: z.number(),
    bullets: z.array(z.object({ text: z.string(), score: z.number() })),
  }),
  answersToProbe: z.array(
    z.object({
      question: z.string(),
      why: z.string(),
      /** Where the student's answer stands in the builder. */
      status: z.enum(["flagged", "not-drafted"]),
    }),
  ),
  previousFeedback: z.nullable(
    z.object({
      panelist: z.string(),
      verdict: z.string(),
      headline: z.string(),
      startsAt: z.string(),
    }),
  ),
  /** Notes from the profiling call (p03). Proposed copy. */
  profilingNotes: z.object({ dateLabel: z.string(), text: z.string() }),
  /** One line on what changed since the last panel (p03). */
  sinceLastPanel: z.string(),
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
    Structure: z.number().check(z.gte(1)).check(z.lte(5)),
    Defensibility: z.number().check(z.gte(1)).check(z.lte(5)),
    Composure: z.number().check(z.gte(1)).check(z.lte(5)),
  }),
  verdict: z.enum(VERDICTS),
  note: z.string().check(z.trim()).check(z.minLength(20)),
  sendBack: z.boolean(),
});
export type ScoreBody = z.infer<typeof scoreBodySchema>;

export const scoreResultSchema = z.object({
  ok: z.literal(true),
  feedbackId: z.string(),
  sentBack: z.boolean(),
});

export const APPLICATION_SESSIONS = [
  "P1 · first mock panel",
  "P2 · specialist panel",
  "P3 · pressure mock",
  "Domain deep-dive",
  "Case deck reviews",
  "Group positioning",
] as const;

export const AVAILABILITY_STATUSES = [
  "Upcoming",
  "Tonight",
  "Feedback due",
  "Feedback sent",
] as const;

export const availabilitySchema = z.object({
  slots: z.record(z.string(), z.boolean()),
  booked: z.array(z.string()),
  /** Each booked panel with its date, so the grid can show any week (p05). */
  bookedPanels: z.array(
    z.object({
      key: z.string(),
      startsAt: z.string(),
      /** "P2", "P1", "Deep-dive". */
      kind: z.string(),
      /** "Aditya R." */
      student: z.string(),
    }),
  ),
  /** "Recent and upcoming" under the grid. */
  panels: z.array(
    z.object({
      sessionId: z.string(),
      startsAt: z.string(),
      student: z.string(),
      session: z.string(),
      status: z.enum(AVAILABILITY_STATUSES),
    }),
  ),
});
export type Availability = z.infer<typeof availabilitySchema>;

export const applicationBodySchema = z.object({
  name: z.string().check(z.trim()).check(z.minLength(2, "Enter your full name")),
  email: z.email("Enter a valid email"),
  function: z.enum(PANELIST_FUNCTIONS, { message: "Pick your function" }),
  company: z.string().check(z.trim()).check(z.minLength(2, "Enter your company")),
  role: z.string().check(z.trim()).check(z.minLength(2, "Enter your current role")),
  years: z.coerce
    .number({ message: "Enter your years of experience" })
    .check(z.gte(3, "We need at least 3 years"))
    .check(z.lte(40, "Enter 40 or less")),
  linkedin: z
    .string()
    .check(z.trim())
    .check(
      z.refine(
        (v) => v === "" || /linkedin\.com\/in\//i.test(v),
        "Enter your LinkedIn profile link",
      ),
    ),
  /** The sessions they can run (p01). */
  sessions: z.array(z.string()).check(z.minLength(1, "Pick at least one session")),
  /** "Weekday evenings after 6 PM, Saturday mornings". */
  freeWhen: z.string().check(z.trim()).check(z.minLength(3, "Tell us when you are usually free")),
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
  name: z.string().check(z.trim()).check(z.minLength(2, "Enter your full name")),
  company: z.string().check(z.trim()).check(z.minLength(2, "Enter your company")),
  role: z.string().check(z.trim()).check(z.minLength(2, "Enter your role")),
  bio: z.string().check(z.trim()).check(z.minLength(20, "Write at least 20 characters")),
});
export type UpdatePanelistProfile = z.infer<typeof updatePanelistProfileSchema>;
