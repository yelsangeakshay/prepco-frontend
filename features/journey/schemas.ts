import { z } from "zod";

export const journeySchema = z.object({
  season: z.array(
    z.object({ id: z.string(), label: z.string(), detail: z.string(), done: z.boolean() }),
  ),
  routes: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      fit: z.enum(["primary", "alternate"]),
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

export const caseTrackSchema = z.object({
  modules: z.array(
    z.object({ id: z.string(), title: z.string(), minutes: z.number(), done: z.boolean() }),
  ),
});
export type CaseTrack = z.infer<typeof caseTrackSchema>;
