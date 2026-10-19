"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";
import { ProposedBadge } from "@/components/shared/Badges";
import { useJoinWaitlist } from "@/features/plans/hooks/usePlans";
import { ROUTES } from "@/lib/config/routes";

const schema = z.object({ email: z.string().trim().email("Enter a valid email") });
type Values = z.infer<typeof schema>;

/** E5: cohort full. 24 h to claim, Season 1 price kept (Proposed). */
export function WaitlistView() {
  const join = useJoinWaitlist();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  return (
    <div className="mx-auto max-w-xl p-4 md:p-8">
      <h1 className="font-display text-3xl font-bold">Join the waitlist</h1>
      <p className="text-navy-400 mt-1 text-sm">
        This cohort is full. We will email you when a seat opens.
      </p>
      <Card variant="feature" className="mt-6">
        {join.data ? (
          <div role="status" className="text-center">
            <CheckCircle2 className="mx-auto size-10 text-green-600" aria-hidden />
            <h2 className="font-display mt-3 text-2xl font-bold">You are #{join.data.position}</h2>
            <p className="text-navy-400 mt-1 text-sm">
              When a seat opens you have {join.data.claimWindowHours} hours to claim it. Your Season
              1 price is kept.
            </p>
            <Button asChild variant="secondary" className="mt-5">
              <Link href={ROUTES.student.home}>Go To Home</Link>
            </Button>
          </div>
        ) : (
          <form
            noValidate
            className="space-y-4"
            onSubmit={handleSubmit((v) => join.mutate({ planId: "premium", email: v.email }))}
          >
            <FormField id="email" label="Email" error={errors.email?.message}>
              <Input id="email" type="email" aria-invalid={!!errors.email} {...register("email")} />
            </FormField>
            {join.isError && (
              <p role="alert" className="text-maroon-600 text-sm">
                Something went wrong. Please try again.
              </p>
            )}
            <Button type="submit" className="w-full" disabled={join.isPending}>
              {join.isPending ? "Joining…" : "Join Waitlist"}
            </Button>
            <p className="flex items-center gap-2 text-xs">
              <ProposedBadge />
              <span className="text-navy-400">24 hours to claim. Season 1 price kept.</span>
            </p>
          </form>
        )}
      </Card>
    </div>
  );
}
