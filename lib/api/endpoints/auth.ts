import { z } from "zod";
import { api } from "../client";
import {
  authResultSchema,
  okSchema,
  type ForgotBody,
  type ResetBody,
  type SignInBody,
  type SignUpBody,
} from "@/features/auth/schemas";

export const meSchema = z.object({
  id: z.string(),
  role: z.enum(["student", "panelist", "ops"]),
  name: z.string(),
  initials: z.string(),
  onboarded: z.boolean(),
});
export type Me = z.infer<typeof meSchema>;

/** Every function maps 1:1 to a route in docs/API_CONTRACT.md. */

export const getMe = () => api("/me", meSchema);
export const signIn = (body: SignInBody) =>
  api("/auth/sign-in", authResultSchema, { method: "POST", json: body });
export const signUp = (body: SignUpBody) =>
  api("/auth/sign-up", authResultSchema, { method: "POST", json: body });
export const signOut = () => api("/auth/sign-out", okSchema, { method: "POST" });
export const forgotPassword = (body: ForgotBody) =>
  api("/auth/forgot", okSchema, { method: "POST", json: body });
export const resetPassword = (body: Pick<ResetBody, "token" | "password">) =>
  api("/auth/reset", okSchema, { method: "POST", json: body });
