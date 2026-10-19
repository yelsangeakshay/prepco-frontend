"use client";

import { cn } from "@/lib/utils/cn";

export interface AvailabilityValue {
  /** Keys like "Mon-18:00". */
  [slot: string]: boolean;
}

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const HOURS = ["18:00", "19:00", "20:00"] as const;

interface Props {
  value: AvailabilityValue;
  onChange: (next: AvailabilityValue) => void;
  /** Slots already booked: shown, not editable. */
  booked?: string[];
}

/** Evening panel slots (6 to 9 PM IST). Each cell is a toggle button, so Tab/Space/Enter work. */
export function AvailabilityGrid({ value, onChange, booked = [] }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-separate border-spacing-1 text-sm">
        <caption className="sr-only">Weekly availability, evening slots in IST</caption>
        <thead>
          <tr>
            <th scope="col" className="w-16" />
            {DAYS.map((d) => (
              <th key={d} scope="col" className="text-navy-400 text-xs font-semibold uppercase">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HOURS.map((h) => (
            <tr key={h}>
              <th scope="row" className="text-navy-400 text-right text-xs font-medium">
                {h}
              </th>
              {DAYS.map((d) => {
                const key = `${d}-${h}`;
                const isBooked = booked.includes(key);
                const on = !!value[key];
                return (
                  <td key={key}>
                    <button
                      type="button"
                      aria-pressed={on || isBooked}
                      aria-label={`${d} ${h}${isBooked ? ", booked" : ""}`}
                      disabled={isBooked}
                      onClick={() => onChange({ ...value, [key]: !on })}
                      className={cn(
                        "rounded-control h-11 w-full border text-xs font-semibold",
                        isBooked
                          ? "border-navy-900 bg-navy-900 text-white"
                          : on
                            ? "border-maroon-600 bg-maroon-600 text-white"
                            : "border-line bg-white",
                      )}
                    >
                      {isBooked ? "Booked" : on ? "Open" : ""}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
