/** Single source of TanStack Query keys. */
export const queryKeys = {
  me: ["me"] as const,
  plans: ["plans"] as const,
  checkout: (id: string) => ["checkout", id] as const,
  freeSession: ["free-session"] as const,
  runway: ["runway"] as const,
  sessions: (params?: object) => ["sessions", params ?? {}] as const,
  sessionsAll: ["sessions"] as const,
  session: (id: string) => ["session", id] as const,
  sessionSlots: (id: string) => ["session", id, "slots"] as const,
  feedback: (params?: object) => ["feedback", params ?? {}] as const,
  feedbackDetail: (id: string) => ["feedback", "detail", id] as const,
};

/** Stale times in ms (brief section 7). */
export const staleTimes = {
  plans: 10 * 60_000,
  runway: 30_000,
  sessions: 30_000,
};
