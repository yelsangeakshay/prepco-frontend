"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@/lib/forms/zodResolver";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FieldError, Label, Textarea } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils/cn";

export const DIMENSIONS = ["Structure", "Defensibility", "Composure"] as const;
export const VERDICTS = ["Ready", "Almost There", "Needs Work"] as const;

export const scoringSchema = z.object({
  scores: z.object({
    Structure: z.number().min(1, "Score every dimension").max(5),
    Defensibility: z.number().min(1, "Score every dimension").max(5),
    Composure: z.number().min(1, "Score every dimension").max(5),
  }),
  verdict: z.enum(VERDICTS, { message: "Pick a verdict" }),
  note: z.string().trim().min(20, "Write at least 20 characters of feedback"),
  sendBack: z.boolean(),
});
export type ScoringValues = z.infer<typeof scoringSchema>;

interface Props {
  defaultValues?: Partial<ScoringValues>;
  submitting?: boolean;
  onSubmit: (values: ScoringValues) => void;
}

export function ScoringForm({ defaultValues, submitting, onSubmit }: Props) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScoringValues>({
    resolver: zodResolver(scoringSchema),
    defaultValues: {
      scores: { Structure: 0, Defensibility: 0, Composure: 0 },
      sendBack: false,
      note: "",
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {DIMENSIONS.map((d) => (
        <Controller
          key={d}
          control={control}
          name={`scores.${d}`}
          render={({ field }) => (
            <fieldset>
              <legend className="mb-1 text-sm font-medium">{d}</legend>
              <div role="radiogroup" aria-label={d} className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={field.value === n}
                    aria-label={`${d} ${n} of 5`}
                    onClick={() => field.onChange(n)}
                    className={cn(
                      "rounded-control size-11 border text-sm font-semibold",
                      field.value === n
                        ? "border-maroon-600 bg-maroon-600 text-white"
                        : "border-line bg-white",
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <FieldError>{errors.scores?.[d]?.message}</FieldError>
            </fieldset>
          )}
        />
      ))}

      <Controller
        control={control}
        name="verdict"
        render={({ field }) => (
          <fieldset>
            <legend className="mb-1 text-sm font-medium">Verdict</legend>
            <div role="radiogroup" aria-label="Verdict" className="flex flex-wrap gap-2">
              {VERDICTS.map((v) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={field.value === v}
                  onClick={() => field.onChange(v)}
                  className={cn(
                    "rounded-control min-h-11 border px-4 text-sm font-semibold",
                    field.value === v
                      ? "border-maroon-600 bg-maroon-100 text-maroon-600"
                      : "border-line bg-white",
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
            <FieldError>{errors.verdict?.message}</FieldError>
          </fieldset>
        )}
      />

      <div>
        <Label htmlFor="note">Feedback note</Label>
        <Textarea id="note" rows={5} aria-invalid={!!errors.note} {...register("note")} />
        <FieldError>{errors.note?.message}</FieldError>
      </div>

      <Controller
        control={control}
        name="sendBack"
        render={({ field }) => (
          <div className="flex items-center justify-between gap-3">
            <div>
              <Label htmlFor="sendBack" className="mb-0">
                Send back to builder
              </Label>
              <p className="text-navy-400 text-xs">
                Asks the student to rework their CV or answers.
              </p>
            </div>
            <Switch
              id="sendBack"
              label="Send back to builder"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </div>
        )}
      />

      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? "Sending…" : "Send Feedback"}
      </Button>
    </form>
  );
}
