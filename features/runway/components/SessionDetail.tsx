"use client";

import { useState } from "react";
import Link from "next/link";
import { notify } from "@/lib/utils/notify";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { ProposedBadge } from "@/components/shared/Badges";
import { ApiError } from "@/lib/api/client";
import { ROUTES } from "@/lib/config/routes";
import { formatSession } from "@/lib/utils/dates";
import {
  useBookSession,
  useCancelSession,
  useRescheduleSession,
  useSession,
  useSessionSlots,
} from "../hooks/useRunway";
import { SessionStatusBadge } from "./SessionStatusBadge";
import { SlotPicker } from "./SlotPicker";

/** E6: booked / moved / cancelled / missed, with book, reschedule and cancel. */
export function SessionDetail({ id }: { id: string }) {
  const session = useSession(id);
  const book = useBookSession(id);
  const reschedule = useRescheduleSession(id);
  const cancel = useCancelSession(id);
  const [picking, setPicking] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const s = session.data;
  const needsSlot = !!s && ["unbooked", "cancelled", "no-show"].includes(s.status);
  const slots = useSessionSlots(id, needsSlot || picking);

  if (session.isLoading) return <PageSkeleton />;
  if (session.isError || !s) {
    const notFound = session.error instanceof ApiError && session.error.status === 404;
    return (
      <ErrorCard
        title={notFound ? "Session not found" : undefined}
        message={notFound ? "That session does not exist." : undefined}
        onRetry={notFound ? undefined : () => session.refetch()}
      />
    );
  }

  const mutation = needsSlot ? book : reschedule;
  const slotTaken = mutation.error instanceof ApiError && mutation.error.code === "slot_taken";
  const onConfirm = (slotId: string) =>
    mutation.mutate(slotId, {
      onSuccess: () => {
        setPicking(false);
        notify(needsSlot ? "Session booked" : "Session moved");
      },
      onError: () => slots.refetch(),
    });

  const booked = s.status === "upcoming" || s.status === "rescheduled";

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-8">
      <Link
        href={ROUTES.student.sessions}
        className="text-maroon-600 text-sm font-semibold underline"
      >
        All sessions
      </Link>
      <Card variant="feature">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-navy-400 text-xs font-semibold tracking-wider uppercase">{s.week}</p>
            <h1 className="font-display text-2xl font-bold">{s.title}</h1>
          </div>
          <SessionStatusBadge status={s.status} />
        </div>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-navy-400">When</dt>
            <dd className="font-semibold">
              {s.startsAt ? formatSession(s.startsAt) : "Not booked yet"}
            </dd>
          </div>
          {s.previousStartsAt && (
            <div className="flex justify-between gap-4">
              <dt className="text-navy-400">Was</dt>
              <dd className="line-through">{formatSession(s.previousStartsAt)}</dd>
            </div>
          )}
          {s.panelist && (
            <div className="flex justify-between gap-4">
              <dt className="text-navy-400">With</dt>
              <dd className="font-semibold">
                {s.panelist}
                {s.panelFunction ? ` · ${s.panelFunction}` : ""}
              </dd>
            </div>
          )}
        </dl>

        {s.note && (
          <p role="status" className="bg-cream-soft rounded-card mt-4 p-3 text-sm">
            {s.note}
          </p>
        )}

        {s.status === "locked" && (
          <p className="text-navy-400 mt-4 text-sm">
            This session unlocks once your earlier sessions are done.
          </p>
        )}

        {s.status === "completed" && s.feedbackId && (
          <Button asChild className="mt-4">
            <Link href={ROUTES.student.feedbackPanel(s.feedbackId)}>Read Panel Feedback</Link>
          </Button>
        )}

        {booked && !picking && (
          <div className="mt-5 space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="secondary" onClick={() => setPicking(true)}>
                Reschedule
              </Button>
              <Button variant="ghost" onClick={() => setConfirmCancel(true)}>
                Cancel Session
              </Button>
            </div>
            {s.freeRescheduleUntil && (
              <p className="text-navy-400 flex items-center gap-2 text-xs">
                <ProposedBadge /> Free to reschedule until {formatSession(s.freeRescheduleUntil)}.
              </p>
            )}
          </div>
        )}

        {confirmCancel && (
          <div
            role="alertdialog"
            aria-label="Confirm cancel"
            className="bg-maroon-100 rounded-card mt-4 p-4 text-sm"
          >
            <p className="font-semibold">Cancel this session?</p>
            <p className="text-navy-400">Your credit is kept and you can rebook.</p>
            <div className="mt-3 flex gap-2">
              <Button
                disabled={cancel.isPending}
                onClick={() =>
                  cancel.mutate(undefined, {
                    onSuccess: () => {
                      setConfirmCancel(false);
                      notify("Session cancelled");
                    },
                  })
                }
              >
                {cancel.isPending ? "Cancelling…" : "Yes, Cancel"}
              </Button>
              <Button variant="secondary" onClick={() => setConfirmCancel(false)}>
                Keep Session
              </Button>
            </div>
          </div>
        )}
      </Card>

      {(needsSlot || picking) && (
        <Card variant="feature">
          <h2 className="font-display mb-3 text-xl font-bold">
            {needsSlot ? "Pick a slot" : "Pick a new slot"}
          </h2>
          <SlotPicker
            slots={slots.data?.items ?? []}
            loading={slots.isLoading || slots.isFetching}
            slotTakenError={slotTaken}
            confirming={mutation.isPending}
            onConfirm={onConfirm}
          />
          {picking && (
            <Button variant="ghost" className="mt-2" onClick={() => setPicking(false)}>
              Never Mind
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
