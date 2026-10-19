"use client";

import dynamic from "next/dynamic";
import { AuthSkeleton } from "./AuthShell";

/**
 * Forms use React Hook Form + Zod (~16 kB gzip). They load right after first paint so the
 * route's first-load JS stays under budget. Client-only: there is no server-rendered form.
 * (next/dynamic needs the options inline as object literals.)
 */
export const SignInFormLazy = dynamic(() => import("./SignInForm").then((m) => m.SignInForm), {
  ssr: false,
  loading: () => <AuthSkeleton />,
});
export const SignUpFormLazy = dynamic(() => import("./SignUpForm").then((m) => m.SignUpForm), {
  ssr: false,
  loading: () => <AuthSkeleton />,
});
export const ForgotPasswordFormLazy = dynamic(
  () => import("./RecoveryForms").then((m) => m.ForgotPasswordForm),
  { ssr: false, loading: () => <AuthSkeleton /> },
);
export const ResetPasswordFormLazy = dynamic(
  () => import("./RecoveryForms").then((m) => m.ResetPasswordForm),
  { ssr: false, loading: () => <AuthSkeleton /> },
);
