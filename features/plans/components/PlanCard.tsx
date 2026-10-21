import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { formatINR } from "@/lib/utils/currency";
import type { Plan } from "../schemas";

type Props = Pick<Plan, "name" | "price" | "tagline" | "features"> &
  Partial<
    Pick<Plan, "listPrice" | "badge" | "suggested" | "coverage" | "inherits" | "note" | "topUp">
  > & {
    mostChosen?: boolean;
    elite?: boolean;
    selected?: boolean;
    disabled?: boolean;
    ctaLabel?: string;
    onSelect?: () => void;
  };

/** Runway coverage bar: one segment per runway step, filled for the steps the plan covers. */
function Coverage({ done, total, caption }: NonNullable<Props["coverage"]>) {
  return (
    <div className="mt-4">
      <div className="flex gap-1" role="img" aria-label={`Covers ${done} of ${total} runway steps`}>
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn("h-1.5 flex-1 rounded-full", i < done ? "bg-maroon-600" : "bg-line")}
          />
        ))}
      </div>
      <p className="mt-1.5 text-xs opacity-70">{caption}</p>
    </div>
  );
}

export function PlanCard({
  name,
  price,
  listPrice,
  badge,
  suggested,
  tagline,
  coverage,
  inherits,
  features,
  note,
  topUp,
  mostChosen,
  elite,
  selected,
  disabled,
  ctaLabel = "Choose Plan",
  onSelect,
}: Props) {
  return (
    <section
      aria-label={`${name} plan`}
      className={cn(
        "rounded-card relative flex h-full flex-col border p-6",
        elite ? "bg-navy-900 border-navy-900 text-white" : "border-line bg-white",
        mostChosen && !elite && "border-maroon-600 border-2",
        selected && "ring-gold-500 ring-2",
      )}
    >
      {suggested && (
        <p className="text-maroon-600 mb-2 text-[11px] font-bold tracking-[0.12em] uppercase">
          Suggested from your free session
        </p>
      )}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-2xl font-bold">{name}</h3>
        {(badge || mostChosen || elite) && (
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wider whitespace-nowrap uppercase",
              elite
                ? "bg-gold-500 text-navy-900"
                : mostChosen
                  ? "bg-maroon-600 text-white"
                  : "bg-gold-500/15 text-[#7a5c14]",
            )}
          >
            {badge ?? (elite ? "Elite" : "Most chosen")}
          </span>
        )}
      </div>
      {tagline && (
        <p className={cn("mt-2 text-sm", elite ? "opacity-80" : "text-navy-400")}>{tagline}</p>
      )}
      <p className="mt-4 flex items-baseline gap-2">
        <span className="font-display text-4xl font-bold">{formatINR(price)}</span>
        {listPrice && (
          <s className="text-sm opacity-60">
            <span className="sr-only">List price </span>
            {formatINR(listPrice)}
          </s>
        )}
      </p>
      {coverage && <Coverage {...coverage} />}
      {inherits && (
        <p className="mt-5 text-xs font-bold tracking-[0.12em] uppercase opacity-70">
          Everything in {inherits}, plus
        </p>
      )}
      <ul className={cn("flex-1 space-y-2 text-sm", inherits ? "mt-3" : "mt-5")}>
        {features.map((f) => {
          const item = f;
          return (
            <li key={item.text} className={cn("flex gap-2", !item.included && "opacity-60")}>
              {item.included ? (
                <Check
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    elite ? "text-gold-500" : "text-green-600",
                  )}
                  aria-label="Included"
                />
              ) : (
                <X className="mt-0.5 size-4 shrink-0" aria-label="Not included" />
              )}
              {item.text}
            </li>
          );
        })}
      </ul>
      {note && <p className="mt-4 text-xs opacity-80">{note}</p>}
      {topUp && (
        <p className="mt-4 border-t border-current/15 pt-3 text-xs opacity-80">
          Top-up mock · {formatINR(topUp)}
        </p>
      )}
      <Button
        className="mt-5 w-full"
        variant={mostChosen || elite ? "primary" : "secondary"}
        disabled={disabled}
        onClick={onSelect}
      >
        {ctaLabel}
      </Button>
    </section>
  );
}
