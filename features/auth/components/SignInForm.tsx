"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";
import { ApiError } from "@/lib/api/client";
import { ROLE_HOME } from "@/lib/auth/roles";
import { ROUTES } from "@/lib/config/routes";
import { useApiReady } from "@/components/shell/Providers";
import { signInBodySchema, type SignInBody } from "../schemas";
import { useSignIn } from "../hooks/useAuth";
import { AuthLink, AuthShell, FormAlert } from "./AuthShell";

export function SignInForm() {
  const router = useRouter();
  const ready = useApiReady();
  const signIn = useSignIn();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<SignInBody>({ resolver: zodResolver(signInBodySchema) });

  const onSubmit = (values: SignInBody) =>
    signIn.mutate(values, {
      onSuccess: (r) =>
        router.push(
          r.role === "student" && !r.onboarded ? ROUTES.student.onboarding(1) : ROLE_HOME[r.role],
        ),
      onError: (e) => {
        if (e instanceof ApiError && e.code === "email_unverified") {
          router.push(`${ROUTES.verifyEmail}?email=${encodeURIComponent(getValues("email"))}`);
        }
      },
    });

  const err = signIn.error instanceof ApiError ? signIn.error : null;
  const unverified = err?.code === "email_unverified";

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your runway."
      footer={
        <>
          New to The Prep Co? <AuthLink href={ROUTES.signUp}>Create an account</AuthLink>
        </>
      }
    >
      {err && !unverified && (
        <FormAlert>
          {err.message}{" "}
          {err.code === "no_account" && <AuthLink href={ROUTES.signUp}>Sign up instead</AuthLink>}
          {err.code === "invalid_credentials" && (
            <AuthLink href={ROUTES.forgotPassword}>Reset your password</AuthLink>
          )}
        </FormAlert>
      )}
      {signIn.isError && !err && <FormAlert>Something went wrong. Please try again.</FormAlert>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </FormField>
        <FormField id="password" label="Password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </FormField>
        <div className="text-right text-sm">
          <AuthLink href={ROUTES.forgotPassword}>Forgot password?</AuthLink>
        </div>
        <Button type="submit" className="w-full" disabled={signIn.isPending || !ready}>
          {signIn.isPending ? "Signing in…" : "Sign In"}
        </Button>
      </form>
    </AuthShell>
  );
}
