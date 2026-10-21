"use client";

import { cn } from "@/lib/utils/cn";

export interface AvailabilityValue {
  /** Keys like "Mon-18:00". */
  [slot: string]: boolean;
}

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const HOURS = ["18:00", "19:00", "20:00", "21:00"] as const;

/** A panel already booked into the grid. */
export interface BookedPanel {
  key: string;
  startsAt: string;
  /** "P2", "P1" or "Deep-dive". */
  kind: string;
  /** "Aditya R." */
  student: string;
}

interface Props {
  value: AvailabilityValue;
  onChange: (next: AvailabilityValue) => void;
  /** Slots already booked: shown, not editable. */
  booked?: string[];
  /** Panels with their dates. With `weekStart` they show their student in that week's cell. */
  panels?: BookedPanel[];
  /** Monday of the week shown, as a UTC date. Adds the date to each day heading. */
  weekStart?: Date;
}

/** "18:00" is written "6:00 PM". */
const hourLabel = (h: string) => {
  const n = Number(h.slice(0, 2));
  return `${n % 12 || 12}:00 ${n < 12 ? "AM" : "PM"}`;
};

const istDate = (iso: string) =>
  new Date(new Date(iso).getTime() + 5.5 * 3_600_000).toISOString().slice(0, 10);

/** Evening panel slots (6 to 9 PM IST). Each cell is a toggle button, so Tab/Space/Enter work. */
export function AvailabilityGrid({ value, onChange, booked = [], panels = [], weekStart }: Props) {
  const dates = DAYS.map((_, i) =>
    weekStart ? new Date(weekStart.getTime() + i * 86_400_000) : null,
  );
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] table-fixed border-separate border-spacing-1.5 text-sm">
        <caption className="sr-only">Weekly availability, evening slots in IST</caption>
        <thead>
          <tr>
            <th scope="col" className="w-20" />
            {DAYS.map((d, i) => (
              <th key={d} scope="col" className="py-2 text-sm font-semibold">
                {d}
                {dates[i] && ` ${dates[i]!.getUTCDate()}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HOURS.map((h) => (
            <tr key={h}>
              <th scope="row" className="text-navy-400 pr-2 text-left text-sm font-medium">
                {hourLabel(h)}
              </th>
              {DAYS.map((d, i) => {
                const key = `${d}-${h}`;
                const isBooked = booked.includes(key);
                const on = !!value[key];
                const day = dates[i] ? dates[i]!.toISOString().slice(0, 10) : null;
                const panel = isBooked
                  ? panels.find((p) => p.key === key && (!day || istDate(p.startsAt) === day))
                  : undefined;
                const shownBooked = isBooked && (!weekStart || !!panel);
                const label = panel ? `${panel.kind} ${panel.student}` : null;
                return (
                  <td key={key}>
                    <button
                      type="button"
                      aria-pressed={on || isBooked}
                      aria-label={`${d} ${h}${
                        shownBooked ? `, booked${label ? `: ${label}` : ""}` : on ? ", open" : ""
                      }`}
                      disabled={isBooked}
                      onClick={() => onChange({ ...value, [key]: !on })}
                      className={cn(
                        "rounded-control h-[52px] w-full border px-3 text-left text-xs font-semibold",
                        shownBooked
                          ? "border-maroon-600 bg-maroon-600 text-white"
                          : on
                            ? "border-green-600/40 bg-green-100 text-green-600"
                            : "border-line border-dashed bg-white",
                      )}
                    >
                      {shownBooked ? (
                        label ? (
                          <>
                            <span className="block font-bold">{panel!.kind}</span>{" "}
                            <span className="block font-normal">{panel!.student}</span>
                          </>
                        ) : (
                          "Booked"
                        )
                      ) : on ? (
                        "Open"
                      ) : (
                        ""
                      )}
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
