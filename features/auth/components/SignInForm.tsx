"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/forms/zodResolver";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FieldError, Input } from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";
import { ApiError } from "@/lib/api/client";
import { ROLE_HOME } from "@/lib/auth/roles";
import { ROUTES } from "@/lib/config/routes";
import { useApiReady } from "@/components/shell/Providers";
import { signInBodySchema, type SignInBody } from "../schemas";
import { useSignIn } from "../hooks/useAuth";
import { AuthLink, AuthShell, FormAlert, GoogleButton, OrDivider } from "./AuthShell";

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
      active="sign-in"
      title="Welcome back."
      subtitle="Pick up your runway where you left it."
      below={
        <Card variant="default" className="rounded-feature mt-6 hidden p-5 lg:block">
          <p className="font-semibold">New here?</p>
          <p className="text-navy-400 mt-1 text-sm">
            Start with a free 30-minute session. No card, and a written summary whether or not you
            buy.
          </p>
          <p className="mt-3 text-sm">
            <AuthLink href={ROUTES.signUp}>Book your free session →</AuthLink>
          </p>
        </Card>
      }
      belowPhone={
        <>
          <p>
            New here? <AuthLink href={ROUTES.signUp}>Create an account</AuthLink>
          </p>
          <p className="text-navy-400 mt-4 text-sm">
            Or start with a free 30-minute session. No card required.
          </p>
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
      <GoogleButton />
      <OrDivider />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField id="email" label="College email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </FormField>
        <div>
          <div className="mb-1 flex items-baseline justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <AuthLink href={ROUTES.forgotPassword}>Forgot?</AuthLink>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <FieldError>{errors.password?.message}</FieldError>
        </div>
        <Button type="submit" className="w-full" disabled={signIn.isPending || !ready}>
          {signIn.isPending ? "Signing in…" : "Sign in"}
          {!signIn.isPending && <ArrowRight className="size-4" aria-hidden />}
        </Button>
      </form>
    </AuthShell>
  );
}
