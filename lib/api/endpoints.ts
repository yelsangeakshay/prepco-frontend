import { z } from "zod";
import { api } from "./client";

export const meSchema = z.object({
  id: z.string(),
  role: z.enum(["student", "panelist", "ops"]),
  name: z.string(),
  initials: z.string(),
  onboarded: z.boolean(),
});
export type Me = z.infer<typeof meSchema>;

/** GET /api/v1/me */
export const getMe = () => api("/me", meSchema);
