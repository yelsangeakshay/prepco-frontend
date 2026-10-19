import { z } from "zod";
import { FUNCTIONS } from "@/features/onboarding/schemas";

export const profileViewSchema = z.object({
  name: z.string(),
  email: z.string(),
  college: z.string(),
  batch: z.string(),
  track: z.string(),
  background: z.string(),
  target: z.object({ function: z.string(), role: z.string() }),
  targetChange: z
    .object({ changedAt: z.string(), from: z.string(), answersToRework: z.number() })
    .nullable(),
});
export type ProfileView = z.infer<typeof profileViewSchema>;

export const updateProfileBodySchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  college: z.string().trim().min(2, "Enter your college"),
  batch: z.string().trim().min(4, "Enter your batch, e.g. 2025–27"),
});
export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>;

export const changeTargetBodySchema = z.object({
  function: z.enum(FUNCTIONS, { message: "Pick a target function" }),
  role: z.string().trim().min(2, "Enter the role you are targeting"),
  reason: z.string().trim().min(10, "Tell us why you are changing, in a line"),
});
export type ChangeTargetBody = z.infer<typeof changeTargetBodySchema>;

export const changeTargetResultSchema = z.object({
  ok: z.literal(true),
  answersToRework: z.number(),
  cvBulletsToReframe: z.number(),
});
export type ChangeTargetResult = z.infer<typeof changeTargetResultSchema>;
