"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/forms/zodResolver";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { ProposedBadge } from "@/components/shared/Badges";
import { notify } from "@/lib/utils/notify";
import { usePanelistProfile, useUpdatePanelistProfile } from "../hooks/usePanelist";
import {
  updatePanelistProfileSchema,
  type PanelistProfile,
  type UpdatePanelistProfile,
} from "../schemas";

function Form({ profile }: { profile: PanelistProfile }) {
  const update = useUpdatePanelistProfile();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdatePanelistProfile>({
    resolver: zodResolver(updatePanelistProfileSchema),
    defaultValues: {
      name: profile.name,
      company: profile.company,
      role: profile.role,
      bio: profile.bio,
    },
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
      <FormField id="company" label="Company" error={errors.company?.message}>
        <Input id="company" aria-invalid={!!errors.company} {...register("company")} />
      </FormField>
      <FormField id="role" label="Role" error={errors.role?.message}>
        <Input id="role" aria-invalid={!!errors.role} {...register("role")} />
      </FormField>
      <FormField id="bio" label="Short bio" error={errors.bio?.message}>
        <Textarea id="bio" aria-invalid={!!errors.bio} {...register("bio")} />
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

/** Not mocked: built from the student profile (S15) patterns. */
export function PanelistProfileView() {
  const { data, isLoading, isError, refetch } = usePanelistProfile();
  if (isLoading) return <PageSkeleton />;
  if (isError || !data) return <ErrorCard onRetry={() => refetch()} />;
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-3xl font-bold">Profile</h1>
        <ProposedBadge />
      </div>
      <Card variant="feature">
        <p className="text-navy-400 text-xs font-semibold tracking-wider uppercase">Panels</p>
        <p className="font-display mt-1 text-2xl font-bold">{data.specialty}</p>
        <p className="text-sm">{data.function}</p>
        <p className="text-navy-400 mt-1 text-xs">{data.email}</p>
      </Card>
      <Card variant="feature">
        <h2 className="font-display mb-4 text-xl font-bold">Your details</h2>
        <Form profile={data} />
      </Card>
    </div>
  );
}
