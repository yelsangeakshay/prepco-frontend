"use client";

import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/shared/Skeletons";
import { cn } from "@/lib/utils/cn";

export interface Slot {
  id: string;
  /** e.g. "Wed 7 Oct · 7:00 PM IST" */
  label: string;
  taken?: boolean;
}

interface Props {
  slots: Slot[];
  loading?: boolean;
  /** Shown after a booking attempt failed with "slot taken". */
  slotTakenError?: boolean;
  confirming?: boolean;
  onConfirm: (slotId: string) => void;
}

/** Radio group: arrow keys move, Space selects, Enter on the button confirms. Never optimistic. */
export function SlotPicker({ slots, loading, slotTakenError, confirming, onConfirm }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const groupId = useId();

  if (loading) {
    return (
      <div role="status" aria-label="Loading slots" className="grid gap-2 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    );
  }
  if (slots.length === 0) {
    return (
      <EmptyState
        title="No slots open"
        body="New slots are released every Monday. Check back soon."
      />
    );
  }

  const enabled = slots.map((s, i) => ({ s, i })).filter(({ s }) => !s.taken);
  const focusable = selected ?? enabled[0]?.s.id;

  const move = (from: number, delta: number) => {
    const pos = enabled.findIndex((e) => e.i === from);
    const next = enabled[(pos + delta + enabled.length) % enabled.length];
    if (!next) return;
    setSelected(next.s.id);
    refs.current[next.i]?.focus();
  };

  return (
    <div>
      {slotTakenError && (
        <p role="alert" className="bg-maroon-100 text-maroon-600 rounded-control mb-3 p-3 text-sm">
          That slot was just taken. Please pick another.
        </p>
      )}
      <div role="radiogroup" aria-labelledby={groupId} className="grid gap-2 sm:grid-cols-2">
        <span id={groupId} className="sr-only">
          Available slots
        </span>
        {slots.map((s, i) => {
          const checked = selected === s.id;
          return (
            <button
              key={s.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              disabled={s.taken}
              tabIndex={s.id === focusable ? 0 : -1}
              onClick={() => setSelected(s.id)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                  e.preventDefault();
                  move(i, 1);
                } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  move(i, -1);
                }
              }}
              className={cn(
                "rounded-control min-h-12 border px-4 text-left text-sm font-medium",
                checked
                  ? "border-maroon-600 bg-maroon-100 text-maroon-600"
                  : "border-line bg-white",
                s.taken && "text-navy-400 line-through",
              )}
            >
              {s.label}
              {s.taken && <span className="sr-only"> (taken)</span>}
            </button>
          );
        })}
      </div>
      <Button
        className="mt-4 w-full sm:w-auto"
        disabled={!selected || confirming}
        onClick={() => selected && onConfirm(selected)}
      >
        {confirming ? "Booking…" : "Confirm Slot"}
      </Button>
    </div>
  );
}
