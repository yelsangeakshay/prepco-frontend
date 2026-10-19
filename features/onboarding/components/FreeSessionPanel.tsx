"use client";

import Link from "next/link";
import { CalendarCheck, CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { SlotPicker } from "@/features/runway/components/SlotPicker";
import { useBookSession } from "@/features/runway/hooks/useRunway";
import { ApiError } from "@/lib/api/client";
import { ROUTES } from "@/lib/config/routes";
import { formatSession } from "@/lib/utils/dates";
import { useFreeSession } from "../hooks/useOnboarding";

/** S3 (pick a slot) and E12 (free session already used). */
export function FreeSessionPanel() {
  const { data, isPending, isError, refetch } = useFreeSession();
  const book = useBookSession("free");

  if (isPending) return <PageSkeleton />;
  if (isError || !data) return <ErrorCard onRetry={() => refetch()} />;

  const wrap = (children: React.ReactNode) => (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <h1 className="font-display text-3xl font-bold">Your free session</h1>
      <div className="mt-6">{children}</div>
    </div>
  );

  if (book.isSuccess) {
    return wrap(
      <Card variant="feature" className="text-center">
        <CalendarCheck className="mx-auto size-10 text-green-600" aria-hidden />
        <h2 className="font-display mt-3 text-2xl font-bold">You are booked</h2>
        <p className="text-navy-400 mt-1 text-sm">
          {book.data.startsAt ? formatSession(book.data.startsAt) : ""}
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href={ROUTES.student.plans}>See Plans</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={ROUTES.student.home}>Go To Home</Link>
          </Button>
        </div>
      </Card>,
    );
  }

  if (!data.eligible) {
    return wrap(
      <Card variant="feature" className="text-center">
        <CalendarX className="text-navy-400 mx-auto size-10" aria-hidden />
        <h2 className="font-display mt-3 text-2xl font-bold">Free session already used</h2>
        <p className="text-navy-400 mt-1 text-sm">
          You took your free session{data.usedAt ? ` on ${formatSession(data.usedAt)}` : ""}. Pick a
          plan to keep going.
        </p>
        <Button asChild className="mt-5">
          <Link href={ROUTES.student.plans}>See Plans</Link>
        </Button>
      </Card>,
    );
  }

  const slotTaken = book.error instanceof ApiError && book.error.code === "slot_taken";

  return wrap(
    <>
      <p className="text-navy-400 mb-4 text-sm">
        A 30-minute call to understand your goals. Pick an evening slot (IST).
      </p>
      <SlotPicker
        slots={data.slots}
        slotTakenError={slotTaken}
        confirming={book.isPending}
        onConfirm={(id) => book.mutate(id, { onError: () => refetch() })}
      />
      {book.isError && !slotTaken && (
        <p role="alert" className="text-maroon-600 mt-3 text-sm">
          Booking failed. Please try again.
        </p>
      )}
    </>,
  );
}
