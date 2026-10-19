"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/forms/zodResolver";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";
import { ProposedBadge } from "@/components/shared/Badges";
import { useRequestRelock } from "../hooks/useCv";
import { relockBodySchema, type RelockBody } from "../schemas";

/** Loaded lazily, only when the re-lock dialog opens. */
export default function RelockForm({ onDone }: { onDone: () => void }) {
  const relock = useRequestRelock();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RelockBody>({ resolver: zodResolver(relockBodySchema) });

  return (
    <form
      noValidate
      className="mt-4 space-y-4"
      onSubmit={handleSubmit((v) => relock.mutate(v, { onSuccess: onDone }))}
    >
      <FormField id="reason" label="Why do you need to change it?" error={errors.reason?.message}>
        <Textarea id="reason" aria-invalid={!!errors.reason} {...register("reason")} />
      </FormField>
      {relock.isError && (
        <p role="alert" className="text-maroon-600 text-sm">
          We could not send your request. Please try again.
        </p>
      )}
      <p className="flex items-center gap-2 text-xs">
        <ProposedBadge />
        <span className="text-navy-400">Reviewed within one working day.</span>
      </p>
      <Button type="submit" className="w-full" disabled={relock.isPending}>
        {relock.isPending ? "Sending…" : "Send Request"}
      </Button>
    </form>
  );
}
