"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { ProposedBadge } from "@/components/shared/Badges";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils/cn";
import { formatINR } from "@/lib/utils/currency";
import { notify } from "@/lib/utils/notify";
import type { Outcome } from "../schemas";
import { useOutcome, usePostOutcome } from "../hooks/useOutcome";
import { PlacedFormLazy } from "./lazy";
import { PlacedNotes } from "./PlacedNotes";

type Choice = "day0" | "day12" | "not-placed";

const CHOICES: { id: Choice; title: string; body: string }[] = [
  { id: "day0", title: "Placed on Day 0", body: "Offer in hand" },
  { id: "day12", title: "Placed on Day 1–2", body: "Later slot, still an offer" },
  { id: "not-placed", title: "Not placed yet", body: "Process closed without an offer" },
];

/** "Not placed yet" card (e07.png): what we promised, the credit and the lateral route. */
function NotPlaced({
  data,
  onSave,
  saving,
}: {
  data: Outcome;
  onSave?: () => void;
  saving?: boolean;
}) {
  const saved = data.state === "not-placed";
  return (
    <Card
      variant="navy"
      data-testid={saved ? "outcome-not-placed" : undefined}
      className="relative space-y-4 overflow-hidden p-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -left-10 size-72 rounded-full bg-[var(--maroon-600)]/30 blur-3xl"
      />
      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <h2 className="font-display text-3xl font-bold">Not placed yet</h2>
        <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold tracking-wider uppercase">
          What we promised
        </span>
      </div>
      <p className="relative text-lg text-white/70">
        Your fee carries forward as full credit to the next season, and we keep working with you
        off-campus at no extra cost.
      </p>
      <div className="relative flex items-center justify-between gap-3 rounded-xl border border-white/15 p-4">
        <div>
          <p className="font-bold">
            {saved && data.creditCarried ? formatINR(data.creditCarried) : "Your fee"} credit
          </p>
          <p className="text-white/70">Usable on any Season 2 plan</p>
        </div>
        <Badge tone="gold">Credit</Badge>
      </div>
      <div className="relative flex items-center justify-between gap-3 rounded-xl border border-white/15 p-4">
        <div>
          <p className="font-bold">Route Four is on</p>
          <p className="text-white/70">Quick Switch starts your daily digest tomorrow</p>
        </div>
        <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold tracking-wider uppercase">
          Lateral
        </span>
      </div>
      <div className="relative flex flex-wrap gap-3">
        <Button asChild variant="onNavy">
          <Link href={ROUTES.student.quickSwitch}>Set up Quick Switch</Link>
        </Button>
        <Button
          variant="ghost"
          className="border border-white/30 text-white hover:bg-white/10"
          onClick={() => notify("Our team will reach out. Chat is not connected in this mock.")}
        >
          Talk to us
        </Button>
        {saved ? (
          <Button
            asChild
            variant="ghost"
            className="border border-white/30 text-white hover:bg-white/10"
          >
            <Link href={ROUTES.student.billing}>See plan & billing</Link>
          </Button>
        ) : (
          <Button disabled={saving} onClick={onSave}>
            {saving ? "Saving…" : "Save my result"}
          </Button>
        )}
      </div>
      <p className="relative flex items-center gap-2 text-xs text-white/70">
        <ProposedBadge />
        Full credit for students not placed.
      </p>
    </Card>
  );
}

/** E7 report outcome, with the placed and not-placed result states (e07.png). */
export function OutcomeView() {
  const { data, isPending, isError, refetch } = useOutcome();
  const profile = useProfile();
  const post = usePostOutcome();
  const [picked, setPicked] = useState<Choice | null>(null);

  if (isPending) return <PageSkeleton />;
  if (isError || !data) return <ErrorCard onRetry={() => refetch()} />;

  const choice: Choice | null =
    data.state === "placed" ? "day0" : data.state === "not-placed" ? "not-placed" : picked;
  const pending = data.state === "pending";
  const firstName = profile.data?.name.split(" ")[0] ?? "Riya";

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <PageHeader
        eyebrow={`After Day 0 · ${data.day0Label}`}
        title={`How did it go, ${firstName}?`}
        subtitle="Tell us either way. It decides what we do next for you."
      />

      <div
        role="group"
        aria-label="Outcome"
        className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3"
      >
        {CHOICES.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={choice === c.id}
            disabled={!pending}
            onClick={() => setPicked(c.id)}
            className={cn(
              "rounded-card min-h-11 border bg-white p-5 text-left",
              choice === c.id ? "border-maroon-600 border-2" : "border-line",
              pending && "cursor-pointer",
            )}
          >
            <span className="block text-lg font-semibold">{c.title}</span>
            <span className="text-navy-400 mt-1 block">{c.body}</span>
          </button>
        ))}
      </div>

      {choice === null && (
        <p className="text-navy-400">Pick the one that fits and we will take it from there.</p>
      )}

      {(choice === "day0" || choice === "day12") && (
        <Card
          variant="feature"
          data-testid={data.state === "placed" ? "outcome-placed" : undefined}
          className="max-w-3xl space-y-5 border-2 border-[#8DC1AE] p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="font-display text-3xl font-bold">Placed. Well done.</h2>
            {data.state === "placed" && <Badge tone="green">Offer recorded</Badge>}
          </div>
          {data.state === "placed" ? (
            <>
              <dl className="space-y-2">
                <div className="flex justify-between gap-4">
                  <dt className="text-navy-400">Company</dt>
                  <dd className="font-semibold">{data.company}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-navy-400">Role</dt>
                  <dd className="font-semibold">{data.role}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-navy-400">CTC</dt>
                  <dd className="font-semibold">{data.ctc ? formatINR(data.ctc) : "—"}</dd>
                </div>
              </dl>
              <PlacedNotes />
              <Button asChild variant="secondary">
                <Link href={ROUTES.student.home}>Back to home</Link>
              </Button>
            </>
          ) : (
            <PlacedFormLazy key={choice} onDone={(v) => post.mutate({ state: "placed", ...v })} />
          )}
        </Card>
      )}

      {choice === "not-placed" && (
        <div className="max-w-3xl">
          <NotPlaced
            data={data}
            saving={post.isPending}
            onSave={() => post.mutate({ state: "not-placed" })}
          />
        </div>
      )}

      {post.isError && (
        <p role="alert" className="text-maroon-600 text-sm">
          We could not save your outcome. Please try again.
        </p>
      )}
    </div>
  );
}
