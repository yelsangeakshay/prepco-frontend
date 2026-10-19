import { z } from "zod";

export const signInBodySchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});
export type SignInBody = z.infer<typeof signInBodySchema>;

export const signUpBodySchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters"),
});
export type SignUpBody = z.infer<typeof signUpBodySchema>;

export const forgotBodySchema = z.object({ email: z.string().trim().email("Enter a valid email") });
export type ForgotBody = z.infer<typeof forgotBodySchema>;

export const resetBodySchema = z
  .object({
    token: z.string(),
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });
export type ResetBody = z.infer<typeof resetBodySchema>;

export const authResultSchema = z.object({
  role: z.enum(["student", "panelist", "ops"]),
  onboarded: z.boolean(),
  verifyRequired: z.boolean().optional(),
});
export type AuthResult = z.infer<typeof authResultSchema>;

export const okSchema = z.object({ ok: z.literal(true) });
