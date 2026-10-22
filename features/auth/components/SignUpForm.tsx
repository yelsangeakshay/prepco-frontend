"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/forms/zodResolver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";
import { ApiError } from "@/lib/api/client";
import { ROUTES } from "@/lib/config/routes";
import { useApiStatus } from "@/components/shell/Providers";
import { useNavigate } from "@/lib/nav/useNavigate";
import { useReloadOnRestore } from "@/lib/nav/useReloadOnRestore";
import { signUpBodySchema, type SignUpBody } from "../schemas";
import { useSignUp } from "../hooks/useAuth";
import { ApiBootNotice } from "./ApiBootNotice";
import { AuthLink, AuthShell, FormAlert, GoogleButton, OrDivider } from "./AuthShell";

export function SignUpForm() {
  const { navigate, pending: navigating } = useNavigate();
  const apiStatus = useApiStatus();
  useReloadOnRestore();
  const signUp = useSignUp();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpBody>({ resolver: zodResolver(signUpBodySchema) });

  const onSubmit = (values: SignUpBody) =>
    signUp.mutate(values, {
      onSuccess: (r) =>
        navigate(
          r.verifyRequired
            ? `${ROUTES.verifyEmail}?email=${encodeURIComponent(values.email)}`
            : ROUTES.student.onboarding(1),
        ),
    });

  const busy = signUp.isPending || navigating;
  const err = signUp.error instanceof ApiError ? signUp.error : null;

  return (
    <AuthShell
      active="sign-up"
      title="Create your account"
      subtitle="Start with a free session. No card needed."
      belowPhone={
        <p>
          Already have an account? <AuthLink href={ROUTES.signIn}>Sign in</AuthLink>
        </p>
      }
    >
      {signUp.isError && (
        <FormAlert>
          {err ? err.message : "Something went wrong. Please try again."}{" "}
          {err?.code === "email_taken" && <AuthLink href={ROUTES.signIn}>Sign in</AuthLink>}
        </FormAlert>
      )}
      <ApiBootNotice />
      <GoogleButton />
      <OrDivider />
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset disabled={busy} className="m-0 min-w-0 space-y-4 border-0 p-0">
          <FormField id="name" label="Full name" error={errors.name?.message}>
            <Input
              id="name"
              autoComplete="name"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
          </FormField>
          <FormField id="email" label="College email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
          </FormField>
          <FormField
            id="password"
            label="Password"
            hint="At least 8 characters."
            error={errors.password?.message}
          >
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
          </FormField>
          <Button
            type="submit"
            className="w-full"
            loading={busy || apiStatus === "starting"}
            disabled={apiStatus === "failed"}
          >
            Create Account
          </Button>
        </fieldset>
      </form>
    </AuthShell>
  );
}
