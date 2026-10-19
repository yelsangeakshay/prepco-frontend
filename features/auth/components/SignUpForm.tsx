"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/forms/zodResolver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";
import { ApiError } from "@/lib/api/client";
import { ROUTES } from "@/lib/config/routes";
import { useApiReady } from "@/components/shell/Providers";
import { signUpBodySchema, type SignUpBody } from "../schemas";
import { useSignUp } from "../hooks/useAuth";
import { AuthLink, AuthShell, FormAlert } from "./AuthShell";

export function SignUpForm() {
  const router = useRouter();
  const ready = useApiReady();
  const signUp = useSignUp();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpBody>({ resolver: zodResolver(signUpBodySchema) });

  const onSubmit = (values: SignUpBody) =>
    signUp.mutate(values, {
      onSuccess: (r) =>
        router.push(
          r.verifyRequired
            ? `${ROUTES.verifyEmail}?email=${encodeURIComponent(values.email)}`
            : ROUTES.student.onboarding(1),
        ),
    });

  const err = signUp.error instanceof ApiError ? signUp.error : null;

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start with a free session. No card needed."
      footer={
        <>
          Already have an account? <AuthLink href={ROUTES.signIn}>Sign in</AuthLink>
        </>
      }
    >
      {signUp.isError && (
        <FormAlert>
          {err ? err.message : "Something went wrong. Please try again."}{" "}
          {err?.code === "email_taken" && <AuthLink href={ROUTES.signIn}>Sign in</AuthLink>}
        </FormAlert>
      )}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField id="name" label="Full name" error={errors.name?.message}>
          <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
        </FormField>
        <FormField id="email" label="Email" error={errors.email?.message}>
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
        <Button type="submit" className="w-full" disabled={signUp.isPending || !ready}>
          {signUp.isPending ? "Creating account…" : "Create Account"}
        </Button>
      </form>
    </AuthShell>
  );
}
