/** Sample personas. Use exactly these in fixtures (brief section 2). */
export const RIYA = {
  id: "st-riya",
  name: "Riya Kulkarni",
  initials: "RK",
  college: "SCMHRD Pune",
  batch: "2025–27",
  track: "Finals",
  plan: "Premium",
  target: "Sales & Marketing (Management Trainee)",
  background: "Two years as an FMCG sales analyst",
  readiness: 64,
  cv: { version: "V4", locked: true, score: 84, impact: 88, clarity: 82, defensibility: 81 },
  answers: { total: 18, prepared: 12, needWork: 4 },
} as const;

export const KANIKSHA = {
  id: "pn-kaniksha",
  name: "Kaniksha Bambode",
  initials: "KB",
  function: "Marketing & Brand",
  bio: "Brand manager at a consumer-goods company",
  panelsThisSeason: 12,
} as const;

export const OPS = { id: "ops-1", name: "Ops team", initials: "OP" } as const;

export const DAY0_ISO = "2026-11-09T09:00:00+05:30";
export const DAY0_MOVED_ISO = "2026-11-16T09:00:00+05:30";
/** A late joiner sees Day 0 only 19 days away (e03.png). */
export const DAY0_LATE_ISO = "2026-10-24T09:00:00+05:30";
