import { z } from "zod";

/** Target roles a student picks (s02.png). */
export const FUNCTIONS = [
  "Sales & Marketing",
  "HR",
  "Finance",
  "Business Analytics",
  "General Management",
  "Operations",
] as const;

/** The six functions panelists interview for (a06.png): 10, 11, 9, 7, 8 and 7 of the 52. */
export const PANELIST_FUNCTIONS = [
  "Consulting & Strategy",
  "Marketing & Brand",
  "Finance & Banking",
  "Operations & Supply Chain",
  "Product & Analytics",
  "HR & General Management",
] as const;

/** Which panelist function interviews a student's target role. */
export const PANEL_FOR_TARGET: Record<
  (typeof FUNCTIONS)[number],
  (typeof PANELIST_FUNCTIONS)[number]
> = {
  "Sales & Marketing": "Marketing & Brand",
  HR: "HR & General Management",
  Finance: "Finance & Banking",
  "Business Analytics": "Product & Analytics",
  "General Management": "Consulting & Strategy",
  Operations: "Operations & Supply Chain",
};

/** Step 1, About you: where they study and what they have done so far. */
export const step1Schema = z.object({
  college: z.string().trim().min(2, "Enter your college"),
  batch: z.string().trim().min(4, "Enter your batch, e.g. 2025–27"),
  yearsExperience: z.coerce.number().min(0, "Enter 0 or more").max(15, "Enter 15 or less"),
  experience: z.string().trim().min(10, "Describe your experience in a line or two"),
});
/** Step 2, Track and target (s02.png). The Day 0 date is an ISO date, from the placement cell. */
export const step2Schema = z.object({
  track: z.enum(["finals", "summers"], { message: "Pick a track" }),
  targetFunction: z.enum(FUNCTIONS, { message: "Pick a target role" }),
  day0Date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter your Day 0 date"),
  companies: z.string().trim().max(200, "Keep this under 200 characters").optional(),
});

export const profileSchema = step1Schema.and(step2Schema);
export type OnboardingProfile = z.infer<typeof step1Schema> & z.infer<typeof step2Schema>;

export const cvUploadBodySchema = z.object({
  fileName: z.string(),
  size: z.number(),
  consent: z.literal(true),
});
export const cvUploadResultSchema = z.object({
  status: z.enum(["done", "failed"]),
  reason: z.string().nullable(),
  extracted: z
    .object({
      education: z.number(),
      workBullets: z.number(),
      projects: z.number(),
      achievements: z.number(),
      score: z.number(),
    })
    .nullable(),
});
export type CvUploadResult = z.infer<typeof cvUploadResultSchema>;

export const CV_MAX_BYTES = 5 * 1024 * 1024;
export const CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/** Client-side check only. Returns an error message or null. */
export function validateCvFile(file: { name: string; size: number; type: string }): string | null {
  const okExt = /\.(pdf|docx?)$/i.test(file.name);
  if (!okExt && !CV_TYPES.includes(file.type)) return "Upload a PDF or Word file.";
  if (file.size > CV_MAX_BYTES) return "File is larger than 5 MB.";
  return null;
}

/** What the free session left behind (s03.png). Sample content in the mock. */
export const freeSummarySchema = z.object({
  headline: z.string(),
  lede: z.string(),
  /** Shorter lede for a phone. */
  ledeShort: z.string(),
  roles: z.array(z.object({ title: z.string(), note: z.string() })),
  markups: z.array(z.object({ quote: z.string(), ask: z.string(), askShort: z.string() })),
  answers: z.array(
    z.object({ question: z.string(), verdict: z.enum(["landed", "needs-work"]), note: z.string() }),
  ),
  runway: z.string(),
});
export type FreeSummary = z.infer<typeof freeSummarySchema>;

export const freeSessionSchema = z.object({
  eligible: z.boolean(),
  usedAt: z.string().nullable(),
  summary: freeSummarySchema.nullable(),
  slots: z.array(
    z.object({
      id: z.string(),
      startsAt: z.string(),
      label: z.string(),
      taken: z.boolean().optional(),
    }),
  ),
});
export type FreeSession = z.infer<typeof freeSessionSchema>;
