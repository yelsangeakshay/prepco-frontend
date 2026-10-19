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
  cv: ["cv"] as const,
  cvVersions: ["cv", "versions"] as const,
  answers: (params?: object) => ["answers", params ?? {}] as const,
  answersAll: ["answers"] as const,
  answer: (id: string) => ["answer", id] as const,
  journey: ["journey"] as const,
  quickSwitch: (to: string) => ["quick-switch", to] as const,
  caseTrack: ["case-track"] as const,
  billing: ["billing"] as const,
  upgradeQuote: ["billing", "quote"] as const,
  profile: ["profile"] as const,
  outcome: ["outcome"] as const,
  notifications: ["notifications"] as const,
};

/** Stale times in ms (brief section 7). */
export const staleTimes = {
  plans: 10 * 60_000,
  runway: 30_000,
  sessions: 30_000,
  notifications: 15_000,
};
