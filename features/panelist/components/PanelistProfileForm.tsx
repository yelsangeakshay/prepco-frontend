"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/forms/zodResolver";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";
import { notify } from "@/lib/utils/notify";
import { useUpdatePanelistProfile } from "../hooks/usePanelist";
import {
  updatePanelistProfileSchema,
  type PanelistProfile,
  type UpdatePanelistProfile,
} from "../schemas";

export default function PanelistProfileForm({ profile }: { profile: PanelistProfile }) {
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
      <Button type="submit" disabled={!isDirty} loading={update.isPending}>
        Save profile
      </Button>
    </form>
  );
}
