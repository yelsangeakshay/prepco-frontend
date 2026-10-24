"use client";

import Link from "next/link";
import { useNavigate } from "@/lib/nav/useNavigate";
import { ArrowRight, CircleCheck, Info } from "lucide-react";
import { Controller, useForm, type FieldValues, type Resolver } from "react-hook-form";
import { zodResolver } from "@/lib/forms/zodResolver";
import type { ZodMiniType } from "zod/mini";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Textarea } from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";
import { FormAlert } from "@/features/auth/components/AuthShell";
import { ROUTES } from "@/lib/config/routes";
import { DAY0_ISO, now } from "@/lib/utils/clock";
import { daysUntil } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";
import { useApiReady } from "@/components/shell/Providers";
import { useOnboardingDraft } from "../draft";
import { useSaveProfile } from "../hooks/useOnboarding";
import {
  FUNCTIONS,
  PANEL_FOR_TARGET,
  profileSchema,
  step1Schema,
  step2Schema,
  type OnboardingProfile,
} from "../schemas";
import { OnboardingLayout } from "./OnboardingLayout";

/** The full runway starts this many weeks before Day 0 (s02.png). */
const FULL_RUNWAY_WEEKS = 8;

const TRACKS = [
  {
    value: "finals",
    name: "Final placements",
    long: "Shortlist → Panel → Offer. Day 0 through Day 2. Start 8 weeks out.",
    short: "Shortlist → Panel → Offer",
  },
  {
    value: "summers",
    name: "Summer internship",
    long: "Land the right SIP, then convert it into a pre-placement offer.",
    short: "Summers → PPO",
  },
] as const;

function useStepForm<T extends FieldValues>(schema: ZodMiniType<T>, initial: Partial<T>) {
  return useForm<T>({
    resolver: zodResolver(schema as never) as Resolver<T>,
    defaultValues: initial as never,
  });
}

/** The side cards from s02.png. They sit beside the form on wide screens only. */
export function WhatHappensNext() {
  const items = [
    ["Upload your current CV.", "Any format. We read it before we meet you."],
    ["Free 30-minute session.", "CV markup, two questions, three roles you're competitive for."],
    ["Pick how far down the runway you want cover.", "Or don't. The summary is yours either way."],
  ];
  return (
    <>
      <div className="rounded-feature border-line border bg-white p-6">
        <h2 className="text-maroon-600 text-xs font-semibold tracking-[0.18em] uppercase">
          What happens next
        </h2>
        <ol className="mt-5 space-y-5">
          {items.map(([lead, rest], i) => (
            <li key={lead} className="flex gap-3 text-[15px] leading-relaxed">
              <span aria-hidden className="font-display text-maroon-600 w-3 pt-0.5 text-xs">
                {i + 1}
              </span>
              <span>
                <strong>{lead}</strong> <span className="text-navy-400">{rest}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div className="rounded-feature bg-cream-soft p-6">
        <h2 className="text-maroon-600 text-xs font-semibold tracking-[0.18em] uppercase">
          CV Builder · always free
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed">
          Your CV and answers live here from day one, and carry from summers to finals. Nothing gets
          reset.
        </p>
      </div>
    </>
  );
}

function ActionRow({ back, pending, label }: { back?: string; pending?: boolean; label: string }) {
  return (
    <div className="max-lg:bg-cream max-lg:border-line flex items-center justify-between pt-2 max-lg:sticky max-lg:bottom-0 max-lg:-mx-5 max-lg:border-t max-lg:px-5 max-lg:py-4">
      {back ? (
        <Button asChild variant="secondary" className="max-lg:hidden">
          <Link href={back}>Back</Link>
        </Button>
      ) : (
        <span />
      )}
      <Button type="submit" className="max-lg:w-full" loading={pending}>
        {label}
        <ArrowRight className="size-4" aria-hidden />
      </Button>
    </div>
  );
}

/** Weeks to Day 0 for the chosen date, worded as the s02 callout words it. */
function runwayNote(day0Date: string | undefined) {
  if (!day0Date) return null;
  const days = daysUntil(`${day0Date}T09:00:00+05:30`, now());
  if (days < 0) {
    return { ok: false, lead: "That date has passed.", rest: "Check it with your placement cell." };
  }
  const weeks = Math.floor(days / 7);
  const away = weeks >= 2 ? `${weeks} weeks` : `${days} ${days === 1 ? "day" : "days"}`;
  if (weeks >= FULL_RUNWAY_WEEKS) {
    return {
      ok: true,
      lead: `${away} to Day 0. Enough for the full runway.`,
      rest: "Finals runways start 8 weeks out, with your profiling call and CV lock.",
    };
  }
  return {
    ok: false,
    lead: `${away} to Day 0. Less than the full runway needs.`,
    rest: "Finals runways start 8 weeks out, so yours will be compressed. We show you what fits.",
  };
}

export function OnboardingStep({ step, lateJoiner }: { step: 1 | 2; lateJoiner?: boolean }) {
  const { navigate, pending: navigating } = useNavigate();
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
  const f2 = useStepForm(step2Schema, {
    track: "finals",
    day0Date: DAY0_ISO.slice(0, 10),
    ...draft,
  });

  if (step === 1) {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = f1;
    return (
      <OnboardingLayout
        step={1}
        title="About you"
        subtitle="Tell us where you study and what you have done so far."
        banner={banner}
        aside={<WhatHappensNext />}
      >
        <form
          noValidate
          className="max-w-xl space-y-4"
          onSubmit={handleSubmit((v) => {
            setDraft(v);
            navigate(ROUTES.student.onboarding(2));
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
          <FormField
            id="experience"
            label="Experience"
            hint="One or two lines is enough."
            error={errors.experience?.message}
          >
            <Textarea
              id="experience"
              aria-invalid={!!errors.experience}
              {...register("experience")}
            />
          </FormField>
          <ActionRow label="Continue" pending={navigating} />
        </form>
      </OnboardingLayout>
    );
  }

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = f2;
  const fn = watch("targetFunction");
  const note = runwayNote(watch("day0Date"));
  const years = draft.yearsExperience != null ? `${draft.yearsExperience} yrs` : "";
  const aboutRest = [draft.batch, years].filter(Boolean).join(" · ");

  return (
    <OnboardingLayout
      step={2}
      title="Where are you headed, and when?"
      subtitle="This sets your runway. Day 0 doesn't move for anyone, so we plan backwards from it."
      banner={banner}
      aside={<WhatHappensNext />}
    >
      {save.isError && <FormAlert>We could not save your profile. Please try again.</FormAlert>}
      <form
        noValidate
        className="space-y-8"
        onSubmit={handleSubmit((v) => {
          const full = { ...draft, ...v };
          setDraft(v);
          const parsed = profileSchema.safeParse(full);
          if (!parsed.success) {
            navigate(ROUTES.student.onboarding(1));
            return;
          }
          save.mutate(parsed.data as OnboardingProfile, {
            onSuccess: () => navigate(ROUTES.student.onboardingCv),
          });
        })}
      >
        {draft.college && (
          <div className="rounded-card border-line text-navy-400 flex items-center justify-between gap-4 border bg-white px-6 py-4 text-[15px] max-lg:hidden">
            <p>
              About you: <strong className="text-navy-900">{draft.college}</strong>
              {aboutRest && ` · ${aboutRest}`}
            </p>
            <Link
              href={ROUTES.student.onboarding(1)}
              className="text-maroon-600 font-semibold underline"
            >
              Edit
            </Link>
          </div>
        )}

        <Controller
          control={control}
          name="track"
          render={({ field }) => (
            <fieldset>
              <legend className="mb-3 text-[17px] font-semibold">
                Which process are you preparing for?
              </legend>
              <div className="grid gap-3 lg:grid-cols-2 lg:gap-5">
                {TRACKS.map((t) => {
                  const on = field.value === t.value;
                  return (
                    <label
                      key={t.value}
                      className={cn(
                        "rounded-feature has-[:focus-visible]:outline-maroon-600 block cursor-pointer border bg-white p-5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 lg:p-6",
                        on ? "border-maroon-600 border-2" : "border-line",
                      )}
                    >
                      <input
                        type="radio"
                        name="track"
                        value={t.value}
                        checked={on}
                        onChange={() => field.onChange(t.value)}
                        className="sr-only"
                      />
                      <span className="flex items-center justify-between gap-3">
                        <span className="text-lg font-semibold">{t.name}</span>
                        {on && (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold tracking-wider text-green-600 uppercase max-lg:hidden">
                            Selected
                          </span>
                        )}
                      </span>
                      <span className="text-navy-400 mt-1 block text-[15px] leading-relaxed">
                        <span className="max-lg:hidden">{t.long}</span>
                        <span className="lg:hidden">{t.short}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              <FieldError>{errors.track?.message}</FieldError>
            </fieldset>
          )}
        />

        <Controller
          control={control}
          name="targetFunction"
          render={({ field }) => (
            <fieldset>
              <legend className="mb-3 text-[17px] font-semibold">Target role</legend>
              <div className="flex flex-wrap gap-2.5">
                {FUNCTIONS.map((f) => {
                  const on = field.value === f;
                  return (
                    <label
                      key={f}
                      className={cn(
                        "has-[:focus-visible]:outline-maroon-600 flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-[15px] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2",
                        on ? "bg-maroon-600 border-maroon-600 text-white" : "border-line bg-white",
                      )}
                    >
                      <input
                        type="radio"
                        name="targetFunction"
                        value={f}
                        checked={on}
                        onChange={() => field.onChange(f)}
                        className="sr-only"
                      />
                      {f === "General Management" ? (
                        <>
                          <span className="max-lg:hidden">General Management</span>
                          <span className="lg:hidden">General Mgmt</span>
                        </>
                      ) : (
                        f
                      )}
                    </label>
                  );
                })}
              </div>
              {fn ? (
                <p className="text-navy-400 mt-3 text-[15px] max-lg:hidden">
                  Your panel will be a{" "}
                  <strong className="text-navy-900">
                    {PANEL_FOR_TARGET[fn as keyof typeof PANEL_FOR_TARGET]}
                  </strong>{" "}
                  specialist. If your target shifts, we re-assign you rather than run the wrong
                  panel.
                </p>
              ) : null}
              <FieldError>{errors.targetFunction?.message}</FieldError>
            </fieldset>
          )}
        />

        <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
          <FormField
            id="day0Date"
            label="Day 0 date (from your placement cell)"
            error={errors.day0Date?.message}
          >
            <Input
              id="day0Date"
              type="date"
              className="min-h-[52px] text-base"
              aria-invalid={!!errors.day0Date}
              {...register("day0Date")}
            />
          </FormField>
          <div className="max-lg:hidden">
            <FormField
              id="companies"
              label="Companies you're aiming for (optional)"
              error={errors.companies?.message}
            >
              <Input
                id="companies"
                className="min-h-[52px] text-base"
                placeholder="e.g. FMCG, consumer durables, D2C"
                {...register("companies")}
              />
            </FormField>
          </div>
        </div>

        {note && (
          <>
            <p
              role="status"
              className={cn(
                "rounded-card flex gap-3 border bg-white p-5 text-[15px] max-lg:hidden",
                note.ok ? "border-green-600/40" : "border-gold-500",
              )}
            >
              {note.ok ? (
                <CircleCheck className="mt-0.5 size-5 shrink-0 text-green-600" aria-hidden />
              ) : (
                <Info className="text-gold-500 mt-0.5 size-5 shrink-0" aria-hidden />
              )}
              <span>
                <strong>{note.lead}</strong> <span className="text-navy-400">{note.rest}</span>
              </span>
            </p>
            <p className="text-navy-400 -mt-4 text-[15px] lg:hidden">{note.lead}</p>
          </>
        )}

        <ActionRow
          label="Continue"
          pending={save.isPending || navigating || !ready}
          back={ROUTES.student.onboarding(1)}
        />
      </form>
    </OnboardingLayout>
  );
}
