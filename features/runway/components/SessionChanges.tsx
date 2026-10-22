"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ApiError } from "@/lib/api/client";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils/cn";
import { now } from "@/lib/utils/clock";
import { daysUntil, formatDay, formatTime } from "@/lib/utils/dates";
import { notify } from "@/lib/utils/notify";
import { useBookSession, useRescheduleSession, useSessionSlots } from "../hooks/useRunway";
import type { Session, SlotDto } from "../schemas";

const chipLabel = (s: SlotDto) => s.label.replace(/ IST$/, "");
const confirmLabel = (s: SlotDto) => chipLabel(s).replace(" · ", ", ");
const lowerFirst = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);
/** "P2: external specialist panel" -> "P2"; "Domain deep-dive" -> "domain deep-dive". */
const shortName = (s: Session) =>
  s.kind === "panel" ? s.title.split(":")[0]! : lowerFirst(s.title);

function SlotChips({
  slots,
  chosen,
  onChoose,
}: {
  slots: SlotDto[];
  chosen: string | undefined;
  onChoose: (id: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Available slots" className="flex flex-wrap gap-3">
      {slots.map((s) => {
        const on = s.id === chosen;
        return (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChoose(s.id)}
            className={cn(
              "rounded-control min-h-11 cursor-pointer border px-4 font-medium",
              on ? "border-maroon-600 bg-maroon-600 text-white" : "border-line bg-white",
            )}
          >
            {chipLabel(s)}
          </button>
        );
      })}
    </div>
  );
}

/** Slots for one session, the chosen one, and a way to book or move to it. */
function useSlotChoice(id: string) {
  const slots = useSessionSlots(id);
  const [chosen, setChosen] = useState<string | null>(null);
  const items = (slots.data?.items ?? []).filter((s) => !s.taken);
  const selected = items.find((s) => s.id === chosen) ?? items[1] ?? items[0];
  return { slots, items, selected, setChosen };
}

const slotsNote = (taken: boolean) =>
  taken ? (
    <p role="alert" className="bg-maroon-100 text-maroon-600 rounded-control p-3 text-sm">
      That slot was just taken. Please pick another.
    </p>
  ) : null;

/** E6, panelist cancelled: not the student's fault, rebook free (e06.png, top card). */
function CancelledCard({ session }: { session: Session }) {
  const { slots, items, selected, setChosen } = useSlotChoice(session.id);
  const book = useBookSession(session.id);
  const taken = book.error instanceof ApiError && book.error.code === "slot_taken";
  const was = session.startsAt
    ? `${formatDay(session.startsAt)}, ${formatTime(session.startsAt)}`
    : "";
  const who = session.panelFunction
    ? `a ${session.panelFunction} specialist`
    : "a specialist in your function";
  return (
    <Card
      variant="feature"
      data-testid="session-change-cancelled"
      className="border-maroon-600 border-2 p-6"
    >
      <div className="flex gap-4">
        <span
          aria-hidden
          className="bg-maroon-100 text-maroon-600 flex size-12 shrink-0 items-center justify-center rounded-full"
        >
          <AlertCircle className="size-6" />
        </span>
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h2 className="text-xl font-semibold">
              Your {shortName(session)} panelist had to cancel {was}
            </h2>
            <Badge tone="maroonSoft">Panelist cancelled</Badge>
          </div>
          <p className="text-navy-400">
            Not on you. Rebooking is free and you keep priority. Your brief, CV and P1 feedback go
            to whoever takes the slot, also {who}.
          </p>
          {slotsNote(taken)}
          {slots.isPending ? (
            <p role="status" className="text-navy-400 text-sm">
              Loading slots…
            </p>
          ) : (
            <SlotChips slots={items} chosen={selected?.id} onChoose={setChosen} />
          )}
          <div className="flex flex-wrap gap-3">
            <Button
              disabled={!selected || book.isPending}
              onClick={() =>
                selected &&
                book
                  .mutateAsync(selected.id)
                  .then(() => notify("Session booked"))
                  .catch(() => slots.refetch())
              }
            >
              {book.isPending
                ? "Booking…"
                : selected
                  ? `Confirm ${confirmLabel(selected)}`
                  : "Confirm"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => notify("Our team will reach out. Chat is not connected in this mock.")}
            >
              Talk to us
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

/** E6, student moved it: free until 24 hours before (Proposed), so choose a new slot. */
function MoveCard({ session }: { session: Session }) {
  const { slots, items, selected, setChosen } = useSlotChoice(session.id);
  const move = useRescheduleSession(session.id);
  const taken = move.error instanceof ApiError && move.error.code === "slot_taken";
  const away = session.startsAt ? daysUntil(session.startsAt, now()) : 0;
  const free = away >= 1;
  return (
    <Card variant="feature" data-testid="session-change-moved" className="space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="text-xl font-semibold">Reschedule your {shortName(session)}</h2>
        <Badge tone="neutral">You moved it</Badge>
      </div>
      <p className="text-navy-400">
        Free up to 24 hours before. Inside 24 hours it counts as a missed session.
      </p>
      {session.startsAt && (
        <div className="bg-cream-soft rounded-card flex items-center justify-between gap-3 p-4">
          <div>
            <p className="font-semibold">
              {formatDay(session.startsAt)} · {formatTime(session.startsAt)}
            </p>
            <p className="text-navy-400">
              {away} {away === 1 ? "day" : "days"} away ·{" "}
              {free ? "free to move" : "counts as missed"}
            </p>
          </div>
          <Badge tone={free ? "green" : "maroonSoft"}>{free ? "Free" : "Late"}</Badge>
        </div>
      )}
      {slotsNote(taken)}
      {slots.isPending ? (
        <p role="status" className="text-navy-400 text-sm">
          Loading slots…
        </p>
      ) : (
        <SlotChips slots={items} chosen={selected?.id} onChoose={setChosen} />
      )}
      <Button
        variant="secondary"
        disabled={!selected || move.isPending}
        onClick={() =>
          selected &&
          move
            .mutateAsync(selected.id)
            .then(() => notify("Session moved"))
            .catch(() => slots.refetch())
        }
      >
        {move.isPending ? "Moving…" : "Move session"}
      </Button>
    </Card>
  );
}

/** E6, no-show: the first miss is free, then it counts as used (Proposed). */
function MissedCard({ session }: { session: Session }) {
  const when = session.startsAt
    ? `${formatDay(session.startsAt)}, ${formatTime(session.startsAt)}. `
    : "";
  return (
    <Card variant="feature" data-testid="session-change-missed" className="flex flex-col gap-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="text-xl font-semibold">You missed your {shortName(session)}</h2>
        <Badge tone="maroonSoft">No-show</Badge>
      </div>
      <p className="text-navy-400">
        {when}The practitioner waited 15 minutes. First miss is on us: rebook once at no cost. After
        that, a missed session counts as used.
      </p>
      <p className="bg-maroon-100 text-maroon-600 rounded-card p-4">
        <strong>Something went wrong on our side?</strong> Tell us. A dropped call or a broken link
        is never counted against you.
      </p>
      <div className="mt-auto flex flex-wrap gap-3 pt-2">
        <Button asChild>
          <Link href={ROUTES.student.session(session.id)}>Rebook free</Link>
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            notify("Thanks, we will look into it. Reporting is not connected in this mock.")
          }
        >
          Report a problem
        </Button>
      </div>
    </Card>
  );
}

/** The cards above the runway when a session was cancelled, moved or missed (e06.png). */
export function SessionChanges({ items }: { items: Session[] }) {
  const cancelled = items.find((s) => s.status === "cancelled");
  const moved = items.find((s) => s.status === "rescheduled");
  const missed = items.find((s) => s.status === "no-show");
  if (!cancelled && !moved && !missed) return null;
  return (
    <section aria-label="Session changes" className="space-y-6">
      {cancelled && <CancelledCard session={cancelled} />}
      {(moved || missed) && (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-2">
          {moved && <MoveCard session={moved} />}
          {missed && <MissedCard session={missed} />}
        </div>
      )}
    </section>
  );
}
