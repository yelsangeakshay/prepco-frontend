"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/forms/zodResolver";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";
import { Logo } from "@/components/shell/Logo";
import { Card } from "@/components/ui/card";
import { FormAlert } from "@/features/auth/components/AuthShell";
import { PANELIST_FUNCTIONS } from "@/features/onboarding/schemas";
import { ApiError } from "@/lib/api/client";
import { ROUTES } from "@/lib/config/routes";
import { useApiReady } from "@/components/shell/Providers";
import { useSubmitApplication } from "../hooks/usePanelist";
import { applicationBodySchema, type ApplicationBody, type ApplicationParsed } from "../schemas";

/** P1 apply to be a panelist (public). */
export function ApplyForm() {
  const router = useRouter();
  const ready = useApiReady();
  const submit = useSubmitApplication();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationBody, unknown, ApplicationParsed>({
    resolver: zodResolver(applicationBodySchema),
  });
  const err = submit.error instanceof ApiError ? submit.error : null;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-xl px-4 py-8">
      <Logo href={ROUTES.signIn} className="mb-6" />
      <Card variant="feature">
        <h1 className="font-display text-2xl font-bold">Become a panelist</h1>
        <p className="text-navy-400 mt-1 text-sm">
          Run evening mock panels (6 to 9 PM IST) for MBA students. We review every application.
        </p>
        <div className="mt-6">
          {submit.isError && (
            <FormAlert>{err?.message ?? "Something went wrong. Please try again."}</FormAlert>
          )}
          <form
            noValidate
            className="space-y-4"
            onSubmit={handleSubmit((v) =>
              submit.mutate(v, { onSuccess: () => router.push(ROUTES.panelistApplySubmitted) }),
            )}
          >
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
                aria-invalid={!!errors.email}
                {...register("email")}
              />
            </FormField>
            <FormField
              id="function"
              label="Function you can assess"
              error={errors.function?.message}
            >
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
                {PANELIST_FUNCTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField id="company" label="Company" error={errors.company?.message}>
              <Input id="company" aria-invalid={!!errors.company} {...register("company")} />
            </FormField>
            <FormField id="role" label="Current role" error={errors.role?.message}>
              <Input id="role" aria-invalid={!!errors.role} {...register("role")} />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="years" label="Years of experience" error={errors.years?.message}>
                <Input
                  id="years"
                  inputMode="numeric"
                  aria-invalid={!!errors.years}
                  {...register("years")}
                />
              </FormField>
              <FormField
                id="hoursPerMonth"
                label="Hours per month"
                error={errors.hoursPerMonth?.message}
              >
                <Input
                  id="hoursPerMonth"
                  inputMode="numeric"
                  aria-invalid={!!errors.hoursPerMonth}
                  {...register("hoursPerMonth")}
                />
              </FormField>
            </div>
            <FormField id="linkedin" label="LinkedIn (optional)" error={errors.linkedin?.message}>
              <Input
                id="linkedin"
                placeholder="https://www.linkedin.com/in/"
                aria-invalid={!!errors.linkedin}
                {...register("linkedin")}
              />
            </FormField>
            <FormField id="why" label="Why do you want to join?" error={errors.why?.message}>
              <Textarea id="why" aria-invalid={!!errors.why} {...register("why")} />
            </FormField>
            <Button type="submit" className="w-full" disabled={submit.isPending || !ready}>
              {submit.isPending ? "Sending…" : "Submit Application"}
            </Button>
          </form>
        </div>
      </Card>
    </main>
  );
}
