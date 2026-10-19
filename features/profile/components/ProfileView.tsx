"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/forms/zodResolver";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { ROUTES } from "@/lib/config/routes";
import { formatDay } from "@/lib/utils/dates";
import { notify } from "@/lib/utils/notify";
import { useProfile, useUpdateProfile } from "../hooks/useProfile";
import {
  updateProfileBodySchema,
  type ProfileView as Profile,
  type UpdateProfileBody,
} from "../schemas";

function DetailsForm({ profile }: { profile: Profile }) {
  const update = useUpdateProfile();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileBody>({
    resolver: zodResolver(updateProfileBodySchema),
    defaultValues: { name: profile.name, college: profile.college, batch: profile.batch },
  });

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={handleSubmit((v) =>
        update.mutate(v, {
          onSuccess: () => {
            reset(v);
            notify("Profile saved");
          },
        }),
      )}
    >
      <FormField id="name" label="Full name" error={errors.name?.message}>
        <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
      </FormField>
      <FormField id="college" label="College" error={errors.college?.message}>
        <Input id="college" aria-invalid={!!errors.college} {...register("college")} />
      </FormField>
      <FormField id="batch" label="Batch" error={errors.batch?.message}>
        <Input id="batch" aria-invalid={!!errors.batch} {...register("batch")} />
      </FormField>
      {update.isError && (
        <p role="alert" className="text-maroon-600 text-sm">
          We could not save. Please try again.
        </p>
      )}
      <Button type="submit" disabled={!isDirty || update.isPending}>
        {update.isPending ? "Saving…" : "Save Profile"}
      </Button>
    </form>
  );
}

/** S15 profile. */
export function ProfileView() {
  const { data, isLoading, isError, refetch } = useProfile();
  if (isLoading) return <PageSkeleton />;
  if (isError || !data) return <ErrorCard onRetry={() => refetch()} />;

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-8">
      <h1 className="font-display text-3xl font-bold">Profile</h1>

      {data.targetChange && (
        <div
          role="note"
          data-testid="target-changed"
          className="bg-cream-soft border-gold-500 rounded-card border-l-4 p-4 text-sm"
        >
          <p className="font-semibold">
            Target changed on {formatDay(data.targetChange.changedAt)}
          </p>
          <p className="text-navy-400">
            From {data.targetChange.from}. {data.targetChange.answersToRework} answers need rework.{" "}
            <Link
              href={`${ROUTES.student.answers}?status=flagged`}
              className="text-maroon-600 font-semibold underline"
            >
              Open flagged answers
            </Link>
          </p>
        </div>
      )}

      <Card variant="feature">
        <p className="text-navy-400 text-xs font-semibold tracking-wider uppercase">Target</p>
        <p data-testid="target" className="font-display mt-1 text-2xl font-bold">
          {data.target.function}
        </p>
        <p className="text-sm">{data.target.role}</p>
        <p className="text-navy-400 mt-1 text-xs">
          {data.track} track · {data.background}
        </p>
        <Button asChild variant="secondary" className="mt-4">
          <Link href={ROUTES.student.profileChangeTarget}>Change Target</Link>
        </Button>
      </Card>

      <Card variant="feature">
        <h2 className="font-display mb-4 text-xl font-bold">Your details</h2>
        <p className="text-navy-400 mb-4 text-sm">{data.email}</p>
        <DetailsForm profile={data} />
      </Card>
    </div>
  );
}
