"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/forms/zodResolver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";
import { notify } from "@/lib/utils/notify";
import { useUpdateProfile } from "../hooks/useProfile";
import {
  updateProfileBodySchema,
  type ProfileView as Profile,
  type UpdateProfileBody,
} from "../schemas";

export default function ProfileDetailsForm({ profile }: { profile: Profile }) {
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
