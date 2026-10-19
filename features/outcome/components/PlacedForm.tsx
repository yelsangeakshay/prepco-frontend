"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/forms/zodResolver";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";

const placedForm = z.object({
  company: z.string().trim().min(2, "Enter the company"),
  role: z.string().trim().min(2, "Enter the role"),
  ctc: z.coerce.number({ message: "Enter the CTC in ₹" }).positive("Enter the CTC in ₹"),
});
type PlacedValues = z.input<typeof placedForm>;

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
    <form noValidate className="space-y-4" onSubmit={handleSubmit(onDone)}>
      <FormField id="company" label="Company" error={errors.company?.message}>
        <Input id="company" aria-invalid={!!errors.company} {...register("company")} />
      </FormField>
      <FormField id="role" label="Role" error={errors.role?.message}>
        <Input id="role" aria-invalid={!!errors.role} {...register("role")} />
      </FormField>
      <FormField id="ctc" label="Annual CTC (₹)" error={errors.ctc?.message}>
        <Input id="ctc" inputMode="numeric" aria-invalid={!!errors.ctc} {...register("ctc")} />
      </FormField>
      <Button type="submit" className="w-full">
        Save Outcome
      </Button>
    </form>
  );
}
