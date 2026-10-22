"use client";

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
import { useApiStatus } from "@/components/shell/Providers";
import { useNavigate } from "@/lib/nav/useNavigate";
import { useReloadOnRestore } from "@/lib/nav/useReloadOnRestore";
import { signInBodySchema, type SignInBody } from "../schemas";
import { useSignIn } from "../hooks/useAuth";
import { ApiBootNotice } from "./ApiBootNotice";
import { AuthLink, AuthShell, FormAlert, GoogleButton, OrDivider } from "./AuthShell";

export function SignInForm() {
  const { navigate, pending: navigating } = useNavigate();
  const apiStatus = useApiStatus();
  useReloadOnRestore();
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
        navigate(
          r.role === "student" && !r.onboarded ? ROUTES.student.onboarding(1) : ROLE_HOME[r.role],
        ),
      onError: (e) => {
        if (e instanceof ApiError && e.code === "email_unverified") {
          navigate(`${ROUTES.verifyEmail}?email=${encodeURIComponent(getValues("email"))}`);
        }
      },
    });

  // Busy from submit until the next page has rendered, so the button never flips back during the redirect.
  const busy = signIn.isPending || navigating;
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
      <ApiBootNotice />
      <GoogleButton />
      <OrDivider />
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset disabled={busy} className="m-0 min-w-0 space-y-4 border-0 p-0">
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
          <Button
            type="submit"
            className="w-full"
            loading={busy || apiStatus === "starting"}
            disabled={apiStatus === "failed"}
          >
            Sign in
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </fieldset>
      </form>
    </AuthShell>
  );
}
