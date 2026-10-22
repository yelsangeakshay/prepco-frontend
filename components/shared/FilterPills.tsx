import { cn } from "@/lib/utils/cn";

export interface FilterPill {
  key: string;
  label: string;
  /** Shown after the label, e.g. a count. */
  count?: number | string;
}

interface Props {
  label: string;
  pills: readonly FilterPill[];
  active: string;
  onSelect: (key: string) => void;
  className?: string;
}

/** Round filter chips (a02, a04): the active one is filled maroon, the others are white. */
export function FilterPills({ label, pills, active, onSelect, className }: Props) {
  return (
    <div role="tablist" aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
      {pills.map((p) => {
        const on = p.key === active;
        return (
          <button
            key={p.key}
            role="tab"
            type="button"
            aria-selected={on}
            onClick={() => onSelect(p.key)}
            className={cn(
              "min-h-11 rounded-full border px-4 text-sm font-semibold",
              on ? "border-maroon-600 bg-maroon-600 text-white" : "border-line bg-white",
            )}
          >
            {p.label}
            {p.count !== undefined && <span className="ml-1.5 opacity-80">{p.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
