"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/forms/zodResolver";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { FUNCTIONS } from "@/features/onboarding/schemas";
import { ROUTES } from "@/lib/config/routes";
import { useChangeTarget, useProfile } from "../hooks/useProfile";
import { changeTargetBodySchema, type ChangeTargetBody } from "../schemas";

/** E9 change target role. */
export function ChangeTargetView() {
  const profile = useProfile();
  const change = useChangeTarget();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangeTargetBody>({ resolver: zodResolver(changeTargetBodySchema) });

  if (profile.isLoading) return <PageSkeleton />;
  if (profile.isError || !profile.data) return <ErrorCard onRetry={() => profile.refetch()} />;

  if (change.data) {
    return (
      <div className="mx-auto max-w-xl p-4 md:p-8">
        <Card variant="feature" data-testid="target-result">
          <CheckCircle2 className="size-10 text-green-600" aria-hidden />
          <h1 className="font-display mt-3 text-2xl font-bold">Target updated</h1>
          <p className="text-navy-400 mt-1 text-sm">
            {change.data.answersToRework} answers and {change.data.cvBulletsToReframe} CV bullets
            need a new angle.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href={`${ROUTES.student.answers}?status=flagged`}>Rework Answers</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={ROUTES.student.profile}>Back To Profile</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-4 p-4 md:p-8">
      <Link
        href={ROUTES.student.profile}
        className="text-maroon-600 text-sm font-semibold underline"
      >
        Profile
      </Link>
      <h1 className="font-display text-3xl font-bold">Change target role</h1>
      <p className="text-navy-400 text-sm">
        Now targeting {profile.data.target.function} ({profile.data.target.role}). Changing it flags
        answers that no longer fit. You can compare first in{" "}
        <Link href={ROUTES.student.quickSwitch} className="text-maroon-600 font-semibold underline">
          Quick Switch
        </Link>
        .
      </p>
      <Card variant="feature">
        <form noValidate className="space-y-4" onSubmit={handleSubmit((v) => change.mutate(v))}>
          <FormField id="function" label="New target function" error={errors.function?.message}>
            <select
              id="function"
              defaultValue=""
              aria-invalid={!!errors.function}
              className="rounded-control border-line aria-[invalid=true]:border-maroon-600 min-h-11 w-full border bg-white px-3 text-sm"
              {...register("function")}
            >
              <option value="" disabled>
                Select a function
              </option>
              {FUNCTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id="role" label="New target role" error={errors.role?.message}>
            <Input id="role" aria-invalid={!!errors.role} {...register("role")} />
          </FormField>
          <FormField id="reason" label="Why are you changing?" error={errors.reason?.message}>
            <Textarea id="reason" aria-invalid={!!errors.reason} {...register("reason")} />
          </FormField>
          {change.isError && (
            <p role="alert" className="text-maroon-600 text-sm">
              We could not change your target. Please try again.
            </p>
          )}
          <Button type="submit" className="w-full" disabled={change.isPending}>
            {change.isPending ? "Updating…" : "Change Target"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
