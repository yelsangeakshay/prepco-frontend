"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { ApiError } from "@/lib/api/client";
import { now } from "@/lib/utils/clock";
import { formatDay, formatTime } from "@/lib/utils/dates";
import { notify } from "@/lib/utils/notify";
import { sessionLabel } from "./TodayView";
import {
  AvailabilityGrid,
  type AvailabilityValue,
} from "../availability/components/AvailabilityGrid";
import { useAvailability, useSaveAvailability } from "../hooks/usePanelist";
import type { Availability } from "../schemas";
import { statusTone } from "@/lib/status";

const STATUS_TONE = {
  Upcoming: statusTone("Upcoming"),
  Tonight: statusTone("Tonight"),
  "Feedback due": statusTone("Feedback due"),
  "Feedback sent": statusTone("Feedback sent"),
} as const;

/** Monday of today's week as a UTC date. */
function thisMonday() {
  const t = now();
  const ist = new Date(t.getTime() + 5.5 * 3_600_000);
  const back = (ist.getUTCDay() + 6) % 7;
  return Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate() - back);
}

function Editor({ data }: { data: Availability }) {
  const initial: AvailabilityValue = data.slots;
  const [value, setValue] = useState<AvailabilityValue>(initial);
  const [week, setWeek] = useState(0);
  const save = useSaveAvailability();
  const err = save.error instanceof ApiError ? save.error : null;
  const open = Object.values(value).filter(Boolean).length;
  const openKeys = (v: AvailabilityValue) =>
    JSON.stringify(
      Object.entries(v)
        .filter(([, x]) => x)
        .sort(),
    );
  const dirty = openKeys(value) !== openKeys(initial);
  const weekStart = new Date(thisMonday() + week * 7 * 86_400_000);

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-maroon-600 text-[13px] font-semibold tracking-[0.16em] uppercase">
            Availability
          </p>
          <h1 className="font-display text-3xl leading-tight font-bold md:text-[44px]">
            Week of {formatDay(weekStart).split(" ").slice(1).join(" ")}
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" disabled={week <= 0} onClick={() => setWeek(week - 1)}>
            ← Previous week
          </Button>
          <Button variant="secondary" onClick={() => setWeek(week + 1)}>
            Next week →
          </Button>
          <Button
            disabled={!dirty || save.isPending}
            onClick={() =>
              save.mutate(value, {
                onSuccess: () => notify("Availability saved"),
              })
            }
          >
            {save.isPending ? "Saving…" : "Save availability"}
          </Button>
        </div>
      </header>

      <Card variant="feature" className="space-y-4 p-4 md:p-8">
        <AvailabilityGrid
          value={value}
          onChange={setValue}
          booked={data.booked}
          panels={data.bookedPanels}
          weekStart={weekStart}
        />
        <div className="text-navy-400 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <span className="flex items-center gap-2">
            <Badge tone="maroon">Booked</Badge>
          </span>
          <span className="flex items-center gap-2">
            <Badge tone="green">Open</Badge> students can book
          </span>
          <span className="flex items-center gap-2">
            <Badge tone="neutral">Empty</Badge> tap to open a slot
          </span>
        </div>
        <p className="text-navy-400 text-sm" aria-live="polite">
          <span data-testid="open-count">{open}</span> open slots a week. Booked slots cannot be
          switched off. The pattern repeats every week.
        </p>
        {save.isError && (
          <p role="alert" className="text-maroon-600 text-sm">
            {err?.message ?? "We could not save. Please try again."}
          </p>
        )}
      </Card>

      <Card variant="feature" className="p-4 md:p-8">
        <h2 className="font-display text-2xl font-bold">Recent and upcoming</h2>
        <div
          className="mt-4 overflow-x-auto"
          tabIndex={0}
          role="region"
          aria-label="Recent and upcoming panels"
        >
          <table className="w-full min-w-[560px] text-left">
            <caption className="sr-only">Recent and upcoming panels</caption>
            <thead>
              <tr className="text-navy-400 text-xs font-semibold tracking-[0.14em] uppercase">
                {["Date", "Student", "Session", "Status"].map((h) => (
                  <th key={h} scope="col" className="px-3 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.panels.map((p) => (
                <tr key={p.sessionId} className="border-line border-t">
                  <td className="px-3 py-4 whitespace-nowrap">
                    {formatDay(p.startsAt)} · {formatTime(p.startsAt)}
                  </td>
                  <td className="px-3 py-4">{p.student}</td>
                  <td className="px-3 py-4">{sessionLabel(p.session)}</td>
                  <td className="px-3 py-4">
                    <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

/** P5 availability (p05). */
export function AvailabilityView() {
  const { data, isPending, isError, refetch } = useAvailability();
  if (isPending) return <PageSkeleton />;
  if (isError || !data) return <ErrorCard onRetry={() => refetch()} />;
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <Editor key={JSON.stringify(data.slots) + data.booked.join()} data={data} />
    </div>
  );
}
