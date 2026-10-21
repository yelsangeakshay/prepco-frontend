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

const STATUS_LABEL: Record<RunwayStatus, string> = {
  done: "Done",
  next: "Next",
  locked: "Locked",
  "pick-slot": "Pick a slot",
  day0: "Day 0",
};

const pill =
  "inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wider whitespace-nowrap uppercase";

/** Round node: filled maroon (done), gold ring (next), grey ring (not yet), navy (Day 0). */
function Node({ status }: { status: RunwayStatus }) {
  const base = "size-[18px] shrink-0 rounded-full border-2";
  switch (status) {
    case "done":
      return <span aria-hidden className={cn(base, "border-maroon-600 bg-maroon-600")} />;
    case "next":
      return (
        <span
          aria-hidden
          className={cn(base, "border-gold-500 ring-gold-300/40 bg-white ring-4")}
        />
      );
    case "day0":
      return <span aria-hidden className={cn(base, "border-navy-900 bg-navy-900")} />;
    default:
      return <span aria-hidden className={cn(base, "border-line bg-white")} />;
  }
}

function Label({ step, onPickSlot }: { step: RunwayStep; onPickSlot?: Props["onPickSlot"] }) {
  return (
    <>
      <p className="text-navy-400 text-xs font-semibold tracking-[0.12em] uppercase">{step.week}</p>
      <p className="mt-1 text-[15px] leading-snug font-semibold">{step.title}</p>
      <div className="mt-2">
        {step.status === "done" && (
          <span className={cn(pill, "bg-green-100 text-green-600")}>Done</span>
        )}
        {step.status === "next" && (
          <span className={cn(pill, "bg-gold-500/15 text-[#7a5c14]")}>{step.when ?? "Next"}</span>
        )}
        {step.status === "pick-slot" && (
          <button
            type="button"
            onClick={() => onPickSlot?.(step.id)}
            className={cn(pill, "bg-maroon-100 text-maroon-600 min-h-11 cursor-pointer md:min-h-0")}
          >
            Pick a slot
          </button>
        )}
        {(step.status === "locked" || step.status === "day0") && step.when && (
          <span className="text-navy-400 text-sm">{step.when}</span>
        )}
      </div>
      <span className="sr-only">{STATUS_LABEL[step.status]}</span>
    </>
  );
}

function segment(step: RunwayStep, nextStep: RunwayStep | undefined) {
  if (step.status !== "done") return "bg-line";
  return nextStep?.status === "next"
    ? "bg-gradient-to-r from-[var(--maroon-600)] to-[var(--gold-500)]"
    : "bg-maroon-600";
}

export function RunwayTimeline({ steps, orientation = "auto", onPickSlot }: Props) {
  const horizontal = orientation !== "vertical";
  const vertical = orientation !== "horizontal";
  return (
    <div>
      {horizontal && (
        <ol
          className={cn(
            "auto-cols-fr grid-flow-col gap-x-3",
            orientation === "auto" ? "hidden md:grid" : "grid",
          )}
        >
          {steps.map((step, i) => (
            <li key={step.id} aria-current={step.status === "next" ? "step" : undefined}>
              <div className="mb-4 flex h-[18px] items-center">
                <Node status={step.status} />
                {i < steps.length - 1 && (
                  <span className={cn("mx-1 h-0.5 flex-1", segment(step, steps[i + 1]))} />
                )}
              </div>
              <Label step={step} onPickSlot={onPickSlot} />
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
                <Node status={step.status} />
                {i < steps.length - 1 && (
                  <span
                    className={cn(
                      "my-1 w-0.5 flex-1",
                      step.status === "done" ? "bg-maroon-600" : "bg-line",
                    )}
                  />
                )}
              </div>
              <div className="pb-5">
                <Label step={step} onPickSlot={onPickSlot} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
