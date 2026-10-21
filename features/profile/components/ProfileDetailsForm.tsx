"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/forms/zodResolver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";
import { ROUTES } from "@/lib/config/routes";
import { notify } from "@/lib/utils/notify";
import { useUpdateProfile } from "../hooks/useProfile";
import {
  updateProfileBodySchema,
  type ProfileView as Profile,
  type UpdateProfileBody,
} from "../schemas";

/** The details form (s15.png). The Save changes button sits in the page header and submits this form. */
export default function ProfileDetailsForm({ profile }: { profile: Profile }) {
  const update = useUpdateProfile();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileBody>({
    resolver: zodResolver(updateProfileBodySchema),
    defaultValues: {
      name: profile.name,
      college: profile.college,
      batch: profile.batch,
      workExperience: profile.workExperience,
      phone: profile.phone,
    },
  });

  const save = handleSubmit((v) =>
    update
      .mutateAsync(v)
      .then(() => {
        reset(v);
        notify("Profile saved");
      })
      .catch(() => undefined),
  );

  return (
    <form
      id="profile-form"
      noValidate
      onSubmit={(e) => {
        if (!isDirty) {
          e.preventDefault();
          notify("No changes to save");
          return;
        }
        void save(e);
      }}
    >
      <div className="grid gap-x-4 gap-y-4 md:grid-cols-2">
        <FormField id="name" label="Full name" error={errors.name?.message}>
          <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
        </FormField>
        <FormField id="email" label="College email">
          <Input id="email" readOnly value={profile.email} />
        </FormField>
        <FormField id="college" label="College" error={errors.college?.message}>
          <Input id="college" aria-invalid={!!errors.college} {...register("college")} />
        </FormField>
        <FormField id="batch" label="Batch" error={errors.batch?.message}>
          <Input id="batch" aria-invalid={!!errors.batch} {...register("batch")} />
        </FormField>
        <FormField id="experience" label="Work experience" error={errors.workExperience?.message}>
          <Input id="experience" {...register("workExperience")} />
        </FormField>
        <FormField id="phone" label="Phone" error={errors.phone?.message}>
          <Input id="phone" type="tel" {...register("phone")} />
        </FormField>
        <FormField id="target-role" label="Target role">
          <Input id="target-role" readOnly data-testid="target" value={profile.target.function} />
        </FormField>
        <FormField id="day0" label="Day 0">
          <Input id="day0" readOnly value={profile.day0} />
        </FormField>
      </div>
      {update.isError && (
        <p role="alert" className="text-maroon-600 mt-4 text-sm">
          We could not save. Please try again.
        </p>
      )}
      <div className="bg-cream rounded-card mt-5 space-y-3 p-4">
        <p>
          <strong>Target shifted?</strong>{" "}
          <span className="text-navy-400">
            We re-assign your panel rather than run the wrong one.
          </span>
        </p>
        <Button asChild variant="secondary">
          <Link href={ROUTES.student.profileChangeTarget}>Request panel change</Link>
        </Button>
      </div>
    </form>
  );
}
