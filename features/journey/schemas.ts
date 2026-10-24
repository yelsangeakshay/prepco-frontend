import * as z from "zod/mini";

export const journeySchema = z.object({
  /** "Term 5–6": where the student joined. */
  joinedAt: z.string(),
  /** s11.png "Where you are": dashed stages happened before joining, the current one has a bar. */
  stages: z.array(
    z.object({
      id: z.string(),
      term: z.string(),
      title: z.string(),
      detail: z.string(),
      state: z.enum(["before", "now", "after"]),
      /** 0 to 100, only on the current stage. */
      progress: z.nullable(z.number()),
    }),
  ),
  /** "Four routes to an offer". */
  routes: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      title: z.string(),
      description: z.string(),
      /** "Compete → PPI → Offer". */
      path: z.string(),
      fit: z.enum(["primary", "alternate"]),
      badge: z.nullable(z.string()),
      link: z.nullable(z.object({ label: z.string(), href: z.string() })),
    }),
  ),
});
export type Journey = z.infer<typeof journeySchema>;

export const quickSwitchSchema = z.object({
  from: z.string(),
  to: z.string(),
  reusableAnswers: z.number(),
  totalAnswers: z.number(),
  cvBulletsToReframe: z.number(),
  gaps: z.array(z.string()),
});
export type QuickSwitch = z.infer<typeof quickSwitchSchema>;

/** s12.png. Everyone sees the track; anyone below Elite sees it as a preview with an upgrade banner. */
export const caseTrackSchema = z.object({
  unlocked: z.boolean(),
  plan: z.string(),
  /** Price lines for the preview banner. Null once the student is on Elite. */
  upgrade: z.nullable(z.object({ alone: z.number(), moreThanPlan: z.number() })),
  startWeek: z.string(),
  seats: z.object({ left: z.number(), total: z.number() }),
  summary: z.array(z.object({ label: z.string(), value: z.string() })),
  steps: z.array(
    z.object({
      id: z.string(),
      /** Step number, or null for the PPI row (drawn with a star). */
      n: z.nullable(z.number()),
      title: z.string(),
      detail: z.string(),
      state: z.enum(["done", "upload", "book", "later", "on-placing"]),
    }),
  ),
});
export type CaseTrack = z.infer<typeof caseTrackSchema>;

/** s13.png: the job-hunting agent. */
export const quickSwitchPrefsSchema = z.object({
  enabled: z.boolean(),
  roles: z.string(),
  locations: z.string(),
  /** Only send matches with a fit score above this. */
  minFit: z.number().check(z.gte(0)).check(z.lte(100)),
  email: z.string(),
});
export type QuickSwitchPrefs = z.infer<typeof quickSwitchPrefsSchema>;

export const quickSwitchDigestSchema = z.object({
  stats: z.object({
    matches: z.number(),
    highFit: z.number(),
    boards: z.string(),
    oldest: z.string(),
  }),
  /** "Mon 5 Oct". */
  date: z.string(),
  items: z.array(
    z.object({
      id: z.string(),
      fit: z.number(),
      title: z.string(),
      /** "Posted 2 days ago · Mumbai · on-site". */
      meta: z.string(),
      saved: z.boolean(),
    }),
  ),
  prefs: quickSwitchPrefsSchema,
});
export type QuickSwitchDigest = z.infer<typeof quickSwitchDigestSchema>;
