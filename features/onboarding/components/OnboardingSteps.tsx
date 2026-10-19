"use client";

import { useRouter } from "next/navigation";
import { useForm, type FieldValues, type Resolver } from "react-hook-form";
import { zodResolver } from "@/lib/forms/zodResolver";
import type { ZodType } from "zod";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";
import { FormAlert } from "@/features/auth/components/AuthShell";
import { ROUTES } from "@/lib/config/routes";
import { useApiReady } from "@/components/shell/Providers";
import { useOnboardingDraft } from "../draft";
import { useSaveProfile } from "../hooks/useOnboarding";
import {
  FUNCTIONS,
  profileSchema,
  step1Schema,
  step2Schema,
  step3Schema,
  type OnboardingProfile,
} from "../schemas";
import { OnboardingLayout } from "./OnboardingLayout";

const TOTAL = 3;

function Select({
  id,
  invalid,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select
      id={id}
      aria-invalid={invalid}
      className="rounded-control border-line aria-[invalid=true]:border-maroon-600 min-h-11 w-full border bg-white px-3 text-sm"
      {...rest}
    >
      {children}
    </select>
  );
}

function useStepForm<T extends FieldValues>(schema: ZodType<T>, initial: Partial<T>) {
  return useForm<T>({
    resolver: zodResolver(schema as never) as Resolver<T>,
    defaultValues: initial as never,
  });
}

function Actions({
  back,
  pending,
  label,
}: {
  back?: () => void;
  pending?: boolean;
  label: string;
}) {
  return (
    <div className="flex gap-2 pt-2">
      {back && (
        <Button type="button" variant="secondary" onClick={back}>
          Back
        </Button>
      )}
      <Button type="submit" className="flex-1" disabled={pending}>
        {label}
      </Button>
    </div>
  );
}

export function OnboardingStep({ step, lateJoiner }: { step: 1 | 2 | 3; lateJoiner?: boolean }) {
  const router = useRouter();
  const ready = useApiReady();
  const { draft, setDraft } = useOnboardingDraft();
  const save = useSaveProfile();

  const banner = lateJoiner ? (
    <div role="note" className="bg-cream-soft rounded-card border-gold-500 border-l-4 p-4 text-sm">
      <p className="font-semibold">You are joining late</p>
      <p className="text-navy-400 mt-1">
        Your runway is compressed to the last three sessions before Day 0. We will show it on your
        home page.
      </p>
    </div>
  ) : undefined;

  const f1 = useStepForm(step1Schema, draft);
  const f2 = useStepForm(step2Schema, draft);
  const f3 = useStepForm(step3Schema, draft);

  if (step === 1) {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = f1;
    return (
      <OnboardingLayout
        step={1}
        total={TOTAL}
        title="About you"
        subtitle="Tell us where you study."
        banner={banner}
      >
        <form
          noValidate
          className="space-y-4"
          onSubmit={handleSubmit((v) => {
            setDraft(v);
            router.push(ROUTES.student.onboarding(2));
          })}
        >
          <FormField id="college" label="College" error={errors.college?.message}>
            <Input id="college" aria-invalid={!!errors.college} {...register("college")} />
          </FormField>
          <FormField
            id="batch"
            label="Batch"
            hint="For example 2025–27"
            error={errors.batch?.message}
          >
            <Input id="batch" aria-invalid={!!errors.batch} {...register("batch")} />
          </FormField>
          <FormField id="track" label="Track" error={errors.track?.message}>
            <Select id="track" invalid={!!errors.track} defaultValue="" {...register("track")}>
              <option value="" disabled>
                Select a track
              </option>
              <option value="finals">Finals</option>
              <option value="summers">Summers</option>
            </Select>
          </FormField>
          <Actions label="Continue" />
        </form>
      </OnboardingLayout>
    );
  }

  if (step === 2) {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = f2;
    return (
      <OnboardingLayout
        step={2}
        total={TOTAL}
        title="Your target"
        subtitle="What are you aiming for?"
        banner={banner}
      >
        <form
          noValidate
          className="space-y-4"
          onSubmit={handleSubmit((v) => {
            setDraft(v);
            router.push(ROUTES.student.onboarding(3));
          })}
        >
          <FormField
            id="targetFunction"
            label="Target function"
            error={errors.targetFunction?.message}
          >
            <Select
              id="targetFunction"
              invalid={!!errors.targetFunction}
              defaultValue=""
              {...register("targetFunction")}
            >
              <option value="" disabled>
                Select a function
              </option>
              {FUNCTIONS.map((fn) => (
                <option key={fn} value={fn}>
                  {fn}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField id="targetRole" label="Target role" error={errors.targetRole?.message}>
            <Input
              id="targetRole"
              placeholder="Management Trainee"
              aria-invalid={!!errors.targetRole}
              {...register("targetRole")}
            />
          </FormField>
          <Actions label="Continue" back={() => router.push(ROUTES.student.onboarding(1))} />
        </form>
      </OnboardingLayout>
    );
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = f3;
  return (
    <OnboardingLayout
      step={3}
      total={TOTAL}
      title="Your experience"
      subtitle="One or two lines is enough."
      banner={banner}
    >
      {save.isError && <FormAlert>We could not save your profile. Please try again.</FormAlert>}
      <form
        noValidate
        className="space-y-4"
        onSubmit={handleSubmit((v) => {
          const full = { ...draft, ...v };
          setDraft(v);
          const parsed = profileSchema.safeParse(full);
          if (!parsed.success) {
            router.push(ROUTES.student.onboarding(1));
            return;
          }
          save.mutate(parsed.data as OnboardingProfile, {
            onSuccess: () => router.push(ROUTES.student.onboardingCv),
          });
        })}
      >
        <FormField id="experience" label="Experience" error={errors.experience?.message}>
          <Textarea
            id="experience"
            aria-invalid={!!errors.experience}
            {...register("experience")}
          />
        </FormField>
        <FormField
          id="yearsExperience"
          label="Years of experience"
          error={errors.yearsExperience?.message}
        >
          <Input
            id="yearsExperience"
            type="number"
            inputMode="numeric"
            min={0}
            aria-invalid={!!errors.yearsExperience}
            {...register("yearsExperience")}
          />
        </FormField>
        <Actions
          label={save.isPending ? "Saving…" : "Continue"}
          pending={save.isPending || !ready}
          back={() => router.push(ROUTES.student.onboarding(2))}
        />
      </form>
    </OnboardingLayout>
  );
}
