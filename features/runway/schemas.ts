import { z } from "zod";

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
  kind: z.enum(["profiling", "panel", "deep-dive", "group", "free"]),
  startsAt: z.string().nullable(),
  /** Previous time, shown when a session was moved. */
  previousStartsAt: z.string().nullable().optional(),
  status: sessionStatusSchema,
  panelist: z.string().nullable(),
  panelFunction: z.string().nullable(),
  note: z.string().nullable().optional(),
  /** Reschedule is free until 24 h before the start (Proposed). */
  freeRescheduleUntil: z.string().nullable().optional(),
  feedbackId: z.string().nullable().optional(),
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
  taken: z.boolean().optional(),
});
export type SlotDto = z.infer<typeof slotSchema>;

export const slotsSchema = z.object({ items: z.array(slotSchema) });

export const runwayStepSchema = z.object({
  id: z.string(),
  week: z.string(),
  title: z.string(),
  when: z.string().optional(),
  status: z.enum(["done", "next", "locked", "pick-slot", "day0"]),
  sessionId: z.string().nullable(),
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
    movedFrom: z.string().nullable(),
  }),
  banner: z.enum(["late-joiner", "day0-moved", "first-login", "returning-student"]).nullable(),
  steps: z.array(runwayStepSchema),
  doneCount: z.number(),
  totalCount: z.number(),
  nextSession: sessionSchema.nullable(),
  tasks: z.array(
    z.object({ id: z.string(), label: z.string(), hint: z.string().optional(), done: z.boolean() }),
  ),
  cv: z.object({ version: z.string(), locked: z.boolean(), score: z.number() }),
  answers: z.object({ total: z.number(), prepared: z.number(), needWork: z.number() }),
});
export type Runway = z.infer<typeof runwaySchema>;

export const bookBodySchema = z.object({ slotId: z.string() });
