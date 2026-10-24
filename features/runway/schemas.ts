import * as z from "zod/mini";

export const sessionStatusSchema = z.enum([
  "upcoming",
  "completed",
  "cancelled",
  "rescheduled",
  "no-show",
  "unbooked",
  "locked",
]);
export type SessionStatus = z.infer<typeof sessionStatusSchema>;

export const sessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  week: z.string(),
  /** One line under the title on the runway (s09.png). */
  blurb: z.optional(z.nullable(z.string())),
  kind: z.enum(["profiling", "panel", "deep-dive", "group", "free"]),
  startsAt: z.nullable(z.string()),
  /** Previous time, shown when a session was moved. */
  previousStartsAt: z.optional(z.nullable(z.string())),
  status: sessionStatusSchema,
  panelist: z.nullable(z.string()),
  panelFunction: z.nullable(z.string()),
  note: z.optional(z.nullable(z.string())),
  /** Reschedule is free until 24 h before the start (Proposed). */
  freeRescheduleUntil: z.optional(z.nullable(z.string())),
  feedbackId: z.optional(z.nullable(z.string())),
});
export type Session = z.infer<typeof sessionSchema>;

export const sessionListSchema = z.object({
  items: z.array(sessionSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export const slotSchema = z.object({
  id: z.string(),
  startsAt: z.string(),
  label: z.string(),
  taken: z.optional(z.boolean()),
});
export type SlotDto = z.infer<typeof slotSchema>;

export const slotsSchema = z.object({ items: z.array(slotSchema) });

export const runwayStepSchema = z.object({
  id: z.string(),
  week: z.string(),
  title: z.string(),
  when: z.optional(z.string()),
  status: z.enum(["done", "next", "locked", "pick-slot", "day0"]),
  sessionId: z.nullable(z.string()),
});

export const runwaySchema = z.object({
  student: z.object({
    name: z.string(),
    college: z.string(),
    plan: z.string(),
    track: z.string(),
    target: z.string(),
    readiness: z.number(),
  }),
  day0: z.object({
    iso: z.string(),
    label: z.string(),
    daysLeft: z.number(),
    movedFrom: z.nullable(z.string()),
  }),
  banner: z.nullable(
    z.enum([
      "late-joiner",
      "day0-moved",
      "first-login",
      "returning-student",
      "placed",
      "not-placed",
    ]),
  ),
  steps: z.array(runwayStepSchema),
  doneCount: z.number(),
  totalCount: z.number(),
  nextSession: z.nullable(sessionSchema),
  tasks: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      hint: z.optional(z.string()),
      done: z.boolean(),
    }),
  ),
  cv: z.object({
    version: z.string(),
    locked: z.boolean(),
    score: z.number(),
    impact: z.number(),
    clarity: z.number(),
    defensibility: z.number(),
  }),
  answers: z.object({
    total: z.number(),
    prepared: z.number(),
    needWork: z.number(),
    /** A flagged question to show on Home. */
    flagged: z.nullable(z.string()),
  }),
  /** Second season for a returning student (e11.png). Null otherwise. */
  secondSeason: z.optional(
    z.nullable(
      z.object({
        carried: z.array(z.object({ label: z.string(), value: z.string() })),
        plans: z.array(
          z.object({
            id: z.enum(["basic", "premium", "elite"]),
            name: z.string(),
            blurb: z.string(),
            listPrice: z.number(),
            suggested: z.boolean(),
          }),
        ),
      }),
    ),
  ),
  /** Newest panel feedback (s05.png "Latest panel"). */
  latestPanel: z.nullable(
    z.object({
      feedbackId: z.string(),
      label: z.string(),
      date: z.string(),
      quote: z.string(),
      panelistLine: z.string(),
      sentBack: z.number(),
    }),
  ),
});
export type Runway = z.infer<typeof runwaySchema>;

export const bookBodySchema = z.object({ slotId: z.string() });
