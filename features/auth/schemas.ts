import * as z from "zod/mini";

export const signInBodySchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().check(z.minLength(1, "Enter your password")),
});
export type SignInBody = z.infer<typeof signInBodySchema>;

export const signUpBodySchema = z.object({
  name: z.string().check(z.trim()).check(z.minLength(2, "Enter your full name")),
  email: z.email("Enter a valid email"),
  password: z.string().check(z.minLength(8, "Use at least 8 characters")),
});
export type SignUpBody = z.infer<typeof signUpBodySchema>;

export const forgotBodySchema = z.object({ email: z.email("Enter a valid email") });
export type ForgotBody = z.infer<typeof forgotBodySchema>;

export const resetBodySchema = z
  .object({
    token: z.string(),
    password: z.string().check(z.minLength(8, "Use at least 8 characters")),
    confirm: z.string(),
  })
  .check(
    z.refine((v) => v.password === v.confirm, {
      path: ["confirm"],
      message: "Passwords do not match",
    }),
  );
export type ResetBody = z.infer<typeof resetBodySchema>;

export const authResultSchema = z.object({
  role: z.enum(["student", "panelist", "ops"]),
  onboarded: z.boolean(),
  verifyRequired: z.optional(z.boolean()),
});
export type AuthResult = z.infer<typeof authResultSchema>;

export const okSchema = z.object({ ok: z.literal(true) });
