import { api } from "../client";
import { okSchema } from "@/features/auth/schemas";
import {
  cvUploadResultSchema,
  freeSessionSchema,
  type OnboardingProfile,
} from "@/features/onboarding/schemas";

export const saveProfile = (body: OnboardingProfile) =>
  api("/students/me/profile", okSchema, { method: "PUT", json: body });
export const uploadCv = (body: { fileName: string; size: number; consent: true }) =>
  api("/students/me/cv", cvUploadResultSchema, { method: "POST", json: body });
export const getFreeSession = () => api("/free-session", freeSessionSchema);
