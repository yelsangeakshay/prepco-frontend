"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/forms/zodResolver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";
import { ApiError } from "@/lib/api/client";
import { ROUTES } from "@/lib/config/routes";
import { notify } from "@/lib/utils/notify";
import { useApiReady } from "@/components/shell/Providers";
import { forgotBodySchema, resetBodySchema, type ForgotBody, type ResetBody } from "../schemas";
import { useForgotPassword, useResetPassword } from "../hooks/useAuth";
import { AuthLink, FormAlert, RecoveryShell } from "./AuthShell";

/** How long the resend button stays locked after a link goes out (e01.png shows 0:42). */
const RESEND_SECONDS = 42;

function clock(total: number) {
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export function ForgotPasswordForm() {
  const ready = useApiReady();
  const forgot = useForgotPassword();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [wait, setWait] = useState(RESEND_SECONDS);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotBody>({ resolver: zodResolver(forgotBodySchema) });

  useEffect(() => {
    if (!sentTo || wait <= 0) return;
    const t = window.setTimeout(() => setWait((w) => w - 1), 1000);
    return () => window.clearTimeout(t);
  }, [sentTo, wait]);

  if (sentTo) {
    return (
      <RecoveryShell eyebrow="Link sent" title="Check your inbox">
        <p className="text-navy-400 text-[15px] leading-relaxed">
          We sent a link to <strong className="text-navy-900">{sentTo}</strong>. College mail can
          take a few minutes; check spam too.
        </p>
        <p role="status" className="bg-cream rounded-card mt-5 p-4 text-sm">
          {wait > 0 ? (
            <>
              Didn&apos;t get it? You can resend in <strong>{clock(wait)}</strong>.
            </>
          ) : (
            "Didn't get it? You can resend the link now."
          )}
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Button
            variant="secondary"
            className="w-full"
            disabled={wait > 0 || forgot.isPending}
            onClick={() =>
              forgot.mutate(
                { email: sentTo },
                {
                  onSuccess: () => {
                    setWait(RESEND_SECONDS);
                    notify("Reset link sent again");
                  },
                },
              )
            }
          >
            Resend link
          </Button>
          <button
            type="button"
            className="text-maroon-600 min-h-11 text-center text-sm font-semibold underline"
            onClick={() => setSentTo(null)}
          >
            Use a different email
          </button>
        </div>
      </RecoveryShell>
    );
  }

  return (
    <RecoveryShell eyebrow="Forgot password" title="Reset your password">
      <p className="text-navy-400 mb-5 text-[15px] leading-relaxed">
        Enter the email you signed up with. We&apos;ll send a link that works for 30 minutes.
      </p>
      {forgot.isError && <FormAlert>Something went wrong. Please try again.</FormAlert>}
      <form
        noValidate
        className="space-y-6"
        onSubmit={handleSubmit((v) =>
          forgot.mutate(v, {
            onSuccess: () => {
              setWait(RESEND_SECONDS);
              setSentTo(getValues("email"));
            },
          }),
        )}
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
        <Button type="submit" className="min-h-[52px] w-full" disabled={forgot.isPending || !ready}>
          {forgot.isPending ? "Sending…" : "Send reset link"}
        </Button>
      </form>
    </RecoveryShell>
  );
}

function Rule({ ok, children }: { ok: boolean; children: string }) {
  return (
    <li className={ok ? "text-green-600" : "text-navy-400"}>
      <span aria-hidden>{ok ? "✓" : "○"}</span> {children}
      <span className="sr-only">{ok ? " (met)" : " (not met yet)"}</span>
    </li>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const ready = useApiReady();
  const reset = useResetPassword();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetBody>({ resolver: zodResolver(resetBodySchema), defaultValues: { token } });
  const password = watch("password") ?? "";
  const confirm = watch("confirm") ?? "";

  const err = reset.error instanceof ApiError ? reset.error : null;

  return (
    <RecoveryShell eyebrow="From the email link" title="Set a new password">
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
        onSubmit={handleSubmit((v) =>
          reset.mutate(
            { token: v.token, password: v.password },
            { onSuccess: () => router.push(ROUTES.signIn) },
          ),
        )}
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
        <ul className="space-y-1 text-sm">
          <Rule ok={password.length >= 8}>At least 8 characters</Rule>
          <Rule ok={password.length > 0 && password === confirm}>Passwords match</Rule>
        </ul>
        <Button type="submit" className="min-h-[52px] w-full" disabled={reset.isPending || !ready}>
          {reset.isPending ? "Saving…" : "Save and sign in"}
        </Button>
      </form>
    </RecoveryShell>
  );
}
