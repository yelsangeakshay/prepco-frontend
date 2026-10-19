import { Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export type RunwayStatus = "done" | "next" | "locked" | "pick-slot" | "day0";

export interface RunwayStep {
  id: string;
  week: string;
  title: string;
  when?: string;
  status: RunwayStatus;
}

interface Props {
  steps: RunwayStep[];
  /** `auto` = horizontal from md up, vertical on phones. */
  orientation?: "auto" | "horizontal" | "vertical";
  onPickSlot?: (stepId: string) => void;
}

function Marker({ status }: { status: RunwayStatus }) {
  const base =
    "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold";
  switch (status) {
    case "done":
      return (
        <span className={cn(base, "border-green-600 bg-green-600 text-white")}>
          <Check className="size-4" aria-hidden />
        </span>
      );
    case "next":
      return <span className={cn(base, "border-maroon-600 bg-maroon-600 text-white")}>•</span>;
    case "pick-slot":
      return <span className={cn(base, "border-maroon-600 text-maroon-600 bg-white")}>?</span>;
    case "day0":
      return <span className={cn(base, "border-gold-500 bg-gold-500 text-navy-900")}>0</span>;
    default:
      return (
        <span className={cn(base, "border-line text-navy-400 bg-white")}>
          <Lock className="size-3.5" aria-hidden />
        </span>
      );
  }
}

const STATUS_LABEL: Record<RunwayStatus, string> = {
  done: "Done",
  next: "Next",
  locked: "Locked",
  "pick-slot": "Pick a slot",
  day0: "Day 0",
};

function StepBody({ step, onPickSlot }: { step: RunwayStep; onPickSlot?: Props["onPickSlot"] }) {
  return (
    <>
      <p className="text-navy-400 text-xs font-semibold tracking-wider uppercase">{step.week}</p>
      <p className={cn("text-sm font-semibold", step.status === "locked" && "text-navy-400")}>
        {step.title}
      </p>
      {step.when && <p className="text-navy-400 text-xs">{step.when}</p>}
      <span className="sr-only">{STATUS_LABEL[step.status]}</span>
      {step.status === "pick-slot" && (
        <Button size="sm" className="mt-2" onClick={() => onPickSlot?.(step.id)}>
          Pick A Slot
        </Button>
      )}
    </>
  );
}

export function RunwayTimeline({ steps, orientation = "auto", onPickSlot }: Props) {
  const horizontal = orientation !== "vertical";
  const vertical = orientation !== "horizontal";
  return (
    <div>
      {horizontal && (
        <ol
          className={cn(
            "auto-cols-fr grid-flow-col gap-2",
            orientation === "auto" ? "hidden md:grid" : "grid",
          )}
        >
          {steps.map((step, i) => (
            <li key={step.id} aria-current={step.status === "next" ? "step" : undefined}>
              <div className="mb-3 flex items-center">
                <Marker status={step.status} />
                {i < steps.length - 1 && (
                  <span
                    className={cn(
                      "mx-1 h-0.5 flex-1",
                      step.status === "done" ? "bg-green-600" : "bg-line",
                    )}
                  />
                )}
              </div>
              <StepBody step={step} onPickSlot={onPickSlot} />
            </li>
          ))}
        </ol>
      )}
      {vertical && (
        <ol className={cn(orientation === "auto" && "md:hidden")}>
          {steps.map((step, i) => (
            <li
              key={step.id}
              aria-current={step.status === "next" ? "step" : undefined}
              className="flex gap-3"
            >
              <div className="flex flex-col items-center">
                <Marker status={step.status} />
                {i < steps.length - 1 && (
                  <span
                    className={cn(
                      "my-1 w-0.5 flex-1",
                      step.status === "done" ? "bg-green-600" : "bg-line",
                    )}
                  />
                )}
              </div>
              <div className="pb-5">
                <StepBody step={step} onPickSlot={onPickSlot} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
