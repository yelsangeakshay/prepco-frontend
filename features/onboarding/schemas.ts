import { z } from "zod";

export const FUNCTIONS = [
  "Sales & Marketing",
  "Finance",
  "Operations",
  "Consulting",
  "HR",
  "Product & Analytics",
] as const;

export const step1Schema = z.object({
  college: z.string().trim().min(2, "Enter your college"),
  batch: z.string().trim().min(4, "Enter your batch, e.g. 2025–27"),
  track: z.enum(["finals", "summers"], { message: "Pick a track" }),
});
export const step2Schema = z.object({
  targetFunction: z.enum(FUNCTIONS, { message: "Pick a target function" }),
  targetRole: z.string().trim().min(2, "Enter the role you are targeting"),
});
export const step3Schema = z.object({
  experience: z.string().trim().min(10, "Describe your experience in a line or two"),
  yearsExperience: z.coerce.number().min(0, "Enter 0 or more").max(15, "Enter 15 or less"),
});

export const profileSchema = step1Schema.and(step2Schema).and(step3Schema);
export type OnboardingProfile = z.infer<typeof step1Schema> &
  z.infer<typeof step2Schema> &
  z.infer<typeof step3Schema>;

export const cvUploadBodySchema = z.object({
  fileName: z.string(),
  size: z.number(),
  consent: z.literal(true),
});
export const cvUploadResultSchema = z.object({
  status: z.enum(["done", "failed"]),
  reason: z.string().nullable(),
  extracted: z.object({ roles: z.number(), bullets: z.number(), education: z.string() }).nullable(),
});
export type CvUploadResult = z.infer<typeof cvUploadResultSchema>;

export const CV_MAX_BYTES = 5 * 1024 * 1024;
export const CV_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/** Client-side check only. Returns an error message or null. */
export function validateCvFile(file: { name: string; size: number; type: string }): string | null {
  const okExt = /\.(pdf|docx)$/i.test(file.name);
  if (!okExt && !CV_TYPES.includes(file.type)) return "Upload a PDF or DOCX file.";
  if (file.size > CV_MAX_BYTES) return "File is larger than 5 MB.";
  return null;
}

export const freeSessionSchema = z.object({
  eligible: z.boolean(),
  usedAt: z.string().nullable(),
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
