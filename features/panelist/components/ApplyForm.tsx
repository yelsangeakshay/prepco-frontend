"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/forms/zodResolver";
import { Button } from "@/components/ui/button";
import { FieldError, Input } from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";
import { Logo } from "@/components/shell/Logo";
import { FormAlert } from "@/features/auth/components/AuthShell";
import { PANELIST_FUNCTIONS } from "@/features/onboarding/schemas";
import { ApiError } from "@/lib/api/client";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils/cn";
import { useApiReady } from "@/components/shell/Providers";
import { useSubmitApplication } from "../hooks/usePanelist";
import {
  APPLICATION_SESSIONS,
  applicationBodySchema,
  type ApplicationBody,
  type ApplicationParsed,
} from "../schemas";

const LOOK_FOR = [
  "Currently working in the function you'd interview for. Not retired from it, not adjacent to it.",
  "You've hired, or sat on a hiring panel, in the last two years.",
  "You'll read the student's brief before the panel and write feedback after it.",
];

const legend = "mb-2 block text-sm font-medium";

/** P1 apply to be a panelist (public, p01). */
export function ApplyForm() {
  const router = useRouter();
  const ready = useApiReady();
  const submit = useSubmitApplication();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ApplicationBody, unknown, ApplicationParsed>({
    resolver: zodResolver(applicationBodySchema),
    defaultValues: { sessions: [] },
  });
  const chosen = watch("function");
  const err = submit.error instanceof ApiError ? submit.error : null;

  return (
    <div className="min-h-dvh">
      <header className="border-line flex items-center justify-between border-b px-5 py-4 md:px-14">
        <Logo href={ROUTES.signIn} tone="light" tagline="Inception to offer letter" />
        <Link href={ROUTES.signIn} className="text-maroon-600 font-semibold underline">
          Panelist sign in
        </Link>
      </header>
      <main className="mx-auto grid w-full max-w-[1200px] grid-cols-[minmax(0,1fr)] gap-8 px-5 py-8 md:py-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        <div>
          <p className="text-maroon-600 text-[13px] font-semibold tracking-[0.18em] uppercase">
            Become a panelist
          </p>
          <h1 className="font-display mt-4 text-4xl leading-[1.15] font-bold md:text-5xl">
            Sit on the side of the table students never see.
          </h1>
          <p className="text-navy-400 mt-6 text-lg leading-relaxed">
            50+ specialists, each currently working in the function they interview for. You run P1,
            P2 or P3 panels in your own function, a few evenings a month.
          </p>
          <div
            className="bg-navy-900 mt-8 space-y-4 rounded-[20px] p-7 text-white"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 15% 0%, rgba(124,31,52,0.45), transparent 55%)",
            }}
          >
            <p className="text-sm font-semibold tracking-[0.18em] text-[var(--gold-500)] uppercase">
              Who we look for
            </p>
            {LOOK_FOR.map((t) => (
              <p key={t} className="text-lg leading-snug">
                {t}
              </p>
            ))}
          </div>
        </div>

        <div className="border-line rounded-[20px] border bg-white p-6 md:p-8">
          {submit.isError && (
            <FormAlert>{err?.message ?? "Something went wrong. Please try again."}</FormAlert>
          )}
          <form
            noValidate
            className="space-y-5"
            onSubmit={handleSubmit((v) =>
              submit.mutate(v, { onSuccess: () => router.push(ROUTES.panelistApplySubmitted) }),
            )}
          >
            <div className="grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2">
              <FormField id="name" label="Full name" error={errors.name?.message}>
                <Input
                  id="name"
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
              </FormField>
              <FormField id="email" label="Work email" error={errors.email?.message}>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
              </FormField>
              <FormField id="role" label="Current role" error={errors.role?.message}>
                <Input id="role" aria-invalid={!!errors.role} {...register("role")} />
              </FormField>
              <FormField
                id="company"
                label="Company (kept private from students)"
                error={errors.company?.message}
              >
                <Input
                  id="company"
                  placeholder="Company name"
                  aria-invalid={!!errors.company}
                  {...register("company")}
                />
              </FormField>
              <FormField id="years" label="Years in the function" error={errors.years?.message}>
                <Input
                  id="years"
                  inputMode="numeric"
                  aria-invalid={!!errors.years}
                  {...register("years")}
                />
              </FormField>
              <FormField id="linkedin" label="LinkedIn profile" error={errors.linkedin?.message}>
                <Input
                  id="linkedin"
                  placeholder="linkedin.com/in/..."
                  aria-invalid={!!errors.linkedin}
                  {...register("linkedin")}
                />
              </FormField>
            </div>

            <fieldset>
              <legend className={legend}>Function you interview for</legend>
              <input type="hidden" {...register("function")} />
              <div
                role="radiogroup"
                aria-label="Function you interview for"
                className="flex flex-wrap gap-3"
              >
                {PANELIST_FUNCTIONS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    role="radio"
                    aria-checked={chosen === f}
                    onClick={() => setValue("function", f, { shouldValidate: true })}
                    className={cn(
                      "min-h-11 rounded-full border px-5 text-sm font-medium",
                      chosen === f
                        ? "border-maroon-600 bg-maroon-600 text-white"
                        : "border-line bg-white",
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <FieldError>{errors.function?.message}</FieldError>
            </fieldset>

            <fieldset>
              <legend className={legend}>Sessions you can run</legend>
              <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-3">
                {APPLICATION_SESSIONS.map((s) => (
                  <label
                    key={s}
                    className="border-line rounded-control flex min-h-11 cursor-pointer items-center gap-3 border bg-white px-4 text-sm"
                  >
                    <input
                      type="checkbox"
                      value={s}
                      className="accent-maroon-600 size-4"
                      {...register("sessions")}
                    />
                    {s}
                  </label>
                ))}
              </div>
              <FieldError>{errors.sessions?.message}</FieldError>
            </fieldset>

            <FormField
              id="freeWhen"
              label="When you're usually free"
              error={errors.freeWhen?.message}
            >
              <Input
                id="freeWhen"
                placeholder="Weekday evenings after 6 PM, Saturday mornings"
                aria-invalid={!!errors.freeWhen}
                {...register("freeWhen")}
              />
            </FormField>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <p className="text-navy-400 text-sm">
                We&apos;ll reply within a week. A short call comes first.
              </p>
              <Button type="submit" disabled={submit.isPending || !ready}>
                {submit.isPending ? "Sending…" : "Submit application"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
