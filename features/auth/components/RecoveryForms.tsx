"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";
import { ApiError } from "@/lib/api/client";
import { ROUTES } from "@/lib/config/routes";
import { useApiReady } from "@/components/shell/Providers";
import { forgotBodySchema, resetBodySchema, type ForgotBody, type ResetBody } from "../schemas";
import { useForgotPassword, useResetPassword } from "../hooks/useAuth";
import { AuthLink, AuthShell, FormAlert } from "./AuthShell";

export function ForgotPasswordForm() {
  const ready = useApiReady();
  const forgot = useForgotPassword();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotBody>({ resolver: zodResolver(forgotBodySchema) });

  if (sentTo) {
    return (
      <AuthShell
        title="Check your email"
        footer={<AuthLink href={ROUTES.signIn}>Back to sign in</AuthLink>}
      >
        <MailCheck className="text-maroon-600 mb-3 size-8" aria-hidden />
        <p className="text-sm">
          If an account exists for <strong>{sentTo}</strong>, a reset link is on its way. It works
          for one hour.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we will send a reset link."
      footer={<AuthLink href={ROUTES.signIn}>Back to sign in</AuthLink>}
    >
      {forgot.isError && <FormAlert>Something went wrong. Please try again.</FormAlert>}
      <form
        noValidate
        className="space-y-4"
        onSubmit={handleSubmit((v) => forgot.mutate(v, { onSuccess: () => setSentTo(v.email) }))}
      >
        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </FormField>
        <Button type="submit" className="w-full" disabled={forgot.isPending || !ready}>
          {forgot.isPending ? "Sending…" : "Send Reset Link"}
        </Button>
      </form>
    </AuthShell>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const ready = useApiReady();
  const reset = useResetPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetBody>({ resolver: zodResolver(resetBodySchema), defaultValues: { token } });

  if (reset.isSuccess) {
    return (
      <AuthShell title="Password updated">
        <p className="mb-4 text-sm">You can now sign in with your new password.</p>
        <Button asChild className="w-full">
          <a href={ROUTES.signIn}>Go To Sign In</a>
        </Button>
      </AuthShell>
    );
  }

  const err = reset.error instanceof ApiError ? reset.error : null;

  return (
    <AuthShell title="Choose a new password">
      {reset.isError && (
        <FormAlert>
          {err?.message ?? "Something went wrong. Please try again."}{" "}
          {err?.code === "token_expired" && (
            <AuthLink href={ROUTES.forgotPassword}>Request a new link</AuthLink>
          )}
        </FormAlert>
      )}
      <form
        noValidate
        className="space-y-4"
        onSubmit={handleSubmit((v) => reset.mutate({ token: v.token, password: v.password }))}
      >
        <FormField id="password" label="New password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </FormField>
        <FormField id="confirm" label="Confirm password" error={errors.confirm?.message}>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.confirm}
            {...register("confirm")}
          />
        </FormField>
        <Button type="submit" className="w-full" disabled={reset.isPending || !ready}>
          {reset.isPending ? "Saving…" : "Update Password"}
        </Button>
      </form>
    </AuthShell>
  );
}
