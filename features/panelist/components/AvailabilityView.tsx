"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { ApiError } from "@/lib/api/client";
import { notify } from "@/lib/utils/notify";
import {
  AvailabilityGrid,
  type AvailabilityValue,
} from "../availability/components/AvailabilityGrid";
import { useAvailability, useSaveAvailability } from "../hooks/usePanelist";

function Editor({ initial, booked }: { initial: AvailabilityValue; booked: string[] }) {
  const [value, setValue] = useState<AvailabilityValue>(initial);
  const save = useSaveAvailability();
  const err = save.error instanceof ApiError ? save.error : null;
  const open = Object.values(value).filter(Boolean).length;
  const dirty =
    JSON.stringify(
      Object.entries(value)
        .filter(([, v]) => v)
        .sort(),
    ) !==
    JSON.stringify(
      Object.entries(initial)
        .filter(([, v]) => v)
        .sort(),
    );

  return (
    <Card variant="feature" className="space-y-4">
      <AvailabilityGrid value={value} onChange={setValue} booked={booked} />
      <p className="text-navy-400 text-sm" aria-live="polite">
        <span data-testid="open-count">{open}</span> open slots a week. Booked slots cannot be
        switched off.
      </p>
      {save.isError && (
        <p role="alert" className="text-maroon-600 text-sm">
          {err?.message ?? "We could not save. Please try again."}
        </p>
      )}
      <Button
        disabled={!dirty || save.isPending}
        onClick={() =>
          save.mutate(value, {
            onSuccess: () => notify("Availability saved"),
          })
        }
      >
        {save.isPending ? "Saving…" : "Save Availability"}
      </Button>
    </Card>
  );
}

/** P5 availability. */
export function AvailabilityView() {
  const { data, isLoading, isError, refetch } = useAvailability();
  if (isLoading) return <PageSkeleton />;
  if (isError || !data) return <ErrorCard onRetry={() => refetch()} />;
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Availability</h1>
        <p className="text-navy-400 text-sm">
          Pick the evening slots (IST) you can run a panel. The pattern repeats every week.
        </p>
      </div>
      <Editor
        key={JSON.stringify(data.slots) + data.booked.join()}
        initial={data.slots}
        booked={data.booked}
      />
    </div>
  );
}
