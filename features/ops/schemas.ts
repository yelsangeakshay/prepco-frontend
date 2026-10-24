import * as z from "zod/mini";

export const planIdSchema = z.enum(["none", "basic", "premium", "elite"]);

export const cohortSchema = z.object({
  season: z.string(),
  day0: z.object({ label: z.string(), daysLeft: z.number() }),
  totals: z.object({ students: z.number(), paid: z.number(), revenue: z.number() }),
  /** Finals, Summers and Elite seat cards (a01.png). */
  seats: z.array(
    z.object({ id: z.string(), label: z.string(), taken: z.number(), total: z.number() }),
  ),
  seatsNote: z.string(),
  /** Free session booked, attended, bought a plan. */
  funnel: z.array(z.object({ label: z.string(), value: z.number() })),
  conversionPct: z.number(),
  revenue: z.object({
    lines: z.array(
      z.object({ tier: z.string(), count: z.number(), unit: z.number(), amount: z.number() }),
    ),
    topUps: z.number(),
    total: z.number(),
  }),
  needsAttention: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      detail: z.string(),
      count: z.number(),
      action: z.string(),
      href: z.string(),
      tone: z.enum(["maroon", "neutral"]),
    }),
  ),
  thisWeek: z.object({
    sessionsScheduled: z.number(),
    freeSessions: z.number(),
    feedbackOverdue: z.number(),
    panelistsActive: z.number(),
    panelistsTotal: z.number(),
  }),
});
export type Cohort = z.infer<typeof cohortSchema>;

export const studentRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  college: z.string(),
  track: z.string(),
  function: z.string(),
  plan: planIdSchema,
  readiness: z.number(),
  panelsDone: z.number(),
  noShows: z.number(),
  status: z.enum(["active", "at-risk", "unpaid"]),
  joinedAt: z.string(),
  /** Next session, or how many panels are done (a02.png "Runway stage"). */
  stage: z.string(),
  panelistName: z.nullable(z.string()),
});
export type StudentRow = z.infer<typeof studentRowSchema>;

export const studentListSchema = z.object({
  items: z.array(studentRowSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  /** Students flagged at risk, for the "Needs attention" filter pill. */
  counts: z.object({ attention: z.number() }),
});

export const bookingSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  function: z.string(),
  title: z.string(),
  startsAt: z.nullable(z.string()),
  status: z.enum(["upcoming", "completed", "no-show", "cancelled", "unassigned"]),
  panelistId: z.nullable(z.string()),
  panelistName: z.nullable(z.string()),
  excused: z.boolean(),
});
export type Booking = z.infer<typeof bookingSchema>;

export const bookingListSchema = z.object({
  items: z.array(bookingSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  counts: z.object({ all: z.number(), unassigned: z.number(), noShows: z.number() }),
});

export const studentDetailSchema = z.extend(
  z.omit(studentRowSchema, { stage: true, panelistName: true }),
  {
    background: z.string(),
    cv: z.object({ version: z.nullable(z.string()), score: z.number() }),
    answers: z.object({ total: z.number(), prepared: z.number(), needWork: z.number() }),
    sessions: z.array(bookingSchema),
    payments: z.array(
      z.object({ id: z.string(), at: z.string(), description: z.string(), amount: z.number() }),
    ),
    relockRequest: z.nullable(
      z.object({ requestedAt: z.string(), reason: z.string(), draftScore: z.number() }),
    ),
  },
);
export type StudentDetail = z.infer<typeof studentDetailSchema>;

export const candidateSchema = z.object({
  panelistId: z.string(),
  name: z.string(),
  specialty: z.string(),
  function: z.string(),
  load: z.number(),
  capacity: z.number(),
  free: z.boolean(),
});

export const unassignedSchema = z.object({
  booking: bookingSchema,
  candidates: z.array(candidateSchema),
});

export const assignmentsSchema = z.object({
  unassigned: z.array(unassignedSchema),
  load: z.array(
    z.object({
      function: z.string(),
      panelists: z.number(),
      booked: z.number(),
      capacity: z.number(),
      unassigned: z.number(),
    }),
  ),
});
export type Assignments = z.infer<typeof assignmentsSchema>;

export const assignBodySchema = z.object({ sessionId: z.string(), panelistId: z.string() });
export const assignResultSchema = z.object({ booking: bookingSchema });

export const ledgerEntrySchema = z.object({
  id: z.string(),
  at: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  description: z.string(),
  amount: z.number(),
  type: z.enum(["payment", "refund", "credit", "top-up"]),
});
export type LedgerEntry = z.infer<typeof ledgerEntrySchema>;
export const ledgerSchema = z.object({
  items: z.array(ledgerEntrySchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totals: z.object({
    payments: z.number(),
    refunds: z.number(),
    credits: z.number(),
    net: z.number(),
    /** Plan payments only, without top-ups, and how many there are (a05.png). */
    planRevenue: z.number(),
    plans: z.number(),
    topUps: z.number(),
    upgradeCredit: z.number(),
  }),
});

export const rosterPanelistSchema = z.object({
  id: z.string(),
  name: z.string(),
  function: z.string(),
  specialty: z.string(),
  company: z.string(),
  role: z.string(),
  /** Proposed metric (p02.png "Avg. feedback turnaround"). */
  turnaroundHours: z.number(),
  status: z.enum(["active", "paused"]),
  panelsThisSeason: z.number(),
  load: z.number(),
  capacity: z.number(),
  rating: z.number(),
  feedbackOverdue: z.number(),
  cancellations: z.number(),
  health: z.enum(["good", "watch", "needs-attention"]),
});
export type RosterPanelist = z.infer<typeof rosterPanelistSchema>;
export const rosterSchema = z.object({
  items: z.array(rosterPanelistSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  counts: z.object({
    all: z.number(),
    needsAttention: z.number(),
    paused: z.number(),
    /** Panelists per function, for the cards above the table (a06.png). */
    byFunction: z.record(z.string(), z.number()),
  }),
});
export const panelistActionBodySchema = z.object({ action: z.enum(["pause", "resume", "nudge"]) });

export const applicationRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  function: z.string(),
  company: z.string(),
  role: z.string(),
  years: z.number(),
  why: z.string(),
  submittedAt: z.string(),
  status: z.enum(["pending", "approved", "rejected"]),
});
export type ApplicationRow = z.infer<typeof applicationRowSchema>;
export const applicationListSchema = z.object({
  items: z.array(applicationRowSchema),
  counts: z.object({ pending: z.number(), approved: z.number(), rejected: z.number() }),
});
export const decisionBodySchema = z.object({ decision: z.enum(["approve", "reject"]) });
