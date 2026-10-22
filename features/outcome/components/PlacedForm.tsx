"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/forms/zodResolver";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";
import { PlacedNotes } from "./PlacedNotes";

const placedForm = z.object({
  company: z.string().trim().min(2, "Enter the company"),
  role: z.string().trim().min(2, "Enter the role"),
  ctc: z.coerce.number({ message: "Enter the CTC in ₹" }).positive("Enter the CTC in ₹"),
});
type PlacedValues = z.input<typeof placedForm>;

/** The "Placed. Well done." form (e07.png): company, role, anonymised-result opt-in, save. */
export default function PlacedForm({
  onDone,
}: {
  onDone: (v: z.output<typeof placedForm>) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PlacedValues, unknown, z.output<typeof placedForm>>({
    resolver: zodResolver(placedForm),
  });
  return (
    <form noValidate className="space-y-5" onSubmit={handleSubmit(onDone)}>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2">
        <FormField id="company" label="Company (private)" error={errors.company?.message}>
          <Input
            id="company"
            placeholder="Company name"
            aria-invalid={!!errors.company}
            {...register("company")}
          />
        </FormField>
        <FormField id="role" label="Role" error={errors.role?.message}>
          <Input id="role" aria-invalid={!!errors.role} {...register("role")} />
        </FormField>
      </div>
      <FormField id="ctc" label="Annual CTC (₹)" error={errors.ctc?.message}>
        <Input id="ctc" inputMode="numeric" aria-invalid={!!errors.ctc} {...register("ctc")} />
      </FormField>
      <label className="flex min-h-11 items-center gap-3">
        <input type="checkbox" className="accent-maroon-600 size-5" />
        Share an anonymised result with future cohorts
      </label>
      <PlacedNotes />
      <Button type="submit">Save my result</Button>
    </form>
  );
}
